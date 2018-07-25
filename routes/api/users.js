const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
//Load Register Validator
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

//Get Secreat Key
const keys = require('../../config/keys');

//Load User Module
const User = require('../../models/User');

//@route    GET api/users/test
//@desc     Tests users route
//@access   Public
router.get('/all', passport.authenticate('jwt', { session: false }), (req, res) => {
    
    const errors = {};

    User.find()
    .then(users => {
        if (!users) {
            errors.noprofile = 'there are no users';
            res.status(404).json(errors);
        }
        res.json(users);
    })
    .catch(err => res.status(404).json({message: 'there are no users'}));
});

//@route    GET api/users/register
//@desc     Register user route
//@access   Public
router.post('/register', (req, res) => {

    //Deconstructe register validator
    const {errors, isValid} = validateRegisterInput(req.body);

    //Chack validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email })
    .then(user => {
        if (user) {
            errors.email = 'Email already exists';
            return res.status(400).json(errors);
        }else{
            const avatar = gravatar.url(req.body.email, {
                s: '200', //Size
                r: 'pg', //Rating
                d: 'mm' //Default
            });
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password
            });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash
                    newUser.save()
                    .then(user => res.json(user))
                    .catch(err => console.log(err));
                })
            });
        }
    });
});

//@route    GET api/users/login
//@desc     Login user route
//@access   Public
router.post('/login', (req, res) => {

    //Deconstructe register validator
    const {errors, isValid} = validateLoginInput(req.body);

    //Chack validation
    if (!isValid) {
        return res.status(400).json(errors); 
     }

    const email = req.body.email;
    const password = req.body.password; 

    // Find user by email
    User.findOne({email})
    .then(user => {
        // Check for user
        if (!user) {
            errors.email = 'User not found';
            //errors.password = 'Password incorrect'
            return res.status(404).json(errors);
        }
        //Check Password
        bcrypt.compare(password, user.password)
        .then(isMatch => {
            if (isMatch) {
                //User Matched
                //res.json({msg: 'Success'});
                
                //User Payload
                const payload = { 
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar
                }

                //Sign Token
                jwt.sign(
                    payload, 
                    keys.secretOrKey, 
                    { expiresIn: 3600 }, 
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token
                        });
                });
            }else{
                return res.status(400).json({ message: 'Password incorrect', success: false});
            }
        })
    });
});

//@route    GET api/users/current
//@desc     Return current user
//@access   Private

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar
    });
});



module.exports = router;