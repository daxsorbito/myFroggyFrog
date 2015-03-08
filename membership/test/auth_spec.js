var Registration = require('../lib/registration');
var db = require('secondthought');
var assert = require('assert');
var Auth = require('../lib/authentication');
var should = require('should');

describe('Authentication', function(){
    var reg = {};
    var auth = {};
    before(function(done){
        db.connect({db : 'membership'}, function(err, db){
            reg = new Registration(db);
            auth = new Auth(db);
            db.users.destroyAll(function(err, result){
                reg.applyForMembership({
                        email: 'test@gmail.com',
                        password: '1234',
                        confirm: '1234'
                    },
                    function (err, regResult) {
                        assert.ok(regResult.success);

                        done();
                    });
            });
        });
    });

    describe('a valid login', function(){
        var authResult = {};
        before(function(done) {
            // log them in
            auth.authenticate({email: 'test@gmail.com', password: '1234'}, function(err, result){
                assert.ok(err === null, err);

                authResult = result;
                done();
            });

        });

        it('is successful', function(){
            authResult.success.should.equal(true);
        });
        it('returns a user', function(){
            authResult.user.should.be.defined;
            should.exist(authResult.user);
        });
        it('creates a log entry', function(){
            should.exist(authResult.log);
        });
        it('updates the user stats', function(){
            authResult.user.signInCount.should.equal(2);
        });
        it('updates the signon dates', function(){
            should.exist(authResult.user.lastLoginAt);
            should.exist(authResult.user.currentLoginAt);
        });

    });

    describe('empty email', function(){
        var authResult = {};
        before(function(done) {
            // log them in
            auth.authenticate({email: null, password: '1234'}, function(err, result){
                assert.ok(err === null, err);

                authResult = result;
                done();
            });

        });

        it('is not successful', function(){
            authResult.success.should.equal(false);
        });
        it('returns a message saying \'Invalid login\'', function(){
            authResult.message.should.equal('Invalid email or password');
        });
    });

    describe('empty password', function(){
        var authResult = {};
        before(function(done) {
            // log them in
            auth.authenticate({email: 'daxsorbito+devtest@gmail.com', password: null}, function(err, result){
                assert.ok(err === null, err);

                authResult = result;
                done();
            });

        });

        it('is not successful', function(){
            authResult.success.should.equal(false);
        });
        it('returns a message saying \'Invalid login\'', function(){
            authResult.message.should.equal('Invalid email or password');
        });
    });

    describe('pasword doesn\'t match', function(){
        var authResult = {};
        before(function(done) {
            // log them in
            auth.authenticate({email: 'daxsorbito+devtest@gmail.com', password: '1234'}, function(err, result){
                assert.ok(err === null, err);

                authResult = result;
                done();
            });

        });

        it('is not successful', function(){
            authResult.success.should.equal(false);
        });
        it('returns a message saying \'Invalid login\'', function(){
            authResult.message.should.equal('Invalid email or password');
        });
    });

    describe('email not found', function(){
        var authResult = {};
        before(function(done) {
            // log them in
            auth.authenticate({email: 'xxxxx@test.com', password: '1234'}, function(err, result){
                assert.ok(err === null, err);

                authResult = result;
                done();
            });

        });

        it('is not successful', function(){
            authResult.success.should.equal(false);
        });
        it('returns a message saying \'Invalid login\'', function(){
            authResult.message.should.equal('Invalid email or password');
        });
    });
});