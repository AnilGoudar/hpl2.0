import { supabase } from '$lib/supabaseClient';

export async function handle({ event, resolve }) {
    const access_token = event.cookies.get('hpl_access_token');
    if (access_token) {
        const { data, error } = await supabase.auth.getUser(access_token);
        if (!error && data?.user) {
            event.locals.user = data.user;
        }
    }
    return await resolve(event);
}