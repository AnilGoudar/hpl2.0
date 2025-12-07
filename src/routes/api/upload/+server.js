import { supabase } from '$lib/supabaseClient.js';
import { error, json } from '@sveltejs/kit';

export async function POST({ request }) {
	const form = await request.formData();
	const file = form.get('file');
	const storageBucket = form.get('storage');
	if (!file || !storageBucket) {
		return json({ error: 'invalid form data' }, { status: 400 });
	}
	const fileExt = file.name.split('.').pop();
	const filePath = `${crypto.randomUUID()}.${fileExt}`;

	const { error: uploadError } = await supabase.storage.from(storageBucket).upload(filePath, file);
	if (uploadError) {
		throw error(500, uploadError.message);
	}
	const {
		data: { publicUrl }
	} = supabase.storage.from(storageBucket).getPublicUrl(filePath);

	return json(
		{
			url: publicUrl
		},
		{ status: 200 }
	);
}
