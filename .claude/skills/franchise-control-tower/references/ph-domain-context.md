# Philippine Domain Context

> Bits a generic franchise-software template misses. Use these when designing modules, writing copy, or making compliance trade-offs.

---

## Tax & document terminology — handle with care

| Term | What it is | We generate? |
|---|---|---|
| **Official Receipt (OR)** | BIR-regulated proof of payment for services | No |
| **Sales Invoice (SI)** | BIR-regulated record of sale of goods | No |
| **POS receipt** | Customer-facing transaction record from an accredited POS | No |
| **VAT invoice** | Sales invoice with VAT breakdown — BIR rules apply | No |
| **Internal billing document** | B2B commercial document between business entities | **Yes** (royalty & marketing fee invoices) |
| **Statement of account** | Period summary of charges/payments | Yes (Phase 4+ likely) |
| **Credit memo / debit memo** | Adjustment document | Yes — internal only |

When in doubt, don't generate. Ask.

Never use phrases like "BIR-friendly invoice", "compliant receipt", or "official-style invoice" — they imply regulatory status we can't claim.

---

## Permit & document landscape

Common documents tracked in the Compliance module. Renewal cycles vary by LGU — do not hard-code them.

| Document | Typical issuer | Typical cycle | Notes |
|---|---|---|---|
| Mayor's Permit / Business Permit | City/Municipal LGU | Annual (Jan renewal common) | Penalties for late renewal. Single biggest annual pain point. |
| Barangay Clearance / Business Permit | Barangay | Annual | Required before Mayor's Permit |
| BIR Certificate of Registration (BIR 2303) | BIR | One-time + annual registration fee | Annual renewal of registration fee (Jan 31 deadline historically) |
| Fire Safety Inspection Certificate (FSIC) | BFP | Annual | Required for Mayor's Permit renewal |
| Sanitary Permit | City/Municipal Health | Annual | Food establishments especially |
| Lease contract | Landlord | Multi-year | Track expiry for renewal planning |
| DOLE compliance certificates | DOLE | Varies | If employer-related |
| SSS / PhilHealth / Pag-IBIG registrations | Respective agencies | Ongoing | If employees |
| Franchise agreement | Franchisor | Per contract term (3-10 yrs) | Renewal workflow is Phase 4+ |

Reminder cadence baseline: 30 / 14 / 7 / 1 days before expiry, via email + in-app. Configurable per document type.

---

## Payment & finance reality

- **Bank transfer** still dominant for B2B (franchisee → franchisor)
- **GCash** and **Maya** common for smaller amounts, increasingly used for royalty payments under PHP 50k
- **OTC deposits** still used by older franchisees / those without online banking
- **Cash handover** rare for royalty but happens — must allow as an option
- **Bounced checks** are a thing — Finance needs a way to reverse a confirmed payment

Payment proof workflows must be tolerant: blurry GCash screenshots are normal, bank deposit slips are scanned at weird angles, reference numbers are sometimes wrong. Build for Finance to ask for clarification, not just accept/reject.

---

## Language & tone (pakikisama matters)

Filipino business culture values:

- **Pakikisama** — getting along, social harmony
- **Hiya** — sense of propriety; public shame is acutely felt
- **Utang na loob** — relational reciprocity
- **Face-saving** — avoiding embarrassment of self and others

The system must not weaponize compliance. Specifics:

| Avoid | Use instead |
|---|---|
| "You are non-compliant" | "This requirement is overdue" |
| "Violator" | "Pending submission" |
| "Failed inspection" | "Needs follow-up" |
| "Penalty applied automatically" | "Flagged for Finance review" |
| "Franchisee in breach" | "Items requiring attention" |
| "Late again!" | "Reminder: please submit when ready" |
| "Suspended" (without context) | "Access paused pending review — contact head office" |

When you have to deliver hard news (e.g. account suspension, contract issue), do it via human-routed workflow with a person in the loop. Never the system speaking with finality on legal/financial status.

---

## Data Privacy Act (RA 10173)

The Data Privacy Act is the foundational PH privacy law. Key roles:

- **Personal Information Controller (PIC)** — the franchisor (decides why and how personal data is processed)
- **Personal Information Processor (PIP)** — the platform (processes on behalf of the PIC)

Practical implications for design:

- Collect only what's needed for the stated purpose (data minimization)
- Get clear consent for new uses
- Allow data subject access / correction / deletion requests (Phase 4 has the formal workflow; MVP should at least make data exportable per franchisee)
- Encrypt at rest (Supabase does this) and in transit (TLS — Vercel does this)
- Retain only as long as the business purpose requires (set retention defaults per entity type)
- Restrict access by role — enforced via RLS
- Log access to sensitive records (audit_log)
- Have a documented breach response plan (RUNBOOK.md item, not code)

The franchisor is ultimately accountable as the PIC. The platform's job is to make compliance achievable, not to be a substitute for legal compliance work.

---

## Operational reality

Things to design *for*, not against:

- **Manual sales entry will dominate MVP** — POS integration is Phase 4+. Plan for typos, double submissions, "I forgot to subtract refunds" — make corrections easy and audit them.
- **Messenger/Viber will still be used in parallel** — accept it. Don't try to ban it; just make the system more useful than the chat thread for the specific things we track.
- **Spreadsheet exports will be requested** — Finance and Operations will export CSVs and crunch in Excel. Make exports comprehensive (don't strip columns).
- **Approvals will happen by phone** — admin must be able to record "manually approved by call with [name] on [date]" with reason text + audit log. Never silent.
- **Photo uploads of proof are the norm** — payment slips, permit copies, fire extinguisher photos. Make file upload robust; allow multiple files per record.
- **Net connectivity is variable** — design read paths to work offline (PWA shell in Phase 3 polish).
- **Mobile-first reading, desktop-first writing** — franchisees check on phone; admin works on laptop. Layouts should respect this.

---

## Multi-region / multi-language

- MVP: English (admin) + Filipino (franchisee-facing strings)
- All strings via `next-intl` from day one — even if only English is shipped first
- Localization beyond Filipino is Phase 4+
- Do not assume Manila — design for branches across regions/provinces

Time zone: Asia/Manila (+08:00) for all timestamps displayed to users. Store UTC in DB; convert at render.

Currency: PHP only in MVP. Multi-currency Phase 4+.
