import { supabase } from '$lib/supabaseClient.js';
import { json } from '@sveltejs/kit';
export async function POST({ request, cookies }) {
	const { email, password } = await request.json();
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password
	});

	if (error) {
		return json({ error: error.message }, { status: 401 });
	}
	const user = data.user;
	const session = data.session;

	const { data: admin, error: adminReadError } = await supabase
		.from('admins')
		.select('*')
		.eq('user_id', user.id)
		.single();

	if (adminReadError) {
		return json({ error: adminReadError }, { status: 403 });
	}
	// set the cookies
	cookies.set('hpl_access_token', session.access_token, {
		path: '/',
		httpOnly: false,
		sameSite: 'strict',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 60 * 24 * 10
	});
	cookies.set('hpl_refresh_token', session.refresh_token, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 60 * 60 * 24 * 30
	});
	return json(
		{
			data: {
				...admin
			}
		},
		{ status: 200 }
	);
}
