# Franchise.md — Product Spec (Source of Truth)

> **This is the spec.** When `business-documentation/` and this file disagree, this file wins.
> Old `business-documentation/` is reference-only and lives under `docs/archive/legacy-business-docs/`.

---

## Project Summary

A franchise management system for Philippine franchisors who need a centralized way to manage franchise branches, franchisees, sales reports, royalties, compliance, documents, SOPs, training, and support requests.

The system is **not** intended to replace a full ERP, POS, accounting system, or BIR-compliant invoicing platform. Its first purpose is to become the **franchise control layer** between head office and franchisees.

## Core Problem

Franchise operations are often managed through scattered tools: Messenger, Viber, email, Excel, Google Sheets, Google Drive, manual reports. This creates:

- Late or inconsistent sales reports
- Disputed royalty calculations
- Poor visibility across branches
- Inconsistent SOP compliance
- Missing or expired permits
- Lost support requests
- Incomplete training records
- Weak audit trails
- Overdependence on manual follow-ups

The system solves these by giving head office and franchisees one shared operational platform.

## Target Users

**Primary**

- Franchise owner / franchisor
- Franchise operations manager
- Franchise admin staff
- Franchisee / branch owner
- Branch manager

**Secondary**

- Finance team
- Accountant
- Trainer
- Area manager
- Supplier coordinator

## Product Goals

1. Monitor branch performance
2. Track sales reports and royalties
3. Enforce brand standards
4. Manage compliance requirements
5. Store and review franchise documents
6. Centralize support requests
7. Track training completion
8. Maintain audit trails
9. Reduce manual follow-ups
10. Improve trust between head office and franchisees

## Six-Month Success Criteria

- All active branches listed in the system
- Franchisees submit sales reports through the platform
- Royalty computation is visible and reviewable
- Compliance requirements tracked per branch
- Expiring permits and documents trigger reminders
- Support requests tracked with statuses
- SOPs and announcements centralized
- Admins can export branch-level reports
- Franchisees use the system weekly
- Head office reduces dependence on spreadsheets and chat threads

## Explicit Non-Goals

The system should NOT:

- Become a full ERP in the first version
- Replace BIR-compliant POS or accounting systems
- Generate official invoices unless legally compliant
- Delete or hide sales records
- Allow unlogged edits to critical data
- Automatically impose legal penalties without human review
- Allow franchisees to freely change brand-critical rules
- Expose one franchisee's confidential data to another
- Overcollect personal or sensitive information
- Depend permanently on manual reporting
- Act only as a punishment or surveillance tool

## MVP Scope

1. Authentication and role-based access
2. Branch directory
3. Franchisee profiles
4. Manual sales report submission
5. Basic royalty computation
6. Compliance checklist
7. Document upload
8. Support ticketing
9. Admin dashboard
10. Audit logs

## MVP User Stories

### Admin
- Create and manage branches
- Assign franchisees to branches
- View submitted sales reports
- Review royalty computations
- Create compliance checklists
- Review uploaded documents
- Respond to support tickets
- See overdue reports and missing requirements

### Franchisee
- Log in and view assigned branch
- Submit daily or weekly sales reports
- View royalty breakdown
- Upload required documents
- Complete compliance tasks
- Submit support requests
- View announcements and SOPs

### Finance
- View royalty amounts per branch
- Mark payments as pending, paid, or overdue
- Export sales and royalty summaries

### Operations
- View branch compliance status
- Assign corrective actions
- Review branch audit history

## Core Modules

### 1. Authentication and Roles

Canonical 8 roles:

- Super Admin
- Head Office Admin
- Finance
- Operations
- Trainer
- Franchisee Owner
- Branch Manager
- Viewer

Each role only accesses data relevant to its function. RLS enforced at the database layer for every table.

### 2. Branch Management

Fields: Branch name, Branch code, Address, Region/province/city, Opening date, Status, Assigned franchisee, Contact person, Operating schedule, Contract reference, Notes.

### 3. Franchisee Management

Fields: Name, Business entity name, Contact number, Email, Assigned branches, Contract start date, Contract end date, Renewal status, Territory, Notes.

### 4. Sales Reporting

Fields: Branch, Reporting date, Gross sales, Discounts, Refunds, Net sales, Payment method breakdown, Attachments/proof, Submitted by, Submitted at, Status, Reviewer notes.

Statuses: Draft, Submitted, Under Review, Approved, Rejected, Edited After Submission.

### 5. Royalty Computation

Models supported in MVP:

- Percentage of gross sales
- Percentage of net sales
- Fixed royalty fee
- Marketing fee

**Stacking rule**: transaction-based fees are **additive** on top of monthly tier minimums.

