const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

//Post Model
const Post = require('../../models/Post');
//Profile Model
const Profile = require('../../models/Profile');
//User Model
const User = require('../../models/User');

//Post Input Validator
const validatePostInput = require('../../validation/post');

//@route    GET api/posts
//@desc     Get all posts
//@access   Public
router.get('/', (req, res) => {
    Post.find()
    .sort({ date: -1 }) //Sort by date
    .then(posts => { posts ? res.json(posts) : res.json({message: 'No posts yet', success: true}) })
    .catch(err => res.status(404).json({message: 'No posts', success: false}));
});

//@route    GET api/posts/:id
//@desc     Get post by ID
//@access   Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({message: 'No post found with that ID', success: false}));
});

//@route    POST api/posts
//@desc     Create new Post
//@access   Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const {errors, isValid} = validatePostInput(req.body);

    //Check Validation
    if (!isValid) {
        //If any errors, send 400 with errors object
        return res.status(400).json(errors);
    }
    const newPoat = new Post( {
        name: req.body.name,
        text: req.body.text,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPoat.save().then(post => res.json(post))
    .catch(err => res.status(400).json({message: 'Post was not successful'}))
});

//@route    DELETE api/posts/:id
//@desc     Delete post
//@access   Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id })
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            //Check for post owner
            if (post.user.toString() !== req.user.id) {
                return res.status(401).json({ message: 'User not authorized', success: false})
            }

            //Delete
            post.remove().then(() => res.json({message: 'Post deleted successfully', success: true}))
        })
        .catch(err => res.status(404).json({message: `No post with the id of ${req.params.id}`, success: false}));
    })
    .catch(err => res.status(404).json({message: 'No post found', success: false}));
});


//@route    POST api/posts/like/:id
//@desc     Like post
//@access   Private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id })
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            //Check if user have liked post once
            if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                return res.status(400).json({ message: 'You have already liked this post' })
            }

            //Add the user id to the likes array
            post.likes.unshift({ user: req.user.id });

            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json(err));
    })
    .catch(err => res.status(404).json({message: 'No like found', success: false}));
});

//@route    POST api/posts/unlike/:id
//@desc     Unlike post
//@access   Private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id })
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            //Check if user have liked post once
            if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                return res.status(400).json({ message: 'You have not yet liked this post' })
            }

            //Get Remove index
            const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

            //Remove/Splice out of the array
            post.likes.splice(removeIndex, 1);

            //Save
            post.save().then(post => res.json(post));

        })
        .catch(err => res.status(404).json(err));
    })
    .catch(err => res.status(404).json({message: 'No unlike found', success: false}));
});


//@route    POST api/posts/likepost/:id
//@desc     Like or Unlike Post
//@access   Private
router.post('/likepost/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id })
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            //Check if user have liked post once
            if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                //If user have liked post once. Then do remove like
                //Get Remove index
                const removeIndex = post.likes
                .map(item => item.user.toString())
                .indexOf(req.user.id);

                //Remove/Splice out of the array
                post.likes.splice(removeIndex, 1);

                //Save
                post.save().then(post => res.json(post));
            }else{
            
            //Add the user id to the likes array
            post.likes.unshift({ user: req.user.id });

            post.save().then(post => res.json(post));

            }

        })
        .catch(err => res.status(404).json(err));
    })
    .catch(err => res.status(404).json({message: 'No like found', success: false}));
});

//@route    POST api/posts/comment/:id
//@desc     Add comment to Post
//@access   Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    const {errors, isValid} = validatePostInput(req.body);

    //Check Validation
    if (!isValid) {
        //If any errors, send 400 with errors object
        return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
    .then(post => {
        const newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
        }

        //Add to comments array
        post.comments.unshift(newComment);

        //Save
        post.save().then(post => res.json(post));

    })
    .catch(err => res.status(404).json({ message: 'Post not found' }));
});

//@route    DELETE api/posts/comment/:id/:comment_id
//@desc     Delete comment from post
//@access   Private

router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Post.findById(req.params.id)
    .then(post => {

        if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0 ) {
            return res.status(404).json({ message: 'Comment does not exist' })
        }
        
        //Get Remove Index
        const removeIndex = post.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);

        //Remove/Splice comment out of comments array
        post.comments.splice(removeIndex, 1);

        //Save change
        post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ message: 'Post not found' }));
});










module.exports = router;