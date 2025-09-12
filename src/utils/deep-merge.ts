export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const out: any = Array.isArray(target) ? [...target] : { ...target };
  for (const [key, val] of Object.entries(source ?? {})) {
    if (
      val && typeof val === 'object' &&
      !Array.isArray(val) &&
      typeof out[key] === 'object' &&
      out[key] !== null &&
      !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(out[key], val as any);
    } else {
      out[key] = val;
    }
  }
  return out;
}