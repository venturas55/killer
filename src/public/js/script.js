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
/* document.getElementById('donate-button').addEventListener('click', async () => {
  console.log("click");
  const response = await fetch('/payment/create-checkout-session', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
  });
  const data = await response.json();
  window.location.href = data.url;
}); */


document.getElementById('input_amount_other').addEventListener('click', async () => {
  var importe = document.getElementById('input_amount_other_box').value;
  document.getElementById('input_amount_other').value=importe;
}); 
document.getElementById('input_amount_other_box').addEventListener('click', async () => {
  var importe = document.getElementById('input_amount_other_box').value;
  document.getElementById('input_amount_other').value=importe;
}); 

/* FIN PARA QUE FUNCIONE EL BOTON DE DONACIONES */
