import type { SupabaseClient } from "@supabase/supabase-js";

interface User {
    id: string;
    // Add other user properties here
  }

  interface AdditionalUserData {
    [key: string]: string | number | null;
  }
export const fetchAdditionalData  = async (supabase: SupabaseClient, activeHeaders: string[], users: User[]): Promise<AdditionalUserData[]> => {
    const additionalData = [];

    for (const user of users) {
        const userData: AdditionalUserData = {};
        for (const header of activeHeaders) {
            switch (header) {
              case 'Task Number': {
                const { data: taskData } = await supabase
                  .from('tasks')
                  .select('id')
                  .eq('assignee', user.id)
                  .single();
                userData['Task Number'] = taskData?.id ?? 'N/A';
                break;
              }
              case 'Service Group': {
                const { data: groupData } = await supabase
                  .from('service_groups')
                  .select('name')
                  .eq('user_id', user.id)
                  .single();
                userData['Service Group'] = groupData?.name ?? 'N/A';
                break;
              }
              // Add more cases for other optional headers
              // ...
            }
          }
      
          additionalData.push(userData);
            }

    return additionalData;
}


