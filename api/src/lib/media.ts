const startsWith = (bytes: Uint8Array, expected: number[], offset = 0) =>
  expected.every((value, index) => bytes[index + offset] === value);

export const matchesImageSignature = (contentType: string, body: ArrayBuffer) => {
  const bytes = new Uint8Array(body);
  if (contentType === "image/jpeg") return startsWith(bytes, [0xff, 0xd8, 0xff]);
  if (contentType === "image/png") return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (contentType === "image/webp") {
    return startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8);
  }
  return false;
};

export const readBodyWithinLimit = async (stream: ReadableStream<Uint8Array> | null, maxBytes: number) => {
  if (!stream) return new ArrayBuffer(0);

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel("upload_too_large").catch(() => undefined);
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body.buffer;
};
