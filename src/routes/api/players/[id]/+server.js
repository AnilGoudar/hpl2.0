import { supabase } from '$lib/supabaseClient.js';
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
	const { id } = params;
	const { data, error } = await supabase.from('players').select('*').eq('id', id).single();
	if (error) {
		return json(404, error.message);
	}
	return json(data);
}

export async function DELETE({ params }) {
	const { id } = params;
	const { data, error } = await supabase.from('players').delete().eq('id', id).select();
	if (error) {
		return json(500, error.message);
	}
	return json(data);
}

export async function PUT({ params, request }) {
	const { id } = params;
	const body = await request.json();

	const { data, error } = await supabase
		.from('players')
		.update(body)
		.eq('id', id)
		.select('*, category(name, base_price), teams(name, logo_url)')
		.maybeSingle();

	if (error) {
		return json(500, error.message);
	}
	return json(data);
}
