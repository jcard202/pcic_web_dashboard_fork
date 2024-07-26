export type HeaderArray = string[];

export interface TaskFilter {
    selectedHeader: keyof Task;
    selectedOperator: string;
    value: string;
}

export interface TaskSortCriteria {
    column: keyof Task;
    ascending: boolean;
}

export interface Task {
    Region: string;
    'Task Number': string;
    Agent: string;
    'Farmer Name': string;
    'Insurance ID': string;
    'PPI Assignment ID': string;
    'Task Status': string;
    Inspector?: string;
    'Service Group'?: string;
    'Service Type'?: string;
    Assignee?: string;
    'Assignment ID'?: string;
    Address?: string;
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

    [key: string]: string | undefined;  // Index signature for dynamic access
}

export interface User {
    id: string;
    role: string;
    email: string;
    mobile_number: string | null;
    local_id: string;
    region_name: string;
    inspector_name: string;
    for_dispatch_count: number;
    ongoing_count: number;
    completed_count: number;
    total_tasks: number;
    [key: string]: string | number | null | undefined; // Index signature for dynamic access
}

export interface UserFilter {
    selectedHeader: keyof User;
    selectedOperator: string;
    value: string;
}

export interface UserSortCriteria {
    column: keyof User;
    ascending: boolean;
}

// Region types
export interface Region {
    'Region ID': string;
    'Region Code': string;
    'Region Name': string;
    'Total Users': number;
    'Total Agents': number;
    'Total Regional Admins': number;
    'Total National Admins': number;
    'Total Tasks': number;
    'Total Dispatch Tasks': number;
    'Total Ongoing Tasks': number;
    'Total Completed Tasks': number;
    'Total PPIR Tasks': number;
    'Total Unknown Tasks': number;

    [key: string]: string | number;  // Index signature for dynamic access
}

export interface RegionFilter {
    selectedHeader: keyof Region;
    selectedOperator: string;
    value: string;
}

export interface RegionSortCriteria {
    column: keyof Region;
    ascending: boolean;
}
