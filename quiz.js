const SUPABASE_URL = 'https://erxeomniqcgbxkmbsjud.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyeGVvbW5pcWNnYnhrbWJzanVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzIyNTYsImV4cCI6MjA5MjcwODI1Nn0.NVS9lVhgftygPTse3L60_v9b0IDjsEyFy13m6MBSKBg';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentQuiz = null;
let userSession = null;
let currentBounties = 0;

document.addEventListener('DOMContentLoaded', async () => {
    // Check auth
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        alert("Please log in to earn Bounties!");
        window.location.href = 'index.html';
        return;
    }
    userSession = session;

    // Try fetching existing bounties
    try {
        const { data } = await supabaseClient.from('user_profiles').select('bounties').eq('id', userSession.user.id).single();
        if (data && data.bounties) {
            currentBounties = data.bounties;
        }
    } catch (e) {
        console.warn("Bounties column might not exist yet.");
    }
    
    document.getElementById('bountyCount').innerText = `Bounties: ${currentBounties}`;
    
    document.getElementById('nextBtn').addEventListener('click', loadQuiz);
    document.getElementById('quizLang').addEventListener('change', loadQuiz);

    loadQuiz();
});

async function loadQuiz() {
    document.getElementById('questionText').innerText = "Generating AI Math Quiz...";
    document.getElementById('optionsContainer').innerHTML = "";
    document.getElementById('explanation').style.display = "none";
    document.getElementById('nextBtn').style.display = "none";

    const lang = document.getElementById('quizLang').value;

    try {
        const res = await fetch('/api/quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ difficulty: 'medium', concept: 'algebra', language: lang })
        });
        currentQuiz = await res.json();
        
        document.getElementById('questionText').innerText = currentQuiz.question;
        
        const listenBtn = document.getElementById('listenQuizBtn');
        listenBtn.style.display = 'inline-block';
        listenBtn.onclick = () => {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(currentQuiz.question);
            const selectedLang = document.getElementById('quizLang').value;
            if (selectedLang === 'Spanish') utterance.lang = 'es-ES';
            else if (selectedLang === 'French') utterance.lang = 'fr-FR';
            else if (selectedLang === 'Hindi') utterance.lang = 'hi-IN';
            else utterance.lang = 'en-US';
            window.speechSynthesis.speak(utterance);
        };
        
        currentQuiz.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opt;
            btn.onclick = () => handleAnswer(opt, btn);
            document.getElementById('optionsContainer').appendChild(btn);
        });
        
    } catch (e) {
        document.getElementById('questionText').innerText = "Failed to load quiz.";
    }
}

async function handleAnswer(selectedOpt, btnElement) {
    // Disable all buttons
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(b => b.disabled = true);

    const isCorrect = selectedOpt === currentQuiz.correct_answer;
    
    if (isCorrect) {
        btnElement.classList.add('correct');
        // Award Bounty!
        currentBounties += 10;
        document.getElementById('bountyCount').innerText = `Bounties: ${currentBounties}`;
        
        // Attempt to update Supabase. This will silently fail if the column 'bounties' doesn't exist yet,
        // which is fine for demonstration.
        await supabaseClient.from('user_profiles').update({ bounties: currentBounties }).eq('id', userSession.user.id);
    } else {
        btnElement.classList.add('wrong');
        // Highlight correct one
        btns.forEach(b => {
            if (b.innerText === currentQuiz.correct_answer) b.classList.add('correct');
        });
    }

    const exp = document.getElementById('explanation');
    exp.innerText = currentQuiz.explanation;
    exp.style.display = "block";
    
    document.getElementById('nextBtn').style.display = "block";
}
