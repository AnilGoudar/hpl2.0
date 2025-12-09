<script>
	import { displayDate, displayTeamName } from '$lib/utils';

	let { match, teams } = $props();

	function getTeamDisplayName(id) {
		const team = [...teams].find((t) => t.id === id);
		return displayTeamName(team.name);
	}
	function getTeamLogo(id) {
		const team = [...teams].find((t) => t.id === id);
		return team.logo_url;
	}
</script>

<div class="bg-white p-4 rounded-xl shadow-sm border">
	<div class="text-xs font-bold text-gray-500 mb-2">
		Match #{match.match_number} (Leg: {match.leg})
	</div>
	<div class="flex items-center mb-3">
		<div class="flex-1 flex items-center">
			<img src={getTeamLogo(match.team_a)} class="h-8 w-8 rounded-full mr-2" alt="hello" />
			<span class="font-semibold">{getTeamDisplayName(match.team_a)}</span>
		</div>
		<div class="px-3 text-gray-700 font-bold">vs</div>
		<div class="flex-1 flex items-center justify-end">
			<img src={getTeamLogo(match.team_b)} class="h-8 w-8 rounded-full mr-2" alt="hello" />
			<span class="font-semibold">{getTeamDisplayName(match.team_b)}</span>
		</div>
	</div>
	<div class="flex items-center mb-3 justify-between">
		<div class="text-xs font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-700">
			{displayDate(match.match_date)} - ⏱ {match.start_time}
		</div>

		<div class="text-xs font-medium bg-blue-50 px-3 py-1 rounded-full text-blue-700">
			📍 {match.venue}
		</div>
	</div>
</div>
