"use client";

import { useActionState } from "react";
import Image from "next/image";
import { saveNews } from "@/lib/actions";
import TranslationTabs from "./TranslationTabs";
import SubmitButton from "./SubmitButton";
import { Input, Textarea } from "./Field";

type NewsData = {
  id: string;
  status: string;
  imageUrl: string | null;
  translations: { locale: string; title: string; summary: string | null; body: string }[];
};

export default function NewsForm({ news }: { news?: NewsData }) {
  const [state, action] = useActionState(saveNews, undefined);
  const tr = (locale: string) => news?.translations.find((t) => t.locale === locale);

  return (
    <form action={action} className="space-y-6">
      {news && <input type="hidden" name="id" value={news.id} />}

      <TranslationTabs
        render={(locale) => (
          <div className="space-y-4">
            <Input label={`Title (${locale})`} name={`${locale}_title`} defaultValue={tr(locale)?.title ?? ""} />
            <Textarea label={`Summary (${locale})`} name={`${locale}_summary`} rows={2} defaultValue={tr(locale)?.summary ?? ""} />
            <Textarea
              label={`Body (${locale}) — separate paragraphs with a blank line`}
              name={`${locale}_body`}
              rows={10}
              defaultValue={tr(locale)?.body ?? ""}
            />
          </div>
        )}
      />

      <div className="card bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Settings</h2>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="publish" defaultChecked={news?.status === "published"} className="h-4 w-4 accent-[#2003bd]" />
            <span className="text-sm font-semibold">Published</span>
          </label>
          <div className="flex items-center gap-4">
            <div>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Cover image</span>
              <input name="image" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
              <p className="mt-1 text-xs text-ink-soft">16:9 recommended, up to 5MB.</p>
            </div>
            {news?.imageUrl && (
              <Image src={news.imageUrl} alt="" width={96} height={54} className="rounded-card border border-line object-cover" />
            )}
          </div>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-card border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">{state.error}</p>
      )}

      <SubmitButton>{news ? "Save changes" : "Create article"}</SubmitButton>
    </form>
  );
}
