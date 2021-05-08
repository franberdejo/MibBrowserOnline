/*
    En este archivo se procesa la petición de escaneado de vecinos
*/
const express = require('express')
const router = express.Router()
const path = require('path')
const snmp = require ("net-snmp");
var portscanner = require('portscanner');

//Puerto por defecto de los agentes SNMP, el único que comprobaremos de momento
const snmpport=161;

//Las variables en las que guardaremos los datos recibidos en la petición AJAX
var ip,mask;

//Funcion que responde a la peticion http AJAX
function respuesta(req, res){
    //Asignamos a nuestras variables locales los valores pasados como parámetros al hacer click en 'enviar'
    subnet= req.query.ip;
    console.log("Escaneando equipos en la misma subred que "+subnet+'/'+24);

    var agents=[];
    var ip = req.query.ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    
    /*IMPORTANTE, AHORA MISMO SÓLO FUNCIONA PARA REDES DE MÁSCARA 24*/
    for(let i=1;i<255;i++){
        //IP de cada equipo de la subred
        var equipo = [(ip[1]),(ip[2]),(ip[3]),i].join('.');

        setTimeout(function(){portscanner.checkPortStatus(snmpport, equipo, function(error, status) {
            console.log(equipo + ' ' + status);
            agents.push(equipo);
            })}
        ,200);
    }
    //Devuelve un array con los equipos de la subred que tienen agente SNMP
    res.send(agents);
} 

//A la escucha en la url /peticion
router.get('/ips', respuesta)

module.exports = router;