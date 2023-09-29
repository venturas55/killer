function cambiarUsuario() {
  var passcheck = document.getElementById("contrasenaConfirmacion").value;
  //TODO: verificar el pass con la base de datos


  var botonformulario = document.getElementById("enviarCambios");
  botonformulario.click();
  passcheck = "";

}
