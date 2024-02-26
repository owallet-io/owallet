export default class HttpProvider {
    constructor(host: any, timeout?: number, user?: boolean, password?: boolean, headers?: {}, statusPage?: string);
    host: any;
    timeout: number;
    user: boolean;
    password: boolean;
    headers: {};
    statusPage: string;
    instance: import("axios").AxiosInstance;
    setStatusPage(statusPage?: string): void;
    isConnected(statusPage?: string): Promise<any>;
    request(url: any, payload?: {}, method?: string): Promise<any>;
}
