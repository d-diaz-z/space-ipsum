export default {
    async fetch(request, env) {
        return new Response("Space Ipsum API coming soon!", {
            headers: { "Content-Type": "text/plain" }
        });
    }
};
