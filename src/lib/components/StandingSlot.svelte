<script>
	let isExpanded = $state(false);

	function toggleExpaned() {
		isExpanded = !isExpanded;
	}
</script>

<div class="bg-white border-b-1 border-gray-500 shadow-lg py-2" onclick={toggleExpaned}></div>
