export function sanitizeFileName(filename: string): string {
  return filename
    .normalize('NFD') // Decompõe acentos (ex: á → a + ́)
    .replace(/[\u0300-\u036f]/g, '') // Remove marcas de acento
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Substitui caracteres inválidos por "_"
    .replace(/\s+/g, '_'); // Substitui espaços por "_"
}