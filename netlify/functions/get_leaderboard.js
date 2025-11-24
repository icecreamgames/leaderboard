const { Client } = require("pg");

exports.handler = async (event, context) => {
    const client = new Client({
        connectionString: process.env.NETLIFY_DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Return ALL levels
        const result = await client.query(
            "SELECT player_name, level, time_seconds FROM leaderboard ORDER BY time_seconds ASC"
        );

        await client.end();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result.rows)
        };
    }
    catch (err) {
        console.error("DB ERROR:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Database failure" })
        };
    }
};
