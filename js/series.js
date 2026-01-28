// ========================================
// SERIES PAGE
// ========================================

let allSeries = [];
let allGroups = [];
let selectedSeriesId = null;
let selectedGroupIndex = 0;
let groupMatches = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await loadSeries();
    initGroupNavigation();
});

// Load series
async function loadSeries() {
    const container = document.getElementById('seriesSelector');

    try {
        allSeries = await fetchSeries();

        if (!allSeries || allSeries.length === 0) {
            container.innerHTML = '<p class="text-muted">No hay series disponibles</p>';
            return;
        }

        // Render series buttons
        container.innerHTML = allSeries.map(series => `
            <button class="series-btn" data-id="${series.id}">
                ${series.name}
                ${series.is_active ? '<span class="badge">Activa</span>' : ''}
            </button>
        `).join('');

        // Add click handlers
        container.querySelectorAll('.series-btn').forEach(btn => {
            btn.addEventListener('click', () => selectSeries(btn.dataset.id));
        });

        // Select first series by default (Serie 1 if exists)
        const serie1 = allSeries.find(s => s.name === 'Serie 1');
        selectSeries(serie1?.id || allSeries[0].id);

    } catch (error) {
        console.error('Error loading series:', error);
        container.innerHTML = '<p class="text-muted">Error al cargar series</p>';
    }
}

// Select a series
async function selectSeries(seriesId) {
    selectedSeriesId = seriesId;
    selectedGroupIndex = 0;

    // Update button states
    document.querySelectorAll('.series-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.id === seriesId);
    });

    // Update series info
    const series = allSeries.find(s => s.id === seriesId);
    const infoEl = document.getElementById('seriesInfo');

    // Load groups for this series
    await loadGroups(seriesId);

    if (allGroups.length > 0) {
        infoEl.textContent = `${allGroups.length} grupos${!series.is_active ? ' · Completada' : ''}`;
    } else {
        infoEl.textContent = '';
    }
}

