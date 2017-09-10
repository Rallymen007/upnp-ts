/// <reference types="node" />
import { EventEmitter } from 'events';
import { Service } from './service';
export declare class Device extends EventEmitter {
    private _debug;
    location: string;
    network: string;
    ip: string;
    server: string;
    devicetype: string;
    baseurl: string;
    _services: Array<Service>;
    constructor(_debug: {
        (d: any): void;
    }, network: string, msg: any, info: any);
    update(d: Device): void;
    toString(): string;
    parseDeviceType(s: string): void;
    getService(serviceType: string, cb: Function): void;
    parseServices(items: any): void;
    parseDevices(devices: any): void;
    parseDiscover(data: string): void;
    discover(cb: Function): void;
}
