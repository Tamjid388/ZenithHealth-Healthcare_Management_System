This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Structure

```
client/
├── public/                          # Static assets
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (commonLayout)/          # Public pages layout
│   │   │   ├── (auth)/              # Authentication pages
│   │   │   │   ├── forgot-password/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── reset-password/
│   │   │   │   └── verify-email/
│   │   │   ├── consultation/        # Consultation pages
│   │   │   │   └── doctor/[id]/
│   │   │   ├── diagnostics/         # Diagnostics page
│   │   │   ├── health-plans/        # Health plans page
│   │   │   ├── medicines/           # Medicines page
│   │   │   ├── ngos/                # NGOs page
│   │   │   └── layout.tsx
│   │   ├── (dashboardLayout)/       # Dashboard pages layout
│   │   │   ├── (commonProtectedLayout)/  # Shared protected routes
│   │   │   │   ├── change-password/
│   │   │   │   ├── my-profile/
│   │   │   │   └── layout.tsx
│   │   │   ├── (patientRouteGroup)/ # Patient-specific routes
│   │   │   │   ├── (patientDashboardLayout)/
│   │   │   │   │   ├── (dashboard)/
│   │   │   │   │   │   └── dashboard/
│   │   │   │   │   │       ├── admin-management/
│   │   │   │   │   │       ├── book-appointments/
│   │   │   │   │   │       ├── doctor-management/
│   │   │   │   │   │       ├── health-records/
│   │   │   │   │   │       ├── my-appointments/
│   │   │   │   │   │       ├── my-prescriptions/
│   │   │   │   │   │       ├── patient-management/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   └── layout.tsx
│   │   │   │   └── payment/
│   │   │   │       └── success/
│   │   │   ├── admin/               # Admin dashboard
│   │   │   │   └── dashboard/
│   │   │   └── doctor/              # Doctor dashboard
│   │   │       └── dashboard/
│   │   ├── error.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx               # Root layout
│   │   ├── loading.tsx
│   │   └── not-found.tsx
│   ├── components/                  # Reusable components
│   │   ├── index.ts
│   │   └── ui/                      # UI components (shadcn/ui)
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── avatar.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── field.tsx
│   │       ├── input-otp.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── popover.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── skeleton.tsx
│   │       ├── sonner.tsx
│   │       ├── spinner.tsx
│   │       ├── table.tsx
│   │       └── textarea.tsx
│   └── lib/                         # Utility libraries
│       ├── axios/
│       │   └── httpClient.ts        # Axios HTTP client configuration
│       └── utils.ts
├── .dockerignore
├── .gitignore
├── components.json                  # shadcn/ui config
├── Dockerfile
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
