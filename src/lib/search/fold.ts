/**
 * Search key: lower-case with every Uzbek apostrophe form (ʻ ʼ ’ ‘ ` ') made one.
 * The copy writes oʻ/gʻ with U+02BB; a shopper types an ASCII apostrophe.
 */
export function fold(text: string): string {
  return text.toLowerCase().replace(/[ʻʼ’‘`']/g, "'");
}
