export async function getPartOneQuestions() {
  try {
    const response = await fetch("api/questions/partone/");
    return response;
  } catch (error) {
    console.error("Database query failed:", error);
    return [];
  }
}

export async function getRandomPartOneQuestion() {
  try {
    const response = await fetch("api/questions/1?random=true");
    if (!response.ok) throw new Error("Failed to fetch question");
    return await response.json();
  } catch (error) {
    console.error("Error fetching question:", error);
    return null;
  }
}

export async function createQuestion(part: string, payload: any) {
  try {
    const response = await fetch(`/api/questions/${part}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
