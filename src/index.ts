import xml = require( 'xml-parser' );

import os = require( 'os' );
import dgram = require( 'dgram' );
import process = require( 'process' );
import Buffer = require( 'buffer' );
import events = require( 'events' );
import http = require( 'http' );
import URL = require( 'url' );

module Upnp {

    const SSDP_PORT = 1900;
    const BROADCAST_ADDR = "239.255.255.250";

    export class IP {
        addresses(): Array<string> {
            let addresses: Array<string> = [];
            let interfaces = os.networkInterfaces();
            for ( var int in interfaces ) {
                for ( var virt in interfaces[int] ) {
                    let i = interfaces[int][virt];
                    if ( i['family'] == "IPv4" && i['internal'] == false ) {
                        addresses.push( i.address );
                    }
                }

            }
            return addresses;
        }
    }

    export class USoap {
        private _url: URL.Url;
        constructor( private _endpoint: string, private _ns: string ) {
            this._url = URL.parse( this._endpoint );
        }

        private _createBody( action: string, arg: any ): Buffer {
            let b = '<?xml version="1.0"?>\n';
            b += '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">\n';
            b += '\t<s:Body>\n';
            b += '\t\t<u:' + action + ' xmlns:u="' + this._ns + '">\n';
            for ( let i in arg ) {
                b += '\t\t\t<' + i + '>' + arg[i] + '</' + i + '>\n';
            }
            b += '\t\t</u:' + action + '>\n';
            b += '\t</s:Body>\n'
            b += '</s:Envelope>';
            return new Buffer.Buffer( b, 'utf8' );
        }

