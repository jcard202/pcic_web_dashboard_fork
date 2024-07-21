import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions: Actions = {
    signin: async ({locals: {supabase} , request}) => {
        const {email, password} = Object.fromEntries(await request.formData()) as {email: string, password:string};

        const{ data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
        if(error){
            console.log(error);
            return {
                status:401
            };   
        }
        const response = await supabase
                .from('users')
                .select(`*`).eq('email', email).single();
        if(!response.data.role.toLowerCase().includes('admin')){
            await supabase.auth.signOut();
            return {
                status:401
            };
        }
        
        redirect(303, '/dashboard');
    }
};