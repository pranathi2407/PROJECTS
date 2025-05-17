document.getElementById("submitBtn").addEventListener("click", async () => {
    const symptoms = document.getElementById("symptomInput").value;
    const response = await fetch("/assess", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms }),
    });
    const result = await response.json();
    document.getElementById("result").innerText = `Condition: ${result.condition}, Recommendations: ${result.recommendations}`;
});
