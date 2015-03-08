var User = require('../models/user');
var Application = require('../models/application');
var db = require('secondthought');
var assert = require('assert');
var bc = require('bcrypt-nodejs');
var Log = require('../models/log');
var Q = require('q');

var RegResult = function(){

    var result = {
        success : false,
        message : null,
        user : null
    }

    return result;
};

var Registration = function(db){
    var self = this;

    var validateInputs = function(app){

        // make sure there's an email and password
        if(!app.email || !app.password){
            app.setInvalid('Email and password are required');
        } else if(app.password !== app.confirm) {
            app.setInvalid('Password don\'t match');
        } else {
            app.validate();
        }
    };

    var checkIfUserExists = function(app){
        var deferred = Q.defer();
        db.users.exists({email : app.email}, function(err, exists) {
            if(err) deferred.reject(err);
            deferred.resolve(exists);
        });
        return deferred.promise;
    };

    var saveUser = function(user){
        var deferred = Q.defer();
        db.users.save(user, function(err, newUser){
            if(err) deferred.reject(err);
            deferred.resolve(newUser);
        });
        return deferred.promise;
    };

    var addLogEntry = function(user){
        var deferred = Q.defer();
        var log = new Log({
            subject : 'Registration',
            userId : user.id,
            entry : 'Successfully Registered'
        });
        db.logs.save(log, function(err, newLog) {
            if(err) deferred.reject(err);
            deferred.resolve(newLog);
        });
        return deferred.promise;
    };

    self.applyForMembership = function(args, next) {
        var regResult = new RegResult();
        var app = new Application(args);

        // do something interesting
        // validate inputs
        validateInputs(app);

        if(app.status === 'validated') {
            // check to see if email exists
            checkIfUserExists(app)
                .then(function(exists) {
                    console.log('exists >>>' + exists);
                    if (!exists) {
                        // create a new user
                        var user = new User(app);
                        user.status = 'approved';
                        user.signInCount = 1;

                        // hash the password
                        user.hashedPassword = bc.hashSync(app.password);
                        saveUser(user)
                            .then(function (newUser) {
                                regResult.user = newUser;
                                addLogEntry(newUser)
                                    .then(function(newLog){
                                        regResult.log = newLog;
                                        regResult.success = true;
                                        regResult.message = 'Welcome!';

                                        next(null, regResult);
                                    });
                            });
                    } else {
                        regResult.message = 'User already exist!';
                        next(null, regResult);
                    }
                });
        } else {
            regResult.message = app.message;
            next(null, regResult);
        }


        //    checkIfUserExists(app, function(err, exists){
        //        console.log(exists);
        //        assert.ok(err === null, err);
        //        if(!exists){
        //            // create a new user
        //            var user = new User(app);
        //            user.status = 'approved';
        //            user.signInCount = 1;
        //
        //            // hash the password
        //            user.hashedPassword = bc.hashSync(app.password);
        //
        //            // save the user
        //            saveUser(user, function(err, newUser){
        //                assert.ok(err === null, err);
        //                regResult.user = newUser;
        //
        //                // create a log entry
        //                addLogEntry(newUser, function(err, newLog){
        //                    regResult.log = newLog;
        //                    regResult.success = true;
        //                    regResult.message = 'Welcome!';
        //
        //                    next(null, regResult);
        //                });
        //
        //            });
        //
        //        } else {
        //            regResult.message = 'User already exist!';
        //            next(null, regResult);
        //        }
        //
        //    });
        //} else {
        //    regResult.message = app.message;
        //    next(null, regResult);
        //
        //}

    };
};

module.exports =  Registration;