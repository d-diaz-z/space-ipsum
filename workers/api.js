export default {
    async fetch(request, env) {
        // CORS headers so Pages frontend can call this Worker
        const corsHeaders = {
            "Access-Control-Allow-Origin": "https://space-ipsum.pages.dev",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Content-Type": "application/json"
        };

        // Handle preflight
        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            // Get paragraphs param, default 3, max 10
            const url = new URL(request.url);
            const paragraphs = Math.min(
                parseInt(url.searchParams.get("paragraphs") || "3"),
                10
            );

            // Query D1 for random ipsum rows
            const result = await env.DB.prepare(`
                SELECT content FROM ipsum
                ORDER BY RANDOM()
                LIMIT ?
            `).bind(paragraphs).all();

            // If D1 is empty return a friendly message
            if (!result.results || result.results.length === 0) {
                return new Response(JSON.stringify({
                    error: "No ipsum generated yet. Check back soon!",
                    paragraphs: []
                }), { headers: corsHeaders });
            }

            // Return ipsum paragraphs
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
    }
};
