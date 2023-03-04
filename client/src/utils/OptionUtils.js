var numeral = require('numeral');

export function get_symbol(occ_symbol) {
    return occ_symbol.split(' ')[0]; // remove spaces
}

export function get_exp_date(occ_symbol) {
    let tokens = occ_symbol.split(" ")
    let optionName = tokens[tokens.length - 1];
    return ["20" + optionName.substring(0, 2), 
            optionName.substring(2, 4), 
            optionName.substring(4, 6)].join("-");
}

export function get_option_type(occ_symbol) {
    let tokens = occ_symbol.split(" ")
    let optionName = tokens[tokens.length - 1];
    if (optionName[6] === "C") {
        return "call";
    } else if (optionName[6] === "P") {
        return "put";
    }
}

export function get_strike(occ_symbol) {
    let tokens = occ_symbol.split(" ")
    let optionName = tokens[tokens.length - 1];
    return numeral(optionName.substring(7, 15)).value() / 1000.0
}
