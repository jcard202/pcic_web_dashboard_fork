

import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({locals: {supabase}}) => {


  const { data: taskData, error: taskError } = await supabase.rpc('get_task_data');
  const { data: userData, error: userError } = await supabase.rpc('get_user_task_counts');
  const { data: regionData, error: regionError } = await supabase.rpc('get_region_summary');

  if (taskError || userError || regionError) {
    console.error('Error fetching data:', taskError || userError || regionError);
  }
  return {
  
      tasks: taskData ?? [],
      users: userData ?? [],
      regions: regionData ?? []
  
  };
  
};

export const actions: Actions = {
    default: async ({locals: {supabase}}) => {
        await supabase.auth.signOut()
       
    }
};