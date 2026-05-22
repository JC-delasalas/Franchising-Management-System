import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/auth/actions";

/**
 * Header right-side: sign-in link when anonymous; email + sign-out form
 * when authenticated. Server component — fetches user state on every render.
 *
 * Phase 2.4+ replaces the email text with a proper dropdown (avatar, role
 * badges, settings link) once we have those components.
 */
export async function UserMenu() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const t = await getTranslations("auth");

  if (!user) {
    return (
      <Link
        href="/sign-in"
        className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {t("signIn")}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground hidden text-sm sm:inline">{user.email}</span>
      <form action={signOutAction}>
        <button
          type="submit"
          className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {t("signOut")}
        </button>
      </form>
    </div>
  );
}
