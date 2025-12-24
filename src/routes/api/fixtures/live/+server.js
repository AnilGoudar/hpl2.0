import { supabase } from '$lib/supabaseClient';
import { json } from '@sveltejs/kit';

export async function GET() {
	const { data, error } = await supabase
		.from('live_matches')
		.select('*')
		.eq('status', 'live')
		.maybeSingle();

	if (error) {
		return json(500, error.message);
	}
	return json(data);
}
