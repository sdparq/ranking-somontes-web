// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL = 'https://hgpoanynlpgtcubmuddi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncG9hbnlubHBndGN1Ym11ZGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MTYwNjcsImV4cCI6MjA4NTE5MjA2N30.YQBPEvgjoyCSG47S8YtdnnQHwNjqZrcF_WGMT-gCadQ';

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        storage: window.localStorage
    }
});

// ========================================
// AUTH FUNCTIONS
// ========================================

async function signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });
    return { data, error };
}

async function signUp(email, password) {
    const { data, error } = await supabaseClient.auth.signUp({
        email,
        password
    });
    return { data, error };
}

async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    return { error };
}

async function getSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    return { session, error };
}

async function getUser() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    return { user, error };
}

async function checkIsAdmin(userId) {
    if (!userId) return false;

    const { data, error } = await supabaseClient.rpc('has_role', {
        _role: 'admin',
        _user_id: userId
    });

    if (error) {
        console.error('Error checking admin role:', error);
        return false;
    }

    return data === true;
}

// ========================================
// DATA FETCHING FUNCTIONS
// ========================================

// Players
async function fetchPlayersPublic() {
    const { data, error } = await supabaseClient
        .from('players_public')
        .select('*')
        .eq('is_active', true)
        .order('current_atp_points', { ascending: false });

    if (error) throw error;
    return data;
}

// Players with contact info (requires directory password)
async function fetchPlayersWithContact() {
    const { data, error } = await supabaseClient
        .from('players')
        .select('id, name, email, phone, current_atp_points, is_active')
        .eq('is_active', true)
        .order('current_atp_points', { ascending: false });

    if (error) throw error;
    return data;
}

async function fetchPlayers() {
    const { data, error } = await supabaseClient
        .from('players')
        .select('*')
        .order('name');

    if (error) throw error;
    return data;
}

