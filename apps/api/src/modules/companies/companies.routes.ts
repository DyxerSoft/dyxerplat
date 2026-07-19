import { Router } from "express";
import { PERMISSIONS } from "../../common/constants/permissions";
import { authenticate } from "../../common/middlewares/auth.middleware";
import { asyncHandler } from "../../common/middlewares/async-handler";
import { requirePermission } from "../../common/middlewares/permission.middleware";
import { validateRequest } from "../../common/middlewares/validate-request";
import {
  createCompanyController,
  createCompanyContactController,
  deleteCompanyController,
  deleteCompanyContactController,
  listCompaniesController,
  listCompanyContactsController,
  updateCompanyController,
  updateCompanyContactController
} from "./companies.controller";
import {
  companyParamsSchema,
  contactParamsSchema,
  createCompanySchema,
  createContactSchema,
  listCompaniesSchema,
  listContactsSchema,
  updateCompanySchema,
  updateContactSchema
} from "./companies.schemas";

export const companiesRoutes = Router();

companiesRoutes.use(authenticate);

companiesRoutes.get(
  "/",
  requirePermission(PERMISSIONS.COMPANIES_READ),
  validateRequest(listCompaniesSchema),
  asyncHandler(listCompaniesController)
);

companiesRoutes.post(
  "/",
  requirePermission(PERMISSIONS.COMPANIES_CREATE),
  validateRequest(createCompanySchema),
  asyncHandler(createCompanyController)
);

companiesRoutes.put(
  "/:companyId",
  requirePermission(PERMISSIONS.COMPANIES_UPDATE),
  validateRequest(updateCompanySchema),
  asyncHandler(updateCompanyController)
);

companiesRoutes.delete(
  "/:companyId",
  requirePermission(PERMISSIONS.COMPANIES_DELETE),
  validateRequest(companyParamsSchema),
  asyncHandler(deleteCompanyController)
);

companiesRoutes.get(
  "/:companyId/contacts",
  requirePermission(PERMISSIONS.CONTACTS_READ),
  validateRequest(listContactsSchema),
  asyncHandler(listCompanyContactsController)
);

companiesRoutes.post(
  "/:companyId/contacts",
  requirePermission(PERMISSIONS.CONTACTS_CREATE),
  validateRequest(createContactSchema),
  asyncHandler(createCompanyContactController)
);

companiesRoutes.put(
  "/:companyId/contacts/:contactId",
  requirePermission(PERMISSIONS.CONTACTS_UPDATE),
  validateRequest(updateContactSchema),
  asyncHandler(updateCompanyContactController)
);

companiesRoutes.delete(
  "/:companyId/contacts/:contactId",
  requirePermission(PERMISSIONS.CONTACTS_DELETE),
  validateRequest(contactParamsSchema),
  asyncHandler(deleteCompanyContactController)
);
