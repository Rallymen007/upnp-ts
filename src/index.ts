import { EventEmitter } from 'events';
import { IP } from "./util";
import { SSDP } from "./ssdp";
import { Device } from './device';

module Upnp {

    export class Client extends EventEmitter {
        _ssdps: Array<SSDP> = [];
        _devices: Array<Device> = [];

        constructor(opts?: any) {
            super();
        }

        _debug(msg: any) {
            super.emit('debug', msg);
        }

        onOneOf(events: Array<string>, fn:any) {
            for (let e of events) {
                super.on(e, fn);
            }
        }
        
        getDevices():Array<Device>{
            return this._devices;
        }

        registerDevice(d: Device): void {
            let found: boolean = false;
            for (let device of this._devices) {
                if (device.location == d.location) {
                    device.update(d);
                    found = true;
                }
            }
            if (!found) {
                    this._devices.push(d);
                    super.emit('newdevice', d);
                    super.emit(d.devicetype, d);
            }
        }

        search(searchtype?: string) {
            //create an ssdp for each ip;
            this._debug(["Beginning search", searchtype]);
            if (!searchtype) searchtype = 'ssdp:all';
            let ipc: IP = new IP();
            let ips: any = ipc.addresses();
            for (let ip of ips) {
                this._ssdps.push(new SSDP((d) => {this._debug(d)}, ip));
            }

            for (let s of this._ssdps) {
                s.on('device', (device: Device) => {
                   this._debug(['got device', device.devicetype]);
                   this.registerDevice(device);
                });
                s.on('ready',  () => {
                    s.search(searchtype);
                });
            }
        }
        
        stopSearch(){
            for (let s of this._ssdps) {
                s.shutdown();
            }
        }
    }
}

export = Upnp;