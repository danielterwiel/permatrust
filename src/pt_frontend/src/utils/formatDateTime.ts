export function formatDateTime(date: bigint) {
  const d = new Date(Number(date) / 1_000_000);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}
