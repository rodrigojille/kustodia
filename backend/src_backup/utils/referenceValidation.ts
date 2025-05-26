// Utility for validating payment references for banking compliance
// Only allows alphanumeric and spaces (no special characters)

export function isValidReference(reference: string): boolean {
  // Allows letters, numbers, and spaces only
  return /^[A-Za-z0-9 ]+$/.test(reference);
}

export function sanitizeReference(reference: string): string {
  // Remove all non-alphanumeric and non-space characters
  return reference.replace(/[^A-Za-z0-9 ]/g, '');
}
