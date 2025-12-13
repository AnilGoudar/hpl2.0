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
