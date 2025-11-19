import { Client } from "pg";

export async function handler(event, context) {
    try {
        const body = JSON.parse(event.body);
        const { player_name } = body;

        const client = new Client({
            connectionString: process.env.NETLIFY_DATABASE_URL
        });

        await client.connect();

        const result = await client.query(
            "SELECT COUNT(*) AS n FROM leaderboard WHERE player_name = $1",
            [player_name]
        );

        await client.end();

        return {
            statusCode: 200,
            body: JSON.stringify({
                exists: Number(result.rows[0].n) > 0
            })
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
}
