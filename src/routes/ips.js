/*
    En este archivo se procesa la petición de escaneado de vecinos
*/
const express = require('express')
const router = express.Router()
const path = require('path')
const snmp = require ("net-snmp");

//Puerto por defecto de los agentes SNMP, el único que comprobaremos de momento
const snmpport=161;

//agentes con snmp activo tras el scan
var agents=[];

//Funcion que espera al SCAN para devolver la respuesta
function espera (res){
    res.send(agents);
}

//Funcion que comprueba si hay agente snmp enviandole una peticion
function sonda (equipo){
    session = snmp.createSession(equipo, 'public');
    session.get (['1.3.6.1.2.1.1.3.0'], function(error, varbinds){
        if(error){
        }else{
            agents.push(equipo)
        }
    });
}

//Funcion que responde a la peticion http AJAX
function respuesta(req, res){
    //Asignamos a nuestras variables locales los valores pasados como parámetros al hacer click en 'enviar'
    subnet= req.query.ip;
    console.log("Escaneando equipos en la misma subred que "+subnet+'/'+24);

    var ip = req.query.ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);

    //IMPORTANTE, AHORA MISMO SÓLO FUNCIONA PARA REDES DE MÁSCARA 24
    for(let i=1;i<255;i++){
        //IP de cada equipo de la subred
        var equipo = [(ip[1]),(ip[2]),(ip[3]),i].join('.');
        sonda(equipo)
    }
    setTimeout(espera.bind(null, res), 1000);
}

//A la escucha en la url /peticion
router.get('/ips', respuesta)

module.exports = router;