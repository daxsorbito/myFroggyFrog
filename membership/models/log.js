var assert = require('assert');

var Log = function(args){
    assert.ok(args.subject && args.entry && agrs.userId, 'Need subject, entry and userId');

    var log = {};
    log.subject = args.subject;
    log.entry = args.entry;
    log.createdAt = new Date();
    log.userId = args.userId;

    return log;

};