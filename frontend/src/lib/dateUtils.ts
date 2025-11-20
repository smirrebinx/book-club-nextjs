/**
 * Format a date string to Swedish format with capitalized weekday and lowercase month
 * Example: "2025-01-15" -> "Onsdag 15 januari 2025"
 *
 * Uses Intl.DateTimeFormat for proper localization
 */
export function formatSwedishDate(dateString: string): string {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);

    // Verify date is valid
    if (isNaN(date.getTime())) return dateString;

    // Format using Swedish locale
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const formattedDate = formatter.format(date);

    // Capitalize only the first letter (the weekday)
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}
