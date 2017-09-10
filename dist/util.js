"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const URL = require("url");
const os = require("os");
const buffer_1 = require("buffer");
const xml = require("xml-parser/index.js");
const http = require("http");
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
exports.IP = IP;
class USoap {
    constructor(_debug, _endpoint, _ns) {
        this._debug = _debug;
        this._endpoint = _endpoint;
        this._ns = _ns;
        this._url = URL.parse(this._endpoint);
    }
    _createBody(action, arg) {
        let b = '<?xml version="1.0"?>\n';
        b += '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
        b += '<s:Body>';
        b += '<u:' + action + ' xmlns:u="' + this._ns + '">';
        for (let i in arg) {
            b += '<' + i + '>' + arg[i] + '</' + i + '>';
        }
        b += '</u:' + action + '>';
        b += '</s:Body>';
        b += '</s:Envelope>';
        return new buffer_1.Buffer(b, 'utf8');
    }
    post(action, data, cb, err) {
        try {
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
                res.on('error', (e) => {
                    console.warn('error posting to device');
                });
                res.on('data', (chunk) => {
                    resdata += chunk;
                });
                res.on('end', () => {
                    let d = xml(resdata);
                    if (d.root.children[0].children[0].name == 'SOAP:Fault') {
                        err(d.root.children[0].children[0]);
                    }
                    else {
                        let r = [];
                        for (let val of d.root.children[0].children[0].children) {
                            r[val.name] = val.content;
                        }
                        cb(r);
                    }
                });
            });
            req.on('error', (e) => {
                console.warn('http error ', e);
            });
            this._debug(['usoap request', body.toString()]);
            req.write(body);
            req.end();
        }
        catch (e) {
            console.warn('unknown error posting', e);
        }
    }
}
exports.USoap = USoap;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiJEOi9kZXYvbm9kZV9wcm9qZWN0cy91cG5wL3NyYy8iLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQkFBNEI7QUFDNUIseUJBQTBCO0FBQzFCLG1DQUFnQztBQUNoQywyQ0FBNEM7QUFDNUMsNkJBQThCO0FBRTlCO0lBQ0ksU0FBUztRQUNMLElBQUksU0FBUyxHQUFrQixFQUFFLENBQUM7UUFDbEMsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDeEMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQztZQUN6QixHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzlCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxNQUFNLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ2xELFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM5QixDQUFDO1lBQ0wsQ0FBQztRQUVMLENBQUM7UUFDRCxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ3JCLENBQUM7Q0FDSjtBQWZELGdCQWVDO0FBRUQ7SUFFSSxZQUFvQixNQUF5QixFQUFVLFNBQWlCLEVBQVUsR0FBVztRQUF6RSxXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUFVLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFBVSxRQUFHLEdBQUgsR0FBRyxDQUFRO1FBQ3pGLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7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