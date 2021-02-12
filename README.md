# pdjr-skplugin-venus-tanks

Inject Signal K tank data onto the host system dbus.

__pdjr-skplugin-venus-tanks__ is a plugin for Signal K servers running
on Venus OS.

The plugin was designed as a work-around for Venus' broken handling of
multi-channel tank monitoring devices (like the Maretron FPM100 and
the Garnet SeeLevel), but, it will, of course, operate with Signal K
tank data from any source.

__pdjr-skplugin-venus-tanks__ creates a dbus service for each, user
nominated, Signal K tank and echoes Signal K tank updates to the
associated dbus service, making the tank data available for *inter-alia*
rendering in the Venus GUI.

The installation instructions below include guidance on how to use
the GUI modifications implemented by @kwindrem in his
[tank repeater](https://github.com/kwindrem/SeeLevel-N2K-Victron-VenusOS)
project to achieve the display shown below.
Of course, you can also roll your own GUI for tank data rendering.

![CCGX tank display](venus.png)

## System requirements

__pdjr-skplugin-venus-tanks__ will most likely only be useful in
Signal K servers running under Venus OS.

If you require similar functionality but do not run Signal K under
Venus or you prefer to maintain dbus tank data with a native Venus
process, then consider using this
[alternative Python application](https://github.com/preeve9534/venus-signalk-tank-service).

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

If you want the plugin to support just specific tanks or you need to
adjust the tank capacity value reported by Signal K for one or more
tanks then you must configure each tank explicitly in the following
way.

__pdjr-skplugin-venus-tanks__ is configured through the Signal K plugin
configuration interface.
Navigate to _Server->Plugin config_ and select the _Venus tanks_ tab.

The plugin configuration page consists of a list of Signal K tank
specifications, each consisting of a *path* to a particular tank in the
Signal K tree and an associated (multiplication) *factor* which can be
used to adjust the capacity value reported by Signal K.
This latter feature is useful when individual tank sensor monitors are
poorly configured or report in non-standard ways: some perhaps returning
volume in litres, others in cubic-metres.
Venus OS expects tank capacity to be reported in litres.
The factor value defaults to 1.0.

The tank list is initially empty: a condition which the plugin treats as
an invitation to create and maintain dbus services for all tank paths
reported in Signal K using a capacity *factor* of 1.0.

If the list is not empty, then only those tanks identified in the list
will be processed.
Each tank *path* entry must consist of a Signal K tank path of the form
'tanks.*fluid-type*__.__*tank-instance*' and *factor* must be a decimal
value greater than or equal to 0.0 (it defaults to 1.0).

You may need to restart Signal K after making any configuration
changes.

The plugin will indicate its status in the Signal K dashboard.

Once the plugin is installed, configured and working you can log into
your Venus host and check things out.
On my five-tank system, for example:
```
$> dbus-spy
Services
com.victronenergy.battery.ttyO2                                          BMV-700
com.victronenergy.fronius
com.victronenergy.logger
com.victronenergy.modbustcp
com.victronenergy.qwacs
com.victronenergy.settings
com.victronenergy.system
com.victronenergy.tank.signalk_tank_0_3                   SignalK tank interface
com.victronenergy.tank.signalk_tank_0_4                   SignalK tank interface
com.victronenergy.tank.signalk_tank_1_1                   SignalK tank interface
com.victronenergy.tank.signalk_tank_1_2                   SignalK tank interface
com.victronenergy.tank.signalk_tank_5_0                   SignalK tank interface
com.victronenergy.vebus.ttyO1                          Quattro 24/8000/200-2x100
com.victronenergy.vecan.can0
```
If you choose one of the tank services you will be able to see tank
data updates as they occur. For example.
```
com.victronenergy.tank.signalk_tank_0_3
Capacity                                                                  1.7981
Connected                                                                      1
DeviceInstance                                                                 3
FirmwareVersion                                                                0
FluidType                                                                      0
HardwareVersion                                                                0
Level                                                                     89.104
Mgmt/Connection                                                   SignalK tank:3
Mgmt/ProcessName     /data/venus-signalk-tank-service-main/signalktankservice.py
Mgmt/ProcessVersion                                         1.0 on Python 2.7.14
ProductId                                                                      0
ProductName                                               SignalK tank interface
Remaining                                                                1.60218
```

You can see that my port-side fuel tank is reporting capacity in
cubic-metres: I should really adjust this to litres by setting a
multiplication *factor* for this tank of 1000.0.

### Updating the Venus GUI for multiple tank display

If you have more than one or two tanks on your system, then you may
wish to make some changes to the Venus GUI in order to better 
display this data.

On my system I use the GUI tweaks implemented by @kwendrem in his
[tank repeater](https://github.com/kwindrem/SeeLevel-N2K-Victron-VenusOS)
project.
You can get these changes by clicking the above link and following
the installation instructions bearing in mind that:
   
1. When you run the repeater project setup script, respond to the
   first prompt with 'a' (Activate) and subsequent prompts with 'y'.
   This will activate @kwindrem's repeater (we don't need this) and
   install his GUI changes (we do need these).
   
2. You should then run the repeater project setup script again,
   responding to the first prompt with 'd' (Disable) and subsequent
   prompts with 'y'.
   This will disable @kwindrem's repeater, but leave his GUI changes
   in place.

## Acknowledgements

Thanks to @kwendrem for making this a whole lot easier than it might have
been by designing his repeater software in a way which allows it to be
leveraged by others.

Thanks to @mvader at Victron for his support and encouragement and for
inviting me to think about a Signal K plugin variant of
[venus-signalk-tank-handler](https://github.com/preeve9534/venus-signalk-tank-service/).

## Author

Paul Reeve \<<preeve@pdjr.eu>\>
