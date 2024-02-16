const mysql = require('mysql');
const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');
const session = require('express-session');

var multer = require('multer');
var fs = require('fs');

//CREAMOS LA INSTANCIA EXPRESS
var app = express();
var upload = multer();

// PARA LEER JSON FACILITA LA VIDA CON JSON
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(upload.array());

// Configuración de sesión
app.use(session({
    secret: 'secreto',
    resave: false,
    saveUninitialized: true
}));

// CONEXIÓN CON LA BASE DE DATOS
var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Proyecto',
    multipleStatements: true
});

// ESTO ES PARA SI HAY UN ERROR EN LA CONEXIÓN CON LA BASE DE DATOS
// QUE SAQUE UN MENSAJE
mysqlConnection.connect((err) => {
    if (!err)
        console.log('Conexion bbdd correcta...');
    else
        console.log('Connection Failed!' + JSON.stringify(err, undefined, 2));
});

// Middleware para pasar el usuario autenticado a las vistas
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

//PUERTO DE ESTA APLICACIÓN
const port = process.env.PORT || 3001;

// CONECTAR, CONFIGURAR EL PUERTO DEL SERVIDOR.
app.listen(port, () => console.log(`Listening in URL http://localhost:${port}..`));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/inicio.html'));
});
app.get('/iniciar', function (req, res) {
    res.sendFile(path.join(__dirname + '/iniciar.html'));
});
app.get('/registro', function (req, res) {
    res.sendFile(path.join(__dirname + '/registrarse.html'));
});
app.get('/foro', function (req, res) {
    res.sendFile(path.join(__dirname + '/foros.html'));
});

app.get('/foro1', function (req, res) {
    res.sendFile(path.join(__dirname + '/foro1.html'));
});

app.get('/foro2', function (req, res) {
    res.sendFile(path.join(__dirname + '/foro2.html'));
});
app.post('/iniciar_sesion', function (req, res) {
    const { nombre, contraseña } = req.body;
    var sql = `SELECT * FROM registro WHERE nombre = ? AND password = ?`;
    mysqlConnection.query(sql, [nombre, contraseña], (err, results) => {
        if (!err && results.length > 0) {
            req.session.user = { nombre: nombre };
            console.log(`Usuario [${results[0].nombre}] inicio sesión correctamente`);
            res.redirect('/');
        } else {
            console.log(`Usuario [${results[0].nombre}] inicio sesión incorrectamente`);
            res.send('Credenciales incorrectas');
        }
    });
});

app.get('/cerrar_sesion', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});

app.post('/registro', function (req, res) {
    const { nombre, contraseña } = req.body;

    if (!contraseña) {
        return res.status(400).send("La contraseña es requerida.");
    }

    var sql = `INSERT INTO registro (nombre, password) VALUES (?, ?)`;
    mysqlConnection.query(sql, [nombre, contraseña], (err, result) => {
        if (!err) {
            console.log("Usuario registrado correctamente");
            res.redirect('/');
        } else {
            console.log("Error al registrar usuario:", err);
            res.status(500).send("Error interno del servidor");
        }
    });
});
