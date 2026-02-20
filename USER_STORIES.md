# User Stories

**Note to Developers/Agents**:
- All UI components MUST be from Mantine UI (8.x).
- Use `UI_STANDARDS.md` for styling guidelines.
- Use **Context7** MCP for best practices when implementing libraries.
- For every user story with UI scope, first generate a wireframe using the **Google Stitch MCP server** before writing implementation code.
- Development must follow the Stitch-generated wireframe structure, layout, hierarchy, and interaction intent.
- After implementation, validate the delivered screen against the Stitch wireframe and record any intentional deviations with rationale.
- The Stitch wireframe is the baseline artifact for UI consistency across modules.
- All database interactions must use `utils/supabase/server.ts` (Server Components/Actions) or `utils/supabase/client.ts` (Client Components).
- RLS policies are strictly enforced. Ensure `plant_id` is handled correctly in all write operations.

---

## Mandatory UI Workflow (All UI Stories)
1. Generate wireframe using Google Stitch MCP server for the target story/screen.
2. Review wireframe against `UI_STANDARDS.md` and story acceptance criteria before coding.
3. Implement UI and behavior in Next.js + Mantine based on the approved wireframe.
4. Validate implementation against the Stitch wireframe (layout, component hierarchy, states, and primary interactions).
5. Document deviations (if any) and ensure they are intentional, minimal, and justified by functional or technical constraints.

---

## Epic 1: Master Data Management

### US_MD_001
**ID:** US_MD_001
**TITLE:** Manage Customer Records
**STATUS:** Completed
**ACTOR:** Admin, Store Manager
**PRECONDITION:** User has Admin or Store role.
**BUSINESS_OBJECTIVE:** Maintain a repository of customers for PO creation.
**FUNCTIONAL_DESCRIPTION:** User views a list of customers. User can create, edit, or delete (soft delete) a customer.
**TECHNICAL_SCOPE:**
- **UI**: `/master-data/customers/page.tsx`
    - List: `Table` with search bar.
    - Create/Edit: `Modal` with `TextInput` (Name, Address, GST, Contact, Email, Phone).
- **Backend**: Server Actions (`createCustomer`, `updateCustomer`, `deleteCustomer`).
- **Validation**: Name is required. Email format check.
**DEPENDENCIES:** None.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN user views list THEN system shows all customers (RLS: global or plant-specific as per policy).
- AC_002: WHEN user submits valid form THEN new customer is created.
- AC_003: WHEN user submits empty name THEN system shows validation error.
- AC_004: WHEN user deletes customer THEN `is_deleted` flag is set to true (Soft Delete).
**ERROR_SCENARIOS:** Database connection error, Duplicate name (if unique constraint exists).
**SECURITY_CONSIDERATIONS:** Only authorized roles can write.
**AUDIT_REQUIREMENTS:** Update trigger logs changes.
**RLS_IMPACT:** Check policy (Global or Plant-scoped). *Requirement says "Master Data has no plant_id" but RLS policy says "Allow read access... to authenticated". Write might be restricted.*
**AGENT_TESTING_CRITERIA:**
1. Navigate to `/master-data/customers`.
2. Click "Add Customer".
3. Fill form with "Test Customer", "123 Main St", "GST123", "John Doe", "john@test.com", "555-1234".
4. Click "Save".
5. Verify "Test Customer" appears in list.
6. Edit "Test Customer" to "Updated Customer".
7. Verify change in list.
8. Delete "Updated Customer".
9. Verify it disappears from list.

### US_MD_002
**ID:** US_MD_002
**TITLE:** Manage Item Master
**STATUS:** Completed
**ACTOR:** Admin, Store Manager
**PRECONDITION:** User has Admin or Store role.
**BUSINESS_OBJECTIVE:** Maintain a catalog of items for procurement and production.
**FUNCTIONAL_DESCRIPTION:** User views, adds, edits items.
**TECHNICAL_SCOPE:**
- **UI**: `/master-data/items/page.tsx`
    - List: `Table`.
    - Form: `TextInput` (Item Code, Description, Unit).
