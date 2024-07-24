

import { optionalHeaders } from "$lib/utils/arraysAndObj";
import type { TaskData } from "$lib/utils/types";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase } }) => {


  // Fetch all tasks with related information
  const { data: tasks, error: tasksError } = await supabase
  .from('tasks')
  .select(`
    *,
    users(inspector_name),
    regions!tasks_service_group_fkey(region_name),
    ppir_forms(*)
  `)
  .order('created_at', { ascending: false });

  if (tasksError) {
    console.error('Error fetching tasks:', tasksError);
    return { tasks: [] };
  }

  // Process task data
  const processedTasks: TaskData[] = tasks.map(task => {
    const taskData: TaskData = {
      'Region': task.regions?.region_name || '',
      'Task Number': task.task_number || '',
      'Agent': task.users?.inspector_name || '',
      'Farmer Name': task.ppir_forms?.ppir_farmername || '',
      'Insurance ID': task.ppir_forms?.ppir_insuranceid || '',
      'PPI Assignment ID': task.ppir_forms?.ppir_assignmentid || '',
      'Task Status': task.status || '',
      'Date Added': task.created_at || '',
    };

    // Process optional headers
    optionalHeaders.forEach(header => {
      switch (header) {
        case 'Inspector':
          taskData[header] = task.users?.inspector_name || '';
          break;
        case 'Service Group':
          taskData[header] = task.service_group || '';
          break;
        case 'Service Type':
          taskData[header] = task.service_type || '';
          break;
        case 'Assignee':
          taskData[header] = task.users?.inspector_name || '';
          break;
        case 'Assignment ID':
          taskData[header] = task.ppir_forms?.ppir_assignmentid || '';
          break;
        case 'Address':
          taskData[header] = task.ppir_forms?.ppir_address || '';
          break;
        case 'Farmer Type':
          taskData[header] = task.ppir_forms?.ppir_farmertype || '';
          break;
        case 'Mobile No':
          taskData[header] = task.ppir_forms?.ppir_mobileno || '';
          break;
        case 'Group Name':
          taskData[header] = task.ppir_forms?.ppir_groupname || '';
          break;
        case 'Group Address':
          taskData[header] = task.ppir_forms?.ppir_groupaddress || '';
          break;
        case 'Lender Name':
          taskData[header] = task.ppir_forms?.ppir_lendername || '';
          break;
        case 'Lender Address':
          taskData[header] = task.ppir_forms?.ppir_lenderaddress || '';
          break;
        case 'CIC No':
          taskData[header] = task.ppir_forms?.ppir_cicno || '';
          break;
        case 'Farm Location':
          taskData[header] = task.ppir_forms?.ppir_farmloc || '';
          break;
        case 'Name Insured':
          taskData[header] = task.ppir_forms?.ppir_name_insured || '';
          break;
        case 'Name IUIA':
          taskData[header] = task.ppir_forms?.ppir_name_iuia || '';
          break;
      }
    });

    return taskData;
  });

  return {
    tasks: processedTasks,
   
  };
};




export const actions: Actions = {
    default: async ({locals: {supabase}}) => {
        await supabase.auth.signOut()
       
    }
};