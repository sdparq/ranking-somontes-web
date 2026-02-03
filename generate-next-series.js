import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hgpoanynlpgtcubmuddi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncG9hbnlubHBndGN1Ym11ZGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MTYwNjcsImV4cCI6MjA4NTE5MjA2N30.YQBPEvgjoyCSG47S8YtdnnQHwNjqZrcF_WGMT-gCadQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin credentials
const ADMIN_EMAIL = 'ranking@cpvtotaltenis.com';
const ADMIN_PASSWORD = 'cpvransom26';

// ========================================
// CONFIGURACIÓN
// ========================================

// Número de serie a generar (cambiar según necesidad)
const SOURCE_SERIES_NUMBER = 2;  // Serie de origen (cuyos resultados usamos)
const TARGET_SERIES_NUMBER = 3;  // Serie a generar

// Fechas de la nueva serie (ajustar según calendario)
const NEW_SERIES_START_DATE = '2025-02-15';
const NEW_SERIES_END_DATE = '2025-03-15';

// Si es true, regenerará la serie aunque ya exista (eliminando la anterior)
const FORCE_REGENERATE = true;

// ========================================
// LÓGICA DE DESEMPATES
// ========================================

/**
 * Obtiene los partidos entre jugadores específicos de un grupo
 */
async function getHeadToHeadMatches(groupId, playerIds) {
    const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .eq('group_id', groupId);

    if (error) {
        console.error('Error fetching matches:', error);
        return [];
    }

    // Filtrar solo partidos entre los jugadores empatados
    return matches.filter(m =>
        playerIds.includes(m.player1_id) && playerIds.includes(m.player2_id)
    );
}

/**
 * Calcula estadísticas de enfrentamientos directos entre jugadores empatados
 */
function calculateHeadToHeadStats(matches, playerId) {
    let setsWon = 0, setsLost = 0;
    let gamesWon = 0, gamesLost = 0;

    matches.forEach(match => {
        const isPlayer1 = match.player1_id === playerId;

        // Set 1
        if (match.score_p1_set1 !== null && match.score_p2_set1 !== null) {
            const p1Games = match.score_p1_set1;
            const p2Games = match.score_p2_set1;

            if (isPlayer1) {
                gamesWon += p1Games;
                gamesLost += p2Games;
                if (p1Games > p2Games) setsWon++; else setsLost++;
            } else {
                gamesWon += p2Games;
                gamesLost += p1Games;
                if (p2Games > p1Games) setsWon++; else setsLost++;
            }
        }

        // Set 2
        if (match.score_p1_set2 !== null && match.score_p2_set2 !== null) {
            const p1Games = match.score_p1_set2;
            const p2Games = match.score_p2_set2;

            if (isPlayer1) {
                gamesWon += p1Games;
                gamesLost += p2Games;
                if (p1Games > p2Games) setsWon++; else setsLost++;
            } else {
                gamesWon += p2Games;
                gamesLost += p1Games;
                if (p2Games > p1Games) setsWon++; else setsLost++;
            }
        }

        // Set 3 (super tie-break)
        if (match.score_p1_set3 !== null && match.score_p2_set3 !== null) {
            const p1Games = match.score_p1_set3;
            const p2Games = match.score_p2_set3;

            if (isPlayer1) {
                gamesWon += p1Games;
                gamesLost += p2Games;
                if (p1Games > p2Games) setsWon++; else setsLost++;
            } else {
                gamesWon += p2Games;
                gamesLost += p1Games;
                if (p2Games > p1Games) setsWon++; else setsLost++;
            }
        }
    });

    return {
        setDiff: setsWon - setsLost,
        gameDiff: gamesWon - gamesLost,
        setsWon,
        setsLost,
        gamesWon,
        gamesLost
    };
}

/**
 * Resuelve empate entre 2 jugadores (el que ganó al otro queda delante)
 */
