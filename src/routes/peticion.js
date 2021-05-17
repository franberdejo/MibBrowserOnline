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

//Respuesta del AJAX en el [0] va el nombre del oid y en [1] el resultado
var resultadoConsulta = [];


function sortInt (a, b) {
    if (a > b)
        return 1;
    else if (b > a)
        return -1;
    else
        return 0;
}

function callbackTable (error, table) {
    resultadoConsulta = [];
    var ncol
    var nfila
    if (error) {
        console.error (error.toString ());
    } else {
        resultadoConsulta[1] = table
        var Ncolum = 0;
        for (index in table){
            for (const key in table[index]) {
                Ncolum++
            }
            ncol = Ncolum;
            Ncolum=0
        }
    }
    var nombres = [];
    var lock = 0;
    var iteraciones = ncol + 2;
    for (const key in mib) {
     if (key === oid[0])
            lock = 1;
      if(lock == 1){
          nombres.push(key);
          iteraciones -- ;
         if(iteraciones == 0)
             lock = 0;
      }
    }
    resultadoConsulta[0] = nombres;
}
//Funcion que recibe la respuesta get de snmp
function callbackGet(error, varbinds){
    resultadoConsulta = [];
    if (error) {
        console.error (error);
        resultadoConsulta[1] = error;
    } else {
        resultadoConsulta[1] = varbinds;
        for (var i = 0; i < varbinds.length; i++) {
            if (snmp.isVarbindError (varbinds[i])) {
                console.error (snmp.varbindError (varbinds[i]));
            } else {
                if(resultadoConsulta[1][i].type == 4)
                resultadoConsulta[1][i].value = resultadoConsulta[1][i].value.toString('utf8')
                console.log (resultadoConsulta[1][i].oid + " = " + resultadoConsulta[1][i].value);
            }
        }
        for (const key in mib) {
            if (key === oid[0])
                resultadoConsulta[0] = key;
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
    oid = [mib[oid].oid];
    session.getNext (oid, callbackGet);
}

function getTable(mib, oid){
    if(mib!=4){
        oid=mib[oid].oid;
    }
    session.table(oid,callbackTable);
}

//Funcion que espera al resultado snmp para devolver la respuesta
function espera (res){
    //console.log(resultadoConsulta)
    res.json(resultadoConsulta);
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