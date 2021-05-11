/*
    En este archivo se procesarán las peticiones llegadas desde la web

*/
const express = require('express');
const router = express.Router();
const path = require('path');
const snmp = require ("net-snmp");

//cargamos mib
const mib2 = require('../mib/RFC1213-MIB.json');

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
                console.log(varbinds[i].type);
                console.log (resultadoConsulta[i].oid + " = " + resultadoConsulta[i].value.toString('utf8'));
            }
        }
    }
}
/*
    PETICIONES GET
*/
function getOID(mib, oid){
    //comprobamos que la mib no es la de por defecto para no parsear el oid ya que no hace falta
    if(mib != 4)
        oid = [mib[oid].oid+'.0']; //por ahora no hace falta introducir .0 en la web por facilidad

    session.get (oid, callbackGet);
}
/*
    Autoexplicativo, realiza un getNext al oid u oids pasados como argumento en la consulta
*/
function getNext(mib, oid){
    if(mib != 4)
    oid = [mib[oid].oid+'.0']; //por ahora no hace falta introducir .0 en la web por facilidad
    session.getNext (oid, function (error, varbinds) {
        if (error) {
            console.error (error.toString ());
            resultadoConsulta = error;
        } else {
            resultadoConsulta = varbinds;
            for (var i = 0; i < varbinds.length; i++) {
                console.log (resultadoConsulta[i].oid + "|" + resultadoConsulta[i].value.toString('utf8'));
            }
        }
    });
}

function getTable(mib, oid){
    //TODO
}

//Funcion que espera al resultado snmp para devolver la respuesta
function espera (res){
    res.send(resultadoConsulta);
    resultadoConsulta = null;
    //session.close();
}

//Funcion que responde a la peticion http AJAX
function respuesta(req, res){

    //Asignamos a nuestras variables locales los valores pasados como parámetros al hacer click en 'enviar'
    ip= req.query.ip;
    mib= parseInt(req.query.mib);
    operacion= parseInt(req.query.operacion);
    //Puede ser uno o varios en un array
    oid=[req.query.oid];
    console.log("Ip peticion: " + ip + "\nMIB peticion: " + mib+ "\nOperacion peticion: " + operacion+ "\nOID peticion: " + oid);

    session = snmp.createSession(ip, comunidad);

    if(session){
            //cargamos la mib correspondiente
        switch (mib){
            case 1:
                mib = mib2;
                break;
            case 2:
                //TODO decidir mib y cargarla
                break;
            case 3:
                //TODO decidir mib y cargarla
                break;
            case 4:
                //sin mib el valor del oid debrea ser numerico y completo
                break;
        }

        //Filtramos la operacion y llamamos a la correspondiente
        switch (operacion){
            case 1:
                getOID(mib, oid);
                break;
            case 2:
                getNext(mib, oid);
                break;
            case 3:
                getTable(mib, oid);
                break;
        }
    }else{
        resultadoConsulta = "No se ha podido establecer la conexion con el host";
    }
    //esperamos a que nos devuelva los datos de snmp antes de responder
    setTimeout(espera.bind(null, res), 1000);
}

//A la escucha en la url /peticion
router.get('/peticion', respuesta)

module.exports = router;