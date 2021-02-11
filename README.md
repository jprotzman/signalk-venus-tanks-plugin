# pdjr-skplugin-venus-tanks

Inject Signal K tank data onto Venus OS dbus.

__pdjr-skplugin-venus-tanks__ is a plugin for Signal K servers running
on Venus OS.

The plugin takes tank data from Signal K and injects it into the host
operating system's dbus in a format compatible with the requirements of
the Venus operating system.

The plugin is designed to compensate for the deficiencies of Venus'
tank data hndling and will allow a Venus based display like CCGX to
render tank data even if it derives from an unsupported multi-channel
tank monitoring device like a Maretron MFP100 or Garnet SeeLevel.


## System requirements

__pdjr-skplugin-venus-tanks__ will only operate on Signal K servers
running under Venus OS.

If you do not run Signal K under Venus (but have Signal K available
elsewhere on your network) or you prefer to maintain dbus tank data with
a native Venus process then
[venus-signalk-tank-service](https://github.com/preeve9534/venus-signalk-tank-service)
is an alternative application which fulfils the same role.

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
If you want to report just specific tanks, then you must configure the
plugin by explicitly specifying the Signal K tank paths that it should
process.

__pdjr-skplugin-venus-tanks__ is confugured through the Signal K plugin
configuration interface.
Navigate to _Server->Plugin config_ and select the _Venus tanks_ tab.

The plugin configuration pane consists simply of a list of Signal K tank
paths.
Initially this list is empty: a condition which the plugin treats as an
invitation to create and maintain dbus entries for all tank paths
reported in Signal K.
If the list is not empty, then only those tanks identified in the list
will be processed.
Each list entry must consist of a Signal K tank path of the form
__tanks/__*fluid-type*__.__*tank-instance*.
