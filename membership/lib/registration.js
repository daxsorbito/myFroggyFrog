var User = require('../models/user');
var Application = require('../models/application');
var db = require('secondthought');
var assert = require('assert');
var bc = require('bcrypt-nodejs');
var Log = require('../models/log');

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

    var checkIfUserExists = function(app, next){
        db.users.exists({email : app.email}, next);
    };

    var saveUser = function(user, next){
        db.users.save(user, next);
    };

    var addLogEntry = function(user, next){
        var log = new Log({
            subject : 'Registration',
            userId : user.id,
            entry : 'Successfully Registered'
        });
        db.logs.save(log, next);
    };

    self.applyForMembership = function(args, next) {
        var regResult = new RegResult();
        var app = new Application(args);

        // do something interesting
        // validate inputs
        validateInputs(app);

        if(app.status === 'validated') {
            // check to see if email exists
            checkIfUserExists(app, function(err, exists){
                console.log(exists);
                assert.ok(err === null, err);
                if(!exists){
                    // create a new user
                    var user = new User(app);
                    user.status = 'approved';
                    user.signInCount = 1;

                    // hash the password
                    user.hashedPassword = bc.hashSync(app.password);

                    // save the user
                    saveUser(user, function(err, newUser){
                        assert.ok(err === null, err);
                        regResult.user = newUser;

                        // create a log entry
                        addLogEntry(newUser, function(err, newLog){
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

    };
};

module.exports =  Registration;