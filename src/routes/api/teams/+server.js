import { supabase } from '$lib/supabaseClient.js';
import { json } from '@sveltejs/kit';

export async function GET() {
	const { data, error } = await supabase.from('teams').select('id, name, owner_name, logo_url');
	if (error) {
		return json({ error: error, status: 500 });
	}
	return json(data);
}
