const express = require('express')
const router = express.Router()
const path = require('path')
const snmp = require ("net-snmp");

//prueba de snmp
const session = snmp.createSession ("192.168.1.189", "public");

const cabeceraOID = ['1.3.6.1.4.1.2021.4.11.0', '1.3.6.1.4.1.2021.4.5.0', '1.3.6.1.4.1.2021.11.11.0'];

var cpu;
var memoria;

session.get (cabeceraOID, callbackGet);

function callbackGet(error, varbinds){
    if (error) {
        console.error (error);
    } else {
        cpu = varbinds[2];
        memoria = varbinds;
        for (var i = 0; i < varbinds.length; i++) {
            if (snmp.isVarbindError (varbinds[i])) {
                console.error (snmp.varbindError (varbinds[i]));
            } else {
                console.log (varbinds[i].oid + " = " + varbinds[i].value);
            }
        }
    }
}

function respuesta(req, res){

    session.get (cabeceraOID, callbackGet);

    session.trap (snmp.TrapType.LinkDown, function (error) {
        if (error) {
            console.error (error);
        }
    });

    res.render('index.html', {memoria, cpu})
}

//respuesta
router.get('/', respuesta)

module.exports = router;