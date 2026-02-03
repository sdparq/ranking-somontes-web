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

const SOURCE_SERIES_NUMBER = 4;
const TARGET_SERIES_NUMBER = 5;
const NEW_SERIES_START_DATE = '2025-04-15';
const NEW_SERIES_END_DATE = '2025-05-15';
const FORCE_REGENERATE = true;

// Tamaño estándar de grupos
const STANDARD_GROUP_SIZE = 4;

// ========================================
// LÓGICA DE DESEMPATES
// ========================================

async function getHeadToHeadMatches(groupId, playerIds) {
    const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .eq('group_id', groupId);

    if (error) return [];
    return matches.filter(m =>
        playerIds.includes(m.player1_id) && playerIds.includes(m.player2_id)
    );
}

function calculateHeadToHeadStats(matches, playerId) {
    let setsWon = 0, setsLost = 0;
    let gamesWon = 0, gamesLost = 0;

    matches.forEach(match => {
        const isPlayer1 = match.player1_id === playerId;

        [[match.score_p1_set1, match.score_p2_set1],
         [match.score_p1_set2, match.score_p2_set2],
         [match.score_p1_set3, match.score_p2_set3]].forEach(([p1, p2]) => {
            if (p1 !== null && p2 !== null) {
                if (isPlayer1) {
                    gamesWon += p1; gamesLost += p2;
                    if (p1 > p2) setsWon++; else setsLost++;
                } else {
                    gamesWon += p2; gamesLost += p1;
                    if (p2 > p1) setsWon++; else setsLost++;
                }
            }
        });
    });

    return { setDiff: setsWon - setsLost, gameDiff: gamesWon - gamesLost };
}

async function resolveTwoWayTie(groupId, player1, player2) {
    const matches = await getHeadToHeadMatches(groupId, [player1.player_id, player2.player_id]);
    const directMatch = matches.find(m =>
        (m.player1_id === player1.player_id && m.player2_id === player2.player_id) ||
        (m.player1_id === player2.player_id && m.player2_id === player1.player_id)
    );

    if (directMatch && directMatch.winner_id) {
        return directMatch.winner_id === player1.player_id ? [player1, player2] : [player2, player1];
    }

    // Diferencia de sets general
    const p1SetDiff = (player1.sets_won || 0) - (player1.sets_lost || 0);
    const p2SetDiff = (player2.sets_won || 0) - (player2.sets_lost || 0);
    if (p1SetDiff !== p2SetDiff) return p1SetDiff > p2SetDiff ? [player1, player2] : [player2, player1];

    // Diferencia de juegos
    const p1GameDiff = (player1.games_won || 0) - (player1.games_lost || 0);
    const p2GameDiff = (player2.games_won || 0) - (player2.games_lost || 0);
    if (p1GameDiff !== p2GameDiff) return p1GameDiff > p2GameDiff ? [player1, player2] : [player2, player1];

    // Sorteo
    return Math.random() > 0.5 ? [player1, player2] : [player2, player1];
}

async function resolveMultiWayTie(groupId, tiedPlayers) {
    const playerIds = tiedPlayers.map(p => p.player_id);
    const h2hMatches = await getHeadToHeadMatches(groupId, playerIds);

    const playersWithH2H = tiedPlayers.map(p => {
        const stats = calculateHeadToHeadStats(h2hMatches, p.player_id);
        return { ...p, h2hSetDiff: stats.setDiff, h2hGameDiff: stats.gameDiff };
    });

    playersWithH2H.sort((a, b) => {
        if (b.h2hSetDiff !== a.h2hSetDiff) return b.h2hSetDiff - a.h2hSetDiff;
        if (b.h2hGameDiff !== a.h2hGameDiff) return b.h2hGameDiff - a.h2hGameDiff;
        return Math.random() - 0.5; // Sorteo
    });

    return playersWithH2H;
}

async function classifyGroup(group, groupPlayers) {
    let sorted = [...groupPlayers].sort((a, b) => (b.group_points || 0) - (a.group_points || 0));
    const result = [];
    let i = 0;

    while (i < sorted.length) {
        const currentPoints = sorted[i].group_points || 0;
        const tiedPlayers = [];
        while (i < sorted.length && (sorted[i].group_points || 0) === currentPoints) {
            tiedPlayers.push(sorted[i]);
            i++;
        }

        if (tiedPlayers.length === 1) {
            result.push(tiedPlayers[0]);
        } else if (tiedPlayers.length === 2) {
            result.push(...(await resolveTwoWayTie(group.id, tiedPlayers[0], tiedPlayers[1])));
        } else {
            result.push(...(await resolveMultiWayTie(group.id, tiedPlayers)));
        }
    }

    return result.map((p, idx) => ({ ...p, position: idx + 1 }));
}

