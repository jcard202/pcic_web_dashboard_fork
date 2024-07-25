

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({locals: {supabase}}) => {


  const { data:taskData, error } = await supabase.rpc('get_task_data');

  

  if (error) {
    console.error('Error fetching task data:', error);
    return { tasks: [] };
  }

  return { tasks: taskData ?? [] };
  
};

export const actions: Actions = {
    default: async ({locals: {supabase}}) => {
        await supabase.auth.signOut()
       
    }
};