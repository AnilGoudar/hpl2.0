import { supabase } from '$lib/supabaseClient';
import { json } from '@sveltejs/kit';

export async function GET() {
	const { data, error } = await supabase
		.from('fixtures')
		.select('*')
		.order('match_number', { ascending: true });
	if (error) {
		return json(500, error.message);
	}
	return json(data);
}

export async function POST({ request }) {
	const { fixtures } = await request.json();
	if (!Array.isArray(fixtures) || fixtures.length === 0) {
		return json({ error: 'No Fixtures provided' }, { status: 400 });
	}

	const cleaned = fixtures.map((f) => ({
		match_number: f.match_number,
		team_a: f.team_a,
		team_b: f.team_b,
		match_date: f.match_date,
		start_time: f.start_time,
		venue: f.venue,
		season_id: f.season_id,
		leg: f.leg,
		status: 'scheduled'
	}));

	const { error } = await supabase.from('fixtures').insert(cleaned);

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	return json({ success: true, count: cleaned.length });
}

export async function DELETE({ url }) {
	const seasonId = url.searchParams.get('seasonId');
	const { data, error: deleteErr } = await supabase
		.from('fixtures')
		.delete()
		.eq('season_id', seasonId);

	if (deleteErr) {
		return json({ error: deleteErr.message }, { status: 500 });
	}
	return json(data);
}
