import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
    signin: async ({locals: {supabase} , request}) => {
        const {email, password} = Object.fromEntries(await request.formData()) as {email: string, password:string};

        console.log(email, password);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

        //   Create valdiation 
        if(error){
            redirect(302, '/authentication/sign-in')
        }

        console.log(data)

        redirect(303, '/dashboard');
    }
};