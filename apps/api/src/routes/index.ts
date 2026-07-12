import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";

export const apiRoutes = Router();

apiRoutes.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API Dyxerplat operativa.",
    data: {
      status: "ok"
    }
  });
});

apiRoutes.use("/auth", authRoutes);
