<script>
	import { goto } from '$app/navigation';
	import { startLoading, stopLoading } from '$lib/state/+state.svelte';
	import { hplFetch } from '$lib/utils/api';
	import { onMount } from 'svelte';

	const { team } = $props();
	let hasPlayers = $state(false);
	let players = $state(null);
	let teamCaptainId = $state(null);
	let teamViceCaptainId = $state(null);
	let teamWicketKeeperId = $state(null);

	onMount(async () => {
		try {
			startLoading('Fetching team details');
			const res = await hplFetch(fetch, `/teams/${team.id}`);
			const data = await res.json();
			hasPlayers = data?.hasPlayers;
			players = data?.players;
			teamCaptainId = data?.captain_id;
			teamViceCaptainId = data?.vice_captain_id;
			teamWicketKeeperId = data?.wicket_keeper_id;
		} catch (e) {
			alert('Error in fetching team details');
		} finally {
			stopLoading(false);
		}
	});

	function getPlayerCode(player) {
		if (player.id === teamCaptainId && player.id === teamWicketKeeperId) {
			return '(C)(WK)';
		} else if (player.id === teamCaptainId) {
			return '(C)';
		} else if (player.id === teamViceCaptainId) {
			return '(VC)';
		} else if (player.id === teamWicketKeeperId) {
			return '(WK)';
		}
	}
</script>

<div
	class="overflow-hidden rounded-2xl border border-gray-100 bg-white
         shadow-md transition-all duration-200 hover:shadow-lg"
>
	<!-- HEADER -->
	<div class="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-blue-100 p-5">
		<div class="h-16 w-16 overflow-hidden rounded-full border border-gray-200 shadow">
			<img src={team.logo_url} alt={team.name} class="h-full w-full object-cover" />
		</div>

		<div>
			<h2 class="text-xl font-extrabold text-red-700">
				{team.name}
			</h2>

			<p class="mt-1 text-sm text-gray-600">
				<span class="font-semibold text-gray-800">Owner:</span>
				{team.owner_name}
			</p>
		</div>
	</div>

	<!-- STATS -->
	{#if hasPlayers}
		<div class="border-t border-gray-100 bg-white p-5">
			<h3 class="mb-3 text-sm font-semibold tracking-wide text-gray-700 uppercase">
				Team Composition
			</h3>
			<div class="my-3 h-[2px] w-full bg-[#2176AE]/20"></div>
			<div class="space-y-2">
				{#each players as player, i (player.id)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="flex items-center justify-between rounded-lg px-3 py-2
                   {i % 2 === 0 ? 'bg-gray-100' : 'bg-gray-200'}"
						onclick={() => (window.location.href = `/players/${player.id}`)}
					>
						<p class="font-medium text-gray-800">
							{i + 1}. {player.name} <span class="text-red-900">{getPlayerCode(player)}</span>
						</p>

						<span
							class="rounded-lg px-2 py-1 text-xs font-semibold
              {player.role === 'Batsman' ? 'bg-blue-100 text-blue-700' : ''}
              {player.role === 'Bowler' ? 'bg-green-100 text-green-700' : ''}
              {player.role === 'AllRounder' ? 'bg-purple-100 text-purple-700' : ''}
              {player.role === 'WicketKeeper' ? 'bg-orange-100 text-orange-700' : ''}"
						>
							{player.role}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
