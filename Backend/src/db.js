/**
 * @author: Anthony Altieri
 */

import { v1 } from 'node-uuid';
const SALT = '620';

const db = {
  findById,
  findAll,
  findOne,
  create,
  save,
  remove,
  generate,
  find
};

export default db;

function findById(id, model) {
  return new Promise((resolve, reject) => {
    findOne({ id }, model)
      .then((model) => { resolve(model) })
      .catch((error) => { reject(err) })
  });
}

/*
Attributes represents the query part of a mongoose query
eg. {name: 'john'}
 */
function find(attributes, model){
  return new Promise( (resolve, reject) => {
    model.find(attributes, (err, found) => {
      if (err) {
        reject(err);
        return
      }

      if ( !found ) {
        reject("Not Found");
      }

      resolve(found);
    })
  })
}

function findOne(attributes, model) {
  return new Promise( (resolve, reject) => {
    model.findOne(attributes, (err, found) => {
      if (err) {
        reject(err);
        return
      }

      if ( !found ) {
        reject("Not Found");
      }

      resolve(found);
    })
  })
}

function create(attributes, model) {
  return new Promise( (resolve, reject) => {
    const focus = new model({
      ...attributes,
      id: v1() + SALT,
      created: new Date()
    });
    focus.save(error => {
      if (error) {
        reject(error);
        return
      }
      resolve(focus);
    })
  })
}

function save(instance) {
  return new Promise( (resolve, reject) => {
    instance.save(error => {
      if (error) {
        reject(error);
        return
      }

      resolve(instance)
    })
  })
}

function remove(id, model) {
  return new Promise( (resolve, reject) => {
    model.findByIdAndRemove(id, (err, removed) => {
      if (err) {
        reject(err);
        return
      }

      resolve(removed)
    })
  })
}

function findAll(model) {
  return new Promise( (resolve, reject) => {
    model.find({}, (err, models) => {
      if (err) {
        reject(err);
        return
      }

      resolve(models)
    })
  })
}

function generate(attributes, model) {
  return new model(attributes)
}


