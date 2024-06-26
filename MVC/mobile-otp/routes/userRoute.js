require('dotenv').config();
const express = require('express');
const router = express();
router.use(express.json());

// register and email auth api
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        //check for image type
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, path.join(__dirname, '../public/images'));
        }

    },
    filename: (req, file, cb) => {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter

});

const userController = require('../controllers/userController');
const { registerValidator, sendMailVerificationValidator } = require('../helpers/validation'); //calling register validation from helper 

// calling method of usercontroller otp api
router.post('/send-otp', userController.sendOtp); //router and controller
router.post('/verify-otp', userController.verifyOtp); //verification route
router.post('/register', upload.single('image'), registerValidator, userController.userRegister); //
router.post('/send-mail-verification', sendMailVerificationValidator, userController.sendMailVerification); //verification route
module.exports = router;
