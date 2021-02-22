"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const util_1 = require("./util");
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
}
exports.Service = Service;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJzcmMvIiwic291cmNlcyI6WyJzZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUErQjtBQUUvQixNQUFhLE9BQU87SUF5QmhCLFlBQW9CLE1BQXNCLEVBQUUsT0FBZSxFQUFFLElBQVM7UUFBbEQsV0FBTSxHQUFOLE1BQU0sQ0FBZ0I7UUFDdEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3pCLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRTtnQkFDWixLQUFLLGFBQWE7b0JBQ2QsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO29CQUNwQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3BELE1BQU07Z0JBQ1YsS0FBSyxZQUFZO29CQUNiLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUEsQ0FBQyxDQUFBLENBQUMsQ0FBQyxPQUFPLENBQUEsQ0FBQyxDQUFBLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDeEUsTUFBTTtnQkFDVixLQUFLLGFBQWE7b0JBQ2QsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQSxDQUFDLENBQUEsQ0FBQyxDQUFDLE9BQU8sQ0FBQSxDQUFDLENBQUEsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUN6RSxNQUFNO2dCQUNWLEtBQUssU0FBUztvQkFDVixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFBLENBQUMsQ0FBQSxDQUFDLENBQUMsT0FBTyxDQUFBLENBQUMsQ0FBQSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3JFLE1BQU07YUFDYjtTQUNKO1FBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLFlBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDakYsQ0FBQztJQXJDRCxnQkFBZ0IsQ0FBQyxDQUFTO1FBQ3RCLElBQUksRUFBRSxHQUFHLGdEQUFnRCxDQUFDO1FBQzFELElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsSUFBSSxHQUFHLEVBQUU7WUFDTCxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjthQUFNO1lBQ0gsT0FBTyxDQUFDLENBQUM7U0FDWjtJQUNMLENBQUM7SUFFRCxJQUFJLENBQUMsTUFBYyxFQUFFLElBQVM7UUFDMUIsT0FBTyxJQUFJLE9BQU8sQ0FBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUN4QyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsR0FBVyxFQUFFLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFRLEVBQUUsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RHLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQXdCSjtBQTlDRCwwQkE4Q0MifQ==