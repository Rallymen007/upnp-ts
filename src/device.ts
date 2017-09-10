import xml = require('xml-parser/index.js');
import http = require('http');
import { EventEmitter } from 'events';
import { Service } from './service';

export class Device extends EventEmitter {
    location: string;
    network: string;
    ip: string;
    server: string;
    devicetype: string;
    baseurl: string = "";
    _services: Array<Service> = [];

    constructor(private _debug: { (d:any): void }, network: string, msg: any, info: any) {
        super();
        this.network = network;
        this.ip = info.address;
        this.location = msg['LOCATION'];
        this.server = msg['SERVER'];

        //find base url
        this.baseurl = this.location.substr(0, this.location.lastIndexOf("/"));

    }
    
    getServices():Array<Service> {
        return this._services;
    }

    update(d: Device): void {
        this.network = d.network;
        this.ip = d.ip;
        this.server = d.server;
    }

    toString() {
        let arrServices: Array<string> = [];
        for (let s of this._services) {
            arrServices.push(s.serviceType);
        }
        return this.devicetype + "\t" + this.ip + "\t" + this.location + "\t" + this.server + "\n" + JSON.stringify(arrServices);
    }
    parseDeviceType(s: string) {
        let rx = /urn:schemas-upnp-org:device:([a-zA-Z0-9]+):1/g;
        let arr = rx.exec(s);
        if (arr) {
            this.devicetype = arr[1];
        } else {
            this.devicetype = s;
        }
    }

    getService(serviceType: string, cb: Function): void {
        for (let s of this._services) {
            if (serviceType == s.serviceType) {
                cb(s);
            }
        }
    }

    parseServices(items: any) {
        for (let item in items) {
            this._services.push(new Service(this._debug, this.baseurl, items[item]));
        }
    }

    parseDevices(devices: any) {
        for (let device of devices) {
            for (let attribs of device.children) {
                switch (attribs.name) {
                    case 'deviceType':
                        this.parseDeviceType(attribs.content);
                        break;
                    case 'serviceList':
                        this.parseServices(attribs.children);
                        break;
                    case 'deviceList':
                        this.parseDevices(attribs.children);
                        break;
                    default:
                    //console.warn( 'unknown attrib', attribs.name );

                }
            }

        }
    }

    parseDiscover(data: string) {
        let obj = xml(data);
        for (let child of obj.root.children) {
            if (child.name == "device") {
                for (let attribs of child.children) {
                    switch (attribs.name) {
                        case 'deviceType':
                            this.parseDeviceType(attribs.content);
                            break;
                        case 'serviceList':
                            this.parseServices(attribs.children);
                            break;
                        case 'deviceList':
                            this.parseDevices(attribs.children);
                            break;
                        default:
                        //console.warn( 'unknown attrib', attribs.name );

                    }
                }
            }
        }

    }

    discover(cb: Function) {
        let __this = this;
        http.get(this.location, (res: any) => {
            let data: string = '';
            res.on('error', (err:any) => { this._debug(['http error discovering', this.location, err]); })
            res.on('data', (chunk: string) => { data += chunk });
            res.on('end', () => { __this.parseDiscover(data); cb() })
        }).on('error', (err:any) => {
            this._debug(['http error discovering', this.location, err]);
        });
    }

}
