# User Stories

## Module: Authentication

### US_AUTH_001
**ID:** US_AUTH_001
**TITLE:** User Login with Email and Password
**ACTOR:** All Users (Admin, QA, Store)
**PRECONDITION:** User exists in Supabase Auth and `users` table.
**BUSINESS_OBJECTIVE:** Securely authenticate users to access the system based on their role and plant.
**FUNCTIONAL_DESCRIPTION:** User enters email and password. System validates credentials via Supabase Auth. On success, system redirects to Dashboard.
**TECHNICAL_SCOPE:**
- Implement Login Page (Mantine UI).
- Integrate Supabase Auth `signInWithPassword`.
- Handle session management.
- Redirect to `/dashboard`.
**DEPENDENCIES:** Supabase Project configured.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN user enters valid email/password THEN system redirects to Dashboard.
- AC_002: WHEN user enters invalid credentials THEN system displays error message "Invalid login credentials".
- AC_003: WHEN user is inactive in `users` table THEN system denies access (requires custom check).
**ERROR_SCENARIOS:** Network error, Invalid credentials, Account locked.
**SECURITY_CONSIDERATIONS:** TLS encryption, HttpOnly cookies for session.
**AUDIT_REQUIREMENTS:** Supabase Auth logs login attempts.
**RLS_IMPACT:** `auth.uid()` used for subsequent RLS checks.

---

## Module: Dashboard

### US_DASH_001
**ID:** US_DASH_001
**TITLE:** View Dashboard Overview
**ACTOR:** All Users
**PRECONDITION:** User is logged in.
**BUSINESS_OBJECTIVE:** Provide a high-level view of plant operations and pending tasks.
**FUNCTIONAL_DESCRIPTION:** Dashboard displays key metrics: Pending POs, Active WOs, Pending Lab Results. Sidebar navigation to modules.
**TECHNICAL_SCOPE:**
- Create AppShell layout with Navbar and Header.
- Fetch counts from `purchase_orders`, `work_orders`, `lab_results`.
- Apply RLS to counts (user only sees their plant's data).
**DEPENDENCIES:** US_AUTH_001.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN user loads dashboard THEN system displays counts for Pending POs, Active WOs.
- AC_002: WHEN user clicks a navigation link THEN system navigates to the respective module.
- AC_003: WHEN user switches plant (if multi-plant user) THEN metrics update (Future scope, currently single plant per session context).
**ERROR_SCENARIOS:** Data fetch failure.
**SECURITY_CONSIDERATIONS:** RLS must filter data by `plant_id`.
**AUDIT_REQUIREMENTS:** None for read-only.
**RLS_IMPACT:** Queries must use `auth.user_plants()`.

---

## Module: Purchase Orders

### US_PO_001
**ID:** US_PO_001
**TITLE:** Create Purchase Order
**ACTOR:** Store Manager, Admin
**PRECONDITION:** User has Store or Admin role.
**BUSINESS_OBJECTIVE:** Initiate procurement of materials from customers/suppliers.
**FUNCTIONAL_DESCRIPTION:** User fills PO form (Customer, Order Date, PO Number). System saves as 'draft'.
**TECHNICAL_SCOPE:**
- PO List View (DataTable).
- PO Create Modal (Mantine Form).
- Server Action `createPO`.
**DEPENDENCIES:** Master Data (Customers).
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN user submits valid PO form THEN system creates record in `purchase_orders` with status 'draft'.
- AC_002: WHEN PO Number is duplicate THEN system returns error "PO Number already exists".
- AC_003: WHEN creation is successful THEN system logs audit entry in `audit_logs` (via trigger).
- AC_004: WHEN user views PO list THEN system shows only POs for their plant.
**ERROR_SCENARIOS:** Validation error, DB error.
**SECURITY_CONSIDERATIONS:** Only Store/Admin can create. RLS enforces `plant_id`.
**AUDIT_REQUIREMENTS:** DB Trigger handles insert audit.
**RLS_IMPACT:** Insert must include valid `plant_id` belonging to user.

---

## Module: Work Orders

### US_WO_001
**ID:** US_WO_001
**TITLE:** Create Work Order from PO
**ACTOR:** Store Manager, Admin
**PRECONDITION:** PO exists and is approved (or draft depending on workflow).
**BUSINESS_OBJECTIVE:** Schedule production for a specific item in a PO.
**FUNCTIONAL_DESCRIPTION:** User selects a PO. Enters Item, Quantity, WO Number. System saves WO.
**TECHNICAL_SCOPE:**
- WO List View.
- WO Create Modal.
- Dropdown to select PO.
- Dropdown to select Item.
**DEPENDENCIES:** US_PO_001, Master Data (Items).
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN user submits WO form THEN system creates record in `work_orders`.
- AC_002: WHEN WO Number is duplicate THEN system shows error.
- AC_003: WHEN PO is not selected THEN system prevents submission.
**ERROR_SCENARIOS:** Invalid Item, Duplicate WO.
**SECURITY_CONSIDERATIONS:** RLS `plant_id`.
**AUDIT_REQUIREMENTS:** DB Trigger.
**RLS_IMPACT:** Enforce plant context.
