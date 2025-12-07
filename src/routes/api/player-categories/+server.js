import { supabase } from '$lib/supabaseClient';
import { json } from '@sveltejs/kit';

export async function GET() {
	const { data, error } = await supabase.from('category').select('id, name, base_price');
	if (error) {
		return json(500, error.message);
	}
	return json(data);
}
