/// <reference types="node" />
import { EventEmitter } from 'events';
import { SSDP } from "./ssdp";
import { Device } from './device';
declare module Upnp {
    class Client extends EventEmitter {
        _ssdps: Array<SSDP>;
        _devices: Array<Device>;
        constructor(opts?: any);
        _debug(msg: any): void;
        onOneOf(events: Array<string>, fn: any): void;
        getDevices(): Array<Device>;
        registerDevice(d: Device): void;
        search(searchtype?: string): void;
    }
}
export = Upnp;
