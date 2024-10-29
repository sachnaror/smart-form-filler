const apiKey = "YOUR_OPENAI_API_KEY";
let cache = {};

// Load cache from local storage
chrome.storage.local.get("formCache", (result) => {
    cache = result.formCache || {};
});

// Fetch stored question-answer data from server
fetch("http://localhost:3000/data")
    .then(response => response.json())
    .then(async data => {
        const formElements = document.querySelectorAll("input, textarea, select");
        const labels = Array.from(formElements)
            .map(el => el.labels?.[0]?.textContent?.trim() || el.placeholder?.trim())
            .filter(label => label);

        const missingFields = [];

        // Try to fill form fields with server data or cache
        for (const label of labels) {
            let answer = cache[label] || data[label];
            if (!answer) {
                // If no exact match, use OpenAI for approximate match
                answer = await getBestMatch(label, data);
            }
            if (answer) {
                const el = document.querySelector(`[placeholder='${label}']`);
                if (el) el.value = answer;
            } else {
                // Collect any fields that are still missing data
                missingFields.push({ label, element: el });
            }
        }

        // Show modal for any missing fields
        if (missingFields.length > 0) {
            showMissingFieldsModal(missingFields, data);
        }
    })
    .catch(error => console.error("Error loading data:", error));

// Function to get the best match from OpenAI
async function getBestMatch(labelText, data) {
    const questions = Object.keys(data);
    const prompt = `Match this label: "${labelText}" to one of these questions: ${questions.join(", ")}. Respond with the closest match.`;

    const response = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            prompt: prompt,
            max_tokens: 50,
            n: 1,
            stop: null,
            temperature: 0
        })
    });

    const completion = await response.json();
    const matchedQuestion = completion.choices[0].text.trim();
    return data[matchedQuestion] || null;
}

// Show modal for missing fields
function showMissingFieldsModal(missingFields, data) {
    chrome.runtime.sendMessage({ type: "showModal", missingFields }, response => {
        if (response) {
            const newEntries = {};
            response.forEach(({ label, answer }) => {
                data[label] = answer;
                cache[label] = answer;
                newEntries[label] = answer;
            });
            chrome.storage.local.set({ formCache: cache });
            updateServerData(newEntries);
        }
    });
}

// Update server data
function updateServerData(newData) {
    fetch("http://localhost:3000/data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newData)
    }).catch(error => console.error("Error updating server data:", error));
}
