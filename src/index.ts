import process = require('process');
import { EventEmitter } from 'events';
import { IP } from "./util";
import { SSDP } from "./ssdp";
import { Device } from './device';

module Upnp {
    const SSDP_PORT = 1900;
    const BROADCAST_ADDR = "239.255.255.250";

    export class Client extends EventEmitter {
        _ssdps: Array<SSDP> = [];
        _devices: Array<Device> = [];

        constructor(opts?: any) {
            super();
            //debugger;
        }

        _debug(msg: any) {
            super.emit('debug', msg);
        }

        onOneOf(events: Array<string>, fn:any) {
            for (let e of events) {
                super.on(e, fn);
            }
        }

        registerDevice(d: Device): void {
            let __this: Client = this;
            let found: boolean = false;
            for (let device of this._devices) {
                if (device.location == d.location) {
                    device.update(d);
                    found = true;
                }
            }
            if (!found) {
                //d.discover(function () {
                    __this._devices.push(d);
                    __this.emit('newdevice', d);
                    __this.emit(d.devicetype, d);
                //});
            }
        }

        search(searchtype?: string) {
            //create an ssdp for each ip;
            this._debug(["Beginning search", searchtype]);
            if (!searchtype) searchtype = 'ssdp:all';
            let __this = this;
            let ipc: IP = new IP();
            let ips: any = ipc.addresses();
            for (let ip of ips) {
                this._ssdps.push(new SSDP((d) => {this._debug(d)}, ip));
            }

            for (let s of this._ssdps) {
                s.on('device', function (device: Device) {
                    __this._debug(['got device', device.devicetype]);
                    __this.registerDevice(device);
                });
                s.on('ready', function () {
                    s.search(searchtype);
                });
            }
        }
    }
}

export = Upnp;