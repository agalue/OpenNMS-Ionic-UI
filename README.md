# OpenNMS-Ionic2-UI

A mobile application for OpenNMS made with Ionic 2

This project has been created for the merely purpose of learning TypeScript, Angular2 and Ionic2.

It was designed based on the current state of OpenNMS Horizon 19, but it could work on older versions of Horizon as well as Meridian.

It requires to enable CORS on your OpenNMS server, in order to access the data through the ReST API.

On your web.xml, make sure the following section is enabled:

```XML
<filter-mapping>
    <filter-name>CORS Filter</filter-name>
    <url-pattern>/rest/*</url-pattern>
</filter-mapping>
<filter-mapping>
    <filter-name>CORS Filter</filter-name>
    <url-pattern>/nrt/*</url-pattern>
</filter-mapping>
```

It might be possible that the following section should be added:

```XML
<filter-mapping>
    <filter-name>CORS Filter</filter-name>
    <url-pattern>/api/*</url-pattern>
</filter-mapping>
```

Ionic2 has to be installed on your system, in order to compile and use this project on your device:

```
sudo npm install ionic --save
```

For IOS deployemnt, you need a Mac with XCode. For Android, you need Android Studio. The following link provides more information.

https://ionicframework.com/docs/guide/testing.html

# Features Implemented

* Add multiple OpenNMS servers to your app. This information will be stored locally on your device.
* Visualize a summary of your server, by displaying the SLM View, the Alarms Summary, and the Outage Summary.
* Visualize the list of events, alarms, outages and notifications, using infinite-scroll with server side fetch for paging.
* Searching capabilities for events, alarms, outages and notifications.
* Ack, Unack, Clear or Escalate alarms, if the user has the appropriate permissions.
* Visualize the nodes and its SNMP settings, IP interfaces, SNMP interfaces, Service Availability, Assets and Resources.
* Set the node's location based on your device's current geo-location, or pick one from the map.
* Visualize the Reginal Status Map (based on either alarms or outages, as it is available on Horizon 19. Older versions won't support this feature).
* Configure SNMP Settings (if the user has the appropriate permissions).
* Configure Requisitions and Foreign Source definitions, with the ability to view the whole content of the requisitioned inventory.

# Future Enhancements

* Add support for graphing resource metrics.
* Add support for configuring scheduled outages per node.
* Manage users and groups.
* Modify sticky and journal notes for alarms.
* Hide unsupported features based on the version of the target OpenNMS server.
* [Native Component] Copy alarms, notifications or outages to the clipboard.
* [Native Component] Share alarms, notifications or outages (email, sms, whatsapp, etc.).
* [Native Component] use pin-dialog or touch-id to protect the access to the app.
