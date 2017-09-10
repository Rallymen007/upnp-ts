import URL = require('url');
import os = require('os');
import { Buffer } from 'buffer';
import xml = require('xml-parser/index.js');
import http = require('http');

export class IP {
    addresses(): Array<string> {
        let addresses: Array<string> = [];
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

export class USoap {
    private _url: URL.Url;
    constructor(private _debug: { (d:any): void }, private _endpoint: string, private _ns: string) {
        this._url = URL.parse(this._endpoint);
    }

    private _createBody(action: string, arg: any): Buffer {
        let b = '<?xml version="1.0"?>\n';
        b += '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
        b += '<s:Body>';
        b += '<u:' + action + ' xmlns:u="' + this._ns + '">';
        for (let i in arg) {
            b += '<' + i + '>' + arg[i] + '</' + i + '>';
        }
        b += '</u:' + action + '>';
        b += '</s:Body>'
        b += '</s:Envelope>';
        return new Buffer(b, 'utf8');
    }

    post(action: string, data: any, cb: Function, err: Function) {
        try {
            let body: Buffer = this._createBody(action, data);
            let opts: any = {
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
            let resdata: string = "";
            let req = http.request(opts, (res: any) => {
                res.setEncoding('utf8');
                res.on('error', (e: any) => {
                    console.warn('error posting to device');
                });
                res.on('data', (chunk: string) => {
                    resdata += chunk;
                });

                res.on('end', () => {

                    let d: any = xml(resdata);
                    //this._debug(['usoap response', d.root.children[0].children[0]]);
                    if (d.root.children[0].children[0].name == 'SOAP:Fault') {
                        err(d.root.children[0].children[0]);
                    } else {
                        let r: any = [];
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
        } catch (e) {
            console.warn('unknown error posting', e);
        }
    }
}
