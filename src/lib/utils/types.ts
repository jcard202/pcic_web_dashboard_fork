
export type TaskStatus = 'for dispatch' | 'ongoing' | 'completed';

export interface UserData {
  [key: string]: string | number | boolean | null;
}

export interface User {
  id: string;
  inspector_name: string;
  mobile_number: string;
  tasks: Task[];
  is_deleted: boolean;
}

export interface Task {
  id: string;
  task_number: string;
  service_group: string;
  service_type: string;
  status: TaskStatus;
  assignee: string;
  ppir_forms?: PPIRForm;
}

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