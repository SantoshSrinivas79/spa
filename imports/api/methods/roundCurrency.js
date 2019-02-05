import {WB_waterBillingSetup} from "../../collection/waterBillingSetup";
import math from "mathjs";
import numeral from 'numeral';

export const roundCurrency = (amount, currencyId, rolesArea) => {
    let area;
    if (rolesArea) {
        area = rolesArea;
    } else {
        area = Session.get("area");
    }
    let settingDoc = WB_waterBillingSetup.findOne({rolesArea: area});
    let newAmount;
    settingDoc.usdDigit = settingDoc.usdDigit || 2;
    settingDoc.khrDigit = settingDoc.khrDigit || -2;
    settingDoc.thbDigit = settingDoc.thbDigit || 0;
    if (settingDoc.roundType === "Normal") {
        switch (currencyId) {
            case "USD":
                newAmount = math.round(amount, settingDoc.usdDigit);
                break;
            case "KHR":
                newAmount = roundKhr(amount, settingDoc.khrDigit);
                break;
            case "THB":
                newAmount = math.round(amount, settingDoc.thbDigit);
        }
    } else if (settingDoc.roundType === "Up") {
        switch (currencyId) {
            case "USD":
                newAmount = Math.ceil(amount * digitToInt(settingDoc.usdDigit)) / digitToInt(settingDoc.usdDigit);
            case "KHR":
                newAmount = roundKhrUp(amount, settingDoc.khrDigit);
            case "THB":
                newAmount = Math.ceil(amount * digitToInt(settingDoc.thbDigit)) / digitToInt(settingDoc.thbDigit);
        }

    } else if (settingDoc.roundType === "Down") {
        switch (currencyId) {
            case "USD":
                newAmount = Math.floor(amount * digitToInt(settingDoc.usdDigit)) / digitToInt(settingDoc.usdDigit);
            case "KHR":
                newAmount = roundKhrDown(amount, settingDoc.khrDigit);
            case "THB":
                newAmount = Math.floor(amount * digitToInt(settingDoc.thbDigit)) / digitToInt(settingDoc.thbDigit);
        }
    }
    return newAmount;
};


export const formatCurrency = (amount, currencyId) => {
    let settingDoc = WB_waterBillingSetup.findOne();
    if (currencyId === undefined) {
        currencyId = settingDoc.baseCurrency;
    }
    let newAmount = math.round(numeral(amount).value(), 5);
    let newForm = "";
    switch (currencyId) {
        case "USD":
            newForm = newFormFormat(settingDoc.usdDigit);
            break;
        case "KHR":
            newForm = newFormFormat(settingDoc.khrDigit);
            break;
        case "THB":
            newForm = newFormFormat(settingDoc.thbDigit);
            break;
    }
    return numeral(newAmount).format(newForm);

};

export const formatNumber = (amount) => {
    if (amount) {
        return numeral(amount).format("0,00");
    }
    return "";
}

export const formatCurrencyLast = (amount, currencyId) => {
    let settingDoc = WB_waterBillingSetup.findOne();
    if (currencyId === undefined) {
        currencyId = settingDoc.baseCurrency;
    }
    let newAmount = math.round(numeral(amount).value(), 5);
    if (currencyId === "KHR") {
        newAmount = roundKhrUp(newAmount, -2);
    }
    let newForm = "";
    switch (currencyId) {
        case "USD":
            newForm = newFormFormat(settingDoc.usdDigit);
            break;
        case "KHR":
            newForm = newFormFormat(settingDoc.khrDigit);
            break;
        case "THB":
            newForm = newFormFormat(settingDoc.thbDigit);
            break;
    }
    return numeral(newAmount).format(newForm);

};


let roundKhr = (amount, digit) => {
    if (digit <= 0) {
        return math.round(amount / digitToInt(digit), math.abs(digit)) * digitToInt(digit);
    } else {
        return math.round(amount, math.abs(digit));
    }
};
let roundKhrUp = (amount, digit) => {
    if (digit <= 0) {
        return Math.ceil(amount / digitToInt(digit), math.abs(digit)) * digitToInt(digit);
    } else {
        return Math.ceil(amount * digitToInt(digit)) / digitToInt(digit);
    }
};

let roundKhrDown = (amount, digit) => {
    if (digit <= 0) {
        return Math.floor(amount / digitToInt(digit), math.abs(digit)) * digitToInt(digit);
    } else {
        return Math.floor(amount * digitToInt(digit)) / digitToInt(digit);
    }
};

let digitToInt = (digit) => {
    let val = 1;
    for (let i = 1; i <= math.abs(digit); i++) {
        val *= 10;
    }
    return val;
};

let newFormFormat = (digit) => {
    let form = "(0,00";
    let k = 0;
    for (let i = 1; i <= digit; i++) {
        if (k === 0) {
            form += ".0";
        } else {
            form += "0";
        }
        k++;
    }
    form += ")";
    return form;
};


export const exchangeCoefficient = function ({exchange, fieldToCalculate, baseCurrency}) {
    let coefficient = {
        KHR: {},
        THB: {},
        USD: {}
    };
    if (baseCurrency === 'USD') {
        coefficient.KHR.$divide = [fieldToCalculate, exchange.rates.KHR];
        coefficient.THB.$divide = [fieldToCalculate, exchange.rates.THB];
        coefficient.USD.$multiply = [fieldToCalculate, 1];
    } else if (baseCurrency === 'THB') {
        coefficient.KHR.$divide = [fieldToCalculate, exchange.rates.THB / exchange.rates.KHR];
        coefficient.USD.$multiply = [fieldToCalculate, exchange.rates.THB];
        coefficient.THB.$multiply = [fieldToCalculate, 1];
    } else {
        coefficient.THB.$multiply = [fieldToCalculate, exchange.rates.KHR / exchange.rates.THB];
        coefficient.USD.$multiply = [fieldToCalculate, exchange.rates.KHR];
        coefficient.KHR.$multiply = [fieldToCalculate, 1];
    }
    return coefficient;
};


export const getCurrencySymbolById = function (id) {
    if (id === "USD") {
        return "$";
    } else if (id === "KHR") {
        return "៛";
    } else if (id === "THB") {
        return "B";
    } else {
        return "";
    }
};