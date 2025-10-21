require('dotenv').config();
const app = require('./src/app');
const connectToDB = require('./src/db/db');


connectToDB();

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});