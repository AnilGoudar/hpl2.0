import { supabase } from '$lib/supabaseClient.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const body = await request.json();

	// delete the existing line up for the given team initiall and insert later

	const fixtureId = body[0].fixture_id;
	const teamIds = [...new Set(body.map((l) => l.team_id))];

	const { error: deleteError } = await supabase
		.from('fixture_lineups')
		.delete()
		.eq('fixture_id', fixtureId)
		.in('team_id', teamIds);

	if (deleteError) {
		return json({ message: 'Failed to clear old lineups.' }, { status: 500 });
	}
	const { data: fixtureLineUp, error: fixtureLineUpError } = await supabase
		.from('fixture_lineups')
		.insert(body);

	if (fixtureLineUpError) {
		throw json({ status: 500 }, { error: fixtureLineUpError.message });
	}
	return json(fixtureLineUp);
}

export async function GET({ params }) {
	const { id } = params;

	// 1. Fetch only the team_id column for rows matching the fixture_id
	const { data, error } = await supabase
		.from('fixture_lineups')
		.select('team_id')
		.eq('fixture_id', id);

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	// 2. Aggregate the counts: { "team-uuid-1": 11, "team-uuid-2": 11 }
	const counts = data.reduce((acc, row) => {
		const teamId = row.team_id;
		acc[teamId] = (acc[teamId] || 0) + 1;
		return acc;
	}, {});

	return json(counts);
}
