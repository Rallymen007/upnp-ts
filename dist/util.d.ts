export declare class IP {
    addresses(): Array<string>;
}
export declare class USoap {
    private _debug;
    private _endpoint;
    private _ns;
    private _url;
    constructor(_debug: {
        (d: any): void;
    }, _endpoint: string, _ns: string);
    private _createBody(action, arg);
    post(action: string, data: any, cb: Function, err: Function): void;
}
