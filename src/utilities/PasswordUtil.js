/**
 * Created by bharatbatra on 11/8/16.
 */
import md5 from '../../node_modules/blueimp-md5/js/md5.js'
const SALT = '620';

function encryptPassword(password, email){
    return md5(password, null, true) + email + SALT;
}

const PasswordUtil = {
    encryptPassword : encryptPassword
};

export default  PasswordUtil;