module exports = class SignalkTank {

    constructor(fluidtype, tankinstance) {
        this.fluidtype = fluidtype;
        this.tankinstance = tankinstance;
        this.tankcapacity = 0.0;
        this.servicename = "com.victronenergy.tank.signalk_tank_" + this.fluidtype + "_" + this.instance;
        this.interfacename = this.servicename;
        this.objectpath = this.servicename.replaceAll('.', '/');
        this.bus = dbus.systemBus();
        this.ifacedesc = null;
        this.iface = null;
        if (!this.bus) throw "error connecting to system bus";
    }

    async createService() {
        if (this.bus) {
            const requestNamePromise = util.promisify(this.bus.requestName);
            requestNamePromise(this.servicename, 0x4)
            .then(retcode => {
                if (retcode === 1) {
                    this.ifacedesc = {
                        name: this.interfacename,
                        properties: {
                            '/Mgmt/ProcessName': 's',
                            '/Mgmt/ProcessVersion': 's',
                            '/Mgmt/Connection': 's'
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
                    }
                    this.bus.exposeInterface(this.iface, this.objectpath, this.ifacedesc); 
                } else {
                    throw "service creation failed with code = " + retcode;
                }
            })
            .catch(err => {
                throw "service creation failed (" + err + ")";
            });
        }
    }
            
    update(currentlevel, capacity=null) {
        if (capacity) {
            this.tankcapacity = capacity;
            this.iface['/Capacity'] = capacity;
        }
        if (this.tankcapacity) {
            this.iface['/Ramaining'] = (this.tankcapacity * currentlevel);
        }
        this.iface['/Level'] = Math.round(currentlevel * 100);
    }

}
