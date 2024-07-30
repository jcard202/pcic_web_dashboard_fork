import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const { data: taskData, error: taskError } = await supabase.rpc('get_task_data');
	const { data: userData, error: userError } = await supabase.rpc('get_user_task_counts');
	const { data: regionData, error: regionError } = await supabase.rpc('get_region_summary');

	if (taskError || userError || regionError) {
		console.error('Error fetching data:', taskError || userError || regionError);
	}

	const {
		data: { user }
	} = await supabase.auth.getUser();
	const userId = user!.id;

	// Fetch the region_id associated with the authenticated user
	const { data: userRegion, error: userRegionError } = await supabase
		.from('users')
		.select('region_id')
		.eq('id', userId)
		.single();

	if (userRegionError) {
		console.error('Error fetching user region data:', userRegionError);
		return { regionName: null }; // Handle error as needed
	}

	// Fetch the region_name from the regions table using the region_id
	const { data: regionDatas, error: regionErrors } = await supabase
		.from('regions')
		.select('region_name')
		.eq('id', userRegion.region_id)
		.single();

	if (regionErrors) {
		console.error('Error fetching region name:', regionErrors);
		return {
			tasks: taskData ?? [],
			users: userData ?? [],
			regions: regionData ?? [],
			regionName: 'N/A'
		}; // Handle error as needed
	}

	const regionName = regionDatas?.region_name || null;

	return {
		tasks: taskData ?? [],
		users: userData ?? [],
		regions: regionData ?? [],
		userCurrentRegion: regionName
	};
};

export const actions: Actions = {
	default: async ({ locals: { supabase } }) => {
		await supabase.auth.signOut();
	}
};
