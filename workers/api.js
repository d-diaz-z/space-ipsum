export default {
    // Handles HTTP requests from the frontend
    async fetch(request, env) {
        const corsHeaders = {
            "Access-Control-Allow-Origin": "https://space-ipsum.pages.dev",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Content-Type": "application/json"
        };

        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            const url = new URL(request.url);
            const paragraphs = Math.min(
                parseInt(url.searchParams.get("paragraphs") || "3"),
                10
            );

            const result = await env.DB.prepare(`
                SELECT content FROM ipsum
                ORDER BY RANDOM()
                LIMIT ?
            `).bind(paragraphs).all();

            if (!result.results || result.results.length === 0) {
                return new Response(JSON.stringify({
                    error: "No ipsum generated yet. Check back soon!",
                    paragraphs: []
                }), { headers: corsHeaders });
            }

            return new Response(JSON.stringify({
                paragraphs: result.results.map(row => row.content)
            }), { headers: corsHeaders });

        } catch (error) {
            return new Response(JSON.stringify({
                error: "Something went wrong.",
                details: error.message
            }), {
                status: 500,
                headers: corsHeaders
            });
        }
    },

    // Handles cron trigger — runs nightly at 2am UTC
    async scheduled(event, env, ctx) {
        ctx.waitUntil(generateIpsum(env));
    }
};

async function generateIpsum(env) {
    const prompt = `Generate 10 paragraphs of space ipsum placeholder text.
    Each paragraph should be 3-5 sentences long.
    Use space and astronomy terminology, concepts, and imagery.
    The text does not need to make scientific sense — it just needs to sound space-like.
    Mix terms like: nebula, pulsar, singularity, event horizon, dark matter,
    quasar, neutron star, cosmic ray, interstellar, perihelion, aphelion,
    redshift, supernova, asteroid, comet, ecliptic, parsec, lightyear.
    Return ONLY the paragraphs, no numbering, no titles, no explanations.
    Separate each paragraph with a blank line.`;

    try {
        const response = await env.AI.run(
            "@cf/meta/llama-3.1-8b-instruct", {
                messages: [{
                    role: "user",
                    content: prompt
                }],
                max_tokens: 1024
            }
        );

        const paragraphs = response.response
            .split("\n\n")
            .map(p => p.trim())
            .filter(p => p.length > 50);

        for (const paragraph of paragraphs) {
            await env.DB.prepare(`
                INSERT INTO ipsum (content, paragraphs)
                VALUES (?, ?)
            `).bind(paragraph, 1).run();
        }

        console.log(`Generated and stored ${paragraphs.length} ipsum paragraphs`);

    } catch (error) {
        console.error("Error generating ipsum:", error.message);
    }
}
