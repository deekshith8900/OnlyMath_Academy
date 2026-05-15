const SUPABASE_URL = 'https://erxeomniqcgbxkmbsjud.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyeGVvbW5pcWNnYnhrbWJzanVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMzIyNTYsImV4cCI6MjA5MjcwODI1Nn0.NVS9lVhgftygPTse3L60_v9b0IDjsEyFy13m6MBSKBg';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch top 10 users by bounties
        const { data, error } = await supabaseClient
            .from('user_profiles')
            .select('id, bounties')
            .order('bounties', { ascending: false })
            .limit(10);

        if (error) throw error;

        document.getElementById('loadingText').style.display = 'none';
        
        if (!data || data.length === 0) {
            document.getElementById('loadingText').innerText = "No bounties earned yet!";
            document.getElementById('loadingText').style.display = 'block';
            return;
        }

        document.getElementById('leaderboardContent').style.display = 'block';

        renderPodium(data.slice(0, 3));
        renderList(data.slice(3, 10));

    } catch (e) {
        console.error("Leaderboard fetch error:", e);
        document.getElementById('loadingText').innerText = "Failed to load leaderboard. Make sure 'bounties' column exists.";
        document.getElementById('loadingText').style.color = '#ef4444';
    }
});

function getDisplayName(userId, index) {
    // If we don't have a name column, generate a fun anonymous name based on index
    const names = ["MathWizard", "AlgebraHero", "CalculusKing", "GeometryGuru", "StatMaster"];
    return `${names[index % names.length]}_${userId.substring(0, 4)}`;
}

function renderPodium(top3) {
    const container = document.getElementById('podiumContainer');
    container.innerHTML = '';

    // The order for visually pleasing podiums is usually 2, 1, 3
    const order = [1, 0, 2]; 
    
    order.forEach(i => {
        if (!top3[i]) return;
        const user = top3[i];
        const placeNum = i + 1;
        
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.flexDirection = 'column';
        div.style.alignItems = 'center';
        
        div.innerHTML = `
            <div class="podium-name">${getDisplayName(user.id, i)}</div>
            <div class="podium-place place-${placeNum}">
                <div style="font-size: 1.5rem; margin-top: 10px;">${placeNum}</div>
                <div style="font-size: 0.8rem; margin-top: auto; margin-bottom: 10px;">${user.bounties || 0} pts</div>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderList(rest) {
    const container = document.getElementById('listContainer');
    container.innerHTML = '';
    
    if (rest.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#94a3b8;">Earn bounties to get on the board!</p>';
        return;
    }

    rest.forEach((user, idx) => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div style="display: flex;">
                <span class="list-rank">#${idx + 4}</span>
                <span>${getDisplayName(user.id, idx + 3)}</span>
            </div>
            <span class="list-bounties">${user.bounties || 0} pts</span>
        `;
        container.appendChild(item);
    });
}
