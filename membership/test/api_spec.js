var db = require('secondthought');
var Membership = require('../index');
var assert = require('assert');

describe('Main API', function(){
    var memb = {};
    before(function(done){
        memb = new Membership('membership');
        db.connect({db: 'membership'}, function(err, db){
            db.users.destroyAll(function(err, result){
                done();
            });
        });
    });

    describe('authentication', function(){
        var newUser = {};
        before(function(done){
            memb.register('daxsorbito+devtest.com', '1234', '1234', function(err, result){
                newUser = result.user;
                assert.ok(result.success, 'Can\'t register');
                done();
            });
        });

        it('authenticates', function(done){
            memb.authenticate('daxsorbito+devtest.com', '1234', function(err, result){
                result.success.should.equal(true);
                done();
            });
        });

        it('gets by token', function(done){
            memb.findUserByToken(newUser.authenticationToken, function(err, result){
                result.should.be.defined;
                done();
            });
        });
    });
});
