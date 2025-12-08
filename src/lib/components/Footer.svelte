<script>
</script>

<footer
	class="w-full text-center space-y-4 py-6 mt-5
    bg-gradient-to-r from-[#1877F2] via-[#0E63D8] to-[#1877F2]
    border-t-1 border-[#4895FF] shadow-inner pb-[80px]"
>
	<div class="flex justify-center items-center gap-4">
		<a
			href="tel:9740913798"
			class="inline-block h-[42px] px-6 py-2
                   bg-white text-[#0053B3] font-semibold
                   rounded-full shadow hover:bg-[#E8F1FF]
                   hover:scale-105 transition"
		>
			Contact Us
		</a>

		<button
			onclick={() => (window.location.href = '/rules')}
			class="h-[42px] px-6 py-2
                   bg-[#0053B3] text-white font-semibold
                   border-1 border-white rounded-full
                   shadow hover:bg-[#1877F2] hover:scale-105 transition"
		>
			Rules
		</button>
	</div>

	<p class="text-sm text-white/80 tracking-wide">
		&copy; {new Date().getFullYear()} HPL - Hadagali Premier League.
	</p>
</footer>
