dbus = require('dbus-native');

module.exports = class SignalkTankService {

    constructor(fluidtype, tankinstance) {
        this.fluidtype = fluidtype;
        this.tankinstance = tankinstance;
        this.tankcapacity = 0.0;
        this.servicename = "com.victronenergy.tank.signalk_tank_" + this.fluidtype + "_" + this.tankinstance;
        this.interfacename = this.servicename;
        this.objectpath = this.servicename.replace(/\./g, '/');
        this.bus = dbus.systemBus();
        this.ifacedesc = null;
        this.iface = null;
        if (!this.bus) throw "error connecting to system bus";
    }

    createService() {
        if (this.bus) {
            this.bus.requestName(this.servicename, 0x4, function (err, retcode) {
                if ((err) || (retcode !== 1)) {
                    throw "service creation failed (" + (err)?err:retcode + ")";
                } else {
                    this.ifacedesc = {
                        name: this.interfacename,
                        properties: {
                            '/Mgmt/ProcessName': 's',
                            '/Mgmt/ProcessVersion': 's',
                            '/Mgmt/Connection': 's',
                            '/DeviceInstance': 'i',
                            '/ProductId': 's',
                            '/ProductName': 's',
                            '/FirmwareVersion': 's',
                            '/HardwareVersion': 's',
                            '/Connected': 'i',
                            '/Level': 'i',
                            '/FluidType': 'i',
                            '/Capacity': 'f',
                            '/Remaining': 'f'
                        }
                    };
                    this.iface = {
                        '/Mgmt/ProcessName': 'Signal K',
                        '/Mgmt/ProcessVersion': 'Not defined',
                        '/Mgmt/Connection': 'Signal K plugin',
                        '/DeviceInstance': this.tankinstance,
                        '/ProductId': 'venus-tanks',
                        '/ProductName': 'pdjr-skplugin-venus-tanks',
                        '/FirmwareVersion': 'n/a',
                        '/HardwareVersion': 'n/a',
                        '/Connected': 1,
                        '/Level': 0,
                        '/FluidType': this.fluidtype,
                        '/Capacity': this.tankcapacity,
                        '/Remaining': 0
                    };
                    this.bus.exposeInterface(this.iface, this.objectpath, this.ifacedesc); 
                }
            }.bind(this));
        } else {
            throw "not connected to system bus";
        }
    }
            
    update(currentlevel, capacity=null) {
        if ((this.bus) && (this.iface)) {
            if (capacity) {
                this.tankcapacity = capacity;
                this.iface['/Capacity'] = capacity;
            }
            if (this.tankcapacity) {
                this.iface['/Remaining'] = (this.tankcapacity * currentlevel);
            }
            this.iface['/Level'] = Math.round(currentlevel * 100);
        }
    }

}
