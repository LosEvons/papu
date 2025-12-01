/**
 * Utility functions for formatting data.
 */

/**
 * Formats an ISO timestamp string to a localized date/time string.
 * Returns empty string if input is undefined or empty.
 *
 * @param iso - Optional ISO 8601 timestamp string
 * @returns Formatted date string or empty string
 */
export function formatDate(iso?: string): string {
  if (!iso) {
    return '';
  }
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleString();
  } catch {
    return '';
  }
}
