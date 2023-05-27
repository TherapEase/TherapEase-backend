// Importing module
import express from 'express';
import dotenv from 'dotenv'
import {defaultRoute} from './routes/routes'
import bodyParser from 'body-parser';
import cors from 'cors'
import { blacklist_cleaner } from './controllers/controller_logout';
import scheduler from 'node-schedule'

  
export const app = express();
dotenv.config();
//cors

app.use(cors())

//json and urlencoded requests
app.use(express.json());
app.use(express.urlencoded({extended:true}))

//bodyparser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
  
// Handling GET / Request

app.use('/api/'+process.env.API_VER,defaultRoute);

const clean_tokens = new scheduler.RecurrenceRule()
clean_tokens.hour=0
clean_tokens.minute=0
//pulisce la blacklist con i token invalidati ogni giorno
const job = scheduler.scheduleJob(clean_tokens,async function(){
    await blacklist_cleaner()
    console.log("Blacklist cleaned")
})

// Server setup
app.listen(process.env.SERVER_PORT,() => {
    console.log('The application is listening on port http://localhost:'+process.env.SERVER_PORT);
})

