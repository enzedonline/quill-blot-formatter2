type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

function isPlainObject(value: unknown): value is Record<PropertyKey, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function mergeOptions<T extends object>(defaults: T, options: DeepPartial<T>): T {
  const merged: Record<PropertyKey, unknown> = {};
  for (const source of [defaults, options]) {
    const values = source as Record<PropertyKey, unknown>;
    for (const key of Reflect.ownKeys(values)) {
      if (!Object.prototype.propertyIsEnumerable.call(values, key) ||
        key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      const value = values[key];
      const previous = merged[key];
      merged[key] = isPlainObject(value)
        ? mergeOptions(isPlainObject(previous) ? previous : {}, value)
        : value;
    }
  }
  return merged as T;
}
