import { supabase } from '$lib/supabaseClient.js';
import { json } from '@sveltejs/kit';

export async function GET() {
	const { data, error } = await supabase
		.from('teams')
		.select('id, name, owner_name, logo_url, seed_rank');
	if (error) {
		return json(500, error.message);
	}
	return json(data);
}
