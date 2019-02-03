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
                                &nbsp;
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

                                <el-form-item :label="langConfig['client']" prop="clientId">
                                    <el-select style="display: block !important;" filterable clearable
                                               v-model="loanRepaymentForm.clientId" :remote-method="customerOpt"
                                               :placeholder="langConfig['client']">
                                        <el-option
                                                v-for="item in clientOption"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                                :disabled="item.disabled">
                                        </el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item :label="langConfig['paid']" prop="paid">
                                    <el-input v-model.number="loanRepaymentForm.paid" type='number'></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['penalty']" prop="penalty">
                                    <el-input v-model.number="loanRepaymentForm.penalty" type='number'></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['currency']" prop="currencyId">
                                    <el-select style="display: block !important;" filterable clearable
                                               v-model="loanRepaymentForm.currencyId"
                                               :placeholder="langConfig['currency']">
                                        <el-option
                                                v-for="item in currencyOption"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                                :disabled="item.disabled">
                                        </el-option>
                                    </el-select>
                                </el-form-item>

                                <el-form-item :label="langConfig['voucher']" prop="voucher">
                                    <el-input v-model="loanRepaymentForm.voucher"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['note']" prop="note">
                                    <el-input type="textarea" v-model="loanRepaymentForm.note"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>

                        <hr style="margin-top: 0px !important;">
                        <el-row class="pull-right">
                            <el-button @click="dialogAddLoanRepayment = false, cancel()"
                            >{{langConfig['cancel']}} <i>(ESC)</i>
                            </el-button>
                            <el-button type="primary" @click="saveLoanRepayment($event)">{{langConfig['save']}} <i>(Ctrl
                                +
                                Enter)</i></el-button>
                        </el-row>
                        <br>
                    </el-form>

                </el-main>
            </el-container>

            <hr>
            <br>

        </div>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-loan'
    import {Loan_RepaymentReact} from "../../collection/loanRepayment";

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
                    clientId: "",
                    currencyId: "",
                    repaymentDate: "",
                    paid: 0,
                    penalty: 0,
                    voucher: "",
                    note: "",
                    _id: ""
                },
                rules: {},
                clientOption: [],
                currencyOption: [
                    {label: "USD", value: "USD"},
                    {label: "KHR", value: "KHR"},
                    {label: "THB", value: "THB"},
                ],
                skip: 0
            }
        },
        watch: {},
        methods: {
            customerOpt(query) {
                if (!!query) {
                    setTimeout(() => {
                        Meteor.call('queryPosCustomerOption', query, Session.get("area"), (err, result) => {
                            if (!err) {
                                this.clientOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryPosCustomerOption', "", Session.get("area"), (err, result) => {
                        if (!err) {
                            this.clientOption = result;
                        } else {
                            console.log(err.message);
                        }
                    })
                }
            },
            saveLoanRepayment(event) {
                event.preventDefault();
                let vm = this;
                /*this.$refs["loanRepaymentFormAdd"].validate((valid) => {
                    if (valid) {
                        let loanRepaymentDoc = {
                            clientId: vm.loanRepaymentForm.clientId,
                            productId: vm.loanRepaymentForm.productId,
                            currencyId: vm.loanRepaymentForm.currencyId,
                            loanAmount: vm.loanRepaymentForm.loanAmount,
                            repaymentFormDate: vm.loanRepaymentForm.repaymentFormDate,
                            repaymentFormDateName: moment(vm.loanRepaymentForm.repaymentFormDate).format("DD/MM/YYYY"),
                            coId: vm.loanRepaymentForm.coId,
                            installment: vm.loanRepaymentForm.installment,
                            description: vm.loanRepaymentForm.description,
                            feeAmount: vm.loanRepaymentForm.feeAmount,
                            startPaidDate: vm.loanRepaymentForm.startPaidDate,
                            rolesArea: Session.get('area')

                        };

                        Meteor.call("insertLoanRepayment", loanRepaymentDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['saveSuccess'],
                                    type: 'success'
                                });
                                vm.dialogAddLoanRepayment = false;
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
                })*/

            },
            cancel() {
                this.$message({
                    type: 'info',
                    message: this.langConfig['cancel']
                });
            },
            resetForm() {
            }
        },
        created() {


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
        line-height: 160px;
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
</style>