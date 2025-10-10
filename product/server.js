require('dotenv').config();
const app = require('./src/app');
const connectTODB = require('./src/db/db');

connectTODB();

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});