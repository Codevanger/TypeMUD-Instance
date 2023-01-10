// Custom stringify function to handle circular references
export function stringify<T extends object>(data: T): string {
  const cache = new Set();
  const result = JSON.stringify(data, (key, value) => {
    if (key === 'password' || key === 'gameserver') return;

    if (typeof value === "object" && value !== null) {
      if (cache.has(value)) {
        return;
      }

      cache.add(value);
    }
    return value;
  });
  cache.clear();
  return result;
}
