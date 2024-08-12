// import type { PageServerLoad } from './$types';
// import { error } from '@sveltejs/kit';
// import { supabase_content } from '../../../../../supabase';

// interface Activity {
//     task_number: string;
//     status: string;
//     created_at: string;
// }

// export const load: PageServerLoad = async ({ params }) => {
//     const { id: userId } = params as { id: string };

//     if (!userId) {
//         throw error(400, 'User ID is required');
//     }

//     try {
//         const { data, error: supabaseError } = await supabase_content
//             .from('tasks')
//             .select('task_number, status, created_at')
//             .eq('assignee', userId)
//             .order('created_at', { ascending: false });

//         if (supabaseError) throw supabaseError;

//         return {
//             activities: data || []
//         };
//     } catch (err) {
//         console.error('Error fetching activities:', err);
//         throw error(500, 'Failed to load activities');
//     }
// };
