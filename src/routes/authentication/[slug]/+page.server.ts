import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";









// FOR TESTING ONLY - tat
export const actions: Actions = {
    signin: async ({ locals: { supabase }, request }) => {
        const { email, password } = Object.fromEntries(await request.formData()) as { email: string, password: string };

        // Attempt to sign in first
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if(signInError){
            redirect(302, '/authentication/sign-in');
        }

        return redirect(303, '/custom-report')
    }
};
// NOTE KEN B u can delete this if nag implement ka auth here sa page - ty