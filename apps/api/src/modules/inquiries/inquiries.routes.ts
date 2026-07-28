import { Router } from "express";
import { PERMISSIONS } from "../../common/constants/permissions";
import { authenticate } from "../../common/middlewares/auth.middleware";
import { asyncHandler } from "../../common/middlewares/async-handler";
import { requirePermission } from "../../common/middlewares/permission.middleware";
import { validateRequest } from "../../common/middlewares/validate-request";
import { createInquiryController, deleteInquiryController, listInquiriesController, updateInquiryController } from "./inquiries.controller";
import { createInquirySchema, inquiryParamsSchema, listInquiriesSchema, updateInquirySchema } from "./inquiries.schemas";

export const inquiriesRoutes = Router();

inquiriesRoutes.post("/", validateRequest(createInquirySchema), asyncHandler(createInquiryController));
inquiriesRoutes.use(authenticate);
inquiriesRoutes.get("/", requirePermission(PERMISSIONS.INQUIRIES_READ), validateRequest(listInquiriesSchema), asyncHandler(listInquiriesController));
inquiriesRoutes.patch("/:inquiryId", requirePermission(PERMISSIONS.INQUIRIES_UPDATE), validateRequest(updateInquirySchema), asyncHandler(updateInquiryController));
inquiriesRoutes.delete("/:inquiryId", requirePermission(PERMISSIONS.INQUIRIES_DELETE), validateRequest(inquiryParamsSchema), asyncHandler(deleteInquiryController));
