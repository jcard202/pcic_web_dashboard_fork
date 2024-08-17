<!-- src/routes/(sidebar)/crud/tasks/+page.svelte -->
<script lang="ts">
	import {
		Breadcrumb,
		BreadcrumbItem,
		Button,
		Checkbox,
		Drawer,
		Heading,
		Input,
		Label,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Toolbar,
		ToolbarButton
	} from 'flowbite-svelte';
	import {
		ArrowDownOutline,
		ArrowsRepeatOutline,
		ArrowUpDownOutline,
		ArrowUpOutline,
		PrinterSolid,
		CogSolid,
		DotsVerticalOutline,
		EditOutline,
		ExclamationCircleSolid,
		TrashBinSolid
	} from 'flowbite-svelte-icons';
	import { onMount, type ComponentType } from 'svelte';
	import { sineIn } from 'svelte/easing';
	import MetaTag from '../../../utils/MetaTag.svelte';
	import Delete from './Delete.svelte';
	import Task from './Task.svelte';
	import Toast from '../../../utils/widgets/Toast.svelte';
	import { Modal } from 'flowbite-svelte';
	import Pagination from '../../../utils/dashboard/Pagination.svelte';
	import jsPDF from 'jspdf';
	import Papa from 'papaparse';

	let isSyncing = false;

	let hidden: boolean = true; // modal control
	let drawerComponent: ComponentType = Task; // drawer component

	const toggle = (component: ComponentType) => {
		drawerComponent = component;
		hidden = !hidden;
	};

	const path: string = '/crud/tasks';
	const description: string = 'CRUD products example - PCIC Web Dashboard';
	const title: string = 'PCIC Web Dashboard - CRUD Products';
	const subtitle: string = 'CRUD Products';
	let transitionParams = {
		x: 320,
		duration: 200,
		easing: sineIn
	};

	let isLoading = true;

	export let data;

	let formView = '';

	let users: any[] = [];
	let tasks: any[] = [];
	let current_user: any = {};
	let selected_task: any = {};
	let statusFilter:string = 'all';
	let search:string = '';
	let modalType:string =  'clear_forms';
	/* 
	Modal Types 
		1. clear_forms
		2. delete_multiple
	*/
	

	let open: boolean = false;
	let confirm_delete:string = '';

	let filteredTasks: any[] = [];
	let sortings: any[] = [];
	let toastProps: { show: boolean; message: string; type: 'success' | 'error' } = {
		show: false,
		message: '',
		type: 'success'
	};

	let maxPageItems = 10;
	let currentPage = 1;

	let selectedTasks: any[] = [];

	$: ({ supabase } = data);

	onMount(async () => {
		current_user = (await supabase.auth.getUser()).data.user;
		await fetchUsers();
		await fetchTasks();
		
	});

	const handleConfirmDelete = (event:any) => {
		confirm_delete = event.target.value 
	}

	const handleStatusChange = (status:string)=>{
		statusFilter = status;
		sortFilterTasks();
	}

	const showToast = (message: string, type: 'success' | 'error') => {
		toastProps = { show: true, message, type };
		setTimeout(() => {
			toastProps = { ...toastProps, show: false };
		}, 3000);
	};

	const selectTasks = (task: any) => {
		if (!selectedTasks.includes(task)) {
			selectedTasks.push(task);
			selectedTasks = selectedTasks;
		} else {
			selectedTasks = selectedTasks.filter((_task) => _task !== task);
		}
	};

	const selectAllTasks = () => {
		if (selectedTasks >= filteredTasks) {
			selectedTasks = [];
		} else {
			selectedTasks = filteredTasks;
		}
	};

	const getPriorityIndex = (priority: string) => {
		const priorityMap: { [key: string]: number } = {
			high: 3,
			medium: 2,
			low: 1,
			'normal priority': 1.5,
		};

		return priorityMap[priority.toLowerCase()];
	};

	const sortFilterTasks = () => {
		// view filter
		filteredTasks =  tasks.filter(
			(task) =>
				task.status.toLowerCase().includes(statusFilter) || statusFilter == 'all'
		)
		filteredTasks = filteredTasks.filter(
			(task) =>
				task.task_number.toLowerCase().includes(search) ||
				task.users.inspector_name.toLowerCase().includes(search) ||
				task.service_type.toLowerCase().includes(search) ||
				task.service_group.toLowerCase().includes(search)
		);
		// selected filters
		selectedTasks = selectedTasks.filter((_task) => filteredTasks.includes(_task))
		for (const sort of sortings) {
			switch (sort) {
				case 'Task Name Desc':
					filteredTasks = filteredTasks.sort((a, b) => {
						return a.task_number.localeCompare(b.task_number);
					});
					break;
				case 'Service Type Desc':
					filteredTasks = filteredTasks.sort((a, b) => {
						return a.service_type.localeCompare(b.service_type);
					});
					break;
				case 'Priority Desc':
					filteredTasks = filteredTasks.sort((a, b) => {
						return getPriorityIndex(a.priority) - getPriorityIndex(b.priority);
					});
					break;
				case 'Task Name Asc':
					filteredTasks = filteredTasks.sort((b, a) => {
						return a.task_number.localeCompare(b.task_number);
					});
					break;
				case 'Service Type Asc':
					filteredTasks = filteredTasks.sort((b, a) => {
						return a.service_type.localeCompare(b.service_type);
					});
					break;
				case 'Priority Asc':
					filteredTasks = filteredTasks.sort((b, a) => {
						return getPriorityIndex(a.priority) - getPriorityIndex(b.priority);
					});
					break;
			}
		}
	};

	const filterBySearch = (event: any) => {
		search = event.target.value.toLowerCase();
		sortFilterTasks();
	};

	const setStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'completed':
				return 'text-green-500';
			case 'ongoing':
				return 'text-blue-500';
			case 'for dispatch':
				return 'text-yellow-500';
			default:
				return 'text-gray-500';
		}
	};

	const setPriorityColor = (priority: string) => {
		switch (priority.toLowerCase()) {
			case 'high':
				return 'text-red-500';
			case 'medium':
				return 'text-orange-500';
			case 'low':
				return 'text-yellow-500';
			default:
				return 'text-gray-500';
		}
	};

	const clearPPICForm = async (taskID: string) => {
		const form_response = await supabase
			.from('ppir_forms')
			.update({
				ppir_att_1: null,
				ppir_att_2: null,
				ppir_att_3: null,
				ppir_att_4: null,
				ppir_area_act: null,
				ppir_dopds_act: null,
				ppir_doptp_act: null,
				ppir_svp_act: null,
				ppir_variety: null,
				ppir_stagecrop: null,
				ppir_remarks: null,
				ppir_name_insured: null,
				ppir_name_iuia: null,
				ppir_sig_insured: null,
				ppir_sig_iuia: null
			})
			.eq('task_id', taskID);
		const task_response = await supabase.from('tasks').update({
			'status': 'for dispatch'
		}).eq('id', taskID);
		if (form_response.error || task_response.error) {
			showToast('Error in resetting PPIR Form!', 'error');
			return;
		}
	
		await fetchTasks();

		showToast('Successfully reset PPIR Form!', 'success');
	};

	const markAsComplete = async (taskID: string) => {
		const { data, error } = await supabase
			.from('tasks')
			.update({
				status: 'completed'
			})
			.eq('id', taskID);

		if (error) {
			console.log(error);
			showToast('Error in marking task as completed!', 'error');
			return false;
		}
		// add toast
		await fetchTasks();
		showToast('Successfully marked as completed', 'success');
		console.log('For successfully marked as completed');
		return true;
	};

	const upsertTask = async (upsertData: any) => {
		const invalidData = Object.keys(upsertData).find(
			(key) => key != 'id' && (upsertData[key] == null || upsertData[key].trim() == '')
		);
		if (invalidData) {
			showToast(`${invalidData.toUpperCase().replaceAll('_', ' ')} is required!`, 'error');
			return false;
		}
		const { data: responseData, error } = await supabase
			.from('tasks')
			.upsert(upsertData)
			.select(
				`
                    *,
                    users (
                        id,inspector_name
                    )
                `
			)
			.order('task_number', { ascending: true });
		if (error) {
			console.log(error);
			showToast('Error in processing data!', 'error');
			return false;
		}
		await fetchTasks();
		if (upsertData.id != null) {
			showToast('Successfully updated task', 'success');
		} else {
			showToast('Successfully added task', 'success');
		}
		return true;
	};

	const deleteTask = async (rowId: string) => {
		try {
			// Assuming 'id' is the primary key
			const { data, error } = await supabase.from('tasks').delete().eq('id', rowId);

			if (error) {
				showToast('Error in deleting task!', 'error');
				console.error('Error deleting row:', error.message);
				return;
			}
			await fetchTasks();
			showToast('Successfully deleted task', 'success');
			// Optionally, update state or perform other actions after deletion
		} catch (error) {
			console.error('Error deleting row:', error);
		}
	};

	const fetchUsers = async () => {
		try {
			const { data, error } = await supabase
				.from('users')
				.select(
					`
                    *,
                    regions (
                        region_name
                    )
                `
				)
				.neq('auth_user_id', current_user.id)
				.order('created_at', { ascending: false });

			if (error) {
				showToast('Error in fetching users', 'error');
				throw error;
			}
			users = data;
			console.log('Fetched users:', users);
		} catch (error) {
			console.error('Error fetching users:', error);
		}
	};

	const fetchTasks = async () => {
		try {
			const { data, error } = await supabase
				.from('tasks')
				.select(
					`
                    *,
					ppir_forms (*),
                    users (
                        id,inspector_name,email
                    )
                `
				)
				.order('task_number', { ascending: true });
			if (error) {
				showToast('Error in fetching users', 'error');
				throw error;
			}
			tasks = data;
			filteredTasks = tasks;
			sortFilterTasks();
		} catch (error) {
			console.error('Error fetching tasks:', error);
		} finally {
			isLoading = false;
		}
	};


	const generateFormView = (task:any, download:boolean=false) => {
		const data = task.ppir_forms;
		data.task_number = task.task_number;
		const doc = new jsPDF();
		const taskNumber = data.task_number || "Unknown Task"; // Title task number
		doc.setFontSize(16);
		doc.setFont('', 'bold');
		doc.text(`${taskNumber}`, 10, 15); // Title

		const fields = [
			"ppir_assignmentid", "ppir_dopds_act", "ppir_insuranceid", "ppir_doptp_act", "ppir_farmername", 
			"ppir_doptp_aci", "ppir_address", "ppir_svp_aci", "ppir_farmertype", "ppir_svp_act", "ppir_mobile_no", 
			"ppir_variety", "ppir_groupname", "ppir_stage_crop", "ppir_groupaddress", "ppir_remarks", 
			"ppir_lendername", "ppir_name_insured", "ppir_lenderaddress", "ppir_name_iuia", "ppir_cicno", 
			"ppir_farmloc", "ppir_north", "ppir_south", "ppir_east", "ppir_west", "ppir_att_1", "ppir_att_2", 
			"ppir_att_3", "ppir_att_4", "ppir_area_aci", "ppir_area_act", "ppir_dopds_aci"
		];

		let yPos = 30; // Starting y position after title
		const lineHeight = 10; // Space between lines
		const pageHeight = doc.internal.pageSize.height;
		const columnWidth = 95; // Half of page width (assuming A4 size)
		let column = 1; // Current column
		doc.setFontSize(11);
		
		fields.forEach((field, index) => {
			let value = data[field];
			if (value == null || value == '') {
				value = "NOT SET";
			}
			const label = field.replace(/^ppir_/, '').replace(/_/g, ' ').toUpperCase();

			// Set font for label
			doc.setFont('', 'bold');
			doc.text(`${label}:`, (column - 1) * columnWidth + (column==1? 10: 20), yPos);

			// Set font for value and draw underline
			doc.setFont('', 'normal');
			doc.text(`____________________________`, (column - 1) *  columnWidth + 50, yPos); // Underline
			doc.text(value, (column - 1) * columnWidth + 50, yPos);

			yPos += lineHeight;

			// Check if we need to switch to the next column
			if (yPos + lineHeight > pageHeight - 70 && column === 1) { // Adjusted margin to account for bottom space for signatures
				column = 2;
				yPos = 30; // Reset y position for second column
			} else if (yPos + lineHeight > pageHeight - 70 && column === 2) {
				doc.addPage();
				column = 1;
				yPos = 30;
			}
		});

		// Move yPos to bottom for signatures
		yPos = pageHeight - 50;

	// Signatures
		if (data.ppir_sig_insured) {
			const sigInsuredImg = `data:image/png;base64,${data.ppir_sig_insured}`;
			
			// Draw a square around the signature
			doc.setLineWidth(0.5); // Set the border thickness
			doc.rect(65, yPos - 30, 60, 30); // Draw the rectangle (x, y, width, height)
			
			doc.text("SIGNATURE OF INSURED:", 10, yPos-15);
			doc.addImage(sigInsuredImg, 'PNG', 70, yPos - 25, 50, 20); // Position the image inside the square
			yPos += 40; // Adjust yPos to leave space for the next signature
		}

		if (data.ppir_sig_iuia) {
			const sigIUIAImg = `data:image/png;base64,${data.ppir_sig_iuia}`;
			
			// Draw a square around the signature
			doc.setLineWidth(0.5); // Set the border thickness
			doc.rect(65, yPos - 30, 60, 30); // Draw the rectangle (x, y, width, height)
			
			doc.text("SIGNATURE OF IU/IA:", 10, yPos-15);
			doc.addImage(sigIUIAImg, 'PNG', 70, yPos - 25, 50, 20); // Position the image inside the square
		}
		if(download){
			doc.save(`${data.task_number}-${data.ppir_assignmentid}.pdf`)
		}
		return doc.output('datauristring');
	};
	/**
	 * Synchronizes with an FTP server.
	 *
	 * This function initiates a synchronization process with an FTP server by
	 * sending a request to the server and handling the response. Currently, the
	 * actual FTP request is commented out as the server setup is incomplete.
	 * The function handles potential errors and provides user feedback through
	 * toast notifications.
	 *
	 * @async
	 * @function syncWithFTP
	 *
	 * @returns {void}
	 *
	 * @example
	 * syncWithFTP();
	 *
	 * @description
	 * The function performs the following steps:
	 * 1. Sets `isSyncing` to `true` to indicate that the sync process is ongoing.
	 * 2. Attempts to fetch the FTP directory listing from a placeholder API endpoint.
	 *    - The actual fetch request is commented out due to the unavailability of the FTP server.
	 * 3. If the server response is successful, logs the FTP directory listing and shows a success toast notification.
	 * 4. If an error occurs, catches the error and shows an error toast notification.
	 * 5. Sets `isSyncing` to `false` once the process is complete, regardless of success or failure.
	 */
	async function syncWithFTP() {
		isSyncing = true;
		try {
			// ---------------------------------------------------------------------------------------------------- //
			// note: for now this is commented out because we don't have the FTP server yet (error in accounts)
			// code below can be uncommented once the FTP server is available
			//
			// const response = await fetch('/api/ftp', {
			//     method: 'POST',
			//     headers: { 'Content-Type': 'application/json' },
			//     body: JSON.stringify({ action: 'list', path: '/' })
			// });
			// const result = await response.json();
			// if (result.success) {
			//     console.log('FTP Directory listing:', result.data);
			//     showToast('Sync completed successfully!', 'success');
			// } else {
			//     throw new Error(result.error);
			// }
			// ---------------------------------------------------------------------------------------------------- //

			/**
			 * Synchronization Algorithm for CSV Data Import (gpt/claud's help optimal solution)
			 *
			 * This function implements a flexible approach for synchronizing CSV data,
			 * supporting both local file system and FTP server as data sources.
			 *
			 * Algorithm Overview:
			 * 1. Determine the data source (local or FTP)  (mar: local is for testing the folders csv file read -> static/sample_csv)
			 * 2. Retrieve a list of available CSV files from the selected source
			 * 3. For each CSV file:
			 *    a. Check if the file has already been processed (compare with database records) (mar: file_read.file_name)
			 *    b. If not processed, read the file content (mar: insert the file into file_read table and get the id for usage in tasks insert)
			 *    c. Parse the CSV data into structured records
			 *    d. For each record:
			 *       i.   Validate the data (e.g., check if assignee email exists in the users table) (mar: check if the assignee exists in the users table, else raise error and cancel the whole process and delete the inserted file_read record)
			 *       ii.  (if goods lang dito then) Insert a new task record into the database (mar: insert the task record with the file_read_id)
			 *       iii. Insert corresponding PPIR form data (mar: insert the ppir form data with the task_id)
			 *    e. Mark the file as processed in the database
			 * 4. Handle any errors that occur during the process
			 * 5. Provide feedback on the synchronization result (success or failure)
			 *
			 * The algorithm is designed to be idempotent, ensuring that files are not
			 * processed multiple times, and robust, with proper error handling and
			 * reporting mechanisms.
			 *
			 * Future Enhancements:
			 * - Implement parallel processing for improved performance with large datasets
			 * - Add support for incremental updates to handle partially modified files
			 * - Integrate a logging system for detailed synchronization history (mar: no need)
			 */
			 const directory = '/Work';
			 // Connect to the SFTP server
			 const fetched_list = await fetch('/api/list-directory', {
				method: 'POST',
				headers: {
				'Content-Type': 'application/json',
				},
				body: JSON.stringify({
				directory: `${directory}`,
				}),
			});

			if(!fetched_list.ok){
				console.error('Error fetching files:', fetched_list.statusText);
				return;
			}

					// List files in the remote directory
					const fileList = await fetched_list.json();
					// Iterate over each file
					for (const file of fileList) {
						if (file.name.endsWith('.csv')) { // Check if the file is a CSV
							console.log(`Processing file: ${file.name}`);
							const fetched_file = await fetch('/api/get-file', {
								method: 'POST',
								headers: {
								'Content-Type': 'application/json',
								},
								body: JSON.stringify({
								filePath: `${directory}/${file.name}`,
								}),
							});
							if(!fetched_file.ok){
								console.error('Error fetching file:', fetched_file.statusText);
								continue;
							}
							// Download the CSV file
							const csvData = await fetched_file.text();

							// Parse the CSV data
							const parsedData = Papa.parse(csvData, {
								header: true,
								skipEmptyLines: true,
							});

							const { data: existingFile, error: fileCheckError } = await supabase
							.from('file_read')
							.select('*')
							.eq('file_name', file.name)
							.single();

							if (fileCheckError && fileCheckError.code !== 'PGRST116') {
								console.error(`Error checking existence of file ${file.name}:`, fileCheckError);
								continue; // Skip to the next file if there's an error
							}

							if (existingFile) {
								// If the file already exists, skip processingconsole.log(`File ${fileName} already exists in the database. Skipping file.`);
								continue;
							}
							// store file to table
							const { data: fileReadData, error: fileReadError } = await supabase
							.from('file_read')
							.insert([{ file_name: file.name, file_type: 'csv' }])
							.select('id')
							.single();

							if (fileReadError) {
								console.error(`Error inserting data into file_read for ${file.name}:`, fileReadError);
								continue; // Skip to the next file if there's an error
							}

							const fileReadId = fileReadData.id; // Get the ID of the inserted file// Download the CSV fileconst csvData = await sftp.get(`/path/to/your/directory/${file.name}`);
							// const fileReadId = '1';

							// Iterate over each row in the CSV file
							for (const row of parsedData.data as any[]) {
								//  Users
								console.log(row);
								const assigneeEmail = row['Assignee'];
								let assigneeId;
								// Check if the assignee exists in the user table
								const { data: existingUser, error: userSelectError } = await supabase
									.from('users')
									.select('*')
									.eq('email', assigneeEmail)
									.single();

								if (userSelectError && userSelectError.code !== 'PGRST116') {
									console.error(`Error checking existence of user ${assigneeEmail}:`, userSelectError);
									showToast('System Error: Error checking existence new user', 'error');
									return; // Skip to the next row if there's an error
								}
								if (existingUser) {
								// If the user exists, get the user ID
									assigneeId = existingUser.id;
								} else {
									// If the user does not exist, create a new user and get the ID
									const { data: authData, error: authError } = await supabase.auth.admin.createUser({
										email: assigneeEmail,
										password: '1',
									});
									
									if(!authData.user){
										console.error(`Error creating new user for ${assigneeEmail}`);
										showToast('System Error: Error creating new user', 'error');
										return; // Skip to the next row if there's an error
									}
			

									assigneeId = authData.user.id
								}

								const ppirInsuranceId = row['ppir_insuranceid']; // Replace with your actual column name

								// Check if the row already exists in the ppir_forms table
								const { data: existingRow, error: selectError } = await supabase
									.from('ppir_forms')
									.select('ppir_insuranceid')
									.eq('ppir_insuranceid', ppirInsuranceId)
									.single();

								if (selectError && selectError.code !== 'PGRST116') {
									console.error(`Error checking existence of ${ppirInsuranceId} in ppir_forms:`, selectError);
									showToast('System Error: Error checking existence of ppir_form', 'error');
									return; // Skip to the next row if there's an error
								}

								if (!existingRow) {
									// If the row does not exist, insert it into both ppir_forms and tasks tables\
									const { data: taskData, error: taskError } = await supabase
										.from('tasks')
										.insert([{
											task_number: row['Task Number'],  // Replace with your specific task table column namesservice_group: row['Service Group'],
											service_type: row['Service Type'],
											service_group: row['Service Group'],
											priority: row['Priority'],
											assignee: assigneeId, // Store the assignee user ID
											file_id: fileReadId
										}]).select('id').single();

									if (taskError) {
										console.error(`Error inserting data into tasks for ${ppirInsuranceId}:`, taskError);
										showToast('System Error: Error inserting data into task', 'error');
										return;
									}
									const { data: ppirFormData, error: ppirFormError } = await supabase
									.from('ppir_forms')
									.insert([{
										task_id: taskData.id,
										ppir_assignmentid: row['ppir_assignmentid'],
										ppir_insuranceid: row['ppir_insuranceid'],
										ppir_farmername: row['ppir_farmername'],
										ppir_address: row['ppir_address'],
										ppir_farmertype: row['ppir_farmertype'],
										ppir_mobileno: row['ppir_mobileno'],
										ppir_groupname: row['ppir_groupname'],
										ppir_groupaddress: row['ppir_groupaddress'],
										ppir_lendername: row['ppir_lendername'],
										ppir_lenderaddress: row['ppir_lenderaddress'],
										ppir_cicno: row['ppir_cicno'],
										ppir_farmloc: row['ppir_farmloc'],
										ppir_north: row['ppir_north'],
										ppir_south: row['ppir_south'],
										ppir_east: row['ppir_east'],
										ppir_west: row['ppir_west'],
										ppir_att_1: row['ppir_att_1'],
										ppir_att_2: row['ppir_att_2'],
										ppir_att_3: row['ppir_att_3'],
										ppir_att_4: row['ppir_att_4'],
										ppir_area_aci: row['ppir_area_aci'],
										ppir_area_act: row['ppir_area_act'],
										ppir_dopds_aci: row['ppir_dopds_aci'],
										ppir_dopds_act: row['ppir_dopds_act'],
										ppir_doptp_aci: row['ppir_doptp_aci'],
										ppir_doptp_act: row['ppir_doptp_act'],
										ppir_svp_aci: row['ppir_svp_aci'],
										ppir_svp_act: row['ppir_svp_act'] == '' || !row['ppir_svp_act'] ? 'rice':  row['ppir_svp_act'], 
										ppir_variety: row['ppir_variety'],
										ppir_stagecrop: row['ppir_stagecrop'],
										ppir_remarks: row['ppir_remarks'],
										ppir_name_insured: row['ppir_name_insured'],
										ppir_name_iuia: row['ppir_name_iuia'],
										ppir_sig_insured: row['ppir_sig_insured'],
										ppir_sig_iuia: row['ppir_sig_iuia'],
										// Add other columns as needed
									}]);

									if (ppirFormError) {
										showToast('Error inserting data into ppir_forms', 'error');
										console.error(`Error inserting data into ppir_forms for ${ppirInsuranceId}:`, ppirFormError);
										continue; // Skip to the next row if there's an error
									}
									
								showToast(`Data for ${ppirInsuranceId} successfully inserted into both ppir_forms and tasks.`, 'success');
									
								} else {
									console.log(`Row with ppir_insuranceid ${ppirInsuranceId} already exists in ppir_forms. Skipping insertion.`);
								}
							}
						}
					}
				showToast('Sync completed successfully!', 'success');
		} catch (error) {
			// Type assertion
			const message = error instanceof Error ? error.message : 'An unknown error occurred';
			console.error('Sync failed:', message);
			showToast('Sync failed: ' + message, 'error');
		} finally {
			isSyncing = false;
		}
	}
