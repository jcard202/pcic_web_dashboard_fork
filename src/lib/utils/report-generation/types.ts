export type HeaderArray = string[];

export interface Filter {
    selectedHeader: keyof Task;
    selectedOperator: string;
    value: string;
}

export interface SortCriteria {
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