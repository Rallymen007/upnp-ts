import { Socket, createSocket } from 'dgram';
import { EventEmitter } from 'events';
import { Buffer } from 'buffer';
import { Device } from './device'

const SSDP_PORT = 1900;
const BROADCAST_ADDR = "239.255.255.250";

export class SSDP extends EventEmitter {
    private _skt: Socket;
    constructor(private _debug: { (d:any): void }, private _ip: string) {
        super();
        this._skt = createSocket({ type: 'udp4', reuseAddr: true },  (msg: Buffer, rinfo: any) => {
           this.processMessage(msg.toString(), rinfo);
        });
        this._skt.on('listening', () => {
            super.emit('ready');
        });
        this._skt.on('error', (err:any) => {
            console.warn('socket error', err);
        });

        this._skt.bind(SSDP_PORT, this._ip, () =>{
            //                __this._skt.setBroadcast( true );
            //                __this._skt.setMulticastLoopback( true );
           this._skt.addMembership(BROADCAST_ADDR, this._ip);
        });
    }
    
    shutdown(){
        this._skt.close();
    }

    headersToObj(headers: string): Object {
        let ret: any = [];
        let lines = headers.split("\r\n");
        for (let line of lines) {
            if (line != "" && line.indexOf(":") > 0) {
                ret[line.substr(0, line.indexOf(":")).toUpperCase().trim()] = line.substr(line.indexOf(':') + 1).trim()
            } else if (line != '') {
                ret['RESPONSE-TYPE'] = line.substr(0, line.indexOf(" ")).trim().toUpperCase();
            }
        }
        return ret;
    }

    processMessage(msg: string, info: Object) {
        let res: any = this.headersToObj(msg);
        if (res['LOCATION']) {
            let d = new Device((d) => { this._debug(d); }, this._ip, res, info);
            d.discover(()=>{
                super.emit('device', d);
            });
            
        }

    }

    search(st: string) {
        try {
            let buf: Buffer = new Buffer(
                "M-SEARCH * HTTP/1.1\r\n" +
                "HOST: " + BROADCAST_ADDR + ":" + SSDP_PORT + "\r\n" +
                "MAN: \"ssdp:discover\"\r\n" +
                "MX: 1\r\n" +
                "ST: " + st + "\r\n" +
                "USER-AGENT: nodejs/" + process.version + " UPnP/2.0 draketv/2.0\r\n\r\n", 'utf8');

            let skt2: Socket = createSocket({ type: 'udp4', reuseAddr: true }, (msg: Buffer, rinfo: any) => {
                this.processMessage(msg.toString(), rinfo);
            });
            skt2.on('error', (err) => {
                console.warn('skt2 error', err);
            });
            skt2.on('listening', () => {
                this._debug(["SSDP", "SSDP2 listening on ", skt2.address().address, skt2.address().port]);
                skt2.send(buf, 0, buf.length, SSDP_PORT, BROADCAST_ADDR, (err) => {

                    setTimeout(() => {
                        skt2.close();
                        this._debug(["SSDP", 'closing down requesting socket']);
                    }, 3000);
                });
            });
            skt2.bind(undefined, this._ip, () => {
                //                skt2.setBroadcast( true );
                //                skt2.setMulticastLoopback( true );
                skt2.addMembership(BROADCAST_ADDR, this._ip);
            });
        } catch (e) {
            console.warn("Unhandled socket exception", e);
        }

    }

}