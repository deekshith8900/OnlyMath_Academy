// SUPABASE SETUP (Replace these with your actual Supabase URL and Anon Key)
const SUPABASE_URL = 'https://erxeomniqcgbxkmbsjud.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyeGVvbW5pcWNnYnhrbWJzanVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzIyNTYsImV4cCI6MjA5MjcwODI1Nn0.NVS9lVhgftygPTse3L60_v9b0IDjsEyFy13m6MBSKBg';

let supabaseClient = null;
if (window.supabase && SUPABASE_URL) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

document.addEventListener('DOMContentLoaded', async () => {

    // --- UI Interactions (Original Logics) ---

    // Navbar Scroll Effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            alert('Mobile menu feature coming soon! View on desktop for full experience.');
        });
    }

    // Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        revealElements.forEach(el => {
            const revealTop = el.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // Number Counter Animation
    const counters = document.querySelectorAll('.counter');
    const runCounters = () => {
        counters.forEach(counter => {
            counter.innerText = '0';
            const updateCounter = () => {
                const target = +counter.getAttribute('data-target');
                const c = +counter.innerText;
                const increment = target / 50;
                if (c < target) {
                    counter.innerText = `${Math.ceil(c + increment)}`;
                    setTimeout(updateCounter, 30);
                } else {
                    counter.innerText = target;
                }
            };
            updateCounter();
        });
    };
    setTimeout(runCounters, 500);

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });


    // --- Supabase & Auth Logic ---

    // Auth Modal Elements
    const authModal = document.getElementById('authModal');
    const openLoginBtn = document.getElementById('openLoginBtn');
    const openSignupBtn = document.getElementById('openSignupBtn');
    const closeAuthBtn = document.querySelector('.close-btn');
    const authForm = document.getElementById('authForm');
    const authName = document.getElementById('authName');
    const nameInputGroup = document.getElementById('nameInputGroup');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authSwitchLink = document.getElementById('authSwitchLink');
    const authSwitchText = document.getElementById('authSwitchText');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const authMessage = document.getElementById('authMessage');

    let isLoginMode = true;
    let currentUser = null;

    // Check existing session if connected to Supabase
    if (supabaseClient) {
        const { data } = await supabaseClient.auth.getSession();
        if (data && data.session) {
            currentUser = data.session.user;
            updateNavForUser();
        }

        // Listen for auth changes
        supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                currentUser = session.user;
                updateNavForUser();
            } else if (event === 'SIGNED_OUT') {
                currentUser = null;
                updateNavForUser();
            }
        });
    }

    function updateNavForUser() {
        if (currentUser) {
            if (openLoginBtn) {
                openLoginBtn.innerText = 'Log Out';
                openLoginBtn.classList.replace('btn-outline', 'btn-secondary');
            }
            if (openSignupBtn) openSignupBtn.style.display = 'none';
        } else {
            if (openLoginBtn) {
                openLoginBtn.innerText = 'Log In';
                openLoginBtn.classList.replace('btn-secondary', 'btn-outline');
            }
            if (openSignupBtn) openSignupBtn.style.display = 'inline-block';
        }
    }

    function openModal(mode = 'login') {
        authModal.classList.add('show');
        authMessage.innerText = '';
        if (mode === 'signup' && isLoginMode) {
            toggleAuthMode(new Event('click'));
        } else if (mode === 'login' && !isLoginMode) {
            toggleAuthMode(new Event('click'));
        }
    }

    function closeModal() {
        authModal.classList.remove('show');
        authForm.reset();
    }

    function toggleAuthMode(e) {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        authMessage.innerText = '';
        if (isLoginMode) {
            modalTitle.innerText = 'Welcome Back';
            modalSubtitle.innerText = 'Sign in to access your courses.';
            authSubmitBtn.innerText = 'Sign In';
            authSwitchText.innerText = "Don't have an account?";
            authSwitchLink.innerText = "Sign Up";
            if (nameInputGroup) nameInputGroup.style.display = 'none';
            if (authName) authName.required = false;
        } else {
            modalTitle.innerText = 'Join OnlyMath';
            modalSubtitle.innerText = 'Create an account to start learning.';
            authSubmitBtn.innerText = 'Sign Up';
            authSwitchText.innerText = "Already have an account?";
            authSwitchLink.innerText = "Sign In";
            if (nameInputGroup) nameInputGroup.style.display = 'block';
            if (authName) authName.required = true;
        }
    }

    if (openLoginBtn) {
        openLoginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (currentUser) {
                // Log Out
                if (supabaseClient) await supabaseClient.auth.signOut();
                else alert('Placeholder: Logged out!');
                currentUser = null;
                updateNavForUser();
            } else {
                openModal('login');
            }
        });
    }

    if (openSignupBtn) {
        openSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!currentUser) openModal('signup');
        });
    }

    if (closeAuthBtn) closeAuthBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === authModal) closeModal(); });
    if (authSwitchLink) authSwitchLink.addEventListener('click', toggleAuthMode);

    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!supabaseClient) {
                authMessage.innerText = 'Please connect Supabase by adding your URL & Key in script.js.';
                return;
            }

            const email = authEmail.value;
            const password = authPassword.value;
            authSubmitBtn.disabled = true;
            authSubmitBtn.innerText = 'Processing...';

            try {
                if (isLoginMode) {
                    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
                    if (error) throw error;
                    closeModal();
                } else {
                    const name = authName ? authName.value : '';
                    const { data, error } = await supabaseClient.auth.signUp({ 
                        email, 
                        password,
                        options: { data: { full_name: name } }
                     });
                    if (error) throw error;
                    
                    // Insert into a user_profiles table so you have an accessible record
                    if (data.user) {
                        try {
                            await supabaseClient.from('user_profiles').insert([{ 
                                id: data.user.id, 
                                email: email,
                                full_name: name
                            }]);
                        } catch (profileErr) {
                            console.error("Profile insert skipped/failed:", profileErr);
                        }
                    }

                    authMessage.innerText = 'Check your email for the confirmation link!';
                }
            } catch (err) {
                authMessage.innerText = err.message;
            } finally {
                authSubmitBtn.disabled = false;
                authSubmitBtn.innerText = isLoginMode ? 'Sign In' : 'Sign Up';
            }
        });
    }


    // Contact Form Supabase Implementation
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;

            btn.innerText = 'Sending...';
            btn.disabled = true;

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const interest = document.getElementById('interest').value;

            if (!supabaseClient) {
                alert('Success Output Simulation! (To save this to DB, add your Supabase Keys in script.js)');
                completeContactFormSuccess(btn, originalText);
                return;
            }

            try {
                // Assuming a table named 'contacts' exists with columns: name, email, interest
                const { data, error } = await supabaseClient
                    .from('contacts')
                    .insert([{ name, email, interest }]);

                if (error) throw error;
                completeContactFormSuccess(btn, originalText);
            } catch (err) {
                console.error('Error inserting data:', err);
                alert('Error submitting form: ' + err.message);
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    function completeContactFormSuccess(btn, originalText) {
        btn.innerText = 'Message Sent!';
        btn.style.background = '#10b981'; // Green
        contactForm.reset();

        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = '';
            btn.disabled = false;
        }, 3000);
    }

    // --- Chatbot Logic ---
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotMessages = document.getElementById('chatbotMessages');
    
    // Generate or retrieve session ID for the chatbot
    let chatSessionId = localStorage.getItem('onlymath_chat_session');
    if (!chatSessionId) {
        chatSessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('onlymath_chat_session', chatSessionId);
    }

    // Toggle Chat Window
    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', () => {
            chatbotWindow.classList.add('open');
        });
    }

    if (chatbotClose) {
        chatbotClose.addEventListener('click', () => {
            chatbotWindow.classList.remove('open');
        });
    }

    // Send Message Logic
    async function sendChatMessage() {
        const text = chatbotInput.value.trim();
        if (!text) return;

        // Append user message
        appendMessage(text, 'user-message');
        chatbotInput.value = '';

        // Show typing indicator
        const typingId = 'typing-' + Date.now();
        appendTypingIndicator(typingId);

        try {
            // Use relative path for Vercel deployment
            const backendUrl = '/api/query'; 
            
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: text, session_id: chatSessionId })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            removeTypingIndicator(typingId);
            appendMessage(data.answer, 'bot-message');

        } catch (error) {
            console.error('Chat error:', error);
            removeTypingIndicator(typingId);
            appendMessage('Sorry, I am having trouble connecting to the server. Please try again later.', 'bot-message');
        }
    }

    function appendMessage(text, className) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${className}`;
        msgDiv.textContent = text;
        chatbotMessages.appendChild(msgDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function appendTypingIndicator(id) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot-message';
        msgDiv.id = id;
        msgDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
        chatbotMessages.appendChild(msgDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function removeTypingIndicator(id) {
        const indicator = document.getElementById(id);
        if (indicator) {
            indicator.remove();
        }
    }

    if (chatbotSend) {
        chatbotSend.addEventListener('click', sendChatMessage);
    }

    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }

});
