import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://hgpoanynlpgtcubmuddi.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncG9hbnlubHBndGN1Ym11ZGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MTYwNjcsImV4cCI6MjA4NTE5MjA2N30.YQBPEvgjoyCSG47S8YtdnnQHwNjqZrcF_WGMT-gCadQ'
);

async function main() {
    const { data: series } = await supabase.from('series').select('*').order('start_date');

    console.log('=== TODAS LAS SERIES ===\n');

    for (const s of series) {
        const status = s.is_active ? '✓ VISIBLE' : '○ OCULTA';
        const { count } = await supabase.from('groups').select('*', { count: 'exact', head: true }).eq('series_id', s.id);

        console.log(`${status} ${s.name}`);
        console.log(`   Grupos: ${count}`);
        console.log(`   Fechas: ${s.start_date} a ${s.end_date}`);
        console.log('');
    }
}

main().catch(console.error);
