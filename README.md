# pdjr-skplugin-venus-tanks

This plugin is intended for Signal K servers running on Venus OS.

__pdjr-skplugin-venus-tanks__ represents Signal K tanks as D-Bus
services, injecting tank data from Signal K into Venus OS and 
enabling its display on the Venus GUI.

This is useful because it provides a work-around for Venus' broken
native support for CAN connected multi-channel tank sensor devices
like the Maretron FPM100 and the Garnet SeeLevel.

Although designed to address Venus' problem with multi-channel tank
sensors, the project will, of course, inject any Signal K tank data
into Venus and so make it available to devices like the CCGX.

The plugin borrows GUI enhancements from Kevin Windrem's
[tank repeater](https://github.com/kwindrem/SeeLevel-N2K-Victron-VenusOS)
project to achieve the display shown below.
Of course, you can also roll your own GUI for tank data rendering.

![CCGX tank display](venus.png)

## Background

Support for tank monitoring in Venus OS is fundamentally broken.
The OS code implementing 'socketcan' services assumes one tank sensor
device per physical tank and generates a single D-Bus tank service for
each sensor device based on this false understanding.

Consequently, a tank service in Venus that represesents a multi-channel
tank sensor device is chaotically updated with data from all the tank
sensors that are connected to the multi-channel device resulting in a
GUI rendering of the data that is unintelligible.

Somewhere in this broken-ness Venus discards tank sensor instance
numbers making disaggregation of the garbled composite data at best
problematic and, for non-trivial tank installations, infeasible.

Even so, there have been a number of attempts at implementing fixes
and work-arounds based on the timing of fluid type and tank level
data updates but these do not allow disambiguation in installations
which have more than one tank of a particular fluid type.

If you have a multi-channel tank sensor on CAN and you have only one
tank of each fluid type, then look at Kevin Windrem's project (see
above) for a solution that doesn't involve Signal K.

## System requirements

A Venus OS based host system running Signal K and configured to
display Venus' 'boat and motorhome overview'.

You can enable and disable 'boat & motorhome overview' by
navigating to
*MENU -> Settings -> Display & language -> Show baot & motorhome overview*
on your Venus OS GUI.

If you require similar functionality but do not run Signal K under
Venus or you prefer to maintain D-Bus tank data with a native Venus
process, then consider using this
[alternative Python application](https://github.com/preeve9534/venus-signalk-tank-service).

## Installation

Download and install __pdjr-skplugin-venus-tanks__ using the _Appstore_
link in your Signal K Node server console.
The plugin can also be obtained from the 
[project homepage](https://github.com/preeve9534/pdjr-skplugin-venus-tanks)
and installed using
[these instructions](https://github.com/SignalK/signalk-server-node/blob/master/SERVERPLUGINS.md).

## Configuration

__pdjr-skplugin-venus-tanks__ does not *require* configuration: all that
is necessary after installation is a restart of your Signal K server.

By default the plugin will enable some tweaks to the 'boat & motorhome'
view of your Venus host's GUI and create D-Bus tank services for every
tank reported within Signal K.
If you need to change either of these behaviours, then:

1. Login to your Signal K dashboard and navigate to
   _Server->Plugin Config_->_Venus tanks interface_ and select the
   _Configure_ button to open the configuration panel and reveal the
   following options.


2. OPTION: "Use GUI enhancements?"

   This option is checked by default and tells the plugin that it should
   use this project's versions of ```OverviewMobile.qml``` and
   ```TileTank.qml``` rather than the system's currently installed
   versions.
   
   To achieve this the plugin will backup the existing versions of these
   files and install its enhanced versions in their place.
   The GUI changes implemented by the two ```.qml``` files prevent the
   native display of CAN derived tank data and adjust the 'mobile' display
   page to better accommodate the display of multiple tank entries.
   
   Unchecking this option will prevent the use of the plugin's enhanced
   GUI, if necessary reverting any system changes that may have been made
   previously by restoring the backed up ```.qml``` files.
   
3. OPTION: "Tanks"

   This array option is empty by default, telling __pdjr-skplugin-venus-tanks__
   to create a D-Bus service for every tank reported in Signal K.

   If you want the plugin to support just specific tanks or you need to
   adjust the tank capacity value reported by Signal K for one or more
   tanks then you must configure each tank explicitly by adding entries
   to the *Tanks* list, one for each tank you want the plugin to process.
   
   Each tank entry consists of *path* and *factor* settings.

   *path* specifies the Signal K tank path of the tank being configured
   and must be of the form 'tanks.*fluid-type*__.__*tank-instance*'.
   
   *factor* must be a decimal value greater than or equal to 0.0 (it
   defaults to 1.0).
   This feature is useful when individual tank sensor monitors are
   poorly configured or report in non-standard ways: some perhaps
   returning volume in litres, others in cubic-metres.
   Venus OS expects tank capacity to be reported in litres.
   
4. When you have made any changes you require, click _Submit_ to save
   your choices and start the plugin.
   
5. Reboot your Venus host or login and restart the GUI:
   ```
   $> svc -d /service/gui
   $> svc -u /service/gui
   ```

## Reviewing operation in Venus OS

Once the plugin is installed, configured and working you can log into
your Venus host and check things out.

On my five-tank system, for example:
```
$> dbus-spy
Services
com.victronenergy.battery.ttyO2                              BMV-700
com.victronenergy.fronius
com.victronenergy.logger
com.victronenergy.modbustcp
com.victronenergy.qwacs
com.victronenergy.settings
com.victronenergy.system
com.victronenergy.tank.signalk_192_168_1_2_3000_0_3          SignalK tank interface
com.victronenergy.tank.signalk_192_168_1_2_3000_0_4          SignalK tank interface
com.victronenergy.tank.signalk_192_168_1_2_3000_1_1          SignalK tank interface
com.victronenergy.tank.signalk_192_168_1_2_3000_1_2          SignalK tank interface
com.victronenergy.tank.signalk_192_168_1_2_3000_5_0          SignalK tank interface
com.victronenergy.tank.socketcan_can0_vi0_uc1640899          Tank sensor
com.victronenergy.vebus.ttyO1                                Quattro 24/8000/200-2x100
com.victronenergy.vecan.can0

```
If you choose one of the tank services you will be able to see tank
data updates as they occur. For example.
```
com.victronenergy.tank.signalk_192_168_1_2_3000_0_3
Capacity                                                                     1.7981
Connected                                                                         1
DeviceInstance                                                                    3
FirmwareVersion                                                                   0
FluidType                                                                         0
HardwareVersion                                                                   0
Level                                                                        89.104
Mgmt/Connection                                                      SignalK tank:3
Mgmt/ProcessName        /data/venus-signalk-tank-service-main/signalktankservice.py
Mgmt/ProcessVersion                                            1.0 on Python 2.7.14
ProductId                                                                         0
ProductName                                                  SignalK tank interface
Remaining                                                                   1.60218
```

You can see that my port-side fuel tank is reporting capacity in
cubic-metres: I should really adjust this to litres in some way;
maybe by setting a multiplication *factor* of 1000.0 for this tank.

## Acknowledgements

Thanks to @kwindrem for making this a whole lot easier than it might have
been by designing his repeater software in a way which allows its components
to be leveraged by others.

Thanks to @mvader at Victron for his support and encouragement and for
inviting me to think about a Signal K plugin variant of
[venus-signalk-tank-handler](https://github.com/preeve9534/venus-signalk-tank-service/).

## Author

Paul Reeve \<<preeve@pdjr.eu>\>
