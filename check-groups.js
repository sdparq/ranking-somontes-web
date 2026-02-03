import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://hgpoanynlpgtcubmuddi.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncG9hbnlubHBndGN1Ym11ZGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MTYwNjcsImV4cCI6MjA4NTE5MjA2N30.YQBPEvgjoyCSG47S8YtdnnQHwNjqZrcF_WGMT-gCadQ'
);

async function check() {
    // Get Serie 3
    const { data: series } = await supabase.from('series').select('*').ilike('name', '%serie 3%');
    if (!series || series.length === 0) {
        console.log('Serie 3 no encontrada');
        return;
    }
    const serie3 = series[0];
    console.log('Serie 3:', serie3.name, '- ID:', serie3.id);
    console.log('is_active:', serie3.is_active);

    // Get groups with player count
    const { data: groups } = await supabase
        .from('groups')
        .select('id, name, level_index')
        .eq('series_id', serie3.id)
        .order('level_index');

    console.log('\nGrupos con número de jugadores:');
    let totalPlayers = 0;

    for (const g of groups) {
        const { count } = await supabase
            .from('group_players')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', g.id);

        totalPlayers += count;

        if (count !== 4) {
            console.log(`⚠️ Grupo ${g.level_index}: ${count} jugadores`);
        } else {
            console.log(`✓ Grupo ${g.level_index}: ${count} jugadores`);
        }
    }

    console.log(`\nTotal grupos: ${groups.length}`);
    console.log(`Total jugadores: ${totalPlayers}`);

    // Check Serie 2 for comparison
    const { data: series2 } = await supabase.from('series').select('*').ilike('name', '%serie 2%');
    if (series2 && series2.length > 0) {
        const s2 = series2[0];
        const { data: g2 } = await supabase.from('groups').select('id').eq('series_id', s2.id);

        let s2Players = 0;
        for (const g of g2) {
            const { count } = await supabase.from('group_players').select('*', { count: 'exact', head: true }).eq('group_id', g.id);
            s2Players += count;
        }
        console.log(`\nSerie 2: ${g2.length} grupos, ${s2Players} jugadores`);
    }
}

check().catch(console.error);
