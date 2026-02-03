// ========================================
// ADMIN PAGE
// ========================================

let currentUser = null;
let isAdmin = false;

// Data caches
let allPlayers = [];
let allSeries = [];
let allGroups = [];
let selectedGroupForPlayer = null;
let deleteCallback = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    initTabs();
    initAuthForm();
    initModals();
});

// ========================================
// AUTHENTICATION
// ========================================

async function checkAuth() {
    const { session } = await getSession();

    if (session) {
        currentUser = session.user;
        isAdmin = await checkIsAdmin(currentUser.id);

        if (isAdmin) {
            showAdminPanel();
        } else {
            showAccessDenied();
        }
    } else {
        showLoginForm();
    }
}

function showLoginForm() {
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('accessDeniedSection').classList.add('hidden');
    document.getElementById('adminPanel').classList.add('hidden');
}

function showAccessDenied() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('accessDeniedSection').classList.remove('hidden');
    document.getElementById('adminPanel').classList.add('hidden');

    document.getElementById('logoutDenied').addEventListener('click', handleLogout);
}

async function showAdminPanel() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('accessDeniedSection').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');

    // Load initial data
    await loadPlayersTable();
    await loadSeriesTable();
    await loadSeriesSelects();
}

function initAuthForm() {
    const form = document.getElementById('authForm');
    const togglePassword = document.getElementById('togglePassword');

    form.addEventListener('submit', handleAuth);
    togglePassword.addEventListener('click', () => {
        const input = document.getElementById('password');
        input.type = input.type === 'password' ? 'text' : 'password';
    });

    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

async function handleAuth(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('authError');
    const submitBtn = document.getElementById('authSubmit');

    errorEl.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Cargando...';

    try {
        const { error } = await signIn(email, password);
        if (error) {
            errorEl.textContent = 'Credenciales incorrectas. Por favor, verifica tu email y contrasena.';
            errorEl.classList.remove('hidden');
        } else {
            await checkAuth();
        }
    } catch (err) {
        errorEl.textContent = 'Error de conexion. Intenta de nuevo.';
        errorEl.classList.remove('hidden');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Iniciar Sesion';
}

async function handleLogout() {
    await signOut();
    currentUser = null;
    isAdmin = false;
    showLoginForm();
}

// ========================================
// TABS
// ========================================

function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;

            // Update buttons
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update content
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
}

// ========================================
// PLAYERS
// ========================================

async function loadPlayersTable() {
    const tbody = document.getElementById('playersTableBody');

    try {
        allPlayers = await fetchPlayers();
        renderPlayersTable(allPlayers);
    } catch (error) {
        console.error('Error loading players:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Error al cargar jugadores</td></tr>';
    }
}

function renderPlayersTable(players) {
    const tbody = document.getElementById('playersTableBody');

    if (!players || players.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding: 2rem;">No hay jugadores</td></tr>';
        return;
    }

    tbody.innerHTML = players.map(player => `
        <tr>
            <td>
                <div class="player-cell">
                    <div class="player-avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </div>
                    <span>${player.name}</span>
                </div>
            </td>
            <td class="hidden md:table-cell">
                <div class="contact-info">
                    ${player.email ? `<span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> ${player.email}</span>` : ''}
                    ${player.phone ? `<span><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> ${player.phone}</span>` : ''}
                </div>
            </td>
            <td class="font-mono">${formatNumber(player.current_atp_points || 0)}</td>
            <td>
                <span class="status-badge ${player.is_active ? 'active' : 'inactive'}">
                    ${player.is_active ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <button class="icon-btn" onclick="editPlayer('${player.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="icon-btn danger" onclick="confirmDeletePlayer('${player.id}', '${player.name}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function initModals() {
    // Player search
    document.getElementById('playerSearch').addEventListener('input', debounce((e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allPlayers.filter(p => p.name.toLowerCase().includes(term));
        renderPlayersTable(filtered);
    }, 300));

    // Add player button
    document.getElementById('addPlayerBtn').addEventListener('click', () => {
        document.getElementById('playerModalTitle').textContent = 'Nuevo Jugador';
        document.getElementById('playerId').value = '';
        document.getElementById('playerName').value = '';
        document.getElementById('playerEmail').value = '';
        document.getElementById('playerPhone').value = '';
        document.getElementById('playerPoints').value = '0';
        document.getElementById('playerActive').checked = true;
        openModal('playerModal');
    });

    // Save player
    document.getElementById('savePlayerBtn').addEventListener('click', savePlayer);

    // Add series button
    document.getElementById('addSeriesBtn').addEventListener('click', () => {
        document.getElementById('seriesModalTitle').textContent = 'Nueva Serie';
        document.getElementById('seriesId').value = '';
        document.getElementById('seriesName').value = '';
        document.getElementById('seriesStart').value = '';
        document.getElementById('seriesEnd').value = '';
        document.getElementById('seriesActive').checked = false;
        openModal('seriesModal');
    });

    // Save series
    document.getElementById('saveSeriesBtn').addEventListener('click', saveSeries);

    // Groups
    document.getElementById('groupSeriesSelect').addEventListener('change', async (e) => {
        const seriesId = e.target.value;
        document.getElementById('addGroupBtn').disabled = !seriesId;
        if (seriesId) {
            await loadGroupsForSeries(seriesId);
        } else {
            document.getElementById('groupsContainer').innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    <p>Selecciona una serie para ver y gestionar sus grupos.</p>
                </div>
            `;
        }
    });

    document.getElementById('addGroupBtn').addEventListener('click', () => {
        const seriesId = document.getElementById('groupSeriesSelect').value;
        if (!seriesId) return;

        document.getElementById('groupModalTitle').textContent = 'Nuevo Grupo';
        document.getElementById('groupId').value = '';
        document.getElementById('groupName').value = `Grupo ${allGroups.length + 1}`;
        document.getElementById('groupLevel').value = allGroups.length + 1;
        openModal('groupModal');
    });

    document.getElementById('saveGroupBtn').addEventListener('click', saveGroup);
    document.getElementById('confirmAddPlayerBtn').addEventListener('click', confirmAddPlayerToGroup);

    // Matches
    document.getElementById('matchSeriesSelect').addEventListener('change', async (e) => {
        const seriesId = e.target.value;
        const groupSelect = document.getElementById('matchGroupSelect');

        groupSelect.disabled = !seriesId;
        groupSelect.innerHTML = '<option value="">Selecciona un grupo</option>';
        document.getElementById('addMatchBtn').disabled = true;

        if (seriesId) {
            const groups = await fetchGroups(seriesId);
            groups.forEach(g => {
                groupSelect.innerHTML += `<option value="${g.id}">${g.name}</option>`;
            });
        }
    });

    document.getElementById('matchGroupSelect').addEventListener('change', async (e) => {
        const groupId = e.target.value;
        document.getElementById('addMatchBtn').disabled = !groupId;

        if (groupId) {
            await loadMatchesForGroup(groupId);
        } else {
            document.getElementById('matchesContainer').innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                    <p>Selecciona una serie y un grupo para ver y gestionar los partidos.</p>
                </div>
            `;
        }
    });

    document.getElementById('addMatchBtn').addEventListener('click', openNewMatchModal);
    document.getElementById('saveMatchBtn').addEventListener('click', saveMatch);

    // Delete confirmation
    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        if (deleteCallback) {
            deleteCallback();
            deleteCallback = null;
        }
        closeModal('deleteModal');
    });
}

function editPlayer(playerId) {
    const player = allPlayers.find(p => p.id === playerId);
    if (!player) return;

    document.getElementById('playerModalTitle').textContent = 'Editar Jugador';
    document.getElementById('playerId').value = player.id;
    document.getElementById('playerName').value = player.name;
    document.getElementById('playerEmail').value = player.email || '';
    document.getElementById('playerPhone').value = player.phone || '';
    document.getElementById('playerPoints').value = player.current_atp_points || 0;
    document.getElementById('playerActive').checked = player.is_active;
    openModal('playerModal');
}

async function savePlayer() {
    const id = document.getElementById('playerId').value;
    const data = {
        name: document.getElementById('playerName').value,
        email: document.getElementById('playerEmail').value || null,
        phone: document.getElementById('playerPhone').value || null,
        current_atp_points: parseInt(document.getElementById('playerPoints').value) || 0,
        is_active: document.getElementById('playerActive').checked
    };

    try {
        if (id) {
            await updatePlayer(id, data);
            showToast('Jugador actualizado', `${data.name} ha sido actualizado correctamente.`);
        } else {
            await createPlayer(data);
            showToast('Jugador creado', `${data.name} ha sido anadido correctamente.`);
        }
        closeModal('playerModal');
        await loadPlayersTable();
    } catch (error) {
        showToast('Error', 'No se pudo guardar el jugador.', 'error');
    }
}

function confirmDeletePlayer(id, name) {
    document.getElementById('deleteMessage').textContent = `Esta accion eliminara permanentemente a "${name}" y todos sus datos asociados.`;
    deleteCallback = async () => {
        try {
            await deletePlayer(id);
            showToast('Jugador eliminado', `${name} ha sido eliminado.`);
            await loadPlayersTable();
        } catch (error) {
            showToast('Error', 'No se pudo eliminar el jugador.', 'error');
        }
    };
    openModal('deleteModal');
}

// ========================================
// SERIES
// ========================================

async function loadSeriesTable() {
    const tbody = document.getElementById('seriesTableBody');

    try {
        // Admin ve todas las series (incluyendo ocultas)
        allSeries = await fetchAllSeries();
        renderSeriesTable(allSeries);
    } catch (error) {
        console.error('Error loading series:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Error al cargar series</td></tr>';
    }
}

function renderSeriesTable(series) {
    const tbody = document.getElementById('seriesTableBody');

    if (!series || series.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding: 2rem;">No hay series</td></tr>';
        return;
    }

    tbody.innerHTML = series.map(s => `
        <tr class="${!s.is_active ? 'row-hidden' : ''}">
            <td>
                <strong>${s.name}</strong>
                ${!s.is_active ? '<span class="badge-hidden">OCULTA</span>' : ''}
            </td>
            <td>${formatDate(s.start_date)}</td>
            <td>${formatDate(s.end_date)}</td>
            <td>
                <span class="status-badge ${s.is_active ? 'active' : 'inactive'}">
                    ${s.is_active ? 'Visible' : 'Oculta'}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <button class="icon-btn" onclick="toggleSeriesVisibility('${s.id}', ${!s.is_active})" title="${s.is_active ? 'Ocultar serie' : 'Hacer visible'}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${s.is_active
                                ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
                                : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
                            }
                        </svg>
                    </button>
                    <button class="icon-btn" onclick="editSeries('${s.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="icon-btn danger" onclick="confirmDeleteSeries('${s.id}', '${s.name}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function toggleSeriesVisibility(seriesId, makeVisible) {
    try {
        await updateSeries(seriesId, { is_active: makeVisible });
        showToast('Serie actualizada', makeVisible ? 'Serie ahora es visible para todos.' : 'Serie oculta para usuarios.');
        await loadSeriesTable();
        await loadSeriesSelects();
    } catch (error) {
        showToast('Error', 'No se pudo cambiar la visibilidad.', 'error');
    }
}

async function loadSeriesSelects() {
    const groupSelect = document.getElementById('groupSeriesSelect');
    const matchSelect = document.getElementById('matchSeriesSelect');

    const options = allSeries.map(s => `<option value="${s.id}">${s.name}${s.is_active ? ' (Activa)' : ''}</option>`).join('');

    groupSelect.innerHTML = '<option value="">Selecciona una serie</option>' + options;
    matchSelect.innerHTML = '<option value="">Selecciona una serie</option>' + options;
}

function editSeries(seriesId) {
    const series = allSeries.find(s => s.id === seriesId);
    if (!series) return;

    document.getElementById('seriesModalTitle').textContent = 'Editar Serie';
    document.getElementById('seriesId').value = series.id;
    document.getElementById('seriesName').value = series.name;
    document.getElementById('seriesStart').value = series.start_date;
    document.getElementById('seriesEnd').value = series.end_date;
    document.getElementById('seriesActive').checked = series.is_active;
    openModal('seriesModal');
}

async function saveSeries() {
    const id = document.getElementById('seriesId').value;
    const data = {
        name: document.getElementById('seriesName').value,
        start_date: document.getElementById('seriesStart').value,
        end_date: document.getElementById('seriesEnd').value,
        is_active: document.getElementById('seriesActive').checked
    };

    try {
        if (id) {
            await updateSeries(id, data);
            showToast('Serie actualizada', `${data.name} ha sido actualizada.`);
        } else {
            await createSeries(data);
            showToast('Serie creada', `${data.name} ha sido creada.`);
        }
        closeModal('seriesModal');
        await loadSeriesTable();
        await loadSeriesSelects();
    } catch (error) {
        showToast('Error', 'No se pudo guardar la serie.', 'error');
    }
}

function confirmDeleteSeries(id, name) {
    document.getElementById('deleteMessage').textContent = `Esta accion eliminara permanentemente "${name}" y todos sus grupos y partidos asociados.`;
    deleteCallback = async () => {
        try {
            await deleteSeries(id);
            showToast('Serie eliminada', `${name} ha sido eliminada.`);
            await loadSeriesTable();
            await loadSeriesSelects();
        } catch (error) {
            showToast('Error', 'No se pudo eliminar la serie.', 'error');
        }
    };
    openModal('deleteModal');
}

// ========================================
// GROUPS
// ========================================

async function loadGroupsForSeries(seriesId) {
    const container = document.getElementById('groupsContainer');

    try {
        allGroups = await fetchGroups(seriesId);
        allGroups.sort((a, b) => (a.level_index || 0) - (b.level_index || 0));
        renderGroups(allGroups);
    } catch (error) {
        console.error('Error loading groups:', error);
        container.innerHTML = '<div class="empty-state"><p>Error al cargar grupos</p></div>';
    }
}

function renderGroups(groups) {
    const container = document.getElementById('groupsContainer');

    if (!groups || groups.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No hay grupos en esta serie. Crea uno nuevo.</p></div>';
        return;
    }

    container.innerHTML = groups.map(group => `
        <div class="group-card" data-id="${group.id}">
            <div class="group-card-header" onclick="toggleGroup('${group.id}')">
                <div class="group-card-info">
                    <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    <div class="group-card-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    </div>
                    <div>
                        <p class="group-card-title">${group.name}</p>
                        <p class="group-card-meta">${group.group_players?.length || 0} jugadores · Nivel ${group.level_index}</p>
                    </div>
                </div>
                <div class="group-card-actions" onclick="event.stopPropagation()">
                    <button class="icon-btn" onclick="openAddPlayerToGroup('${group.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                    </button>
                    <button class="icon-btn" onclick="editGroup('${group.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="icon-btn danger" onclick="confirmDeleteGroup('${group.id}', '${group.name}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>
            <div class="group-card-body">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Jugador</th>
                            <th>PJ</th>
                            <th>PG</th>
                            <th>PP</th>
                            <th>Sets</th>
                            <th>Pts</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${group.group_players?.sort((a, b) => b.group_points - a.group_points).map(gp => `
                            <tr>
                                <td><strong>${gp.players?.name || 'Desconocido'}</strong></td>
                                <td>${gp.matches_played || 0}</td>
                                <td class="text-success">${gp.matches_won || 0}</td>
                                <td class="text-danger">${gp.matches_lost || 0}</td>
                                <td><span class="text-success">${gp.sets_won || 0}</span> - <span class="text-danger">${gp.sets_lost || 0}</span></td>
                                <td class="font-mono"><strong>${gp.group_points || 0}</strong></td>
                                <td>
                                    <button class="icon-btn danger" onclick="confirmRemovePlayerFromGroup('${group.id}', '${gp.player_id}', '${gp.players?.name}')">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="11" x2="23" y2="11"/></svg>
                                    </button>
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="7" class="text-center text-muted">No hay jugadores</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `).join('');
}

function toggleGroup(groupId) {
    const card = document.querySelector(`.group-card[data-id="${groupId}"]`);
    if (card) {
        card.classList.toggle('expanded');
    }
}

function editGroup(groupId) {
    const group = allGroups.find(g => g.id === groupId);
    if (!group) return;

    document.getElementById('groupModalTitle').textContent = 'Editar Grupo';
    document.getElementById('groupId').value = group.id;
    document.getElementById('groupName').value = group.name;
    document.getElementById('groupLevel').value = group.level_index;
    openModal('groupModal');
}

async function saveGroup() {
    const id = document.getElementById('groupId').value;
    const seriesId = document.getElementById('groupSeriesSelect').value;

    const data = {
        name: document.getElementById('groupName').value,
        level_index: parseInt(document.getElementById('groupLevel').value) || 1,
        series_id: seriesId
    };

    try {
        if (id) {
            await updateGroup(id, data);
            showToast('Grupo actualizado', `${data.name} ha sido actualizado.`);
        } else {
            await createGroup(data);
            showToast('Grupo creado', `${data.name} ha sido creado.`);
        }
        closeModal('groupModal');
        await loadGroupsForSeries(seriesId);
    } catch (error) {
        showToast('Error', 'No se pudo guardar el grupo.', 'error');
    }
}

function confirmDeleteGroup(id, name) {
    document.getElementById('deleteMessage').textContent = `Esta accion eliminara permanentemente "${name}" y todos sus partidos asociados.`;
    deleteCallback = async () => {
        try {
            await deleteGroup(id);
            showToast('Grupo eliminado', `${name} ha sido eliminado.`);
            const seriesId = document.getElementById('groupSeriesSelect').value;
            await loadGroupsForSeries(seriesId);
        } catch (error) {
            showToast('Error', 'No se pudo eliminar el grupo.', 'error');
        }
    };
    openModal('deleteModal');
}

function openAddPlayerToGroup(groupId) {
    selectedGroupForPlayer = groupId;
    const group = allGroups.find(g => g.id === groupId);

    if (!group) return;

    const groupPlayerIds = new Set(group.group_players?.map(gp => gp.player_id) || []);
    const availablePlayers = allPlayers.filter(p => !groupPlayerIds.has(p.id) && p.is_active);

    const select = document.getElementById('playerToAdd');
    select.innerHTML = '<option value="">Selecciona un jugador</option>' +
        availablePlayers.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

    openModal('addPlayerToGroupModal');
}

async function confirmAddPlayerToGroup() {
    const playerId = document.getElementById('playerToAdd').value;

    if (!playerId || !selectedGroupForPlayer) return;

    try {
        await addPlayerToGroup(selectedGroupForPlayer, playerId);
        showToast('Jugador anadido', 'El jugador ha sido anadido al grupo.');
        closeModal('addPlayerToGroupModal');
        const seriesId = document.getElementById('groupSeriesSelect').value;
        await loadGroupsForSeries(seriesId);
    } catch (error) {
        showToast('Error', 'No se pudo anadir el jugador. Puede que ya este en el grupo.', 'error');
    }
}

function confirmRemovePlayerFromGroup(groupId, playerId, playerName) {
    document.getElementById('deleteMessage').textContent = `Esta accion eliminara a "${playerName}" del grupo.`;
    deleteCallback = async () => {
        try {
            await removePlayerFromGroup(groupId, playerId);
            showToast('Jugador eliminado', 'El jugador ha sido eliminado del grupo.');
            const seriesId = document.getElementById('groupSeriesSelect').value;
            await loadGroupsForSeries(seriesId);
        } catch (error) {
            showToast('Error', 'No se pudo eliminar el jugador del grupo.', 'error');
        }
    };
    openModal('deleteModal');
}

// ========================================
// MATCHES
// ========================================

async function loadMatchesForGroup(groupId) {
    const container = document.getElementById('matchesContainer');

    try {
        const matches = await fetchMatches(groupId);
        renderMatches(matches);
    } catch (error) {
        console.error('Error loading matches:', error);
        container.innerHTML = '<div class="empty-state"><p>Error al cargar partidos</p></div>';
    }
}

function renderMatches(matches) {
    const container = document.getElementById('matchesContainer');

    if (!matches || matches.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No hay partidos en este grupo</p></div>';
        return;
    }

    container.innerHTML = `
        <div class="admin-table-container">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Jugador 1</th>
                        <th>Resultado</th>
                        <th>Jugador 2</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${matches.map(match => `
                        <tr>
                            <td>
                                <span class="${match.winner_id === match.player1_id ? 'text-success' : ''}">
                                    ${match.winner_id === match.player1_id ? '<strong>' : ''}
                                    ${match.player1?.name || 'Jugador 1'}
                                    ${match.winner_id === match.player1_id ? '</strong>' : ''}
                                </span>
                            </td>
                            <td class="font-mono">${formatMatchScore(match)}</td>
                            <td>
                                <span class="${match.winner_id === match.player2_id ? 'text-success' : ''}">
                                    ${match.winner_id === match.player2_id ? '<strong>' : ''}
                                    ${match.player2?.name || 'Jugador 2'}
                                    ${match.winner_id === match.player2_id ? '</strong>' : ''}
                                </span>
                            </td>
                            <td class="text-muted">${formatDate(match.played_at)}</td>
                            <td>
                                <div class="action-btns">
                                    <button class="icon-btn" onclick="editMatch('${match.id}')">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </button>
                                    <button class="icon-btn danger" onclick="confirmDeleteMatch('${match.id}')">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function openNewMatchModal() {
    const groupId = document.getElementById('matchGroupSelect').value;
    if (!groupId) return;

    // Fetch group to get players
    const groups = await fetchGroups();
    const group = groups.find(g => g.id === groupId);

    if (!group || !group.group_players) return;

    const playerOptions = group.group_players.map(gp =>
        `<option value="${gp.player_id}">${gp.players?.name || 'Desconocido'}</option>`
    ).join('');

    document.getElementById('matchModalTitle').textContent = 'Nuevo Partido';
    document.getElementById('matchId').value = '';
    document.getElementById('matchPlayer1').innerHTML = '<option value="">Seleccionar</option>' + playerOptions;
    document.getElementById('matchPlayer2').innerHTML = '<option value="">Seleccionar</option>' + playerOptions;
    document.getElementById('matchDate').value = '';
    document.getElementById('scoreP1S1').value = '';
    document.getElementById('scoreP2S1').value = '';
    document.getElementById('scoreP1S2').value = '';
    document.getElementById('scoreP2S2').value = '';
    document.getElementById('scoreP1S3').value = '';
    document.getElementById('scoreP2S3').value = '';

    openModal('matchModal');
}

async function editMatch(matchId) {
    const groupId = document.getElementById('matchGroupSelect').value;
    const matches = await fetchMatches(groupId);
    const match = matches.find(m => m.id === matchId);

    if (!match) return;

    const groups = await fetchGroups();
    const group = groups.find(g => g.id === groupId);

    if (!group || !group.group_players) return;

    const playerOptions = group.group_players.map(gp =>
        `<option value="${gp.player_id}">${gp.players?.name || 'Desconocido'}</option>`
    ).join('');

    document.getElementById('matchModalTitle').textContent = 'Editar Partido';
    document.getElementById('matchId').value = match.id;
    document.getElementById('matchPlayer1').innerHTML = '<option value="">Seleccionar</option>' + playerOptions;
    document.getElementById('matchPlayer2').innerHTML = '<option value="">Seleccionar</option>' + playerOptions;
    document.getElementById('matchPlayer1').value = match.player1_id;
    document.getElementById('matchPlayer2').value = match.player2_id;
    document.getElementById('matchDate').value = match.played_at || '';
    document.getElementById('scoreP1S1').value = match.score_p1_set1 ?? '';
    document.getElementById('scoreP2S1').value = match.score_p2_set1 ?? '';
    document.getElementById('scoreP1S2').value = match.score_p1_set2 ?? '';
    document.getElementById('scoreP2S2').value = match.score_p2_set2 ?? '';
    document.getElementById('scoreP1S3').value = match.score_p1_set3 ?? '';
    document.getElementById('scoreP2S3').value = match.score_p2_set3 ?? '';

    openModal('matchModal');
}

async function saveMatch() {
    const id = document.getElementById('matchId').value;
    const groupId = document.getElementById('matchGroupSelect').value;

    const player1_id = document.getElementById('matchPlayer1').value;
    const player2_id = document.getElementById('matchPlayer2').value;

    if (!player1_id || !player2_id) {
        showToast('Error', 'Selecciona ambos jugadores.', 'error');
        return;
    }

    const data = {
        group_id: groupId,
        player1_id,
        player2_id,
        played_at: document.getElementById('matchDate').value || null,
        score_p1_set1: document.getElementById('scoreP1S1').value ? parseInt(document.getElementById('scoreP1S1').value) : null,
        score_p2_set1: document.getElementById('scoreP2S1').value ? parseInt(document.getElementById('scoreP2S1').value) : null,
        score_p1_set2: document.getElementById('scoreP1S2').value ? parseInt(document.getElementById('scoreP1S2').value) : null,
        score_p2_set2: document.getElementById('scoreP2S2').value ? parseInt(document.getElementById('scoreP2S2').value) : null,
        score_p1_set3: document.getElementById('scoreP1S3').value ? parseInt(document.getElementById('scoreP1S3').value) : null,
        score_p2_set3: document.getElementById('scoreP2S3').value ? parseInt(document.getElementById('scoreP2S3').value) : null
    };

    // Calculate winner
    data.winner_id = calculateWinner(data);

    try {
        if (id) {
            await updateMatch(id, data);
            showToast('Partido actualizado', 'El resultado ha sido guardado.');
        } else {
            await createMatch(data);
            showToast('Partido creado', 'El partido ha sido creado.');
        }
        closeModal('matchModal');
        await loadMatchesForGroup(groupId);
    } catch (error) {
        showToast('Error', 'No se pudo guardar el partido.', 'error');
    }
}

function confirmDeleteMatch(matchId) {
    document.getElementById('deleteMessage').textContent = 'Esta accion eliminara permanentemente este partido.';
    deleteCallback = async () => {
        try {
            await deleteMatch(matchId);
            showToast('Partido eliminado', 'El partido ha sido eliminado.');
            const groupId = document.getElementById('matchGroupSelect').value;
            await loadMatchesForGroup(groupId);
        } catch (error) {
            showToast('Error', 'No se pudo eliminar el partido.', 'error');
        }
    };
    openModal('deleteModal');
}
