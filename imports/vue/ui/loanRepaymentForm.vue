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

                            <el-col :span="12" v-if="!isFee">
                                <div class="ui segments plan">
                                    <div class="ui top attached segment teal inverted plan-title">
                                        <span class="ui header">{{langConfig['amountNeedToPaid']}}</span>

                                    </div>
                                    <div class="ui  attached segment feature">
                                        <div class="amount">{{balanceNeedToPaidShow}}{{currencySymbol}}</div>
                                    </div>
                                </div>

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
                                    &nbsp;: {{repaymentDoc && repaymentDoc.principleUnpaid || "" |
                                    numFormatBaseCurrency(currencyId)}}
                                    {{currencySymbol}}
                                </el-form-item>
                                <el-form-item :label="langConfig['interestDue']" style="text-align: left !important;">
                                    &nbsp;: {{repaymentDoc && repaymentDoc.interestUnpaid || "" |
                                    numFormatBaseCurrency(currencyId)}}
                                    {{currencySymbol}}
                                </el-form-item>
                                <el-form-item :label="langConfig['dayLate']" style="text-align: left !important;">
                                    &nbsp;: {{dayLate}} ថ្ងៃ
                                </el-form-item>
                                <el-form-item :label="langConfig['totalDue']" style="text-align: left !important;">
                                    <b>&nbsp;: {{repaymentDoc && repaymentDoc.balanceUnpaid || "" |
                                        numFormatBaseCurrency(currencyId)}}
                                        {{currencySymbol}}</b>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12" v-if="isFee">
                                <div class="ui segments plan">
                                    <div class="ui top attached segment teal inverted plan-title">
                                        <span class="ui header">{{langConfig['amountNeedToPaid']}}</span>
                                    </div>
                                    <div class="ui  attached segment feature">
                                        <div class="amount">{{balanceNeedToPaidShow}}{{currencySymbol}}</div>
                                    </div>
                                </div>
                                <el-form-item :label="langConfig['loanAcc']" style="text-align: left !important;">
                                    &nbsp;: {{repaymentDoc && repaymentDoc &&
                                    repaymentDoc.loanAcc || ""}} => [{{repaymentDoc && repaymentDoc.loanAmount || "" |
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
                                <el-form-item :label="langConfig['feeAmount']" style="text-align: left !important;">
                                    <b>&nbsp;: {{repaymentDoc && repaymentDoc.feeAmount || "" |
                                        numFormatBaseCurrency(currencyId)}}
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

                                <el-form-item prop="voucher">
                                    <el-radio-group v-model="loanRepaymentForm.type">
                                        <el-radio-button label="Fee" v-if="isFee"></el-radio-button>
                                        <el-radio-button label="Repayment" v-if="!isFee"></el-radio-button>
                                        <el-radio-button label="Prepay" v-if="!isFee"></el-radio-button>
                                        <el-radio-button label="Pay Off" v-if="!isFee"></el-radio-button>
                                        <el-radio-button label="Write Off" v-if="!isFee"></el-radio-button>
                                    </el-radio-group>
                                </el-form-item>

                                <el-form-item :label="langConfig['penalty']" prop="penalty">
                                    <el-input v-model.number="loanRepaymentForm.penaltyPaid" type='number'
                                              @keyup.native="getTotal()" @change.native="getTotal()"
                                              :disabled="isFee"
                                    >
                                    <el-button slot="append">
                                        <b>{{loanRepaymentForm.penalty}} {{currencySymbol}}</b>
                                    </el-button>
                                    </el-input>
                                </el-form-item>
                                <hr>
                                <el-form-item :label="langConfig['paid']" prop="paid">
                                    <el-input v-model.number="loanRepaymentForm.paid" type='number' :disabled="isFee"
                                              @keyup.native="getTotal()" @change.native="getTotal()">
                                        <el-button slot="append">
                                            <b>{{currencySymbol}}</b>
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
    import math from "mathjs";

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
                    penalty: 0,
                    penaltyPaid: 0,
                    voucher: "",
                    note: "",
                    clientId: "",
                    type: "Repayment",
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
                currencyId: "",
                dayLate: 0,
                balance: 0,
                balanceNeedToPaidShow: 0,
                isFee: false,
                isPrepay: false
            }
        },
        watch: {
            "loanRepaymentForm.disbursementId"(val) {
                this.getDisbursementById(val);
            },
            "loanRepaymentForm.repaymentDate"(val) {
                this.getVoucherByRoleAndDate(val);
                this.loanRepaymentForm.repaymentDate = val;
                this.getDisbursementById(this.loanRepaymentForm.disbursementId);
            },
            "loanRepaymentForm.type"(val) {
                this.loanRepaymentForm.type = val;
                this.getDisbursementById(this.loanRepaymentForm.disbursementId);
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

                        if (result && result.penaltyDoc && vm.dayLate > result.penaltyDoc.graceDay) {
                            let penaltyPerday;
                            if (result.currencyId === "USD") {
                                penaltyPerday = result.penaltyDoc.amountUSD;
                            } else if (result.currencyId === "KHR") {
                                penaltyPerday = result.penaltyDoc.amountKHR;
                            } else if (result.currencyId === "THB") {
                                penaltyPerday = result.penaltyDoc.amountTHB;
                            }

                            if (result.penaltyDoc.type === "A") {
                                vm.loanRepaymentForm.penalty = formatCurrencyLast((vm.dayLate - result.penaltyDoc.graceDay) * penaltyPerday, result.currencyId);
                            } else if (result.penaltyDoc.type === "P") {
                                vm.loanRepaymentForm.penalty = formatCurrencyLast((vm.dayLate - result.penaltyDoc.graceDay) * (penaltyPerday * result.principleUnpaid / 100), result.currencyId);
                            }
                        } else {
                            vm.loanRepaymentForm.penalty = 0;
                        }


                        vm.currencySymbol = getCurrencySymbolById(result && result.currencyId);
                        vm.currencyId = result.currencyId;
                        vm.loanRepaymentForm.penaltyPaid = vm.$_numeral(vm.loanRepaymentForm.penalty).value();
                        vm.loanRepaymentForm.paid = vm.$_numeral(formatCurrencyLast(result.balanceUnpaid || 0, result.currencyId)).value();
                        this.getTotal();
                    }
                })
            },
            getCalculatePrepayPaid(disbursementId) {
                let vm = this;
                Meteor.call("getPrepayToPaid", disbursementId, vm.loanRepaymentForm.repaymentDate, (err, result) => {
                    if (result) {
                        vm.isPrepay = true;
                        vm.repaymentDoc = result;
                        vm.loanRepaymentForm.clientId = result.clientId;

                        vm.dayLate = 0;
                        vm.loanRepaymentForm.penalty = 0;
                        vm.currencySymbol = getCurrencySymbolById(result && result.currencyId);
                        vm.currencyId = result.currencyId;

                        vm.loanRepaymentForm.paid = vm.$_numeral(formatCurrencyLast(result.balanceUnpaid || 0, result.currencyId)).value();
                        this.getTotal();
                    }
                })
            },
            getCalculateClosingPaid(disbursementId) {
                let vm = this;
                Meteor.call("getClosingPaid", disbursementId, vm.loanRepaymentForm.repaymentDate, (err, result) => {
                    if (result) {
                        vm.repaymentDoc = result;
                        vm.loanRepaymentForm.clientId = result.clientId;

                        vm.dayLate = 0;
                        vm.loanRepaymentForm.penalty = 0;
                        vm.currencySymbol = getCurrencySymbolById(result && result.currencyId);
                        vm.currencyId = result.currencyId;

                        vm.loanRepaymentForm.paid = vm.$_numeral(formatCurrencyLast(result.balanceUnpaid || 0, result.currencyId)).value();
                        this.getTotal();
                    }
                })
            },
            getCalculateFeePaid(disbursementId) {
                let vm = this;
                Meteor.call("getFeeNeedToPaid", disbursementId, (err, result) => {
                    if (result) {
                        vm.repaymentDoc = result;
                        vm.loanRepaymentForm.clientId = result.clientId;
                        vm.dayLate = 0;
                        vm.loanRepaymentForm.penalty = 0;


                        vm.currencySymbol = getCurrencySymbolById(result && result.currencyId);
                        vm.currencyId = result.currencyId;

                        vm.loanRepaymentForm.paid = vm.$_numeral(formatCurrencyLast(result.feeAmount || 0, result.currencyId)).value();

                        vm.getTotal();
                    }
                })
            },
            getTotal() {
                let vm = this;
                vm.balanceNeedToPaidShow = formatCurrencyLast(vm.loanRepaymentForm.penaltyPaid + vm.loanRepaymentForm.paid, vm.repaymentDoc.currencyId);
            },
            getVoucherByRoleAndDate(date) {
                let vm = this;
                Meteor.call("loan_getVoucherNoByRoleAndDate", Session.get("area"), date, (err, result) => {
                    if (!err) {
                        vm.loanRepaymentForm.voucher = result;
                    }
                })
            },
            getDisbursementById(id) {
                let vm = this;
                Meteor.call("queryLoanDisbursementById", id, (err, result) => {
                    if (result) {
                        vm.isFee = math.round(result.feeAmount - result.paidFeeAmount) > 0;
                        if (vm.isFee === true) {
                            vm.repaymentDoc.disbursementDoc = result;
                            vm.dayLate = 0;
                            vm.getCalculateFeePaid(id);
                            vm.loanRepaymentForm.type = "Fee";
                        } else {
                            if (vm.loanRepaymentForm.type === "Repayment") {
                                vm.getCalculateAmountPaid(id);
                            } else if (vm.loanRepaymentForm.type === "Prepay") {
                                vm.getCalculatePrepayPaid(id);
                            } else if (vm.loanRepaymentForm.type === "Pay Off") {
                                vm.getCalculateClosingPaid(id);
                            } else {
                                if (vm.isFee === false) {
                                    vm.getCalculateAmountPaid(id);
                                    vm.loanRepaymentForm.type = "Repayment";
                                }
                            }

                        }
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
                            remain: vm.$_numeral(vm.loanRepaymentForm.remain).value(),
                            penalty: vm.$_numeral(vm.loanRepaymentForm.penalty).value(),
                            penaltyPaid: vm.$_numeral(vm.loanRepaymentForm.penaltyPaid).value(),
                            voucher: vm.loanRepaymentForm.voucher,
                            note: vm.loanRepaymentForm.note,
                            type: vm.loanRepaymentForm.type,
                            dayLate: vm.dayLate,
                            clientId: vm.loanRepaymentForm.clientId,
                            paid: vm.$_numeral(vm.loanRepaymentForm.paid).value(),
                            totalPaid: vm.$_numeral(vm.loanRepaymentForm.paid + vm.loanRepaymentForm.penaltyPaid).value(),
                            rolesArea: Session.get('area')
                        };

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
                this.loanRepaymentForm.paid = 0;

                this.loanRepaymentForm.remain = 0;
                this.loanRepaymentForm.penalty = 0;
                this.loanRepaymentForm.penaltyPaid = 0;
                this.balanceNeedToPaidShow = 0;
                this.loanRepaymentForm.note = "";
                this.repaymentDoc = {};

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