/**
 * Created by bharatbatra on 11/6/16.
 */
import mongoose from 'mongoose';
import SchoolSchema from '../schemas/School';
const School = mongoose.model('Schools', SchoolSchema);
import db from '../db';


async function findByName(name){
    try {
        return await db.findOne({ name }, School);
    } catch (e) {
        return null;
    }
}

async function findAll(){
    const schools = await db.findAll(School);
    console.log(schools);
    return schools;
}

const SchoolService = {
    findByName : findByName,
    findAll : findAll
};




export default SchoolService;