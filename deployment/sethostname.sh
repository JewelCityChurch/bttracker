#!/bin/bash
CURRENT_HOSTNAME=$(cat /etc/hostname)
# Find MAC of eth0, or if not exist wlan0
if [ -e /sys/class/net/eth0 ]; then
 MAC=$(cat /sys/class/net/wifi0/address)
else
 MAC=$(cat /sys/class/net/eth0/address)
fi