async function resolveTwoWayTie(groupId, player1, player2) {
    const matches = await getHeadToHeadMatches(groupId, [player1.player_id, player2.player_id]);

    const directMatch = matches.find(m =>
        (m.player1_id === player1.player_id && m.player2_id === player2.player_id) ||
        (m.player1_id === player2.player_id && m.player2_id === player1.player_id)
    );

    if (directMatch && directMatch.winner_id) {
        if (directMatch.winner_id === player1.player_id) {
            return [player1, player2];
        } else {
            return [player2, player1];
        }
    }

    // Si no hay enfrentamiento directo, usar diferencia de sets/juegos general
    const p1SetDiff = player1.sets_won - player1.sets_lost;
    const p2SetDiff = player2.sets_won - player2.sets_lost;

    if (p1SetDiff !== p2SetDiff) {
        return p1SetDiff > p2SetDiff ? [player1, player2] : [player2, player1];
    }

    const p1GameDiff = player1.games_won - player1.games_lost;
    const p2GameDiff = player2.games_won - player2.games_lost;

    if (p1GameDiff !== p2GameDiff) {
        return p1GameDiff > p2GameDiff ? [player1, player2] : [player2, player1];
    }

    // Sorteo (orden aleatorio)
    console.log(`    ⚠️ Sorteo entre ${player1.playerName} y ${player2.playerName}`);
    return Math.random() > 0.5 ? [player1, player2] : [player2, player1];
}

/**
 * Resuelve empate entre 3 o más jugadores
 */
