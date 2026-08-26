// The measurement id the gtag.js snippet in components/layout/ga-script.tsx is
// configured with. Undefined off a deploy without the variable, which is what
// keeps the script from loading at all.
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;
