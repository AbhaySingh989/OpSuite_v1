# User Stories

**Note to Developers/Agents**:
- All UI components MUST be from Mantine UI (v7+).
- Use `UI_STANDARDS.md` for styling guidelines.
- Use **Context07** MCP for best practices when implementing libraries.
- All database interactions must use `utils/supabase/server.ts` (Server Components/Actions) or `utils/supabase/client.ts` (Client Components).
- RLS policies are strictly enforced. Ensure `plant_id` is handled correctly in all write operations.

---

## Epic 1: Master Data Management

### US_MD_001
**ID:** US_MD_001
**TITLE:** Manage Customer Records
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

### US_PO_001
**ID:** US_PO_001
**TITLE:** Create Purchase Order
**ACTOR:** Store Manager
**PRECONDITION:** User is logged in. Customers exist.
**BUSINESS_OBJECTIVE:** Initiate purchase of materials.
**FUNCTIONAL_DESCRIPTION:** User creates a PO header.
**TECHNICAL_SCOPE:**
- **UI**: `/po/page.tsx` (List), `/po/create/page.tsx` (Form).
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
1. Navigate to `/po`.
2. Click Create.
3. Select Customer "Test Customer".
4. Enter PO "PO-1001", Date "Today".
5. Save. Verify redirection to PO List.

### US_WO_001
**ID:** US_WO_001
**TITLE:** Create Work Order from PO
**ACTOR:** Store Manager, Admin
**PRECONDITION:** PO exists. Items exist.
**BUSINESS_OBJECTIVE:** Plan production against a PO.
**FUNCTIONAL_DESCRIPTION:** User selects a PO, selects an Item, enters Quantity and WO Number.
**TECHNICAL_SCOPE:**
- **UI**: `/work-orders/page.tsx`.
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
1. Navigate to `/work-orders`.
2. Click Create.
3. Select PO "PO-1001".
4. Select Item "ITEM-001".
5. Enter WO "WO-2001", Qty 100.
6. Save. Verify in list.

### US_HEAT_001
**ID:** US_HEAT_001
**TITLE:** Register Heat & Allocate
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
**ACTOR:** QA
**PRECONDITION:** WO status 'lab_pending' (or 'in_production'). Standard assigned to Item (Implicit or Explicit? *Requirement implies Item has Standard, let's assume mapping exists or selected during Lab Entry*).
**BUSINESS_OBJECTIVE:** Record quality parameters.
**FUNCTIONAL_DESCRIPTION:** QA selects WO. System fetches parameters from Standard. QA enters Observed Values.
**TECHNICAL_SCOPE:**
- **UI**: `/lab-results/page.tsx`.
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
1. Navigate to `/lab-results`.
2. Select "WO-2001".
3. Select Standard "STD-TEST".
4. Enter Carbon: 0.3 (Pass), Hardness: 250 (Fail).
5. Submit.
6. Verify Result Status is "Pending" (overall) or "Failed" (due to hardness).

### US_LAB_002
**ID:** US_LAB_002
**TITLE:** Override Failed Result
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