        post( action: string, data: any, cb: Function ) {
            let body: Buffer = this._createBody( action, data );
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
                    'SOAPAction': JSON.stringify( this._ns + '#' + action )
                }
            };
            let resdata: string = "";
            let req = http.request( opts, ( res: any ) => {
                res.setEncoding( 'utf8' );
                res.on( 'data', ( chunk: string ) => {
                    resdata += chunk;
                });

                res.on( 'end', () => {
                    //console.warn( 'received', resdata );
                    let d: any = xml( resdata );
                    let r: any = [];
                    for ( let val of d.root.children[0].children[0].children ) {
                        r[val.name] = val.content;
                    }
                    cb( r );
                });
                res.on( 'error', ( e: any ) => {
                    console.warn( 'error posting to device' );
                });
            });
            req.write( body );
            req.end();
        }
    }

    export class Service {
        baseurl: string;
        serviceType: string;
        controlURL: string;
        eventSubURL: string;
        SCPDURL: string
        ns: string;
        _soap: USoap;
        parseServiceType( s: string ): string {
            let rx = /urn:schemas-upnp-org:service:([a-zA-Z0-9]+):1/g;
            let arr = rx.exec( s );
            if ( arr ) {
                return arr[1];
            } else {
                return s;
            }
        }

        post( action: string, args: any ) {
            return new Promise<any>(( resolve, reject ) => {
                this._soap.post( action, args, function( res: string ) { resolve( res ) });
            });
        }


        constructor( baseurl: string, data: any ) {
            this.baseurl = baseurl;
            for ( let i of data.children ) {
                switch ( i.name ) {
                    case "serviceType":
                        this.ns = i.content;
                        this.serviceType = this.parseServiceType( i.content );
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
            this._soap = new USoap( this.baseurl + this.controlURL, this.ns );
        }
    }

    export class Device {
        location: string;
        network: string;
        ip: string;
        server: string;
        devicetype: string;
        baseurl: string = "";
        _services: Array<Service> = [];

        constructor( network: string, msg: any, info: any ) {
            this.network = network;
            this.ip = info.address;
            this.location = msg['LOCATION'];
            this.server = msg['SERVER'];

            //find base url
            this.baseurl = this.location.substr( 0, this.location.lastIndexOf( "/" ) );
        }

        update( d: Device ): void {
            this.network = d.network;
            this.ip = d.ip;
            this.server = d.server;
        }

        toString() {
            let arrServices: Array<string> = [];
            for ( let s of this._services ) {
                arrServices.push( s.serviceType );
            }
            return this.devicetype + "\t" + this.ip + "\t" + this.location + "\t" + this.server + "\n" + JSON.stringify( arrServices );
        }
        parseDeviceType( s: string ) {
            let rx = /urn:schemas-upnp-org:device:([a-zA-Z0-9]+):1/g;
            let arr = rx.exec( s );
            if ( arr ) {
                this.devicetype = arr[1];
            } else {
                this.devicetype = s;
            }
        }

        getService( serviceType: string, cb: Function ): void {
            for ( let s of this._services ) {
                if ( serviceType == s.serviceType ) {
                    cb( s );
                }
            }
        }

        parseServices( items: any ) {
            for ( let item in items ) {
                this._services.push( new Service( this.baseurl, items[item] ) );
            }
        }

        parseDevices( devices: any ) {
            for ( let device of devices ) {
                for ( let attribs of device.children ) {
                    switch ( attribs.name ) {
                        case 'deviceType':
                            this.parseDeviceType( attribs.content );
                            break;
                        case 'serviceList':
                            this.parseServices( attribs.children );
                            break;
                        case 'deviceList':
                            this.parseDevices( attribs.children );
                            break;
                        default:
                        //console.warn( 'unknown attrib', attribs.name );

                    }
                }

            }
        }

        parseDiscover( data: string ) {
            let obj = xml( data );
            for ( let child of obj.root.children ) {
                if ( child.name == "device" ) {
                    for ( let attribs of child.children ) {
                        switch ( attribs.name ) {
                            case 'deviceType':
                                this.parseDeviceType( attribs.content );
                                break;
                            case 'serviceList':
                                this.parseServices( attribs.children );
                                break;
                            case 'deviceList':
                                this.parseDevices( attribs.children );
                                break;
                            default:
                            //console.warn( 'unknown attrib', attribs.name );

                        }
                    }
                }
            }
        }

        discover( cb: Function ) {
            let _this = this;
            http.get( this.location, ( res: any ) => {
                let data: string = '';
                res.on( 'data', function( chunk: string ) { data += chunk });
                res.on( 'end', () => { _this.parseDiscover( data ); cb() })
            });
        }

    }

    export class SSDP extends events.EventEmitter {
        private _skt: dgram.Socket;
        constructor( private _ip: string ) {
            super();
            let __this: SSDP = this;
            this._skt = dgram.createSocket( { type: 'udp4', reuseAddr: true }, function( msg: Buffer, rinfo: any ) {
                //console.warn("got data:", msg.toString());
                __this.processMessage( msg.toString(), rinfo );
            });
            this._skt.on( 'listening', function() {
                //console.warn( "SSDP listenin on ", __this._skt.address().address, __this._skt.address().port )
                //resolve promise here;
                __this.emit( 'ready' );
            });

            this._skt.bind( SSDP_PORT, this._ip, function() {
                //                __this._skt.setBroadcast( true );
                //                __this._skt.setMulticastLoopback( true );
                __this._skt.addMembership( BROADCAST_ADDR, __this._ip );
            });
        }
        close( cb: Function ) {
            //this._server.close( cb )
        }

        headersToObj( headers: string ): Object {
            let ret: any = [];
            let lines = headers.split( "\r\n" );
            for ( let line of lines ) {
                if ( line != "" && line.indexOf( ":" ) > 0 ) {
                    ret[line.substr( 0, line.indexOf( ":" ) ).toUpperCase().trim()] = line.substr( line.indexOf( ':' ) + 1 ).trim()
                } else if ( line != '' ) {
                    ret['RESPONSE-TYPE'] = line.substr( 0, line.indexOf( " " ) ).trim().toUpperCase();
                }
            }
            return ret;
        }

        processMessage( msg: string, info: Object ) {
            let res: any = this.headersToObj( msg );
            if ( res['LOCATION'] ) {
                this.emit( 'device', new Device( this._ip, res, info ) );
            }

        }

        search( st: string ) {
            let __this = this;
            let buf: Buffer = new Buffer.Buffer(
                "M-SEARCH * HTTP/1.1\r\n" +
                "HOST: " + BROADCAST_ADDR + ":" + SSDP_PORT + "\r\n" +
                "MAN: \"ssdp:discover\"\r\n" +
                "MX: 1\r\n" +
                "ST: " + st + "\r\n" +
                "USER-AGENT: nodejs/" + process.version + " UPnP/2.0 draketv/2.0\r\n\r\n", 'utf8' );

            let skt2 = dgram.createSocket( { type: 'udp4', reuseAddr: true }, function( msg: Buffer, rinfo: any ) {
                __this.processMessage( msg.toString(), rinfo );
            });
            skt2.on( 'listening', function() {
                //console.warn( "SSDP2 listening on ", skt2.address().address, skt2.address().port )
                skt2.send( buf, 0, buf.length, SSDP_PORT, BROADCAST_ADDR, function( err ) {
                    // skt2.close();
                })
            });
            skt2.bind( undefined, this._ip, function() {
                //                skt2.setBroadcast( true );
                //                skt2.setMulticastLoopback( true );
                skt2.addMembership( BROADCAST_ADDR, __this._ip );
            });

        }

    }

    export class Client extends events.EventEmitter {
        _ssdps: Array<SSDP> = [];
        _devices: Array<Device> = [];

        constructor( opts?: any ) {
            super();
        }

        registerDevice( d: Device ): void {
            let __this: Client = this;
            let found: boolean = false;
            for ( let device of this._devices ) {
                if ( device.location == d.location ) {
                    device.update( d );
                    found = true;
                }
            }
            if ( !found ) {
                d.discover( function() {
                    __this._devices.push( d );
                    __this.emit( 'newdevice', d );
                    __this.emit( d.devicetype, d );
                });
            }
        }
        search( searchtype?: string ) {
            //create an ssdp for each ip;
            if ( !searchtype ) searchtype = 'ssdp:all';
            let __this = this;
            let ipc: IP = new IP();
            let ips: any = ipc.addresses();
            for ( let ip of ips ) {
                this._ssdps.push( new SSDP( ip ) );
            }

            for ( let s of this._ssdps ) {
                s.on( 'device', function( device: Device ) {
                    __this.registerDevice( device );
                });
                s.on( 'ready', function() {

                    s.search( searchtype );
                });
            }
        }
    }
}

export = Upnp;