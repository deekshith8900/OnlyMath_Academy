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

    // Fetch user profile for name
    try {
        const { data: profile } = await supabaseClient
            .from('user_profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
            
        if (profile && profile.full_name) {
            userNameEl.innerText = `Hello, ${profile.full_name}`;
        } else {
            userNameEl.innerText = `Hello!`;
        }
    } catch (err) {
        console.error("Could not load profile", err);
        userNameEl.innerText = `Hello!`;
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await supabaseClient.auth.signOut();
            window.location.href = 'index.html';
        });
    }
});
