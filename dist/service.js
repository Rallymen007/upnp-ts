"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJEOi9kZXYvbm9kZV9wcm9qZWN0cy91cG5wL3NyYy8iLCJzb3VyY2VzIjpbInNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpQ0FBK0I7QUFFL0I7SUF5QkksWUFBb0IsTUFBc0IsRUFBRSxPQUFlLEVBQUUsSUFBUztRQUFsRCxXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQUN0QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDYixLQUFLLGFBQWE7b0JBQ2QsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO29CQUNwQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3BELEtBQUssQ0FBQztnQkFDVixLQUFLLFlBQVk7b0JBQ2IsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDO29CQUM1QixLQUFLLENBQUM7Z0JBQ1YsS0FBSyxhQUFhO29CQUNkLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztvQkFDN0IsS0FBSyxDQUFDO2dCQUNWLEtBQUssU0FBUztvQkFDVixJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7b0JBQ3pCLEtBQUssQ0FBQztZQUNkLENBQUM7UUFDTCxDQUFDO1FBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLFlBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDakYsQ0FBQztJQXJDRCxnQkFBZ0IsQ0FBQyxDQUFTO1FBQ3RCLElBQUksRUFBRSxHQUFHLGdEQUFnRCxDQUFDO1FBQzFELElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNiLENBQUM7SUFDTCxDQUFDO0lBRUQsSUFBSSxDQUFDLE1BQWMsRUFBRSxJQUFTO1FBQzFCLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBTSxDQUFDLE9BQU8sRUFBRSxNQUFNO1lBQ3BDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFXLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBUSxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RHLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQXdCSjtBQTlDRCwwQkE4Q0MifQ==