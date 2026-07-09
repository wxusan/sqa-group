"use client";

import { useActionState } from "react";
import Image from "next/image";
import { saveNews } from "@/lib/actions";
import TranslationTabs from "./TranslationTabs";
import SubmitButton from "./SubmitButton";
import { Input, Textarea } from "./Field";
import { adminMessages, type AdminLocale } from "@/i18n/admin";
import FileUploadButton from "./FileUploadButton";

type NewsData = {
  id: string;
  status: string;
  imageUrl: string | null;
  translations: { locale: string; title: string; summary: string | null; body: string }[];
};

export default function NewsForm({ news, locale }: { news?: NewsData; locale: AdminLocale }) {
  const [state, action] = useActionState(saveNews, undefined);
  const tr = (locale: string) => news?.translations.find((t) => t.locale === locale);
  const t = adminMessages[locale];

  return (
    <form action={action} className="space-y-6">
      {news && <input type="hidden" name="id" value={news.id} />}
      <input type="hidden" name="adminLang" value={locale} />

      <TranslationTabs
        render={(locale) => (
          <div className="space-y-4">
            <Input label={`${t.news.formTitle} (${locale})`} name={`${locale}_title`} defaultValue={tr(locale)?.title ?? ""} />
            <Textarea label={`${t.news.summary} (${locale})`} name={`${locale}_summary`} rows={2} defaultValue={tr(locale)?.summary ?? ""} />
            <Textarea
              label={`${t.news.body} (${locale})`}
              name={`${locale}_body`}
              rows={10}
              defaultValue={tr(locale)?.body ?? ""}
            />
          </div>
        )}
      />

      <div className="card bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">{t.common.settings}</h2>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="publish" defaultChecked={news ? news.status === "published" : true} className="h-4 w-4 accent-[#2003bd]" />
            <span className="text-sm font-semibold">{t.common.showOnSite}</span>
          </label>
          <div className="flex items-center gap-4">
            <FileUploadButton
              name="image"
              accept="image/jpeg,image/png,image/webp"
              label={t.news.coverImage}
              hint={t.news.imageHint}
              buttonLabel={t.common.chooseFile}
              noFileLabel={t.common.noFileSelected}
            />
            {news?.imageUrl && (
              <Image src={news.imageUrl} alt="" width={96} height={54} className="rounded-card border border-line object-cover" />
            )}
          </div>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-card border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">{state.error}</p>
      )}

      <SubmitButton pendingLabel={t.common.saving}>{news ? t.news.save : t.news.create}</SubmitButton>
    </form>
  );
}
