export interface Action {
    type: 'open_ticket' | 'view_bill' | 'schedule_tech' | string;
    label: string;
    data?: any;
}
