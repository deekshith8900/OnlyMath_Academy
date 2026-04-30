document.addEventListener('DOMContentLoaded', () => {
    let count = 0;
    const maxCount = 10; // Toddlers usually count up to 10
    
    const addBtn = document.getElementById('addBtn');
    const resetBtn = document.getElementById('resetBtn');
    const equationDisplay = document.getElementById('equation');
    const itemsContainer = document.getElementById('itemsContainer');
    const mascot = document.getElementById('mascot');
    const canvas = document.getElementById('confetti');
    const ctx = canvas ? canvas.getContext('2d') : null;

    // Resize canvas for confetti
    function resizeCanvas() {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Initialize Web Speech API for voice feedback
    const synth = window.speechSynthesis;
    let voices = [];
    
    // Load voices
    function populateVoiceList() {
        voices = synth.getVoices();
    }
    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    function speakNumber(numberText) {
        if (synth.speaking) {
            synth.cancel();
        }
        const utterThis = new SpeechSynthesisUtterance(numberText);
        
        // Try to find a friendly, energetic voice (often female/child-like voices are better for toddlers)
        const friendlyVoice = voices.find(v => v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google US English'));
        if (friendlyVoice) {
            utterThis.voice = friendlyVoice;
        }
        
        utterThis.pitch = 1.2; // Slightly higher pitch for friendly tone
        utterThis.rate = 0.9;  // Slightly slower for toddlers
        synth.speak(utterThis);
    }

    function updateEquation() {
        if (count === 0) {
            equationDisplay.innerText = "0";
            return;
        }
        
        if (count === 1) {
            equationDisplay.innerText = "1";
        } else {
            // Show addition format for anything > 1
            equationDisplay.innerText = `${count - 1} + 1 = ${count}`;
        }
    }

    function triggerConfetti() {
        if (!ctx) return;
        
        const particles = [];
        const colors = ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#a855f7'];
        
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2 + 100,
                r: Math.random() * 10 + 5,
                dx: Math.random() * 20 - 10,
                dy: Math.random() * -20 - 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.random() * 10
            });
        }
        
        let animationFrame;
        function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let active = false;
            
            particles.forEach(p => {
                p.x += p.dx;
                p.y += p.dy;
                p.dy += 0.5; // gravity
                
                if (p.y < canvas.height) active = true;
                
                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
                ctx.stroke();
            });
            
            if (active) {
                animationFrame = requestAnimationFrame(render);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        
        render();
    }

    addBtn.addEventListener('click', () => {
        if (count >= maxCount) {
            // If they reached 10, encourage them to reset
            speakNumber("Yay! We counted to ten! Let's start over!");
            mascot.innerText = "🎉";
            mascot.style.animation = "bounce 0.5s infinite";
            triggerConfetti();
            return;
        }

        count++;
        
        // Add visual item
        const item = document.createElement('div');
        item.className = 'item';
        item.innerText = '🍎';
        itemsContainer.appendChild(item);
        
        // Update math
        updateEquation();
        
        // Speak the number
        speakNumber(count.toString());
        
        // Mascot reaction
        mascot.innerText = "🐻";
        
        // Simple bounce effect on mascot when counting
        mascot.style.transform = 'scale(1.2)';
        setTimeout(() => {
            mascot.style.transform = 'scale(1)';
        }, 200);

        // If reaching max count, celebrate
        if (count === maxCount) {
            setTimeout(() => {
                speakNumber("Ten! Great job!");
                mascot.innerText = "🎉";
                triggerConfetti();
            }, 1000);
        }
    });

    resetBtn.addEventListener('click', () => {
        count = 0;
        itemsContainer.innerHTML = '';
        updateEquation();
        mascot.innerText = "🐻";
        mascot.style.animation = "bounce 2s infinite ease-in-out";
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        speakNumber("Let's count again!");
    });
});

// Global function for mascot click
function mascotSpeak() {
    const messages = ["Hello! Let's count apples!", "You are doing great!", "Math is fun!"];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    
    const synth = window.speechSynthesis;
    if (synth.speaking) synth.cancel();
    
    const utterThis = new SpeechSynthesisUtterance(randomMsg);
    utterThis.pitch = 1.2;
    utterThis.rate = 0.9;
    synth.speak(utterThis);
}
