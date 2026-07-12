import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { companiesRoutes } from "../modules/companies/companies.routes";
import { mediaRoutes } from "../modules/media/media.routes";
import { postsRoutes } from "../modules/posts/posts.routes";

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
apiRoutes.use("/companies", companiesRoutes);
apiRoutes.use("/media", mediaRoutes);
apiRoutes.use("/posts", postsRoutes);
