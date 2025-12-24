import { supabase } from '$lib/supabaseClient.js';
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
	const id = params.id;
	const { data, error } = await supabase.rpc('get_live_match_lineups', {
		p_fixture_id: id
	});

	if (error) {
		return json({ status: 500 }, { error: error.message });
	}
	return json(data);
}

export async function POST({ request }) {
	const body = await request.json();
	const { data, error } = await supabase.rpc('record_ball', {
		...body
	});
	console.log(error);
	if (error) {
		return json({ status: 500 }, { error: error.message });
	}
	return json(data);
}
