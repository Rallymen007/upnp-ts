/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class SSDP extends EventEmitter {
    private _debug;
    private _ip;
    private _skt;
    constructor(_debug: {
        (d: any): void;
    }, _ip: string);
    headersToObj(headers: string): Object;
    processMessage(msg: string, info: Object): void;
    search(st: string): void;
}
