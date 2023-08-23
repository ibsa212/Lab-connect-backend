import supertest from 'supertest'
import app from '../../src/app'
import { connect, closeDatabase } from '../setupdb'

const request = supertest(app)

jest.setTimeout(3000)

beforeAll(async () => {
  await connect()
})

afterAll(async () => {
  await closeDatabase()
})

describe('User routes: unauthorized person should not be granted user access', () => {

  test('an unauthorized person can not access "/users" route', async () => {
    const res = await request.get('/v1/users')
    expect(res.body).toEqual({ message: 'Not authorized' })
    expect(res.status).toEqual(401)
  })

  test('an unauthorized person can not access "/me" route', async () => {
    const res = await request.get('/v1/users/me')
    expect(res.body).toEqual({ message: 'Not authorized' })
    expect(res.status).toEqual(401)
  })

  test('an unauthorized person can not access "/users/:id" route', async () => {
    const res = await request.get('/v1/users/123')
    expect(res.body).toEqual({ message: 'Not authorized' })
    expect(res.status).toEqual(401)
  })

})

// when adding user to database test is added 
// describe('User routes: authorized person should be granted user access', () => {
  
//   test('an authorized person can access "/users" route', async () => {
//     const res = await request.get('/v1/users').set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
//     expect(res.status).toEqual(200)
//   })

//   test('an authorized person can access "/me" route', async () => {
//     const res = await request.get('/v1/users/me').set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
//     expect(res.status).toEqual(200)
//   })

//   test('an authorized person can access "/users/:id" route', async () => {
//     const res = await request.get('/v1/users/123').set('Authorization', `Bearer ${process.env.TEST_TOKEN}`)
//     expect(res.status).toEqual(200)
//   })

// })
