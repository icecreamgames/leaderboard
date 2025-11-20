const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

exports.handler = async () => {
    try {
        const client = await pool.connect();

        const rows = await client.query(`
            SELECT player_name, time_seconds
            FROM scores
            WHERE level = 1
            ORDER BY time_seconds ASC
            LIMIT 20
        `);

        client.release();

        return { statusCode: 200, body: JSON.stringify(rows.rows) };

    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
