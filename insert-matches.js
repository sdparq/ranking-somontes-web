import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hgpoanynlpgtcubmuddi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncG9hbnlubHBndGN1Ym11ZGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MTYwNjcsImV4cCI6MjA4NTE5MjA2N30.YQBPEvgjoyCSG47S8YtdnnQHwNjqZrcF_WGMT-gCadQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin credentials
const ADMIN_EMAIL = 'ranking@cpvtotaltenis.com';
const ADMIN_PASSWORD = 'cpvransom26';

const nuevosPartidos = {
    "2": [
        { jugador1: "Camilo Chiquito Freile", jugador2: "Luis Corbella Colado", resultado: { set1: "6-0", set2: "6-0", set3: null } },
        { jugador1: "Camilo Chiquito Freile", jugador2: "Jesus Sanchez Arroyo", resultado: { set1: "6-0", set2: "6-0", set3: null } },
        { jugador1: "Camilo Chiquito Freile", jugador2: "Andrea Usai", resultado: { set1: "6-0", set2: "6-0", set3: null } },
        { jugador1: "Luis Corbella Colado", jugador2: "Andrea Usai", resultado: { set1: "1-6", set2: "6-3", set3: "10-5" } },
        { jugador1: "Luis Corbella Colado", jugador2: "Jesus Sanchez Arroyo", resultado: { set1: "6-2", set2: "6-3", set3: null } }
    ],
    "3": [
        { jugador1: "Alexi Briechle", jugador2: "Iñigo de Roda", resultado: { set1: "6-1", set2: "6-1", set3: null } }
    ],
    "4": [
        { jugador1: "Kiko Piqueras", jugador2: "Miguel Selas", resultado: { set1: "6-4", set2: "1-0", set3: null } },
        { jugador1: "Carlos Raya Pérez", jugador2: "Miguel Selas", resultado: { set1: "6-3", set2: "6-1", set3: null } }
    ],
    "5": [
        { jugador1: "Joaquin Caballero Gomariz", jugador2: "Renata Cáceres Passano", resultado: { set1: "6-0", set2: "6-0", set3: null } },
        { jugador1: "Ernesto Ferrer-Bonsoms", jugador2: "Renata Cáceres Passano", resultado: { set1: "1-6", set2: "2-6", set3: null } }
    ],
    "6": [
        { jugador1: "Juan Piñero Guerrero", jugador2: "Rafael Méndez Alemán", resultado: { set1: "4-6", set2: "3-6", set3: null } },
        { jugador1: "Armand Bridel", jugador2: "Juan Escribano Rumeau", resultado: { set1: "6-1", set2: "6-3", set3: null } }
    ],
    "9": [
        { jugador1: "Juanjo Ferrer-Bonsoms", jugador2: "Daniele Candini", resultado: { set1: "7-5", set2: null, set3: null } }
    ],
    "12": [
        { jugador1: "JAVIER GOAS", jugador2: "Pedro La Calle Hornedo", resultado: { set1: "3-6", set2: "1-6", set3: null } },
        { jugador1: "JAVIER GOAS", jugador2: "Oscar Largo", resultado: { set1: "7-6", set2: "6-3", set3: null } }
    ],
    "13": [
        { jugador1: "Jesus Ruiz Sierra", jugador2: "Rolf Mueller", resultado: { set1: "6-2", set2: "6-1", set3: null } },
        { jugador1: "Jesus Ruiz Sierra", jugador2: "Marcos Delgado Mora", resultado: { set1: "6-3", set2: "6-0", set3: null } },
        { jugador1: "Rolf Mueller", jugador2: "Antonio Crespo", resultado: { set1: "1-6", set2: "6-2", set3: "7-10" } },
        { jugador1: "Antonio Crespo", jugador2: "Marcos Delgado Mora", resultado: { set1: "6-3", set2: "6-2", set3: null } }
    ],
    "14": [
        { jugador1: "Pedro Pérez-Escariz", jugador2: "Jorge Estévez Lezana", resultado: { set1: "7-5", set2: "6-2", set3: null } },
        { jugador1: "Jorge Estévez Lezana", jugador2: "Alejandro Carrascal Jerez", resultado: { set1: "6-4", set2: "7-6", set3: null } }
    ],
    "16": [
        { jugador1: "Antonio Garcia Viu", jugador2: "Jose Ramon Pardo Garcia", resultado: { set1: "3-6", set2: "3-6", set3: null } },
        { jugador1: "Antonio Garcia Viu", jugador2: "DANIEL MUÑOZ GANDUL", resultado: { set1: "0-6", set2: "0-6", set3: null } },
        { jugador1: "Jose Ramon Pardo Garcia", jugador2: "DANIEL MUÑOZ GANDUL", resultado: { set1: "0-6", set2: "0-6", set3: null } },
        { jugador1: "Andrés Muñoz Martín", jugador2: "DANIEL MUÑOZ GANDUL", resultado: { set1: "0-6", set2: "0-6", set3: null } }
    ],
    "17": [
        { jugador1: "Fernando Moreno Trapote", jugador2: "Santiago de Pablo Fernandez", resultado: { set1: "3-6", set2: "7-6", set3: "7-10" } }
    ],
    "18": [
        { jugador1: "Dominique Uzel", jugador2: "Alberto Sanchez Jimenez", resultado: { set1: "6-0", set2: "6-0", set3: null } },
        { jugador1: "Olivier Shleifer", jugador2: "Dominique Uzel", resultado: { set1: "0-6", set2: "0-6", set3: null } }
    ],
    "20": [
        { jugador1: "Robert Kenyon", jugador2: "Fernando Dueñas", resultado: { set1: "7-5", set2: "2-6", set3: "4-10" } }
    ],
    "21": [
        { jugador1: "Moisés Barreira Caraballo", jugador2: "Manuel Powell", resultado: { set1: "1-6", set2: "0-6", set3: null } },
        { jugador1: "Moisés Barreira Caraballo", jugador2: "Francisco Barranco-Polaina César", resultado: { set1: "0-6", set2: "3-6", set3: null } },
        { jugador1: "Manuel Powell", jugador2: "Francisco Barranco-Polaina César", resultado: { set1: "6-4", set2: "6-4", set3: null } },
        { jugador1: "Manuel Powell", jugador2: "Manuel Margarida", resultado: { set1: "6-0", set2: "6-1", set3: null } },
        { jugador1: "Francisco Barranco-Polaina César", jugador2: "Álvaro Pérez Meliá", resultado: { set1: "6-0", set2: "6-0", set3: null } }
    ],
    "22": [
        { jugador1: "Luis Maria Gonzalez", jugador2: "Rafael Redondo Redondo", resultado: { set1: "3-6", set2: "5-7", set3: null } }
    ],
    "23": [
        { jugador1: "Alberto Sánchez Herrero", jugador2: "Marco Martini", resultado: { set1: "2-6", set2: "7-6", set3: "7-10" } }
    ],
    "25": [
        { jugador1: "Anton Millán Carrillo", jugador2: "Ander Maestro Ibáñez", resultado: { set1: "6-0", set2: "6-4", set3: null } },
        { jugador1: "Ander Maestro Ibáñez", jugador2: "Fernando Pascual Bañuls", resultado: { set1: "7-6", set2: "7-5", set3: null } }
    ],
    "26": [
        { jugador1: "VALENTIN LAISECA", jugador2: "Antonio Velasco Sanz", resultado: { set1: "6-0", set2: "6-0", set3: null } },
        { jugador1: "VALENTIN LAISECA", jugador2: "Jesus Medina Muñoz", resultado: { set1: "6-0", set2: "6-0", set3: null } },
        { jugador1: "VALENTIN LAISECA", jugador2: "Pablo Garcia Hernandez", resultado: { set1: "6-0", set2: "6-0", set3: null } }
    ],
    "28": [
        { jugador1: "Adrian Ferrer Fornes", jugador2: "PABLO GARCÍA-POLO GARCÍA", resultado: { set1: "6-0", set2: "6-0", set3: null } },
        { jugador1: "Adrian Ferrer Fornes", jugador2: "Carlos Pérez-Nievas", resultado: { set1: "6-0", set2: "6-0", set3: null } },
        { jugador1: "Adrian Ferrer Fornes", jugador2: "Pedro de Almeida Casais", resultado: { set1: "6-0", set2: "6-0", set3: null } }
    ],
    "29": [
        { jugador1: "José María del Pozo Jodra", jugador2: "Luis Manuel Cuesta", resultado: { set1: "3-6", set2: "3-6", set3: null } },
        { jugador1: "Luis Manuel Cuesta", jugador2: "Miguel Soria Trujillo", resultado: { set1: "7-6", set2: "6-2", set3: null } }
    ],
    "30": [
        { jugador1: "Alejandro Cremades Alvarez", jugador2: "Javier Adam Castrillo", resultado: { set1: "4-6", set2: "5-7", set3: null } },
        { jugador1: "Alejandro Cremades Alvarez", jugador2: "Luis Torquemada Borge", resultado: { set1: "1-6", set2: "2-6", set3: null } },
        { jugador1: "Javier Adam Castrillo", jugador2: "Luis Torquemada Borge", resultado: { set1: "1-6", set2: "4-6", set3: null } },
        { jugador1: "Daniel Norrby", jugador2: "Javier Adam Castrillo", resultado: { set1: "0-6", set2: "3-6", set3: null } }
    ],
    "34": [
        { jugador1: "Alejandro Falcón", jugador2: "Antonio Núñez García", resultado: { set1: "6-4", set2: "6-3", set3: null } }
    ],
    "35": [
        { jugador1: "Gonzalo Ximénez de Olaso Serna", jugador2: "Eduardo Martinez Garcia de Quesada", resultado: { set1: "1-6", set2: "6-7", set3: null } }
    ],
    "36": [
        { jugador1: "Francisco Garcia Vieira", jugador2: "Angel Mateo Garcia Simba", resultado: { set1: "4-6", set2: "3-6", set3: null } },
        { jugador1: "Angel Mateo Garcia Simba", jugador2: "Facundo Muñoz Sevillano", resultado: { set1: "6-3", set2: "6-4", set3: null } }
    ],
    "38": [
        { jugador1: "IGNACIO LOPEZ PIÑERO", jugador2: "Eduardo Laporte Miqueleiz", resultado: { set1: "0-6", set2: "2-6", set3: null } },
        { jugador1: "IGNACIO LOPEZ PIÑERO", jugador2: "Fabrice Normand", resultado: { set1: "1-6", set2: "0-6", set3: null } }
    ],
    "39": [
        { jugador1: "DANIEL SOUSA REAL", jugador2: "Gerardo Raído León", resultado: { set1: "6-3", set2: "6-4", set3: null } }
    ],
    "40": [
        { jugador1: "Cristina Roy Cordero", jugador2: "Paloma Garcia Galan San Miguel", resultado: { set1: "6-1", set2: "6-3", set3: null } },
        { jugador1: "Cristina Roy Cordero", jugador2: "Salvador Espinosa", resultado: { set1: "0-6", set2: "0-6", set3: null } },
        { jugador1: "Cristina Roy Cordero", jugador2: "Paola Mariela Giménez Torales", resultado: { set1: "6-2", set2: "6-2", set3: null } },
        { jugador1: "Salvador Espinosa", jugador2: "Paola Mariela Giménez Torales", resultado: { set1: "6-0", set2: "6-0", set3: null } },
        { jugador1: "Paloma Garcia Galan San Miguel", jugador2: "Salvador Espinosa", resultado: { set1: "0-6", set2: "0-6", set3: null } }
    ],
    "41": [
        { jugador1: "BEATRIZ BERNABE", jugador2: "Maria Diaz Vergel", resultado: { set1: "0-6", set2: "0-6", set3: null } }
    ]
};

