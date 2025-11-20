export default async (req) => {
    try {
        // Read JSON body correctly from Netlify Request
        let body = {};
        try {
            body = await req.json();
        } catch (e) {
            return new Response(
                JSON.stringify({ error: true, message: "Invalid or missing JSON body" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const name  = body.player_name || "";
        const level = body.level || 0;
        const time  = body.time_seconds || 0;

        if (name === "" || level === 0) {
            return new Response(
                JSON.stringify({ error: true, message: "Missing fields", received: body }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
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

        return new Response(
            JSON.stringify({ ok: true, neon: result }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    }
    catch (err) {
        return new Response(
            JSON.stringify({ error: true, message: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
