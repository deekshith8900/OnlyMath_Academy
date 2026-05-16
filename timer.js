const SUPABASE_URL = 'https://erxeomniqcgbxkmbsjud.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyeGVvbW5pcWNnYnhrbWJzanVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzIyNTYsImV4cCI6MjA5MjcwODI1Nn0.NVS9lVhgftygPTse3L60_v9b0IDjsEyFy13m6MBSKBg';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    let timeLeft = 25 * 60; // 25 minutes in seconds
    let timerInterval = null;
    let isRunning = false;
    let userSession = null;

    const timeDisplay = document.getElementById('timeDisplay');
    const timerStatus = document.getElementById('timerStatus');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const timerCircle = document.getElementById('timerCircle');
    const rewardMsg = document.getElementById('rewardMsg');

    // Check Auth for rewards
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        userSession = session;
    } else {
        timerStatus.innerText = "Log in to earn Bounties!";
    }

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function updateDisplay() {
        timeDisplay.innerText = formatTime(timeLeft);
    }

    async function finishSession() {
        clearInterval(timerInterval);
        isRunning = false;
        timerCircle.classList.remove('pulsate');
        timerCircle.style.borderTopColor = '#10b981'; // Green
        timerStatus.innerText = "Session Complete!";
        startBtn.style.display = 'none';
        resetBtn.style.display = 'inline-block';
        rewardMsg.style.display = 'block';

        if (userSession) {
            try {
                // Fetch current bounties
                const { data } = await supabaseClient.from('user_profiles').select('bounties').eq('id', userSession.user.id).single();
                let currentBounties = (data && data.bounties) ? data.bounties : 0;
                
                // Add 5 Bounties
                await supabaseClient.from('user_profiles').update({ bounties: currentBounties + 5 }).eq('id', userSession.user.id);
            } catch (e) {
                console.warn("Failed to award bounties:", e);
            }
        }
    }

    startBtn.addEventListener('click', () => {
        if (isRunning) {
            // Pause
            clearInterval(timerInterval);
            isRunning = false;
            startBtn.innerHTML = "<i class='bx bx-play'></i> Resume";
            timerCircle.classList.remove('pulsate');
            timerStatus.innerText = "Paused";
            resetBtn.style.display = 'inline-block';
        } else {
            // Start
            isRunning = true;
            startBtn.innerHTML = "<i class='bx bx-pause'></i> Pause";
            resetBtn.style.display = 'none';
            timerCircle.classList.add('pulsate');
            timerCircle.style.borderTopColor = '#f59e0b';
            timerStatus.innerText = "Focusing...";
            rewardMsg.style.display = 'none';

            timerInterval = setInterval(() => {
                timeLeft--;
                updateDisplay();
                
                if (timeLeft <= 0) {
                    finishSession();
                }
            }, 1000);
        }
    });

    resetBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        isRunning = false;
        timeLeft = 25 * 60;
        updateDisplay();
        startBtn.innerHTML = "<i class='bx bx-play'></i> Start";
        startBtn.style.display = 'inline-block';
        resetBtn.style.display = 'none';
        timerCircle.classList.remove('pulsate');
        timerCircle.style.borderTopColor = '#f59e0b';
        timerStatus.innerText = "Ready to Focus";
        rewardMsg.style.display = 'none';
    });

    updateDisplay();
});
