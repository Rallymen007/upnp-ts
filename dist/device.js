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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV2aWNlLmpzIiwic291cmNlUm9vdCI6IkQ6L2Rldi9ub2RlX3Byb2plY3RzL3VwbnAvc3JjLyIsInNvdXJjZXMiOlsiZGV2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQTRDO0FBQzVDLDZCQUE4QjtBQUM5QixtQ0FBc0M7QUFDdEMsdUNBQW9DO0FBRXBDLFlBQW9CLFNBQVEscUJBQVk7SUFTcEMsWUFBb0IsTUFBeUIsRUFBRSxPQUFlLEVBQUUsR0FBUSxFQUFFLElBQVM7UUFDL0UsS0FBSyxFQUFFLENBQUM7UUFEUSxXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUg3QyxZQUFPLEdBQVcsRUFBRSxDQUFDO1FBQ3JCLGNBQVMsR0FBbUIsRUFBRSxDQUFDO1FBSTNCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUc1QixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRTNFLENBQUM7SUFFRCxNQUFNLENBQUMsQ0FBUztRQUNaLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUN6QixJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDZixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDM0IsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLFdBQVcsR0FBa0IsRUFBRSxDQUFDO1FBQ3BDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJ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