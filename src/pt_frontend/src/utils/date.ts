export function formatDateTime(date: bigint) {
  const d = new Date(Number(date) / 1000000);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}
