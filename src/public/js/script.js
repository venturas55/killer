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



/* PARA QUE FUNCIONE EL BOTON DE DONACIONES */
//PARA IR AL PAGO 

document.getElementById('input_amount_other').addEventListener('click', async () => {
  var importe = document.getElementById('input_amount_other_box').value;
  document.getElementById('input_amount_other').value = importe;
});
document.getElementById('input_amount_other_box').addEventListener('click', async () => {
  var importe = document.getElementById('input_amount_other_box').value;
  document.getElementById('input_amount_other').value = importe;
});


var elements = document.getElementsByName("amount");
for (var i = 0; i < elements.length; i++) {
  elements[i].addEventListener('click', variarTasa, false);
}
function variarTasa(ev) {
  var importe = ev.target.value;
  console.log(importe);
  importe=(parseInt(importe)*0.015+0.25).toFixed(2);
  document.getElementById('gastos').innerHTML = importe;
}

/* FIN PARA QUE FUNCIONE EL BOTON DE DONACIONES */
