"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USoap = exports.IP = void 0;
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
                    this._debug(['error posting to device']);
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
                this._debug(['http error ', e]);
            });
            req.write(body);
            req.end();
        }
        catch (e) {
            this._debug(['unknown error posting', e]);
        }
    }
}
exports.USoap = USoap;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiJzcmMvIiwic291cmNlcyI6WyJ1dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJCQUE0QjtBQUM1Qix5QkFBMEI7QUFDMUIsbUNBQWdDO0FBQ2hDLDJDQUE0QztBQUM1Qyw2QkFBOEI7QUFFOUIsTUFBYSxFQUFFO0lBQ1gsU0FBUztRQUNMLElBQUksU0FBUyxHQUFrQixFQUFFLENBQUM7UUFDbEMsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDeEMsS0FBSyxJQUFJLEdBQUcsSUFBSSxVQUFVLEVBQUU7WUFDeEIsS0FBSyxJQUFJLElBQUksSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksTUFBTSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxLQUFLLEVBQUU7b0JBQ2pELFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUM3QjthQUNKO1NBRUo7UUFDRCxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0NBQ0o7QUFmRCxnQkFlQztBQUVELE1BQWEsS0FBSztJQUVkLFlBQW9CLE1BQXlCLEVBQVUsU0FBaUIsRUFBVSxHQUFXO1FBQXpFLFdBQU0sR0FBTixNQUFNLENBQW1CO1FBQVUsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUFVLFFBQUcsR0FBSCxHQUFHLENBQVE7UUFDekYsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRU8sV0FBVyxDQUFDLE1BQWMsRUFBRSxHQUFRO1FBQ3hDLElBQUksQ0FBQyxHQUFHLHlCQUF5QixDQUFDO1FBQ2xDLENBQUMs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