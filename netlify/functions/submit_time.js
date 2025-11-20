export default async (request, context) => {
    try {
        const body = await request.json();

        const player_name = body.player_name;
        const level = body.level;
        const time_seconds = body.time_seconds;

        if (!player_name || !level || !time_seconds) {
            return new Response(JSON.stringify({
                error: "Missing fields",
                received: body
            }), { status: 400 });
        }

        const API_URL = "https://ep-ancient-base-aeg8qrqg.apirest.c-2.us-east-2.aws.neon.tech/neondb/rest/v1";
        const API_KEY = process.env.NEON_API_KEY;  // YOU MUST SET THIS IN NETLIFY

        // 1. Insert score
        const insertRes = await fetch(`${API_URL}/leaderboard`, {
            method: "POST",
            headers: {
                "apikey": API_KEY,
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            body: JSON.stringify({
                player_name,
                level,
                time_seconds
            })
        });

        if (!insertRes.ok) {
            const errText = await insertRes.text();
            return new Response(JSON.stringify({
                error: true,
                message: "Insert error",
                details: errText
            }), { status: 400 });
        }

        // 2. Fetch ranking
        const rankRes = await fetch(
            `${API_URL}/rpc/get_rank?player_name=${player_name}&level=${level}`,
            {
                headers: {
                    "apikey": API_KEY,
                    "Authorization": `Bearer ${API_KEY}`
                }
            }
        );

        const rankJson = await rankRes.json();

        return new Response(JSON.stringify({
            success: true,
            rank: rankJson
        }), { status: 200 });

    } catch (e) {
        return new Response(JSON.stringify({
            error: true,
            message: e.message
        }), { status: 500 });
    }
};
