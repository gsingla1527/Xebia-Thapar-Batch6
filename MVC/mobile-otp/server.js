require("dotenv").config();
const express = require("express");
const app = express();

const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/bankingapp')
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error.message);
    });

app.use(express.json());

app.set('view engine', 'ejs'); //can also use pug
app.set('views', './views');

const port = process.env.SERVER_PORT | 3000; // custom port if any or 3000
//const port = 3000; // custom port if any or 3000

const userRoute = require('./routes/userRoute');

app.use('/api', userRoute);

const authRoute = require('./routes/authRoute');
//no /api as used in user route
app.use('/', authRoute);

app.listen(port, function () {
    console.log("server listen on port " + port);
});