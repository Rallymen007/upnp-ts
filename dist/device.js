"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Device = void 0;
const xml = require("xml-parser/index.js");
const http = require("http");
const events_1 = require("events");
const service_1 = require("./service");
class Device extends events_1.EventEmitter {
    constructor(_debug, network, msg, info) {
        super();
        this._debug = _debug;
        this.baseurl = "";
        this.friendlyName = "";
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
    parseFriendlyName(s) {
        this.friendlyName = s;
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
                        case 'friendlyName':
                            this.parseFriendlyName(attribs.content);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLmpzIiwic291cmNlUm9vdCI6InNyYy8iLCJzb3VyY2VzIjpbImRldmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBNEM7QUFDNUMsNkJBQThCO0FBQzlCLG1DQUFzQztBQUN0Qyx1Q0FBb0M7QUFFcEMsTUFBYSxNQUFPLFNBQVEscUJBQVk7SUFVcEMsWUFBb0IsTUFBeUIsRUFBRSxPQUFlLEVBQUUsR0FBUSxFQUFFLElBQVM7UUFDL0UsS0FBSyxFQUFFLENBQUM7UUFEUSxXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUo3QyxZQUFPLEdBQVcsRUFBRSxDQUFDO1FBQ3hCLGlCQUFZLEdBQVcsRUFBRSxDQUFDO1FBQ3ZCLGNBQVMsR0FBbUIsRUFBRSxDQUFDO1FBSTNCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUc1QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRTNFLENBQUM7SUFFRCxXQUFXO1FBQ1AsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQzFCLENBQUM7SUFFRCxNQUFNLENBQUMsQ0FBUztRQUNaLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUN6QixJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDZixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDM0IsQ0FBQztJQUVELFFBQVE7UUFDSixJ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