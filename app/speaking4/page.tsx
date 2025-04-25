import React from "react";
import QuestionContainer from "@/app/components/QuestionContainer";
// import ConnectionTest from "./ConnectionTest";
import { part4data } from "../../dataPart4";
import { getUsers } from "../../services/userService";

export default async function SpeakingFour() {
  const users = await getUsers();

  return (
    <>
      {/* <ConnectionTest /> */}
      <QuestionContainer questions={part4data} />
      <div>
        <h2>Fetched Data:</h2>
        {users.length > 0 ? (
          users.map((user: any) => (
            <div key={user.email}>
              <p>{user.email}</p>
            </div>
          ))
        ) : (
          <p>No users found</p>
        )}
      </div>
    </>
  );
}
