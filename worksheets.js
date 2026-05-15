document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const printBtn = document.getElementById('printBtn');
    const loadingMsg = document.getElementById('loadingMsg');
    const worksheetPage = document.getElementById('worksheetPage');
    const answerKeyPage = document.getElementById('answerKeyPage');
    const problemsContainer = document.getElementById('problemsContainer');
    const answersContainer = document.getElementById('answersContainer');
    const wsTitle = document.getElementById('wsTitle');

    generateBtn.addEventListener('click', async () => {
        const concept = document.getElementById('wsConcept').value || 'Algebra';
        const difficulty = document.getElementById('wsDifficulty').value;

        generateBtn.disabled = true;
        loadingMsg.style.display = 'block';
        printBtn.style.display = 'none';
        worksheetPage.style.display = 'none';
        answerKeyPage.style.display = 'none';

        try {
            const res = await fetch('/api/worksheet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ concept, difficulty })
            });

            const data = await res.json();
            
            if (data.problems && data.problems.length > 0) {
                // Populate Problems
                problemsContainer.innerHTML = '';
                answersContainer.innerHTML = '';
                wsTitle.innerText = `Topic: ${concept.charAt(0).toUpperCase() + concept.slice(1)} (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`;

                data.problems.forEach((prob, index) => {
                    // Question HTML
                    const qDiv = document.createElement('div');
                    qDiv.className = 'problem-item';
                    qDiv.innerHTML = `<strong>${index + 1}.</strong> ${prob.question}<br><br><br><br>`; // Space for student to write
                    problemsContainer.appendChild(qDiv);

                    // Answer HTML
                    const aDiv = document.createElement('div');
                    aDiv.className = 'problem-item';
                    aDiv.style.marginBottom = '20px';
                    aDiv.innerHTML = `<strong>${index + 1}.</strong> ${prob.answer}`;
                    answersContainer.appendChild(aDiv);
                });

                worksheetPage.style.display = 'block';
                answerKeyPage.style.display = 'block';
                printBtn.style.display = 'inline-block';
            } else {
                alert("Failed to generate worksheet. Please try again.");
            }

        } catch (e) {
            console.error(e);
            alert("Error communicating with the server.");
        } finally {
            generateBtn.disabled = false;
            loadingMsg.style.display = 'none';
        }
    });

    printBtn.addEventListener('click', () => {
        window.print();
    });
});
