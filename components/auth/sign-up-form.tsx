"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { signUpAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

/**
 * Client form for /sign-up. On success, shows a "check your email"
 * confirmation rather than auto-signing-in (Supabase requires email
 * verification before the session is active).
 */
export function SignUpForm() {
  const t = useTranslations("auth");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  if (success) {
    return (
      <div role="status" className="bg-muted text-muted-foreground rounded-md p-4 text-sm">
        {t("checkEmail")}
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await signUpAction(formData);
          if (result.ok) setSuccess(true);
          else setError(result.error);
        });
      }}
      className="flex flex-col gap-4"
    >
      <Field id="full_name" label={t("fullName")} type="text" autoComplete="name" required />
      <Field id="email" label={t("email")} type="email" autoComplete="email" required />
      <Field
        id="password"
        label={t("password")}
        type="password"
        autoComplete="new-password"
        required
        hint={t("passwordHint")}
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
        {pending ? t("creatingAccount") : t("createAccount")}
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
  hint,
}: {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
  required?: boolean;
  hint?: string;
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
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="border-input bg-background focus-visible:ring-ring h-10 rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      />
      {hint ? (
        <span id={`${id}-hint`} className="text-muted-foreground text-xs">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
