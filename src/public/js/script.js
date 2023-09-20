//GESTION DE LA BUSQUEDA POR TIPO DE FILTRO

var botonSearch = document.getElementById("botonBuscar");
botonSearch.addEventListener("click", aBuscar);

function aBuscar(e) {
  e.preventDefault();
  var valor = document.getElementById("inputBuscar").value;
  console.log("es:"+valor);
if(valor===''){
  valor="undefinidio";
}
console.log("es:"+valor);
  var filtro = document.getElementById("opcionBuscar").value;
  window.location.href = "/items1/list/" + filtro + "/" + valor;
}

//======================================

//GESTION DE VENTANAS MODALES
var modal1 = document.getElementById("myModal1");
var modal2 = document.getElementById("myModal2");
var modal3 = document.getElementById("myModal3");

function abreModal1() {
  modal1.style.display = "block";
}
function abreModal2() {
  modal2.style.display = "block";
}

function abreModal3() {
  modal3.style.display = "block";
}

function borrarNIF() {
  var NIFforzarBorrado = document.getElementById("NIFforzarBorrado").value;
  window.location.href = "/items1/delete/" + NIFforzarBorrado;
}


function cambiarUsuario(){
var passcheck=document.getElementById("contrasenaConfirmacion").value;
//TODO: verificar el pass con la base de datos


var botonformulario=document.getElementById("enviarCambios");
botonformulario.click();
passcheck="";

}

function cierraModal() {
  modal1.style.display = "none";
  modal2.style.display = "none";
  modal3.style.display = "none";
  passcheck="";
}


window.onclick = function (event) {
  console.log("cierra modal");
  //TODO: (event.target == modal) LOS 3 MODALES
  if (event.target == modal1) {
    modal1.style.display = "none";
    modal2.style.display = "none";
    modal3.style.display = "none";
  }
};
