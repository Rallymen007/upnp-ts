import { USoap } from "./util";

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
        let __this = this;
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
        this._soap = new USoap(this._debug, this.baseurl + this.controlURL, this.ns);
    }
}