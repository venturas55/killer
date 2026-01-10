import format from 'timeago.js';
const helpers = {};

helpers.timeago = (timestamp) => {
  return format(timestamp);
}

helpers.formatearSp = (fecha) => {
  if (fecha != null) {
    var timestamp = new Date(fecha);
    const mnth = ("0" + (timestamp.getMonth() + 1)).slice(-2),
      day = ("0" + timestamp.getDate()).slice(-2);
    return [day, mnth, timestamp.getFullYear()].join("/");
  } else {
    return '';
  }
}

helpers.formatearSpHora = (fecha) => {
  if (fecha != null) {
    var timestamp = new Date(fecha);
    const mnth = ("0" + (timestamp.getMonth() + 1)).slice(-2),
      day = ("0" + timestamp.getDate()).slice(-2),
      hours = ("0" + timestamp.getHours()).slice(-2),
      minutes = ("0" + timestamp.getMinutes()).slice(-2),
      seconds = ("0" + timestamp.getSeconds()).slice(-2);
    return [day, mnth, timestamp.getFullYear()].join("/") + " a las " + hours + ":" + minutes;
  } else {
    return '';
  }
}

helpers.formatearHoraSp = (fecha) => {
  if (fecha != null) {
    var timestamp = new Date(fecha);
    const mnth = ("0" + (timestamp.getMonth() + 1)).slice(-2),
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
  const mnth = ("0" + (timestamp.getMonth() + 1)).slice(-2),
    day = ("0" + timestamp.getDate()).slice(-2);
  return [timestamp.getFullYear(), mnth, day].join("-");
}

//Este es el formateo necesario para encajar una fecha en un input de type="datetime-local"
helpers.formatearDateTimeInput = (fecha) => {
// Caso ideal: dateString = "2025-07-2T12:00"
  const match = fecha.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{2})$/);
  if (!match) {
    return "";
  }
  const [, year, month, day, hour, minute] = match;
  return (
    year +
    "-" +
    String(month).padStart(2, "0") +
    "-" +
    String(day).padStart(2, "0") +
    "T" +
    String(hour).padStart(2, "0") +
    ":" +
    minute
  );
}

helpers.tiempoHasta = (fecha) => {
  const diff = fecha - new Date();

  if (diff <= 0) {
    return "finalizado";
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else {
    return `${hours}h ${minutes}min ${seconds}s`;
  }
};

helpers.counter = (index) => {
  return index + 1;
};

helpers.suma = (vector) => {
  var total = 0;
  vector.forEach(element => {
    total++;
  });
  return total;
}

helpers.supervivientes = (partida) => {
  var total = 0;
  partida.forEach(element => {
    if (element.eliminado == 0)
      total++;
  });
  return total;
}

//Se usa asi:   {{#when jugadores.length 'eq' objetos.length }}
helpers.when = (operand_1, operator, operand_2, options) => {
  var operators = {
    'eq': function (l, r) { return l == r; },
    'noteq': function (l, r) { return l != r; },
    'gt': function (l, r) { return Number(l) > Number(r); },
    'lt': function (l, r) { return Number(l) < Number(r); },
    'gte': function (l, r) { return Number(l) >= Number(r); },
    'lte': function (l, r) { return Number(l) <= Number(r); },
    'or': function (l, r) { return l || r; },
    'and': function (l, r) { return l && r; },
    '%': function (l, r) { return (l % r) === 0; }
  }
    , result = operators[operator](operand_1, operand_2);

  if (result) return options.fn(this);
  else return options.inverse(this);
}

helpers.enJuego = (value, options) => {
  if (value == "enjuego") {
    return options.fn(this);
  }
  return options.inverse(this);
};

helpers.esFinalizada = (value, options) => {
  if (value == "finalizada") {
    return options.fn(this);
  }
  return options.inverse(this);
};


helpers.enPausa = (value, options) => {
  if (value == "enpausa") {
    return options.fn(this);
  }
  return options.inverse(this);
};

helpers.enCreacion = (value, options) => {
  if (value == "encreacion") {
    return options.fn(this);
  }
  return options.inverse(this);
};

helpers.finalizada = (value, options) => {
  if (value == "finalizada") {
    return options.fn(this);
  }
  return options.inverse(this);
};

export default helpers;