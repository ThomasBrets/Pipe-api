export const errorHandler = (error, req, res, next) => {
  // Manejar errores de validación de Mongoose (campos faltantes o inválidos)
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      message: messages.join(", "),
      errors: messages,
    });
  }

  // Manejar errores de duplicado (unique constraint de MongoDB)
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({
      message: `El ${field} ya está en uso`,
    });
  }

  // Errores personalizados (CustomError) o genéricos
  const status = error.status || 500;
  res
    .status(status)
    .json({ message: error.message || "Internal Server Error" });
};



//? ¿Qué hace ahora?

//   1. ValidationError (campos faltantes/inválidos):
//     - Detecta cuando error.name === "ValidationError"
//     - Extrae todos los mensajes de error de error.errors
//     - Retorna 400 Bad Request con los mensajes
//   2. Error de duplicado (unique constraint):
//     - Detecta cuando error.code === 11000 (código de MongoDB para duplicados)
//     - Extrae el campo duplicado de error.keyPattern
//     - Retorna 400 Bad Request con mensaje descriptivo
//   3. Otros errores:
//     - Usa el status code del error o 500 por defecto
//     - Retorna el mensaje del error