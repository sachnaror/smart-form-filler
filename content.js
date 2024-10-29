const apiKey = "YOUR_OPENAI_API_KEY";
let cache = {};

// Load cache from storage if available
chrome.storage.local.get("formCache", (result) => {
    cache = result.formCache || {};
});

// Load stored question-answer data
fetch(chrome.runtime.getURL("storage.txt"))
    .then(response => response.json())
    .then(async data => {
        const formElements = document.querySelectorAll("input, textarea, select");
        const labels = Array.from(formElements)
            .map(el => el.labels?.[0]?.textContent?.trim() || el.placeholder?.trim())
            .filter(label => label);

        // Check cache first
        const unmatchedLabels = [];
        labels.forEach(label => {
            if (cache[label]) {
                // Set cached value
                const el = document.querySelector(`[placeholder='${label}']`);
                if (el) el.value = cache[label];
            } else {
                unmatchedLabels.push(label);
            }
        });

        // Query OpenAI for unmatched labels
        if (unmatchedLabels.length > 0) {
            const matches = await getBestMatches(unmatchedLabels, data);
            matches.forEach(({ label, answer }) => {
                cache[label] = answer;
                const el = document.querySelector(`[placeholder='${label}']`);
                if (el) el.value = answer;
            });
            chrome.storage.local.set({ formCache: cache });
        }

        // Trigger the modal for confirmation
        showConfirmationModal();
    })
    .catch(error => console.error("Error loading data:", error));

// Batch process OpenAI matching
async function getBestMatches(labels, data) {
    const questions = Object.keys(data);
    const prompt = `For each of these labels: ${labels.join(", ")}, match with one of these questions: ${questions.join(", ")}. Respond with pairs of label-question matches.`;

    const response = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            prompt: prompt,
            max_tokens: 150,
            n: 1,
            stop: null,
            temperature: 0
        })
    });

    const completion = await response.json();
    return parseMatches(completion.choices[0].text.trim(), data);
}

function parseMatches(responseText, data) {
    const matchPairs = [];
    const pairs = responseText.split("\n");
    pairs.forEach(pair => {
        const [label, matchedQuestion] = pair.split(":").map(item => item.trim());
        if (data[matchedQuestion]) {
            matchPairs.push({ label, answer: data[matchedQuestion] });
        }
    });
    return matchPairs;
}

// Function to show confirmation modal
function showConfirmationModal() {
    const modal = document.createElement("div");
    modal.id = "formFillModal";
    modal.innerHTML = `
    <div class="modal-content">
      <p>Form filled successfully!</p>
      <button id="closeModal">Close</button>
    </div>
  `;
    document.body.appendChild(modal);

    document.getElementById("closeModal").addEventListener("click", () => {
        modal.remove();
    });
}
