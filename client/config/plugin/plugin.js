import VeeValidate from 'vee-validate';
import ElementUI from 'element-ui/lib/index.js';
import 'element-ui/lib/theme-chalk/index.css';
import locale from 'element-ui/lib/locale/lang/en'
import CollapseTransition from 'element-ui/lib/transitions/collapse-transition';
import VueMask from 'v-mask'
import numeral from 'numeral';
import math from 'mathjs';
import GoogleMapsLoader from 'google-maps';
import Cleave from 'cleave.js';
import Croppa from 'vue-croppa';
import bodymovin from 'bodymovin';
import $ from 'jQuery';
import VueMeteorTracker from "vue-meteor-tracker";

GoogleMapsLoader.KEY = 'AIzaSyDOld0lTG5Ku15U-p-kyhohZXmZra2rG1k';


Vue.prototype.$_Cleave = Cleave;
Vue.prototype.$_numeral = numeral;
Vue.prototype.$_math = math;
Vue.prototype.$_GoogleMapsLoader = GoogleMapsLoader;
Vue.prototype.$_bodymovin = bodymovin;
Vue.prototype.$jQuery = $;

Vue.use(VueMeteorTracker);
Vue.use(Croppa);
Vue.use(VueMask);
Vue.use(CollapseTransition);
Vue.use(ElementUI, {locale});
Vue.use(VeeValidate, {fieldsBagName: 'formFields'});
Vue.use(numeral);
Vue.use(math);
// Vue.use($);
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';

Vue.filter('numFormat', (val) => {
    if (val === "") {
        return 0;
    }
    return numeral(val).format('0,0.00');
});
Vue.filter('numFormatBaseCurrency', (val, currencyId) => {
    if (val === "") {
        return 0;
    }
    if (currencyId === undefined) {
        let settingDoc = WB_waterBillingSetup.findOne();
        currencyId = settingDoc.baseCurrency;
    }
    if (currencyId === "KHR") {
        return numeral(val).format('0,0');
    } else if (currencyId === "USD") {
        return numeral(val).format('0,0.00');
    } else if (currencyId === "THB") {
        return numeral(val).format('0,0');
    }

});

Vue.filter('numFormatPercent', (val) => {
    return numeral(val * 100).format('0,0.00');
});

Vue.filter('numFormatRiel', (val) => {
    return numeral(val).format('0,0');
});

Vue.filter('momentFormat', (val) => {
    if (val) {
        return moment(val).format('DD/MM/YYYY');
    }
    return "";
});
Vue.filter('subStringBill', (val) => {
    return val.substr(5, 9);
});


Vue.filter('subStringCustomer15', (val) => {
    return val.substr(0, 15);
});

Vue.filter('switchNumToKh', (val) => {
    let str;
    switch (val) {
        case 1:
            str = '១';
            break;
        case 2:
            str = '២';
            break;
        case 3:
            str = '៣';
            break;
        case 4:
            str = '៤';
            break;

        case 5:
            str = '៥';
            break;
        case 6:
            str = '៦';
            break;
        case 7:
            str = '៧';
            break;
        case 8:
            str = '៨';
            break;
        case 9:
            str = '៩';
            break;
        case 10:
            str = '១០';
            break;


    }
    return str;
});

Vue.filter('switchNumMultiToKh', (val) => {
    if (val) {
        let str;
        let newStr = "";
        let oldStr = val.split("");
        oldStr.forEach(function (obj) {
            switch (obj) {
                case "0":
                    str = '០';
                    break;
                case "1":
                    str = '១';
                    break;
                case "2":
                    str = '២';
                    break;
                case "3":
                    str = '៣';
                    break;
                case "4":
                    str = '៤';
                    break;

                case "5":
                    str = '៥';
                    break;
                case "6":
                    str = '៦';
                    break;
                case "7":
                    str = '៧';
                    break;
                case "8":
                    str = '៨';
                    break;
                case "9":
                    str = '៩';
                    break;
            }

            newStr += str;
        })


        return newStr;
    }
    return "";
});
Vue.filter('switchMonthToKh', (val) => {
    let str;
    switch (val) {
        case "01":
            str = 'មករា';
            break;

        case "02":
            str = 'កុម្ភះ';
            break;
        case "03":
            str = 'មិនា';
            break;
        case "04":
            str = 'មេសា';
            break;

        case "05":
            str = 'ឧសភា';
            break;
        case "06":
            str = 'មិថុនា';
            break;
        case "07":
            str = 'កក្កដា';
            break;
        case "08":
            str = 'សីហា';
            break;
        case "09":
            str = 'កញ្ញា';
            break;

        case "10":
            str = 'តុលា';
            break;
        case "11":
            str = 'វិច្ឆិកា';
            break;
        case "12":
            str = 'ធ្នូ';
            break;
    }
    return str;
});

