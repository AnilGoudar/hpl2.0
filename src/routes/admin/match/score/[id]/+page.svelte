<script>
	import { page } from '$app/state';
	const fixture_id = page.params.id;
	let current_ball_runs = $state(0);

	function handleRunClick(event) {
		event.stopPropagation();
		if (event.target.classList.contains('bg-blue-700')) {
			event.target.classList.add('bg-white');
			event.target.classList.remove('bg-blue-700');
			event.target.classList.remove('text-white');
		} else {
			event.target.classList.remove('bg-white');
			event.target.classList.add('bg-blue-700');
			event.target.classList.add('text-white');
		}
	}
</script>

<div class="min-h-screen bg-gray-100 w-full">
	<!-- live score header -->
	<header class="sticky top-0 z-40 bg-white shadow-md px-4 py-3">
		<div class="flex items-center justify-between border-b pb-2">
			<div class="text-xl font-extrabold">
				SRC 54/2 <span class="text-xs font-bold text-red-600 animate-pulse">LIVE</span>
			</div>
			<div class="text-sm text-gray-600">5.3 Overs . CRR 9.30</div>
		</div>
		<div class="mt-1 text-sm text-gray-700">Last ball: 1 run</div>
	</header>

	<section class="bg-white mt-3 rounded-xl shadow p-4">
		<div class="grid grid-cols-2 gap-3 text-sm">
			<div>
				<p class="font-semibold">Striker</p>
				<p>Anil - 23 (14)</p>
			</div>
			<div>
				<p class="font-semibold">Non-Striker</p>
				<p>Sunil - 12 (9)</p>
			</div>
		</div>
		<div class="mt-2">
			<p class="font-semibold">Bowler</p>
			<p>Shami - 0.3 ov</p>
		</div>
	</section>

	<!-- Run Input -->
	<section class="mt-4">
		<div class="grid grid-cols-6 gap-3">
			{#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as run}
				<button
					onclick={handleRunClick}
					class="py-2 bg-white rounded-xl shadow font-bold text-xl active:scale-95">{run}</button
				>
			{/each}
		</div>
	</section>

	<!-- extra runs -->
	<section class="mt-4">
		<p class="font-bold">Extra Runs</p>
		<div class="grid grid-cols-6 gap-3">
			{#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as run}
				<button
					onclick={handleRunClick}
					class="py-2 bg-white rounded-xl shadow font-bold text-xl active:scale-95">{run}</button
				>
			{/each}
		</div>
	</section>
	<!-- ⚠️ EXTRAS & WICKETS -->
	<section class="mt-4 mx-3 grid grid-cols-3 gap-3">
		<button class="py-3 bg-yellow-100 rounded-xl font-bold"> Wide </button>
		<button class="py-3 bg-yellow-100 rounded-xl font-bold"> No-ball </button>
		<button class="py-3 bg-red-100 rounded-xl font-bold text-red-700"> Wicket </button>
	</section>

	<!-- 📊 CURRENT OVER -->
	<section class="bg-white mt-4 mx-3 rounded-xl shadow p-4">
		<p class="font-bold mb-2">Current Over</p>
		<div class="flex gap-2">
			<span class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200">1</span>
			<span class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200">0</span>
			<span class="w-8 h-8 flex items-center justify-center rounded-full bg-red-300">W</span>
			<span class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200">4</span>
			<span
				class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 current animate-pulse"
				>•</span
			>
		</div>
	</section>

	<section class="mt-4 mx-3">
		<div class="flex items-center justify-between mb-2">
			<p class="font-bold">Recent Balls</p>

			<!-- 🔁 Undo -->
			<button
				class="px-3 py-1.5 text-sm font-bold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 active:scale-95"
			>
				Undo Last Ball
			</button>
		</div>
		<div class="space-y-2">
			<div class="bg-white p-3 rounded-lg shadow text-sm">5.3 · 1 run · Rahul to Rohit</div>
			<div class="bg-white p-3 rounded-lg shadow text-sm">5.2 · Wicket · Caught</div>
		</div>
	</section>
</div>