- **Backend**: Server Actions.
**DEPENDENCIES:** None.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN user adds item with unique code THEN item is saved.
- AC_002: WHEN user adds duplicate code THEN error "Item Code already exists".
**ERROR_SCENARIOS:** Duplicate Code.
**SECURITY_CONSIDERATIONS:** Role-based access.
**AUDIT_REQUIREMENTS:** Trigger enabled.
**RLS_IMPACT:** Read-all policy.
**AGENT_TESTING_CRITERIA:**
1. Navigate to `/master-data/items`.
2. Add Item "ITEM-001", "Steel Rod", "kg".
3. Save and verify.
4. Try adding "ITEM-001" again. Verify error message.

### US_MD_003
**ID:** US_MD_003
**TITLE:** Manage Standards & Parameters
**STATUS:** Completed
**ACTOR:** Admin, QA
**PRECONDITION:** User has Admin or QA role.
**BUSINESS_OBJECTIVE:** Define quality standards and their parameters for Lab Validation.
**FUNCTIONAL_DESCRIPTION:** User creates a Standard (e.g., "ASTM A36"). Then adds Parameters (e.g., "Carbon", "Tensile Strength") to that standard.
**TECHNICAL_SCOPE:**
- **UI**: `/master-data/standards/page.tsx`
    - Master-Detail layout or Nested Modal.
    - Standard Form: Name, Description.
    - Parameter Form: Name, Category (Enum), Unit, Min, Max.
- **Backend**: Transactional insert for Standard + Parameters recommended, or two-step process.
**DEPENDENCIES:** None.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN user creates Standard THEN it appears in list.
- AC_002: WHEN user adds Parameter to Standard THEN it is linked correctly.
- AC_003: WHEN user sets Min > Max THEN validation error.
**ERROR_SCENARIOS:** Invalid numeric range.
**SECURITY_CONSIDERATIONS:** QA/Admin only.
**AUDIT_REQUIREMENTS:** Trigger enabled.
**RLS_IMPACT:** Read-all policy.
**AGENT_TESTING_CRITERIA:**
1. Navigate to `/master-data/standards`.
2. Create Standard "STD-TEST".
3. Add Parameter "Carbon", "chemical", "%", 0.1, 0.5.
4. Add Parameter "Hardness", "mechanical", "HB", 100, 200.
5. Verify parameters are listed under "STD-TEST".

---

## Epic 2: Procurement & Production
## Module: Authentication

### US_AUTH_001
**ID:** US_AUTH_001
**TITLE:** User Login with Email and Password
**STATUS:** Completed
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
**STATUS:** Completed
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
**STATUS:** Completed
**ACTOR:** Store Manager
**PRECONDITION:** User is logged in. Customers exist.
**BUSINESS_OBJECTIVE:** Initiate purchase of materials.
**FUNCTIONAL_DESCRIPTION:** User creates a PO header.
**TECHNICAL_SCOPE:**
- **UI**: `/dashboard/po/page.tsx` (List + Create flow).
    - Fields: PO Number, Customer (Dropdown), Order Date.
    - Status defaults to 'draft'.
- **Backend**: `createPO` action.
**DEPENDENCIES:** Customers.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN form submitted THEN PO created in 'draft'.
- AC_002: WHEN PO Number exists THEN error.
- AC_003: WHEN created THEN `plant_id` is set to user's plant.
**ERROR_SCENARIOS:** Duplicate PO.
**SECURITY_CONSIDERATIONS:** Plant RLS.
**AUDIT_REQUIREMENTS:** Trigger.
**RLS_IMPACT:** `plant_id` mandatory.
**AGENT_TESTING_CRITERIA:**
1. Navigate to `/dashboard/po`.
2. Click Create.
3. Select Customer "Test Customer".
4. Enter PO "PO-1001", Date "Today".
5. Save. Verify redirection to PO List.
## Module: Work Orders

### US_WO_001
**ID:** US_WO_001
**TITLE:** Create Work Order from PO
**STATUS:** Completed
**ACTOR:** Store Manager, Admin
**PRECONDITION:** PO exists. Items exist.
**BUSINESS_OBJECTIVE:** Plan production against a PO.
**FUNCTIONAL_DESCRIPTION:** User selects a PO, selects an Item, enters Quantity and WO Number.
**TECHNICAL_SCOPE:**
- **UI**: `/dashboard/work-orders/page.tsx`.
- **Backend**: `createWO` action.
**DEPENDENCIES:** PO, Items.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN valid inputs THEN WO created with status 'draft'.
- AC_002: WHEN PO is selected THEN linked correctly.
**ERROR_SCENARIOS:** Invalid Item/PO.
**SECURITY_CONSIDERATIONS:** Plant RLS.
**AUDIT_REQUIREMENTS:** Trigger.
**RLS_IMPACT:** `plant_id` mandatory.
**AGENT_TESTING_CRITERIA:**
1. Navigate to `/dashboard/work-orders`.
2. Click Create.
3. Select PO "PO-1001".
4. Select Item "ITEM-001".
5. Enter WO "WO-2001", Qty 100.
6. Save. Verify in list.

