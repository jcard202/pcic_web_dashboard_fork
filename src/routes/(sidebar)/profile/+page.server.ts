import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  
  // Get the authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('Error fetching authenticated user or no user found:', userError?.message);
    return { userProfileData: null };
  }

  console.log(user);
  

  // Fetch the current authenticated user's data from the 'users' table
  const { data: userRow, error: userRowError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (userRowError) {
    console.error('Error fetching user data:', userRowError.message);
    return { userProfileData: [] };
  }

  console.log(userRow);
  

  return {
    userProfileData: userRow
  };
};
