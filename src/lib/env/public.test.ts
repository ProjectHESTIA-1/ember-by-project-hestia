import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "./public";

const valid = {
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
};

describe("parsePublicEnv", () => {
  it("accepts a complete configuration", () => {
    expect(parsePublicEnv(valid)).toEqual(valid);
  });

  it("names missing variables without echoing values", () => {
    expect(() => parsePublicEnv({ ...valid, NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined })).toThrow(
      /NEXT_PUBLIC_SUPABASE_ANON_KEY/,
    );
  });

  it("rejects a malformed URL", () => {
    expect(() => parsePublicEnv({ ...valid, NEXT_PUBLIC_SUPABASE_URL: "not a url" })).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL/,
    );
  });
});
