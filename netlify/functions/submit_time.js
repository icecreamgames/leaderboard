const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {

  // ---------- CORS ----------
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  // ---------- OPTIONS PREFLIGHT ----------
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid JSON" })
    };
  }

  const { player_name, level, time_seconds } = body;

  if (!player_name || !level || !time_seconds) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing fields" })
    };
  }

  const client = await pool.connect();

  await client.query(
    "INSERT INTO scores (player_name, level, time_seconds) VALUES ($1,$2,$3)",
    [player_name, level, time_seconds]
  );

  const rankResult = await client.query(
    "SELECT COUNT(*) FROM scores WHERE level=$1 AND time_seconds < $2",
    [level, time_seconds]
  );

  client.release();

  const rank = Number(rankResult.rows[0].count) + 1;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ rank })
  };
};

