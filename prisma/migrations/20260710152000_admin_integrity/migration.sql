-- Query paths used by public ISR pages and the admin inbox.
CREATE INDEX "Staff_published_department_order_idx" ON "Staff"("published", "department", "order");
CREATE INDEX "News_status_publishedAt_idx" ON "News"("status", "publishedAt");
CREATE INDEX "Partner_published_order_idx" ON "Partner"("published", "order");
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");

-- Prisma models use strings for these fields. These checks protect the data
-- even when it is changed outside the application.
ALTER TABLE "Staff"
  ADD CONSTRAINT "Staff_department_check"
  CHECK ("department" IN ('certification', 'laboratory', 'management'));

ALTER TABLE "Staff"
  ADD CONSTRAINT "Staff_order_nonnegative_check"
  CHECK ("order" >= 0);

ALTER TABLE "News"
  ADD CONSTRAINT "News_status_check"
  CHECK ("status" IN ('draft', 'published'));

ALTER TABLE "News"
  ADD CONSTRAINT "News_published_requires_date_check"
  CHECK ("status" <> 'published' OR "publishedAt" IS NOT NULL);

ALTER TABLE "Partner"
  ADD CONSTRAINT "Partner_order_nonnegative_check"
  CHECK ("order" >= 0);

ALTER TABLE "StaffTranslation"
  ADD CONSTRAINT "StaffTranslation_locale_check"
  CHECK ("locale" IN ('uz', 'ru', 'en'));

ALTER TABLE "NewsTranslation"
  ADD CONSTRAINT "NewsTranslation_locale_check"
  CHECK ("locale" IN ('uz', 'ru', 'en'));

ALTER TABLE "PartnerTranslation"
  ADD CONSTRAINT "PartnerTranslation_locale_check"
  CHECK ("locale" IN ('uz', 'ru', 'en'));

ALTER TABLE "Lead"
  ADD CONSTRAINT "Lead_serviceType_check"
  CHECK ("serviceType" IN ('certification', 'testing', 'surveillance', 'other'));

ALTER TABLE "Lead"
  ADD CONSTRAINT "Lead_status_check"
  CHECK ("status" IN ('new', 'processed'));

ALTER TABLE "Lead"
  ADD CONSTRAINT "Lead_locale_check"
  CHECK ("locale" IN ('uz', 'ru', 'en'));
