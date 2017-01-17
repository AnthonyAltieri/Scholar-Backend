import { v1 } from 'node-uuid';

const SALT = '620';

const Entity = {
  // _id: false,
  id: {type : String, unique : true },
  created: {type : Date, index : -1},
};

export default Entity;