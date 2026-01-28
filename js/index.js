// ========================================
// INDEX PAGE - RANKING
// ========================================

let allPlayers = [];
let topScore = 1;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadStats();
    await loadPlayers();
    await loadSeries();
    initSearch();
});

// Load statistics
async function loadStats() {
    try {
        const stats = await fetchStats();

        document.getElementById('statPlayers').textContent = formatNumber(stats.totalPlayers);
        document.getElementById('statGroups').textContent = formatNumber(stats.totalGroups);
        document.getElementById('statMatches').textContent = formatNumber(stats.totalMatches);
        document.getElementById('statLeader').textContent = formatNumber(stats.topScore);

        document.getElementById('heroStats').textContent =
            `${stats.totalPlayers} jugadores · ${stats.totalGroups} grupos · ${stats.totalMatches} partidos`;

        topScore = stats.topScore || 1;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load players ranking
async function loadPlayers() {
    const container = document.getElementById('rankingBody');

    try {
        allPlayers = await fetchPlayersPublic();
        renderPlayers(allPlayers);
        renderTopPlayers(allPlayers.slice(0, 3));
    } catch (error) {
        console.error('Error loading players:', error);
        container.innerHTML = '<div class="empty-state">Error al cargar el ranking</div>';
    }
}

// Render players in table
function renderPlayers(players) {
    const container = document.getElementById('rankingBody');

    if (!players || players.length === 0) {
        container.innerHTML = '<div class="empty-state">No se encontraron jugadores</div>';
        return;
    }

    container.innerHTML = players.slice(0, 50).map((player, index) => {
        const rank = index + 1;
        const points = player.current_atp_points || 0;
        const barWidth = topScore > 0 ? (points / topScore) * 100 : 0;

        return `
            <div class="ranking-row ${rank <= 3 ? 'top-3' : ''}">
                <div class="col-rank">
                    <div class="rank-badge ${getRankClass(rank)}">${rank}</div>
                </div>
                <div class="col-name">
                    <span class="player-name">${player.name}</span>
                </div>
                <div class="col-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${barWidth}%"></div>
                    </div>
                </div>
                <div class="col-points">
                    <span class="player-points">${formatNumber(points)}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Render top 3 players sidebar
function renderTopPlayers(players) {
    const container = document.getElementById('topPlayers');

    if (!players || players.length === 0) {
        container.innerHTML = '<div class="loading">No hay jugadores</div>';
        return;
    }

    container.innerHTML = players.map((player, index) => {
        const rank = index + 1;
        const points = player.current_atp_points || 0;

        return `
            <div class="top-player-card">
                <div class="top-player-rank ${getRankClass(rank)}">${rank}</div>
                <div class="top-player-info">
                    <p class="top-player-name">${player.name}</p>
                    <p class="top-player-points">${formatNumber(points)} pts</p>
                </div>
            </div>
        `;
    }).join('');
}

// Load series
async function loadSeries() {
    const container = document.getElementById('seriesList');

    try {
        const series = await fetchSeries();

        if (!series || series.length === 0) {
            container.innerHTML = '<div class="loading">No hay series</div>';
            return;
        }

        const serie1 = series.find(s => s.name === 'Serie 1');
        const serie2 = series.find(s => s.name === 'Serie 2');

        let html = '';

        if (serie1) {
            html += `
                <a href="series.html" class="series-card blue">
                    <div class="series-header">
                        <div class="series-info">
                            <h3>
                                ${serie1.name}
                                <span class="series-badge ${serie1.is_active ? 'active' : 'completed'}">
                                    ${serie1.is_active ? 'Activa' : 'Completada'}
                                </span>
                            </h3>
                            <p class="series-stats">42 grupos · 244 partidos</p>
                        </div>
                        <svg class="series-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                </a>
            `;
        }

        if (serie2) {
            html += `
                <a href="series.html" class="series-card purple">
                    <div class="series-header">
                        <div class="series-info">
                            <h3>
                                ${serie2.name}
                                <span class="series-badge ${serie2.is_active ? 'active' : 'completed'}">
                                    ${serie2.is_active ? 'En curso' : 'Completada'}
                                </span>
                            </h3>
                            <p class="series-stats">41 grupos · 72 partidos jugados</p>
                        </div>
                        <svg class="series-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                </a>
            `;
        }

        container.innerHTML = html || '<div class="loading">No hay series disponibles</div>';
    } catch (error) {
        console.error('Error loading series:', error);
        container.innerHTML = '<div class="loading">Error al cargar series</div>';
    }
}

// Initialize search
function initSearch() {
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const term = e.target.value.toLowerCase().trim();

            if (!term) {
                renderPlayers(allPlayers);
                return;
            }

            const filtered = allPlayers.filter(player =>
                player.name.toLowerCase().includes(term)
            );

            renderPlayers(filtered);
        }, 300));
    }
}