// Load groups
async function loadGroups(seriesId) {
    const groupNav = document.getElementById('groupNav');
    const standingsCard = document.getElementById('standingsCard');
    const matchesCard = document.getElementById('matchesCard');
    const emptyState = document.getElementById('emptyState');

    try {
        allGroups = await fetchGroups(seriesId);

        // Sort by level_index
        allGroups.sort((a, b) => (a.level_index || 0) - (b.level_index || 0));

        if (!allGroups || allGroups.length === 0) {
            groupNav.style.display = 'none';
            standingsCard.style.display = 'none';
            matchesCard.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        groupNav.style.display = 'block';
        standingsCard.style.display = 'block';

        // Render group selector buttons
        renderGroupSelector();

        // Select first group
        selectGroup(0);

    } catch (error) {
        console.error('Error loading groups:', error);
        emptyState.style.display = 'block';
    }
}

// Render group selector buttons
function renderGroupSelector() {
    const container = document.getElementById('groupSelector');

    container.innerHTML = allGroups.map((group, index) => `
        <button class="group-btn ${index === selectedGroupIndex ? 'active' : ''}" data-index="${index}">
            ${index + 1}
        </button>
    `).join('');

    // Add click handlers
    container.querySelectorAll('.group-btn').forEach(btn => {
        btn.addEventListener('click', () => selectGroup(parseInt(btn.dataset.index)));
    });
}

// Select a group
async function selectGroup(index) {
    selectedGroupIndex = index;
    const group = allGroups[index];

    if (!group) return;

    // Update group info
    document.getElementById('groupName').textContent = group.name;
    document.getElementById('groupPlayers').innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        ${group.group_players?.length || 0} jugadores
    `;
    document.getElementById('groupCoefficient').innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        ${getCoefficient(group.level_index)} pts/set
    `;

    // Update navigation buttons
    document.getElementById('prevGroupBtn').disabled = index === 0;
    document.getElementById('nextGroupBtn').disabled = index === allGroups.length - 1;

    // Update group selector buttons
    document.querySelectorAll('.group-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    // Render standings
    renderStandings(group);

    // Load and render matches
    await loadMatches(group.id);
}

// Render standings table
function renderStandings(group) {
    const tbody = document.getElementById('standingsBody');
    const card = document.getElementById('standingsCard');

    if (!group.group_players || group.group_players.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted" style="padding: 2rem;">
                    No hay jugadores en este grupo
                </td>
            </tr>
        `;
        card.style.display = 'block';
        return;
    }

    // Sort by group points
    const players = [...group.group_players].sort((a, b) => b.group_points - a.group_points);

    tbody.innerHTML = players.map((gp, index) => {
        const pos = index + 1;
        const player = gp.players || {};

        return `
            <tr class="${pos === 1 ? 'leader' : ''}">
                <td>
                    <span class="position-badge ${pos === 1 ? 'pos-1' : pos === 2 ? 'pos-2' : 'pos-default'}">${pos}</span>
                </td>
                <td>${player.name || 'Desconocido'}</td>
                <td>${gp.matches_played || 0}</td>
                <td class="stat-won">${gp.matches_won || 0}</td>
                <td class="stat-lost">${gp.matches_lost || 0}</td>
                <td>
                    <span class="stat-won">${gp.sets_won || 0}</span>
                    <span class="text-muted"> - </span>
                    <span class="stat-lost">${gp.sets_lost || 0}</span>
                </td>
                <td class="stat-points">${gp.group_points || 0}</td>
            </tr>
        `;
    }).join('');

    card.style.display = 'block';
}

// Load matches for a group
async function loadMatches(groupId) {
    const matchesCard = document.getElementById('matchesCard');
    const matchesList = document.getElementById('matchesList');
    const matchesTitle = document.getElementById('matchesTitle');

    try {
        groupMatches = await fetchMatches(groupId);

        if (!groupMatches || groupMatches.length === 0) {
            matchesCard.style.display = 'none';
            return;
        }

        matchesTitle.textContent = `Partidos (${groupMatches.length})`;
        matchesCard.style.display = 'block';

        matchesList.innerHTML = groupMatches.map(match => {
            const isP1Winner = match.winner_id === match.player1_id;
            const isP2Winner = match.winner_id === match.player2_id;

            const scores1 = [match.score_p1_set1, match.score_p1_set2, match.score_p1_set3].filter(s => s !== null);
            const scores2 = [match.score_p2_set1, match.score_p2_set2, match.score_p2_set3].filter(s => s !== null);

            const p1Sets = scores1.filter((s, i) => s > (scores2[i] || 0)).length;
            const p2Sets = scores2.filter((s, i) => s > (scores1[i] || 0)).length;

            return `
                <div class="match-item">
                    <div class="match-player ${isP1Winner ? 'winner' : 'loser'}">
                        <div class="player-indicator">
                            <div class="winner-bar ${isP1Winner ? 'active' : ''}"></div>
                            <span class="player-name-match">${match.player1?.name || 'Jugador 1'}</span>
                        </div>
                        <div class="set-scores">
                            ${scores1.map((score, i) => `
                                <span class="set-score ${score > (scores2[i] || 0) ? 'won' : 'lost'}">${score}</span>
                            `).join('')}
                        </div>
                    </div>
                    <div class="match-player ${isP2Winner ? 'winner' : 'loser'}">
                        <div class="player-indicator">
                            <div class="winner-bar ${isP2Winner ? 'active' : ''}"></div>
                            <span class="player-name-match">${match.player2?.name || 'Jugador 2'}</span>
                        </div>
                        <div class="set-scores">
                            ${scores2.map((score, i) => `
                                <span class="set-score ${score > (scores1[i] || 0) ? 'won' : 'lost'}">${score}</span>
                            `).join('')}
                        </div>
                    </div>
                    ${(isP1Winner || isP2Winner) ? `
                        <div class="match-summary">
                            Victoria de <span class="winner-name">${isP1Winner ? match.player1?.name : match.player2?.name}</span>
                            (${p1Sets > p2Sets ? p1Sets : p2Sets}-${p1Sets > p2Sets ? p2Sets : p1Sets})
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading matches:', error);
        matchesCard.style.display = 'none';
    }
}

// Initialize group navigation
function initGroupNavigation() {
    const prevBtn = document.getElementById('prevGroupBtn');
    const nextBtn = document.getElementById('nextGroupBtn');

    prevBtn.addEventListener('click', () => {
        if (selectedGroupIndex > 0) {
            selectGroup(selectedGroupIndex - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (selectedGroupIndex < allGroups.length - 1) {
            selectGroup(selectedGroupIndex + 1);
        }
    });
}
