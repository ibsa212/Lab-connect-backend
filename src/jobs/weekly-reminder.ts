import cron from 'node-cron'
import User from '../resources/users/model'
import dataAccessLayer from '../common/dal'
import { sendMail } from '../services/mail'
import { CustomError } from '../middlewares/utils/errorModel'

let UserDAL = dataAccessLayer(User)

export default cron.schedule('0 0 18 * * 6', () => {
  console.log('---------------------------------------')
  console.log('reminding all patients of tests, saturday at 6:00pm')
  console.log('---------------------------------------')

  const filter = { isActive: true }
  UserDAL.getMany(filter)
    .then((data: any) => {
      if (data.length == 0) {
        throw new CustomError('No User Found', 404)
      }

      data.forEach((user: any) => {
        let credential = {
          to: user.email,
          subject: 'Reminder: You have pending tests',
          intent: 'reminder',
          html: `<p>a list of your active tests and their status is as follows<a href="${user.tests}</a></p>`
        }

        sendMail(credential)
      })
    })
    .catch((err: any) => {
      new CustomError(err)
    })
})
