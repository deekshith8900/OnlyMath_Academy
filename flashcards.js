const SUPABASE_URL = 'https://erxeomniqcgbxkmbsjud.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyeGVvbW5pcWNnYnhrbWJzanVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzIyNTYsImV4cCI6MjA5MjcwODI1Nn0.NVS9lVhgftygPTse3L60_v9b0IDjsEyFy13m6MBSKBg';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const deck = [
    { front: 'Derivative of sin(x)', back: 'cos(x)' },
    { front: 'Pythagorean Theorem', back: 'a² + b² = c²' },
    { front: 'Area of a Circle', back: 'π * r²' },
    { front: 'Quadratic Formula', back: 'x = (-b ± √(b² - 4ac)) / 2a' },
    { front: 'Integral of e^x', back: 'e^x + C' },
    { front: 'Logarithm Product Rule', back: 'log(xy) = log(x) + log(y)' },
    { front: 'Derivative of x^n', back: 'n * x^(n-1)' },
    { front: 'Euler\'s Identity', back: 'e^(iπ) + 1 = 0' }
];

document.addEventListener('DOMContentLoaded', async () => {
    let currentIndex = 0;
    let deckCompleted = false;
    let userSession = null;

    const flashcard = document.getElementById('flashcard');
    const cardFront = document.getElementById('cardFront');
    const cardBack = document.getElementById('cardBack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const flipBtn = document.getElementById('flipBtn');
    const flashcardContainer = document.getElementById('flashcardContainer');
    const progressFill = document.getElementById('progressFill');
    const rewardMsg = document.getElementById('rewardMsg');

    // Auth
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) userSession = session;

    function renderCard() {
        flashcard.classList.remove('flipped');
        
        setTimeout(() => {
            cardFront.innerText = deck[currentIndex].front;
            cardBack.innerText = deck[currentIndex].back;
            
            // Update Progress
            const progress = ((currentIndex + 1) / deck.length) * 100;
            progressFill.style.width = `${progress}%`;
            
            prevBtn.disabled = currentIndex === 0;
        }, 150); // wait for unflip animation if it was flipped
    }

    flashcardContainer.addEventListener('click', () => {
        flashcard.classList.toggle('flipped');
    });

    flipBtn.addEventListener('click', () => {
        flashcard.classList.toggle('flipped');
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            renderCard();
        }
    });

    nextBtn.addEventListener('click', async () => {
        if (currentIndex < deck.length - 1) {
            currentIndex++;
            renderCard();
        } else if (!deckCompleted) {
            deckCompleted = true;
            nextBtn.innerText = "Completed!";
            nextBtn.disabled = true;
            rewardMsg.style.display = 'block';

            if (userSession) {
                try {
                    const { data } = await supabaseClient.from('user_profiles').select('bounties').eq('id', userSession.user.id).single();
                    let currentBounties = (data && data.bounties) ? data.bounties : 0;
                    await supabaseClient.from('user_profiles').update({ bounties: currentBounties + 10 }).eq('id', userSession.user.id);
                } catch (e) {
                    console.warn("Reward failed", e);
                }
            }
        }
    });

    renderCard();
});
