const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

exports.handler = async () => {
    try {
        const client = await pool.connect();

        const query = `
            SELECT player_name, level, time_seconds
            FROM scores
            ORDER BY level ASC, time_seconds ASC
        `;

        const result = await client.query(query);

        client.release();

        return {
            statusCode: 200,
            body: JSON.stringify(result.rows)
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
