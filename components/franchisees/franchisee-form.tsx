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
  createFranchiseeAction,
  updateFranchiseeAction,
  archiveFranchiseeAction,
} from "@/lib/franchisees/actions";
import type { RenewalStatus } from "@/lib/franchisees/schemas";

type Franchisor = { id: string; name: string };
type FranchiseeValues = {
  id?: string;
  franchisor_id?: string;
  legal_name?: string;
  business_entity_name?: string | null;
  contact_number?: string | null;
  email?: string | null;
  territory?: string | null;
  contract_start_date?: string | null;
  contract_end_date?: string | null;
  renewal_status?: RenewalStatus;
  notes?: string | null;
};

const RENEWAL_STATUSES: RenewalStatus[] = [
  "current",
  "expiring_soon",
  "expired",
  "in_renewal",
  "terminated",
];

export function FranchiseeForm({
  mode,
  franchisors,
  initial,
}: {
  mode: "create" | "edit";
  franchisors: Franchisor[];
  initial?: FranchiseeValues;
}) {
  const t = useTranslations("franchisees");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const action = mode === "create" ? createFranchiseeAction : updateFranchiseeAction;
          const result = await action(formData);
          if (!result.ok) setError(result.error);
          else router.push(`/franchisees/${result.id}`);
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
          <Label htmlFor="renewal_status">{t("renewalStatus")}</Label>
          <Select
            id="renewal_status"
            name="renewal_status"
            defaultValue={initial?.renewal_status ?? "current"}
          >
            {RENEWAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`renewalValue.${s}`)}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="legal_name">{t("legalName")}</Label>
          <Input
            id="legal_name"
            name="legal_name"
            defaultValue={initial?.legal_name ?? ""}
            required
            maxLength={160}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="business_entity_name">{t("businessEntityName")}</Label>
          <Input
            id="business_entity_name"
            name="business_entity_name"
            defaultValue={initial?.business_entity_name ?? ""}
            maxLength={160}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contact_number">{t("contactNumber")}</Label>
          <Input
            id="contact_number"
            name="contact_number"
            defaultValue={initial?.contact_number ?? ""}
            maxLength={40}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" defaultValue={initial?.email ?? ""} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="territory">{t("territory")}</Label>
          <Input
            id="territory"
            name="territory"
            defaultValue={initial?.territory ?? ""}
            maxLength={120}
          />
        </div>

        <div className="space-y-1.5" />

        <div className="space-y-1.5">
          <Label htmlFor="contract_start_date">{t("contractStart")}</Label>
          <Input
            id="contract_start_date"
            name="contract_start_date"
            type="date"
            defaultValue={initial?.contract_start_date ?? ""}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contract_end_date">{t("contractEnd")}</Label>
          <Input
            id="contract_end_date"
            name="contract_end_date"
            type="date"
            defaultValue={initial?.contract_end_date ?? ""}
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
              await archiveFranchiseeAction(initial.id!);
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
