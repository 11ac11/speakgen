/**
 * Signs up a throwaway user and returns its id and session cookie.
 *
 * Retries, because signup occasionally comes back without a user when several
 * suites run in quick succession. Every suite used to read `.user.id` straight
 * off the response, so one hiccup killed the run with a TypeError and no
 * indication of which check had failed or why.
 */
export async function signUpTestUser(base, prefix, attempts = 3) {
  let lastBody = "";

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const email = `${prefix}+${Date.now()}_${attempt}@example.com`;
    const res = await fetch(`${base}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password: "TestPassw0rd!23",
        name: "Test User"
      })
    });

    lastBody = await res.text();

    let parsed;
    try {
      parsed = JSON.parse(lastBody);
    } catch {
      parsed = null;
    }

    if (res.ok && parsed?.user?.id) {
      return {
        userId: parsed.user.id,
        // An invitation is tied to an address, so callers need the real one.
        email,
        cookie: res.headers
          .getSetCookie()
          .map((c) => c.split(";")[0])
          .join("; ")
      };
    }

    if (attempt < attempts)
      await new Promise((r) => setTimeout(r, 400 * attempt));
  }

  throw new Error(
    `Could not sign up a test user after ${attempts} attempts: ${lastBody.slice(0, 200)}`
  );
}
