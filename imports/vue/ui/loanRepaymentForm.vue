<template>
    <div class="loan_repaymentForm">
        <div class="card card-stats">
            <el-container>
                <el-header>Header</el-header>
                <el-main>Main</el-main>
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
                    _id: ""
                },
                rules: {},
                clientOption: [],
                currencyOption: [
                    {label: "USD", value: "USD"},
                    {label: "KHR", value: "KHR"},
                    {label: "THB", value: "THB"},
                ],
                productTypeOption: [
                    {label: "Weekly", value: "Weekly"},
                    {label: "Monthly", value: "Monthly"},
                    {label: "Yearly", value: "Yearly"},
                ],
                productOption: [],
                creditOfficerOption: [],
                skip: 0
            }
        },
        watch: {},
        methods: {
            customerOpt(query) {
                if (!!query) {
                    setTimeout(() => {
                        Meteor.call('queryPosCustomerOption', query,Session.get("area"), (err, result) => {
                            if (!err) {
                                this.clientOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryPosCustomerOption', "",Session.get("area"), (err, result) => {
                        if (!err) {
                            this.clientOption = result;
                        } else {
                            console.log(err.message);
                        }
                    })
                }
            },
            creditOfficerOpt(query) {
                if (!!query) {
                    setTimeout(() => {
                        Meteor.call('queryLoanCreditOfficerOption', query,Session.get("area"), (err, result) => {
                            if (!err) {
                                this.creditOfficerOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryLoanCreditOfficerOption', "",Session.get("area"), (err, result) => {
                        if (!err) {
                            this.creditOfficerOption = result;
                        } else {
                            console.log(err.message);
                        }
                    })
                }
            },
            productOpt(query) {
                if (!!query) {
                    setTimeout(() => {
                        Meteor.call('queryLoanProductOption', query, (err, result) => {
                            if (!err) {
                                this.productOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryLoanProductOption', "", (err, result) => {
                        if (!err) {
                            this.productOption = result;
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