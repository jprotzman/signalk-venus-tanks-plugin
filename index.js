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
const SIGNALK_FLUID_TYPES = {
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
            "tankpaths": {
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
        // If no tank paths are specified, then recover all available
        // paths from the server.
        if ((!options.tankpaths) || (options.tankpaths.length == 0)) {
            var tankpathset = app.streambundle.getAvailablePaths().filter(path => path.startsWith('tanks.')).reduce((a,p) => {
                var matches;
                if (matches = p.match(/^(tanks\..*\..*)\..*/)) a.add(matches[1]);
                return(a);
            }, new Set());
            options.tankpaths = Array.from(tankpathset);
        }

        log.N("creating dbus services for %d tanks", options.tankpaths.length);

        // Iterate over recovered paths, asynchronously creating dbus
        // tank services (see SignalkTankService()) and registering
        // for level updates which are used to update the associated
        // service as and when they occur. 
        options.tankpaths.forEach(tankpath => {
            var parts = tankpath.split(/\./);
            if (parts.length == 3) {
                let fluidType = (SIGNALK_FLUID_TYPES[parts[1]])?SIGNALK_FLUID_TYPES[parts[1]]:SIGNALK_FLUID_TYPES['unavailable'];
                let instance = parts[2];
                let capacity = null;
                let tankService = null;
                try {
                    tankService = new SignalkTankService(fluidType, instance);
                    createService(tankService);
                    var stream = app.streambundle.getSelfStream(tankpath + ".currentLevel");
                    if (stream) {
                        unsubscribes.push(stream.onValue(currentLevel => {
                            if (!capacity) capacity = app.getSelfPath(tankpath + ".capacity.value");
                            tankService.update(currentLevel, capacity)
                        }));
                    }
                } catch(e)  {
                    log.E("unable to create service for %s (%s)", tankpath, e);
                }
            } else {
                log.W("ignoring invalid tank path (%s)", tankpath);
            }
        });
    }

    plugin.stop = function() {
        unsubscribes.forEach(f => f())
        unsubscribes = []
    }

    return(plugin);

}
