"use strict";
const os = require("os");
const dgram = require("dgram");
const process = require("process");
const Buffer = require("buffer");
const events = require("events");
const http = require("http");
const URL = require("url");
/* non node modules */
const xml = require("xml-parser");
var Upnp;
(function (Upnp) {
    const SSDP_PORT = 1900;
    const BROADCAST_ADDR = "239.255.255.250";
    class IP {
        addresses() {
            var addresses = [];
            var interfaces = os.networkInterfaces();
            for (var int in interfaces) {
                for (var virt in interfaces[int]) {
                    let i = interfaces[int][virt];
                    if (i['family'] == "IPv4" && i['internal'] == false) {
                        addresses.push(i.address);
                    }
                }
            }
            return addresses;
        }
    }
    Upnp.IP = IP;
    class USoap {
        constructor(_endpoint, _ns) {
            this._endpoint = _endpoint;
            this._ns = _ns;
            this._url = URL.parse(this._endpoint);
        }
        _createBody(action, arg) {
            let b = '<?xml version="1.0"?>\n';
            b += '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">\n';
            b += '\t<s:Body>\n';
            b += '\t\t<u:' + action + ' xmlns:u="' + this._ns + '">\n';
            for (let i in arg) {
                b += '\t\t\t<' + i + '>' + arg[i] + '</' + i + '>\n';
            }
            b += '\t\t</u:' + action + '>\n';
            b += '\t</s:Body>\n';
            b += '</s:Envelope>';
            return b;
        }
        post(action, data, cb) {
            let body = this._createBody(action, data);
            let opts = {
                hostname: this._url.hostname,
                port: this._url.port,
                path: this._url.path,
                protocol: this._url.protocol,
                method: 'POST',
                headers: {
                    'Content-Type': 'text/xml; charset="utf-8"',
                    'Content-Length': Buffer.Buffer.byteLength(data),
                    'Connection': 'close',
                    'SOAPAction': JSON.stringify(this._ns + '#' + action)
                }
            };
            let resdata = "";
            let req = http.request(opts, (res) => {
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    resdata += chunk;
                });
                res.on('end', () => {
                    let d = xml(resdata);
                    let r = [];
                    for (let val of d.root.children[0].children[0].children) {
                        r[val.name] = val.content;
                    }
                    cb(r);
                });
                res.on('error', (e) => {
                    console.warn('error posting to device');
                });
            });
            req.write(body);
            req.end();
        }
    }
    Upnp.USoap = USoap;
    class Service {
        constructor(baseurl, data) {
            this.baseurl = baseurl;
            for (let i of data.children) {
                switch (i.name) {
                    case "serviceType":
                        this.ns = i.content;
                        this.serviceType = this.parseServiceType(i.content);
                        break;
                    case "controlURL":
                        this.controlURL = i.content;
                        break;
                    case "eventSubURL":
                        this.eventSubURL = i.content;
                        break;
                    case "SCPDURL":
                        this.SCPDURL = i.content;
                        break;
                }
            }
            this._soap = new USoap(this.baseurl + this.controlURL, this.ns);
        }
        parseServiceType(s) {
            let rx = /urn:schemas-upnp-org:service:([a-zA-Z0-9]+):1/g;
            let arr = rx.exec(s);
            if (arr) {
                return arr[1];
            }
            else {
                return s;
            }
        }
        post(action, args) {
            return new Promise((resolve, reject) => {
                this._soap.post(action, args, function (res) { resolve(res); });
            });
        }
    }
    Upnp.Service = Service;
    class Device {
        constructor(network, msg, info) {
            this.baseurl = "";
            this._services = [];
            this.network = network;
            this.ip = info.address;
            this.location = msg['LOCATION'];
            this.server = msg['SERVER'];
            //find base url
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
                this._services.push(new Service(this.baseurl, items[item]));
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
            let _this = this;
            http.get(this.location, (res) => {
                let data = '';
                res.on('data', function (chunk) { data += chunk; });
                res.on('end', () => { _this.parseDiscover(data); cb(); });
            });
        }
    }
    Upnp.Device = Device;
    class SSDP extends events.EventEmitter {
        constructor(_ip) {
            super();
            this._ip = _ip;
        }
        close(cb) {
            //this._server.close( cb )
        }
        headersToObj(headers) {
            let ret = [];
            let lines = headers.split("\r\n");
            for (let line of lines) {
                if (line != "" && line.indexOf(":") > 0) {
                    ret[line.substr(0, line.indexOf(":")).toUpperCase().trim()] = line.substr(line.indexOf(':') + 1).trim();
                }
                else if (line != '') {
                    ret['RESPONSE-TYPE'] = line.substr(0, line.indexOf(" ")).trim().toUpperCase();
                }
            }
            return ret;
        }
        processMessage(msg, info) {
            let res = this.headersToObj(msg);
            if (res['LOCATION']) {
                this.emit('device', new Device(this._ip, res, info));
            }
        }
        search(st) {
            let _sthis = this;
            let message = "M-SEARCH * HTTP/1.1\r\n" +
                "HOST: " + BROADCAST_ADDR + ":" + SSDP_PORT + "\r\n" +
                "MAN: \"ssdp:discover\"\r\n" +
                "MX: 3\r\n" +
                "ST: ssdp:" + st + "\r\n" +
                "USER-AGENT: nodejs/" + process.version + " UPnP/2.0 draketv/2.0\r\n\r\n";
            let skt = dgram.createSocket({ type: 'udp4', reuseAddr: true }, function (msg, rinfo) {
                _sthis.processMessage(msg.toString(), rinfo);
            });
            skt.on('listening', function () {
                skt.send(message, 0, (message.length), SSDP_PORT, BROADCAST_ADDR, function () {
                });
            });
            skt.bind(SSDP_PORT, undefined, function () {
                skt.addMembership(BROADCAST_ADDR, _sthis._ip);
            });
        }
    }
    Upnp.SSDP = SSDP;
    class Client extends events.EventEmitter {
        constructor() {
            super(...arguments);
            this._ssdps = [];
            this._devices = [];
        }
        registerDevice(d) {
            let _this = this;
            let found = false;
            for (let device of this._devices) {
                if (device.location == d.location) {
                    device.update(d);
                    found = true;
                }
            }
            if (!found) {
                d.discover(function () {
                    _this._devices.push(d);
                    _this.emit('newdevice', d);
                    _this.emit(d.devicetype, d);
                });
            }
        }
        search() {
            //create an ssdp for each ip;
            let _this = this;
            let ipc = new IP();
            let ips = ipc.addresses();
            for (let ip of ips) {
                this._ssdps.push(new SSDP(ip));
            }
            for (let s of this._ssdps) {
                s.on('device', function (device) {
                    _this.registerDevice(device);
                });
                s.search('all');
            }
        }
    }
    Upnp.Client = Client;
})(Upnp || (Upnp = {}));
module.exports = Upnp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiRDovZGV2L3VwbnAvbGliLyIsInNvdXJjZXMiOlsiaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHlCQUE0QjtBQUM1QiwrQkFBa0M7QUFDbEMsbUNBQXNDO0FBQ3RDLGlDQUFvQztBQUNwQyxpQ0FBb0M7QUFDcEMsNkJBQWdDO0FBQ2hDLDJCQUE4QjtBQUU5QixzQkFBc0I7QUFDdEIsa0NBQXFDO0FBRXJDLElBQU8sSUFBSSxDQWlWVjtBQWpWRCxXQUFPLElBQUk7SUFFUCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDdkIsTUFBTSxjQUFjLEdBQUcsaUJBQWlCLENBQUM7SUFFekM7UUFDSSxTQUFTO1lBQ0wsSUFBSSxTQUFTLEdBQWtCLEVBQUUsQ0FBQztZQUNsQyxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUN4QyxHQUFHLENBQUMsQ0FBRSxJQUFJLEdBQUcsSUFBSSxVQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixHQUFHLENBQUMsQ0FBRSxJQUFJLElBQUksSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNqQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzlCLEVBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxNQUFNLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQU0sQ0FBQyxDQUFDLENBQUM7d0JBQ3BELFNBQVMsQ0FBQyxJQUFJLENBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBRSxDQUFDO29CQUNoQyxDQUFDO2dCQUNMLENBQUM7WUFFTCxDQUFDO1lBQ0QsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUNyQixDQUFDO0tBQ0o7SUFmWSxPQUFFLEtBZWQsQ0FBQTtJQUVEO1FBRUksWUFBcUIsU0FBaUIsRUFBVSxHQUFXO1lBQXRDLGNB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