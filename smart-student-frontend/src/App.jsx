import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:5000";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [apiError, setApiError] = useState("");

  // NEW: dashboard fetch failures (shown in UI + Retry); separate from login errors
  const [dashboardError, setDashboardError] = useState("");
  // NEW: false until we've checked localStorage / finished restore — avoids login flash
  const [authInitialized, setAuthInitialized] = useState(false);

  // Stable helper for dashboard GET (used by login, restore, and Retry)
  const fetchDashboard = useCallback(async (token) => {
    console.log("[dashboard] requesting /api/dashboard");
    const response = await fetch(`${API_BASE}/api/dashboard`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("[dashboard] response status:", response.status, data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to load dashboard");
    }

    return data;
  }, []);

  // Restore session from localStorage on refresh
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      setAuthInitialized(true);
      return;
    }

    (async () => {
      try {
        const data = await fetchDashboard(savedToken);
        setDashboard(data);
        setIsLoggedIn(true);
        setDashboardError("");
      } catch (err) {
        console.error("[dashboard] restore failed:", err);
        // CHANGED: keep token so user can Retry; surface error in UI instead of clearing session
        setIsLoggedIn(true);
        setDashboard(null);
        setDashboardError(err.message || "Could not load dashboard");
      } finally {
        setAuthInitialized(true);
      }
    })();
  }, [fetchDashboard]);

  // NEW: clear session and return to login
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setDashboard(null);
    setDashboardError("");
    setApiError("");
    console.log("[auth] logged out, token removed");
  };

  // NEW: re-fetch dashboard using stored JWT (after a failed load)
  const handleRetryDashboard = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      handleLogout();
      return;
    }
    setDashboardError("");
    try {
      const data = await fetchDashboard(token);
      setDashboard(data);
      console.log("[dashboard] retry succeeded");
    } catch (err) {
      console.error("[dashboard] retry failed:", err);
      setDashboardError(err.message || "Could not load dashboard");
    }
  };

  const handleLogin = async () => {
    setApiError("");
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("[login] response status:", response.status, data);

      if (!response.ok) {
        setApiError(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      console.log("[login] token saved to localStorage");

      try {
        const dashboardData = await fetchDashboard(data.token);
        setDashboard(dashboardData);
        setIsLoggedIn(true);
        setDashboardError("");
      } catch (dashErr) {
        console.error("[dashboard] after login:", dashErr);
        // CHANGED: stay logged in, show error + Retry in dashboard shell (no alert)
        setIsLoggedIn(true);
        setDashboard(null);
        setDashboardError(dashErr.message || "Could not load dashboard");
      }
    } catch (error) {
      console.error("[login] network/server error:", error);
      setApiError("Server error");
    }
  };

  // Wait until we know whether a saved session exists
  if (!authInitialized) {
    return (
      <>
        <style>{appStyles}</style>
        <div className="app-loading">Loading session…</div>
      </>
    );
  }

  // Logged in: show dashboard data, or error + Retry + Logout
  if (isLoggedIn) {
    return (
      <>
        <style>{appStyles}</style>
        <div className="dashboard-page">
          <header className="dashboard-header">
            {/* NEW: logout — top right while authenticated */}
            <button type="button" className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
            <h1 className="dashboard-title">Smart Student AI</h1>
            <p className="dashboard-subtitle">Dashboard</p>
          </header>

          <main className="dashboard-main">
            {/* CHANGED: dashboard API failure — message + Retry (not only alert) */}
            {dashboardError && !dashboard ? (
              <div className="dashboard-card dashboard-card--error">
                <h3>Could not load dashboard</h3>
                <p className="error-text">{dashboardError}</p>
                <button type="button" className="btn-retry" onClick={handleRetryDashboard}>
                  Retry
                </button>
              </div>
            ) : null}

            {dashboard ? (
              <>
                <div className="dashboard-card">
                  <h3>Attendance</h3>
                  <ul className="dashboard-list">
                    <li>
                      <span>Total classes</span>
                      <strong>{dashboard.attendance.totalClasses}</strong>
                    </li>
                    <li>
                      <span>Present</span>
                      <strong>{dashboard.attendance.present}</strong>
                    </li>
                    <li>
                      <span>Attendance %</span>
                      <strong>{dashboard.attendance.percentage}</strong>
                    </li>
                  </ul>
                </div>

                <div className="dashboard-card">
                  <h3>Results</h3>
                  <ul className="dashboard-list">
                    <li>
                      <span>Average marks</span>
                      <strong>{dashboard.results.averageMarks}</strong>
                    </li>
                    <li>
                      <span>Total subjects</span>
                      <strong>{dashboard.results.totalSubjects}</strong>
                    </li>
                  </ul>
                </div>
              </>
            ) : null}
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{appStyles}</style>
      <div className="login-page">
        <h1>Smart Student AI</h1>

        {apiError ? <p className="error-text login-error">{apiError}</p> : null}

        <div className="login-fields">
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="button" className="btn-login" onClick={handleLogin}>
          Login
        </button>
      </div>
    </>
  );
}

// NEW: simple layout + card styles (no external libraries)
const appStyles = `
  .app-loading {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: system-ui, sans-serif;
    color: #64748b;
  }
  .login-page {
    text-align: center;
    margin-top: 100px;
    font-family: system-ui, sans-serif;
    max-width: 360px;
    margin-left: auto;
    margin-right: auto;
    padding: 0 1rem;
  }
  .login-fields {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 1.5rem 0;
  }
  .login-fields input {
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 1rem;
  }
  .btn-login {
    padding: 10px 24px;
    border-radius: 8px;
    border: none;
    background: #2563eb;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-login:hover {
    background: #1d4ed8;
  }
  .dashboard-page {
    min-height: 100vh;
    background: #f1f5f9;
    font-family: system-ui, sans-serif;
    padding-bottom: 2rem;
  }
  .dashboard-header {
    position: relative;
    text-align: center;
    padding: 1.25rem 5rem 0.5rem;
  }
  .btn-logout {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 8px 14px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    background: #fff;
    cursor: pointer;
    font-size: 0.9rem;
  }
  .btn-logout:hover {
    background: #f8fafc;
  }
  .dashboard-title {
    margin: 0;
    font-size: 1.5rem;
  }
  .dashboard-subtitle {
    margin: 0.35rem 0 0;
    color: #64748b;
    font-size: 1rem;
  }
  .dashboard-main {
    max-width: 520px;
    margin: 0 auto;
    padding: 1.25rem 1rem 0;
  }
  .dashboard-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  }
  .dashboard-card h3 {
    margin: 0 0 1rem;
    font-size: 1.05rem;
    color: #0f172a;
  }
  .dashboard-card--error h3 {
    margin-bottom: 0.5rem;
  }
  .dashboard-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .dashboard-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f1f5f9;
    gap: 1rem;
  }
  .dashboard-list li:last-child {
    border-bottom: none;
  }
  .dashboard-list span {
    color: #64748b;
  }
  .error-text {
    color: #b91c1c;
    margin: 0 0 1rem;
  }
  .login-error {
    margin-bottom: 1rem;
  }
  .btn-retry {
    padding: 8px 18px;
    border-radius: 8px;
    border: none;
    background: #2563eb;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-retry:hover {
    background: #1d4ed8;
  }
`;

export default App;
