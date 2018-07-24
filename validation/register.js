const Validator = require('validator');
const isEmpty = require('./is-empty');
module.exports = function validateRegisterInput(data) {
    let errors = {};

    data.name = !isEmpty(data.name) ? data.name : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.confirm_password = !isEmpty(data.confirm_password) ? data.confirm_password : '';

    if (!Validator.isLength(data.name, { min: 5, max: 30 })) {
        errors.name = 'Name must be between 5 and 30 characters'
    }
    if (!Validator.isLength(data.password, { min: 5, max: 30 })) {
        errors.password = 'Password must be at least 5 characters'
    }
    if (!Validator.isLength(data.confirm_password, { min: 5, max: 30 })) {
        errors.confirm_password = 'Confirm password must be at least 5 characters'
    }
    if (Validator.isEmpty(data.name)) {
        errors.name = 'Name field is required'
    }
    if (Validator.isEmpty(data.email)) {
        errors.email = 'Email field is required'
    }
    if (!Validator.isEmail(data.email)) {
        errors.email = 'Invalid email address'
    }
    if (Validator.isEmpty(data.password)) {
        errors.password = 'Password field is required'
    }
    if (Validator.isEmpty(data.confirm_password)) {
        errors.confirm_password = 'Confirm password field is required'
    }
    if (!Validator.equals(data.password, data.confirm_password)) {
        errors.confirm_password = 'Passwords must match'
    }
    
    return{
        errors,
        isValid: isEmpty(errors)
    }
}