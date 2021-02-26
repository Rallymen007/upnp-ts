import { USoap } from "./util";
import * as http from "http";

export class Service {
    baseurl: string;
    serviceType: string;
    controlURL: string;
    eventSubURL: string;
    SCPDURL: string
    ns: string;
    _soap: USoap;
    parseServiceType(s: string): string {
        let rx = /urn:schemas-upnp-org:service:([a-zA-Z0-9]+):1/g;
        let arr = rx.exec(s);
        if (arr) {
            return arr[1];
        } else {
            return s;
        }
    }

    post(action: string, args: any) {
        return new Promise<any>((resolve, reject) => {
            this._soap.post(action, args, (res: string) => { resolve(res); }, (err: any) => { reject(err); });
        });
    }


    constructor(private _debug: {(d:any):void}, baseurl: string, data: any) {
        this.baseurl = baseurl;
        for (let i of data.children) {
            switch (i.name) {
                case "serviceType":
                    this.ns = i.content;
                    this.serviceType = this.parseServiceType(i.content);
                    break;
                case "controlURL":
                    this.controlURL = i.content.startsWith("/")?i.content:("/" + i.content);
                    break;
                case "eventSubURL":
                    this.eventSubURL = i.content.startsWith("/")?i.content:("/" + i.content);
                    break;
                case "SCPDURL":
                    this.SCPDURL = i.content.startsWith("/")?i.content:("/" + i.content);
                    break;
            }
        }
        this._soap = new USoap(this._debug, this.baseurl + this.controlURL, this.ns);
    }

	sid: string;
	timeoutHandle : ReturnType<typeof setTimeout>;
	subscribe(callback: string){
		let service = this;
		let url = new URL(this.baseurl + this.eventSubURL);
		let req = http.request({
			host: url.hostname,
			port: url.port,
			path: url.pathname + url.search,
			method: 'SUBSCRIBE',
			headers: {
				HOST: url.host,
				CALLBACK: "<"+callback+">", 
				NT: "upnp:event"
			}
		},function(rsp:http.IncomingMessage){
			let sid = rsp.headers['sid'] as string;
			let timeout0 = rsp.headers['timeout'] as string;
			let timeout = timeout0 && parseInt(timeout0.replace("Second-","")) || 1800;
			service.sid = sid;
			clearTimeout(service.timeoutHandle);
			service.timeoutHandle = setTimeout(function(){
				service.renew();
			},(timeout-1)*1000);
		});
		req.end();
	}
	
	renew(){
		if (this.sid) {
			let service =  this;
		let url = new URL(this.baseurl + this.eventSubURL);
			var req = http.request({
				host: url.hostname,
				port: url.port,
				path: url.pathname + url.search,
				method: 'SUBSCRIBE',
				headers: {
					HOST: url.host,
					SID: service.sid
				}
			},function(rsp){
				let timeout0 = rsp.headers['timeout'] as string;
				let timeout = timeout0 && parseInt(timeout0.replace("Second-","")) || 1800;
				clearTimeout(service.timeoutHandle);
				service.timeoutHandle = setTimeout(function(){
					service.renew();
				},(timeout-1)*1000);
			});
			req.end();
		}
	}
	
	unsubscribe(){
		clearTimeout(this.timeoutHandle);
		this.timeoutHandle = null;
		if (this.sid) {
		let url = new URL(this.baseurl + this.eventSubURL);
			let req = http.request({
				host: url.hostname,
				port: url.port,
				path: url.pathname +  url.search,
				method: 'UNSUBSCRIBE',
				headers: {
					HOST: url.host,
					SID: this.sid
				}
			},function(rsp){
				
			});
			req.end();
			this.sid = null;
		}
	}
}
