const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();


const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res)=>{
    res.send('403 - Direct Access Denied...')
})

app.listen(port, () => {
    console.log('Server is ready...');
})