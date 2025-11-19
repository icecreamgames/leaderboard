export default async (req, context) => {
    try {
        let body = await req.text();
        let data = JSON.parse(body);

        let player_name = data.player_name;

        if (!player_name) {
            return new Response(JSON.stringify({ error: "Missing name" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const sql = `
            SELECT COUNT(*) AS count
            FROM leaderboard
            WHERE player_name = '${player_name}';
        `;

        let response = await fetch("https://YOUR-NEON-URL.neon.tech/sql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + process.env.NEON_API_KEY
            },
            body: JSON.stringify({ sql })
        });

        let res_json = await response.json();
        let exists = parseInt(res_json[0].count) > 0;

        return new Response(JSON.stringify({ available: !exists }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.toString() }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
