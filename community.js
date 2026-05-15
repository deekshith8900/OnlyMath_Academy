const SUPABASE_URL = 'https://erxeomniqcgbxkmbsjud.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyeGVvbW5pcWNnYnhrbWJzanVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzIyNTYsImV4cCI6MjA5MjcwODI1Nn0.NVS9lVhgftygPTse3L60_v9b0IDjsEyFy13m6MBSKBg';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let userSession = null;

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    userSession = session;

    document.getElementById('postBtn').addEventListener('click', postQuestion);
    
    loadQuestions();
});

async function loadQuestions() {
    const list = document.getElementById('questionsList');
    
    try {
        const { data, error } = await supabaseClient
            .from('community_questions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        list.innerHTML = '';
        if (data.length === 0) {
            list.innerHTML = '<p style="color: #94a3b8;">No questions yet. Be the first to ask!</p>';
            return;
        }

        data.forEach(q => {
            const card = document.createElement('div');
            card.className = 'question-card';
            card.innerHTML = `
                <p><strong>Anonymous Student:</strong></p>
                <p>${q.content}</p>
                <button class="reply-btn" onclick="alert('Replying functionality requires backend setup!')">Reply</button>
            `;
            list.appendChild(card);
        });

    } catch (e) {
        console.warn("Table 'community_questions' might not exist yet.", e);
        list.innerHTML = `
            <div style="background: rgba(239, 68, 68, 0.1); padding: 15px; border-left: 4px solid #ef4444; color: #ef4444;">
                <strong>Database Setup Required:</strong> To use the Help Board, you must create the 'community_questions' table in Supabase.
            </div>
        `;
    }
}

async function postQuestion() {
    if (!userSession) {
        alert("You must be logged in to post a question.");
        window.location.href = 'index.html';
        return;
    }

    const content = document.getElementById('questionInput').value;
    if (!content.trim()) return;

    try {
        const { error } = await supabaseClient
            .from('community_questions')
            .insert([{ content: content, user_id: userSession.user.id }]);

        if (error) throw error;
        
        document.getElementById('questionInput').value = '';
        loadQuestions();
        alert("Question posted successfully!");
    } catch (e) {
        alert("Failed to post. Have you created the 'community_questions' table in Supabase?");
        console.error(e);
    }
}
