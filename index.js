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

const fs = require('fs');
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

const VENUS_GUI_FOLDER = "/opt/victronenergy/gui/qml/";
const MY_GUI_FOLDER = __dirname + "/gui/";
const GUI_FILES = [ "OverviewMobile.qml", "TileTank.qml" ];

module.exports = function(app) {
    var plugin = {};
    var unsubscribes = [];

    plugin.id = PLUGIN_ID;
    plugin.name = "Venus tank interface";
    plugin.description = "Inject Signal K tank updates into Venus OS";

    const log = new Log(plugin.id, { ncallback: app.setPluginStatus, ecallback: app.setPluginError });

    plugin.schema = {
        "type": "object",
        "properties": {
            "usegui": {
                "type": "boolean",
                "title": "Use GUI enhancements?"
            },
            "tanks": {
                "type": "array",
                "title": "Tank configurations",
                "items": {
                    "type": "object",
                    "properties": {
                        "path": { "type": "string", "title": "Tank path" },
                        "factor": { "type": "number", "title": "Capacity factor", "min": 0, "default": 1.0 }
                    }
                },
            }
        },
        "default": { "usegui": true, "tanks": [] }
    }

    plugin.uiSchema = { }

    plugin.start = function(options) {
        if (!options) options = {};
        if (!options.hasOwnProperty('usegui')) { options['usegui'] = true; log.W("using default value (true) for options.usegui"); }
        if (!options.hasOwnProperty('tanks')) { options['tanks'] = []; log.W("using default value ([]) for options.tanks"); }
        
        // Begin by making sure that our GUI interface is in the state
        // requested by 'options.usegui'.
        //
        try {
            configureGUI(options.usegui);
        } catch(e) {
            log.E("error configuring GUI (%s)", e);
        }
        
        // If options.tanks is empty, then map available tank paths
        // into entries in options.tanks.
        //
        if (options.tanks.length == 0) {
            var tankpathset = app.streambundle.getAvailablePaths().filter(path => path.startsWith('tanks.')).reduce((a,p) => {
                var matches;
                if (matches = p.match(/^(tanks\..*\..*)\..*/)) a.add(matches[1]);
                return(a);
            }, new Set());
            options.tanks = Array.from(tankpathset).map(p => ({ "path": p, "factor": 1.0 }));
        }

        log.N("creating D-Bus services for %d tanks", options.tanks.length);

        // Iterate over options.tanks, creating a SignalkTankService()
        // instance for each tank entry and then register for updates
        // on the associated tank paths.
        //
        options.tanks.forEach(tank => {
            var parts = tank.path.split(/\./);
            if (parts.length == 3) {
                let fluidType = (SIGNALK_FLUID_TYPES.hasOwnProperty(parts[1]))?SIGNALK_FLUID_TYPES[parts[1]]:SIGNALK_FLUID_TYPES['unavailable'];
                let instance = parts[2];
                let capacity = null;
                let tankService = null;
                try {
                    tankService = new SignalkTankService(fluidType, instance, tank.factor);
                    tankService.createService();
                    var stream = app.streambundle.getSelfStream(tank.path + ".currentLevel");
                    if (stream) {
                        unsubscribes.push(stream.onValue(currentLevel => {
                            if (!capacity) capacity = app.getSelfPath(tank.path + ".capacity.value");
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

    /******************************************************************
     * If yesno, then backup the extant system GUI files and copy our
     * versions of GUI_FILES into VENUS_GUI_FOLDER if they aren't there
     * already. Otherwise replace them with any previously made
     * backups.
     */

    function configureGUI(yesno) {
        if (fs.existsSync(VENUS_GUI_FOLDER)) {
            if (yesno) {
                GUI_FILES.forEach(file => {
                    if (!fs.existsSync(VENUS_GUI_FOLDER + file + ".orig")) {
                        if (fs.existsSync(VENUS_GUI_FOLDER + file)) {
                            fs.renameSync(VENUS_GUI_FOLDER + file, VENUS_GUI_FOLDER + file + ".orig");
                        }
                    }
                    fs.copyFileSync(MY_GUI_FOLDER + file, VENUS_GUI_FOLDER + file);
                });
            } else {
                GUI_FILES.forEach(file => {
                    if (fs.existsSync(VENUS_GUI_FOLDER + file + ".orig")) {
                        fs.renameSync(VENUS_GUI_FOLDER + file + ".orig", VENUS_GUI_FOLDER + file);
                    }
                });
            }
        } else {
            throw "Venus GUI folder not found - are you running on Venus OS?"
        }
    }

    return(plugin);

}
