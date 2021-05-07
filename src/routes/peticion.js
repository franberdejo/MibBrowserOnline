/*
    En este archivo se procesarán las peticiones llegadas desde la web

*/
const express = require('express')
const router = express.Router()
const path = require('path')
const snmp = require ("net-snmp");

//La community, en SNMPv1 no hace falta cambiarla a otra diferente a public
const comunidad = 'public';

//Las variables en las que guardaremos los datos recibidos en la petición AJAX
var ip,operacion,mib,oid;
//Respuesta del AJAX
var resultadoConsulta

//Funcion que recibe la respuesta get de snmp
function callbackGet(error, varbinds){
    if (error) {
        console.error (error);
        resultadoConsulta = error;
    } else {
        resultadoConsulta = varbinds;
        for (var i = 0; i < varbinds.length; i++) {
            if (snmp.isVarbindError (varbinds[i])) {
                console.error (snmp.varbindError (varbinds[i]));
            } else {
                console.log (varbinds[i].oid + " = " + varbinds[i].value);
            }
        }
    }
}

//Funcion que espera al resultado snmp para devolver la respuesta
function espera (res){
    res.json(resultadoConsulta);
    resultadoConsulta = null;
    //session.close();
}

//Funcion que responde a la peticion http AJAX
function respuesta(req, res){

    //Asignamos a nuestras variables locales los valores pasados como parámetros al hacer click en 'enviar'
    ip= req.query.ip;
    mib=req.query.mib;
    operacion=req.query.operacion;
    //Puede ser uno o varios en un array
    oid=[req.query.oid];
    console.log("Ip peticion: " + ip + "\nMIB peticion: " + mib+ "\nOperacion peticion: " + operacion+ "\nOID peticion: " + oid);

    session = snmp.createSession(ip, comunidad);
    if(session){
        //Tratamos de establecer la sesión SNMP con el equipo con la IP pasada como argumento.
        session.get (oid, callbackGet);
    }else{
        resultadoConsulta = "No se ha podido establecer la conexion con el host";
    }
    //esperamos a que nos devuelva los datos de snmp antes de responder
    setTimeout(espera.bind(null, res), 1000);
}

//A la escucha en la url /peticion
router.get('/peticion', respuesta)

module.exports = router;