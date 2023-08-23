import nodeMailer from 'nodemailer'
import logger from '../common/logger'

const transporter = nodeMailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
})

export const sendMail = async (credentials: any) => {
  try {
    let info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: credentials.to,
      subject: credentials.intent,
      html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Lab Connect</a>
                </div>
                <p style="font-size:1.1em">Hi, ${credentials.to}</p>
                <h4>Hi there, this in regards to ${credentials.intent} </h4>
                <p>Thank you for choosing Lab Connect, before your start tracking your current tests, please use the following Code to complete your ${credentials.proc} procedure. <strong> ${credentials.extra} </strong></p>
                <h4 style="background: #00466a;margin: 0 auto;width: max-content;padding: 10px 30px;color: #fff;border-radius: 4px;">
                <h3> <strong>${credentials.link}</strong> </h3>
                </h4>
                <p style="font-size:0.9em;">Regards,<br />Lab Connect</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                <p>Lab Connect</p>
                <p>Addis Ababa</p>
                <p>Ethiopia</p>
                </div>
            </div>
        </div>`
    })
    return info
  } catch (error) {
    logger.error({ issue: 'email service down', error })
  }
}