async function resolveMultiWayTie(groupId, tiedPlayers) {
    const playerIds = tiedPlayers.map(p => p.player_id);
    const h2hMatches = await getHeadToHeadMatches(groupId, playerIds);

    // Calcular estadísticas de enfrentamientos directos
    const playersWithH2H = tiedPlayers.map(p => {
        const h2hStats = calculateHeadToHeadStats(h2hMatches, p.player_id);
        return {
            ...p,
            h2hSetDiff: h2hStats.setDiff,
            h2hGameDiff: h2hStats.gameDiff
        };
    });

    // Paso a: Ordenar por diferencia de sets en enfrentamientos directos
    playersWithH2H.sort((a, b) => b.h2hSetDiff - a.h2hSetDiff);

    // Verificar si hay empate aún
    const setDiffs = [...new Set(playersWithH2H.map(p => p.h2hSetDiff))];
    if (setDiffs.length === playersWithH2H.length) {
        return playersWithH2H; // Todos diferentes, resuelto
    }

    // Paso b: Ordenar por diferencia de juegos en enfrentamientos directos
    playersWithH2H.sort((a, b) => {
        if (b.h2hSetDiff !== a.h2hSetDiff) return b.h2hSetDiff - a.h2hSetDiff;
        return b.h2hGameDiff - a.h2hGameDiff;
    });

    const gameDiffs = playersWithH2H.map(p => `${p.h2hSetDiff}-${p.h2hGameDiff}`);
    const uniqueDiffs = [...new Set(gameDiffs)];
    if (uniqueDiffs.length === playersWithH2H.length) {
        return playersWithH2H; // Todos diferentes, resuelto
    }

    // Paso c: Sorteo para los que sigan empatados
    console.log(`    ⚠️ Sorteo necesario para empate múltiple`);

    // Agrupar por empate y hacer sorteo dentro de cada grupo
    const groups = {};
    playersWithH2H.forEach(p => {
        const key = `${p.h2hSetDiff}-${p.h2hGameDiff}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(p);
    });

    const result = [];
    Object.values(groups).forEach(group => {
        // Shuffle (Fisher-Yates)
        for (let i = group.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [group[i], group[j]] = [group[j], group[i]];
        }
        result.push(...group);
    });

    // Reordenar manteniendo el orden general
    return playersWithH2H.sort((a, b) => {
        if (b.h2hSetDiff !== a.h2hSetDiff) return b.h2hSetDiff - a.h2hSetDiff;
        if (b.h2hGameDiff !== a.h2hGameDiff) return b.h2hGameDiff - a.h2hGameDiff;
        return result.indexOf(a) - result.indexOf(b);
    });
}

/**
 * Clasifica jugadores de un grupo aplicando criterios de desempate
 */
async function classifyGroup(group, groupPlayers) {
    // Ordenar inicialmente por puntos
    let sorted = [...groupPlayers].sort((a, b) => b.group_points - a.group_points);

    // Buscar empates y resolverlos
    const result = [];
    let i = 0;

    while (i < sorted.length) {
        const currentPoints = sorted[i].group_points;
        const tiedPlayers = [];

        // Encontrar todos los jugadores con los mismos puntos
        while (i < sorted.length && sorted[i].group_points === currentPoints) {
            tiedPlayers.push(sorted[i]);
            i++;
        }

        if (tiedPlayers.length === 1) {
            result.push(tiedPlayers[0]);
        } else if (tiedPlayers.length === 2) {
            const resolved = await resolveTwoWayTie(group.id, tiedPlayers[0], tiedPlayers[1]);
            result.push(...resolved);
        } else {
            const resolved = await resolveMultiWayTie(group.id, tiedPlayers);
            result.push(...resolved);
        }
    }

    // Asignar posiciones
    return result.map((p, idx) => ({
        ...p,
        position: idx + 1
    }));
}

// ========================================
// LÓGICA DE ASCENSOS/DESCENSOS
// ========================================

/**
 * Calcula el nuevo grupo para un jugador según su posición
 * @param {number} currentGroup - Índice del grupo actual (1 = primer grupo)
 * @param {number} position - Posición en el grupo (1-4 o 1-5)
 * @param {number} totalGroups - Número total de grupos
 * @param {number} groupSize - Tamaño del grupo (4 o 5)
 */
function calculateNewGroup(currentGroup, position, totalGroups, groupSize) {
    const isFirstGroup = currentGroup === 1;
    const isSecondGroup = currentGroup === 2;
    const isLastGroup = currentGroup === totalGroups;
    const isPenultimateGroup = currentGroup === totalGroups - 1;

    // Grupo de 5 jugadores: el 3º se queda
    if (groupSize === 5 && position === 3) {
        return currentGroup;
    }

    // Primer Grupo
    if (isFirstGroup) {
        switch (position) {
            case 1: return 1;  // Permanece
            case 2: return 2;  // Baja 1
            case 3: return 2;  // Baja 1
            case 4: return 3;  // Baja 2
            case 5: return 3;  // Baja 2 (si hay 5)
            default: return currentGroup;
        }
    }

    // Segundo Grupo
    if (isSecondGroup) {
        switch (position) {
            case 1: return 1;  // Sube 1
            case 2: return 1;  // Sube 1
            case 3: return 3;  // Baja 1
            case 4: return 4;  // Baja 2
            case 5: return 4;  // Baja 2 (si hay 5)
            default: return currentGroup;
        }
    }

    // Último Grupo (criterio inverso al primero)
    if (isLastGroup) {
        switch (position) {
            case 1: return Math.max(1, totalGroups - 2);  // Sube 2
            case 2: return Math.max(1, totalGroups - 1);  // Sube 1
            case 3: return Math.max(1, totalGroups - 1);  // Sube 1
            case 4: return totalGroups;  // Permanece
            case 5: return totalGroups;  // Permanece (si hay 5)
            default: return currentGroup;
        }
    }

    // Penúltimo Grupo (criterio inverso al segundo)
    if (isPenultimateGroup) {
        switch (position) {
            case 1: return Math.max(1, totalGroups - 3);  // Sube 2
            case 2: return Math.max(1, totalGroups - 2);  // Sube 1
            case 3: return totalGroups;  // Baja 1
            case 4: return totalGroups;  // Se queda en último (no puede bajar más)
            case 5: return totalGroups;  // Se queda en último
            default: return currentGroup;
        }
    }

    // Resto de grupos (regla general)
    switch (position) {
        case 1: return Math.max(1, currentGroup - 2);  // Sube 2
        case 2: return Math.max(1, currentGroup - 1);  // Sube 1
        case 3: return Math.min(totalGroups, currentGroup + 1);  // Baja 1
        case 4: return Math.min(totalGroups, currentGroup + 2);  // Baja 2
        case 5: return Math.min(totalGroups, currentGroup + 2);  // Baja 2 (si hay 5)
        default: return currentGroup;
    }
}

// ========================================
// GENERACIÓN DE NUEVA SERIE
// ========================================

async function main() {
    console.log('==============================================');
    console.log(`GENERADOR AUTOMÁTICO DE SERIE ${TARGET_SERIES_NUMBER}`);
    console.log('==============================================\n');

    // 1. Login
    console.log('Iniciando sesión...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
    });

    if (authError) {
        console.error('Error de autenticación:', authError.message);
        return;
    }
    console.log(`✓ Sesión iniciada\n`);

    // 2. Buscar serie de origen
    console.log(`Buscando Serie ${SOURCE_SERIES_NUMBER}...`);
    const { data: series, error: seriesError } = await supabase
        .from('series')
        .select('*')
        .order('start_date', { ascending: true });

    if (seriesError) {
        console.error('Error buscando series:', seriesError);
        return;
    }

    const sourceSeries = series.find(s => s.name.toLowerCase().includes(`serie ${SOURCE_SERIES_NUMBER}`));
    if (!sourceSeries) {
        console.error(`No se encontró Serie ${SOURCE_SERIES_NUMBER}`);
        return;
    }
    console.log(`✓ Serie origen: "${sourceSeries.name}" (ID: ${sourceSeries.id})\n`);

    // 3. Verificar si ya existe la serie destino
    const existingSeries = series.find(s => s.name.toLowerCase().includes(`serie ${TARGET_SERIES_NUMBER}`) || s.name === `Serie ${TARGET_SERIES_NUMBER}`);
    if (existingSeries) {
        if (FORCE_REGENERATE) {
            console.log(`⚠️ Serie ${TARGET_SERIES_NUMBER} ya existe. Eliminando para regenerar...`);
            const { error: deleteError } = await supabase
                .from('series')
                .delete()
                .eq('id', existingSeries.id);
            if (deleteError) {
                console.error('Error eliminando serie:', deleteError);
                return;
            }
            console.log(`✓ Serie anterior eliminada\n`);
        } else {
            console.log(`⚠️ Serie ${TARGET_SERIES_NUMBER} ya existe. ¿Desea regenerarla? (Esto borrará los datos existentes)`);
            console.log('   Para continuar, establezca FORCE_REGENERATE = true o elimine manualmente la serie');
            return;
        }
    }

    // 4. Obtener grupos de la serie origen
    console.log('Obteniendo grupos y jugadores...');
    const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .eq('series_id', sourceSeries.id)
        .order('level_index');

    if (groupsError) {
        console.error('Error obteniendo grupos:', groupsError);
        return;
    }
    console.log(`✓ ${groups.length} grupos encontrados\n`);

    // 5. Obtener jugadores de cada grupo con sus estadísticas
    const { data: allGroupPlayers, error: gpError } = await supabase
        .from('group_players')
        .select(`
            *,
            players:player_id (id, name)
        `)
        .in('group_id', groups.map(g => g.id));

    if (gpError) {
        console.error('Error obteniendo jugadores:', gpError);
        return;
    }

    // Añadir nombre del jugador
    const groupPlayersWithNames = allGroupPlayers.map(gp => ({
        ...gp,
        playerName: gp.players?.name || 'Desconocido'
    }));

    // 6. Clasificar cada grupo y calcular nuevo grupo
    console.log('=== CLASIFICACIONES Y MOVIMIENTOS ===\n');

    const playerMovements = []; // {playerId, playerName, fromGroup, toGroup}

    for (const group of groups) {
        const groupPlayers = groupPlayersWithNames.filter(gp => gp.group_id === group.id);

        if (groupPlayers.length === 0) {
            console.log(`Grupo ${group.level_index}: Sin jugadores`);
            continue;
        }

        console.log(`📋 Grupo ${group.level_index} (${groupPlayers.length} jugadores):`);

        // Clasificar con desempates
        const classified = await classifyGroup(group, groupPlayers);

        // Calcular movimientos
        classified.forEach(player => {
            const newGroup = calculateNewGroup(
                group.level_index,
                player.position,
                groups.length,
                groupPlayers.length
            );

            const movement = newGroup < group.level_index ? '⬆️' :
                            newGroup > group.level_index ? '⬇️' : '➡️';

            console.log(`   ${player.position}º ${player.playerName} (${player.group_points} pts) → Grupo ${newGroup} ${movement}`);

            playerMovements.push({
                playerId: player.player_id,
                playerName: player.playerName,
                fromGroup: group.level_index,
                toGroup: newGroup,
                position: player.position
            });
        });
        console.log('');
    }

    // 7. Crear nueva serie
    console.log('=== CREANDO NUEVA SERIE ===\n');

    const { data: newSeries, error: newSeriesError } = await supabase
        .from('series')
        .insert([{
            name: `Serie ${TARGET_SERIES_NUMBER}`,
            start_date: NEW_SERIES_START_DATE,
            end_date: NEW_SERIES_END_DATE,
            is_active: false,  // Oculta hasta que admin la active
            status: 'pending'
        }])
        .select()
        .single();

    if (newSeriesError) {
        console.error('Error creando serie:', newSeriesError);
        return;
    }
    console.log(`✓ Serie ${TARGET_SERIES_NUMBER} creada (ID: ${newSeries.id})`);
    console.log(`  ⚠️ Estado: OCULTA (is_active: false)\n`);

    // 8. Agrupar jugadores por nuevo grupo
    const newGroupAssignments = {};
    playerMovements.forEach(pm => {
        if (!newGroupAssignments[pm.toGroup]) {
            newGroupAssignments[pm.toGroup] = [];
        }
        newGroupAssignments[pm.toGroup].push(pm);
    });

    // 9. Crear grupos de la nueva serie
    console.log('Creando grupos...');

    const maxGroup = Math.max(...Object.keys(newGroupAssignments).map(Number));
    const createdGroups = {};

    for (let i = 1; i <= maxGroup; i++) {
        const { data: newGroup, error: newGroupError } = await supabase
            .from('groups')
            .insert([{
                series_id: newSeries.id,
                name: `Grupo ${i}`,
                level_index: i
            }])
            .select()
            .single();

        if (newGroupError) {
            console.error(`Error creando grupo ${i}:`, newGroupError);
            continue;
        }

        createdGroups[i] = newGroup.id;
    }
    console.log(`✓ ${Object.keys(createdGroups).length} grupos creados\n`);

    // 10. Asignar jugadores a los nuevos grupos
    console.log('Asignando jugadores a grupos...');

    let assignedCount = 0;
    for (const [groupIndex, players] of Object.entries(newGroupAssignments)) {
        const groupId = createdGroups[groupIndex];
        if (!groupId) continue;

        for (const player of players) {
            const { error: assignError } = await supabase
                .from('group_players')
                .insert([{
                    group_id: groupId,
                    player_id: player.playerId,
                    matches_played: 0,
                    matches_won: 0,
                    matches_lost: 0,
                    sets_won: 0,
                    sets_lost: 0,
                    games_won: 0,
                    games_lost: 0,
                    group_points: 0
                }]);

            if (assignError) {
                console.error(`Error asignando ${player.playerName}:`, assignError);
            } else {
                assignedCount++;
            }
        }
    }
    console.log(`✓ ${assignedCount} jugadores asignados\n`);

    // 11. Resumen final
    console.log('==============================================');
    console.log('RESUMEN');
    console.log('==============================================');
    console.log(`Serie creada: ${newSeries.name}`);
    console.log(`Grupos: ${Object.keys(createdGroups).length}`);
    console.log(`Jugadores: ${assignedCount}`);
    console.log(`Estado: OCULTA (para revisión del admin)`);
    console.log('');
    console.log('📌 Próximos pasos:');
    console.log('   1. Revisar asignaciones en el panel de admin');
    console.log('   2. Hacer ajustes manuales si es necesario');
    console.log('   3. Activar la serie (is_active = true) cuando esté lista');
    console.log('==============================================');
}

main().catch(console.error);
