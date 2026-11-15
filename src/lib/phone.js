/**
 * Indian mobile number (Launch Kit 02 Form A): +91 is fixed, so a typed "+91" / "91" prefix,
 * spaces and a leading 0 are removed; what remains must be 10 digits starting 6–9.
 * Returns the 10 digits, or null when the number is not valid.
 */
export function normaliseIndianMobile(raw) {
  let d = String(raw || "").replace(/\D/g, "")
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2)
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1)
  return /^[6-9]\d{9}$/.test(d) ? d : null
}
