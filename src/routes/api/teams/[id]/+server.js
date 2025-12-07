import { supabase } from '$lib/supabaseClient';
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
	const { id } = params;
	const { data: team, error } = await supabase.from('teams').select('*').eq('id', id).single();
	if (error) {
		return json(500, error.message);
	}

	const { data: players, error: playerErros } = await supabase
		.from('players')
		.select('id, name, role')
		.eq('team_id', id);
	if (playerErros) {
		return json(500, playerErros);
	}
	if (!players || players.length === 0) {
		return json({
			hasPlayers: false
		});
	}
	return json({
		hasPlayers: true,
		players,
		captain_id: team.captain_id,
		vice_captain_id: team.vice_captain_id,
		wicket_keeper_id: team.wicket_keeper_id
	});
}
