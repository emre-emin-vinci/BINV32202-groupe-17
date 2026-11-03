import type { Application, ApplicationDbo, ApplicationDto } from "../models/application.ts";

export const toApplication = (dbo: ApplicationDbo): Application => ({
  id: dbo.id,
  offerId: dbo.offer_id,
  offerTitle: dbo.offer_title,
  companyShortName: dbo.company_short_name,
  academicYear: dbo.academic_year_label,
  period: dbo.period_code,
  message: dbo.message,
  status: dbo.status,
  appliedAt: dbo.applied_at,
});

export const toApplicationDto = (application: Application): ApplicationDto => application;
