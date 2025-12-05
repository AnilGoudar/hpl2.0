<script>
	import Note from './Note.svelte';
	const latestNews = [
		'Registration of players and teams is completed',
		'Auction has been completed'
	];
</script>

<section class="my-2">
	<h2 class="text-sm uppercase font-bold">Latest News</h2>
	<div class="flex flex-col gap-2 mt-2">
		{#each latestNews as news}
			<Note text={news} />
		{/each}
	</div>
</section>
