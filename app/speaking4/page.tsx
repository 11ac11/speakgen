import React from "react";
import { getUsers } from "../../services/userService";

export default async function SpeakingFour() {
  const users = await getUsers();

  return (
    <>
      <>Question 4</>
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
