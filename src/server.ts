// Importing module
import express from 'express';
import dotenv from 'dotenv'
import {defaultRoute} from './routes/routes'
import bodyParser from 'body-parser';
  
const app = express();
dotenv.config();

//bodyparser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
  
// Handling GET / Request
app.get('/', (req, res) => {
    res.send('Welcome to typescript backend!');
})
app.use('/api/'+process.env.API_VER,defaultRoute);
  
// Server setup
app.listen(process.env.SERVER_PORT,() => {
    console.log('The application is listening on port http://localhost:'+process.env.SERVER_PORT);
})