import { v1 } from 'node-uuid';

const SALT = '620';

const Entity = {
  _id: false,
  id: v1() + SALT,
  created: Time,
};

export default Entity;