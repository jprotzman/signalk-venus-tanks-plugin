/*
 * Copyright 2021 Paul Reeve <paul@pdjr.eu>
 * Portions Copyright (2017) Scott Bender (see https://github.com/sbender9/signalk-simple-notifications)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const Log = require('./lib/signalk-liblog/Log.js');

const PLUGIN_ID = "venus-tanks";
const PLUGIN_SCHEMA_FILE = _dirname + "/schema.json";
const PLUGIN_UISCHEMA_FILE = __dirname + "/uischema.json";

module.exports = function(app) {
  var plugin = {};
  var unsubscribes = [];
  var fluidTypes = { "fuel": 0, "freshWater": 1, "wasteWater": 5 };

  plugin.id = PLUGIN_ID;
  plugin.name = "Venus tank ";
  plugin.description = "Inject Signal K tank data onto host dbus";

  const log = new Log(plugin.id, { ncallback: app.setPluginStatus, ecallback: app.setPluginError });

  plugin.schema = {
    "type": "object",
    "properties": {
      "tanks": {
        "type": "array",
        "title": "",
        "items": {
          "title": "",
          "type": "string"
        },
        "default": [
        ]
      }
    }
  }

  plugin.uiSchema = { }

  plugin.start = function(options) {
    # If no tank paths are specified, then recover all available paths
    # from the server.
    if (options.tanks.length == 0) {
      var tanks = app.streambundle.getAvailablePaths().filter(p => p.startsWith('tanks.')).reduce((a,v) => {
        var matches;
        if (matches = v.match(/^(.*\..*\..*)\..*/)) a.add(matches[0]);
        return(a);
      }, new Set());
      options.tanks = Array.from(tanks);
    } 

    options.tanks.forEach(tank => {
      var parts = tank.split(/\./);
      if (parts.length == 3) {
        let fluidType = (N2K_FLUID_TYPES[parts[1]])?N2K_FLUID_TYPES[parts[1]]:0;
        let instance = parts[2];
        # Create dbus service
        var stream = app.streambundle.getSelfStream(tank + ".currentLevel");
        if (stream) {
          unsubscribes.push(stream.onValue(v => {
            var capacity = app.getSelfPath(rule.tankpath + ".capacity.value");
            # Update dbus service
          }
        }));
      }
    });
  }

  plugin.stop = function() {
    unsubscribes.forEach(f => f())
    unsubscribes = []
  }


return(plugin);

}
