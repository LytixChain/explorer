LytixChain Block Explorer - v2.0
================

This explorer has been forked from iquidus/DSTRA/PrimeStone. All credit goes to them for their hard work. 

### See it in action

*  [explorer.lytixchain.org](http://explorer.lytixchain.org/)


### Requires

*  node.js >= 0.10.28
*  mongodb 2.6.x
*  lytixd, lytix-cli

### Create database

Enter MongoDB cli:

    $ mongo

Create databse:

    > use explorerdb

Create user with read/write access:

    > db.createUser( { user: "lytix", pwd: "changeme", roles: [ "readWrite" ] } )

*note: If you're using mongo shell 2.4.x, use the following to create your user:

    > db.addUser( { user: "lytix", pwd: "changeme", roles: [ "readWrite"] })

### Get the source

    git clone https://github.com/LytixChain/explorer.git 

### Install node modules

    cd explorer && npm install --production

### Configure

    cp ./settings.json.template ./settings.json

*Make required changes in settings.json*

### Start Explorer
    
    npm start
    OR
    forever start bin/cluster

*note: mongod must be running to start the explorer*

As of version 2.0 the explorer defaults to cluster mode, forking an instance of its process to each cpu core. This results in increased performance and stability. Load balancing gets automatically taken care of and any instances that for some reason die, will be restarted automatically. For testing/development (or if you just wish to) a single instance can be launched with

    node --stack-size=10000 bin/instance

To stop the cluster you can use

    npm stop
    OR (use corresponding to above explorer start)
    forever stop PID
    while you need to search for the correct PID with 'forever list', usually it would be 'forever stop 0' if no other forever processes are running

### Syncing databases with the blockchain

sync.js (located in scripts/) is used for updating the local databases. This script must be called from the explorers root directory.

    Usage: node scripts/sync.js [database] [mode]

    database: (required)
    index [mode] Main index: coin info/stats, transactions & addresses
    market       Market data: summaries, orderbooks, trade history & chartdata

    mode: (required for index database only)
    update       Updates index from last sync to current block
    check        checks index for (and adds) any missing transactions/addresses
    reindex      Clears index then resyncs from genesis to current block

    notes:
    * 'current block' is the latest created block when script is executed.
    * The market database only supports (& defaults to) reindex mode.
    * If check mode finds missing data(ignoring new data since last sync),
      index_timeout in settings.json is set too low.


*It is recommended to have this script launched via a cronjob at 1+ min intervals.*

**crontab**

*Example crontab; update index every minute and market data every 2 minutes*

    */1 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/sync.js index update > /dev/null 2>&1
    */2 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/sync.js market > /dev/null 2>&1
    */1 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/masternodes.js > /dev/null 2>&1
    */5 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/peers.js > /dev/null 2>&1

forcesync.sh and forcesynclatest.sh (located in scripts/) can be used to force the explorer to sync at the specified block heights

### Wallet

The wallet connected to Diquidus must be running with atleast the following flags:

    -daemon -txindex

### Donate
    
   BTC 396kw4aQeHAUnW3EQ9hReqaSHzf9BsmsqQ

### Known Issues
**Database Querys are slow.**
Index are not working correct you need to create the index in the mongodb

    db.addresses.ensureIndex({"a_id":1})
    db.getCollection('txes').ensureIndex({"txid":1})
    db.getCollection('txes').ensureIndex({"timestamp":1})
    db.txes.collection.createIndex( { timestamp: -1 } )
    db.txes.ensureIndex({"total":1})

**script is already running.**

If you receive this message when launching the sync script either a) a sync is currently in progress, or b) a previous sync was killed before it completed. If you are certian a sync is not in progress remove the index.pid from the tmp folder in the explorer root directory.

    rm tmp/index.pid

**exceeding stack size**

    RangeError: Maximum call stack size exceeded

Nodes default stack size may be too small to index addresses with many tx's. If you experience the above error while running sync.js the stack size needs to be increased.

To determine the default setting run

    node --v8-options | grep -B0 -A1 stack_size

To run sync.js with a larger stack size launch with

    node --stack-size=[SIZE] scripts/sync.js index update

Where [SIZE] is an integer higher than the default.

*note: SIZE will depend on which blockchain you are using, you may need to play around a bit to find an optimal setting*




