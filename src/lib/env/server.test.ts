import { describe, expect, it } from "vitest";
import { parseServerEnv } from "./server";

describe("parseServerEnv", () => {
  it("maps the service-role key to a neutral field name", () => {
    expect(parseServerEnv({ SUPABASE_SERVICE_ROLE_KEY: "k" })).toEqual({
      supabaseServiceRoleKey: "k",
    });
  });

  it("fails when the key is missing and does not echo any values", () => {
    expect(() => parseServerEnv({ OTHER: "visible-value" })).toThrow(
      /^Invalid server environment configuration: SUPABASE_SERVICE_ROLE_KEY$/,
    );
  });
});
