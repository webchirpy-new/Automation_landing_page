/**
 * Site configuration. Every value that needs client approval or a real backend
 * lives here. Placeholders are deliberately `null` so the UI renders an honest
 * "pending" state instead of a broken or invented link.
 *
 * Set values through environment variables (only VITE_* variables are exposed to the browser)
 * — see .env.example.
 */
const env = (key) => {
  const v = import.meta.env[key]
  return v && v.trim() ? v.trim() : null
}

export const siteConfig = {
  // Booking form: POST JSON here. When null, the form runs in labelled demo mode
  // and never claims a booking was made.
  formEndpoint: env("VITE_FORM_ENDPOINT"),

  // Contact — DOCX ships PLACEHOLDER_PHONE / PLACEHOLDER_WHATSAPP_NUMBER.
  phone: env("VITE_CONTACT_PHONE"), // e.g. "+91 98xxxxxxx"
  whatsapp: env("VITE_CONTACT_WHATSAPP"), // digits only, e.g. "9198xxxxxxxx"

  // Video embeds (YouTube/Vimeo embed URLs). No video is faked when null.
  founderVideoUrl: env("VITE_FOUNDER_VIDEO_URL"),
  testimonialVideoUrl: env("VITE_TESTIMONIAL_VIDEO_URL"),

  // Legal pages — never point to invented policies.
  privacyUrl: env("VITE_PRIVACY_URL"),
  termsUrl: env("VITE_TERMS_URL"),

  // Feature flags
  enableExitPopup: env("VITE_ENABLE_EXIT_POPUP") !== "false",
  // The DOCX hero "Source:" line describes an unrelated YRE project, not the
  // 7x / 60x / 23% figures. Hidden until the client confirms wording.
  showHeroSourceLine: env("VITE_SHOW_HERO_SOURCE_LINE") === "true",
}

export const whatsappHref = (text = "") =>
  siteConfig.whatsapp
    ? `https://wa.me/${siteConfig.whatsapp.replace(/\D/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`
    : null

export const phoneHref = () =>
  siteConfig.phone ? `tel:${siteConfig.phone.replace(/[^\d+]/g, "")}` : null
