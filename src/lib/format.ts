/**
 * Formats a `YYYY-MM-DD` column as "Mon YYYY".
 *
 * Parsed and formatted in UTC deliberately. A bare `new Date("2023-01-01")` is
 * midnight UTC, so rendering it in a timezone behind UTC would show December
 * 2022 — an off-by-one-month bug that only appears for some readers.
 */
function monthYear(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Renders an employment range, e.g. "Jan 2023 — Present".
 *
 * "Present" is derived from `end_date` being null, not from comparing against
 * today. That matters: these components are statically prerendered, so anything
 * computed from the current date would be frozen at build time (see the footer
 * year in KB/decision-log.md, 2026-08-08). Durations like "3 years" are avoided
 * here for the same reason.
 */
export function formatDateRange(start: string, end: string | null): string {
  return `${monthYear(start)} — ${end ? monthYear(end) : "Present"}`;
}
