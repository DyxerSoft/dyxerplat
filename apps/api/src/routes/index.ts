import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { companiesRoutes } from "../modules/companies/companies.routes";
import { mediaRoutes } from "../modules/media/media.routes";
import { postsRoutes } from "../modules/posts/posts.routes";
import { rolesRoutes } from "../modules/roles/roles.routes";
import { usersRoutes } from "../modules/users/users.routes";
import { inquiriesRoutes } from "../modules/inquiries/inquiries.routes";

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
apiRoutes.use("/inquiries", inquiriesRoutes);
apiRoutes.use("/media", mediaRoutes);
apiRoutes.use("/posts", postsRoutes);
apiRoutes.use("/roles", rolesRoutes);
apiRoutes.use("/users", usersRoutes);