// ========================================
// LÓGICA DE ASCENSOS/DESCENSOS - SIMPLIFICADA
// ========================================

/**
 * Asigna movimientos basándose en la posición dentro del grupo.
 * Los grupos de 4 jugadores: 1º,2º suben/quedan, 3º,4º bajan/quedan
 * Los grupos de 5 jugadores: 3º se queda en su grupo
 */
function getMovementForPosition(groupLevel, position, totalGroups, groupSize) {
    const isFirst = groupLevel === 1;
    const isSecond = groupLevel === 2;
    const isLast = groupLevel === totalGroups;
    const isPenultimate = groupLevel === totalGroups - 1;

    // Para grupos de 5, el 3º se queda
    if (groupSize === 5 && position === 3) return 0;

    if (isFirst) {
        // Primer grupo: 1º se queda, 2º-3º bajan 1, 4º baja 2
        if (position === 1) return 0;
        if (position === 2 || position === 3) return 1;
        return 2; // 4º y 5º
    }

    if (isSecond) {
        // Segundo grupo: 1º-2º suben 1, 3º baja 1, 4º baja 2
        if (position === 1 || position === 2) return -1;
        if (position === 3) return 1;
        return 2; // 4º y 5º
    }

    if (isLast) {
        // Último grupo: 1º sube 2, 2º-3º suben 1, 4º se queda
        if (position === 1) return -2;
        if (position === 2 || position === 3) return -1;
        return 0; // 4º y 5º se quedan
    }

    if (isPenultimate) {
        // Penúltimo: 1º-2º suben, 3º-4º bajan/quedan
        if (position === 1) return -2;
        if (position === 2) return -1;
        if (position === 3) return 1;
        return Math.min(1, totalGroups - groupLevel); // No puede bajar más del último
    }

    // Grupos intermedios: 1º sube 2, 2º sube 1, 3º baja 1, 4º baja 2
    if (position === 1) return -2;
    if (position === 2) return -1;
    if (position === 3) return 1;
    return 2; // 4º y 5º
}

// ========================================
// GENERACIÓN PRINCIPAL
// ========================================

