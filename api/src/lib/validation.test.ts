import { describe, expect, it } from "vitest";
import { invitationCreateSchema, profilePatchSchema, restaurantWriteSchema, uploadScopeSchema } from "../contracts";

describe("API contracts", () => {
  it("normalizes invitation emails", () => {
    const value = invitationCreateSchema.parse({
      restaurantId: "00000000-0000-4000-8000-000000000001",
      inviteeEmail: "  AMI@EXAMPLE.COM ",
      inviteeName: "Ami",
      proposedAt: "2026-08-26T18:00:00+02:00",
    });
    expect(value.inviteeEmail).toBe("ami@example.com");
  });

  it("rejects a rating above five", () => {
    const result = restaurantWriteSchema.safeParse({
      slug: "test",
      name: "Restaurant test",
      cuisine: "Locale",
      address: "Lubumbashi",
      averageRating: 5.1,
    });
    expect(result.success).toBe(false);
  });

  it("only accepts known upload scopes", () => {
    expect(uploadScopeSchema.safeParse("restaurant-photo").success).toBe(true);
    expect(uploadScopeSchema.safeParse("arbitrary").success).toBe(false);
  });

  it("rejects role changes from the profile DTO", () => {
    expect(profilePatchSchema.safeParse({ role: "admin" }).success).toBe(false);
  });
});