</script>

<MetaTag {path} {description} {title} {subtitle} />

<main class="relative h-full w-full overflow-y-auto bg-white dark:bg-gray-800">
	<div class="p-4">
		<Breadcrumb class="mb-5">
			<BreadcrumbItem home>Home</BreadcrumbItem>
			<BreadcrumbItem href="/crud/tasks">Tasks</BreadcrumbItem>
			<!-- <BreadcrumbItem>List</BreadcrumbItem> -->
		</Breadcrumb>	
		<Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
			Task Management
		</Heading>

		<Toolbar embedded class="w-full py-4  text-gray-500 dark:text-gray-400">
			<Input
				on:keyup={filterBySearch}
				placeholder="Search for task"
				class="me-6 w-80 border xl:w-96"
			/>

			<div>
				<Button
					color={statusFilter == 'all' ? 'blue' : 'light'}
					on:click={()=>{
						handleStatusChange('all');
					}}
				>
					All
				</Button>
				<Button
					color={statusFilter == 'for dispatch' ? 'blue' : 'light'}
					on:click={()=>{
						handleStatusChange('for dispatch');
					}}
				>
					For Dispatch
				</Button>
				<Button
					color={statusFilter == 'ongoing' ? 'blue' : 'light'}
					on:click={()=>{
						handleStatusChange('ongoing');
					}}
				>
					Ongoing
				</Button>
				<Button
					color={statusFilter == 'completed' ? 'blue' : 'light'}
					on:click={()=>{
						handleStatusChange('completed');
					}}
				>
					Completed
				</Button>


			</div>
			

			<!-- <ToolbarButton
				color="dark"
				class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700"
			>
				<CogSolid size="lg" />
			</ToolbarButton>
			<ToolbarButton
				color="dark"
				class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700"
			>
				<TrashBinSolid size="lg" />
			</ToolbarButton>
			<ToolbarButton
				color="dark"
				class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700"
			>
				<ExclamationCircleSolid size="lg" />
			</ToolbarButton>
			<ToolbarButton
				color="dark"
				class="m-0 rounded p-1 hover:bg-gray-100 focus:ring-0 dark:hover:bg-gray-700"
			>
				<DotsVerticalOutline size="lg" />
			</ToolbarButton> -->

			<div slot="end" class="flex items-center justify-center space-x-2">
				<!-- mar sync -->
				<Button class="whitespace-nowrap" on:click={syncWithFTP} disabled={isSyncing}>
					{#if isSyncing}
						<span class="loader"></span>
					{:else}
						<ArrowsRepeatOutline size="sm" /> Sync
					{/if}
				</Button>

				<Button
					class="whitespace-nowrap"
					on:click={async () => {
						modalType = 'clear_forms';
						open = true;
					}}
					disabled={selectedTasks.length == 0}>Reset PPIC Forms</Button
				>

				<Button
					color='red'
					class="whitespace-nowrap"
					on:click={async () => {
						modalType = 'delete_multiple';
						open = true;
					}}
					disabled={selectedTasks.length == 0}>Delete Tasks</Button
				>

				<Button
					class="whitespace-nowrap"
					on:click={() => {
						selected_task = null;
						toggle(Task);
					}}>Add New Task</Button
				>
			</div>
		</Toolbar>
	</div>

	{#if isLoading}
	<div class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
		<img src="/images/pcic-spinner.gif" alt="Loading..." class="h-1/2 w-1/3"/>
	  </div>
	{:else}
	<Table class='select-none'>
		<TableHead class="border-y border-gray-200 bg-gray-100 dark:border-gray-700">
			<TableHeadCell class="w-4 p-4"
				><Checkbox
					on:click={selectAllTasks}
					checked={(selectedTasks.length >= filteredTasks.length && filteredTasks.length > 0)}
				/></TableHeadCell
			>
			{#each ['Task Name', 'Service Group', 'Service Type', 'Attempts', 'Priority', 'Status', 'Assignee', 'Actions'] as title}
				<TableHeadCell class="ps-4 font-normal">
					<div class="flex">
						{title}
						{#if ['Task Name', 'Service Type', 'Priority'].includes(title)}
							{#if !sortings.includes(title + ' Desc') && !sortings.includes(title + ' Asc')}
								<button
									on:click={() => {
										sortings.push(title + ' Desc');
										sortings = sortings;
										sortFilterTasks();
									}}
								>
									<ArrowUpDownOutline class="ml-2 cursor-pointer  hover:text-green-400" size="sm" />
								</button>
							{:else if sortings.includes(title + ' Desc')}
								<button
									on:click={() => {
										sortings = sortings.filter((item) => item !== title + ' Desc');
										sortings.push(title + ' Asc');
										sortings = sortings;
										sortFilterTasks();
									}}
								>
									<ArrowDownOutline
										class="ml-2 cursor-pointer text-green-500 hover:text-green-400"
										size="sm"
									/>
								</button>
							{:else}
								<button
									on:click={() => {
										sortings = sortings.filter((item) => item !== title + ' Asc');
										sortFilterTasks();
									}}
								>
									<ArrowUpOutline
										class="ml-2 cursor-pointer text-green-500 hover:text-green-400"
										size="sm"
									/>
								</button>
							{/if}
						{/if}
					</div>
				</TableHeadCell>
			{/each}
		</TableHead>
		<TableBody>
			{#each filteredTasks.slice((currentPage - 1) * maxPageItems,  ((currentPage - 1) * maxPageItems) + maxPageItems) as task}
				<TableBodyRow class="text-base">
					<TableBodyCell on:click={() => selectTasks(task)} class="w-4 p-4"
						><Checkbox checked={selectedTasks.includes(task)} /></TableBodyCell
					>
					<TableBodyCell class="flex items-center space-x-6 whitespace-nowrap p-4">
						<div class="text-sm font-normal text-gray-500 dark:text-gray-400">
							{#if task.status == 'completed'}
								<button on:click={()=> generateFormView(task,true)} class="text-base font-semibold text-gray-900 dark:text-white flex cursor-pointer hover:!text-green-500">
										<PrinterSolid class="mr-2"></PrinterSolid> 
									{task.task_number} 
								</button>
							{:else}
								<div class="text-base font-semibold text-gray-900 dark:text-white flex">
									{task.task_number} 
								</div>
							{/if}

							<div class="text-sm font-normal text-gray-500 dark:text-gray-400">
								{task.task_type} 
							</div>
						</div>
					</TableBodyCell>
					<TableBodyCell class="p-4 font-normal text-gray-500 dark:text-gray-400"
						>{task.service_group}</TableBodyCell
					>
					<TableBodyCell
						class="max-w-sm overflow-hidden truncate p-4 text-base font-normal text-gray-500 dark:text-gray-400 xl:max-w-xs"
						>{task.service_type}</TableBodyCell
					>
					<TableBodyCell class="p-4">{task.attempt_count}</TableBodyCell>
					<TableBodyCell
						class="p-4 font-normal dark:{setPriorityColor(task.priority)} {setPriorityColor(
							task.priority
						)}">{task.priority.toUpperCase()}</TableBodyCell
					>
					<TableBodyCell
						class="p-4 font-normal dark:{setStatusColor(task.status)} {setStatusColor(task.status)}"
						>{task.status.toUpperCase()}</TableBodyCell
					>
					<TableBodyCell class="p-4 font-normal text-gray-500 dark:text-gray-400">
						<div class="text-sm font-normal text-gray-500 dark:text-gray-400">
							<div class="text-base font-semibold text-gray-900 dark:text-white">
								{task.users.inspector_name.toUpperCase()}
							</div>
							<div class="text-sm font-normal text-gray-500 dark:text-gray-400">
								{task.users.email.toLowerCase()}
							</div>
						</div>
					</TableBodyCell>
					<TableBodyCell class="space-x-2">
						<Button
							size="sm"
							class="gap-2 px-3"
							on:click={() => {
								selected_task = task;
								if(task.ppir_forms){
									formView = generateFormView(selected_task);
								}
								toggle(Task);
							}}
						>
							<EditOutline size="sm" /> Manage
						</Button>
						<Button
							color="red"
							size="sm"
							class="gap-2 px-3"
							on:click={() => {
								selected_task = task;
								toggle(Delete);
							}}
						>
							<TrashBinSolid size="sm" /> Delete item
						</Button>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
	<Pagination 
		bind:currentPage
		totalPages={filteredTasks.length/maxPageItems}
		pageSize={maxPageItems}
		totalItems={filteredTasks.length}
	></Pagination>
	{/if}
</main>

<Drawer
	activateClickOutside={false}
	placement="right"
	transitionType="fly"
	{transitionParams}
	bind:hidden
>
	<svelte:component
		this={drawerComponent}
		{formView}
		{users}
		{markAsComplete}
		{selected_task}
		{upsertTask}
		deleteTask={() => deleteTask(selected_task.id)}
		clearForm={clearPPICForm}
		bind:hidden
	/>
</Drawer>

<Modal bind:open size="sm">
	<ExclamationCircleSolid class="mx-auto mb-4 mt-8 h-10 w-10 text-red-600" />

	<h3 class="mb-6 text-center text-lg text-gray-500 dark:text-gray-400">
		{
			modalType == 'clear_forms' ?
			"Are you sure you want reset PPIR forms of the selected tasks?" : 
			"Are you sure you want to permanently delete the selected tasks?"
		}
	</h3>
	{#if modalType == 'delete_multiple'}
		<Label class="space-y-2">
			<span>Type 'DELETE' to confirm deletion of selected tasks</span>
			<Input on:keyup={handleConfirmDelete} name="delete" class="border font-normal outline-none" placeholder="Type 'DELETE'"
			required />
		</Label>
	{/if}

	<div class="flex items-center justify-center">
		<Button
			color="red"
			class="mr-2"
			on:click={async () => {
				if(modalType == 'delete_multiple' && confirm_delete != 'DELETE'){
					showToast(`Please enter 'DELETE' to confirm task deletion!`, 'error');
					return;
				}
				for (const t of selectedTasks) {
					try {
						if(modalType == 'clear_forms'){
							await clearPPICForm(t.id);
							showToast(`Successfully cleared form of ${t.task_number}`, 'success');
						}else{
							await deleteTask(t.id);
							showToast(`Successfully deleted form of ${t.task_number}`, 'success');
						}
					} catch (e) {
						if(modalType == 'clear_forms'){
							showToast(`Failed to clear form of ${t.task_number}`, 'error');
						}else{
							showToast(`Failed to delete ${t.task_number}`, 'error');
						}
						return;
					}
				}
				if(modalType == 'clear_forms'){
					showToast(`Successfully cleared selected forms!`, 'success');
				}else{
					showToast(`Successfully deleted selected forms!`, 'success');
				}
				open = false;
			}}
			>Yes, I'm sure
		</Button>
		<Button color="alternative" on:click={() => (open = false)}>No, cancel</Button>
	</div>
</Modal>

<Toast {...toastProps} />
