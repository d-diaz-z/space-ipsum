// app.js
const API_URL = "https://space-ipsum.dft1.workers.dev";

const loadingMessages = [
    "Scanning the cosmos...",
    "Aligning stellar coordinates...",
    "Translating nebula frequencies...",
    "Consulting the event horizon...",
    "Measuring parsecs of void...",
    "Calibrating dark matter sensors...",
    "Decoding pulsar transmissions..."
];

const generateBtn = document.getElementById("generate");
const copyBtn = document.getElementById("copy");
const result = document.getElementById("result");
const loading = document.getElementById("loading");
const loadingText = document.getElementById("loading-text");
const paragraphsInput = document.getElementById("paragraphs");

generateBtn.addEventListener("click", async () => {
    const paragraphs = parseInt(paragraphsInput.value) || 3;

    // Show loading
    result.innerHTML = "";
    loading.classList.remove("hidden");
    copyBtn.disabled = true;
    generateBtn.disabled = true;

    // Cycle through loading messages
    let msgIndex = 0;
    loadingText.textContent = loadingMessages[0];
    const msgInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % loadingMessages.length;
        loadingText.textContent = loadingMessages[msgIndex];
    }, 1500);

    try {
        const response = await fetch(`${API_URL}/?paragraphs=${paragraphs}`);
        const data = await response.json();

        clearInterval(msgInterval);
        loading.classList.add("hidden");
        generateBtn.disabled = false;

        if (data.error) {
            result.innerHTML = `<p style="color: #ef4444">${data.error}</p>`;
            return;
        }

        // Render paragraphs
        result.innerHTML = data.paragraphs
            .map(p => `<p>${p}</p>`)
            .join("");

        copyBtn.disabled = false;

    } catch (error) {
        clearInterval(msgInterval);
        loading.classList.add("hidden");
        generateBtn.disabled = false;
        result.innerHTML = `<p style="color: #ef4444">Failed to reach the cosmos. Try again!</p>`;
    }
});

copyBtn.addEventListener("click", () => {
    const text = Array.from(result.querySelectorAll("p"))
        .map(p => p.textContent)
        .join("\n\n");

    navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => copyBtn.textContent = "Copy", 2000);
    });
});
