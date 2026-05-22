import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default async function SignUpPage() {
  const t = await getTranslations("auth");

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">{t("signUpTitle")}</h1>
      <p className="text-muted-foreground mt-1 text-sm">{t("signUpSubtitle")}</p>
      <div className="mt-6">
        <SignUpForm />
      </div>
      <p className="text-muted-foreground mt-6 text-sm">
        {t("haveAccount")}{" "}
        <Link href="/sign-in" className="text-foreground font-medium underline">
          {t("signIn")}
        </Link>
      </p>
    </main>
  );
}