function normalizePlayerName(name) {
    return name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, ' ')
        .trim();
}

function parseScore(scoreStr) {
    if (!scoreStr) return { p1: null, p2: null };
    const parts = scoreStr.split('-');
    return { p1: parseInt(parts[0]), p2: parseInt(parts[1]) };
}

function determineWinner(resultado) {
    let p1Sets = 0, p2Sets = 0;

    const set1 = parseScore(resultado.set1);
    const set2 = parseScore(resultado.set2);
    const set3 = parseScore(resultado.set3);

    if (set1.p1 !== null && set1.p2 !== null) {
        if (set1.p1 > set1.p2) p1Sets++; else p2Sets++;
    }
    if (set2.p1 !== null && set2.p2 !== null) {
        if (set2.p1 > set2.p2) p1Sets++; else p2Sets++;
    }
    if (set3.p1 !== null && set3.p2 !== null) {
        if (set3.p1 > set3.p2) p1Sets++; else p2Sets++;
    }

    return p1Sets > p2Sets ? 1 : 2;
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

async function updatePlayerStats(match) {
    if (!match.winner_id) return;

    const p1Sets = calculateSetsWon(match, 1);
    const p2Sets = calculateSetsWon(match, 2);

    const isP1Winner = match.winner_id === match.player1_id;
    const bonus = (isP1Winner && p1Sets === 2 && p2Sets === 0) || (!isP1Winner && p2Sets === 2 && p1Sets === 0) ? 1 : 0;

    // Player 1
    const { data: p1Data } = await supabase
        .from('group_players')
        .select('*')
        .eq('group_id', match.group_id)
        .eq('player_id', match.player1_id)
        .single();

    if (p1Data) {
        await supabase
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

    // Player 2
    const { data: p2Data } = await supabase
        .from('group_players')
        .select('*')
        .eq('group_id', match.group_id)
        .eq('player_id', match.player2_id)
        .single();

    if (p2Data) {
        await supabase
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

async function main() {
    console.log('=== INSERTANDO PARTIDOS SERIE 2 ===\n');

    // 0. Login as admin
    console.log('Iniciando sesión como admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
    });

    if (authError) {
        console.error('Error de autenticación:', authError.message);
        return;
    }
    console.log(`✓ Sesión iniciada como: ${authData.user.email}\n`);

    // 1. Buscar Serie 2
    console.log('Buscando Serie 2...');
    const { data: series, error: seriesError } = await supabase
        .from('series')
        .select('*')
        .order('start_date', { ascending: false });

    if (seriesError) {
        console.error('Error buscando series:', seriesError);
        return;
    }

    const serie2 = series.find(s => s.name.toLowerCase().includes('serie 2') || s.name.includes('2'));
    if (!serie2) {
        console.error('No se encontró la Serie 2. Series disponibles:', series.map(s => s.name));
        return;
    }
    console.log(`✓ Serie 2 encontrada: "${serie2.name}" (ID: ${serie2.id})\n`);

    // 2. Buscar grupos
    console.log('Buscando grupos...');
    const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .eq('series_id', serie2.id)
        .order('level_index');

    if (groupsError) {
        console.error('Error buscando grupos:', groupsError);
        return;
    }

    const grupos = {};
    groupsData.forEach(g => {
        grupos[g.level_index] = g.id;
    });
    console.log(`✓ ${groupsData.length} grupos encontrados\n`);

    // 3. Buscar jugadores
    console.log('Buscando jugadores...');
    const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('id, name');

    if (playersError) {
        console.error('Error buscando jugadores:', playersError);
        return;
    }

    const jugadores = {};
    playersData.forEach(p => {
        jugadores[normalizePlayerName(p.name)] = { id: p.id, name: p.name };
    });
    console.log(`✓ ${playersData.length} jugadores encontrados\n`);

    // 4. Insertar partidos
    console.log('=== INSERTANDO PARTIDOS ===\n');

    let inserted = 0;
    let failed = 0;
    const errors = [];

    for (const [levelIndex, partidos] of Object.entries(nuevosPartidos)) {
        const groupId = grupos[levelIndex];
        if (!groupId) {
            console.log(`✗ Grupo ${levelIndex} no encontrado`);
            failed += partidos.length;
            continue;
        }

        for (const partido of partidos) {
            const j1Norm = normalizePlayerName(partido.jugador1);
            const j2Norm = normalizePlayerName(partido.jugador2);

            let player1 = jugadores[j1Norm];
            let player2 = jugadores[j2Norm];

            // Búsqueda flexible si no se encuentra
            if (!player1) {
                const palabras = j1Norm.split(' ').filter(p => p.length > 3);
                const match = playersData.find(p => {
                    const pNorm = normalizePlayerName(p.name);
                    return palabras.every(palabra => pNorm.includes(palabra));
                });
                if (match) {
                    player1 = { id: match.id, name: match.name };
                }
            }

            if (!player2) {
                const palabras = j2Norm.split(' ').filter(p => p.length > 3);
                const match = playersData.find(p => {
                    const pNorm = normalizePlayerName(p.name);
                    return palabras.every(palabra => pNorm.includes(palabra));
                });
                if (match) {
                    player2 = { id: match.id, name: match.name };
                }
            }

            if (!player1 || !player2) {
                const err = `Grupo ${levelIndex}: ${partido.jugador1} vs ${partido.jugador2} - jugador no encontrado (p1: ${!!player1}, p2: ${!!player2})`;
                console.log(`✗ ${err}`);
                errors.push(err);
                failed++;
                continue;
            }

            const set1 = parseScore(partido.resultado.set1);
            const set2 = parseScore(partido.resultado.set2);
            const set3 = parseScore(partido.resultado.set3);

            const winner = determineWinner(partido.resultado);
            const winnerId = winner === 1 ? player1.id : player2.id;

            const matchData = {
                group_id: groupId,
                player1_id: player1.id,
                player2_id: player2.id,
                winner_id: winnerId,
                score_p1_set1: set1.p1,
                score_p2_set1: set1.p2,
                score_p1_set2: set2.p1,
                score_p2_set2: set2.p2,
                score_p1_set3: set3.p1,
                score_p2_set3: set3.p2,
                played_at: new Date().toISOString()
            };

            try {
                const { data, error } = await supabase
                    .from('matches')
                    .insert([matchData])
                    .select()
                    .single();

                if (error) throw error;

                await updatePlayerStats(matchData);

                console.log(`✓ Grupo ${levelIndex}: ${player1.name} vs ${player2.name} (${partido.resultado.set1}, ${partido.resultado.set2}${partido.resultado.set3 ? ', ' + partido.resultado.set3 : ''})`);
                inserted++;
            } catch (err) {
                console.log(`✗ Error insertando: ${err.message}`);
                errors.push(`${partido.jugador1} vs ${partido.jugador2}: ${err.message}`);
                failed++;
            }
        }
    }

    console.log('\n=== RESULTADO ===');
    console.log(`✓ Partidos insertados: ${inserted}`);
    console.log(`✗ Partidos fallidos: ${failed}`);

    if (errors.length > 0) {
        console.log('\nErrores:');
        errors.forEach(e => console.log(`  - ${e}`));
    }
}

main().catch(console.error);
