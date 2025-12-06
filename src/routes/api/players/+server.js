import { supabase } from '$lib/supabaseClient';
import { json } from '@sveltejs/kit';

export async function GET() {
	const { data, error } = await supabase.from('players').select('*');

	if (error) {
		return json({ error: error, status: 500 });
	}
	return json({ data });
}
