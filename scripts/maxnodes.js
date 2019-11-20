var mongoose = require('mongoose')
    , lib = require('../lib/explorer')
    , db = require('../lib/database')
    , settings = require('../lib/settings')
    , request = require('request');

function exit() {
    mongoose.disconnect();
    process.exit(0);
}
var DEBUG = false;
var dbString = 'mongodb://' + settings.dbsettings.user;
dbString = dbString + ':' + settings.dbsettings.password;
dbString = dbString + '@' + settings.dbsettings.address;
dbString = dbString + ':' + settings.dbsettings.port;
dbString = dbString + '/' + settings.dbsettings.database;

mongoose.connect(dbString, { useNewUrlParser: true }, function (err) {
    if (err) {
        console.log('Unable to connect to database: %s', dbString);
        console.log('Aborting');
        exit();
    } else {
        request({ uri: 'http://127.0.0.1:' + settings.port + '/api/listmaxnodes', json: true }, function (error, response, body) {
            if (!body) {  // Error Condition was not successfull
                console.log('Unable to connect to explorer API');
                exit();
            }
            lib.syncLoop(body.length, function (loop) {
                var i = loop.iteration();
                db.find_maxnode(body[i].txhash, body[i].outidx, function (maxnode) {
                    if (maxnode) {
                        console.log('Maxnode already exists in DB Update TXID:%s OUTIDX:%s', body[i].txhash, body[i].outidx);

                        db.update_maxnode({
                            rank: body[i].rank,
                            network: body[i].network,
                            txhash: body[i].txhash,
                            outidx: body[i].outidx,
                            status: body[i].status,
                            addr: body[i].addr,
                            version: body[i].version,
                            lastseen: body[i].lastseen,
                            activetime: body[i].activetime,
                            lastpaid: body[i].lastpaid
                        }, function () {
                            loop.next();
                        });
                    } else {
                        console.log('Maxnode does not exists in DB ADD TXID:%s OUTIDX:%s', body[i].txhash, body[i].outidx);
                        db.create_maxnode({
                            rank: body[i].rank,
                            network: body[i].network,
                            txhash: body[i].txhash,
                            outidx: body[i].outidx,
                            status: body[i].status,
                            addr: body[i].addr,
                            version: body[i].version,
                            lastseen: body[i].lastseen,
                            activetime: body[i].activetime,
                            lastpaid: body[i].lastpaid
                        }, function () {
                            loop.next();
                        });
                    }
                });
            }, function () {
                db.remove_old_maxnodes(function (cb) {
                    db.update_cronjob_run(settings.coin, { list_maxnode_update: Math.floor(new Date() / 1000) }, function (cb) {
                        exit();
                    });
                });
            });

        });
    }
});
