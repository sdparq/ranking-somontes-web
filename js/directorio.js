// ========================================
// DIRECTORIO PAGE
// ========================================

let allPlayers = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadPlayers();
    initSearch();
});

// Load players
async function loadPlayers() {
    const container = document.getElementById('playersGrid');
    const countEl = document.getElementById('playerCount');

    try {
        allPlayers = await fetchPlayersPublic();

        if (!allPlayers || allPlayers.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <p>No hay jugadores registrados</p>
                </div>
            `;
            countEl.textContent = '0 jugadores';
            return;
        }

        countEl.textContent = `${allPlayers.length} jugadores`;
        renderPlayers(allPlayers);

    } catch (error) {
        console.error('Error loading players:', error);
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <p>Error al cargar los jugadores</p>
            </div>
        `;
    }
}

// Render players
function renderPlayers(players) {
    const container = document.getElementById('playersGrid');

    if (!players || players.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <p>No se encontraron jugadores</p>
            </div>
        `;
        return;
    }

    container.innerHTML = players.map((player, index) => {
        const points = player.current_atp_points || 0;
        const rank = allPlayers.findIndex(p => p.id === player.id) + 1;

        return `
            <div class="player-card" style="animation-delay: ${index * 0.03}s">
                <div class="player-card-avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                </div>
                <div class="player-card-info">
                    <p class="player-card-name">${player.name}</p>
                    <p class="player-card-points">${formatNumber(points)} puntos ATP</p>
                    <p class="player-card-status">Posicion #${rank}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Initialize search
function initSearch() {
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const term = e.target.value.toLowerCase().trim();

            if (!term) {
                renderPlayers(allPlayers);
                document.getElementById('playerCount').textContent = `${allPlayers.length} jugadores`;
                return;
            }

            const filtered = allPlayers.filter(player =>
                player.name.toLowerCase().includes(term)
            );

            renderPlayers(filtered);
            document.getElementById('playerCount').textContent =
                filtered.length === 1 ? '1 jugador encontrado' : `${filtered.length} jugadores encontrados`;
        }, 300));
    }
}
