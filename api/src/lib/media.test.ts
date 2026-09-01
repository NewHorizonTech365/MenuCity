import { describe, expect, it } from "vitest";
import { matchesImageSignature, readBodyWithinLimit } from "./media";

const buffer = (...bytes: number[]) => new Uint8Array(bytes).buffer;

describe("matchesImageSignature", () => {
  it("accepte les signatures JPEG, PNG et WebP", () => {
    expect(matchesImageSignature("image/jpeg", buffer(0xff, 0xd8, 0xff, 0x00))).toBe(true);
    expect(matchesImageSignature("image/png", buffer(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe(true);
    expect(matchesImageSignature("image/webp", buffer(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50))).toBe(true);
  });

  it("refuse un fichier déguisé avec un Content-Type image", () => {
    expect(matchesImageSignature("image/jpeg", buffer(0x3c, 0x68, 0x74, 0x6d, 0x6c))).toBe(false);
  });
});

describe("readBodyWithinLimit", () => {
  const stream = (...chunks: number[][]) =>
    new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(new Uint8Array(chunk));
        controller.close();
      },
    });

  it("assemble un corps valide sous la limite", async () => {
    const body = await readBodyWithinLimit(stream([1, 2], [3, 4]), 4);
    expect(body && Array.from(new Uint8Array(body))).toEqual([1, 2, 3, 4]);
  });

  it("interrompt un corps qui dépasse la limite", async () => {
    await expect(readBodyWithinLimit(stream([1, 2, 3], [4, 5]), 4)).resolves.toBeNull();
  });
});
