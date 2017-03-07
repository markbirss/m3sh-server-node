![M3SH](https://raw.githubusercontent.com/foreignmedia/m3sh-server-node/master/assets/m3sh-logo.png)

# M3SH "Dead Drop" Server (Node.js)
The official repo for the M3SH "Dead Drop" server written in Node.js for Raspberry Pi Zero W.

## About M3SH
M3SH is a mobile ad hock messaging network ([MANET](https://en.wikipedia.org/wiki/Mobile_ad_hoc_network)) concept based on mesh flooding over Bluetooth LE. In straight foreward terms, it relays secure messages in close proximity through nodes that can either be a user's phone or a dedicated server. The messages are continually relayed until they either expire or reach the intended destination. The more nodes on the network, and the more the nodes travel within a given timeframe, the greater chance the message will be delivered.

### Privacy
Each message, or "Package" is end-to-end encrypted. Before two devices can communicate, they need to be "paired" in close proximity and exchange encryption keys. These keys are used to encrypt the message before sending so that while the message will be relayed to an undeterminate number of nodes, only the recipient will be able to decrypt the package.

Based on the ability of Bluetooth LE to advertise to a specifc class of devices, it is possible to create a private, "known" ad hock network that only devices with the network ID will be able to participate.

### Terminology
To make sure we're on the same page, these are the terms that I'll be using to prevent confusion
* Node: General term for any node on the network with the M3SH software running.
* Client Node: Term referring specifically to a Node that exists on a client device with a M3SH App installed capable of sending messages.
* Relay Node ("Dead Drop"): Term referring specifically to a Node that exists on a server dedicated to relaying messages only.
* Origin Node: Term referring to the Client Node in which a specific message was created (originated).
* Package: Term referring to a single message that contains the intended destination and the encrypted body.

### The Laws
The following are the working "*Laws*" I've developed to prevent inherent issues with flood-based mesh networks including preventing packet storms, DOS attacks and ensuring general network reliability. These laws are intended to be the basis for developing any client or server node.

### Package Laws
1. A Package can only exist on a node for a limited time (TTL)
2. A Package can not be sent to a the same Node more than once durring its lifetime on a given node.
3. A Package can not be sent to a node it was delivered from
4. Package can only be sent to a maximum number of Nodes during its lifetime on a given Node before the package is automatically expired.
5. A Package will take priority if the connected Node is the intended destination.
6. A Package will remain on the Origin Node and will only expire based on TTL, and not by any other means.

### Node Laws
1. A *sending* Node will only send a maximum amount of Packages to a given node during a broadcast session.
2. A *sending* Node will only send a maximum number of bytes per broadcast session, regardless of Package count.
3. A *sending* Node will keep a record of every package sent to fulfill *__Package Law #2__*.
4. A *receiving* Node will keep a record of every package recieved to fullfill *__Package Law #1__*.
3. A *receiving* Node will only accept a maximum number of bytes per transaction and will cancel the receiving session as soon as the byte limit is exceeded.
4. A *receiving* Node will keep a record of "rogue nodes" that violate the byte limit, or have sent malformed Packages and will refuse connection to these Nodes in the future.
