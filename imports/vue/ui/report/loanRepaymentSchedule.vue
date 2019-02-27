<!--suppress ALL -->
<template>
    <div class="loanRepaymentSchedule-report">
        <a4>
            <div slot="header" class="no-print">
                <el-row type="flex" class="row-bg" justify="center">
                    <el-col :span="24">
                        <el-card class="box-card">
                            <div slot="header" class="clearfix">
                                <span>{{langConfig['titleFilter']}} <i
                                        class="header-icon el-icon-info"></i></span>
                                <el-button :loading="loading" @click="handleRun" type="primary" icon="caret-right"
                                           style="float: right"
                                           size="small">{{langConfig['run']}}
                                </el-button>
                            </div>
                            <el-form :model="params" :label-loanition="labelPosition" :rules="rules"
                                     ref="loanRepaymentSchedule-report">
                                <el-row type="flex" class="row-bg" justify="center">
                                    <el-col :span="6">
                                        <el-form-item :label="langConfig['branch']">
                                            <el-select filterable v-model="params.branch"
                                                       :placeholder="langConfig['all']" clearable
                                                       style="width: 95%">
                                                <el-option
                                                        v-for="item in branchOptions"
                                                        :label="item.label"
                                                        :value="item.value" :key="item._id">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="6">
                                        <el-form-item :label="langConfig['area']">
                                            <el-select filterable v-model="params.area" clearable
                                                       :placeholder="langConfig['all']"
                                                       style="width: 95%">
                                                <el-option
                                                        v-for="item in areaOptions"
                                                        :label="item.label"
                                                        :value="item.value" :key="item._id">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>

                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['client']" prop="disbursementId">
                                            <el-select filterable v-model="params.disbursementId" clearable
                                                       :placeholder="langConfig['all']" remote :remote-method="clientOpt"
                                                       style="width: 95%">
                                                <el-option
                                                        v-for="item in clientOptions"
                                                        :label="item.label"
                                                        :value="item.value" :key="item._id">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>
                                    </el-col>

                                </el-row>
                            </el-form>

                        </el-card>
                    </el-col>
                </el-row>
            </div>
            <span slot="content" style="margin: 0px !important;">
                <table class="table table-report-block-summary table-bordered">
                      <caption>



<div class="row"
     style="text-align: center !important;display: flex !important;align-items: center !important;justify-content: center !important;margin-left: -100px !important;">
                                     <img style="width: 100px;height: 100px;vertical-align: baseline !important;"
                                          src="/mih.png"
                                          alt="">
                                        <span style="font-family: 'Khmer OS Muol light','Khmer OS Muol';font-size: 15px;vertical-align: middle !important;"><br>
                                            <p style="font-size: 18px;">{{waterBillingSetup.khName}}</p><p>{{waterBillingSetup.enName}}</p>

  <p class="row"
     style="text-align: center !important;font-family:'Khmer OS Battambang';font-size: 11 !important;">
                                  អាស័យដ្ឋាន ៖ {{waterBillingSetup.address}}
                          </p>
                          <p class="row"
                             style="text-align: center !important;font-family:'Khmer OS Battambang';font-size: 11 !important;">
                                  លេខទំនាក់ទំនង ៖ {{waterBillingSetup.phoneNumber}}
                          </p>
                                        </span>
                          </div>
                          <br>

                          <div class="row">
                              <div class="col-lg-3">
                              </div>
                              <div class="col-md-6"
                                   style="text-align: center; border: 0px !important;">
                                  <p style="font-family: 'Khmer OS Muol'; font-size: 15px;">{{langConfig['title']}}</p>
                              </div>
                              <div class="col-lg-3"></div>
                          </div>
                          <div class="row">
                              <div style="width: 25% !important; float:right">
                                  ចំនួនប្រាក់ខ្ចី : {{disbursementDoc.loanAmount | numFormat}}
                              </div>
                              <div style="width: 25% !important;float:right">
                                  ថ្ងៃខ្ចី : {{disbursementDoc.disbursementDateName}}
                              </div>
                              <div style="width: 50% !important;">
                                  លេខគណនីឥណទាន: {{disbursementDoc.loanAcc}}
                              </div>


                          </div>
                          <div class="row">

                               <div style="width: 25% !important; float:right">
                                  អត្រាការប្រាក់: {{productDoc.rate}}%
                              </div>



                              <div style="width: 25% !important;float:right">
                                  ចំនួនដងត្រូវសង: {{disbursementDoc.installment}}
                              </div>

                              <div style="width: 50% !important;">
                                  ឈ្មោះអ្នកខ្ចី : {{clientDoc.name}}
                              </div>


                          </div>
                          <div class="row">
                              <div style="width: 25% !important;float: right">
                                  លើកទី : {{clientDoc.loanCycle || ""}}
                              </div>
                              <div style="width: 25% !important;float: right">
                                  ទូរស័ព្ទ : {{clientDoc.phoneNumber || ""}}
                              </div>
                              <div style="width: 50% !important;">
                                  មន្រ្តីឥណទាន : {{creditOfficerDoc.name || ""}}
                              </div>

                          </div>



                      </caption>

                <thead style="margin-top: 5px">
                    <tr>
                        <th>{{langConfig['no']}}</th>
                        <th>{{langConfig['paidDate']}}</th>
                        <th>{{langConfig['numDay']}}</th>
                        <th>{{langConfig['principle']}}</th>
                        <th>{{langConfig['interest']}}</th>
                        <th>{{langConfig['total']}}</th>
                    </tr>
                </thead>
                <tbody style="margin-bottom: 5px;" v-html="repaymentScheduleHtml">

                </tbody>

            </table>
                 <div class="row" style="width: 100% !important;">
                    <div style="width: 50%;float: left !important;text-align: center !important;">
                        បានឃើញ និង ពិនិត្យត្រឹមត្រូវ<br>.......................... ថ្ងៃទី ............    ខែ  ....................  ឆ្នាំ ...................<br><span
                            style="font-family: 'Khmer OS Muol'">ប្រធាន</span>
                    </div>

                    <div style="width: 50%;float: right !important;text-align: center !important;">
                        .......................... ថ្ងៃទី  ............ ខែ   ....................  ឆ្នាំ  ...................<br><br><b>រៀបចំដោយ</b><br><br>
                    </div>

                </div>
           </span>
        </a4>
    </div>
