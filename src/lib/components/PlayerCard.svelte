<script>
	import { goto } from '$app/navigation';

	const { player } = $props();

	const name = player.name;
	const role = player.role;
	const photoUrl = player.player_photo_url;
	// Ensure is_verified is treated as a boolean
	const isVerified = !!player.is_verified;

	// Determine banner text and color based on verification status
	const bannerText = isVerified ? 'HPL Verified' : 'HPL Unverified';
	const bannerClasses = isVerified ? 'bg-green-600 text-white' : 'bg-red-600 text-white';

	function getRole(role) {
		switch (role) {
			case 'AllRounder':
				return 'All-Rounder';
			case 'Wicketkeeper':
				return 'Wicket-Keeper';
			default:
				return role;
		}
	}
</script>

<button
	class="relative flex w-full items-center overflow-hidden rounded-lg border border-gray-100 bg-white p-3
           text-left shadow-md transition-shadow duration-200 hover:shadow-lg active:bg-gray-50"
	onclick={() => goto(`/players/${player.id}`)}
>
	<div class="relative flex-shrink-0">
		<img
			src={photoUrl}
			alt={name}
			class="h-16 w-16 rounded-full border-2 border-gray-200 object-cover"
		/>
	</div>

	<div class="ml-4 min-w-0 flex-grow">
		<h3 class="truncate text-lg font-bold text-gray-800">
			{name}
		</h3>

		<p class="mt-0.5 truncate text-sm text-gray-500">
			{getRole(role)}
		</p>
	</div>

	<div class="flex-shrink-0 text-gray-400">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-5 w-5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
		</svg>
	</div>

	<div
		class="absolute top-1 right-1 rounded-md px-2 py-0.5 text-xs font-semibold
               {bannerClasses}"
	>
		{bannerText}
	</div>
</button>
