<script>
	/** @type {{ name: string, size?: "sm" | "md" | "lg", class?: string }} */
	let { name = 'Anonymous', size = 'md', class: customClass = '', isStriker = false } = $props();

	// Logic to get initials (e.g., "John Doe" -> "JD")
	let initials = $derived.by(() => {
		if (!name) return '?';
		const parts = name.trim().split(' ');
		if (parts.length > 1) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return parts[0][0].toUpperCase();
	});

	// Size mappings
	const sizes = {
		sm: 'w-8 h-8 text-xs',
		md: 'w-10 h-10 text-sm',
		lg: 'w-14 h-14 text-base'
	};
</script>

<div class="flex items-center gap-3 {customClass}">
	<div
		class="{sizes[
			size
		]} flex items-center justify-center rounded-full bg-slate-600 font-black text-white uppercase tracking-tighter shrink-0 border border-white/10 shadow-sm"
	>
		{initials}
	</div>

	<span class="font-bold text-slate-800 truncate uppercase tracking-tight">
		{name}
		{isStriker ? '⚡' : ''}
	</span>
</div>

<style>
	div {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
</style>
