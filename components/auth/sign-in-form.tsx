"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { signInAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

/**
 * Client form for /sign-in. Calls the Server Action signInAction directly.
 * Validation runs on both sides — the server is the authority.
 */
export function SignInForm() {
  const t = useTranslations("auth");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await signInAction(formData);
          if (!result.ok) setError(result.error);
        });
      }}
      className="flex flex-col gap-4"
    >
      <Field id="email" label={t("email")} type="email" autoComplete="email" required />
      <Field
        id="password"
        label={t("password")}
        type="password"
        autoComplete="current-password"
        required
      />

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60",
        )}
      >
        {pending ? t("signingIn") : t("signIn")}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  type,
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
  required?: boolean;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="border-input bg-background focus-visible:ring-ring h-10 rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      />
    </label>
  );
}
