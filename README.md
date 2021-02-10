# pdjr-skplugin-venus-tanks

Inject Signal K tank data onto host dbus.

__pdjr-skplugin-venus-tanks__ takes tank data from Signal K and injects
it into the host dbus in a format compatible with requirements of Venus
OS.
The plugin can be used to compensate for the deficiencies of Venus'
tank data hndling and allow a Venus based display like the CCGX to render
tank data even if it derives from an unsupported source like a multi-channel
tank monitoring device.

## System requirements

__pdjr-skplugin-venus-tanks__ has no special system requirements that
must be met prior to installation.

## Installation

Download and install __pdjr-skplugin-venus-tanks__ using the _Appstore_
link in your Signal K Node server console.
The plugin can also be obtained from the 
[project homepage](https://github.com/preeve9534/pdjr-skplugin-venus-tanks)
and installed using
[these instructions](https://github.com/SignalK/signalk-server-node/blob/master/SERVERPLUGINS.md).

## Configuration

__pdjr-skplugin-venus-tanks__ is confugured through the Signal K Node
server plugin configuration interface.
Navigate to _Server->Plugin config_ and select the _Venus tanks_ tab.

The _Active_ checkbox tells the Signal K Node server whether or not to
run the plugin: on first execution you should check this, before
reviewing and amending the configuration options discussed below.
Changes you make will only be saved and applied when you finally click
the _Submit_ button.

The plugin configuration pane has two sections: a list of notification
trigger paths and a list of notification scripts.
