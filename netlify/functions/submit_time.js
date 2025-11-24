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

        const player_name   = body.player_name;
        const level         = Number(body.level);
        const time_seconds  = Number(body.time_seconds);

        if (!player_name || isNaN(level) || isNaN(time_seconds)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing or invalid fields", received: body })
            };
        }

        const client = await pool.connect();

        await client.query(
            "INSERT INTO leaderboard (player_name, level, time_seconds) VALUES ($1, $2, $3)",
            [player_name, level, time_seconds]
        );

        const rankQuery = await client.query(
            "SELECT COUNT(*) AS better FROM leaderboard WHERE level = $1 AND time_seconds < $2",
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


