export const decodeUint8Array = (data: number[] | Uint8Array | undefined) => {
  if (!data) return '';
  const decoder = new TextDecoder();
  const preDecoded = Array.isArray(data) ? new Uint8Array(data) : data;
  const decoded = decoder.decode(preDecoded);
  return decoded;
};
