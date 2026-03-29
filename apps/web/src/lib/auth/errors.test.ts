import { describe, expect, it } from "vitest";

import { getFriendlyAuthError } from "./errors";

describe("getFriendlyAuthError", () => {
  it("maps cognito and next-auth errors into friendly copy", () => {
    expect(getFriendlyAuthError("UserNotConfirmedException")).toContain(
      "verified",
    );
    expect(getFriendlyAuthError("OAuthAccountNotLinked")).toContain(
      "different sign-in method",
    );
    expect(getFriendlyAuthError("unknown-code")).toContain(
      "Sign-in couldn't be completed",
    );
  });
});
