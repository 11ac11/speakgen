"use server";

import { Pool } from "pg";
import { awsCredentialsProvider } from "@vercel/functions/oidc";
import { Signer } from "@aws-sdk/rds-signer";

const RDS_PORT = parseInt(process.env.RDS_PORT!);
const RDS_HOSTNAME = process.env.RDS_HOSTNAME!;
const RDS_DATABASE = process.env.RDS_DATABASE!;
const RDS_USERNAME = process.env.RDS_USERNAME!;
const AWS_REGION = process.env.AWS_REGION!;
const AWS_ROLE_ARN = process.env.AWS_ROLE_ARN!;
const RDS_DB_PASSWORD = process.env.RDS_DB_PASSWORD!;

const signer = new Signer({
  credentials: awsCredentialsProvider({
    roleArn: AWS_ROLE_ARN,
  }),
  region: AWS_REGION,
  port: RDS_PORT,
  hostname: RDS_HOSTNAME,
  username: RDS_USERNAME,
});

const pool = new Pool({
  password: RDS_DB_PASSWORD,
  user: RDS_USERNAME,
  host: RDS_HOSTNAME,
  database: RDS_DATABASE,
  port: RDS_PORT,
  ssl: {
    rejectUnauthorized: false, // Use true for production with a valid certificate
  },
});

export async function GET() {
  try {
    console.log("Attempting to connect to the database...");
    const client = await pool.connect();

    console.log("Running query...");
    const { rows } = await client.query("SELECT * FROM testtable");

    console.log("Query results:", rows);

    client.release();

    // Ensure plain JSON serialization
    const plainRows = rows.map((row) => ({
      id: row.id,
      statement: row.statement,
      created_at: row.created_at.toISOString(), // Convert Date object to string
    }));

    console.log("Serialized results:", plainRows);
    // cloned so can be accessed by client-side components
    const cloned = structuredClone(rows);
    return cloned;
  } catch {}
}
