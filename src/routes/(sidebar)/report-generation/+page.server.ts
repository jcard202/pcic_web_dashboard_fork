import { defaultHeaders, optionalHeaders } from "$lib/utils/arraysAndObj";
import type { User, UserData } from "$lib/utils/types";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  const allHeaders: string[] = [...defaultHeaders, ...optionalHeaders];

  // Fetch users with their tasks and PPIR forms
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select(`
      *,
      tasks:tasks(
        *,
        ppir_forms(*)
      )
    `)
    .eq('is_deleted', false);

  if (usersError) {
    console.error('Error fetching users:', usersError);
    return { users: [], defaultHeaders, optionalHeaders, allHeaders };
  }

  // Process user data
  const processedUsers: UserData[] = (users as User[])?.map(user => {
    const userData: UserData = {
      'Inspector Name': user.inspector_name,
      'Mobile Number': user.mobile_number,
      'Total Dispatch': user.tasks.filter(task => task.status === 'for dispatch').length,
      'Total Ongoing': user.tasks.filter(task => task.status === 'ongoing').length,
      'Total Completed': user.tasks.filter(task => task.status === 'completed').length,
      'Backlogs': 0, // You may need to calculate this based on your business logic
    };

    // Add optional headers data
    optionalHeaders.forEach(header => {
      switch (header) {
        case 'Task Number':
          userData[header] = user.tasks[0]?.task_number ?? 'N/A';
          break;
        case 'Service Group':
          userData[header] = user.tasks[0]?.service_group ?? 'N/A';
          break;
        case 'Service Type':
          userData[header] = user.tasks[0]?.service_type ?? 'N/A';
          break;
        case 'Task Status':
          userData[header] = user.tasks[0]?.status ?? 'N/A';
          break;
        case 'Assignee':
          userData[header] = user.inspector_name;
          break;
        case 'Assignment ID':
          userData[header] = user.tasks[0]?.ppir_forms?.ppir_assignmentid ?? 'N/A';
          break;
        case 'Insurance ID':
          userData[header] = user.tasks[0]?.ppir_forms?.ppir_insuranceid ?? 'N/A';
          break;
        case 'Farmer Name':
          userData[header] = user.tasks[0]?.ppir_forms?.ppir_farmername ?? 'N/A';
          break;
        case 'Address':
          userData[header] = user.tasks[0]?.ppir_forms?.ppir_address ?? 'N/A';
          break;
        case 'Farmer Type':
          userData[header] = user.tasks[0]?.ppir_forms?.ppir_farmertype ?? 'N/A';
          break;
        case 'Group Name':
          userData[header] = user.tasks[0]?.ppir_forms?.ppir_groupname ?? 'N/A';
          break;
        case 'Group Address':
          userData[header] = user.tasks[0]?.ppir_forms?.ppir_groupaddress ?? 'N/A';
          break;
        case 'Lender Name':
          userData[header] = user.tasks[0]?.ppir_forms?.ppir_lendername ?? 'N/A';
          break;
        case 'Lender Address':
          userData[header] = user.tasks[0]?.ppir_forms?.ppir_lenderaddress ?? 'N/A';
          break;
        case 'CIC Number':
          userData[header] = user.tasks[0]?.ppir_forms?.ppir_cicno ?? 'N/A';
          break;
        case 'Farm Location':
          userData[header] = user.tasks[0]?.ppir_forms?.ppir_farmloc ?? 'N/A';
          break;
        case 'Insured Name':
          userData[header] = user.tasks[0]?.ppir_forms?.ppir_name_insured ?? 'N/A';
          break;
        case 'IUIA Name':
          userData[header] = user.tasks[0]?.ppir_forms?.ppir_name_iuia ?? 'N/A';
          break;
      }
    });

    return userData;
  }) ?? [];

  return {
    users: processedUsers,
    defaultHeaders,
    optionalHeaders,
    allHeaders
  };
};

export const actions: Actions = {
    default: async ({locals: {supabase}}) => {
        await supabase.auth.signOut()
       
    }
};