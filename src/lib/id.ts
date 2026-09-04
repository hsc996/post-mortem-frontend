/** Local-only id generator for mock/demo records — no server round-trip to derive one from. */
export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
