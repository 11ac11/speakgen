// getPartOneQuestions was removed: it fetched "api/questions/partone/", a route
// that has never existed, and nothing called it.

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
      throw new Error(`Failed to create question: ${response.statusText}`);
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
      throw new Error(`Failed to update question: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
}
