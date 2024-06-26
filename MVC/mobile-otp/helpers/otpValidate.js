const otpTimeout = async (otpTime) => {
    try {

        console.log("Milliseconds is: " + otpTime);
        //converting ms to min
        const cDateTime = new Date();
        var differencevalue = (otpTime - cDateTime.getTime()) / 1000;
        differencevalue /= 60;

        const minutes = Math.abs(differencevalue); // time minutes expired

        console.log('Expired Minutes: ' + minutes);

        if (minutes > 5) {
            return true;
        }

        return false;

    }
    catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    otpTimeout
}

// expired otp 679646