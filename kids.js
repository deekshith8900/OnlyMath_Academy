document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let count = 0;
    let currentLevel = 1;
    const totalLevels = 10;
    let highestUnlockedLevel = parseInt(localStorage.getItem('onlymath_kids_level')) || 1;
    let levelTargetCount = 5;
    let isAdditionMode = false;

    // 20 fun characters to count
    const characters = ['🍎', '🐶', '🚗', '🎈', '⭐', '🦖', '🦋', '⚽', '🍕', '🚀', '🐱', '🐢', '🍦', '🍩', '🤖', '🐸', '🦄', '🌻', '🍓', '🐠'];
    let currentItem = '🍎';

    // --- DOM Elements ---
    const addBtn = document.getElementById('addBtn');
    const resetBtn = document.getElementById('resetBtn');
    const equationDisplay = document.getElementById('equation');
    const itemsContainer = document.getElementById('itemsContainer');
    const mascot = document.getElementById('mascot');
    const canvas = document.getElementById('confetti');
    const ctx = canvas ? canvas.getContext('2d') : null;
    
    const mapView = document.getElementById('mapView');
    const gameView = document.getElementById('gameView');
    const mapArea = document.getElementById('mapArea');
    const backToMapBtn = document.getElementById('backToMapBtn');
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    const headerTitle = document.getElementById('headerTitle');
    const openPickerBtn = document.getElementById('openPickerBtn');

    // Picker Elements
    const pickerModal = document.getElementById('pickerModal');
    const closePickerBtn = document.getElementById('closePickerBtn');
    const characterGrid = document.getElementById('characterGrid');

    // --- Initialization ---
    
    // Resize canvas for confetti
    function resizeCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Initialize Web Speech API
    const synth = window.speechSynthesis;
    let voices = [];
    function populateVoiceList() { voices = synth.getVoices(); }
    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    function speakText(text) {
        if (synth.speaking) synth.cancel();
        const utterThis = new SpeechSynthesisUtterance(text);
        const friendlyVoice = voices.find(v => v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google US English'));
        if (friendlyVoice) utterThis.voice = friendlyVoice;
        utterThis.pitch = 1.2; 
        utterThis.rate = 0.9;
        synth.speak(utterThis);
    }

    // --- Map Logic ---

    function renderMap() {
        mapArea.innerHTML = '';
        for (let i = 1; i <= totalLevels; i++) {
            const node = document.createElement('div');
            node.className = 'level-node';
            
            if (i < highestUnlockedLevel) {
                node.classList.add('completed');
                node.innerText = '⭐';
            } else if (i === highestUnlockedLevel) {
                node.classList.add('unlocked');
                node.innerText = i;
            } else {
                node.innerText = '🔒';
            }

            node.addEventListener('click', () => {
                if (i <= highestUnlockedLevel) {
                    loadLevel(i);
                } else {
                    speakText("Level locked! Finish the previous level first.");
                }
            });

            mapArea.appendChild(node);
        }
    }

    function showMap() {
        gameView.classList.remove('active');
        mapView.classList.add('active');
        backToMapBtn.style.display = 'none';
        backToHomeBtn.style.display = 'inline-block';
        openPickerBtn.style.display = 'none';
        headerTitle.innerText = "Math Map";
        renderMap();
        speakText("Choose a level!");
    }

    function loadLevel(level) {
        currentLevel = level;
        
        // Progression Logic
        isAdditionMode = currentLevel >= 6; // Addition starts at level 6
        levelTargetCount = currentLevel <= 2 ? 3 : (currentLevel <= 5 ? 5 : 10);
        
        // Auto assign a fun item based on level
        currentItem = characters[(currentLevel - 1) % characters.length];
        addBtn.innerText = `Add ${currentItem}`;

        // UI Updates
        mapView.classList.remove('active');
        gameView.classList.add('active');
        backToMapBtn.style.display = 'inline-block';
        backToHomeBtn.style.display = 'none';
        openPickerBtn.style.display = 'inline-block';
        headerTitle.innerText = `Level ${currentLevel}`;

        resetGame();
    }

    backToMapBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showMap();
    });

    // --- Character Picker Logic ---
    
    characters.forEach(char => {
        const charDiv = document.createElement('div');
        charDiv.className = 'char-option';
        charDiv.innerText = char;
        charDiv.addEventListener('click', () => {
            currentItem = char;
            addBtn.innerText = `Add ${char}`;
            pickerModal.classList.remove('open');
            resetGame();
        });
        characterGrid.appendChild(charDiv);
    });

    if (openPickerBtn) openPickerBtn.addEventListener('click', () => pickerModal.classList.add('open'));
    if (closePickerBtn) closePickerBtn.addEventListener('click', () => pickerModal.classList.remove('open'));

    // --- Game Logic ---

    function updateEquation() {
        if (count === 0) {
            equationDisplay.innerText = "0";
            return;
        }
        
        if (!isAdditionMode) {
            // Pure Counting Mode (Levels 1-5)
            equationDisplay.innerText = count.toString();
        } else {
            // Addition Intro Mode (Levels 6-10)
            if (count === 1) {
                equationDisplay.innerText = "1";
            } else {
                equationDisplay.innerText = `${count - 1} + 1 = ${count}`;
            }
        }
    }

    function resetGame() {
        count = 0;
        itemsContainer.innerHTML = '';
        updateEquation();
        mascot.innerText = "🐻";
        mascot.style.animation = "bounce 2s infinite ease-in-out";
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        speakText(`Let's count to ${levelTargetCount}!`);
    }

    addBtn.addEventListener('click', () => {
        if (count >= levelTargetCount) return;

        count++;
        
        // Add visual item
        const item = document.createElement('div');
        item.className = 'item';
        item.innerText = currentItem;
        itemsContainer.appendChild(item);
        
        // Update math
        updateEquation();
        speakText(count.toString());
        
        // Mascot reaction
        mascot.innerText = "🐻";
        mascot.style.transform = 'scale(1.2)';
        setTimeout(() => mascot.style.transform = 'scale(1)', 200);

        // Win Condition
        if (count === levelTargetCount) {
            setTimeout(() => levelComplete(), 800);
        }
    });

    function levelComplete() {
        speakText("Great job! Level Complete!");
        mascot.innerText = "🎉";
        triggerConfetti();
        
        // Unlock next level
        if (currentLevel === highestUnlockedLevel && currentLevel < totalLevels) {
            highestUnlockedLevel++;
            localStorage.setItem('onlymath_kids_level', highestUnlockedLevel);
        }

        // Return to map automatically after 4 seconds
        setTimeout(() => {
            if (gameView.classList.contains('active')) {
                showMap();
            }
        }, 4000);
    }

    resetBtn.addEventListener('click', resetGame);

    // --- Confetti Animation ---
    function triggerConfetti() {
        if (!ctx) return;
        const particles = [];
        const colors = ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#a855f7'];
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: canvas.width / 2, y: canvas.height / 2 + 100,
                r: Math.random() * 10 + 5, dx: Math.random() * 20 - 10, dy: Math.random() * -20 - 10,
                color: colors[Math.floor(Math.random() * colors.length)], tilt: Math.random() * 10
            });
        }
        function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let active = false;
            particles.forEach(p => {
                p.x += p.dx; p.y += p.dy; p.dy += 0.5;
                if (p.y < canvas.height) active = true;
                ctx.beginPath(); ctx.lineWidth = p.r; ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r, p.y); ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r); ctx.stroke();
            });
            if (active) requestAnimationFrame(render);
            else ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        render();
    }

    // Initial render
    renderMap();
});

// Global function for mascot click
function mascotSpeak() {
    const messages = ["Hello! Let's count together!", "You are doing great!", "Math is fun!"];
    const synth = window.speechSynthesis;
    if (synth.speaking) synth.cancel();
    const utterThis = new SpeechSynthesisUtterance(messages[Math.floor(Math.random() * messages.length)]);
    utterThis.pitch = 1.2; utterThis.rate = 0.9;
    synth.speak(utterThis);
}
