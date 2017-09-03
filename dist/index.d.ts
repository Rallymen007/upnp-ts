/// <reference types="node" />
import events = require('events');
declare module Upnp {
    class IP {
        addresses(): Array<string>;
    }
    class USoap {
        private _endpoint;
        private _ns;
        private _url;
        constructor(_endpoint: string, _ns: string);
        private _createBody(action, arg);
        post(action: string, data: any, cb: Function): void;
    }
    class Service {
        baseurl: string;
        serviceType: string;
        controlURL: string;
        eventSubURL: string;
        SCPDURL: string;
        ns: string;
        _soap: USoap;
        parseServiceType(s: string): string;
        post(action: string, args: any): Promise<any>;
        constructor(baseurl: string, data: any);
    }
    class Device {
        location: string;
        network: string;
        ip: string;
        server: string;
        devicetype: string;
        baseurl: string;
        _services: Array<Service>;
        constructor(network: string, msg: any, info: any);
        update(d: Device): void;
        toString(): string;
        parseDeviceType(s: string): void;
        getService(serviceType: string, cb: Function): void;
        parseServices(items: any): void;
        parseDevices(devices: any): void;
        parseDiscover(data: string): void;
        discover(cb: Function): void;
    }
    class SSDP extends events.EventEmitter {
        private _ip;
        private _skt;
        constructor(_ip: string);
        close(cb: Function): void;
        headersToObj(headers: string): Object;
        processMessage(msg: string, info: Object): void;
        search(st: string): void;
    }
    class Client extends events.EventEmitter {
        _ssdps: Array<SSDP>;
        _devices: Array<Device>;
        constructor(opts?: any);
        registerDevice(d: Device): void;
        search(searchtype?: string): void;
    }
}
export = Upnp;
