// getPartOneQuestions was removed: it fetched "api/questions/partone/", a route
// that has never existed, and nothing called it.

/**
 * A random question for a level and part.
 *
 * This used to request "api/questions/1?random=true", which is missing the
 * level, so it matched no route and always returned the 404 page. The API is
 * /api/questions/[level]/[part], and the path needs a leading slash or it
 * resolves relative to whatever page is open.
 */
export async function getRandomQuestion(level: string, part: string) {
  try {
    const response = await fetch(
      `/api/questions/${level.toLowerCase()}/${part}?random=true`
    );
    if (!response.ok) throw new Error("Failed to fetch question");
    return await response.json();
  } catch (error) {
    console.error("Error fetching question:", error);
    return null;
  }
}

export async function createQuestion(
  level: string,
  part: string,
  payload: any
) {
  try {
    const response = await fetch(
      `/api/questions/${level.toLowerCase()}/${part}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    console.log("response:", response);

    if (!response.ok) {
      throw new Error(`Failed to create question: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating question:", error);
    throw error;
  }
}

export async function updateQuestion(
  level: string,
  part: string,
  id: string,
  payload: any
) {
  try {
    const response = await fetch(
      `/api/questions/${level.toLowerCase()}/${part}/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update question: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating question:", error);
    throw error;
  }
}
