<template>
    <div class="loan_repaymentForm">
        <div class="card card-stats">
            <el-container>
                <el-header><h2 style="font-family: 'Khmer OS Muol'"><b>{{langConfig["repaymentForm"]}}</b></h2>
                </el-header>
                <el-main>
                    <el-form :model="loanRepaymentForm" :rules="rules" ref="loanRepaymentForm" label-width="120px"
                             class="loanRepaymentForm">
                        <el-row>
                            <el-col :span="12">

                                <el-form-item :label="langConfig['loanAcc']" style="text-align: left !important;">
                                    &nbsp;: {{repaymentDoc && repaymentDoc.disbursementDoc &&
                                    repaymentDoc.disbursementDoc.loanAcc || ""}} => [{{repaymentDoc &&
                                    repaymentDoc.disbursementDoc && repaymentDoc.disbursementDoc.loanAmount || "" |
                                    numFormat}} {{currencySymbol}}]
                                </el-form-item>

                                <el-form-item :label="langConfig['client']" style="text-align: left !important;">
                                    &nbsp;: {{repaymentDoc && repaymentDoc.clientDoc && repaymentDoc.clientDoc.name ||
                                    ""}} ({{repaymentDoc && repaymentDoc.clientDoc &&
                                    repaymentDoc.clientDoc.phoneNumber || ""}})
                                </el-form-item>
                                <el-form-item :label="langConfig['nationId']" style="text-align: left !important;">
                                    &nbsp;: {{repaymentDoc && repaymentDoc.clientDoc && repaymentDoc.clientDoc.nationId
                                    || ""}}
                                </el-form-item>
                                <el-form-item :label="langConfig['installment']" style="text-align: left !important;">
                                    &nbsp;: {{repaymentDoc && repaymentDoc.installmentList || ""}}
                                </el-form-item>
                                <el-form-item :label="langConfig['principleDue']" style="text-align: left !important;">
                                    &nbsp;: {{repaymentDoc && repaymentDoc.principleUnpaid || "" | numFormat}}
                                    {{currencySymbol}}
                                </el-form-item>
                                <el-form-item :label="langConfig['interestDue']" style="text-align: left !important;">
                                    &nbsp;: {{repaymentDoc && repaymentDoc.interestUnpaid || "" | numFormat}}
                                    {{currencySymbol}}
                                </el-form-item>
                                <el-form-item :label="langConfig['dayLate']" style="text-align: left !important;">
                                    &nbsp;: {{dayLate}} ថ្ងៃ
                                </el-form-item>
                                <el-form-item :label="langConfig['totalDue']" style="text-align: left !important;">
                                    <b>&nbsp;: {{repaymentDoc && repaymentDoc.balanceUnpaid || "" | numFormat}}
                                        {{currencySymbol}}</b>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item :label="langConfig['repaymentDate']" prop="repaymentDate">
                                    <el-date-picker
                                            v-model="loanRepaymentForm.repaymentDate"
                                            type="date"
                                            style="width: 100%;"
                                            placeholder="Pick a day"
                                    >
                                    </el-date-picker>
                                </el-form-item>
                                <el-form-item :label="langConfig['voucher']" prop="voucher">
                                    <el-input v-model="loanRepaymentForm.voucher"></el-input>
                                </el-form-item>

                                <el-form-item :label="langConfig['client']" prop="loanDisbursementId">
                                    <el-select style="display: block !important;" filterable clearable
                                               v-model="loanRepaymentForm.disbursementId" :remote-method="customerOpt"
                                               :placeholder="langConfig['client']">
                                        <el-option
                                                v-for="item in disbursementOption"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                                :disabled="item.disabled">
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item :label="langConfig['penalty']" prop="penalty">
                                    <el-input v-model.number="loanRepaymentForm.penaltyPaid" type='number'>
                                        <el-button slot="append">
                                            {{loanRepaymentForm.penalty}} {{currencySymbol}}
                                        </el-button>
                                    </el-input>
                                </el-form-item>
                                <hr>
                                <el-form-item :label="langConfig['paidUSD']" prop="paidUSD">
                                    <el-input v-model.number="loanRepaymentForm.paidUSD" type='number'
                                              @keyup.native="getTotal()" @change.native="getTotal()">
                                        <el-button slot="append">
                                            {{loanRepaymentForm.remainUSD}} $
                                        </el-button>
                                    </el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['paidKHR']" prop="paidKHR">
                                    <el-input v-model.number="loanRepaymentForm.paidKHR" type='number'
                                              @keyup.native="getTotal()" @change.native="getTotal()">
                                        <el-button slot="append">
                                            {{loanRepaymentForm.remainKHR}} ៛
                                        </el-button>
                                    </el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['paidTHB']" prop="paidTHB">
                                    <el-input v-model.number="loanRepaymentForm.paidTHB" type='number'
                                              @keyup.native="getTotal()" @change.native="getTotal()">
                                        <el-button slot="append">
                                            {{loanRepaymentForm.remainKHR}} B
                                        </el-button>
                                    </el-input>
                                </el-form-item>


                                <el-form-item :label="langConfig['note']" prop="note">
                                    <el-input type="textarea" v-model="loanRepaymentForm.note"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row class="pull-right">
                            <el-button @click="dialogAddLoanRepayment = false, cancel()"
                            >{{langConfig['cancel']}} <i>(ESC)</i>
                            </el-button>
                            <el-button type="primary" @click="saveLoanRepayment($event)">{{langConfig['save']}} <i>(Ctrl
                                +
                                Enter)</i></el-button>
                        </el-row>
                    </el-form>

                </el-main>
            </el-container>

        </div>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-loan'
    import {Loan_RepaymentReact} from "../../collection/loanRepayment";
    import {formatCurrency} from "../../../imports/api/methods/roundCurrency";
    import {formatCurrencyLast} from "../../../imports/api/methods/roundCurrency";
    import {GeneralFunction} from "../../../imports/api/methods/generalFunction";
    import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency";
    import {WB_waterBillingSetup} from "../../collection/waterBillingSetup";
    import {Manage_Module} from "../../collection/manageModule";

    export default {
        meteor: {
            langSession() {
                return Session.get('lang') || "en";
            },
            disabledRemove() {
                return Session.get("canRemove");
            },
            disabledUpdate() {
                return Session.get("canUpdate");
            },
            newRe() {
                let vm = this;
                Loan_RepaymentReact.find({}).fetch();
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                langSession: null,
                loanRepaymentForm: {
                    disbursementId: "",
                    currencyId: "",
                    repaymentDate: moment().toDate(),
                    paid: 0,
                    paidUSD: 0,
                    paidKHR: 0,
                    paidTHB: 0,
                    remainUSD: 0,
                    remainKHR: 0,
                    remainTHB: 0,
                    penalty: 0,
                    penaltyPaid: 0,
                    voucher: "",
                    note: "",
                    clientId: "",
                    _id: ""
                },
                rules: {},
                disbursementOption: [],
                currencyOption: [
                    {label: "USD", value: "USD"},
                    {label: "KHR", value: "KHR"},
                    {label: "THB", value: "THB"},
                ],
                repaymentDoc: {},
                skip: 0,
                currencySymbol: "",
                dayLate: 0,
                balance: 0
            }
        },
        watch: {
            "loanRepaymentForm.disbursementId"(val) {
                this.getCalculateAmountPaid(val);
            },
            "loanRepaymentForm.repaymentDate"(val) {
                this.getVoucherByRoleAndDate(val);
                this.loanRepaymentForm.repaymentDate = val;
                this.getCalculateAmountPaid(this.loanRepaymentForm.disbursementId);
            }
        },
        methods: {
            customerOpt(query) {
                if (!!query) {
                    setTimeout(() => {
                        Meteor.call('queryLoanDisbursementOption', query, Session.get("area"), (err, result) => {
                            if (!err) {
                                this.disbursementOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryLoanDisbursementOption', "", Session.get("area"), (err, result) => {
                        if (!err) {
                            this.disbursementOption = result;
                        } else {
                            console.log(err.message);
                        }
                    })
                }
            },
            getCalculateAmountPaid(disbursementId) {
                let vm = this;
                Meteor.call("getAmountNeedToPaid", disbursementId, vm.loanRepaymentForm.repaymentDate, (err, result) => {
                    if (result) {
                        vm.repaymentDoc = result;
                        vm.loanRepaymentForm.clientId = result.clientId;

                        if (vm.loanRepaymentForm.repaymentDate && result.date) {
                            vm.dayLate = moment(vm.loanRepaymentForm.repaymentDate).startOf("days").add(12, "hours").diff(result.date, "days");
                        }
                        vm.dayLate = vm.dayLate > 0 ? vm.dayLate : 0;
                        vm.currencySymbol = getCurrencySymbolById(result && result.currencyId);
                        vm.loanRepaymentForm.remainUSD = formatCurrencyLast(GeneralFunction.exchange(result.currencyId, "USD", vm.$_numeral(result.balanceUnpaid).value(), Session.get("area")), "USD");
                        vm.loanRepaymentForm.remainKHR = formatCurrencyLast(GeneralFunction.exchange(result.currencyId, "KHR", vm.$_numeral(result.balanceUnpaid).value(), Session.get("area")), "KHR");
                        vm.loanRepaymentForm.remainTHB = formatCurrencyLast(GeneralFunction.exchange(result.currencyId, "THB", vm.$_numeral(result.balanceUnpaid).value(), Session.get("area")), "THB");
                        if (result.currencyId === "USD") {
                            vm.loanRepaymentForm.paidUSD = vm.$_numeral(result.balanceUnpaid).value();
                            vm.loanRepaymentForm.paidKHR = 0;
                            vm.loanRepaymentForm.paidTHB = 0;
                        } else if (result.currencyId === "KHR") {
                            vm.loanRepaymentForm.paidUSD = 0;
                            vm.loanRepaymentForm.paidKHR = vm.$_numeral(result.balanceUnpaid).value();
                            vm.loanRepaymentForm.paidTHB = 0;


                        } else if (result.currencyId === "THB") {
                            vm.loanRepaymentForm.paidUSD = 0;
                            vm.loanRepaymentForm.paidKHR = 0;
                            vm.loanRepaymentForm.paidTHB = vm.$_numeral(result.balanceUnpaid).value();
                        }
                        this.getTotal();
                    }
                })
            },
            getTotal() {

                let vm = this;
                vm.balance = vm.repaymentDoc.balanceUnpaid - GeneralFunction.exchange("USD", vm.repaymentDoc.currencyId, vm.loanRepaymentForm.paidUSD, Session.get("area")) - GeneralFunction.exchange("KHR", vm.repaymentDoc.currencyId, vm.loanRepaymentForm.paidKHR, Session.get("area")) - GeneralFunction.exchange("THB", vm.repaymentDoc.currencyId, vm.loanRepaymentForm.paidTHB, Session.get("area"));
                vm.loanRepaymentForm.remainUSD = formatCurrencyLast(GeneralFunction.exchange(vm.repaymentDoc.currencyId, "USD", vm.$_numeral(vm.balance).value(), Session.get("area")), "USD");
                vm.loanRepaymentForm.remainKHR = formatCurrencyLast(GeneralFunction.exchange(vm.repaymentDoc.currencyId, "KHR", vm.$_numeral(vm.balance).value(), Session.get("area")), "KHR");
                vm.loanRepaymentForm.remainTHB = formatCurrencyLast(GeneralFunction.exchange(vm.repaymentDoc.currencyId, "THB", vm.$_numeral(vm.balance).value(), Session.get("area")), "THB");


            },
            getVoucherByRoleAndDate(date) {
                let vm = this;
                Meteor.call("loan_getVoucherNoByRoleAndDate", Session.get("area"), date, (err, result) => {
                    if (!err) {
                        vm.loanRepaymentForm.voucher = result;
                    }
                })
            },
            saveLoanRepayment(event) {
                event.preventDefault();
                let vm = this;
                this.$refs["loanRepaymentForm"].validate((valid) => {
                    if (valid) {
                        let loanRepaymentDoc = {
                            disbursementId: vm.loanRepaymentForm.disbursementId,
                            currencyId: vm.repaymentDoc.currencyId,
                            repaymentDate: vm.loanRepaymentForm.repaymentDate,
                            paidUSD: vm.$_numeral(vm.loanRepaymentForm.paidUSD).value(),
                            paidKHR: vm.$_numeral(vm.loanRepaymentForm.paidKHR).value(),
                            paidTHB: vm.$_numeral(vm.loanRepaymentForm.paidTHB).value(),
                            remainUSD: vm.$_numeral(vm.loanRepaymentForm.remainUSD).value(),
                            remainKHR: vm.$_numeral(vm.loanRepaymentForm.remainKHR).value(),
                            remainTHB: vm.$_numeral(vm.loanRepaymentForm.remainTHB).value(),
                            penalty: vm.$_numeral(vm.loanRepaymentForm.penalty).value(),
                            penaltyPaid: vm.$_numeral(vm.loanRepaymentForm.penaltyPaid).value(),
                            voucher: vm.loanRepaymentForm.voucher,
                            note: vm.loanRepaymentForm.note,
                            dayLate: vm.dayLate,
                            clientId: vm.loanRepaymentForm.clientId,
                            paid: vm.$_numeral(vm.repaymentDoc.balanceUnpaid).value() - vm.getRemainAmountByCurrency(vm.repaymentDoc.currencyId, vm.$_numeral(vm.loanRepaymentForm.remainUSD).value(), vm.$_numeral(vm.loanRepaymentForm.remainKHR).value(), vm.$_numeral(vm.loanRepaymentForm.remainTHB).value()),
                            totalPaid: vm.$_numeral(vm.repaymentDoc.balanceUnpaid).value() - vm.getRemainAmountByCurrency(vm.repaymentDoc.currencyId, vm.$_numeral(vm.loanRepaymentForm.remainUSD).value(), vm.$_numeral(vm.loanRepaymentForm.remainKHR).value(), vm.$_numeral(vm.loanRepaymentForm.remainTHB).value()) + vm.$_numeral(vm.loanRepaymentForm.penaltyPaid).value(),
                            rolesArea: Session.get('area')

                        };

                        console.log(loanRepaymentDoc);
                        Meteor.call("insertLoanRepayment", loanRepaymentDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['saveSuccess'],
                                    type: 'success'
                                });
                                vm.resetForm();
                            } else {
                                vm.$message({
                                    duration: 1000,
                                    message: err.message,
                                    type: 'error'
                                });
                            }
                        })
                    }
                })

            },
            getRemainAmountByCurrency(currency, usd, khr, thb) {
                if (currency === "USD") {
                    return usd;
                } else if (currency === "KHR") {
                    return khr;
                } else if (currency === "THB") {
                    return thb;
                }
            },
            cancel() {
                this.$message({
                    type: 'info',
                    message: this.langConfig['cancel']
                });
            },
            resetForm() {
                this.loanRepaymentForm.disbursementId = "";
                this.loanRepaymentForm.repaymentDate = moment().toDate();
                this.loanRepaymentForm.paidUSD = 0;
                this.loanRepaymentForm.paidKHR = 0;
                this.loanRepaymentForm.paidTHB = 0;
                this.loanRepaymentForm.remainUSD = 0;
                this.loanRepaymentForm.remainKHR = 0;
                this.loanRepaymentForm.remainTHB = 0;
                this.loanRepaymentForm.penalty = 0;
                this.loanRepaymentForm.remainPenalty = 0;
                this.loanRepaymentForm.note = "";

            }
        },
        created() {
            this.customerOpt();
            this.getVoucherByRoleAndDate(moment().toDate());

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['repayment'];
                return data;
            }
        }
    }
</script>


<style>
    .el-header, .el-footer {
        background-color: #B3C0D1;
        color: #333;
        text-align: center;
        line-height: 60px;
    }

    .el-aside {
        background-color: #D3DCE6;
        color: #333;
        text-align: center;
        line-height: 200px;
    }

    .el-main {
        background-color: #E9EEF3;
        color: #333;
        text-align: center;
    }

    body > .el-container {
        margin-bottom: 40px;
    }

    .el-container:nth-child(5) .el-aside,
    .el-container:nth-child(6) .el-aside {
        line-height: 260px;
    }

    .el-container:nth-child(7) .el-aside {
        line-height: 320px;
    }

    .el-form-item__label {
        font-size: 15px !important;
    }
</style>