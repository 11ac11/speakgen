import React from "react";
import QuestionContainer from "../../components/QuestionContainer";
import ConnectionTest from "./connectionTest";
import { part4data } from "../../dataPart4";

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

// Directly call the API in the server component
export default async function SpeakingFour() {
  try {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/aws-rds`); // Adjust URL if necessary
    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }
    const result = await res.json(); // Parse the response to JSON
    console.log("Fetched Data:", result);

    return (
      <>
        <ConnectionTest />
        <QuestionContainer questions={part4data} />
        <div>
          <h2>Fetched Data:</h2>
          {result.map((item: any) => (
            <div key={item.id}>
              <p>{item.statement}</p>
              <p>Created At: {item.created_at}</p>
            </div>
          ))}
        </div>
      </>
    );
  } catch (error: any) {
    return <p>Error: {error.message}</p>; // Handle any error during the fetch
  }
}
