import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

/**
 * 
 * Questa funzione effettua l'accesso alle api google usando username ed "app password"
 * 
 */

async function setup_transporter() {
    const node_transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user: process.env.email_address,
            pass: process.env.gmail_password
        }
    } as SMTPTransport.Options)

    return node_transporter
}

export async function send_mail(oggetto:string, testo:string, destinatario: string) {
    try {
        let gmailTransporter = await setup_transporter()
        await gmailTransporter.sendMail({
            from:process.env.email_address,
            to:destinatario,
            subject:oggetto,
            text:testo
        })
        return true    
    } catch (error) {
        return false
    }
    
}