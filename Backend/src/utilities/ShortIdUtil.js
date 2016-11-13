/**
 * Created by bharatbatra on 11/13/16.
 */
const shortId = require('shortid');

function generateShortId(){
    return shortId.generate();
}

const ShortIdUtil = {
    generateShortId
};

export default ShortIdUtil;