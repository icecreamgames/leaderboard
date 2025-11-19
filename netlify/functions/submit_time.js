export default async (req) => {
    try {
        // make sure body exists
        let body = {};
        if (req.body) body = JSON.parse(req.body);

        const name  = body.player_name || "";
        const level = body.level || 0;
        const time  = body.time_seconds || 0;

        if (name === "" || level === 0) {
            return new Response(
                JSON.stringify({ error: "Missing fields", received: body }),
                { status: 400, headers: { "Content-Type": "application/json" }}
            );
        }

        const url = process.env.NETLIFY_DATABASE_URL;
        const key = process.env.NEON_API_KEY;

        // SQL query
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

        // send SQL to Neon
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + key
            },
            body: JSON.stringify({ sql })
        });

        // Neon database response
        let result = await response.json();

        return new Response(
            JSON.stringify({ ok: true, neon: result }),
            { status: 200, headers: { "Content-Type": "application/json" }}
        );
    }

    catch (err) {
        // THIS ALWAYS RETURNS JSON even if the function crashes
        return new Response(
            JSON.stringify({ error: true, message: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" }}
        );
    }
};
