export default {
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

        // Split response into individual paragraphs
        const paragraphs = response.response
            .split("\n\n")
            .map(p => p.trim())
            .filter(p => p.length > 50);

        // Store each paragraph in D1
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
