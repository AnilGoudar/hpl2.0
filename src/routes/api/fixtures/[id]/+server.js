import { supabase } from '$lib/supabaseClient.js';
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
	const { id } = params;

	const { data: fixture, error: fixtureError } = await supabase
		.from('fixtures')
		.select('team_a, team_b, toss_winner, toss_decision')
		.eq('id', id)
		.single();

	if (fixtureError || !fixture) {
		return ({ error: 'Unable to get fixture' }, { status: 500 });
	}

	const { team_a, team_b, toss_winner, toss_decision } = fixture;

	// get players from team_a
	const { data: playersA, error: playersAError } = await supabase
		.from('players')
		.select('*')
		.eq('team_id', team_a);

	const { data: playersB, error: playersBError } = await supabase
		.from('players')
		.select('*')
		.eq('team_id', team_b);

	if (playersAError || playersBError) {
		return json({ error: 'Unable to fetch players for the fixture from teams' }, { status: 500 });
	}

	return json({
		fixture: {
			team_a,
			team_b,
			toss_winner,
			toss_decision
		},
		teamAPlayers: playersA,
		teamBPlayers: playersB
	});
}

export async function PUT({ params, request }) {
	const { id } = params;
	const body = await request.json();
	const { data, error } = await supabase
		.from('fixtures')
		.update(body)
		.eq('id', id)
		.select('toss_winner, toss_decision')
		.maybeSingle();

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}
	return json(data);
}
