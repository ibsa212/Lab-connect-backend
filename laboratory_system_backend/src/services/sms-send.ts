import axios from 'axios'

export const sendSMS = (phone: String, msg: String) => {
    axios({
        url: process.env.SMS_URL,
        method: "POST",
        data: {
            'msg': msg,
            'phone': phone,
            'token': process.env.SMS_TOKEN
        }
    })
        .then(response => {
            console.log(response.data.url)
        })
        .catch(error => {
            console.log(error)
        })
}