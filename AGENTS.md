# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js 14 + TypeScript application with Supabase integration.

- `app/`: App Router pages and layouts (for example `app/dashboard/*`, `app/login/page.tsx`).
- `utils/supabase/`: Supabase client/server helpers used by UI routes.
- `public/`: Static assets served directly.
- `database_schema.sql`: Full database schema, RLS policies, triggers, and seed data.
- `vitest.config.ts`, `vitest.setup.ts`: Test runner and setup.
- `README.md`: Deployment and environment setup instructions.

Keep new domain pages under `app/dashboard/<feature>/page.tsx` unless they are truly global routes.

## Coding Style & Naming Conventions
- Language: TypeScript + React function components.
- Indentation: 2 spaces; keep imports grouped and minimal.
- Components/pages: `PascalCase` component names; route folders use kebab-case (for example `work-orders`).
- Utilities: descriptive camelCase function names.
- Prefer small, focused files; avoid introducing new patterns when existing ones work.

## Testing Guidelines
- Framework: Vitest with Testing Library (`@testing-library/react`, `jsdom`).
- Test files: `*.test.tsx` or `*.test.ts` colocated with related code (example: `app/page.test.tsx`).
- Cover critical flows: auth, routing behavior, and dashboard rendering states.
- Add or update tests for any user-visible behavior change.

## Security & Configuration Tips
- Never commit secrets. Use environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- Treat `service_role` as server-only and confidential.
- Apply SQL changes carefully in Supabase; verify RLS-related edits before production rollout.

## Agent Workflow Constraints
- Do not commit to git from Codex. The user handles all commits and pushes manually.
- Do not run local scripts/commands (for example `npm run dev`, `npm test`, `npm run build`) unless the user explicitly asks for it.
- Do not edit files until the user gives explicit approval for the requested edit.
