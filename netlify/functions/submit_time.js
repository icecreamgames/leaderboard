const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

exports.handler = async (event) => {
    try {
        if (event.httpMethod !== "POST") {
            return {
                statusCode: 405,
                body: JSON.stringify({ error: "Method not allowed" })
            };
        }

        // Ensure body exists
        if (!event.body || event.body.trim() === "") {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Empty request body" })
            };
        }

        let body;
        try {
            body = JSON.parse(event.body);
        } catch (err) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Invalid JSON", raw: event.body })
            };
        }

        const player_name = body.player_name;
        const level       = Number(body.level);
        let time_seconds  = parseFloat(body.time_seconds);

        // Validate input
        if (!player_name || isNaN(level) || isNaN(time_seconds)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Missing or invalid fields",
                    received: body
                })
            };
        }

        // Force float to avoid text inserts
        time_seconds = Number(time_seconds);

        const client = await pool.connect();

        // Insert properly typed data
        await client.query(
            "INSERT INTO scores (player_name, level, time_seconds) VALUES ($1, $2, $3)",
            [player_name, level, time_seconds]
        );

        // Rank calculation
        const rankQuery = await client.query(
            "SELECT COUNT(*) AS better FROM scores WHERE level = $1 AND time_seconds < $2",
            [level, time_seconds]
        );

        client.release();

        const rank = Number(rankQuery.rows[0].better) + 1;

        return {
            statusCode: 200,
            body: JSON.stringify({ rank: rank })
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};

