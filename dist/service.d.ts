import { USoap } from "./util";
export declare class Service {
    private _debug;
    baseurl: string;
    serviceType: string;
    controlURL: string;
    eventSubURL: string;
    SCPDURL: string;
    ns: string;
    _soap: USoap;
    parseServiceType(s: string): string;
    post(action: string, args: any): Promise<any>;
    constructor(_debug: {
        (d: any): void;
    }, baseurl: string, data: any);
    sid: string;
    timeoutHandle: ReturnType<typeof setTimeout>;
    subscribe(callback: string): void;
    renew(): void;
    unsubscribe(): void;
}
