import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .eq('is_deleted', false);




  if (usersError) {
    console.error('Error fetching users:', usersError);
    return { users: [] };
  }

  const { data: taskCounts, error: tasksError } = await supabase
    .from('tasks')
    .select('assignee, status')
    .in('status', ['for dispatch', 'ongoing', 'completed']);

  if (tasksError) {
    console.error('Error fetching task counts:', tasksError);
    return { users: users ?? [] };
  }

  const userTaskCounts = users?.map(user => {
    const userTasks = taskCounts?.filter(task => task.assignee === user.id) ?? [];
    return {
      ...user,
      total_dispatch: userTasks.filter(task => task.status === 'for dispatch').length,
      total_ongoing: userTasks.filter(task => task.status === 'ongoing').length,
      total_completed: userTasks.filter(task => task.status === 'completed').length,
    };
  }) ?? [];

  return {
    users: userTaskCounts
  };
};

export const actions: Actions = {
    default: async ({locals: {supabase}}) => {
        await supabase.auth.signOut()
       
    }
};