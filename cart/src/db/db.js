const mongoose = require('mongoose');

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to Database successfully");
    } catch (error) {
        console.error("Error connecting to Database:", error);
    }
}

module.exports = connectToDB;