/**
 * Created by wengs_000 on 2015/1/30 0030.
 */
var fs = require('fs');
var Client = require('svn-spawn');
var repo = 'http://192.168.1.22:8000/svn/hxbss/NEW_BIZHALL/Source/trunk/Local/XJ_TRUNK/LocalCustWeb';
var __dirname = 'c:/test/repo'
var workingpath = 'file://' + __dirname + '/repo';

var client = new Client({
    cwd: __dirname,
    username: 'wengsr', // optional if authentication not required or is already saved
    password: 'wengsr62952' // optional if authentication not required or is already saved
});

client.update(function (err, data) {
    console.log(err);
    console.log(data);
//    test.equals(err, null);
//    test.done();
});


module.exports = {
    'test checkout': function (test) {
        // var checkoutPath = __dirname + '/tmp/checkout';
        // var client = new Client({
        //     cwd: checkoutPath
        // });

        client.checkout(repo, function (err, data) {
            test.equals(err, null);
            test.done();
        });
    },
    'test info': function (test) {
        client.getInfo(function (err, data) {
            test.equals(err, null);
            test.ok('url' in data);
            test.done();
        });
    },
    'test update': function (test) {
        client.update(function (err, data) {
            test.equals(err, null);
            test.ok(data.indexOf('At revision') !== -1);
            test.done();
        });
    },
    'test status': function (test) {
        client.getStatus(function (err, data) {
            test.equals(err, null);
            // test.equals(data.length, 0);
            test.done();
        });
    },
    'test log': function (test) {
        client.getLog(function (err, data) {
            test.equals(err, null);
            test.ok('author' in data[0]);
            test.done();
        });
    },
    'test add': function (test) {
        fs.writeFileSync(workingPath + '/a.txt', new Date().toString());

        client.addLocal(function (err, data) {
            test.equals(err, null);
            test.done();
        });
    },
    'test delete': function (test) {
        client.del('b.txt', function (err, data) {
            test.equals(err, null);
            test.done();
        });
    },
    'test commit': function (test) {
        fs.writeFileSync(workingPath + '/a.txt', new Date().toString());

        client.addLocal(function (err, data) {
            test.equals(err, null);
            client.commit('test commit', function (err, data) {
                test.equals(err, null);
                test.done();
            });
        });
    },
    'test update': function (test) {
        client.update(function (err, data) {
            test.equals(err, null);
            test.done();
        });
    }
};