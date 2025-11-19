export default async (req) => {
    const body = JSON.parse(req.body);

    const name = body.player_name;
    const level = body.level;
    const time = body.time_seconds;

    const url = process.env.NETLIFY_DATABASE_URL;
    const key = process.env.NEON_API_KEY;

    const sql = `
        INSERT INTO leaderboard (player_name, level, time_seconds)
        VALUES ('${name}', ${level}, ${time})
        RETURNING (
            SELECT COUNT(*)
            FROM leaderboard
            WHERE level = ${level}
              AND time_seconds < ${time}
        ) + 1 AS rank;
    `;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + key
        },
        body: JSON.stringify({ sql })
    });

    const result = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify(result[0])
    };
};
