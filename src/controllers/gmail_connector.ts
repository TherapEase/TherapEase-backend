import nodemailer from 'nodemailer'
import { google } from 'googleapis'
import dotenv from 'dotenv'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { gmail } from 'googleapis/build/src/apis/gmail'
const OAuth2 = google.auth.OAuth2

async function setup_transporter() {
    const oauth2_client= new OAuth2(
        process.env.client_id,
        process.env.client_secret,
        process.env.redirect_uris[0]
    )

    oauth2_client.setCredentials({
        refresh_token:process.env.refresh_token
    })

    const accessToken = await new Promise((resolve,reject)=>{
        oauth2_client.getAccessToken((err,token)=>{
            if (err) reject(err)
            resolve(token)
        })
    })

    const node_transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            type: "OAuth2",
            user: process.env.email_address,
            accessToken,
            clientId:process.env.client_id,
            clientSecret:process.env.client_secret,
            refreshToken:process.env.refresh_token
        }
    } as SMTPTransport.Options)

    return node_transporter
}
export async function sendEmailViaGmail(oggetto:string, testo:string, destinatario: string, mittente:string) {
    let gmailTransporter = await setup_transporter()
    nodemailer.createTransport({
        
    })
    gmailTransporter.sendMail({
        from:mittente,
        to:destinatario,
        subject:oggetto,
        text:testo
    })
}