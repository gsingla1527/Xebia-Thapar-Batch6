const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        require: true
    },
    // set in date format and get in millisecond
    otpExpiration: {
        type: Date,
        default: Date.now,
        get: (otpExpiration) => otpExpiration.getTime(), //get in millisecond 
        set: (otpExpiration) => new Date(otpExpiration)
    }
});

module.exports = mongoose.model('Otp', otpSchema);