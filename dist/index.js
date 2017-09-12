"use strict";
const events_1 = require("events");
const util_1 = require("./util");
const ssdp_1 = require("./ssdp");
var Upnp;
(function (Upnp) {
    class Client extends events_1.EventEmitter {
        constructor(opts) {
            super();
            this._ssdps = [];
            this._devices = [];
        }
        _debug(msg) {
            super.emit('debug', msg);
        }
        onOneOf(events, fn) {
            for (let e of events) {
                super.on(e, fn);
            }
        }
        getDevices() {
            return this._devices;
        }
        registerDevice(d) {
            let found = false;
            for (let device of this._devices) {
                if (device.location == d.location) {
                    device.update(d);
                    found = true;
                }
            }
            if (!found) {
                this._devices.push(d);
                super.emit('newdevice', d);
                super.emit(d.devicetype, d);
            }
        }
        search(searchtype) {
            this._debug(["Beginning search", searchtype]);
            if (!searchtype)
                searchtype = 'ssdp:all';
            let ipc = new util_1.IP();
            let ips = ipc.addresses();
            for (let ip of ips) {
                this._ssdps.push(new ssdp_1.SSDP((d) => { this._debug(d); }, ip));
            }
            for (let s of this._ssdps) {
                s.on('device', (device) => {
                    this._debug(['got device', device.devicetype]);
                    this.registerDevice(device);
                });
                s.on('ready', () => {
                    s.search(searchtype);
                });
            }
        }
        stopSearch() {
            for (let s of this._ssdps) {
                s.shutdown();
            }
        }
    }
    Upnp.Client = Client;
})(Upnp || (Upnp = {}));
module.exports = Upnp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiRDovZGV2L25vZGVfcHJvamVjdHMvdXBucC9zcmMvIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsbUNBQXNDO0FBQ3RDLGlDQUE0QjtBQUM1QixpQ0FBOEI7QUFHOUIsSUFBTyxJQUFJLENBa0VWO0FBbEVELFdBQU8sSUFBSTtJQUVQLFlBQW9CLFNBQVEscUJBQVk7UUFJcEMsWUFBWSxJQUFVO1lBQ2xCLEtBQUssRUFBRSxDQUFDO1lBSlosV0FBTSxHQUFnQixFQUFFLENBQUM7WUFDekIsYUFBUSxHQUFrQixFQUFFLENBQUM7UUFJN0IsQ0FBQztRQUVELE1BQU0sQ0FBQyxHQUFRO1lBQ1gsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUVELE9BQU8sQ0FBQyxNQUFxQixFQUFFLEVBQU07WUFDakMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDbkIsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDcEIsQ0FBQztRQUNMLENBQUM7UUFFRCxVQUFVO1lBQ04sTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDekIsQ0FBQztRQUVELGNBQWMsQ0FBQyxDQUFTO1lBQ3BCLElBQUksS0FBSyxHQUFZLEtBQUssQ0FBQztZQUMzQixHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDL0IsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDaEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakIsS0FBSyxHQUFHLElBQUksQ0FBQztnQkFDakIsQ0FBQztZQUNMLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDcEMsQ0FBQztRQUNMLENBQUM7UUFFRCxNQUFNLENBQUMsVUFBbUI7WUFFdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGtCQUFrQixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDOUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7Z0JBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztZQUN6QyxJQUFJLEdBQUcsR0FBTyxJQUFJLFNBQUUsRUFBRSxDQUFDO1lBQ3ZCLElBQUksR0FBRyxHQUFRLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUMvQixHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLFdBQUksQ0FBQyxDQUFDLENBQUMsT0FBTSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBLENBQUEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUQsQ0FBQztZQUVELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQWM7b0JBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBQy9DLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQy9CLENBQUMsQ0FBQyxDQUFDO2dCQUNILENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFHO29CQUNYLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3pCLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztRQUNMLENBQUM7UUFFRCxVQUFVO1lBQ04sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNqQixDQUFDO1FBQ0wsQ0FBQztLQUNKO0lBL0RZLFdBQU0sU0ErRGxCLENBQUE7QUFDTCxDQUFDLEVBbEVNLElBQUksS0FBSixJQUFJLFFBa0VWO0FBRUQsaUJBQVMsSUFBSSxDQUFDIn0=