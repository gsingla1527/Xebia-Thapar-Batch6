const { check } = require('express-validator');

exports.registerValidator = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots: true
    }),
    check('mobile', 'Mobile No. should be 10 digits').isLength({
        min: 10,
        max: 13
    }),
    check('password', 'Password must be greater than 6 characters, and contains at least one uppercase letter, one lowercase letter, and one number, and one special character')
        .isStrongPassword({
            minLength: 6,
            minUppercase: 1,
            minLowercase: 1,
            minNumbrs: 1,
            minSymbols: 1
        }),
    check('image').custom((value, { req }) => {
        //req.file as we are using {req}
        if (req.file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            return true;
        }
        else {
            return false;
        }
    }).withMessage("Please Upload an Image Jpeg, PNG")

];

exports.sendMailVerificationValidator = [
    check('email', 'Please include a valid email').isEmail().normalizeEmail({
        gmail_remove_dots: true
    }),
];