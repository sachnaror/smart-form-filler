const apiKey = "YOUR_OPENAI_API_KEY";
let cache = {};

// Load cache from storage if available
chrome.storage.local.get("formCache", (result) => {
    cache = result.formCache || {};
});

// Load stored question-answer data from JSON
fetch(chrome.runtime.getURL("storage.txt"))
    .then(response => response.json())
    .then(async data => {
        const formElements = document.querySelectorAll("input, textarea, select");
        const labels = Array.from(formElements)
            .map(el => el.labels?.[0]?.textContent?.trim() || el.placeholder?.trim())
            .filter(label => label);

        const missingFields = [];

        // Attempt to fill form fields using cache or OpenAI matching
        for (const label of labels) {
            let answer = cache[label] || data[label];
            if (!answer) {
                answer = await getBestMatch(label, data);
            }
            if (answer) {
                const el = document.querySelector(`[placeholder='${label}']`);
                if (el) el.value = answer;
            } else {
                missingFields.push({ label, element: el });
            }
        }

        // Prompt user for missing fields
        if (missingFields.length > 0) {
            getUserInputsForMissingFields(missingFields, data);
        }
    })
    .catch(error => console.error("Error loading data:", error));

// Fetch the best match for a given label using OpenAI
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

// Function to handle missing fields and save new data
function getUserInputsForMissingFields(missingFields, data) {
    missingFields.forEach(field => {
        const { label, element } = field;
        const userAnswer = prompt(`Please enter the answer for "${label}":`);
        if (userAnswer) {
            element.value = userAnswer;
            data[label] = userAnswer;
            cache[label] = userAnswer;

            // Save to chrome storage and update storage.txt for future use
            chrome.storage.local.set({ formCache: cache });
            saveToJSONFile(data);
        }
    });
}

// Save updated data to JSON
function saveToJSONFile(data) {
    const fileData = JSON.stringify(data, null, 2);
    const blob = new Blob([fileData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'storage.txt';
    a.click();
    URL.revokeObjectURL(url);
}
