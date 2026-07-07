"use client";

import { useActionState } from "react";
import Image from "next/image";
import { savePartner } from "@/lib/actions";
import TranslationTabs from "./TranslationTabs";
import SubmitButton from "./SubmitButton";
import { Input } from "./Field";

type PartnerData = {
  id: string;
  logoUrl: string;
  websiteUrl: string | null;
  order: number;
  published: boolean;
  translations: { locale: string; name: string }[];
};

export default function PartnerForm({ partner }: { partner?: PartnerData }) {
  const [state, action] = useActionState(savePartner, undefined);
  const tr = (locale: string) => partner?.translations.find((t) => t.locale === locale);

  return (
    <form action={action} className="space-y-6">
      {partner && <input type="hidden" name="id" value={partner.id} />}

      <TranslationTabs
        render={(locale) => (
          <Input label={`Partner name (${locale})`} name={`${locale}_name`} defaultValue={tr(locale)?.name ?? ""} />
        )}
      />

      <div className="card bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input label="Website URL (optional)" name="websiteUrl" type="url" placeholder="https://..." defaultValue={partner?.websiteUrl ?? ""} />
          <Input label="Sort order" name="order" type="number" defaultValue={partner?.order ?? 0} />
        </div>
        <div className="mt-4 flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="published" defaultChecked={partner?.published ?? false} className="h-4 w-4 accent-[#2003bd]" />
            <span className="text-sm font-semibold">Published</span>
          </label>
          <div className="flex items-center gap-4">
            <div>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Logo {partner ? "(replace)" : ""}</span>
              <input name="logo" type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" className="text-sm" />
              <p className="mt-1 text-xs text-ink-soft">PNG / SVG with transparency preferred, up to 5MB.</p>
            </div>
            {partner?.logoUrl && (
              <Image src={partner.logoUrl} alt="" width={100} height={48} className="max-h-12 w-auto rounded-card border border-line object-contain p-1" />
            )}
          </div>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-card border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">{state.error}</p>
      )}

      <SubmitButton>{partner ? "Save changes" : "Create partner"}</SubmitButton>
    </form>
  );
}
