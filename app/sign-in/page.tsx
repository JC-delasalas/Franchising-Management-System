import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SignInForm } from "@/components/auth/sign-in-form";

export default async function SignInPage() {
  const t = await getTranslations("auth");

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">{t("signInTitle")}</h1>
      <p className="text-muted-foreground mt-1 text-sm">{t("signInSubtitle")}</p>
      <div className="mt-6">
        <SignInForm />
      </div>
      <p className="text-muted-foreground mt-6 text-sm">
        {t("noAccount")}{" "}
        <Link href="/sign-up" className="text-foreground font-medium underline">
          {t("createOne")}
        </Link>
      </p>
    </main>
  );
}
