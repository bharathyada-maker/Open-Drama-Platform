# Contributing to OpenDrama

Welcome to OpenDrama! We are excited to collaborate with open-source contributors to expand this vertical streaming social platform.

## 1. Code Quality Guidelines
- **TypeScript Type Safety:** Ensure all component bindings conform to our schema definitions in `apps/web/src/types/schema.ts`. Avoid any `any` declarations.
- **Tailwind Design System:** Use preset CSS variables in `index.css` (e.g. `--color-accent-rose`, `--color-bg-dark`) to match the dark cinematic styling. Avoid injecting inline colors.
- **Component Separation:** Keep components focused and reusable. Avoid building giant, unified blocks.

## 2. Test Verification Steps
Before opening pull requests or pushing changes:
1. Verify the compilation build succeeds without warnings:
   ```bash
   cd apps/web
   npm run build
   ```
2. Run the automated diagnostics check:
   - Log in as the test profile `alex_rivera`
   - Navigate to the **Profile** page -> **Developer Tests** tab
   - Click **Run Diagnostics** and verify that all assertions pass.
