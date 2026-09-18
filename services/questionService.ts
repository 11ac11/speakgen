// getPartOneQuestions was removed: it fetched "api/questions/partone/", a route
// that has never existed, and nothing called it.

/**
 * The API answers a refusal with { error: "..." } saying what is wrong. Using
 * statusText instead threw that away and left the form with "Bad Request",
 * which tells a teacher nothing about which field to fix.
 */
async function messageFor(response: Response, fallback: string) {
  try {
    const body = await response.json();
    if (typeof body?.error === "string" && body.error) return body.error;
  } catch {
    // No JSON body: fall through to the generic message.
  }
  return fallback;
}

/** A random question for a level and part. */
export async function getRandomQuestion(level: string, part: string) {
  try {
    const response = await fetch(
      `/api/questions?level=${encodeURIComponent(
        level.toLowerCase()
      )}&part=${encodeURIComponent(part)}&random=true`
    );
    if (!response.ok) throw new Error("Failed to fetch question");
    return await response.json();
  } catch (error) {
    console.error("Error fetching question:", error);
    return null;
  }
}

// Level and part travel in the body: the collection route is /api/questions,
// so that an item route can be keyed on the id alone.
export async function createQuestion(
  level: string,
  part: string,
  payload: any
) {
  try {
    const response = await fetch(`/api/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ...payload, level: level.toLowerCase(), part })
    });

    if (!response.ok) {
      throw new Error(
        await messageFor(response, "Could not save the question")
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
}

/** A question id is unique on its own, so no level or part is needed. */
export async function updateQuestion(id: string | number, payload: any) {
  try {
    const response = await fetch(`/api/questions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(
        await messageFor(response, "Could not save the question")
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
}
