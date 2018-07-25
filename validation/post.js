const Validator = require('validator');
const isEmpty = require('./is-empty');
module.exports = function validatePostInput(data) {
    let errors = {};

    data.text = !isEmpty(data.text) ? data.text : ''

    if (!Validator.isLength(data.text, {min: 2, max: 1000})) {
        errors.text = 'Post must be between 2 and 1000 character length'
    }

    if (Validator.isEmpty(data.text)) {
        errors.text = 'Text field is required'
    }
    
    return{
        errors,
        isValid: isEmpty(errors)
    }
}