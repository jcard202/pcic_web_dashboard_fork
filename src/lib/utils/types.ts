
export type TaskStatus = 'for dispatch' | 'ongoing' | 'completed';

export interface Task {
  id: string;
  task_number: string;
  status: string;
  regions?: {
    region_name: string;
  };
  users?: {
    inspector_name: string;
  };
  ppir_forms?: {
    ppir_assignmentid: string;
    ppir_insuranceid: string;
    ppir_farmername: string;
  };
}
export interface TaskData {
  'Region': string;
  'Task Number': string;
  'Agent': string;
  'Farmer Name': string;
  'Insurance ID': string;
  'PPI Assignment ID': string;
  'Task Status': string;
  'Inspector'?: string;
  'Service Group'?: string;
  'Service Type'?: string;
  'Assignee'?: string;
  'Assignment ID'?: string;
  'Address'?: string;
  'Farmer Type'?: string;
  'Mobile No'?: string;
  'Group Name'?: string;
  'Group Address'?: string;
  'Lender Name'?: string;
  'Lender Address'?: string;
  'CIC No'?: string;
  'Farm Location'?: string;
  'Name Insured'?: string;
  'Name IUIA'?: string;
  'Date Added'?: string; 
  [key: string]: string | undefined;
}

export interface User {
  id: string;
  inspector_name: string;
  mobile_number: string;
  tasks: Task[];
  is_deleted: boolean;
}

// export interface Task {
//   id: string;
//   task_number: string;
//   service_group: string;
//   service_type: string;
//   status: TaskStatus;
//   assignee: string;
//   ppir_forms?: PPIRForm;
// }

export interface PPIRForm {
  ppir_assignmentid: string;
  ppir_insuranceid: string;
  ppir_farmername: string;
  ppir_address: string;
  ppir_farmertype: string;
  ppir_groupname: string;
  ppir_groupaddress: string;
  ppir_lendername: string;
  ppir_lenderaddress: string;
  ppir_cicno: string;
  ppir_farmloc: string;
  ppir_name_insured: string;
  ppir_name_iuia: string;
}

export interface SortCriteria {
  column: string;
  ascending: boolean;
}