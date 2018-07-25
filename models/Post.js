const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Post Schema
const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    text: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    avatar: {
        type: String
    },
    likes:[
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            }
        }
    ],
    comments:[
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            text: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            },
            name: {
                type: String
            },
            avatar: {
                type: String
            },
            replys:[
                {
                    user: {
                        type: Schema.Types.ObjectId,
                        ref: 'users'
                    },
                    text: {
                        type: String,
                        required: true
                    },
                    date: {
                        type: Date,
                        default: Date.now
                    },
                    name: {
                        type: String
                    },
                    avatar: {
                        type: String
                    }
                }
            ],
            likes:[
                {
                    user: {
                        type: Schema.Types.ObjectId,
                        ref: 'users'
                    }
                }
            ]
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Post = mongoose.model('post', PostSchema);