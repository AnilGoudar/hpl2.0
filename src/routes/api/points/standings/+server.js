import { supabase } from '$lib/supabaseClient.js';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const season_id = url.searchParams.get('season_id');
	const { data: standings, error } = await supabase.rpc('get_current_standings', {
		current_season_id: season_id
	});
	if (error) {
		return json(500, error.message);
	}
	return json(standings);
}
