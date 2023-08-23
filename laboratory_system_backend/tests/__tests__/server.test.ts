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

describe('Test app.ts', () => {
  test('Health-check should be working', async () => {
    const res = await request.get('/')
    expect(res.body).toEqual({
      'health-check': 'OK: top level api working',
      user: 'anonymous'
    })
  })

  test('random url test should throw 404', async () => {
    const res = await request.get('/random')
    expect(res.status).toEqual(404)
  })

})
