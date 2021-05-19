const express = require('express')
const router = express.Router()
const path = require('path')
const snmp = require ("net-snmp");

//conexion snmp
const session = snmp.createSession ("192.168.1.189", "public");

//oid del uso de memoria y cpu
const cabeceraOID = ['1.3.6.1.4.1.2021.4.11.0', '1.3.6.1.4.1.2021.4.5.0', '1.3.6.1.4.1.2021.11.11.0'];

//variables de la cabecera
var cpu;
var memoria;
var mibs = [];
mibs[0] = require('../mib/RFC1213-MIB.json');
mibs[1] = require('../mib/BRIDGE-MIB.json');
mibs[2] = require('../mib/RMON-MIB.json');
var nombres = [];
nombres[0] = 'MIB-2';
nombres[1] = 'BRIDGE';
nombres[2] = 'RMON-MIB';
 
session.get (cabeceraOID, callbackGet);

//Funcion de respuesta get de snmp
function callbackGet(error, varbinds){
    if (error) {
        console.error (error);
    } else {
        cpu = varbinds[2];
        memoria = varbinds;
        for (var i = 0; i < varbinds.length; i++) {
            if (snmp.isVarbindError (varbinds[i])) {
                //console.error (snmp.varbindError (varbinds[i]));
            } else {
                //console.log (varbinds[i].oid + " = " + varbinds[i].value);
            }
        }
    }
}
//respuesta a la peticion http
function respuesta(req, res){

    session.get (cabeceraOID, callbackGet);

    res.render('index.html', {memoria, cpu, mibs, nombres})
}

//a la espera en la url /
router.get('/', respuesta)

module.exports = router;