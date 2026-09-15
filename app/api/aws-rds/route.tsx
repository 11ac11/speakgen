"use server";

import { NextResponse } from "next/server";
import { Pool } from "pg";

const RDS_PORT = parseInt(process.env.RDS_PORT!);
const RDS_HOSTNAME = process.env.RDS_HOSTNAME!;
const RDS_DATABASE = process.env.RDS_DATABASE!;
const RDS_USERNAME = process.env.RDS_USERNAME!;
const RDS_DB_PASSWORD = process.env.RDS_DB_PASSWORD!;

const pool = new Pool({
  password: RDS_DB_PASSWORD,
  user: RDS_USERNAME,
  host: RDS_HOSTNAME,
  database: RDS_DATABASE,
  port: RDS_PORT,
  ssl: {
    rejectUnauthorized: false // Use true for production with a valid certificate
  }
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
      created_at: row.created_at.toISOString() // Convert Date object to string
    }));

    console.log("Serialized results:", plainRows);
    // cloned so can be accessed by client-side components
    // const cloned = structuredClone(rows);
    // return cloned;
    return NextResponse.json(rows); // Correctly wraps the data in a Response object.
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
