#!/bin/sh

ionic cordova plugin remove cordova-plugin-badge
ionic cordova plugin remove cordova-plugin-compat
ionic cordova plugin remove cordova-plugin-device
ionic cordova plugin remove cordova-plugin-geolocation
ionic cordova plugin remove cordova-plugin-splashscreen
ionic cordova plugin remove cordova-plugin-statusbar
ionic cordova plugin remove cordova-plugin-x-socialsharing
ionic cordova plugin remove ionic-plugin-keyboard

ionic cordova platform remove ios
ionic cordova platform remove android
ionic cordova platform remove osx

ionic cordova platform add ios
ionic cordova platform add android
ionic cordova platform add osx

ionic cordova plugin add cordova-plugin-badge
ionic cordova plugin add cordova-plugin-device
ionic cordova plugin add cordova-plugin-geolocation
ionic cordova plugin add cordova-plugin-splashscreen
ionic cordova plugin add cordova-plugin-statusbar
ionic cordova plugin add cordova-plugin-x-socialsharing
ionic cordova plugin add ionic-plugin-keyboard

