<script>
	import { goto } from '$app/navigation';
	import { userState } from '$lib/state/+state.svelte';
	import { displayDate, displayTeamName } from '$lib/utils';
	import Radio from '$lib/assets/Icons/liveRadio.svg';

	let { match, teams } = $props();

	function getTeamDisplayName(id) {
		const team = [...teams].find((t) => t.id === id);
		return displayTeamName(team.name);
	}
	function getTeamLogo(id) {
		const team = [...teams].find((t) => t.id === id);
		return team.logo_url;
	}

	function getStatusBadge(status) {
		switch (status) {
			case 'live':
				return 'bg-red-100 text-red-700 animate-pulse';
			case 'completed':
				return 'bg-green-100 text-green-700';
			case 'upcoming':
				return 'bg-yellow-100 text-yellow-700';
			case 'cancelled':
				return 'bg-gray-200 text-gray-700';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	}

	async function handleFixtureClick() {
		if (!userState?.id || userState.role !== 'Super Admin') return;

		const status = match.status?.toLowerCase();

		if (status === 'upcoming' || status === 'scheduled') {
			goto(`/admin/match/prepare/${match.id}`);
		} else if (status === 'live') {
			goto(`/admin/match/score/${match.id}`);
		} else if (status === 'completed') {
			goto(`/admin/match/results/${match.id}`);
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="bg-white p-4 rounded-xl shadow-sm border" onclick={handleFixtureClick}>
	<div class="flex items-center justify-between items-center mb-3">
		<div class="text-xs font-bold text-gray-500">
			Match #{match.match_number} (Leg: {match.leg})
		</div>
		<div
			class={`flex gap-2 items-center text-[10px] px-2 py-1 rounded-full font-semibold ${getStatusBadge(match.status?.toLowerCase())}`}
		>
			{#if match.status?.toUpperCase() === 'LIVE'}
				<img src={Radio} alt="live-badge" class="w-4 h-4 object-cover" />
			{/if}
			{match.status?.toUpperCase()}
		</div>
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
	<div class="flex items-center mt-2 justify-between">
		<div class="text-xs font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-700">
			{displayDate(match.match_date)} - ⏱ {match.start_time}
		</div>

		<div class="text-xs font-medium bg-blue-50 px-3 py-1 rounded-full text-blue-700">
			📍 {match.venue}
		</div>
	</div>
</div>
