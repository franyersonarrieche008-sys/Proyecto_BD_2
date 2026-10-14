const mysql = require("mysql2");

// Configuración de la conexión a mysql
const conexion = mysql.createConnection({
  host: "127.0.0.1",    // Servidor local
  port: 3307, // usa el puerto que muestra XAMPP
  user: "root",        // Usuario de MySQL (Por defecto en XAMPP)
  password: "",        // Contraseña de MySQL (Por defecto en XAMPP es vacía)
  database: "tienda"    // Nombre de nuestra BD
});

// Comprobar si la conexión fue exitosa
conexion.connect((error) => {
  if (error) {
    console.error("Error al conectar con MySQL: ", error);
    return;
  }
  console.log("Conexión exitosa con MySQL");
});

// Exportar la conexión para usarla en otros archivos
module.exports = conexion;