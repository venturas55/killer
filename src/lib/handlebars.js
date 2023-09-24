const { format } = require('timeago.js');
const helpers = {};

helpers.timeago = (timestamp) => {
  return format(timestamp);
}

helpers.formatearSp = (fecha) => {
  if (fecha != null) {
    var timestamp = new Date(fecha);
    mnth = ("0" + (timestamp.getMonth() + 1)).slice(-2),
      day = ("0" + timestamp.getDate()).slice(-2);
    return [day, mnth, timestamp.getFullYear()].join("/");
  } else {
    return '';
  }

}

helpers.formatearSpHora = (fecha) => {
  if (fecha != null) {
    var timestamp = new Date(fecha);
    mnth = ("0" + (timestamp.getMonth() + 1)).slice(-2),
      day = ("0" + timestamp.getDate()).slice(-2),
      hours = ("0" + timestamp.getHours()).slice(-2),
      minutes = ("0" + timestamp.getMinutes()).slice(-2),
      seconds = ("0" + timestamp.getSeconds()).slice(-2);
    return hours + ":" + minutes + ":" + seconds + " del " + [day, mnth, timestamp.getFullYear()].join("/");
  } else {
    return '';
  }
}

//Este es el formateo necesario para encajar una fecha en un input de type="date"
helpers.formatearEn = (fecha) => {
  var timestamp = new Date(fecha);
  mnth = ("0" + (timestamp.getMonth() + 1)).slice(-2),
    day = ("0" + timestamp.getDate()).slice(-2);
  return [timestamp.getFullYear(), mnth, day].join("-");
}


helpers.counter = (index) => {
  return index + 1;
};

helpers.suma = (balizas) => {
  var total = 0;
  balizas.forEach(element => {
    total++;
  });
  return total;
}

helpers.supervivientes = (partida) => {
  var total = 0;
  /*   partida.forEach(element => {
      if(element.victima_killed==0)
        total++;
    }); */
  return total;
}


//Se usa asi:   {{#when jugadores.length 'eq' objetos.length }}
helpers.when = (operand_1, operator, operand_2, options) => {
  var operators = {
    'eq': function (l, r) { return l == r; },
    'noteq': function (l, r) { return l != r; },
    'gt': function (l, r) { return Number(l) > Number(r); },
    'gte': function (l, r) { return Number(l) >= Number(r); },
    'or': function (l, r) { return l || r; },
    'and': function (l, r) { return l && r; },
    '%': function (l, r) { return (l % r) === 0; }
  }
    , result = operators[operator](operand_1, operand_2);

  if (result) return options.fn(this);
  else return options.inverse(this);
}


module.exports = helpers;