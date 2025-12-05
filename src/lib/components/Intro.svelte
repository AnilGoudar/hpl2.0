<script>
	const startYear = 2025;

	function getSeasonNumber() {
		let currentYear = new Date().getFullYear();
		if (startYear === currentYear) {
			currentYear += 1;
		}
		return currentYear - startYear + 1;
	}
</script>

<div class="intro-card">
	<h1 class="title">Welcome to HPL</h1>
	<h2 class="text-lg font-bold">Season {getSeasonNumber()}</h2>
	<p class="subtitle">
		The official home of the Hadagali Premier League. Follow matches, track scores, and explore your
		teams.
	</p>
</div>

<style>
	/* Card with subtle border, light shadow, rounded corners */
	.intro-card {
		background: white;
		border: 1px solid #d1d1d1;
		border-radius: 1.25rem;
		padding: 2rem 1rem;
		max-width: 600px;
		text-align: center;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
		animation: fadeIn 0.5s ease-out;
	}

	.title {
		font-size: 2.5rem;
		font-weight: 700;
		color: #111;
	}

	.subtitle {
		font-size: 1rem;
		color: #555;
		line-height: 1.6;
	}

	/* Smooth fade-in */
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
