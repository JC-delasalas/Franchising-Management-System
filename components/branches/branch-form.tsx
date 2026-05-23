"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createBranchAction,
  updateBranchAction,
  archiveBranchAction,
} from "@/lib/branches/actions";
import type { BranchStatus } from "@/lib/branches/schemas";

type Franchisor = { id: string; name: string };
type BranchValues = {
  id?: string;
  franchisor_id?: string;
  name?: string;
  code?: string;
  address?: string | null;
  region?: string | null;
  province?: string | null;
  city?: string | null;
  opening_date?: string | null;
  status?: BranchStatus;
  contact_person?: string | null;
  contact_phone?: string | null;
  notes?: string | null;
};

const STATUSES: BranchStatus[] = ["pending_opening", "active", "inactive", "closed"];

export function BranchForm({
  mode,
  franchisors,
  initial,
}: {
  mode: "create" | "edit";
  franchisors: Franchisor[];
  initial?: BranchValues;
}) {
  const t = useTranslations("branches");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const action = mode === "create" ? createBranchAction : updateBranchAction;
          const result = await action(formData);
          if (!result.ok) setError(result.error);
          else router.push(`/branches/${result.id}`);
        });
      }}
      className="space-y-6"
    >
      {mode === "edit" && initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="franchisor_id">{t("franchisor")}</Label>
          <Select
            id="franchisor_id"
            name="franchisor_id"
            defaultValue={initial?.franchisor_id ?? ""}
            disabled={mode === "edit"}
            required
          >
            <option value="" disabled>
              {t("selectFranchisor")}
            </option>
            {franchisors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="status">{t("status")}</Label>
          <Select id="status" name="status" defaultValue={initial?.status ?? "pending_opening"}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`statusValue.${s}`)}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            id="name"
            name="name"
            defaultValue={initial?.name ?? ""}
            required
            maxLength={120}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="code">{t("code")}</Label>
          <Input
            id="code"
            name="code"
            defaultValue={initial?.code ?? ""}
            required
            maxLength={20}
            placeholder="e.g. MNL-001"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="opening_date">{t("openingDate")}</Label>
          <Input
            id="opening_date"
            name="opening_date"
            type="date"
            defaultValue={initial?.opening_date ?? ""}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="address">{t("address")}</Label>
          <Input
            id="address"
            name="address"
            defaultValue={initial?.address ?? ""}
            maxLength={300}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city">{t("city")}</Label>
          <Input id="city" name="city" defaultValue={initial?.city ?? ""} maxLength={80} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="province">{t("province")}</Label>
          <Input
            id="province"
            name="province"
            defaultValue={initial?.province ?? ""}
            maxLength={80}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="region">{t("region")}</Label>
          <Input id="region" name="region" defaultValue={initial?.region ?? ""} maxLength={80} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact_person">{t("contactPerson")}</Label>
          <Input
            id="contact_person"
            name="contact_person"
            defaultValue={initial?.contact_person ?? ""}
            maxLength={120}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact_phone">{t("contactPhone")}</Label>
          <Input
            id="contact_phone"
            name="contact_phone"
            defaultValue={initial?.contact_phone ?? ""}
            maxLength={40}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="notes">{t("notes")}</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={initial?.notes ?? ""}
            maxLength={2000}
            rows={3}
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        {mode === "edit" && initial?.id ? (
          <form
            action={async () => {
              if (!confirm(t("confirmArchive"))) return;
              await archiveBranchAction(initial.id!);
            }}
          >
            <Button type="submit" variant="outline">
              {t("archive")}
            </Button>
          </form>
        ) : (
          <span />
        )}

        <Button type="submit" disabled={pending}>
          {pending
            ? mode === "create"
              ? t("creating")
              : t("saving")
            : mode === "create"
              ? t("create")
              : t("save")}
        </Button>
      </div>
    </form>
  );
}
