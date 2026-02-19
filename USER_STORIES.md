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

---

## Module: Master Data Screen

### US_MD_001
**ID:** US_MD_001
**TITLE:** View Master Data Screen with Sectioned Navigation
**ACTOR:** Admin, QA, Store
**PRECONDITION:** User is logged in and can access `/dashboard/master-data`.
**BUSINESS_OBJECTIVE:** Provide a single place to access core master data entities.
**FUNCTIONAL_DESCRIPTION:** User opens Master Data screen and sees sectioned navigation for Customers, Items, and Standards.
**TECHNICAL_SCOPE:**
- Implement `app/dashboard/master-data/page.tsx` with Mantine `Tabs` and `Card` layout.
- Use Mantine responsive patterns for desktop/mobile rendering.
- Show placeholder-empty states per section until data is fetched.
**DEPENDENCIES:** US_AUTH_001, US_DASH_001.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN user opens Master Data THEN system shows tabs for Customers, Items, Standards.
- AC_002: WHEN user switches tab THEN the selected section content is displayed without route change.
- AC_003: WHEN no data exists THEN system shows clear empty-state message in that section.
**ERROR_SCENARIOS:** Screen load failure.
**SECURITY_CONSIDERATIONS:** Route accessible only to authenticated users.
**AUDIT_REQUIREMENTS:** None for read-only tab switching.
**RLS_IMPACT:** Read queries must respect RLS policies.

### US_MD_002
**ID:** US_MD_002
**TITLE:** View Customers List in Master Data
**ACTOR:** Admin, QA, Store
**PRECONDITION:** User is on Master Data screen.
**BUSINESS_OBJECTIVE:** Allow users to review existing customer records.
**FUNCTIONAL_DESCRIPTION:** User selects Customers tab and sees customer list with key fields.
**TECHNICAL_SCOPE:**
- Fetch `customers` from Supabase.
- Render list using Mantine `Table` (or `DataTable` equivalent in current stack).
- Include loading and error states with Mantine `Loader` and notifications.
**DEPENDENCIES:** US_MD_001, `customers` table.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN customers exist THEN system displays name, contact, email, and phone.
- AC_002: WHEN fetch is in progress THEN loading indicator is visible.
- AC_003: WHEN fetch fails THEN error notification is shown.
**ERROR_SCENARIOS:** Network failure, permission denied.
**SECURITY_CONSIDERATIONS:** RLS governs visibility of customer rows.
**AUDIT_REQUIREMENTS:** None for read-only access.
**RLS_IMPACT:** Query execution must remain RLS-compliant.

### US_MD_003
**ID:** US_MD_003
**TITLE:** Create Customer from Master Data
**ACTOR:** Admin, Store
**PRECONDITION:** User has permission to add customer records.
**BUSINESS_OBJECTIVE:** Capture new customer master records directly from the UI.
**FUNCTIONAL_DESCRIPTION:** User clicks Add Customer, fills form, submits, and sees the new record in the list.
**TECHNICAL_SCOPE:**
- Add Mantine `Modal` + `TextInput` form for customer fields.
- Validate required fields client-side before submit.
- Insert into `customers` via Supabase and refresh table data.
**DEPENDENCIES:** US_MD_002.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN user submits valid data THEN system creates customer record.
- AC_002: WHEN required fields are missing THEN inline validation errors are shown.
- AC_003: WHEN create succeeds THEN success notification is shown and list refreshes.
**ERROR_SCENARIOS:** Validation failure, duplicate/business constraint conflict, DB error.
**SECURITY_CONSIDERATIONS:** Create action available only to allowed roles.
**AUDIT_REQUIREMENTS:** If customer auditing is later enabled, insert actions must be logged.
**RLS_IMPACT:** Insert/update behavior must be compatible with existing policies.