async function main() {
    console.log('==============================================');
    console.log(`GENERADOR DE SERIE ${TARGET_SERIES_NUMBER}`);
    console.log('==============================================\n');

    // Login
    const { error: authError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL, password: ADMIN_PASSWORD
    });
    if (authError) { console.error('Auth error:', authError.message); return; }
    console.log('✓ Sesión iniciada\n');

    // Buscar series
    const { data: series } = await supabase.from('series').select('*').order('start_date');
    const sourceSeries = series.find(s => s.name.toLowerCase().includes(`serie ${SOURCE_SERIES_NUMBER}`));
    if (!sourceSeries) { console.error('Serie origen no encontrada'); return; }
    console.log(`✓ Serie origen: ${sourceSeries.name}\n`);

    // Eliminar serie existente si FORCE_REGENERATE
    const existingSeries = series.find(s =>
        s.name.toLowerCase() === `serie ${TARGET_SERIES_NUMBER}` ||
        s.name === `Serie ${TARGET_SERIES_NUMBER}`
    );
    if (existingSeries) {
        if (FORCE_REGENERATE) {
            await supabase.from('series').delete().eq('id', existingSeries.id);
            console.log('✓ Serie anterior eliminada\n');
        } else {
            console.log('Serie ya existe. Use FORCE_REGENERATE=true'); return;
        }
    }

    // Obtener grupos y jugadores de la serie origen
    const { data: groups } = await supabase
        .from('groups')
        .select('*')
        .eq('series_id', sourceSeries.id)
        .order('level_index');

    const { data: allGroupPlayers } = await supabase
        .from('group_players')
        .select('*, players:player_id(id, name)')
        .in('group_id', groups.map(g => g.id));

    const totalGroups = groups.length;
    console.log(`✓ ${totalGroups} grupos, ${allGroupPlayers.length} jugadores\n`);

    // Clasificar cada grupo y calcular nuevo nivel
    console.log('=== CLASIFICACIONES ===\n');
    const playerNewLevels = []; // {playerId, playerName, oldLevel, newLevel}

    for (const group of groups) {
        const groupPlayers = allGroupPlayers.filter(gp => gp.group_id === group.id);
        if (groupPlayers.length === 0) continue;

        const classified = await classifyGroup(group, groupPlayers);
        const groupSize = classified.length;

        console.log(`Grupo ${group.level_index} (${groupSize} jug):`);

        for (const player of classified) {
            const movement = getMovementForPosition(group.level_index, player.position, totalGroups, groupSize);
            let newLevel = group.level_index + movement;
            newLevel = Math.max(1, Math.min(totalGroups, newLevel));

            const arrow = movement < 0 ? '⬆️' : movement > 0 ? '⬇️' : '➡️';
            console.log(`  ${player.position}º ${player.players?.name || 'N/A'} (${player.group_points || 0}pts) → G${newLevel} ${arrow}`);

            playerNewLevels.push({
                playerId: player.player_id,
                playerName: player.players?.name || 'N/A',
                oldLevel: group.level_index,
                newLevel: newLevel,
                position: player.position, // 1-5, posición en grupo original
                points: player.group_points || 0
            });
        }
        console.log('');
    }

    // Agrupar por nuevo nivel inicial
    // IMPORTANTE: Ordenar por mérito (oldLevel asc, luego por puntos desc implícito en el orden de inserción)
    const levelAssignments = {};
    for (let i = 1; i <= totalGroups; i++) levelAssignments[i] = [];

    // Ordenar playerNewLevels por mérito antes de asignar
    // Menor oldLevel = mejor jugador (viene de grupo más alto)
    // Si mismo oldLevel, el orden de inserción ya respeta la clasificación dentro del grupo
    playerNewLevels.forEach(p => {
        levelAssignments[p.newLevel].push(p);
    });

    // Ordenar cada grupo por mérito:
    // 1. Mejor posición primero (1º > 2º > 3º > 4º > 5º)
    // 2. Si misma posición, de grupo más alto primero (menor oldLevel)
    for (let i = 1; i <= totalGroups; i++) {
        levelAssignments[i].sort((a, b) => {
            if (a.position !== b.position) return a.position - b.position;
            return a.oldLevel - b.oldLevel;
        });
    }

    console.log('=== REBALANCEO DE GRUPOS ===\n');

    // Mostrar distribución inicial
    console.log('Distribución inicial:');
    for (let i = 1; i <= totalGroups; i++) {
        const count = levelAssignments[i].length;
        if (count < 4 || count > 5) {
            console.log(`  Grupo ${i}: ${count} jugadores`);
        }
    }

    // Calcular cuántos grupos necesitan 5 jugadores
    const totalPlayers = playerNewLevels.length;
    const groupsWithFive = totalPlayers - (totalGroups * 4); // 180 - 164 = 16 grupos con 5
    console.log(`\nTotal jugadores: ${totalPlayers}`);
    console.log(`Grupos de 4: ${totalGroups - groupsWithFive}`);
    console.log(`Grupos de 5: ${groupsWithFive}`);

    // Rebalancear: permitir grupos de 4 o 5
    // Estrategia: los últimos grupos tendrán 5 jugadores
    const groupSizeTarget = {};
    for (let i = 1; i <= totalGroups; i++) {
        // Los últimos 'groupsWithFive' grupos tendrán 5 jugadores
        groupSizeTarget[i] = i > (totalGroups - groupsWithFive) ? 5 : 4;
    }

    // NUEVO ALGORITMO DE REBALANCEO que respeta el mérito deportivo
    // Mover solo a los jugadores de PEOR mérito (mayor oldLevel) de cada grupo
    let iterations = 0;
    const maxIterations = 500;

    while (iterations < maxIterations) {
        iterations++;
        let moved = false;

        // Buscar grupo con exceso
        for (let level = 1; level <= totalGroups; level++) {
            const target = groupSizeTarget[level];

            // Si tiene más jugadores de los que debería
            while (levelAssignments[level].length > target) {
                // Ordenar por mérito: mejor posición primero, luego mejor grupo
                // Sacar al de PEOR mérito (último = peor posición, o mismo pos pero grupo más bajo)
                levelAssignments[level].sort((a, b) => {
                    if (a.position !== b.position) return a.position - b.position;
                    return a.oldLevel - b.oldLevel;
                });
                const playerToMove = levelAssignments[level].pop(); // El de peor mérito

                // Buscar el grupo más cercano HACIA ABAJO que necesite jugadores
                let found = false;
                for (let targetLevel = level + 1; targetLevel <= totalGroups && !found; targetLevel++) {
                    if (levelAssignments[targetLevel].length < groupSizeTarget[targetLevel]) {
                        levelAssignments[targetLevel].push(playerToMove);
                        playerToMove.newLevel = targetLevel;
                        found = true;
                        moved = true;
                    }
                }

                // Si no hay espacio abajo, buscar arriba (pero esto no debería pasar normalmente)
                if (!found) {
                    for (let targetLevel = level - 1; targetLevel >= 1 && !found; targetLevel--) {
                        if (levelAssignments[targetLevel].length < groupSizeTarget[targetLevel]) {
                            levelAssignments[targetLevel].push(playerToMove);
                            playerToMove.newLevel = targetLevel;
                            found = true;
                            moved = true;
                        }
                    }
                }

                if (!found) {
                    // No se encontró hueco, devolverlo
                    levelAssignments[level].push(playerToMove);
                    break;
                }
            }
        }

        // Rellenar grupos con déficit tomando del grupo inferior
        for (let level = totalGroups; level >= 1; level--) {
            const target = groupSizeTarget[level];

            while (levelAssignments[level].length < target) {
                // Buscar en el grupo inferior al que le sobre
                let found = false;
                for (let sourceLevel = level + 1; sourceLevel <= totalGroups && !found; sourceLevel++) {
                    if (levelAssignments[sourceLevel].length > groupSizeTarget[sourceLevel]) {
                        // Ordenar por mérito y tomar al MEJOR (primero = mejor posición, mejor grupo)
                        levelAssignments[sourceLevel].sort((a, b) => {
                            if (a.position !== b.position) return a.position - b.position;
                            return a.oldLevel - b.oldLevel;
                        });
                        const playerToMove = levelAssignments[sourceLevel].shift(); // El de mejor mérito sube
                        levelAssignments[level].push(playerToMove);
                        playerToMove.newLevel = level;
                        found = true;
                    }
                }

                if (!found) break;
            }
        }

        // Verificar si ya está balanceado
        let balanced = true;
        for (let i = 1; i <= totalGroups; i++) {
            if (levelAssignments[i].length !== groupSizeTarget[i]) {
                balanced = false;
                break;
            }
        }

        if (balanced || !moved) break;
    }

    console.log(`\nIteraciones de rebalanceo: ${iterations}`);

    // Mostrar distribución final
    console.log('\nDistribución final:');
    let totalFinal = 0;
    let allOk = true;
    for (let i = 1; i <= totalGroups; i++) {
        const count = levelAssignments[i].length;
        totalFinal += count;
        const target = groupSizeTarget[i];
        const status = count === target ? '✓' : '⚠️';
        if (count !== target) allOk = false;
        console.log(`  ${status} Grupo ${i}: ${count} jugadores (objetivo: ${target})`);
    }
    console.log(`Total: ${totalFinal} jugadores`);

    if (!allOk) {
        console.log('\n⚠️ ADVERTENCIA: No se pudo balancear perfectamente');
    } else {
        console.log('\n✓ Grupos balanceados correctamente');
    }

    // Crear nueva serie
    console.log('=== CREANDO SERIE ===\n');
    const { data: newSeries, error: seriesError } = await supabase
        .from('series')
        .insert([{
            name: `Serie ${TARGET_SERIES_NUMBER}`,
            start_date: NEW_SERIES_START_DATE,
            end_date: NEW_SERIES_END_DATE,
            is_active: false,
            status: 'pending'
        }])
        .select()
        .single();

    if (seriesError) { console.error('Error creando serie:', seriesError); return; }
    console.log(`✓ Serie ${TARGET_SERIES_NUMBER} creada (OCULTA)\n`);

    // Crear grupos
    const createdGroups = {};
    for (let i = 1; i <= totalGroups; i++) {
        const { data: newGroup } = await supabase
            .from('groups')
            .insert([{ series_id: newSeries.id, name: `Grupo ${i}`, level_index: i }])
            .select()
            .single();
        createdGroups[i] = newGroup.id;
    }
    console.log(`✓ ${totalGroups} grupos creados\n`);

    // Asignar jugadores
    let assigned = 0;
    for (let level = 1; level <= totalGroups; level++) {
        const groupId = createdGroups[level];
        for (const player of levelAssignments[level]) {
            await supabase.from('group_players').insert([{
                group_id: groupId,
                player_id: player.playerId,
                matches_played: 0, matches_won: 0, matches_lost: 0,
                sets_won: 0, sets_lost: 0, games_won: 0, games_lost: 0, group_points: 0
            }]);
            assigned++;
        }
    }
    console.log(`✓ ${assigned} jugadores asignados\n`);

    console.log('==============================================');
    console.log('COMPLETADO');
    console.log(`Serie ${TARGET_SERIES_NUMBER}: ${totalGroups} grupos, ${assigned} jugadores`);
    console.log('Estado: OCULTA - Actívala desde el admin cuando esté lista');
    console.log('==============================================');
}

main().catch(console.error);
