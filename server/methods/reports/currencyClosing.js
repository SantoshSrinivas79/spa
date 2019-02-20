import {Meteor} from 'meteor/meteor';
import {Acc_Journal} from '../../../imports/collection/accJournal';
import {Acc_ChartAccount} from '../../../imports/collection/accChartAccount';
import {Acc_Exchange} from '../../../imports/collection/accExchange';
import {WB_waterBillingSetup} from '../../../imports/collection/waterBillingSetup';
import {Acc_ChartAccountBalance} from '../../../imports/collection/accChartAccountBalance';
import {Acc_ClosingEntry} from '../../../imports/collection/accClosingEntry';

import {SpaceChar} from "../../../both/config.js/space"

import numeral from 'numeral';
import {exchangeCoefficient} from "../../../imports/api/methods/roundCurrency"
import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency"
import {roundCurrency} from "../../../imports/api/methods/roundCurrency"
import {formatCurrency} from "../../../imports/api/methods/roundCurrency"


Meteor.methods({
    currencyClosingReport(id) {

        let data = {};
        let currencyClosingListHTML = "";
        let companyDoc = WB_waterBillingSetup.findOne({});
        let journalList = Acc_Journal.find({closingEntryId: id}).fetch();

        let i = 1;
        journalList.forEach(function (doc) {


            currencyClosingListHTML += `
                     <thead style="margin-top: 5px">`;

            if (doc.isCurrencyClosing == true) {
                if (companyDoc.baseCurrency == doc.currencyId) {
                    currencyClosingListHTML += `
                        <tr style="border: none !important;">
                            <th colspan="4" style="border: none !important; text-align: left !important;" >Opening Currency : ${doc.currencyId}</th>
                        </tr>
                     `;
                } else {
                    currencyClosingListHTML += `
                         <tr  style="border: none !important;">
                            <th colspan="4" style="border: none !important;;text-align: left !important;">Closing Currency : ${doc.currencyId}</th>
                        </tr>
                     `;
                }
            } else {
                currencyClosingListHTML += `
                        <tr style="border: none !important;">
                            <th colspan="4" style="border: none !important; text-align: left !important;" >${doc.memo} (${doc.currencyId})</th>
                        </tr>
                     `;
            }


            currencyClosingListHTML += `
                            <tr>
                                 <th>#</th>
                                 <th>Account (គណនី)</th>
                                 <th>Dr (ឥណពន្ធ)</th>
                                 <th>Cr (ឥណទាន)</th>
                            </tr>
                     </thead>
                     <tbody style="margin-bottom: 5px;">
                     `;

            let i = 1;
            doc.transaction.forEach(function (obj) {

                let chartAccDoc = Acc_ChartAccount.findOne({_id: obj.account});

                currencyClosingListHTML += `
                    <tr>
                        <td style="text-align: left !important;">${i}</td>
                        <td style="text-align: left !important;">${chartAccDoc.code} : ${chartAccDoc.name}</td>
                        <td>${formatCurrency(obj.dr, doc.currencyId)}</td>
                        <td>${formatCurrency(obj.cr, doc.currencyId)}</td>
                    </tr>
                `;
                i++;
            })
            currencyClosingListHTML += `
                        <tr>
                            <td colspan="2" style="text-align: center !important;">Total</td>
                            <td>${formatCurrency(doc.total, doc.currencyId)}</td>
                            <td>${formatCurrency(doc.total, doc.currencyId)}</td>
                        </tr>
                     </tbody>  
            `;

        })


        data.currencyClosingListHTML = currencyClosingListHTML;
        data.closingEntryDate = "";
        if (journalList.length > 0) {
            data.closingEntryDate = moment(journalList[0].journalDate).format("DD MMM YYYY");
        }
        return data;
    }
});




