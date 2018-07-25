const express = require('express');
const router = express.Router();
const passort = require('passport');
const mongoose = require('mongoose');

const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');


//Load profile model
const Profile = require('../../models/Profile');
//Load user model
const User = require('../../models/User');

//@route    GET api/profile/all
//@desc     Get all profiles
//@access   Public
router.get('/all', (req, res) => {

    const errors = {};

    Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
        if (!profiles) {
            errors.noprofile = 'there are no profiles';
            res.status(404).json(errors);
        }
        res.json(profiles);
    })
    .catch(err => res.status(404).json({message: 'there are no profiles'}));
});


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
    .catch(err => res.status(404).json({message: 'there is no profile for this user'}));
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
    .catch(err => res.status(404).json({message: 'There are no profile for this user'}));
});

//@route    GET api/profile
//@desc     Get current user profile
//@access   Private
router.get('/', passort.authenticate('jwt', { session: false }), (req, res) => {
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
    .catch(err => {
        res.status(404).json({message: 'There are no profile for this user'});
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


//@route    Post api/experience
//@desc     Add user experience
//@access   Private
router.post('/experience', passort.authenticate('jwt', { session:false }), (req, res) => {

        //import profile input validator
        const {errors, isValid} = validateExperienceInput(req.body);

        //Check Validation
        if (!isValid) {
            // Return any errors with 400 status
            return res.status(400).json(errors);
        }

    Profile.findOne({ user: req.user.id })
    .then(profile => {
        const newExp = {
            title: req.body.title,
            company: req.body.company,
            location: req.body.location,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        }

        //Add to experience array
        profile.experience.unshift(newExp);
        profile.save().then(profile => res.json(profile));
    })
});


//@route    Post api/education
//@desc     Add user education
//@access   Private
router.post('/education', passort.authenticate('jwt', { session:false }), (req, res) => {

    //import profile input validator
    const {errors, isValid} = validateEducationInput(req.body);

    //Check Validation
    if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
    .then(profile => {
        const newEdu = {
            school: req.body.school,
            degree: req.body.degree,
            fieldofstudy: req.body.fieldofstudy,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        }

        //Add to education array
        profile.education.unshift(newEdu);
        profile.save().then(profile => res.json(profile));
    });
});


//@route    Delete api/experience/exp_id
//@desc     Delete experience from profile
//@access   Private
router.delete('/experience/:exp_id', passort.authenticate('jwt', { session:false }), (req, res) => {

    Profile.findOne({ user: req.user.id })
    .then(profile => {
        //Get index to be removed
        const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);
        
        //Splice/Remove index out of the array
        profile.experience.splice(removeIndex, 1);

        //Save change
        profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});


//@route    Delete api/education/edu_id
//@desc     Delete education from profile
//@access   Private
router.delete('/education/:edu_id', passort.authenticate('jwt', { session:false }), (req, res) => {

    Profile.findOne({ user: req.user.id })
    .then(profile => {
        //Get index to be removed
        const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);
        
        //Splice/Remove index out of the array
        profile.education.splice(removeIndex, 1);

        //Save change
        profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err));
});


//@route    Delete api/profile
//@desc     Delete user and profile
//@access   Private
router.delete('/', passort.authenticate('jwt', { session:false }), (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(profile => { //Delete user profile
        User.findOneAndRemove({ _id: req.user.id }).then(() => res.json({ message: 'User was deleted successfully', success: true })) //Delete user
        .catch(err => res.status(404).json(err)); //Delete user error check
    })
    .catch(err => res.status(404).json(err)); //Delete user profile error check
});

module.exports = router;