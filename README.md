# pdjr-skplugin-venus-tanks

Inject Signal K tank data onto Venus OS dbus.

__pdjr-skplugin-venus-tanks__ is a plugin for Signal K servers running
on Venus OS.

The plugin takes tank data from Signal K and injects it into the host
system dbus making the data available for rendering in the Venus GUI.

The plugin was designed as a work-around for Venus' broken handling of
multi-channel tank monitoring devices like the Maretron FPM100 and
Garnet SeeLevel, but, it will, of course, operate with Signal K tank
data from any source.

## System requirements

__pdjr-skplugin-venus-tanks__ will only be useful in Signal K servers
running under Venus OS.

If you require similar functionality but do not run Signal K under
Venus or you prefer to maintain dbus tank data with a native Venus
process, then consider
[venus-signalk-tank-service](https://github.com/preeve9534/venus-signalk-tank-service)
an alternative application which fulfils the same role in a more
general way.

## Installation

Download and install __pdjr-skplugin-venus-tanks__ using the _Appstore_
link in your Signal K Node server console.
The plugin can also be obtained from the 
[project homepage](https://github.com/preeve9534/pdjr-skplugin-venus-tanks)
and installed using
[these instructions](https://github.com/SignalK/signalk-server-node/blob/master/SERVERPLUGINS.md).

Once installed the plugin will start immediately.

## Configuration

By default __pdjr-skplugin-venus-tanks__ will create and update a dbus
service for every tank reported in Signal K.

If you want the plugin to support just specific tanks, then you must
configure it by explicitly specifying the Signal K tank paths that it
should process.

__pdjr-skplugin-venus-tanks__ is configured through the Signal K plugin
configuration interface.
Navigate to _Server->Plugin config_ and select the _Venus tanks_ tab.

The plugin configuration page consists simply of a list of Signal K
tank paths.
Initially this list is empty: a condition which the plugin treats as
an invitation to create and maintain dbus entries for all tank paths
reported in Signal K.
If the list is not empty, then only those tanks identified in the list
will be processed.
Each list entry must consist of a Signal K tank path of the form
'tanks.*fluid-type*__.__*tank-instance*'.

## Author

Paul Reeve \<<preeve@pdjr.eu>\>
