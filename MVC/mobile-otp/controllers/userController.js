require('dotenv').config();
const OtpModel = require('../models/otp');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const { validationResult } = require('express-validator');

const mailer = require('../helpers/mailer'); // mailer method

const userRegister = async (req, res) => {
    //when this controller method used, we will call validationResult and pass the req

    try {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Errors',
                errors: errors.array()
            });
        }
        const { name, email, mobile, password } = req.body;

        const userExist = await User.findOne({ email });

        if (userExist) {
            console.log('User email already exists!');
            return res.status(400).json({
                success: false,
                msg: 'User Email Already Exist!'
            });
        }



        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name, //key value same variable
            email,
            mobile,
            password: hashPassword,
            image: req.file ? 'images/' + req.file.filename : null

        });

        const userData = await user.save();
        //once user gets saved 
        // can use url from env also
        //a href = local address for now change accordingly
        const msg = '<p> Hi, ' + name + ', Please <a href="http://127.0.0.1:3000/mail-verification?id='+userData._id+'">Verify</a> your mail. <p>';
        //calling mailer after successful registeration, sendMail(email, subject, message)
        mailer.sendMail(email, 'Email Verification for xyz Bank', msg);
        console.log('User Registered Successfully!');
        return res.status(200).json({
            success: true,
            msg: 'Registered Successfully!',
            user: userData
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
}

// mail verification called in authroute.js
const mailVerification = async (req, res) => {
    try {
        //query parameter not set
        if (req.query.id == undefined) {
            return res.render('404');
        }
        const userData = await User.findOne({ _id: req.query.id });

        if (userData) {

            if (userData.is_verified == 1) {
                return res.render('mail-verification', { message: 'Your mail is verified Successfully!' });
            }
            await User.findByIdAndUpdate({ _id: req.query.id }, {
                $set: {
                    is_verified: 1
                }
            });
            return res.render('mail-verification', { message: 'Mail has been verified Successfully!' });
        }
        else {
            return res.render('mail-verification', { message: 'User not found' });
        }

    } catch (error) {
        console.log(error.mesage);
        return res.render('404');
    }
}

const sendMailVerification = async(req, res) => {
    try{
       const errors = validationResult(req);
       if(!errors.isEmpty()){
        return res.status(400).json({
            success: false,
            msg: 'Errors', 
            errors: errors.array()
        });
       }

       const { email } = req.body;
       const userData =await User.findOne({email});

       if(!userData){
        return res.status(400).json({
            success:false,
            msg: "Email doesn't exists!"
        });
       }

       if(userData.is_verified == 1){
        return res.status(400).json({
            success:false,
            msg: userData.email+" is already verified!"
        });
       }

       const msg = '<p> Hi, ' + userData.name + ', Please <a href="http://127.0.0.1:3000/mail-verification?id='+userData._id+'">Verify</a> your mail. <p>';

        //calling mailer after successful registeration, sendMail(email, subject, message)
        mailer.sendMail(userData.email, 'Email Verification for xyz Bank', msg);

        console.log('User Registered Successfully!');

        return res.status(200).json({
            success: true,
            msg: 'Verification link sent to your mail.',
        });


    }catch(error){
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
}



// requiring helper method
const { otpTimeout } = require('../helpers/otpValidate');
const otpGenerator = require('otp-generator');
//const twilio = require('twilio');
//const otp = require('../models/otp');

//const accountSid = ""; // security purpose

//const authToken = "";


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const twilioClient = require('twilio')(accountSid, authToken);


const sendOtp = async (req, res) => {
    try {

        const { phoneNumber } = req.body;


        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false
        }); // used otp-generator

        const cDate = new Date(); //current date

        //Method to create and update so value remains unique in db

        await OtpModel.findOneAndUpdate(
            //{phoneNumber: phoneNumber}, //same name change accordingly
            { phoneNumber }, // key value same
            { otp, otpExpiration: new Date(cDate.getTime()) },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        //twilio implementation 
        //await use as promise return

        await twilioClient.messages.create({
            body: `Your OTP is: ${otp}`,
            to: phoneNumber, //client 
            from: process.env.TWILIO_PHONE_NUMBER
        });
        console.log('OTP Sent!')
        return res.status(200).json({
            success: true,
            msg: 'OTP Sent Successfully! ' + otp
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        //finding otp in db
        const otpData = await OtpModel.findOne({
            phoneNumber,
            otp
        });

        if (!otpData) {
            console.log('Wrong OTP');
            return res.status(400).json({
                success: false,
                msg: "You entered wrong OTP!",
                //console.log('wrong otp')
            });
        }
        //time stored in database to check expiration
        const isOtpExpired = await otpTimeout(otpData.otpExpiration);

        if (isOtpExpired) {
            console.log('OTP Expired');
            return res.status(400).json({
                success: false,
                msg: 'Your OTP has been expired!'
            });
        }
        console.log('Correct OTP');
        return res.status(200).json({

            success: true,
            msg: 'OTP verified Successfully!'
        });

    }

    catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
}



module.exports = {
    userRegister,
    mailVerification,
    sendMailVerification,
    sendOtp,
    verifyOtp
}