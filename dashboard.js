// SUPABASE SETUP
const SUPABASE_URL = 'https://erxeomniqcgbxkmbsjud.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyeGVvbW5pcWNnYnhrbWJzanVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzIyNTYsImV4cCI6MjA5MjcwODI1Nn0.NVS9lVhgftygPTse3L60_v9b0IDjsEyFy13m6MBSKBg';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    const logoutBtn = document.getElementById('logoutBtn');

    // Check auth session
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (!session) {
        // Redirect if not logged in
        window.location.href = 'index.html';
        return;
    }

    const user = session.user;
    userEmailEl.innerText = user.email;

    // Fetch user profile for name, bounties, and streak
    let bounties = 0;
    let currentStreak = 0;
    let lastPlayed = null;

    try {
        const { data: profile } = await supabaseClient
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
        if (profile) {
            if (profile.full_name) userNameEl.innerText = `Hello, ${profile.full_name}`;
            if (profile.bounties) bounties = profile.bounties;
            if (profile.current_streak) currentStreak = profile.current_streak;
            if (profile.last_played_date) lastPlayed = profile.last_played_date;
        } else {
            userNameEl.innerText = `Hello!`;
        }
    } catch (err) {
        console.warn("Could not load profile fully, might be missing columns.", err);
        userNameEl.innerText = `Hello!`;
    }

    document.getElementById('bountiesDisplay').innerText = `${bounties} Bounties Collected.`;
    document.getElementById('streakCount').innerText = `${currentStreak} 🔥`;

    // Daily Challenge Logic
    const startDailyBtn = document.getElementById('startDailyBtn');
    const dailyArea = document.getElementById('dailyChallengeArea');
    
    // Check if played today
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastPlayed === todayStr) {
        startDailyBtn.innerText = "Completed Today!";
        startDailyBtn.disabled = true;
        startDailyBtn.style.opacity = '0.5';
    }

    let dailyQuiz = null;

    startDailyBtn.addEventListener('click', async () => {
        startDailyBtn.style.display = 'none';
        dailyArea.style.display = 'block';

        try {
            const res = await fetch('/api/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ difficulty: 'hard', concept: 'daily_challenge', language: 'English' })
            });
            dailyQuiz = await res.json();
            
            document.getElementById('dailyQuestion').innerText = dailyQuiz.question;
            const optionsContainer = document.getElementById('dailyOptions');
            optionsContainer.innerHTML = '';
            
            dailyQuiz.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-outline';
                btn.innerText = opt;
                btn.style.width = '100%';
                btn.onclick = () => handleDailyAnswer(opt, btn);
                optionsContainer.appendChild(btn);
            });
        } catch (e) {
            document.getElementById('dailyQuestion').innerText = "Failed to load Daily Challenge.";
        }
    });

    async function handleDailyAnswer(selectedOpt, btnElement) {
        const btns = document.getElementById('dailyOptions').querySelectorAll('button');
        btns.forEach(b => b.disabled = true);

        const isCorrect = selectedOpt === dailyQuiz.correct_answer;
        
        if (isCorrect) {
            btnElement.style.background = '#10b981';
            btnElement.style.color = '#fff';
            
            // Increment Streak and award +50 Bounties!
            currentStreak += 1;
            bounties += 50;
            document.getElementById('streakCount').innerText = `${currentStreak} 🔥`;
            document.getElementById('bountiesDisplay').innerText = `${bounties} Bounties Collected.`;
            
            try {
                await supabaseClient.from('user_profiles').update({ 
                    bounties: bounties,
                    current_streak: currentStreak,
                    last_played_date: todayStr
                }).eq('id', user.id);
            } catch (e) { console.warn("Supabase update failed", e); }
            
        } else {
            btnElement.style.background = '#ef4444';
            btnElement.style.color = '#fff';
            
            // Reset streak
            currentStreak = 0;
            document.getElementById('streakCount').innerText = `${currentStreak} 🔥`;
            
            try {
                await supabaseClient.from('user_profiles').update({ 
                    current_streak: 0,
                    last_played_date: todayStr
                }).eq('id', user.id);
            } catch (e) { console.warn("Supabase update failed", e); }
        }

        const exp = document.getElementById('dailyExplanation');
        exp.innerText = dailyQuiz.explanation;
        exp.style.display = "block";
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await supabaseClient.auth.signOut();
            window.location.href = 'index.html';
        });
    }
});
