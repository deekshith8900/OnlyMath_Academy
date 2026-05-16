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

    // Render Badges
    const badgesContainer = document.getElementById('badgesContainer');
    badgesContainer.innerHTML = '';
    
    const possibleBadges = [
        { id: 'novice', icon: '🌱', name: 'Novice Learner', desc: 'Started your journey.', condition: bounties >= 10 },
        { id: 'scholar', icon: '🏆', name: 'Math Scholar', desc: 'Earned 100+ Bounties.', condition: bounties >= 100 },
        { id: 'streak_master', icon: '🔥', name: 'Unstoppable', desc: 'Reached a 3-day streak.', condition: currentStreak >= 3 },
        { id: 'dedication', icon: '⭐', name: 'Pure Dedication', desc: 'Reached a 7-day streak.', condition: currentStreak >= 7 }
    ];

    let earnedAny = false;
    possibleBadges.forEach(b => {
        if (b.condition) {
            earnedAny = true;
            const badgeEl = document.createElement('div');
            badgeEl.style.background = 'rgba(255,255,255,0.05)';
            badgeEl.style.border = '1px solid #c084fc';
            badgeEl.style.padding = '15px';
            badgeEl.style.borderRadius = '10px';
            badgeEl.style.width = '140px';
            badgeEl.innerHTML = `<div style="font-size: 2.5rem; margin-bottom: 10px;">${b.icon}</div><div style="color: white; font-weight: bold; font-size: 0.9rem;">${b.name}</div><div style="color: #94a3b8; font-size: 0.75rem;">${b.desc}</div>`;
            badgesContainer.appendChild(badgeEl);
        }
    });

    if (!earnedAny) {
        badgesContainer.innerHTML = '<p style="color: #94a3b8; width: 100%;">No badges earned yet. Keep solving problems to unlock them!</p>';
    }

    // Avatar Shop Logic
    const shopContainer = document.getElementById('avatarShopContainer');
    shopContainer.innerHTML = '';
    const avatars = [
        { icon: '🤖', name: 'MathBot', price: 50 },
        { icon: '🥷', name: 'Ninja', price: 100 },
        { icon: '🧙‍♂️', name: 'Wizard', price: 150 },
        { icon: '👩‍🔬', name: 'Scientist', price: 200 }
    ];

    avatars.forEach(av => {
        const avEl = document.createElement('div');
        avEl.style.background = 'rgba(255,255,255,0.05)';
        avEl.style.border = '1px solid #10b981';
        avEl.style.padding = '15px';
        avEl.style.borderRadius = '10px';
        avEl.style.width = '120px';
        avEl.style.cursor = 'pointer';
        
        const isOwned = (currentAvatar === av.icon);
        const canAfford = (bounties >= av.price);
        
        avEl.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 5px;">${av.icon}</div>
            <div style="color: white; font-weight: bold; font-size: 0.9rem;">${av.name}</div>
            <div style="color: ${isOwned ? '#38bdf8' : (canAfford ? '#10b981' : '#ef4444')}; font-size: 0.8rem; font-weight: bold; margin-top: 5px;">
                ${isOwned ? 'Equipped' : `💰 ${av.price}`}
            </div>
        `;

        if (!isOwned) {
            avEl.addEventListener('click', async () => {
                if (canAfford) {
                    if (confirm(`Buy ${av.name} for ${av.price} Bounties?`)) {
                        try {
                            const newBounties = bounties - av.price;
                            await supabaseClient.from('user_profiles').update({ 
                                bounties: newBounties,
                                avatar: av.icon
                            }).eq('id', user.id);
                            alert(`You bought ${av.name}!`);
                            window.location.reload();
                        } catch (e) {
                            console.error(e);
                            alert("Failed to buy. (Make sure 'avatar' column exists in user_profiles table)");
                        }
                    }
                } else {
                    alert(`You need ${av.price - bounties} more Bounties to buy this!`);
                }
            });
        }
        shopContainer.appendChild(avEl);
    });

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
            
            const { data, error } = await supabaseClient.from('user_profiles').select('*').eq('id', user.id).single();
            if (error) throw error;
            
            let currentBounties = (data.bounties || 0) + 50;
            let currentStreak = (data.current_streak || 0) + 1;

            document.getElementById('bountiesDisplay').innerText = `${currentBounties} Bounties Collected.`;
            document.getElementById('streakCount').innerText = `${currentStreak} 🔥`;
            
            try {
                await supabaseClient.from('user_profiles').update({ 
                    bounties: currentBounties,
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
