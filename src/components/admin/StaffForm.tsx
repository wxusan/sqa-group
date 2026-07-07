"use client";

import { useActionState } from "react";
import Image from "next/image";
import { saveStaff } from "@/lib/actions";
import TranslationTabs from "./TranslationTabs";
import SubmitButton from "./SubmitButton";
import { Input, Textarea, Select } from "./Field";

type StaffData = {
  id: string;
  department: string;
  order: number;
  published: boolean;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  translations: { locale: string; name: string; position: string; intro: string | null; bio: string | null; expertise: string | null }[];
};

export default function StaffForm({ staff }: { staff?: StaffData }) {
  const [state, action] = useActionState(saveStaff, undefined);
  const tr = (locale: string) => staff?.translations.find((t) => t.locale === locale);

  return (
    <form action={action} className="space-y-6">
      {staff && <input type="hidden" name="id" value={staff.id} />}

      <TranslationTabs
        render={(locale) => (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label={`Name (${locale})`} name={`${locale}_name`} defaultValue={tr(locale)?.name ?? ""} />
              <Input label={`Position (${locale})`} name={`${locale}_position`} defaultValue={tr(locale)?.position ?? ""} />
            </div>
            <Textarea label={`Short intro (${locale})`} name={`${locale}_intro`} rows={2} defaultValue={tr(locale)?.intro ?? ""} />
            <Textarea label={`Biography (${locale})`} name={`${locale}_bio`} rows={5} defaultValue={tr(locale)?.bio ?? ""} />
            <Input label={`Expertise, comma-separated (${locale})`} name={`${locale}_expertise`} defaultValue={tr(locale)?.expertise ?? ""} />
          </div>
        )}
      />

      <div className="card bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select label="Department" name="department" defaultValue={staff?.department ?? "certification"}>
            <option value="certification">Certification body</option>
            <option value="laboratory">Testing laboratory</option>
            <option value="management">Management</option>
          </Select>
          <Input label="Sort order" name="order" type="number" defaultValue={staff?.order ?? 0} />
          <label className="flex items-end gap-2 pb-2">
            <input type="checkbox" name="published" defaultChecked={staff?.published ?? false} className="h-4 w-4 accent-[#2003bd]" />
            <span className="text-sm font-semibold">Published</span>
          </label>
          <Input label="Email (optional)" name="email" type="email" defaultValue={staff?.email ?? ""} />
          <Input label="Phone (optional)" name="phone" defaultValue={staff?.phone ?? ""} />
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Photo</span>
            <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" />
            <p className="mt-1 text-xs text-ink-soft">JPG / PNG / WEBP, up to 5MB. Portrait 4:5 looks best.</p>
          </div>
          {staff?.photoUrl && (
            <Image src={staff.photoUrl} alt="" width={56} height={70} className="rounded-card border border-line object-cover object-top" />
          )}
        </div>
      </div>

      {state?.error && (
        <p className="rounded-card border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">{state.error}</p>
      )}

      <SubmitButton>{staff ? "Save changes" : "Create staff member"}</SubmitButton>
    </form>
  );
}
