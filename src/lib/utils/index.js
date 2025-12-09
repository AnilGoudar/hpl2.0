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

export function displayTeamName(name) {
	let displayName = '';
	switch (name) {
		case 'BSS Hunters':
			displayName = 'BSS';
			break;
		case 'Rani Chennamma Warriors':
			displayName = 'RCW';
			break;
		case 'SRC':
			displayName = 'SRC';
			break;
		case 'Angadi Kings':
			displayName = 'AK';
			break;
		case 'GSN Yuva Gharjane':
			displayName = 'GSN';
			break;
	}
	return displayName;
}

export function shuffleList(list) {
	let arr = [...list];
	for (let i = arr.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

export function displayDate(date) {
	const jsDate = new Date(date);
	const yyyy = jsDate.getFullYear();
	let mm = jsDate.getMonth() + 1;
	let dd = jsDate.getDate();
	if (dd < 10) dd = '0' + dd;
	if (mm < 10) mm = '0' + mm;
	return dd + '/' + mm + '/' + yyyy;
}
