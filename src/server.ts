// Importing module
import express from 'express';
import dotenv from 'dotenv'
import {defaultRoute} from './routes/routes'
  
const app = express();
dotenv.config();
  
// Handling GET / Request
app.get('/', (req, res) => {
    res.send('Welcome to typescript backend!');
})
app.use('/api/'+process.env.API_VER,defaultRoute);
  
// Server setup
app.listen(process.env.SERVER_PORT,() => {
    console.log('The application is listening on port http://localhost:'+process.env.SERVER_PORT);
})