import nodemailer from "nodemailer"

const mailSender = async (email, title, body) => {
    try{
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        })

        let info = await transporter.sendMail(
            {
                from : `StudyNotion `,
                to : `${email}`,
                subject: `${title}`,
                html: `${body}`
            }
        )

        console.log(info);
        return info
    }catch(error){
        console.log("error in sending mail", error)
    }
}

export {mailSender}