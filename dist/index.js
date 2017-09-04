"use strict";
const xml = require("xml-parser");
const os = require("os");
const dgram = require("dgram");
const process = require("process");
const Buffer = require("buffer");
const events = require("events");
const http = require("http");
const URL = require("url");
var Upnp;
(function (Upnp) {
    const SSDP_PORT = 1900;
    const BROADCAST_ADDR = "239.255.255.250";
    class IP {
        addresses() {
            let addresses = [];
            let interfaces = os.networkInterfaces();
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
            return new Buffer.Buffer(b, 'utf8');
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
                    'Content-Length': body.length,
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
            let __this = this;
            this._skt = dgram.createSocket({ type: 'udp4', reuseAddr: true }, function (msg, rinfo) {
                __this.processMessage(msg.toString(), rinfo);
            });
            this._skt.on('listening', function () {
                __this.emit('ready');
            });
            this._skt.bind(SSDP_PORT, this._ip, function () {
                __this._skt.addMembership(BROADCAST_ADDR, __this._ip);
            });
        }
        close(cb) {
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
            let __this = this;
            let buf = new Buffer.Buffer("M-SEARCH * HTTP/1.1\r\n" +
                "HOST: " + BROADCAST_ADDR + ":" + SSDP_PORT + "\r\n" +
                "MAN: \"ssdp:discover\"\r\n" +
                "MX: 1\r\n" +
                "ST: " + st + "\r\n" +
                "USER-AGENT: nodejs/" + process.version + " UPnP/2.0 draketv/2.0\r\n\r\n", 'utf8');
            let skt2 = dgram.createSocket({ type: 'udp4', reuseAddr: true }, function (msg, rinfo) {
                __this.processMessage(msg.toString(), rinfo);
            });
            skt2.on('listening', function () {
                skt2.send(buf, 0, buf.length, SSDP_PORT, BROADCAST_ADDR, function (err) {
                });
            });
            skt2.bind(undefined, this._ip, function () {
                skt2.addMembership(BROADCAST_ADDR, __this._ip);
            });
        }
    }
    Upnp.SSDP = SSDP;
    class Client extends events.EventEmitter {
        constructor(opts) {
            super();
            this._ssdps = [];
            this._devices = [];
        }
        registerDevice(d) {
            let __this = this;
            let found = false;
            for (let device of this._devices) {
                if (device.location == d.location) {
                    device.update(d);
                    found = true;
                }
            }
            if (!found) {
                d.discover(function () {
                    __this._devices.push(d);
                    __this.emit('newdevice', d);
                    __this.emit(d.devicetype, d);
                });
            }
        }
        search(searchtype) {
            if (!searchtype)
                searchtype = 'ssdp:all';
            let __this = this;
            let ipc = new IP();
            let ips = ipc.addresses();
            for (let ip of ips) {
                this._ssdps.push(new SSDP(ip));
            }
            for (let s of this._ssdps) {
                s.on('device', function (device) {
                    __this.registerDevice(device);
                });
                s.on('ready', function () {
                    s.search(searchtype);
                });
            }
        }
    }
    Upnp.Client = Client;
})(Upnp || (Upnp = {}));
module.exports = Upnp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiRDovZGV2L25vZGVfcHJvamVjdHMvdXBucC9zcmMvIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsa0NBQXFDO0FBRXJDLHlCQUE0QjtBQUM1QiwrQkFBa0M7QUFDbEMsbUNBQXNDO0FBQ3RDLGlDQUFvQztBQUNwQyxpQ0FBb0M7QUFDcEMsNkJBQWdDO0FBQ2hDLDJCQUE4QjtBQUU5QixJQUFPLElBQUksQ0E0V1Y7QUE1V0QsV0FBTyxJQUFJO0lBRVAsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLE1BQU0sY0FBYyxHQUFHLGlCQUFpQixDQUFDO0lBRXpDO1FBQ0ksU0FBUztZQUNMLElBQUksU0FBUyxHQUFrQixFQUFFLENBQUM7WUFDbEMsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDeEMsR0FBRyxDQUFDLENBQUUsSUFBSSxHQUFHLElBQUksVUFBVyxDQUFDLENBQUMsQ0FBQztnQkFDM0IsR0FBRyxDQUFDLENBQUUsSUFBSSxJQUFJLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBRSxDQUFDLENBQUMsQ0FBQztvQkFDakMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUM5QixFQUFFLENBQUMsQ0FBRSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksTUFBTSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFNLENBQUMsQ0FBQyxDQUFDO3dCQUNwRCxTQUFTLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBQyxPQUFPLENBQUUsQ0FBQztvQkFDaEMsQ0FBQztnQkFDTCxDQUFDO1lBRUwsQ0FBQztZQUNELE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDckIsQ0FBQztLQUNKO0lBZlksT0FBRSxLQWVkLENBQUE7SUFFRDtRQUVJLFlBQXFCLFNBQWlCLEVBQVUsR0FBVztZQUF0Qyxj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