import supertest from 'supertest'
import app from '../../src/app'
import { connect, closeDatabase } from '../setupdb'

let facilityId = null

const request = supertest(app)

jest.setTimeout(3000)

beforeAll(async () => {
  await connect()
})

afterAll(async () => {
  await closeDatabase()
})

describe('Test Facilities route', () => {

  test('an unauthorized person can access list of all facility array', async () => {
    const res = await request.get('/v1/facilities')
    // facilityId = res.body[0]._id
    console.log(res.body)
    expect(res.status).toEqual(200)
    expect(res.body).toBeInstanceOf(Array)
  })

//   this will be enabled when more tests are added to create a facility
//   test('an unauthorized person can access a facility by id', async () => {
//     const res = await request.get(`/v1/facilities/${facilityId}`)
//     console.log(res.body)
//     expect(res.status).toEqual(200)
//     expect(res.body).toBeInstanceOf(JSON)
//   })

})
