# OpSuite Deployment Guide

This guide describes how to deploy the OpSuite ERP application to production.
Follow these steps carefully. No technical coding skills are required, but you will need to copy and paste some text.

## Prerequisites

Before starting, ensure you have accounts on the following platforms:

1.  **GitHub**: [Sign up here](https://github.com/join) (to host the code).
2.  **Supabase**: [Sign up here](https://supabase.com/dashboard/sign-up) (for the database).
3.  **Vercel**: [Sign up here](https://vercel.com/signup) (to host the application).

---

## Step 1: Database Setup (Supabase)

1.  **Create a New Project**:
    *   Log in to your Supabase Dashboard.
    *   Click **"New Project"**.
    *   Select your Organization.
    *   Enter a **Name** (e.g., "OpSuite").
    *   Set a strong **Database Password** (save this securely).
    *   Select a **Region** close to your users.
    *   Click **"Create new project"**.

2.  **Set Up Database Schema**:
    *   Wait for the project to finish setting up (it takes a few minutes).
    *   On the left sidebar, click the **SQL Editor** icon (looks like a terminal ).
    *   Click **"New query"**.
    *   Open the file named `database_schema.sql` located in this repository.
    *   Copy the **entire content** of `database_schema.sql`.
    *   Paste it into the Supabase SQL Editor.
    *   Click **"Run"** (bottom right).
    *   Ensure you see "Success" in the results area.

3.  **Configure Authentication**:
    *   On the left sidebar, click the **Authentication** icon (looks like a user group).
    *   Go to **Providers** -> **Email**.
    *   (Optional) Disable "Confirm email" if you want to log in immediately without email verification for testing. For production, keep it enabled and configure SMTP settings.
    *   Click **"Save"**.

4.  **Get API Keys**:
    *   On the left sidebar, click the **Settings** icon (gear).
    *   Click **"API"**.
    *   Find the **Project URL** and copy it.
    *   Find the **Project API keys** section.
    *   Copy the `anon` **public** key.
    *   Copy the `service_role` **secret** key (reveal it first). **Keep this secret!**

---

## Step 2: Codebase Setup (GitHub)

1.  If you haven't already, **Fork** or **Clone** this repository to your own GitHub account.
    *   If you received this code as a zip file, create a new repository on GitHub and upload the files.

---

## Step 3: Deployment (Vercel)

1.  **Import Project**:
    *   Log in to your Vercel Dashboard.
    *   Click **"Add New..."** -> **"Project"**.
    *   Select **"Continue with GitHub"**.
    *   Find your **OpSuite** repository and click **"Import"**.

2.  **Configure Project**:
    *   **Framework Preset**: Select **Next.js**.
    *   **Root Directory**: Leave as `./` (default).

3.  **Environment Variables**:
    *   Expand the **"Environment Variables"** section.
    *   Add the following variables using the values you copied from Supabase in Step 1.4:

    | Name | Value |
    | :--- | :--- |
    | `NEXT_PUBLIC_SUPABASE_URL` | Your **Project URL** |
    | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your **anon public** key |
    | `SUPABASE_SERVICE_ROLE_KEY` | Your **service_role secret** key |

4.  **Deploy**:
    *   Click **"Deploy"**.
    *   Wait for the build to complete.
    *   Once finished, you will see a "Congratulations!" screen with a screenshot of your app.
    *   Click the screenshot to visit your live application.

---

## Step 4: Initial Configuration (Creating the First User)

Since the system enforces Role-Based Access Control (RBAC), you cannot do anything until you create a Plant and an Admin User.

1.  **Sign Up**:
    *   Go to your deployed application URL.
    *   Sign up with an email (e.g., `admin@example.com`) and password.
    *   You might see a "Permission Denied" or empty dashboard because you have no role yet.

2.  **Assign Admin Role**:
    *   Go back to **Supabase Dashboard** -> **SQL Editor**.
    *   Click **"New query"**.
    *   Copy and paste the following SQL script to create your first Plant and assign the Admin role to your user.
    *   **Replace** `'admin@example.com'` with the email you just used to sign up.

    ```sql
    -- 1. Create a Plant (if not exists)
    INSERT INTO plants (name, location)
    VALUES ('Main Plant', 'Headquarters')
    ON CONFLICT (name) DO NOTHING;

    -- 2. Assign Admin Role
    DO $$
    DECLARE
        target_email TEXT := 'admin@example.com'; -- CHANGE THIS
        user_uid UUID;
        plant_uuid UUID;
        role_uuid UUID;
    BEGIN
        -- Get User ID from Auth
        SELECT id INTO user_uid FROM auth.users WHERE email = target_email;

        -- Get Plant ID
        SELECT id INTO plant_uuid FROM plants WHERE name = 'Main Plant';

        -- Get Admin Role ID
        SELECT id INTO role_uuid FROM roles WHERE name = 'admin';

        -- Insert User Record (Profile)
        INSERT INTO public.users (id, email, full_name, is_active)
        VALUES (user_uid, target_email, 'System Admin', true)
        ON CONFLICT (id) DO UPDATE SET is_active = true;

        -- Assign Role
        IF user_uid IS NOT NULL AND plant_uuid IS NOT NULL AND role_uuid IS NOT NULL THEN
            INSERT INTO user_roles (user_id, role_id, plant_id)
            VALUES (user_uid, role_uuid, plant_uuid)
            ON CONFLICT (user_id, role_id, plant_id) DO NOTHING;

            RAISE NOTICE 'Admin role assigned to %', target_email;
        ELSE
            RAISE EXCEPTION 'User, Plant, or Role not found. Check email.';
        END IF;
    END $$;
    ```

3.  **Run** the query.
4.  **Refresh** your application page. You should now have full access.

---

## Support

For issues, please check the deployment logs in Vercel or the database logs in Supabase.

---

## Local Development

1.  **Clone the Repository**:
    ```bash
    git clone <your-repo-url>
    cd opsuite
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env.local` file in the root directory.

4.  **Run Development Server**:
    ```bash
    npm run  dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

5.  **Run Tests**:
    ```bash
    npm test
    ```

---

## User Manual

### Login
- Navigate to `/login`.
- Enter your email and password.

### Dashboard
- View summary cards and sidebar navigation.


---

## Implemented Features

### Master Data
- **Customers**: Manage customer records.
- **Items**: Manage item catalog.
- **Standards**: Define quality standards and parameters.

### Procurement & Production
- **Purchase Orders (PO)**: Create and manage POs.
- **Work Orders (WO)**: Create WOs linked to POs and Items.
- **Heat Registry**: Register raw material heats and allocate to WOs.

### Quality Control
- **Lab Results**: Enter quality data against defined standards. Auto-validation (Pass/Fail). Override capability for QA.
- **Test Certificates (TC)**: Generate and issue TCs for passed/overridden WOs.

### Inventory & Admin
- **Movements**: View audit trail of inventory allocation.
- **User Management**: Assign Roles and Plants to users.

## Testing
- Run integration tests: `npm test`
