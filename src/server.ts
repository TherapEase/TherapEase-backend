// Importing module
import express from 'express';
import {defaultRoute} from './routes/routes'
import dotenv from 'dotenv'


const app = express();
const PORT:Number=3000;

// // Handling GET / Request
// app.get('/', (req, res) => {
//     res.send('Welcome to typescript backend!');
// })

app.use('/api/v1',defaultRoute)

// Server setup
app.listen(PORT,() => {
    console.log('The application is listening '
          + 'on port http://localhost:'+PORT);
})