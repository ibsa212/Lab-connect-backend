import { Request, Response, NextFunction } from 'express'
import dataAccessLayer from '../../common/dal'
import { CustomError } from '../../middlewares/utils/errorModel'
import Facility from '../facility/model'
import User from '../users/model'
import FacilityTests from '../facility-tests/model'
import InvestigativeRequest from '../investigativeRequest/model'
import  Address  from '../address/model'
import {ObjectId} from 'mongodb';

const FacilityTestDal = dataAccessLayer(FacilityTests )
const FacilityDal = dataAccessLayer(Facility)
const UserDal = dataAccessLayer(User)
const InvestigativeRequestDal = dataAccessLayer(InvestigativeRequest)
const AddressDal = dataAccessLayer(Address)

const getAllStats = (req: Request, res: Response, next: NextFunction) => {
// it is not yet finished
}

const getDistanceFromFacilities = async (req: Request, res: Response, next: NextFunction) =>{
  const pip = [
    {   
      $geoNear: {
         near: { type: "Point", coordinates: [ -73.98142 , 40.71782 ] },
         key: "coords",
         distanceField: "dist.calculated" 
      }
    }
 ]
  
  const result = await AddressDal.aggregatedQuery(pip)
  console.log(result)
  res.status(200).json(result)
 

}


  const getStats = async (req: Request, res: Response, next: NextFunction) => {
    const personId = new ObjectId(req.params.id)
    const user = await UserDal.getOne({_id : req.params.id})
    const institutionId = new Object(user.institution)
   

  // Doctor Pipelines
  const totalTestsaDoctorOrdered = [
    { $match: { requestedBy:  personId }  },
    { $count: "totalTestsaDoctorOrdered"  }
  ]; 
  
  const pendingTestsForDoctor = [
    { $match: { requestedBy: personId  ,
                status: "SAMPLED"  }},
  
    { $count: "pendingTestsForDoctor"  }
  ];
  
  const numberOfPeopleaDoctorOrderedTo = [
  { $match: {requestedBy:  personId }  },
  { $group: { _id: "$patient" } },
  {$count: "numberOfPeopleaDoctorOrderedTo"}
  ];
  
  const numberOfAllLabs = [
    { $group: { _id: "$facilityId", allAvailableLabs: { $sum: 1 } } }
  ];

  // Lab Technician Pipelines
  const numberOfAvailableTestsInALab = [
    { $match: { facilityId: institutionId }  },
    { $group: { _id: "$testId" } },
    {$count: "numberOfAvailableTestsInALab"}
  ];

  const numberOfTestDoneByFacility = [
    { $match: { facilityId: institutionId }  },
    {$count: "numberOfTestDoneByFacility"}
  ];

  const pendingTestsForThisLab = [
    { $match: { requestedTo: institutionId, status: "SAMPLED" } },
    {$count: "pendingTestsForThisLab"}
  ];

  const allPeopleWhoUseThisLab = [
  { $match: { requestedTo:  institutionId } },
  { $group: { _id: "$patient" } },
  {$count: "allPeopleWhoUseThisLab"}
  ];
  
  try{
    if (user.role == "Lab Technician"){
        let labTechnicianDashboardData = [numberOfAvailableTestsInALab, numberOfTestDoneByFacility, 
                                          pendingTestsForThisLab, allPeopleWhoUseThisLab]
        let result = await labTechnicianDataFetch(req, res, next, labTechnicianDashboardData)
        res.status(200).json(result)
    }
    else if (user.role =="Doctor"){
      let doctorsDashbordData = [totalTestsaDoctorOrdered, pendingTestsForDoctor, 
                                numberOfPeopleaDoctorOrderedTo, numberOfAllLabs]
      let result = await doctorDataFetch(req, res, next, doctorsDashbordData)
      res.status(200).json(result)
    }
  }
  catch(e){
    next(e)
  }

}

const pushResult = (data, result, key)=> {
  if (data.length > 0)
  result.push(data)
else{
  var obj = {}
  obj[key] = 0
  result.push([obj])
}
}

async function doctorDataFetch(req: Request, res: Response, next: NextFunction, doctorsDashbordData){
  try {
    let temp = []
    const names =  ["totalTestsaDoctorOrdered", "pendingTestsForDoctor", 
      "numberOfPeopleaDoctorOrderedTo", "numberOfAllLabs"]

      for(let i = 0; i < 3; i++) {
        let result = await InvestigativeRequestDal.aggregatedQuery(doctorsDashbordData[i])
        pushResult(result, temp, names[i]) 
      }

      let result2 = await FacilityDal.aggregatedQuery(doctorsDashbordData[3])
      pushResult(result2, temp, names[3])
      return temp

    } catch(e) {
      next(e)
    }
}

async function labTechnicianDataFetch(req, res, next, labTechnicianDashboardData){
  
  try {
    let temp = []
    const names = ["numberOfAvailableTestsInALab", "numberOfTestDoneByFacility", 
    "pendingTestsForThisLab", "allPeopleWhoUseThisLab"]
    
    for(let i = 0; i < 2; i++) {
      let result = await FacilityTestDal.aggregatedQuery(labTechnicianDashboardData[i]) 
      pushResult(result, temp, names[i])
        
    }
    for(let i = 2; i < 4; i++) {
      let result2 = await InvestigativeRequestDal.aggregatedQuery(labTechnicianDashboardData[i]) 
      pushResult(result2, temp, names[i])
    }
    return temp
  } catch (e) {
    next(e)
  }
}

export default {
    getStats,
    getAllStats,
    getDistanceFromFacilities
}