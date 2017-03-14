# RaspberryPi Zero W Setup
The Zero W needs a bit of custom work before you can clone this repository and get it going. 

**Note**: I have not tested this with the Raspberry Pi Zero (without the built in Wifi & Bluetooth) or any of the other Raspberry Pi's but that doesnt mean it wont work. Give it a shot!

## 1. Install Raspbian Jessie
Use your favorite imaging app to burn an image of Jessie onto an SD card of your choice. I'm a fan of [Etcher](https://etcher.io). You can find the latest version of [Raspbian Jessie LITE here](https://www.raspberrypi.org/downloads/raspbian/).

## 2. Install Node.js v7+
*Manually* install the [latest version](https://nodejs.org/en/download/current/) of Node.JS as follows. Replace the file name with the latest version of the __**Arm6**__ Linux Binary:
```
$ sudo -
$ wget https://nodejs.org/dist/v7.7.2/node-v7.7.2-linux-armv6l.tar.xz
$ tar -xvf node-v7.7.2-linux-armv6l.tar.xz
$ cd node-v7.7.2-linux-armv6l
$ sudo cp -R bin/ /usr/local/
$ sudo cp -R include /usr/local/
$ sudo cp -R lib/ /usr/local/
$ sudo cp -R share/ /usr/local/
```
Make sure to clean up:
```
$ cd ..
$ rm node-v7.7.2-linux-armv6l.tar.xz
$ rm -rf node-v7.7.2-linux-armv6l
$ node --version
$ exit
```

## 3. Install PostgreSQL
### A. Update & Install the Package
```
$ sudo -
$ sudo apt-get update
$ sudo apt-get install postgresql-9.4
```
### B. Create a Password & Database
```
$ sudo -u postgres psql
# \password postgres
```
Enter in `deaddrop` for the password. This is the default. If you want to change it, remember to also update the `config/dbinit.sql` file.
```
# CREATE DATABASE deaddrop;
```
The database `deaddrop` is the default. If you want to change it, make sure to also update the `config/dbinit.sql` file.
```
# \q
```

## 4. Set Environment
This will allow your Pi to operate as both a *Central* and a *Peripheral*.
```
$ NOBLE_MULTI_ROLE=1; export NOBLE_MULTI_ROLE
```
Then you can use `printenv` to make sure it's set.
