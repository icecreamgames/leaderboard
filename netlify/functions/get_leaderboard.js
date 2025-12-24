const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {

  // -------------------------
  // CORS HEADERS (REQUIRED)
  // -------------------------
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  };

  // -------------------------
  // PREFLIGHT (HTML5 BROWSERS)
  // -------------------------
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  // -------------------------
  // ONLY ALLOW GET
  // -------------------------
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const client = await pool.connect();

    // -------------------------
    // RETURN *ALL* SCORES
    // -------------------------
    const result = await client.query(`
      SELECT 
        player_name,
        level,
        time_seconds
      FROM scores
    `);

    client.release();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.rows)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
