import { supabase } from '$lib/supabaseClient.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const body = await request.json();

	const { data, error } = await supabase.rpc('finalize_match_and_update_points', {
		...body
	});

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}
	return json(data);
}
