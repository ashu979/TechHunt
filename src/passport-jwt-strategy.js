const passport = require("passport");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT= require("passport-jwt").ExtractJwt;

const User = require('../models/User');
const keys= require('./keys');


let opts ={
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken,
    SecertOrKey: keys.SecretOrKey  // we have not used this yet . 
}

passport.use(new JWTStrategy(opts, function(jwtPayload, done){
    User.findById(jwtPayload._id,function(err, user){
        if(err){
            console.log("error in finding user ");
            return ;
        }
        if(user){
            return done(null , user);
        }
    })
}));


module.exports= passport;