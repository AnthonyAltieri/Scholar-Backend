/**
 * Created by bharatbatra on 11/6/16.
 */
import mongoose from 'mongoose';
import SchoolSchema from '../schemas/School';
const School = mongoose.model('Schools', SchoolSchema);
import db from '../db';


async function findByName(name){
    console.log("Find schoole  by name" + name);

    try {
        const school = await db.findOne({name : name}, School);

        if (!!school){
            return school;
        }
        else {
            console.log("No school found by the given name");
            return null;
        }
    }
    catch (error) {
        console.log("Error in the school findByName");
        console.log(error);
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