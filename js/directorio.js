// ========================================
// DIRECTORIO PAGE
// ========================================

let allPlayers = [];
let allGroups = [];
let playerGroups = {}; // Map player_id -> group info
let isAuthenticated = false;
const DIRECTORY_PASSWORD = 'somontesrank';

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Check if already authenticated in this session
    if (sessionStorage.getItem('directoryUnlocked') === 'true') {
        isAuthenticated = true;
        showDirectory();
        await loadData();
    } else {
        showLoginScreen();
    }

    initPasswordForm();
});

// Show login screen
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('directoryContent').style.display = 'none';
    document.getElementById('directoryPassword').focus();
}

// Show directory content
function showDirectory() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('directoryContent').style.display = 'block';
}

// Initialize password form
function initPasswordForm() {
    const submitBtn = document.getElementById('submitPassword');
    const passwordInput = document.getElementById('directoryPassword');
    const passwordError = document.getElementById('passwordError');

    if (submitBtn) {
        submitBtn.addEventListener('click', checkPassword);
    }

    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });

        // Clear error on input
        passwordInput.addEventListener('input', () => {
            passwordError.style.display = 'none';
            passwordInput.classList.remove('error');
        });
    }
}

// Check password
async function checkPassword() {
    const passwordInput = document.getElementById('directoryPassword');
    const passwordError = document.getElementById('passwordError');
    const password = passwordInput.value.trim();

    if (password === DIRECTORY_PASSWORD) {
        isAuthenticated = true;
        sessionStorage.setItem('directoryUnlocked', 'true');
        showDirectory();
        await loadData();
        showToast('Acceso concedido', 'success');
    } else {
        passwordError.style.display = 'block';
        passwordInput.classList.add('error');
        passwordInput.value = '';
        passwordInput.focus();
        setTimeout(() => {
            passwordInput.classList.remove('error');
        }, 500);
    }
}

// Load all data
async function loadData() {
    const container = document.getElementById('playersGrid');
    const countEl = document.getElementById('playerCount');

    try {
        // Load players with contact info
        allPlayers = await fetchPlayersWithContact();

        // Load active series and groups
        await loadGroupsData();

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
        initFilters();

    } catch (error) {
        console.error('Error loading data:', error);
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <p>Error al cargar los jugadores</p>
            </div>
        `;
    }
}

// Load groups data for active series
async function loadGroupsData() {
    try {
        // Get all series to find the active one
        const series = await fetchSeries();
        const activeSeries = series.find(s => s.status === 'active' || s.status === 'en_curso') || series[0];

        if (!activeSeries) return;

        // Get groups for active series
        allGroups = await fetchGroups(activeSeries.id);

        // Build player -> group mapping
        playerGroups = {};
        allGroups.forEach(group => {
            if (group.group_players) {
                group.group_players.forEach(gp => {
                    playerGroups[gp.player_id] = {
                        groupId: group.id,
                        groupName: group.name,
                        levelIndex: group.level_index
                    };
                });
            }
        });

        // Populate group filter
        populateGroupFilter();

    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

// Populate group filter dropdown
function populateGroupFilter() {
    const groupFilter = document.getElementById('groupFilter');
    if (!groupFilter || !allGroups.length) return;

    // Sort groups by level_index
    const sortedGroups = [...allGroups].sort((a, b) => a.level_index - b.level_index);

    groupFilter.innerHTML = '<option value="">Todos los grupos</option>';
    sortedGroups.forEach(group => {
        const playerCount = group.group_players ? group.group_players.length : 0;
        groupFilter.innerHTML += `<option value="${group.id}">Grupo ${group.level_index} (${playerCount} jug.)</option>`;
    });
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
        const email = player.email || '';
        const phone = player.phone || '';
        const groupInfo = playerGroups[player.id];

        let contactInfo = '';
        if (email || phone) {
            contactInfo = `
                <div class="player-card-contact">
                    ${phone ? `
                        <a href="tel:${phone}" class="contact-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                            </svg>
                            ${phone}
                        </a>
                    ` : ''}
                    ${email ? `
                        <a href="mailto:${email}" class="contact-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            ${email}
                        </a>
                    ` : ''}
                </div>
            `;
        }

        let groupBadge = '';
        if (groupInfo) {
            groupBadge = `<span class="group-badge">Grupo ${groupInfo.levelIndex}</span>`;
        }

        return `
            <div class="player-card with-contact" style="animation-delay: ${index * 0.02}s" data-group-id="${groupInfo ? groupInfo.groupId : ''}">
                <div class="player-card-avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                </div>
                <div class="player-card-info">
                    <div class="player-card-header">
                        <p class="player-card-name">${player.name}</p>
                        ${groupBadge}
                    </div>
                    <p class="player-card-points">${formatNumber(points)} puntos ATP</p>
                    <p class="player-card-status">Posición #${rank}</p>
                    ${contactInfo}
                </div>
            </div>
        `;
    }).join('');
}

// Initialize filters
function initFilters() {
    const searchInput = document.getElementById('searchInput');
    const groupFilter = document.getElementById('groupFilter');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyFilters, 300));
    }

    if (groupFilter) {
        groupFilter.addEventListener('change', applyFilters);
    }
}

// Apply all filters
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const selectedGroup = document.getElementById('groupFilter').value;

    let filtered = [...allPlayers];

    // Filter by search term
    if (searchTerm) {
        filtered = filtered.filter(player =>
            player.name.toLowerCase().includes(searchTerm) ||
            (player.email && player.email.toLowerCase().includes(searchTerm)) ||
            (player.phone && player.phone.includes(searchTerm))
        );
    }

    // Filter by group
    if (selectedGroup) {
        filtered = filtered.filter(player => {
            const groupInfo = playerGroups[player.id];
            return groupInfo && groupInfo.groupId === selectedGroup;
        });
    }

    renderPlayers(filtered);

    // Update count
    const countEl = document.getElementById('playerCount');
    if (filtered.length === allPlayers.length) {
        countEl.textContent = `${filtered.length} jugadores`;
    } else {
        countEl.textContent = `${filtered.length} de ${allPlayers.length} jugadores`;
    }
}
