const {format} = require('timeago.js');
const helpers ={};

helpers.timeago = (timestamp) =>{
    return format(timestamp);
}

helpers.formatearSp = (timestamp) =>{
    mnth = ("0" + (timestamp.getMonth() + 1)).slice(-2),
    day = ("0" + timestamp.getDate()).slice(-2);
  return [day , mnth,timestamp.getFullYear() ].join("/");
}


//Este es el formateo necesario para encajar una fecha en un input de type="date"
helpers.formatearEn = (timestamp) =>{
    mnth = ("0" + (timestamp.getMonth() + 1)).slice(-2),
    day = ("0" + timestamp.getDate()).slice(-2);
  return [timestamp.getFullYear(), mnth,day ].join("-");
}


helpers.suma = (balizas)=>{
    var total=0;
    balizas.forEach(element => {
        total++;
    });
    return total;
}


//Se usa asi:   {{#when jugadores.length 'eq' objetos.length }}
helpers.when =(operand_1, operator, operand_2, options)=> {
  var operators = {
    'eq': function(l,r) { return l == r; },
    'noteq': function(l,r) { return l != r; },
    'gt': function(l,r) { return Number(l) >= Number(r); },
    'or': function(l,r) { return l || r; },
    'and': function(l,r) { return l && r; },
    '%': function(l,r) { return (l % r) === 0; }
   }
   , result = operators[operator](operand_1,operand_2);
 
   if (result) return options.fn(this);
   else  return options.inverse(this);
}


module.exports=helpers;