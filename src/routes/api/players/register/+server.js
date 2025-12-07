import { supabase } from '$lib/supabaseClient.js';
import { json, error } from '@sveltejs/kit';
export async function POST({ request }) {
	const body = await request.json();
	const { data, error: registerError } = await supabase
		.from('players')
		.insert(body)
		.select()
		.single();

	if (registerError) {
		throw error(500, registerError.message);
	}
	return json(data);
}
