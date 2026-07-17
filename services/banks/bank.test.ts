import assert from "node:assert/strict";
import test from "node:test";
// Node's built-in TypeScript runner requires explicit file extensions.
// @ts-ignore -- TypeScript's bundler resolution intentionally disallows this.
import { fetchBankCodes } from "./bank.ts";

test("fetchBankCodes requests the versioned endpoint and returns the bank array", async () => {
  const originalFetch = globalThis.fetch;
  const banks = [{ code: "044", name: "Access Bank" }];
  process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test";

  globalThis.fetch = async (input) => {
    assert.equal(input, "https://api.example.test/v1/payment/banks");
    return new Response(
      JSON.stringify({ status: true, message: "Successful", data: banks }),
      { status: 200 },
    );
  };

  try {
    assert.deepEqual(await fetchBankCodes(), banks);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
