/* //COSAS DE BOOTSTRAP PARA QUE FUNCIONEN
// LOS POPOVERS
var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl)
})

//LOS MODALES
$('#exampleModalLongTitle').on('shown.bs.modal', function () {
  $('#myInput').trigger('focus')
}) */
const container = document.getElementById("testModal");
const modal = new bootstrap.Modal(container);

document.getElementById("btnShow").addEventListener("click", function () {
  modal.show();
});
document.getElementById("btnSave").addEventListener("click", function () {
  modal.hide();
});


//FIN POPOVERS BOOSTRAP


//GESTION DE BOTONES
var btnkill = document.getElementById("btnkill");
if (btnkill)
  btnkill.addEventListener("click", abreModal1);
var btndie = document.getElementById("btndie");
if (btndie)
  btndie.addEventListener("click", abreModal2);


//======================================

//GESTION DE VENTANAS MODALES
var modal1 = document.getElementById("myModal1");
var modal2 = document.getElementById("myModal2");

function abreModal1(ev) {
  //console.log(ev.originalTarget.getAttribute('victima'));
  //console.log(ev.originalTarget.getAttribute('id_victima'));
  if (document.getElementById("botoncito") === null) {
    newButton = document.createElement('a');
    newButton.id = "botoncito";
    //newButton.type = 'button';
    newButton.text = "Asesinar";
    newButton.className = "btn btn-warning";
    newButton.setAttribute("id_victima", ev.originalTarget.getAttribute('id_victima'));
    newButton.setAttribute("href", "/partidas/" + ev.originalTarget.getAttribute('id_partida') + "/asesinar/" + ev.originalTarget.getAttribute('id_victima'));
    console.log(document.getElementById("myModal1").getElementsByClassName("card-body")[0].prepend(newButton));
  }
  else {
    newButton.setAttribute("id_victima", ev.originalTarget.getAttribute('id_victima'));
  }

  modal1.style.display = "block";
}
function abreModal2(ev) {
  console.log(ev);
  //console.log(ev.originalTarget.getAttribute('id_victima'));
  if (document.getElementById("botoncito2") === null) {
    newButton = document.createElement('a');
    newButton.id = "botoncito2";
    //newButton.type = 'button';
    newButton.text = "Aceptar";
    newButton.className = "btn btn-danger";
    newButton.setAttribute("id_victima", ev.originalTarget.getAttribute('id_victima'));
    newButton.setAttribute("id_partida", ev.originalTarget.getAttribute('id_partida'));
    newButton.setAttribute("href", "/partidas/" + ev.originalTarget.getAttribute('id_partida') + "/muerte/" + ev.originalTarget.getAttribute('id_victima'));
    console.log(document.getElementById("myModal2").getElementsByClassName("card-body")[0].prepend(newButton));
  }
  else {
    newButton.setAttribute("id_victima", ev.originalTarget.getAttribute('id_victima'));
  }

  modal2.style.display = "block";
}



function cambiarUsuario() {
  var passcheck = document.getElementById("contrasenaConfirmacion").value;
  //TODO: verificar el pass con la base de datos


  var botonformulario = document.getElementById("enviarCambios");
  botonformulario.click();
  passcheck = "";

}

function cierraModal(){
  modal1.style.display = "none";
  modal2.style.display = "none";
}


/* window.onclick = function (event) {
  console.log("cierra modal");
  //TODO: (event.target == modal) LOS 3 MODALES
  if (event.target == modal1) {
    modal1.style.display = "none";
    modal2.style.display = "none";

  }
};
 */