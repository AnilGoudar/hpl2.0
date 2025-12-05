import { supabase } from '$lib/supabaseClient.js';
import { json } from '@sveltejs/kit';
export async function POST({ request }) {
    const {email, password} = await request.json();
    const { data, error }= await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        return json(
            {error: error.message},
            {status: 401}
        )
    }
    const user = data.user;
    const session = data.session;
    
    const { data: admin, error:adminReadError } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', user.id)
    .single();

    if (adminReadError) {
        return json(
            {error: adminReadError},
            {status: 403 }
        )
    }

    return json(
        { data: {
            ...admin,
            ...session
        } }, 
        { status: 200 }
    )
}