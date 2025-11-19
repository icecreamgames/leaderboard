import { Client } from "pg";

export async function handler(event, context) {
    try {
        const body = JSON.parse(event.body);

        const { player_name, level, time_seconds } = body;

        const client = new Client({
            connectionString: process.env.NETLIFY_DATABASE_URL
        });

        await client.connect();

        // Insert the new score
        await client.query(
            `INSERT INTO leaderboard (player_name, level, time_seconds)
             VALUES ($1, $2, $3)`,
            [player_name, level, time_seconds]
        );

        // Get the player's rank (1 = best)
        const rankQuery = await client.query(
            `SELECT COUNT(*) + 1 AS rank
             FROM leaderboard
             WHERE level = $1 AND time_seconds < $2`,
            [level, time_seconds]
        );

        const rank = rankQuery.rows[0].rank;

        await client.end();

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                rank: rank
            })
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
}
