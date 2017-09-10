"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xml = require("xml-parser/index.js");
const http = require("http");
const events_1 = require("events");
const service_1 = require("./service");
class Device extends events_1.EventEmitter {
    constructor(_debug, network, msg, info) {
        super();
        this._debug = _debug;
        this.baseurl = "";
        this._services = [];
        this.network = network;
        this.ip = info.address;
        this.location = msg['LOCATION'];
        this.server = msg['SERVER'];
        this.baseurl = this.location.substr(0, this.location.lastIndexOf("/"));
    }
    getServices() {
        return this._services;
    }
    update(d) {
        this.network = d.network;
        this.ip = d.ip;
        this.server = d.server;
    }
    toString() {
        let arrServices = [];
        for (let s of this._services) {
            arrServices.push(s.serviceType);
        }
        return this.devicetype + "\t" + this.ip + "\t" + this.location + "\t" + this.server + "\n" + JSON.stringify(arrServices);
    }
    parseDeviceType(s) {
        let rx = /urn:schemas-upnp-org:device:([a-zA-Z0-9]+):1/g;
        let arr = rx.exec(s);
        if (arr) {
            this.devicetype = arr[1];
        }
        else {
            this.devicetype = s;
        }
    }
    getService(serviceType, cb) {
        for (let s of this._services) {
            if (serviceType == s.serviceType) {
                cb(s);
            }
        }
    }
    parseServices(items) {
        for (let item in items) {
            this._services.push(new service_1.Service(this._debug, this.baseurl, items[item]));
        }
    }
    parseDevices(devices) {
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
                }
            }
        }
    }
    parseDiscover(data) {
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
                    }
                }
            }
        }
    }
    discover(cb) {
        let __this = this;
        http.get(this.location, (res) => {
            let data = '';
            res.on('error', (err) => { this._debug(['http error discovering', this.location, err]); });
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => { __this.parseDiscover(data); cb(); });
        }).on('error', (err) => {
            this._debug(['http error discovering', this.location, err]);
        });
    }
}
exports.Device = Device;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLmpzIiwic291cmNlUm9vdCI6IkQ6L2Rldi9ub2RlX3Byb2plY3RzL3VwbnAvc3JjLyIsInNvdXJjZXMiOlsiZGV2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQTRDO0FBQzVDLDZCQUE4QjtBQUM5QixtQ0FBc0M7QUFDdEMsdUNBQW9DO0FBRXBDLFlBQW9CLFNBQVEscUJBQVk7SUFTcEMsWUFBb0IsTUFBeUIsRUFBRSxPQUFlLEVBQUUsR0FBUSxFQUFFLElBQVM7UUFDL0UsS0FBSyxFQUFFLENBQUM7UUFEUSxXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUg3QyxZQUFPLEdBQVcsRUFBRSxDQUFDO1FBQ3JCLGNBQVMsR0FBbUIsRUFBRSxDQUFDO1FBSTNCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUc1QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRTNFLENBQUM7SUFFRCxXQUFXO1FBQ1AsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztJQUVELE1BQU0sQ0FBQyxDQUFTO1FBQ1osSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUMzQixDQUFDO0lBRUQsUUFBUTtRQUNKLElB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