</template>

<script>
    import PageA4 from '/imports/vue/ui/report/page/PageA4.vue';
    import {GenerateFile} from '/imports/api/mixins/file-saver-fn.js';
    import compoLangReport from '../../../../both/i18n/lang/elem-label-loan-report';

    export default {
        mixins: [GenerateFile],
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                params: {
                    branch: '',
                    area: '',
                    disbursementId: ""
                },
                rolesArea: '',
                activeName: '1',
                repaymentScheduleHtml: "",
                labelPosition: 'top',
                branchOptions: [],
                areaOptions: [],
                clientOptions: [],


                waterBillingSetup: {
                    khName: '',
                    enName: ''
                },

                loading: false,
                exportLoading: false,

                checkAll: false,
                isIndeterminate: true,
                dateHeader: "",
                currencyHeader: "",
                rules: {
                    disbursementId: [{required: true, message: 'Please input Disbursement', trigger: 'change'}],
                },
                disbursementDoc: {},
                clientDoc: {},
                productDoc: {},
                creditOfficerDoc: {},
            };
        },
        meteor: {
            rolesArea() {
                return Session.get('area');
            },
            langSessionReport() {
                return Session.get('lang') || "en";
            }
        },
        watch: {

            "params.branch"(val) {
                this.params.area = "";
                this.fetchArea(val);
            }
        },
        created() {
            Meteor.call('getWaterBillingSetup', Session.get('area'), (err, result) => {
                if (result) {
                    this.waterBillingSetup = result;
                }
            })
            this.fetchBranch();
            this.clientOpt();
        },
        methods: {

            fetchBranch() {
                Meteor.call("queryRoleBranchOptionReport", (err, result) => {
                    if (result) {
                        this.branchOptions = result;
                    }
                })
            },
            fetchArea(branchList) {
                Meteor.call("queryRoleAreaOptionReport", branchList, (err, result) => {
                    if (result) {
                        this.areaOptions = result;
                    }
                })
            },
            clientOpt(query) {
                if (!!query) {
                    setTimeout(() => {
                        let lists = [];
                        Meteor.call('queryLoanDisbursementOption', query,Session.get("area"), (err, result) => {
                            if (!err) {
                                this.clientOptions = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryLoanDisbursementOption', "",Session.get("area"), (err, result) => {
                        if (!err) {
                            this.clientOptions = result;
                        } else {
                            console.log(err.message);
                        }
                    })
                }
            },
            handleRun() {
                this.loading = true;
                this.$refs["loanRepaymentSchedule-report"].validate((valid) => {
                    if (valid) {
                        Meteor.call('loanRepaymentScheduleReport', this.params, this.langConfig, (err, result) => {
                            if (result) {
                                this.repaymentScheduleHtml = result.repaymentScheduleHtml;
                                this.dateHeader = result.dateHeader;
                                this.currencyHeader = result.currencyHeader;

                                this.disbursementDoc = result.disbursementDoc;
                                this.clientDoc = result.clientDoc;
                                this.productDoc = result.productDoc;
                                this.creditOfficerDoc = result.creditOfficerDoc;
                            }
                            this.loading = false;
                        });
                    } else {
                        this.loading = false;
                    }
                })
            }
        },
        computed: {
            dataExist() {
                // return this.loanSaleData.length > 0;
            },
            langConfig() {
                let data = compoLangReport.filter(config => config.lang === this.langSessionReport)[0]['repaymentSchedule'];
                return data;
            }
        },
        components: {
            a4: PageA4
        },
    }
</script>
<style>
    .text {
        font-size: 14px;
    }

    .item {
        margin-bottom: 18px;
    }

    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }

    .clearfix:after {
        clear: both
    }

    .box-card {
        width: 100%;
    }
</style>