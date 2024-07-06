function cambiarUsuario() {
  var passcheck = document.getElementById("contrasenaConfirmacion").value;
  //TODO: verificar el pass con la base de datos


  var botonformulario = document.getElementById("enviarCambios");
  botonformulario.click();
  passcheck = "";

}

/* para los INPUTS */
/* let timer;

document.addEventListener('input', e => {
  const el = e.target;
  
  if( el.matches('[data-color]') ) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      document.documentElement.style.setProperty(`--color-${el.dataset.color}`, el.value);
    }, 100)
  }
}) */
/* FIN para los INPUTS */ 
