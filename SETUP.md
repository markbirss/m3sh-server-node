# RaspberryPi Zero W Setup
The Zero W needs a bit of custom work before you can clone this repository and get it going.

## 1. Install Raspbian Jessie
Use your favorite imaging app to burn an image of Jessie onto an SD card of your choice. I'm a fan of [Etcher](https://etcher.io). You can find the latest version of [Raspbian Jessie LITE here](https://www.raspberrypi.org/downloads/raspbian/).

## 2. Install Node.js v7+
*Manually* install the [latest version](https://nodejs.org/en/download/current/) of Node.JS as follows. Replace the file name with the latest version of the __**Arm6**__ Linux Binary:
```
$ sudo -
$ wget https://nodejs.org/dist/v7.7.2/node-v7.7.2-linux-armv6l.tar.xz
$ tar -xvf node-v7.7.2-linux-armv6l.tar.xz
$ cd node-v7.7.2-linux-armv6l
$ cp -R bin/ /usr/local/
$ cp -R include /usr/local/
$ cp -R lib/ /usr/local/
$ cp -R share/ /usr/local/
```
Make sure to clearn up:
```
$ cd ..
$ rm node-v7.7.2-linux-armv6l.tar.xz
$ rm -rf node-v7.7.2-linux-armv6l
$ node --version
$ exit
```
## Install PostgreSQL
```

```
