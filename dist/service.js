"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const util_1 = require("./util");
const http = require("http");
class Service {
    constructor(_debug, baseurl, data) {
        this._debug = _debug;
        this.baseurl = baseurl;
        for (let i of data.children) {
            switch (i.name) {
                case "serviceType":
                    this.ns = i.content;
                    this.serviceType = this.parseServiceType(i.content);
                    break;
                case "controlURL":
                    this.controlURL = i.content.startsWith("/") ? i.content : ("/" + i.content);
                    break;
                case "eventSubURL":
                    this.eventSubURL = i.content.startsWith("/") ? i.content : ("/" + i.content);
                    break;
                case "SCPDURL":
                    this.SCPDURL = i.content.startsWith("/") ? i.content : ("/" + i.content);
                    break;
            }
        }
        this._soap = new util_1.USoap(this._debug, this.baseurl + this.controlURL, this.ns);
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
            this._soap.post(action, args, (res) => { resolve(res); }, (err) => { reject(err); });
        });
    }
    subscribe(callback) {
        let service = this;
        let url = new URL(this.baseurl + this.eventSubURL);
        let req = http.request({
            host: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: 'SUBSCRIBE',
            headers: {
                HOST: url.host,
                CALLBACK: "<" + callback + ">",
                NT: "upnp:event"
            }
        }, function (rsp) {
            let sid = rsp.headers['sid'];
            let timeout0 = rsp.headers['timeout'];
            let timeout = timeout0 && parseInt(timeout0.replace("Second-", "")) || 1800;
            service.sid = sid;
            clearTimeout(service.timeoutHandle);
            service.timeoutHandle = setTimeout(function () {
                service.renew();
            }, (timeout - 1) * 1000);
        });
        req.end();
    }
    renew() {
        if (this.sid) {
            let service = this;
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
            }, function (rsp) {
                let timeout0 = rsp.headers['timeout'];
                let timeout = timeout0 && parseInt(timeout0.replace("Second-", "")) || 1800;
                clearTimeout(service.timeoutHandle);
                service.timeoutHandle = setTimeout(function () {
                    service.renew();
                }, (timeout - 1) * 1000);
            });
            req.end();
        }
    }
    unsubscribe() {
        clearTimeout(this.timeoutHandle);
        this.timeoutHandle = null;
        if (this.sid) {
            let url = new URL(this.baseurl + this.eventSubURL);
            let req = http.request({
                host: url.hostname,
                port: url.port,
                path: url.pathname + url.search,
                method: 'UNSUBSCRIBE',
                headers: {
                    HOST: url.host,
                    SID: this.sid
                }
            }, function (rsp) {
            });
            req.end();
            this.sid = null;
        }
    }
}
exports.Service = Service;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJzcmMvIiwic291cmNlcyI6WyJzZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUErQjtBQUMvQiw2QkFBNkI7QUFFN0IsTUFBYSxPQUFPO0lBeUJoQixZQUFvQixNQUFzQixFQUFFLE9BQWUsRUFBRSxJQUFTO1FBQWxELFdBQU0sR0FBTixNQUFNLENBQWdCO1FBQ3RDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUN6QixRQUFRLENBQUMsQ0FBQyxJQUFJLEVBQUU7Z0JBQ1osS0FBSyxhQUFhO29CQUNkLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztvQkFDcEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNwRCxNQUFNO2dCQUNWLEtBQUssWUFBWTtvQkFDYixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUMsQ0FBQSxDQUFDLENBQUMsT0FBTyxDQUFBLENBQUMsQ0FBQSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3hFLE1BQU07Z0JBQ1YsS0FBSyxhQUFhO29CQUNkLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQyxDQUFBLENBQUMsQ0FBQyxPQUFPLENBQUEsQ0FBQyxDQUFBLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDekUsTUFBTTtnQkFDVixLQUFLLFNBQVM7b0JBQ1YsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FB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