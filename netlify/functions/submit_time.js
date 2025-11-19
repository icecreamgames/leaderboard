export default async (req) => {
    let body = {};

    try {
        if (req.body) {
            body = JSON.parse(req.body);
        }
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid JSON" })
        };
    }

    const name = body.player_name || "";
    const level = body.level || 0;
    const time = body.time_seconds || 0;

    if (name === "" || level === 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing fields", body })
        };
    }

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
