chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "showModal") {
        const { missingFields } = request;
        const container = document.getElementById("fieldsContainer");

        missingFields.forEach(({ label }) => {
            const fieldDiv = document.createElement("div");
            fieldDiv.innerHTML = `
          <label>${label}</label>
          <input type="text" data-label="${label}">
        `;
            container.appendChild(fieldDiv);
        });

        document.getElementById("submitBtn").addEventListener("click", () => {
            const filledFields = Array.from(container.querySelectorAll("input")).map(input => ({
                label: input.getAttribute("data-label"),
                answer: input.value
            }));
            sendResponse(filledFields);
            window.close();
        });
    }
});