**Itemization rule**: royalty invoices must show line-by-line — royalty fee, marketing fee, penalties, adjustments, previous balance — never a single opaque total.

Royalty computation is **reviewable**, never treated as legally final without Finance approval.

### 6. Compliance Management

Fields: Requirement name, Description, Branch, Due date, Expiry date, Status, Required attachment, Submitted file, Reviewer, Reviewer notes.

Statuses: Not Started, Pending Submission, Submitted, Approved, Rejected, Expired, Overdue.

Checklists must be **configurable per brand, branch, city, or region** — never hard-coded to one universal list.

### 7. Document Repository

Types: Franchise agreement, Business permit, BIR registration, Mayor's permit, Sanitary permit, Fire safety certificate, Lease contract, Training certificate, Proof of payment, Other branch documents.

Each document: File, Type, Branch, Expiry date, Uploaded by, Uploaded at, Review status.

### 8. SOP and Knowledge Base

Contents: Operations manual, Brand guidelines, Product preparation guides, Approved supplier list, Promo guidelines, Training materials, Announcements.

Franchisees: read access. Editing: head office only.

### 9. Support Ticketing

Fields: Branch, Submitted by, Category, Priority, Description, Attachments, Status, Assigned admin, Resolution notes.

Categories: Operations, Inventory, Sales reporting, Compliance, Training, Marketing, Technical issue, Supplier issue, Other.

Statuses: Open, In Progress, Waiting for Franchisee, Waiting for Head Office, Resolved, Closed.

### 10. Audit Logs

Track: User, Action, Entity, Previous value, New value, Timestamp, IP/device metadata.

Applies to: Sales reports, Royalty computations, Payments, Compliance records, Documents, Branch information, Franchisee records, User permissions.

## Invoicing Policy

The system generates **internal billing documents** — royalty invoices and marketing-fee invoices the franchisor issues to the franchisee. These are B2B billing records between the franchisor and franchisee.

The system does **not** generate customer-facing Official Receipts (ORs) or Sales Invoices issued at point-of-sale. Those are subject to BIR regulation and must come from a compliant accredited setup.

Every internally generated invoice carries a clear marker on the document itself:

> **Internal billing document — for franchisor/franchisee royalty reconciliation. Not a BIR Official Receipt or Sales Invoice.**

Invoice numbering for internal documents must not mimic BIR series numbering conventions.

## Data Privacy Principles

- Collect only necessary data
- Restrict access by role (RLS at database)
- Protect sensitive documents
- Keep audit trails
- Never expose one franchisee's data to another
- Support data retention rules
- Enforce secure password policies
- Support MFA in later versions (Phase 4)
- Comply with the Philippine Data Privacy Act (RA 10173) — the franchisor is the Personal Information Controller; the platform is a Personal Information Processor

## Design Principles

1. Make compliance easy
2. Make reporting traceable
3. Make franchisees feel supported
4. Make branch performance visible
5. Make audit history reliable
6. Make the first version simple
7. Integrate before replacing existing systems
8. Avoid overbuilding

## Product Voice

Professional, helpful, direct. Avoid threatening language. Use neutral status words ("overdue", "needs review", "please submit") instead of accusatory labels ("violator", "non-compliant offender", "in violation").

Bad: *You are non-compliant.*
Better: *This requirement is overdue. Please submit the needed document or contact head office if you need help.*

This is not softness — it's a Filipino business-relationship reality. Pakikisama and face-saving matter. A system that publicly shames franchisees will be abandoned and worked around.

## Development Principles

The codebase should be:

- Modular
- Clear
- Maintainable
- Easy to onboard developers into
- Built with explicit business rules
- Designed for future integrations
- Protected by role-based permissions
- Supported by audit logs

Avoid clever abstractions in MVP.

## Future Features (Post-MVP, deferred)

- POS integration
- Accounting integration
- Automated royalty billing
- Supplier ordering
- Inventory monitoring
- Branch audit mobile app
- Training quizzes
- AI anomaly detection
- Sales forecasting
- Benchmarking dashboards
- Automated reminders
- Franchise renewal workflow
- Multi-brand support
- Multi-location analytics

## Key Risks

1. Franchisees may resist adoption if the system feels punitive
2. Manual sales entry may create disputes
3. Poor role permissions may expose sensitive data
4. Overbuilding may delay launch
5. Lack of audit logs may weaken trust
6. Hard-coded royalty rules may not fit future clients
7. Compliance features may be mistaken for legal/tax compliance
8. Weak document management may create operational risk

## Build Recommendation (Priority Order)

1. Branch and franchisee management
2. Sales report submission
3. Royalty computation
4. Compliance checklist
5. Document upload
6. Support ticketing
7. SOP library
8. Admin dashboard
9. Audit logs
10. Reports and exports

Do not build the full ERP first.
