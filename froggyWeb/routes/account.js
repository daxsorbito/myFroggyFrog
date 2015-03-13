var express = require('express');
var router = express.Router();
var passport = require('passport');
var Membership = require('membership');


router.route('/login')
    .post(passport.authenticate('local', {
        successRedirect : '/',
        failureRedirect : '/',
        failureFlash : true
        }
    )
);

router.route('/register')
    .post(function(request, response){
        var mem = new Membership('membership');
        mem.register(request.body.username, request.body.password, request.body.confirm, function(err, result){
            console.log(result);
            response.render('index', { title: 'Express' , user: result.user.email, err: request.flash('error')});
        });
    });


module.exports = router;