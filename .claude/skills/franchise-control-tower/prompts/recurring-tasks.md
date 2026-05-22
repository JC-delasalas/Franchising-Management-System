# Recurring Tasks — Prompt Templates

Copy/paste these when you want the franchise expert to do a specific job. Each one is structured to trigger the skill and bound the work.

---

## 1. PR review

```
/skill franchise-control-tower

Review PR #__ (or the current diff) for compliance with Franchise.md MVP scope.
Specifically check:
- Scope: does this trace to a Franchise.md section?
- RLS: every new table has a policy?
- Audit: every CBE mutation logs?
- Royalty/billing (if touched): itemized, footer present, no BIR-regulated terminology?
- Copy: pakikisama-safe?
- RBAC: stays within 8 canonical roles?

Output: a structured report with severity (blocker / high / medium / low), file:line for each issue, and a one-line fix recommendation.
```

---

## 2. Migration audit

```
/skill franchise-control-tower

Audit this migration:
[paste path or SQL]

Checklist:
- RLS enabled on every new table
- Policies cover SELECT/INSERT/UPDATE/DELETE (or explicitly omit with reason)
- SECURITY DEFINER functions have EXECUTE revoked from anon/authenticated
- Audit triggers attached to Critical Business Entities
- Foreign keys use restrict/set null, not cascade, on CBEs
- Indexes on foreign keys and common query patterns
- Idempotent (CREATE IF NOT EXISTS)

Output: pass/fail per item with specific lines to change.
```

---

## 3. Module design

```
/skill franchise-control-tower

Design the [module name] module per Franchise.md §[number].

Deliver:
1. Entity list with field definitions (use Franchise.md as canonical for field names)
2. RLS policies for each entity (use the 8-role canonical model)
3. Audit-logged actions list
4. Status workflow with explicit transitions
5. Manual override path (with reason field)
6. PH-specific considerations (permits, payment methods, language)
7. Edge cases to handle (e.g., late submission, corrected report)
8. Exports (CSV/PDF) if applicable
9. Reminders/notifications and cadence
10. Open questions for me to resolve

Do NOT write code yet. Just the design.
```

---

## 4. Copy review

```
/skill franchise-control-tower

Review this user-facing copy for pakikisama-safety and franchisee-supportive tone:

[paste strings]

Output: per string, mark OK or rewrite. Flag any BIR-regulated terminology misuse, any shaming language, any auto-finality framing.
```

---

## 5. Royalty / billing review

```
/skill franchise-control-tower

Review this royalty/billing logic for itemization, stacking math, and BIR-safety:

[paste code or describe logic]

Specifically:
- base_royalty and transaction_royalty kept separate?
- Marketing fee, penalties, adjustments, previous_balance as separate lines?
- Zero lines still rendered?
- Mandatory footer present on all invoice surfaces (PDF, email, UI)?
- Numbering follows INT-YYYY-NNNNNN?
- No "Official Receipt" / "Sales Invoice" / "Tax Invoice" language?
- No automatic legal finality?

Output: line-by-line findings with fix recommendations.
```

---

## 6. Scope check

```
/skill franchise-control-tower

Is [feature description] in MVP scope per Franchise.md?

If yes: cite the section.
If no: tell me which Phase it lands in, and what trade-off I'd be making if I promoted it to MVP.
```

---

## 7. Pre-flight scope challenge

```
/skill franchise-control-tower

I'm about to start work on [feature/module/change]. Before I do:

- Is this the right next thing per PLAN.md?
- What's the simplest possible MVP version of this?
- What am I likely to scope-creep into that I should resist?
- What's one thing I'll forget that this skill should remind me of (audit, RLS, copy, footer, etc.)?
```

---

## 8. RLS audit

```
/skill franchise-control-tower

Run an RLS audit:
- List every table in the public schema
- For each: confirm RLS is enabled
- For each: confirm there's at least one policy per CRUD operation (or document why not)
- For each CBE: confirm there's a cross-franchisee isolation test
- Report any SECURITY DEFINER function still callable by anon or authenticated

Output: table-by-table report with action items.
```

---

## 9. Compliance checklist design

```
/skill franchise-control-tower

Design the compliance requirements seed data for a new franchisor in:
- City: [name]
- Industry: [food / retail / services]
- Business model: [single branch / multi-branch]

Output: a configurable checklist with:
- Each requirement (Mayor's Permit, BIR, Sanitary, Fire, Barangay, etc.)
- Typical renewal cycle
- Lead time for reminders
- Required document type(s)
- Owner role (who's responsible — usually Operations or Franchisee Owner)

Be explicit about which items vary by LGU vs. national.
```

---

## 10. Onboarding new contributor

```
/skill franchise-control-tower

A new developer is joining the project. Generate the 30-minute onboarding briefing:
- What the product is (and isn't)
- The 9 constitutional rules they cannot violate
- The 8 canonical roles
- The royalty/billing rules
- The Filipino-context tone rules
- The most common scope-creep traps
- Where to find Franchise.md, CLAUDE.md, PLAN.md
- What to read first if they're doing [frontend / backend / migrations / copy]
```

---

## 11. Risk scan before launch

```
/skill franchise-control-tower

Pre-launch risk scan. Walk through the Definition of Done in PLAN.md and the constitutional rules in CLAUDE.md. For each:
- Is there evidence we've achieved/honored it? (Cite test, doc, code path)
- If not, what's the gap?
- What's the launch-blocker vs. post-launch-acceptable list?

Output: prioritized punch list before MVP launch.
```

---

## 12. Filipino translation request

```
/skill franchise-control-tower

Translate these franchisee-facing strings to natural Filipino (not literal translation):

[paste English strings]

Rules:
- Tone supportive, not formal-stiff
- No shaming language even in Filipino equivalents
- Keep technical terms (royalty, branch) in English if that's how franchisees actually say them
- Flag any string where the English itself violates the voice rule (so I can fix the source)
```

---

## When NOT to use these prompts

For tasks unrelated to franchise domain — Next.js routing, Tailwind classes, generic TypeScript, infrastructure, deployment, library setup — use the main assistant directly. This skill will load too much irrelevant context and slow you down.
