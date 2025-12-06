import { supabase } from '$lib/supabaseClient.js';
import { json } from '@sveltejs/kit';

export async function GET({ cookies }) {
	const { data, error } = await supabase.auth.getSession();
	if (error) {
		return json({ error: error.message }, { status: 401 });
	}
	const { session } = data;

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

	return json({ message: 'session set' }, { status: 200 });
}