### US_HEAT_001
**ID:** US_HEAT_001
**TITLE:** Register Heat & Allocate
**STATUS:** Completed
**ACTOR:** Store Manager
**PRECONDITION:** WO exists.
**BUSINESS_OBJECTIVE:** Track raw material batch (Heat) used for a WO.
**FUNCTIONAL_DESCRIPTION:** User registers a Heat (Supplier, Grade, Qty). User allocates Heat to a WO.
**TECHNICAL_SCOPE:**
- **UI**: `/inventory/heats/page.tsx`.
    - Heat Registration Form.
    - Allocation Modal (Select WO, Enter Qty).
- **Backend**: `createHeat`, `allocateHeat` (transactional: insert `inventory_movements`, update `heats.available_quantity`).
**DEPENDENCIES:** WO.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN Heat created THEN available_qty = initial_qty.
- AC_002: WHEN Heat allocated THEN available_qty decreases.
- AC_003: WHEN allocation > available THEN error "Insufficient Quantity".
**ERROR_SCENARIOS:** Negative stock.
**SECURITY_CONSIDERATIONS:** Plant RLS.
**AUDIT_REQUIREMENTS:** Trigger.
**RLS_IMPACT:** `plant_id` mandatory.
**AGENT_TESTING_CRITERIA:**
1. Navigate to `/inventory/heats`.
2. Create Heat "HEAT-99", Supplier "SteelCo", Qty 1000.
3. Click "Allocate".
4. Select "WO-2001".
5. Enter Qty 100.
6. Save.
7. Verify Heat available qty is 900.
8. Verify Inventory Movement log.

---

## Epic 3: Quality Control

