export function sanitizeOriginalFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\s_.\-()]/g, '')   // Remove invalid characters
    .replace(/\s+/g, ' ')                   // Replace multiple spaces with a single space
    .trim();                                // Trim whitespace from both ends
}

export function sanitizeFileName(filename: string): string {
  return filename
    .normalize('NFD')                  // Decompose accents (e.g., á → a + ´)
    .replace(/[\u0300-\u036f]/g, '')   // Remove accent marks
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // Replace invalid chars with "_"
    .replace(/\s+/g, '_');             // Replace spaces with "_"
}