Vue.filter('switchMonthYearToKh', (val) => {

    let month = moment(val).format("MM");
    let year = moment(val).format("YYYY");

    switch (month) {
        case "01":
            str = 'មករា';
            break;

        case "02":
            str = 'កុម្ភះ';
            break;
        case "03":
            str = 'មិនា';
            break;
        case "04":
            str = 'មេសា';
            break;

        case "05":
            str = 'ឧសភា';
            break;
        case "06":
            str = 'មិថុនា';
            break;
        case "07":
            str = 'កក្កដា';
            break;
        case "08":
            str = 'សីហា';
            break;
        case "09":
            str = 'កញ្ញា';
            break;

        case "10":
            str = 'តុលា';
            break;
        case "11":
            str = 'វិច្ឆិកា';
            break;
        case "12":
            str = 'ធ្នូ';
            break;
    }
    str += " " + year;
    return str;
});


Vue.filter('switchMonth', (val) => {
    let str;
    switch (val) {
        case "01":
            str = 'Jan';
            break;
        case "1":
            str = 'Jan';
            break;

        case "02":
            str = 'Feb';
            break;
        case "2":
            str = 'Feb';
            break;
        case "03":
            str = 'Mar';
            break;
        case "3":
            str = 'Mar';
            break;
        case "04":
            str = 'Apr';
            break;
        case "4":
            str = 'Apr';
            break;

        case "05":
            str = 'May';
            break;
        case "5":
            str = 'May';
            break;
        case "06":
            str = 'Jun';
            break;
        case "6":
            str = 'Jun';
            break;
        case "07":
            str = 'Jul';
            break;
        case "7":
            str = 'Jul';
            break;
        case "08":
            str = 'Aug';
            break;
        case "8":
            str = 'Aug';
            break;
        case "09":
            str = 'Sep';
            break;
        case "9":
            str = 'Sep';
            break;

        case "10":
            str = 'Oct';
            break;
        case "11":
            str = 'Nov';
            break;
        case "12":
            str = 'Dec';
            break;
    }
    return str;
});

Vue.filter('switchDay', (val) => {
    let day = moment(date).format("DDD");
    let str;
    switch (day) {
        case "Mon":
            str = 'ច័ន្ទ';
            break;
        case "Tue":
            str = 'អង្គារ៍';
            break;

        case "Wed":
            str = 'ពុធ';
            break;
        case "Thu":
            str = 'ព្រហស្បត្តិ៍';
            break;
        case "Fri":
            str = 'សុក្រ';
            break;
        case "Sat":
            str = 'សៅរ៍';
            break;
        case "Sun":
            str = 'អាទិត្យ';
            break;
    }
    return str;
});

Vue.filter('switchDate', (date) => {
    let str;
    let val = moment(date).format("MM");
    let d = moment(date).format("DD");
    let y = moment(date).format("YYYY");
    switch (val) {
        case "01":
            str = 'January';
            break;
        case "1":
            str = 'January';
            break;

        case "02":
            str = 'February';
            break;
        case "2":
            str = 'February';
            break;
        case "03":
            str = 'March';
            break;
        case "3":
            str = 'March';
            break;
        case "04":
            str = 'April';
            break;
        case "4":
            str = 'April';
            break;

        case "05":
            str = 'May';
            break;
        case "5":
            str = 'May';
            break;
        case "06":
            str = 'June';
            break;
        case "6":
            str = 'June';
            break;
        case "07":
            str = 'July';
            break;
        case "7":
            str = 'July';
            break;
        case "08":
            str = 'August';
            break;
        case "8":
            str = 'August';
            break;
        case "09":
            str = 'September';
            break;
        case "9":
            str = 'September';
            break;

        case "10":
            str = 'October';
            break;
        case "11":
            str = 'November';
            break;
        case "12":
            str = 'December';
            break;
    }

    let dateString = d + " " + str + " " + y;
    return dateString;
});


Vue.filter('subStringVoucher', (val) => {
    return val.substr(9, 13);
});


