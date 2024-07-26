import type { UserWithTaskCounts } from '$lib/utils/types';
import type { PageServerLoad } from './$types';



export const load: PageServerLoad = async ({ locals }): Promise<{ users: UserWithTaskCounts[] }> => {
  const { supabase } = locals;

  try {
    const { data, error } = await supabase.rpc('get_user_task_counts');

    if (error) {
      console.error('Error fetching data:', error);
      return { users: [] };
    }

    console.log('Data received from server:', data);

    return { users: data as UserWithTaskCounts[] };
  } catch (e) {
    console.error('Unexpected error:', e);
    return { users: [] };
  }
};