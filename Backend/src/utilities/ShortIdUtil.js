/**
 * Created by bharatbatra on 11/13/16.
 */
const shortId = require('shortid');
var Chance = require('chance');


function generateShortId(){
    return shortId.generate();
}

function generateShortIdLength(length){
    try {
        return (generateShortId().substr(0, length));
    }
    catch (e) {
        console.error("[ERROR] in ShortIdUtil > generateShortIdLength : " + e)
    }
}

// pool = string with all characters from which this string can be generated eg 'ABCDEFGHUJKLMNOPQRSTUVWXYZ1234567890'
// length = integer
function generateShortIdWithRequirements(length, pool) {
    const chance = new Chance();
    return chance.string({
        length : length,
        pool : pool
    })
}

const ShortIdUtil = {
    generateShortId,
    generateShortIdLength,
    generateShortIdWithRequirements
};

export default ShortIdUtil;