<script>
	import { page } from '$app/state';
	import BidPrice from '$lib/components/BidPrice.svelte';
	import PlayerCategory from '$lib/components/PlayerCategory.svelte';
	import PlayerTeam from '$lib/components/PlayerTeam.svelte';
	import { startLoading, staticApiData, stopLoading, userState } from '$lib/state/+state.svelte';
	import { hplFetch } from '$lib/utils/api';
	import { onMount } from 'svelte';
	const playerId = page.params.id;
	let player = $state();
	let canUserUpdatePlayer = $state(false);
	let isVerified = $derived.by(() => player?.is_verified);
	let bannerText = $derived.by(() => (player?.is_verified ? 'HPL Verified' : 'HPL Unverified'));
	let bannerClasses = $derived.by(() =>
		player?.is_verified ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
	);
	let paymentScreenshot = $derived.by(() => player?.payment_proof_url);
	onMount(async () => {
		try {
			startLoading('Getting player details...');
			const playerResponse = await hplFetch(fetch, `/players/${playerId}`, 'GET');
			player = await playerResponse.json();
		} catch (e) {
			alert(e);
		} finally {
			stopLoading();
		}
		if (['Admin', 'Super Admin'].includes(userState.role)) {
			canUserUpdatePlayer = true;
		}
	});

	function deletePlayer() {}
</script>

<div class="w-full mx-auto max-w-xl p-4 sm:p-6">
	{#if player}
		<div class="w-full relative rounded-xl border border-gray-100 bg-white p-6 shadow-2xl">
			<!-- Banner -->
			<div
				class="absolute top-1 right-1 rounded-md px-4 py-1 text-sm font-bold {bannerClasses} shadow-md"
				title={bannerText}
			>
				{bannerText}
			</div>

			<!-- Player Photo -->
			<div class="flex flex-col items-center border-b border-gray-100 pt-8 pb-4">
				<img
					src={player.player_photo_url}
					class="h-36 w-36 rounded-full border-4 border-indigo-50 object-cover shadow-lg mt-10"
					alt={player.name}
				/>

				<h2 class="mt-4 text-3xl font-extrabold text-gray-900">
					{player.name}
				</h2>
				<p class="mt-1 text-xl font-medium text-indigo-600">
					{player.role}
				</p>
			</div>

			<!-- Payment screenshot (if not verified) -->
			{#if !isVerified}
				<div class="mt-6 border-b border-gray-100 pb-4">
					<h3 class="mb-2 text-lg font-semibold text-gray-800">Payment Proof Screenshot:</h3>

					<div class="w-full overflow-hidden rounded-lg border border-gray-300 bg-gray-100">
						<a href={paymentScreenshot} target="_blank" rel="noopener noreferrer">
							<img
								src={paymentScreenshot}
								alt={`Payment proof for ${player.name}`}
								class="h-auto w-full cursor-pointer object-contain transition hover:opacity-90"
								loading="lazy"
							/>
						</a>
					</div>
					<p class="mt-1 text-center text-xs text-gray-500">Tap image to view full size.</p>
				</div>
			{/if}

			<!-- Admin Controls -->
			{#if canUserUpdatePlayer && !isVerified}
				<div class="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
					<h3 class="mb-3 text-lg font-semibold text-gray-800">Admin Controls</h3>

					<button
						class="rounded-lg px-4 py-2 font-semibold shadow-md transition
            {isVerified
							? 'bg-red-600 text-white hover:bg-red-700'
							: 'bg-green-600 text-white hover:bg-green-700'}"
						onclick={verifyPlayer}
					>
						{isVerified ? 'Unverify Player' : 'Verify Player'}
					</button>
				</div>
			{/if}

			{#if !canUserUpdatePlayer && !isVerified}
				<div class="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-sm">
					<h3 class="mb-3 text-lg font-semibold text-gray-800">Login Required</h3>

					<button
						class="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-95"
						onclick={() => goto('/login')}
					>
						Login to Verify
					</button>
				</div>
			{/if}

			<!-- Contact + ID -->
			<div class="mt-4 space-y-4">
				<div class="flex items-center justify-between rounded-lg bg-gray-50 p-3">
					<span class="flex items-center gap-2 text-base font-semibold text-gray-700">
						<svg
							width="32px"
							height="32px"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M14.05 6C15.0268 6.19057 15.9244 6.66826 16.6281 7.37194C17.3318 8.07561 17.8095 8.97326 18 9.95M14.05 2C16.0793 2.22544 17.9716 3.13417 19.4163 4.57701C20.8609 6.01984 21.7721 7.91101 22 9.94M18.5 21C9.93959 21 3 14.0604 3 5.5C3 5.11378 3.01413 4.73086 3.04189 4.35173C3.07375 3.91662 3.08968 3.69907 3.2037 3.50103C3.29814 3.33701 3.4655 3.18146 3.63598 3.09925C3.84181 3 4.08188 3 4.56201 3H7.37932C7.78308 3 7.98496 3 8.15802 3.06645C8.31089 3.12515 8.44701 3.22049 8.55442 3.3441C8.67601 3.48403 8.745 3.67376 8.88299 4.05321L10.0491 7.26005C10.2096 7.70153 10.2899 7.92227 10.2763 8.1317C10.2643 8.31637 10.2012 8.49408 10.0942 8.64506C9.97286 8.81628 9.77145 8.93713 9.36863 9.17882L8 10C9.2019 12.6489 11.3501 14.7999 14 16L14.8212 14.6314C15.0629 14.2285 15.1837 14.0271 15.3549 13.9058C15.5059 13.7988 15.6836 13.7357 15.8683 13.7237C16.0777 13.7101 16.2985 13.7904 16.74 13.9509L19.9468 15.117C20.3262 15.255 20.516 15.324 20.6559 15.4456C20.7795 15.553 20.8749 15.6891 20.9335 15.842C21 16.015 21 16.2169 21 16.6207V19.438C21 19.9181 21 20.1582 20.9007 20.364C20.8185 20.5345 20.663 20.7019 20.499 20.7963C20.3009 20.9103 20.0834 20.9262 19.6483 20.9581C19.2691 20.9859 18.8862 21 18.5 21Z"
								stroke="#000000"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg> Phone:</span
					>
					<a
						href={'tel:' + player.phone}
						class="text-base font-medium text-indigo-700 hover:text-indigo-900"
					>
						{player.phone}
					</a>
				</div>

				<div class="flex items-center justify-between gap-10 rounded-lg bg-gray-50 px-3 py-3">
					<span class="text-sm font-semibold text-gray-700">Category: </span>
					<PlayerCategory catId={player.category_id} playerId={player.id} {canUserUpdatePlayer} />
				</div>

				<div class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-3">
					<span class="text-sm font-semibold text-gray-700">Team: </span>
					<PlayerTeam teamId={player.team_id} playerId={player.id} {canUserUpdatePlayer} />
				</div>

				<div class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-3">
					<span class="text-sm font-semibold text-gray-700">Sold Price: </span>
					<BidPrice playerId={player.id} soldPrice={player.sold_price} {canUserUpdatePlayer} />
				</div>

				{#if canUserUpdatePlayer}
					<div class="flex justify-between">
						<button
							onclick={deletePlayer}
							class="w-full space-y-3 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white shadow-md transition duration-150 ease-in-out hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Delete Player
						</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
