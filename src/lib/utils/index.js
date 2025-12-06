export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function compressImage(file, maxWidth = 900, quality = 0.7) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.src = URL.createObjectURL(file);

		img.onload = () => {
			const canvas = document.createElement('canvas');

			const scale = file.width > maxWidth ? maxWidth / img.width : 1;

			canvas.width = img.width * scale;
			canvas.height = img.height * scale;

			const ctx = canvas.getContext('2d');
			if (!ctx) {
				reject('Canvas context unavailable');
				return;
			}

			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

			canvas.toBlob(
				(blob) => {
					if (!blob) {
						reject('Compression failed');
						return;
					}

					const compressed = new File([blob], file.name, {
						type: 'image/jpeg',
						lastModified: Date.now()
					});

					resolve(compressed);
				},
				'image/jpeg',
				quality
			);
		};

		img.onerror = (err) => reject(err);
	});
}

export async function fakePayementScreenshots(file) {
	const warnings = [];
	if (file.width && file.height) {
		if (file.width < 400 || file.height < 400) {
			warnings.push('Very low resolution – likely screenshot of a screenshot.');
		}
	}
	const ratio = file.width / file.height;
	if (ratio < 0.4 || ratio < 0.8) {
		warnings.push('Aspect ratio unusal for mobile screenshots');
	}

	return {
		isSuspicious: warnings.length > 0,
		warnings
	};
}
