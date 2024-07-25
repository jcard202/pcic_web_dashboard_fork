import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({locals:{supabase}}) => {
    const {data, error} = await supabase.auth.getSession()
	if(error){
		console.log(error);
			return {
				status: 500, // or any appropriate status code
				error: 'Failed to fetch session',
			};
	}
	if(data.session){
		redirect(303,'/dashboard');
	}
}

export const actions: Actions = {
    signin: async ({locals: {supabase} , request}) => {
        const {email, password} = Object.fromEntries(await request.formData()) as {email: string, password:string};

        const{ data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
        if(error){
            console.log(error);
            return JSON.stringify({
                success: false,
                message: error.message,
            })
        }
        const response = await supabase
                .from('users')
                .select(`*`).eq('email', email).single();
        if(!response.data.role.toLowerCase().includes('admin')){
            await supabase.auth.signOut();
            return JSON.stringify({
                success: false,
                message: 'Invalid login credentials',
            })
        }
        
        return  JSON.stringify({
            success: true,
            message: 'Login successful, redirecting...',
        })
    }
};