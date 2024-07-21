import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad,  } from '../$types';
export const load: LayoutServerLoad = async ({locals}) => {
	const {data, error} = await locals.supabase.auth.getSession()
	if(error){
		console.log(error);
			return {
				status: 500, // or any appropriate status code
				error: 'Failed to fetch session',
			};
	}
	if(!data.session){
		redirect(303,'/authentication/sign-in');
	}
};