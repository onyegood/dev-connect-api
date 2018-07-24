const express = require('express');
const router = express.Router();
const passort = require('passport');
const mongoose = require('mongoose');

const validateProfileInput = require('../../validation/profile');

//Load profile model
const Profile = require('../../models/Profile');
//Load user model
const User = require('../../models/User');

//@route    GET api/profile/test
//@desc     Tests profile route
//@access   Public
router.get('/test', (req, res) => res.json({msg: 'Profile works'}));


//@route    GET api/profile/handle/:handle
//@desc     Get profile by handle
//@access   Public
router.get('/handle/:handle', (req, res) => {

    const errors = {};

    Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if (!profile) {
            errors.noprofile = 'there is no profile for this user';
            res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});



//@route    GET api/profile/user/:user_id
//@desc     Get profile by User ID
//@access   Public
router.get('/user/:user_id', (req, res) => {

    const errors = {};

    Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if (!profile) {
            errors.noprofile = 'there is no profile for this user';
            res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json({profile: 'There are no profile for this user'}));
});





//@route    GET api/profile
//@desc     Get current user profile
//@access   Private
router.get('/', passort.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if (!profile) {
            errors.noprofile = 'There is no profile for this user';
            return res.status(400).json(errors);
        }
        res.json(profile);
    })
    .then(err => {
        res.status(404).json({profile: 'There are no profile for this user'});
    })
});

//@route    Post api/profile
//@desc     Create and Update user profile
//@access   Private
router.post('/', passort.authenticate('jwt', {session: false}), 
(req, res) => {

    //import profile input validator
    const {errors, isValid} = validateProfileInput(req.body);

    //Check Validation
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }

    //Get fields
    const profileFields = {};
    profileFields.user = req.user.id; // Get current user information

    if (req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company; 
    if(req.body.website) profileFields.website = req.body.website; 
    if(req.body.location) profileFields.location = req.body.location; 
    if(req.body.status) profileFields.status = req.body.status; 
    if(req.body.bio) profileFields.bio = req.body.bio; 
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername; 
    //Skills - Split into array
    if(typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    } 
    //Social
    profileFields.social = {};
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram;
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
    
    Profile.findOne({ user: req.user.id })
    //Here I used this route for both Update and Create Operations
    .then(profile => {
        if (profile) {
            //Update
            Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            )
            .then(profile => res.json(profile));
        }else{
            //Create new profile

            //Check if handle exists
            Profile.findOne({ handle: profileFields.handle })
            .then(profile => {
                if (profile) {
                    errors.handle = 'That handle already exist!';
                    res.status(400).json(errors);
                }

                //Save user profile
                new Profile(profileFields).save().then(profile => res.json(profile));
            });
        }
    })
    
});

module.exports = router;