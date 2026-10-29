import { trusted } from "./automationContent"

/**
 * Approved client logos. Files are named 1.png–13.png in the order of
 * `trusted.clients` (the supplied brand pack's numbering), so a higher-resolution
 * replacement can be dropped in under the same name.
 */
const logos = import.meta.glob("../assets/brands/*.png", { eager: true, import: "default" })

export const brands = trusted.clients.map((name, i) => ({ name, logo: logos[`../assets/brands/${i + 1}.png`] }))
