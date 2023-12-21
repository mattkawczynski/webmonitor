const mail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const MailDev = require('maildev');
const UrlEntry = require('../models/urlEntry');
const logger = require('./logger');

mail.setApiKey(process.env.SENGRID_API_KEY);

let emailClient; 

if (process.env.NODE_ENV.trim() === 'development') {
    emailClient = nodemailer.createTransport({
        host: '0.0.0.0',
        port: 1025,
        secure: false,
        logger: true,
        debug: true,
        ignoreTLS: true,
    });
    const emailServer = new MailDev({
    });
    emailServer.listen();
}

const sendEmail = async (subject, body, urlEntryId) => {

    const urlEntry = await UrlEntry.findOne({ _id: urlEntryId });
    
    if(urlEntry != null) {
        const msg = {
            to: [process.env.EMAIL_RECIPIENTS],
            from: [process.env.EMAIL_FROM_ADDRESS],
            subject: subject,
            text: body,
        };
        if (process.env.NODE_ENV.trim() === 'development') {
            if (urlEntry.sendNotification == true) {
                emailClient.sendMail(msg, async(error) => {
                    if (error) {
                        logger.error(error);
                    } else {
                        await UrlEntry.findOneAndUpdate({_id: urlEntryId}, {lastNotificationDate: new Date, sendNotification: false  })
                        logger.info(`Updated lastNotificationDate to ${new Date} for id ${urlEntryId}`);
                        logger.info(`Succesfully sent e-mail to ${[process.env.EMAIL_RECIPIENTS]}`);
                    }
                });
            } else {
                logger.info(`The e-mail has been already sent. Not sending another e-mail until the resource health changes.`);
            }
        } else {
            // this flag is real ugly, will refactor
            if (process.env.USE_SENDGRID === 'false' ) {
                emailClient = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: process.env.EMAIL_PORT,
                    secure: true,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });
                emailClient.sendMail(msg, async(error) => {
                    if (error) {
                        logger.error(error);
                    } else {
                        await UrlEntry.findOneAndUpdate({_id: urlEntryId}, {lastNotificationDate: new Date, sendNotification: false  })
                        logger.info(`Updated lastNotificationDate to ${new Date} for id ${urlEntryId}`);
                        logger.info(`Succesfully sent e-mail to ${[process.env.EMAIL_RECIPIENTS]}`);
                    }
                });
            } else {
                if (urlEntry.sendNotification == true) {
                    mail.send(msg)
                    .then(async () => {
                        await UrlEntry.findOneAndUpdate({_id: urlEntryId}, {lastNotificationDate: new Date, sendNotification: false  })
                        logger.info(`Updated lastNotificationDate to ${new Date} for id ${urlEntryId}`);
                        logger.info(`Succesfully sent e-mail to ${to}`);
                    })
                    .catch((error) => logger.error(error));
                } else {
                    logger.info(`The e-mail has been already sent. Not sending another e-mail until the resource health changes.`);
                }
            }
            
        }
    }
    
}

module.exports = sendEmail;