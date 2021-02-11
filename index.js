/**********************************************************************
 * Copyright 2021 Paul Reeve <paul@pdjr.eu>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

const Log = require('./lib/signalk-liblog/Log.js');
const SignalkTankService = require('./SignalkTankService');

const PLUGIN_ID = "pdjr-skplugin-venus-tanks";
const N2K_FLUID_TYPES = {
    fuel: 0,
    freshWater: 1,
    greyWater: 2,
    liveWell: 3,
    lubrication: 4,
    wasteWater: 5,
    gasoline: 6,
    error: 14,
    unavailable: 15
};

module.exports = function(app) {
    var plugin = {};
    var unsubscribes = [];

    plugin.id = PLUGIN_ID;
    plugin.name = "Venus tank ";
    plugin.description = "Inject Signal K tank data onto host dbus";

    const log = new Log(plugin.id, { ncallback: app.setPluginStatus, ecallback: app.setPluginError });

    plugin.schema = {
        "type": "object",
        "properties": {
            "tanks": {
                "type": "array",
                "title": "Export these tank paths to host dbus",
                "items": {
                    "type": "string"
                },
                "default": [ ]
            }
        }
    }

    plugin.uiSchema = { }

    plugin.start = function(options) {
        // If no tank paths are specified, then recover all available paths
        // from the server.
        if ((!options.tanks) || (options.tanks.length == 0)) {
            var tanks = app.streambundle.getAvailablePaths().filter(p => p.startsWith('tanks.')).reduce((a,v) => {
                var matches;
                if (matches = v.match(/^(tanks\..*\..*)\..*/)) a.add(matches[1]);
                return(a);
            }, new Set());
            options.tanks = Array.from(tanks);
        }

        console.log(JSON.stringify(options.tanks));

        options.tanks.forEach(tank => {
            var parts = tank.split(/\./);
            if (parts.length == 3) {
                let fluidType = (N2K_FLUID_TYPES[parts[1]])?N2K_FLUID_TYPES[parts[1]]:N2K_FLUID_TYPES['unavailable'];
                let instance = parts[2];
                let capacity = null;
                let tankService = null;
                try {
                    tankService = new SignalkTankService(fluidType, instance);
                    createService(tankService);
                    var stream = app.streambundle.getSelfStream(tank + ".currentLevel");
                    if (stream) {
                        unsubscribes.push(stream.onValue(currentLevel => {
                            if (!capacity) capacity = app.getSelfPath(tank + ".capacity.value");
                            tankService.update(currentLevel, capacity)
                        }));
                    }
                } catch(e)  {
                    log.E("unable to create service for %s (%s)", tank, e);
                }
            } else {
                log.E("invalid tank path (%s)", tank);
            }
        });
    }

    plugin.stop = function() {
        unsubscribes.forEach(f => f())
        unsubscribes = []
    }

    async function createService(tankService) {
        await tankService.createService();
    }

    return(plugin);

}
