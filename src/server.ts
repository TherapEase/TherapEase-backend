// Importing module
import express from 'express';
import {defaultRoute} from './routes/routes'
import * as dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()
const app = express();

app.use(cors())

// // Handling GET / Request
// app.get('/', (req, res) => {
//     res.send('Welcome to typescript backend!');
// })

app.use('/api/'+process.env.API_VER,defaultRoute)

// Server setup
app.listen(process.env.SERVER_PORT,() => {
    console.log('The application is listening on port http://localhost:'+process.env.SERVER_PORT);
})