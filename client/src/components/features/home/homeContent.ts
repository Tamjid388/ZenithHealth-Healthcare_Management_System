export const HERO_IMAGE = {
  src: "/images/hero-care.jpg",
  alt: "Clinician reviewing care details with a patient",
} as const;

export const heroContent = {
  eyebrow: "Care coordination",
  title: "Zenith Health",
  headline: "Care that stays organized from visit to follow-up.",
  body: "Book consultations, manage records, and keep every next step visible in one calm place.",
  primary: { href: "/consultation", label: "Book a consultation" },
  secondary: { href: "/register", label: "Create account" },
} as const;

export const featuresContent = {
  title: "Built for calmer follow-through",
  subtitle:
    "The same trail from the first visit to the next prescription, test, and plan.",
  items: [
    {
      key: "visits",
      title: "Visits that stay in order",
      description:
        "See who you are seeing, why it matters, and what comes after—without switching tools.",
    },
    {
      key: "records",
      title: "Records in one trail",
      description:
        "Appointments, medicines, and diagnostics sit together so nothing gets buried between visits.",
    },
    {
      key: "nextSteps",
      title: "Next steps in view",
      description:
        "Follow-up stays visible early, so care does not stall once the appointment ends.",
    },
    {
      key: "community",
      title: "Support beyond the clinic",
      description:
        "Health plans and community partners stay on the same path as the rest of your care.",
    },
  ],
} as const;

export const consultationFeature = {
  eyebrow: "Primary care path",
  title: "Start with a consultation",
  body: "Find a clinician, review how they practice, and keep that visit connected to medicines, tests, and plans.",
  bullets: [
    "Browse clinicians with clear profiles and specialties",
    "Keep visit context with the rest of your care trail",
    "Move on to medicines, diagnostics, or a plan without starting over",
  ],
  cta: { href: "/consultation", label: "Find a clinician" },
} as const;

export type ServiceTileVariant = "photo" | "foam" | "deep";

export const servicesContent = {
  title: "Everything in one care path",
  subtitle:
    "Move between appointments, medicines, diagnostics, and support without losing context.",
  tiles: [
    {
      href: "/consultation",
      title: "Consultation",
      description: "Find doctors and schedule visits with clear availability.",
      variant: "photo" as const,
      layout: "md:col-span-4 md:row-span-2",
      objectPosition: "object-[center_30%]",
    },
    {
      href: "/medicines",
      title: "Medicines",
      description: "Review prescriptions and keep treatment details close.",
      variant: "foam" as const,
      layout: "md:col-span-2",
    },
    {
      href: "/diagnostics",
      title: "Diagnostics",
      description: "Track tests and results without hunting through files.",
      variant: "deep" as const,
      layout: "md:col-span-2",
    },
    {
      href: "/health-plans",
      title: "Health Plans",
      description: "Choose coverage options that match your care needs.",
      variant: "photo" as const,
      layout: "md:col-span-3",
      objectPosition: "object-[70%_40%]",
    },
    {
      href: "/ngos",
      title: "NGOs",
      description: "Discover community partners supporting accessible care.",
      variant: "foam" as const,
      layout: "md:col-span-3",
    },
  ],
};

export const statsContent = {
  items: [
    { value: "5", label: "Care areas in one place" },
    { value: "3", label: "Steps from need to follow-through" },
    { value: "1", label: "Trail for visits, meds, and tests" },
    { value: "24/7", label: "Access to your care path" },
  ],
} as const;

export const pathContent = {
  title: "A quieter way through care",
  subtitle: "Three simple moves. No dashboards before you need them.",
  steps: [
    {
      number: "01",
      title: "Tell us what you need",
      description:
        "Start with a consultation, test, medicine refill, or plan.",
    },
    {
      number: "02",
      title: "Keep records together",
      description:
        "Appointments, results, and prescriptions stay in one trail.",
    },
    {
      number: "03",
      title: "Follow through clearly",
      description:
        "See next steps early so care never stalls between visits.",
    },
  ],
} as const;

export const ctaContent = {
  hoursTitle: "When you can reach care",
  hoursBody:
    "Your records stay available whenever you need them. Clinician visits follow the hours posted on each profile.",
  hours: [
    { label: "Weekdays", value: "Clinician hours on each profile" },
    { label: "Weekends", value: "Records and follow-up stay open" },
    { label: "After hours", value: "Keep notes and next steps visible" },
  ],
  panelEyebrow: "Ready when you are",
  panelTitle: "Start with a visit or create your account",
  panelBody:
    "Consultation is the front door. An account keeps medicines, diagnostics, and plans on the same trail.",
  primary: { href: "/consultation", label: "Book a consultation" },
  secondary: { href: "/register", label: "Create account" },
} as const;
