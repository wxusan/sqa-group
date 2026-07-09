"use client";

import { useActionState } from "react";
import Image from "next/image";
import { savePartner } from "@/lib/actions";
import TranslationTabs from "./TranslationTabs";
import SubmitButton from "./SubmitButton";
import { Input } from "./Field";
import { adminMessages, type AdminLocale } from "@/i18n/admin";
import FileUploadButton from "./FileUploadButton";

type PartnerData = {
  id: string;
  logoUrl: string;
  websiteUrl: string | null;
  order: number;
  published: boolean;
  translations: { locale: string; name: string }[];
};

export default function PartnerForm({ partner, locale }: { partner?: PartnerData; locale: AdminLocale }) {
  const [state, action] = useActionState(savePartner, undefined);
  const tr = (locale: string) => partner?.translations.find((t) => t.locale === locale);
  const t = adminMessages[locale];

  return (
    <form action={action} className="space-y-6">
      {partner && <input type="hidden" name="id" value={partner.id} />}
      <input type="hidden" name="adminLang" value={locale} />

      <TranslationTabs
        render={(locale) => (
          <Input label={`${t.partners.name} (${locale})`} name={`${locale}_name`} defaultValue={tr(locale)?.name ?? ""} />
        )}
      />

      <div className="card bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">{t.common.settings}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input label={t.partners.websiteUrl} name="websiteUrl" type="url" placeholder="https://..." defaultValue={partner?.websiteUrl ?? ""} />
          <Input label={t.partners.sortOrder} name="order" type="number" defaultValue={partner?.order ?? 0} />
        </div>
        <div className="mt-4 flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="published" defaultChecked={partner?.published ?? true} className="h-4 w-4 accent-[#2003bd]" />
            <span className="text-sm font-semibold">{t.common.showOnSite}</span>
          </label>
          <div className="flex items-center gap-4">
            <FileUploadButton
              name="logo"
              accept="image/jpeg,image/png,image/webp"
              label={`${t.partners.logo} ${partner ? t.partners.replace : ""}`}
              hint={t.partners.logoHint}
              buttonLabel={t.common.chooseFile}
              noFileLabel={t.common.noFileSelected}
            />
            {partner?.logoUrl && (
              <Image src={partner.logoUrl} alt="" width={100} height={48} className="max-h-12 w-auto rounded-card border border-line object-contain p-1" />
            )}
          </div>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-card border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">{state.error}</p>
      )}

      <SubmitButton pendingLabel={t.common.saving}>{partner ? t.partners.save : t.partners.create}</SubmitButton>
    </form>
  );
}
