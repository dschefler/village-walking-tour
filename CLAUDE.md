# Village Walking Tour — Claude Code Notes

## CRITICAL: Two parallel page structures — always edit the right one

Southampton users (`southamptonwalkingtour.com`) hit the **public routes**, not the tenant routes.

| Page | URL users see | File to edit |
|---|---|---|
| Home | `/` | `src/app/(public)/page.tsx` |
| Create Your Tour | `/create-your-tour` | `src/app/(public)/create-your-tour/page.tsx` |
| Tour | `/tour/:id` → redirects → `/t/southampton/tour/:id` | `src/app/t/[orgSlug]/tour/[tourId]/page.tsx` |
| Location | `/location/:id` → redirects → `/t/southampton/location/:id` | `src/app/t/[orgSlug]/location/[locationId]/page.tsx` |

**The `/tour/:id` and `/location/:id` routes have permanent redirects to the tenant routes.**
**`/create-your-tour` does NOT redirect — it stays on the public route.**

When making changes to how the Southampton walking tour looks or behaves, always check which route the user actually accesses. If the public and tenant versions both exist, changes may need to be applied to **both**.

## Deployment

- Git push to `main` → auto-deploys to Vercel → updates `southamptonwalkingtour.com`
- No manual alias needed (vercel.json has the alias)
- Code changes reach users on next page load (NetworkFirst caching for JS)