async function createPlayer(playerData) {
    const { data, error } = await supabaseClient
        .from('players')
        .insert([playerData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function updatePlayer(id, playerData) {
    const { data, error } = await supabaseClient
        .from('players')
        .update(playerData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function deletePlayer(id) {
    const { error } = await supabaseClient
        .from('players')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// Series - Para usuarios públicos (solo series visibles)
async function fetchSeries() {
    const { data, error } = await supabaseClient
        .from('series')
        .select('*')
        .eq('is_active', true)  // Solo series activas/visibles
        .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
}

// Series - Para admin (todas las series, incluyendo ocultas)
async function fetchAllSeries() {
    const { data, error } = await supabaseClient
        .from('series')
        .select('*')
        .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
}

async function createSeries(seriesData) {
    const { data, error } = await supabaseClient
        .from('series')
        .insert([seriesData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function updateSeries(id, seriesData) {
    const { data, error } = await supabaseClient
        .from('series')
        .update(seriesData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function deleteSeries(id) {
    const { error } = await supabaseClient
        .from('series')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// Groups
async function fetchGroups(seriesId) {
    let query = supabaseClient
        .from('groups')
        .select(`
            *,
            group_players (
                *,
                players:player_id (id, name, current_atp_points)
            )
        `)
        .order('level_index');

    if (seriesId) {
        query = query.eq('series_id', seriesId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
}

async function createGroup(groupData) {
    const { data, error } = await supabaseClient
        .from('groups')
        .insert([groupData])
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function updateGroup(id, groupData) {
    const { data, error } = await supabaseClient
        .from('groups')
        .update(groupData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function deleteGroup(id) {
    const { error } = await supabaseClient
        .from('groups')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

async function addPlayerToGroup(groupId, playerId) {
    const { data, error } = await supabaseClient
        .from('group_players')
        .insert([{
            group_id: groupId,
            player_id: playerId,
            matches_played: 0,
            matches_won: 0,
            matches_lost: 0,
            sets_won: 0,
            sets_lost: 0,
            group_points: 0
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function removePlayerFromGroup(groupId, playerId) {
    const { error } = await supabaseClient
        .from('group_players')
        .delete()
        .eq('group_id', groupId)
        .eq('player_id', playerId);

    if (error) throw error;
}

// Matches
async function fetchMatches(groupId) {
    let query = supabaseClient
        .from('matches')
        .select(`
            *,
            player1:player1_id (id, name),
            player2:player2_id (id, name)
        `)
        .order('played_at', { ascending: false });

    if (groupId) {
        query = query.eq('group_id', groupId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
}

async function createMatch(matchData) {
    const { data, error } = await supabaseClient
        .from('matches')
        .insert([matchData])
        .select()
        .single();

    if (error) throw error;

    // Update stats after creating match
    await updatePlayerStats(matchData);

    return data;
}

async function updateMatch(id, matchData) {
    // First get the old match to revert stats
    const { data: oldMatch } = await supabaseClient
        .from('matches')
        .select('*')
        .eq('id', id)
        .single();

    if (oldMatch) {
        await revertPlayerStats(oldMatch);
    }

    const { data, error } = await supabaseClient
        .from('matches')
        .update(matchData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    // Update stats with new match data
    await updatePlayerStats(matchData);

    return data;
}

async function deleteMatch(id) {
    // First get the match to revert stats
    const { data: match } = await supabaseClient
        .from('matches')
        .select('*')
        .eq('id', id)
        .single();

    if (match) {
        await revertPlayerStats(match);
    }

    const { error } = await supabaseClient
        .from('matches')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// Stats calculation helpers
async function updatePlayerStats(match) {
    if (!match.winner_id) return;

    const p1Sets = calculateSetsWon(match, 1);
    const p2Sets = calculateSetsWon(match, 2);

    const isP1Winner = match.winner_id === match.player1_id;
    const bonus = (isP1Winner && p1Sets === 2 && p2Sets === 0) || (!isP1Winner && p2Sets === 2 && p1Sets === 0) ? 1 : 0;

    // Get current stats for player 1
    const { data: p1Data } = await supabaseClient
        .from('group_players')
        .select('*')
        .eq('group_id', match.group_id)
        .eq('player_id', match.player1_id)
        .single();

    if (p1Data) {
        await supabaseClient
            .from('group_players')
            .update({
                matches_played: (p1Data.matches_played || 0) + 1,
                matches_won: (p1Data.matches_won || 0) + (isP1Winner ? 1 : 0),
                matches_lost: (p1Data.matches_lost || 0) + (isP1Winner ? 0 : 1),
                sets_won: (p1Data.sets_won || 0) + p1Sets,
                sets_lost: (p1Data.sets_lost || 0) + p2Sets,
                group_points: (p1Data.group_points || 0) + (isP1Winner ? (2 + bonus) : 0)
            })
            .eq('group_id', match.group_id)
            .eq('player_id', match.player1_id);
    }

    // Get current stats for player 2
    const { data: p2Data } = await supabaseClient
        .from('group_players')
        .select('*')
        .eq('group_id', match.group_id)
        .eq('player_id', match.player2_id)
        .single();

    if (p2Data) {
        await supabaseClient
            .from('group_players')
            .update({
                matches_played: (p2Data.matches_played || 0) + 1,
                matches_won: (p2Data.matches_won || 0) + (isP1Winner ? 0 : 1),
                matches_lost: (p2Data.matches_lost || 0) + (isP1Winner ? 1 : 0),
                sets_won: (p2Data.sets_won || 0) + p2Sets,
                sets_lost: (p2Data.sets_lost || 0) + p1Sets,
                group_points: (p2Data.group_points || 0) + (isP1Winner ? 0 : (2 + bonus))
            })
            .eq('group_id', match.group_id)
            .eq('player_id', match.player2_id);
    }
}

async function revertPlayerStats(match) {
    if (!match.winner_id) return;

    const p1Sets = calculateSetsWon(match, 1);
    const p2Sets = calculateSetsWon(match, 2);

    const isP1Winner = match.winner_id === match.player1_id;
    const bonus = (isP1Winner && p1Sets === 2 && p2Sets === 0) || (!isP1Winner && p2Sets === 2 && p1Sets === 0) ? 1 : 0;

    // Get current stats for player 1
    const { data: p1Data } = await supabaseClient
        .from('group_players')
        .select('*')
        .eq('group_id', match.group_id)
        .eq('player_id', match.player1_id)
        .single();

    if (p1Data) {
        await supabaseClient
            .from('group_players')
            .update({
                matches_played: Math.max(0, (p1Data.matches_played || 0) - 1),
                matches_won: Math.max(0, (p1Data.matches_won || 0) - (isP1Winner ? 1 : 0)),
                matches_lost: Math.max(0, (p1Data.matches_lost || 0) - (isP1Winner ? 0 : 1)),
                sets_won: Math.max(0, (p1Data.sets_won || 0) - p1Sets),
                sets_lost: Math.max(0, (p1Data.sets_lost || 0) - p2Sets),
                group_points: Math.max(0, (p1Data.group_points || 0) - (isP1Winner ? (2 + bonus) : 0))
            })
            .eq('group_id', match.group_id)
            .eq('player_id', match.player1_id);
    }

    // Get current stats for player 2
    const { data: p2Data } = await supabaseClient
        .from('group_players')
        .select('*')
        .eq('group_id', match.group_id)
        .eq('player_id', match.player2_id)
        .single();

    if (p2Data) {
        await supabaseClient
            .from('group_players')
            .update({
                matches_played: Math.max(0, (p2Data.matches_played || 0) - 1),
                matches_won: Math.max(0, (p2Data.matches_won || 0) - (isP1Winner ? 0 : 1)),
                matches_lost: Math.max(0, (p2Data.matches_lost || 0) - (isP1Winner ? 1 : 0)),
                sets_won: Math.max(0, (p2Data.sets_won || 0) - p2Sets),
                sets_lost: Math.max(0, (p2Data.sets_lost || 0) - p1Sets),
                group_points: Math.max(0, (p2Data.group_points || 0) - (isP1Winner ? 0 : (2 + bonus)))
            })
            .eq('group_id', match.group_id)
            .eq('player_id', match.player2_id);
    }
}

function calculateSetsWon(match, player) {
    let sets = 0;

    if (player === 1) {
        if (match.score_p1_set1 !== null && match.score_p2_set1 !== null && match.score_p1_set1 > match.score_p2_set1) sets++;
        if (match.score_p1_set2 !== null && match.score_p2_set2 !== null && match.score_p1_set2 > match.score_p2_set2) sets++;
        if (match.score_p1_set3 !== null && match.score_p2_set3 !== null && match.score_p1_set3 > match.score_p2_set3) sets++;
    } else {
        if (match.score_p1_set1 !== null && match.score_p2_set1 !== null && match.score_p2_set1 > match.score_p1_set1) sets++;
        if (match.score_p1_set2 !== null && match.score_p2_set2 !== null && match.score_p2_set2 > match.score_p1_set2) sets++;
        if (match.score_p1_set3 !== null && match.score_p2_set3 !== null && match.score_p2_set3 > match.score_p1_set3) sets++;
    }

    return sets;
}

// Stats
async function fetchStats() {
    try {
        const [playersRes, groupsRes, matchesRes] = await Promise.all([
            supabaseClient.from('players').select('current_atp_points', { count: 'exact' }).eq('is_active', true),
            supabaseClient.from('groups').select('id', { count: 'exact' }),
            supabaseClient.from('matches').select('id', { count: 'exact' })
        ]);

        const players = playersRes.data || [];
        const topScore = players.length > 0
            ? Math.max(...players.map(p => p.current_atp_points || 0))
            : 0;

        return {
            totalPlayers: playersRes.count || 0,
            totalGroups: groupsRes.count || 0,
            totalMatches: matchesRes.count || 0,
            topScore
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        return {
            totalPlayers: 0,
            totalGroups: 0,
            totalMatches: 0,
            topScore: 0
        };
    }
}

// Coefficients mapping
function getCoefficient(levelIndex) {
    const coefficients = {
        1: 1000, 2: 1000, 3: 1000,
        4: 500, 5: 500, 6: 500, 7: 500,
        8: 250, 9: 250, 10: 250, 11: 250, 12: 250,
        13: 125, 14: 125, 15: 125, 16: 125, 17: 125,
        18: 75, 19: 75, 20: 75, 21: 75,
        22: 45, 23: 45, 24: 45, 25: 45,
        26: 30, 27: 30, 28: 30, 29: 30,
        30: 20, 31: 20, 32: 20, 33: 20,
        34: 15, 35: 15, 36: 15, 37: 15,
        38: 10, 39: 10, 40: 10, 41: 10, 42: 10
    };
    return coefficients[levelIndex] || 50;
}

// ========================================
// GENERATE NEXT SERIES
// ========================================

async function generateSeriesFromSource(sourceSeriesId, targetNumber, startDate, endDate, makeVisible) {
    try {
        // 1. Get source series groups and players
        const { data: groups, error: groupsError } = await supabaseClient
            .from('groups')
            .select('*')
            .eq('series_id', sourceSeriesId)
            .order('level_index');

        if (groupsError) throw groupsError;

        const totalGroups = groups.length;

        // 2. Get all group players with their stats
        const groupIds = groups.map(g => g.id);
        const { data: allGroupPlayers, error: gpError } = await supabaseClient
            .from('group_players')
            .select('*, players:player_id(id, name)')
            .in('group_id', groupIds);

        if (gpError) throw gpError;

        // 3. Classify each group and calculate new levels
        const playerNewLevels = [];

        for (const group of groups) {
            const groupPlayers = allGroupPlayers.filter(gp => gp.group_id === group.id);
            if (groupPlayers.length === 0) continue;

            // Sort by points (simple classification, ties resolved by set diff, then random)
            const classified = [...groupPlayers].sort((a, b) => {
                if ((b.group_points || 0) !== (a.group_points || 0)) {
                    return (b.group_points || 0) - (a.group_points || 0);
                }
                const aSetDiff = (a.sets_won || 0) - (a.sets_lost || 0);
                const bSetDiff = (b.sets_won || 0) - (b.sets_lost || 0);
                if (bSetDiff !== aSetDiff) return bSetDiff - aSetDiff;
                return Math.random() - 0.5;
            });

            const groupSize = classified.length;

            classified.forEach((player, idx) => {
                const position = idx + 1;
                const movement = getMovementForPosition(group.level_index, position, totalGroups, groupSize);
                let newLevel = group.level_index + movement;
                newLevel = Math.max(1, Math.min(totalGroups, newLevel));

                playerNewLevels.push({
                    playerId: player.player_id,
                    playerName: player.players?.name || 'N/A',
                    oldLevel: group.level_index,
                    newLevel: newLevel,
                    position: position,
                    points: player.group_points || 0
                });
            });
        }

        // 4. Calculate group sizes and rebalance
        const totalPlayers = playerNewLevels.length;
        const groupsWithFive = totalPlayers - (totalGroups * 4);

        const levelAssignments = {};
        for (let i = 1; i <= totalGroups; i++) levelAssignments[i] = [];
        playerNewLevels.forEach(p => levelAssignments[p.newLevel].push(p));

        // Sort each group by merit
        for (let i = 1; i <= totalGroups; i++) {
            levelAssignments[i].sort((a, b) => {
                if (a.position !== b.position) return a.position - b.position;
                return a.oldLevel - b.oldLevel;
            });
        }

        // Set target sizes (last groups get 5 players)
        const groupSizeTarget = {};
        for (let i = 1; i <= totalGroups; i++) {
            groupSizeTarget[i] = i > (totalGroups - groupsWithFive) ? 5 : 4;
        }

        // Rebalance
        for (let iter = 0; iter < 100; iter++) {
            let moved = false;

            for (let level = 1; level <= totalGroups; level++) {
                while (levelAssignments[level].length > groupSizeTarget[level]) {
                    levelAssignments[level].sort((a, b) => {
                        if (a.position !== b.position) return a.position - b.position;
                        return a.oldLevel - b.oldLevel;
                    });
                    const playerToMove = levelAssignments[level].pop();

                    let found = false;
                    for (let targetLevel = level + 1; targetLevel <= totalGroups && !found; targetLevel++) {
                        if (levelAssignments[targetLevel].length < groupSizeTarget[targetLevel]) {
                            levelAssignments[targetLevel].push(playerToMove);
                            playerToMove.newLevel = targetLevel;
                            found = true;
                            moved = true;
                        }
                    }

                    if (!found) {
                        levelAssignments[level].push(playerToMove);
                        break;
                    }
                }
            }

            let balanced = true;
            for (let i = 1; i <= totalGroups; i++) {
                if (levelAssignments[i].length !== groupSizeTarget[i]) {
                    balanced = false;
                    break;
                }
            }

            if (balanced || !moved) break;
        }

        // 5. Check if target series already exists and delete it
        const { data: existingSeries } = await supabaseClient
            .from('series')
            .select('id')
            .eq('name', `Serie ${targetNumber}`)
            .single();

        if (existingSeries) {
            await supabaseClient.from('series').delete().eq('id', existingSeries.id);
        }

        // 6. Create new series
        const { data: newSeries, error: seriesError } = await supabaseClient
            .from('series')
            .insert([{
                name: `Serie ${targetNumber}`,
                start_date: startDate,
                end_date: endDate,
                is_active: makeVisible,
                status: 'pending'
            }])
            .select()
            .single();

        if (seriesError) throw seriesError;

        // 7. Create groups and assign players
        let assignedCount = 0;
        for (let i = 1; i <= totalGroups; i++) {
            const { data: newGroup, error: groupError } = await supabaseClient
                .from('groups')
                .insert([{ series_id: newSeries.id, name: `Grupo ${i}`, level_index: i }])
                .select()
                .single();

            if (groupError) throw groupError;

            for (const player of levelAssignments[i]) {
                await supabaseClient.from('group_players').insert([{
                    group_id: newGroup.id,
                    player_id: player.playerId,
                    matches_played: 0, matches_won: 0, matches_lost: 0,
                    sets_won: 0, sets_lost: 0, games_won: 0, games_lost: 0, group_points: 0
                }]);
                assignedCount++;
            }
        }

        return { success: true, playerCount: assignedCount };

    } catch (error) {
        console.error('Error generating series:', error);
        return { success: false, error: error.message };
    }
}

// Movement rules for series generation
function getMovementForPosition(groupLevel, position, totalGroups, groupSize) {
    const isFirst = groupLevel === 1;
    const isSecond = groupLevel === 2;
    const isLast = groupLevel === totalGroups;
    const isPenultimate = groupLevel === totalGroups - 1;

    if (groupSize === 5 && position === 3) return 0;

    if (isFirst) {
        if (position === 1) return 0;
        if (position === 2 || position === 3) return 1;
        return 2;
    }

    if (isSecond) {
        if (position === 1 || position === 2) return -1;
        if (position === 3) return 1;
        return 2;
    }

    if (isLast) {
        if (position === 1) return -2;
        if (position === 2 || position === 3) return -1;
        return 0;
    }

    if (isPenultimate) {
        if (position === 1) return -2;
        if (position === 2) return -1;
        if (position === 3) return 1;
        return Math.min(1, totalGroups - groupLevel);
    }

    if (position === 1) return -2;
    if (position === 2) return -1;
    if (position === 3) return 1;
    return 2;
}
