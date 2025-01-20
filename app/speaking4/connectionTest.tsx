"use client";

import { useState } from "react";
import { Button } from "../../components/ui/";
import { GET } from "../api/aws-rds/route";

export default function RDSConnectionTester() {
  const [connectionResult, setConnectionResult] = useState<
    | string
    | {
        success: boolean;
        message: string;
        timestamp?: string;
      }
    | null
  >(null);

  const handleTestConnection = async () => {
    console.log("hitting:");
    const result = await GET();
    console.log("result:", result);
    // setConnectionResult();
  };

  return (
    <div>
      <h2>RDS Connection Test</h2>
      <Button
        onClick={() => handleTestConnection()}
        text="Test"
        isAsync={true}
      />

      {/* {connectionResult && (
        <div>
          <p>{connectionResult.message}</p>
          {connectionResult.timestamp && (
            <p>Current Database Time: {connectionResult.timestamp}</p>
          )}
        </div>
      )} */}
    </div>
  );
}
