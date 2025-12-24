<script>
	import Intro from '$lib/components/Intro.svelte';
	import LatestNews from '$lib/components/LatestNews.svelte';
	import LiveMatchWidget from '$lib/components/LiveMatchWidget.svelte';
	import QuickAccess from '$lib/components/QuickAccess.svelte';
</script>

<LiveMatchWidget />
<Intro />
<div class="w-full px-3">
	<QuickAccess />
	<LatestNews />
</div>
