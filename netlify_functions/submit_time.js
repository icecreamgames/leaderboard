const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

exports.handler = async (event, context) => {
    try {
        if (event.httpMethod !== "POST") {
            return { statusCode: 405, body: "Method not allowed" };
        }

        const body = JSON.parse(event.body);

        const player_name = body.player_name;
        const level = body.level;
        const time_seconds = body.time_seconds;

        if (!player_name || !level || !time_seconds) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing fields" }) };
        }

        const client = await pool.connect();

        const insert = await client.query(
            "INSERT INTO scores (player_name, level, time_seconds) VALUES ($1, $2, $3) RETURNING id",
            [player_name, level, time_seconds]
        );

        const rankResult = await client.query(`
            SELECT COUNT(*) AS better
            FROM scores
            WHERE level = $1 AND time_seconds < $2
        `, [level, time_seconds]);

        client.release();

        const rank = Number(rankResult.rows[0].better) + 1;

        return { statusCode: 200, body: JSON.stringify({ status: "ok", rank }) };

    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};