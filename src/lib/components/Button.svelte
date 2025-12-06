<script>
	const { type = 'primary', text = 'Submit', onClick = () => {} } = $props();

	// base styles
	const baseClasses =
		'px-4 py-2 font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offse-2 focus:ring-opacity-75 transition duration-150 ease-in-out cursor-pointer';

	// based on type
	let typeClasses = '';
	switch (type) {
		case 'primary':
			typeClasses = 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500';
			break;
		case 'secondary':
			typeClasses = 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400';
			break;
		case 'danger':
			typeClasses = 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500';
			break;
		default:
			break;
	}

	const buttonClasses = `${baseClasses} ${typeClasses}`;
</script>

<button class={buttonClasses} onclick={onClick}>{text}</button>

<style>
	button {
		width: 100%;
	}
</style>
