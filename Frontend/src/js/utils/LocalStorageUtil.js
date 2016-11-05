'use strict';
function readLocalStorage(name){
    return JSON.parse(localStorage.getItem(name));
}

function writeLocalStorage(name, value){
    localStorage.setItem(name, JSON.stringify(value));
}