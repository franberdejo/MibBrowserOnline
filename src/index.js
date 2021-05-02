const express = require('express')
const app = express()
const port = 80
const path = require('path')

//motor de lectura paginas
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile)

//directorio frontend
app.set('views', path.join(__dirname, 'views'))

//rutas
app.use(require(path.join(__dirname,'/routes/index.js')))
app.use(require(path.join(__dirname,'/routes/peticion.js')))


//docs publicos
app.use(express.static(path.join(__dirname, '/public')))

//despliegue
app.listen(port, () => console.log(
    path.join("Servidor a la escucha")
    )
);
