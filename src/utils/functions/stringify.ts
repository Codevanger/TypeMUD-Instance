const forbiddenKeys = ["password", "gameserver", "context", "map"];
export function stringify<T extends object>(data: T): string {
  const result = JSON.stringify(data, (key, value) => {
    if (forbiddenKeys.includes(key)) return;
    return value;
  });
  return result;
}
