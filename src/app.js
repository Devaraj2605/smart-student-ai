import cors from "cors";
import express from "express";

import { rootRouter } from "./routes/rootRoutes.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/", rootRouter);
