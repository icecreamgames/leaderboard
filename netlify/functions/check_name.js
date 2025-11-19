export default async (req) => {
    const body = JSON.parse(req.body);
    const name = body.player_name;

    const url = process.env.NETLIFY_DATABASE_URL;
    const key = process.env.NEON_API_KEY;

    const sql = `
        SELECT COUNT(*) AS taken
        FROM players
        WHERE name = '${name}';
    `;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + key
        },
        body: JSON.stringify({ sql })
    });

    const data = await response.json();

    return {
        statusCode: 200,
        body: JSON.stringify(data[0])
    };
};
