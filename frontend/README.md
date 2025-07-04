This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## June 2025: Major UI & Integration Improvements

### 1. Backend API Integration (No More 404s!)
- All `/api/*` requests from the Next.js frontend are now automatically proxied to the backend server (port 4000) during development.
- This is handled via a rewrite rule in `next.config.js`, so you do not need to change any fetch URLs in your code.
- **How it works:**
  - In development, requests like `/api/users/verify-recipient` go straight to the backend, not the Next.js server.
  - No more 404 errors for backend API calls!

### 2. Maximum Readability: Pure Black Text
- All primary and secondary text in tables, cards, headers, and forms now uses pure black (`#000`) for the highest possible contrast.
- All Tailwind classes like `text-gray-800`, `text-gray-900`, etc., have been replaced with `text-black` in major UI components.
- The CSS variable `--foreground` is also set to pure black in `globals.css`.

### 3. Font and Sizing Best Practices
- The app uses a consistent, readable font stack. (Consider switching to Inter or another modern sans-serif for an even more polished look.)
- Font sizes and weights are applied consistently using Tailwind classes:
  - Dashboard/page titles: `text-2xl`/`text-3xl` + `font-bold`
  - Section headings: `text-xl` + `font-semibold`
  - Table headers: `text-base`/`text-sm` + `font-bold`
  - Body text: `text-base`
  - Captions/hints: `text-sm` or `text-xs`
- Line heights and spacing use Tailwind defaults for clear vertical rhythm.

### 4. How to Maintain or Extend
- Use `text-black` for all new text elements/components.
- For new backend endpoints, no need to change fetch URLs—just use `/api/your-endpoint` and the proxy will handle it.
- For further typography improvements, consider adding the Inter font via Google Fonts and updating your Tailwind config.
- Always use Tailwind classes for font size/weight instead of inline styles.

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Security Checklist & Plan

### Smart Contract Security
- [ ] Schedule a full external smart contract audit before mainnet or major upgrades.
- [ ] Review for reentrancy, overflow/underflow, and access control vulnerabilities.
- [ ] Ensure all payout/release functions use checks-effects-interactions pattern.
- [ ] Emit events for all state-changing actions.
- [ ] Remove or secure any test or admin backdoors.
- [ ] Document all upgradeability and admin key logic.

### Backend Security
- [ ] Enforce JWT or session authentication for all sensitive endpoints.
- [ ] Role-based access control for admin and dispute actions.
- [ ] Validate and sanitize all user input (including file uploads).
- [ ] Log all critical actions (dispute, payout, refund, admin changes) with timestamp and user.
- [ ] Restrict manual/retroactive scripts to admin users only.
- [ ] Secure evidence file storage (scan for malware, restrict file types).
- [ ] Monitor for double-spend/double-payout conditions.

### Frontend Security
- [ ] Never expose private keys or sensitive config in the client.
- [ ] Use HTTPS and secure cookies for all sessions.
- [ ] Validate file uploads and user inputs before sending to backend.
- [ ] Hide admin and dispute actions from unauthorized users.

### General Security Plan
1. **Audit**: Schedule and complete a smart contract audit. Review all critical backend and admin scripts.
2. **Penetration Testing**: Perform regular pentests against both frontend and backend.
3. **Monitoring**: Enable logging and alerting for all payout/dispute/admin actions.
4. **Incident Response**: Document a process for responding to and rolling back from security incidents.
5. **Continuous Review**: Revisit this checklist before every major release.
