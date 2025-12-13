import { supabase } from '$lib/supabaseClient.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	const { fixture_id } = await request.json();

	const { data, error: rpcError } = await supabase.rpc('start_live_match', {
		p_fixture_id: fixture_id
	});

	if (rpcError) {
		return json(
			{ message: 'Failed to start match via RPC', details: rpcError.message },
			{
				status: 500
			}
		);
	}

	return json({ success: true, result: data }, { status: 200 });
}
