// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL = 'https://auquetynmfwwpxmkicne.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1cXVldHlubWZ3d3B4bWtpY25lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MjIzMDgsImV4cCI6MjA4NDQ5ODMwOH0.ErPTRVft3j7UKYBu6XoVe1B_Ee5o1SH_y8Gu9zbCAOI';

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

// Series
async function fetchSeries() {
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
