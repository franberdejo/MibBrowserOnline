/*
    En este archivo se procesarán las peticiones llegadas desde la web

*/
const express = require('express')
const router = express.Router()
const path = require('path')
const snmp = require ("net-snmp");

//La community, en SNMPv1 no hace falta cambiarla a otra diferente a public
const comunidad = 'public';
//La sesión que trataremos de establecer con el equipo con agente SNMP activo
var session = snmp.createSession('192.168.1.189',comunidad);


const cabeceraOID = ['1.3.6.1.4.1.2021.4.11.0', '1.3.6.1.4.1.2021.4.5.0', '1.3.6.1.4.1.2021.11.11.0'];

//Variables de prueba
var cpu;
var memoria;

//Las variables en las que guardaremos los datos recibidos en la petición AJAX
var ip,operacion,mib,oid;

session.get (cabeceraOID, callbackGet);


/*

*/
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

function respuesta(req, res){

    //Asignamos a nuestras variables locales los valores pasados como parámetros al hacer click en 'enviar'
    ip= req.query.ip;
    mib=req.query.mib;
    operacion=req.query.operacion;
    //Puede ser uno o varios en un array
    oid=req.query.oid;

    session = snmp.createSession(ip,comunidad);
    if(session){
    //Tratamos de establecer la sesión SNMP con el equipo con la IP pasada como argumento.
    session.get (oid, callbackGet);
    }


    res.json(memoria)
    console.log(req.query.mib);
}

//respuesta
router.get('/peticion', respuesta)

module.exports = router;