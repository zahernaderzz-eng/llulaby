export interface ISendNotificationData {
    receivers: string[];
    title: string;
    body: string;
    key: string;
    data?: Record<string, any>;
    saveToDb?: boolean;
}
