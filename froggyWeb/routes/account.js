var express = require('express');
var router = express.Router();
var passport = require('passport');

router.route('/login')
    .post(passport.authenticate('local', {
        successRedirect : '/',
        failureRedirect : '/',
        failureFlash : true
        }
    )
);

router.route('/register')
    .post(function(){

    });


module.exports = router;