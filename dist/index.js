"use strict";
const events_1 = require("events");
const util_1 = require("./util");
const ssdp_1 = require("./ssdp");
var Upnp;
(function (Upnp) {
    const SSDP_PORT = 1900;
    const BROADCAST_ADDR = "239.255.255.250";
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
                __this._devices.push(d);
                __this.emit('newdevice', d);
                __this.emit(d.devicetype, d);
            }
        }
        search(searchtype) {
            this._debug(["Beginning search", searchtype]);
            if (!searchtype)
                searchtype = 'ssdp:all';
            let __this = this;
            let ipc = new util_1.IP();
            let ips = ipc.addresses();
            for (let ip of ips) {
                this._ssdps.push(new ssdp_1.SSDP((d) => { this._debug(d); }, ip));
            }
            for (let s of this._ssdps) {
                s.on('device', function (device) {
                    __this._debug(['got device', device.devicetype]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiRDovZGV2L25vZGVfcHJvamVjdHMvdXBucC9zcmMvIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0EsbUNBQXNDO0FBQ3RDLGlDQUE0QjtBQUM1QixpQ0FBOEI7QUFHOUIsSUFBTyxJQUFJLENBK0RWO0FBL0RELFdBQU8sSUFBSTtJQUNQLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQztJQUN2QixNQUFNLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQztJQUV6QyxZQUFvQixTQUFRLHFCQUFZO1FBSXBDLFlBQVksSUFBVTtZQUNsQixLQUFLLEVBQUUsQ0FBQztZQUpaLFdBQU0sR0FBZ0IsRUFBRSxDQUFDO1lBQ3pCLGFBQVEsR0FBa0IsRUFBRSxDQUFDO1FBSzdCLENBQUM7UUFFRCxNQUFNLENBQUMsR0FBUTtZQUNYLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFFRCxPQUFPLENBQUMsTUFBcUIsRUFBRSxFQUFNO1lBQ2pDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3BCLENBQUM7UUFDTCxDQUFDO1FBRUQsY0FBYyxDQUFDLENBQVM7WUFDcEIsSUFBSSxNQUFNLEdBQVcsSUFBSSxDQUFDO1lBQzFCLElBQUksS0FBSyxHQUFZLEtBQUssQ0FBQztZQUMzQixHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDL0IsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDaEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakIsS0FBSyxHQUFHLElBQUksQ0FBQztnQkFDakIsQ0FBQztZQUNMLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBRUwsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFckMsQ0FBQztRQUNMLENBQUM7UUFFRCxNQUFNLENBQUMsVUFBbUI7WUFFdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGtCQUFrQixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDOUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7Z0JBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztZQUN6QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxHQUFHLEdBQU8sSUFBSSxTQUFFLEVBQUUsQ0FBQztZQUN2QixJQUFJLEdBQUcsR0FBUSxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDL0IsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxXQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFBLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVELENBQUM7WUFFRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDeEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxNQUFjO29CQUNuQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUNqRCxNQUFNLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNsQyxDQUFDLENBQUMsQ0FBQztnQkFDSCxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRTtvQkFDVixDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN6QixDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7UUFDTCxDQUFDO0tBQ0o7SUExRFksV0FBTSxTQTBEbEIsQ0FBQTtBQUNMLENBQUMsRUEvRE0sSUFBSSxLQUFKLElBQUksUUErRFY7QUFFRCxpQkFBUyxJQUFJLENBQUMifQ==