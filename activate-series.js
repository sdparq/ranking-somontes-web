import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://hgpoanynlpgtcubmuddi.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncG9hbnlubHBndGN1Ym11ZGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MTYwNjcsImV4cCI6MjA4NTE5MjA2N30.YQBPEvgjoyCSG47S8YtdnnQHwNjqZrcF_WGMT-gCadQ'
);

const ADMIN_EMAIL = 'ranking@cpvtotaltenis.com';
const ADMIN_PASSWORD = 'cpvransom26';

// Serie a activar
const SERIES_NUMBER = process.argv[2] || 3;

async function main() {
    // Login
    const { error: authError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL, password: ADMIN_PASSWORD
    });
    if (authError) { console.error('Auth error:', authError.message); return; }

    // Buscar la serie
    const { data: series } = await supabase.from('series').select('*').ilike('name', `%serie ${SERIES_NUMBER}%`);

    if (!series || series.length === 0) {
        console.log(`Serie ${SERIES_NUMBER} no encontrada`);
        return;
    }

    const serie = series[0];
    console.log(`Serie: ${serie.name}`);
    console.log(`Estado actual: is_active = ${serie.is_active}`);

    // Activar
    const { error } = await supabase
        .from('series')
        .update({ is_active: true })
        .eq('id', serie.id);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(`✓ Serie ${SERIES_NUMBER} ACTIVADA (is_active = true)`);
    }
}

main().catch(console.error);
