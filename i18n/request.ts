import { getRequestConfig } from "next-intl/server";

/**
 * next-intl request config — runs on every server request.
 *
 * MVP: English only, locale hard-coded. Cookie/header-based locale
 * negotiation comes in Phase 3 polish when Filipino translations land.
 *
 * Per Franchise.md product voice: franchisee-facing copy must use neutral,
 * supportive language ("overdue", "please submit"), never accusatory
 * ("violator", "non-compliant"). All user-facing strings go through this
 * pipe so translations stay consistent across the UI.
 */
export default getRequestConfig(async () => {
  const locale = "en";
  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
    timeZone: "Asia/Manila", // Display all timestamps in PH time. UTC in DB.
  };
});
