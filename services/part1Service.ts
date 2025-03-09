export async function getPartOneQuestions() {
  try {
    const response = await fetch("http://localhost:3000/api/questions/");
    return response;
  } catch (error) {
    console.error("Database query failed:", error);
    return [];
  }
}

export async function getRandomPartOneQuestion() {
  try {
    const response = await fetch("http://localhost:3000/api/questions/random");
    console.log("response:", response);
    if (!response.ok) throw new Error("Failed to fetch question");
    return await response.json();
  } catch (error) {
    console.error("Error fetching question:", error);
    return null;
  }
}
