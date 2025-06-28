/* ============MIDDLEWARES=========== */

export const imageSizeLimitErrorHandler = (err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    req.flash("error", "Tamaño demasiado grande. Límite de 5MB.");
    return res.redirect("back"); // Redirige a la misma página
  }
  next(err); // Pasa el error a otro middleware si no es de tamaño
};