### US_LAB_001
**ID:** US_LAB_001
**TITLE:** Enter Lab Results
**STATUS:** Completed
**ACTOR:** QA
**PRECONDITION:** WO status 'lab_pending' (or 'in_production'). Standard assigned to Item (Implicit or Explicit? *Requirement implies Item has Standard, let's assume mapping exists or selected during Lab Entry*).
**BUSINESS_OBJECTIVE:** Record quality parameters.
**FUNCTIONAL_DESCRIPTION:** QA selects WO. System fetches parameters from Standard. QA enters Observed Values.
**TECHNICAL_SCOPE:**
- **UI**: `/dashboard/lab-results/page.tsx`.
    - List WOs pending lab.
    - Entry Form: Dynamic fields based on Standard Parameters.
- **Backend**: `submitLabResult`.
    - Logic: Fetch Min/Max. Compare Observed. Set Status (Pass/Fail).
**DEPENDENCIES:** Standard Parameters.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN value in range THEN status 'passed'.
- AC_002: WHEN value out of range THEN status 'failed'.
- AC_003: WHEN saved THEN `lab_result_parameters` rows created.
**ERROR_SCENARIOS:** Missing values.
**SECURITY_CONSIDERATIONS:** QA role only.
**AUDIT_REQUIREMENTS:** Trigger.
**RLS_IMPACT:** Plant RLS.
**AGENT_TESTING_CRITERIA:**
1. Navigate to `/dashboard/lab-results`.
2. Select "WO-2001".
3. Select Standard "STD-TEST".
4. Enter Carbon: 0.3 (Pass), Hardness: 250 (Fail).
5. Submit.
6. Verify Result Status is "Pending" (overall) or "Failed" (due to hardness).

### US_LAB_002
**ID:** US_LAB_002
**TITLE:** Override Failed Result
**STATUS:** Completed
**ACTOR:** QA (with special permission? Req says QA role only).
**PRECONDITION:** Lab Result Parameter status is 'failed'.
**BUSINESS_OBJECTIVE:** Allow expert judgment to accept marginal failures.
**FUNCTIONAL_DESCRIPTION:** QA clicks "Override" on a failed parameter. Enters Reason. Status changes to 'override'.
**TECHNICAL_SCOPE:**
- **UI**: Button on Failed Parameter row. Modal for Reason.
- **Backend**: `overrideParameter`. Updates `lab_result_parameters` and inserts `override_logs`.
**DEPENDENCIES:** US_LAB_001.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN override submitted THEN status becomes 'override'.
- AC_002: WHEN override submitted THEN log entry created in `override_logs`.
**ERROR_SCENARIOS:** Empty reason.
**SECURITY_CONSIDERATIONS:** QA only.
**AUDIT_REQUIREMENTS:** Explicit Override Log.
**RLS_IMPACT:** Plant RLS.
**AGENT_TESTING_CRITERIA:**
1. On "WO-2001" result page.
2. Locate "Hardness" (Failed).
3. Click Override.
4. Enter "Marginal deviation acceptable per client".
5. Save.
6. Verify status is "Override".

### US_TC_001
**ID:** US_TC_001
**TITLE:** Generate and Issue Test Certificate
**STATUS:** Completed
**ACTOR:** QA
**PRECONDITION:** All parameters Passed or Overridden.
**BUSINESS_OBJECTIVE:** Generate official quality document (PDF).
**FUNCTIONAL_DESCRIPTION:** QA reviews results. Clicks "Generate TC". PDF preview shown. Clicks "Issue".
**TECHNICAL_SCOPE:**
- **UI**: `/tc/page.tsx`.
- **PDF**: `@react-pdf/renderer` template.
- **Backend**: `generateTC`, `issueTC`.
    - Check all params passed/override.
    - Generate PDF blob.
    - Upload to Storage (Supabase Storage? Or just store URL/Base64? Req says "PDF stored").
    - Insert `test_certificates` and `test_certificate_versions`.
**DEPENDENCIES:** Lab Results.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN any param Failed (no override) THEN Issue blocked.
- AC_002: WHEN Issue clicked THEN PDF generated and version 1 created.
- AC_003: WHEN Issued THEN Status 'issued'.
**ERROR_SCENARIOS:** Validation failure.
**SECURITY_CONSIDERATIONS:** QA only.
**AUDIT_REQUIREMENTS:** Trigger.
**RLS_IMPACT:** Plant RLS.
**AGENT_TESTING_CRITERIA:**
1. Navigate to `/tc`.
2. Select "WO-2001".
3. Verify all params valid.
4. Click "Generate TC".
5. Verify PDF preview loads.
6. Click "Issue".
7. Verify TC Status "Issued".

---

## Epic 4: Inventory & Admin

### US_INV_001
**ID:** US_INV_001
**TITLE:** View Inventory Movements
**STATUS:** Completed
**ACTOR:** Store Manager, Admin
**PRECONDITION:** Movements exist.
**BUSINESS_OBJECTIVE:** Traceability of materials.
**FUNCTIONAL_DESCRIPTION:** View list of heat allocations.
**TECHNICAL_SCOPE:**
- **UI**: `/inventory/movements/page.tsx`.
- **Backend**: Read `inventory_movements`.
**DEPENDENCIES:** Heat Allocation.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN viewed THEN show Date, Heat, WO, Qty, Type.
**ERROR_SCENARIOS:** None.
**SECURITY_CONSIDERATIONS:** Plant RLS.
**AUDIT_REQUIREMENTS:** None (Read).
**RLS_IMPACT:** Plant RLS.
**AGENT_TESTING_CRITERIA:**
1. Navigate to `/inventory/movements`.
2. Find movement for "WO-2001".
3. Verify quantity -100 (Allocation).

### US_ADM_001
**ID:** US_ADM_001
**TITLE:** User Management (Role Assignment)
**STATUS:** Completed
**ACTOR:** Admin
**PRECONDITION:** Admin logged in.
**BUSINESS_OBJECTIVE:** Assign roles and plants to users.
**FUNCTIONAL_DESCRIPTION:** Admin views users. Assigns Plant and Role.
**TECHNICAL_SCOPE:**
- **UI**: `/admin/users/page.tsx`.
- **Backend**: `assignRole`. Inserts `user_roles`.
**DEPENDENCIES:** Supabase Auth users.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN Role assigned THEN user can access respective modules.
- AC_002: WHEN Plant assigned THEN RLS scopes data to that plant.
**ERROR_SCENARIOS:** User not found.
**SECURITY_CONSIDERATIONS:** Admin only.
**AUDIT_REQUIREMENTS:** `user_roles` trigger (if added, or rely on manual log).
**RLS_IMPACT:** Admin manages all? Or just own plant? Usually Admin is global or Super Admin.
**AGENT_TESTING_CRITERIA:**
1. Navigate to `/admin/users`.
2. Select a test user.
3. Assign "QA" role for "Main Plant".
4. Verify assignment in list.

---

## Module: Master Data Screen

### US_MDS_001
**ID:** US_MDS_001
**TITLE:** View Master Data Screen with Sectioned Navigation
**STATUS:** Completed
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

### US_MDS_002
**ID:** US_MDS_002
**TITLE:** View Customers List in Master Data
**STATUS:** Completed
**ACTOR:** Admin, QA, Store
**PRECONDITION:** User is on Master Data screen.
**BUSINESS_OBJECTIVE:** Allow users to review existing customer records.
**FUNCTIONAL_DESCRIPTION:** User selects Customers tab and sees customer list with key fields.
**TECHNICAL_SCOPE:**
- Fetch `customers` from Supabase.
- Render list using Mantine `Table` (`Table.Thead`, `Table.Tbody`, `Table.Tr`, `Table.Th`, `Table.Td`) with project-level sorting/filtering/pagination patterns.
- Include loading and error states with Mantine `Loader` and notifications.
**DEPENDENCIES:** US_MDS_001, `customers` table.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN customers exist THEN system displays name, contact, email, and phone.
- AC_002: WHEN fetch is in progress THEN loading indicator is visible.
- AC_003: WHEN fetch fails THEN error notification is shown.
**ERROR_SCENARIOS:** Network failure, permission denied.
**SECURITY_CONSIDERATIONS:** RLS governs visibility of customer rows.
**AUDIT_REQUIREMENTS:** None for read-only access.
**RLS_IMPACT:** Query execution must remain RLS-compliant.

### US_MDS_003
**ID:** US_MDS_003
**TITLE:** Create Customer from Master Data
**STATUS:** Completed
**ACTOR:** Admin, Store
**PRECONDITION:** User has permission to add customer records.
**BUSINESS_OBJECTIVE:** Capture new customer master records directly from the UI.
**FUNCTIONAL_DESCRIPTION:** User clicks Add Customer, fills form, submits, and sees the new record in the list.
**TECHNICAL_SCOPE:**
- Add Mantine `Modal` + `TextInput` form for customer fields.
- Validate required fields client-side before submit.
- Insert into `customers` via Supabase and refresh table data.
**DEPENDENCIES:** US_MDS_002.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN user submits valid data THEN system creates customer record.
- AC_002: WHEN required fields are missing THEN inline validation errors are shown.
- AC_003: WHEN create succeeds THEN success notification is shown and list refreshes.
**ERROR_SCENARIOS:** Validation failure, duplicate/business constraint conflict, DB error.
**SECURITY_CONSIDERATIONS:** Create action available only to allowed roles.
**AUDIT_REQUIREMENTS:** If customer auditing is later enabled, insert actions must be logged.
**RLS_IMPACT:** Insert/update behavior must be compatible with existing policies.

### US_MDS_004
**ID:** US_MDS_004
**TITLE:** View Items List in Master Data
**STATUS:** Completed
**ACTOR:** Admin, QA, Store
**PRECONDITION:** User is on Master Data screen.
**BUSINESS_OBJECTIVE:** Allow users to review existing item master records.
**FUNCTIONAL_DESCRIPTION:** User selects Items section and sees item list with key fields.
**TECHNICAL_SCOPE:**
- Fetch `items` from Supabase.
- Render list using Mantine `Table` (`Table.Thead`, `Table.Tbody`, `Table.Tr`, `Table.Th`, `Table.Td`) with project-level sorting/filtering/pagination patterns.
- Include loading and error states with Mantine `Loader` and notifications.
**DEPENDENCIES:** US_MDS_001, `items` table.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN items exist THEN system displays item code, description, and unit.
- AC_002: WHEN fetch is in progress THEN loading indicator is visible.
- AC_003: WHEN fetch fails THEN error notification is shown.
**ERROR_SCENARIOS:** Network failure, permission denied.
**SECURITY_CONSIDERATIONS:** RLS governs visibility of item rows.
**AUDIT_REQUIREMENTS:** None for read-only access.
**RLS_IMPACT:** Query execution must remain RLS-compliant.

### US_MDS_005
**ID:** US_MDS_005
**TITLE:** Create Item from Master Data
**STATUS:** Completed
**ACTOR:** Admin, Store
**PRECONDITION:** User has permission to add item records.
**BUSINESS_OBJECTIVE:** Capture item master records directly from the UI.
**FUNCTIONAL_DESCRIPTION:** User clicks Add Item, fills form, submits, and sees the new record in the list.
**TECHNICAL_SCOPE:**
- Add Mantine `Modal` + `TextInput` form for item fields (`item_code`, `description`, `unit`).
- Validate required fields client-side before submit.
- Insert into `items` via Supabase and refresh table data.
**DEPENDENCIES:** US_MDS_004.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN user submits valid data THEN system creates item record.
- AC_002: WHEN required fields are missing THEN inline validation errors are shown.
- AC_003: WHEN create succeeds THEN success notification is shown and list refreshes.
- AC_004: WHEN item code is duplicate THEN system shows a duplicate-code error.
**ERROR_SCENARIOS:** Validation failure, duplicate item code, DB error.
**SECURITY_CONSIDERATIONS:** Create action available only to allowed roles.
**AUDIT_REQUIREMENTS:** If item auditing is later enabled, insert actions must be logged.
**RLS_IMPACT:** Insert/update behavior must be compatible with existing policies.

### US_MDS_006
**ID:** US_MDS_006
**TITLE:** View Standards and Parameters in Master Data
**STATUS:** Completed
**ACTOR:** Admin, QA, Store
**PRECONDITION:** User is on Master Data screen.
**BUSINESS_OBJECTIVE:** Allow users to review quality standards and their linked parameters.
**FUNCTIONAL_DESCRIPTION:** User selects Standards section and sees standard records with nested/expandable parameters.
**TECHNICAL_SCOPE:**
- Fetch `standards` and related `standard_parameters` from Supabase.
- Render standards list with parameter details using Mantine components (`Table`, `Accordion`, or equivalent current pattern).
- Include loading and error states with Mantine `Loader` and notifications.
**DEPENDENCIES:** US_MDS_001, `standards`, `standard_parameters` tables.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN standards exist THEN system displays standard name and description.
- AC_002: WHEN a standard has parameters THEN system displays linked parameter name, category, unit, and min/max values.
- AC_003: WHEN fetch fails THEN error notification is shown.
**ERROR_SCENARIOS:** Network failure, permission denied.
**SECURITY_CONSIDERATIONS:** RLS governs visibility of standards and parameter rows.
**AUDIT_REQUIREMENTS:** None for read-only access.
**RLS_IMPACT:** Query execution must remain RLS-compliant.

### US_MDS_007
**ID:** US_MDS_007
**TITLE:** Create Standard and Parameter from Master Data
**STATUS:** Completed
**ACTOR:** Admin, QA
**PRECONDITION:** User has permission to manage standards.
**BUSINESS_OBJECTIVE:** Capture quality standards and associated parameters from the UI.
**FUNCTIONAL_DESCRIPTION:** User creates a Standard and adds one or more Parameters. Newly created entities are visible in standards list.
**TECHNICAL_SCOPE:**
- Add Mantine `Modal` forms for standard and parameter creation.
- Validate required and numeric range fields client-side before submit.
- Insert into `standards` and `standard_parameters` via Supabase and refresh table data.
**DEPENDENCIES:** US_MDS_006.
**ACCEPTANCE_CRITERIA:**
- AC_001: WHEN user submits valid standard data THEN system creates standard record.
- AC_002: WHEN user submits valid parameter data THEN system creates parameter linked to selected standard.
- AC_003: WHEN min value > max value THEN system shows validation error.
- AC_004: WHEN create succeeds THEN success notification is shown and list refreshes.
**ERROR_SCENARIOS:** Validation failure, duplicate standard name, DB error.
**SECURITY_CONSIDERATIONS:** Write actions available only to allowed roles.
**AUDIT_REQUIREMENTS:** If standards auditing is later enabled, create/update actions must be logged.
**RLS_IMPACT:** Insert/update behavior must be compatible with existing policies.
