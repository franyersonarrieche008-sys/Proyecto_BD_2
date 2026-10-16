require("dotenv").config();
const express = require("express");
const cors = require("cors");
const conexion = require("./db"); // Importamos la conexión creada en db.js

const app = express();

// Middlewares globales
app.use(cors()); // Permitir peticiones desde el frontend
app.use(express.json()); // Habilitar la lectura de datos en formato JSON en el cuerpo (req.body)

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

// 1. Obtener todos los productos (READ)
app.get("/productos", (req, res) => {
  const sql = "SELECT * FROM productos";

  conexion.query(sql, (error, resultados) => {
    if (error) {
      console.error("Error al consultar:", error);
      return res.status(500).json({ mensaje: "Error al consultar los productos" });
    }
    // Retornamos el array de productos como JSON al cliente
    res.json(resultados);
  });
});

// 2. Crear un nuevo producto (CREATE)
app.post("/productos", (req, res) => {
  const { nombre, precio, stock } = req.body;

  // Consulta parametrizada con '?' para prevenir inyección SQL
  const sql = "INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)";
  const valores = [nombre, precio, stock];

  conexion.query(sql, valores, (error, resultado) => {
    if (error) {
      console.error("Error al insertar:", error);
      return res.status(500).json({ mensaje: "Error al crear el producto" });
    }

    res.status(201).json({
      mensaje: "Producto creado correctamente",
      id: resultado.insertId,
    });
  });
});

// Crear un mensaje de contacto
app.post("/contacto", (req, res) => {
  const { nombre, correo, asunto, mensaje } = req.body || {};
  const datos = [nombre, correo, asunto, mensaje];

  if (datos.some((valor) => typeof valor !== "string" || !valor.trim())) {
    return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
  }

  const valores = datos.map((valor) => valor.trim());
  const [nombreLimpio, correoLimpio, asuntoLimpio, mensajeLimpio] = valores;

  if (
    nombreLimpio.length > 100 ||
    correoLimpio.length > 254 ||
    asuntoLimpio.length > 150 ||
    mensajeLimpio.length > 5000
  ) {
    return res.status(400).json({ mensaje: "Uno o más campos superan el límite permitido" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
    return res.status(400).json({ mensaje: "Ingresa un correo electrónico válido" });
  }

  const sql =
    "INSERT INTO contactos (nombre, correo, asunto, mensaje) VALUES (?, ?, ?, ?)";

  conexion.query(sql, valores, (error, resultado) => {
    if (error) {
      console.error("Error al guardar el mensaje de contacto:", error);
      return res.status(500).json({ mensaje: "Error al enviar el mensaje" });
    }

    res.status(201).json({
      mensaje: "Mensaje enviado correctamente",
      id: resultado.insertId,
    });
  });
});

// Consultar mensajes públicos sin exponer el correo electrónico
app.get("/contacto/mensajes", (req, res) => {
  const sql =
    "SELECT id, nombre, asunto, mensaje, fecha_creacion FROM contactos ORDER BY fecha_creacion DESC";

  conexion.query(sql, (error, resultados) => {
    if (error) {
      console.error("Error al consultar los mensajes de contacto:", error);
      return res.status(500).json({ mensaje: "Error al consultar los mensajes" });
    }
    res.json(resultados);
  });
});

// Eliminar un mensaje del historial público
app.delete("/contacto/mensajes/:id", (req, res) => {
  if (!/^[1-9]\d*$/.test(req.params.id)) {
    return res.status(400).json({ mensaje: "El identificador del mensaje no es válido" });
  }

  const sql = "DELETE FROM contactos WHERE id = ?";
  conexion.query(sql, [req.params.id], (error, resultado) => {
    if (error) {
      console.error("Error al eliminar el mensaje de contacto:", error);
      return res.status(500).json({ mensaje: "Error al eliminar el mensaje" });
    }
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "No se encontró el mensaje" });
    }
    res.json({ mensaje: "Mensaje eliminado correctamente" });
  });
});

// 3. Actualizar un producto existente (UPDATE)
app.put("/productos/:id", (req, res) => {
  const id = req.params.id;
  const { nombre, precio, stock } = req.body;

  const sql = "UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?";
  const valores = [nombre, precio, stock, id];

  conexion.query(sql, valores, (error, resultado) => {
    if (error) {
      console.error("Error al actualizar:", error);
      return res.status(500).json({ mensaje: "Error al actualizar el producto" });
    }
    res.json({ mensaje: "Producto actualizado correctamente" });
  });
});

// 4. Eliminar un producto (DELETE)
app.delete("/productos/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM productos WHERE id = ?";

  conexion.query(sql, [id], (error, resultado) => {
    if (error) {
      console.error("Error al eliminar:", error);
      return res.status(500).json({ mensaje: "Error al eliminar el producto" });
    }
    res.json({ mensaje: "Producto eliminado correctamente" });
  });
});

// Iniciar servidor en el puerto 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});