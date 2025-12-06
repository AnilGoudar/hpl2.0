<script>
	// In a real application, this array might contain names or QR code keys
	const UPI_NUMBERS = ['9945495381@ptyes'];
	// Placeholder URL for a QR Code image. Replace with your actual hosted QR image.
	import upiQr from '$lib/assets/upi-qr.jpeg';

	let copiedNumber = $state('');
	let timeoutId;

	const copyToClipboard = async (number) => {
		// Note: document.execCommand('copy') is sometimes used in sandboxed environments,
		// but navigator.clipboard.writeText() is the modern standard.
		try {
			// Use execCommand for broader compatibility in various environments
			const textarea = document.createElement('textarea');
			textarea.value = number;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);

			copiedNumber = number;

			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			timeoutId = setTimeout(() => {
				copiedNumber = '';
			}, 1000);
		} catch (err) {
			// Fallback or error logging
			console.error('Failed to copy text: ', err);
		}
	};

	const getCopyMessage = (number) => {
		return copiedNumber === number ? 'Copied!' : 'Copy';
	};

	// Function to set the dynamic text color based on state
	const getButtonTextColor = (number) => {
		return copiedNumber === number ? 'text-blue-600' : 'text-yellow-900 hover:text-yellow-700';
	};
</script>

<div class="mt-6 w-full rounded-lg border border-yellow-400 bg-yellow-50 p-2 shadow-lg">
	<p class="border-b border-yellow-300 pb-2 text-xl font-extrabold text-yellow-900">
		ನೋಂದಣಿ ಶುಲ್ಕ: ₹50
	</p>

	<!-- Payment Options Section -->
	<div class="mt-4 flex flex-col space-y-4 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-6">
		<!-- 1. UPI QR Code (Primary Mobile Method) -->
		<div class="flex flex-shrink-0 flex-col items-center">
			<p class="mb-2 text-sm font-semibold text-yellow-900">Scan for Instant Payment</p>
			<img
				src={upiQr}
				alt="UPI QR Code Placeholder"
				class="h-36 w-36 rounded-lg border-4 border-yellow-300 object-cover shadow-md"
			/>
		</div>

		<!-- 2. UPI Number List (Fallback/Manual Method) -->
		<div class="flex-grow">
			<p class="text-base font-semibold text-yellow-900">ಪರ್ಯಾಯವಾಗಿ, ಈ UPI ID ಗೆ ಪಾವತಿಸಿ:</p>

			<ul class="mt-3 space-y-2">
				{#each UPI_NUMBERS as number}
					<li
						class="flex items-center justify-between rounded-md bg-yellow-100/50 px-2 py-1 transition hover:bg-yellow-100"
					>
						<span class="text-md font-bold tracking-wider text-yellow-900">{number}</span>

						<button
							onclick={() => copyToClipboard(number)}
							class="flex items-center space-x-1 text-sm font-medium transition duration-150 {getButtonTextColor(
								number
							)}"
							title="Copy UPI Number"
						>
							<!-- Icon for Copy -->
							<svg
								class="h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 5H6a2 2 0 00-2 2v10a2 2 0 002 2h2m0-12H9a2 2 0 012-2h4a2 2 0 012 2v10a2 2 0 01-2 2h-4a2 2 0 01-2-2V7z"
								></path>
							</svg>
							<span class="w-14 text-left font-bold">{getCopyMessage(number)}</span>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<p class="mt-6 border-t border-yellow-300 pt-3 text-sm text-yellow-900">
		<strong>ಪಾವತಿ ಮಾಡಿದ ನಂತರ,</strong> ಪಾವತಿಯ ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.
	</p>
</div>
