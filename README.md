# pdjr-skplugin-venus-tanks

Inject Signal K tank data onto host dbus.

__pdjr-skplugin-venus-tanks__ is a plugin for Signal K servers running
on Venus OS.

The plugin takes tank data from Signal K and injects it into the host
operating system's dbus in a format compatible with requirements of the
Venus operating system.

The plugin is designed to compensate for the deficiencies of Venus'
tank data hndling and will allow a Venus based display like CCGX to
render tank data even if it derives from an unsupported multi-channel
tank monitoring device like a Maretron MFP100 or ?????? SeeLevel.

## System requirements

__pdjr-skplugin-venus-tanks__ will only operate is Signal K servers
that run on Venus OS.

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
