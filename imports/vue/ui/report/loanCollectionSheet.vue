<!--suppress ALL -->
<template>
    <div class="loanCollectionSheet-report">
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
                                     ref="loanCollectionSheet-report">
                                <el-row type="flex" class="row-bg" justify="center">
                                    <el-col>
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
                                    <el-col>
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
                                    <el-col>
                                        <el-form-item :label="langConfig['creditOfficer']">
                                            <el-select filterable v-model="params.creditOfficerId" clearable
                                                       :placeholder="langConfig['all']"
                                                       remote :remote-method="fetchCreditOfficer"
                                                       style="width: 95%">
                                                <el-option
                                                        v-for="item in creditOfficerOptions"
                                                        :label="item.label"
                                                        :value="item.value" :key="item._id">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>

                                    </el-col>
                                    <el-col>
                                        <el-form-item :label="langConfig['exchange']" prop="exchangeId">
                                            <el-select filterable v-model="params.exchangeId"
                                                       placeholder="Select One" style="width: 95%">
                                                <el-option
                                                        v-for="item in exchangeOptions"
                                                        :label="item.label"
                                                        :value="item.value" :key="item._id">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>
                                    </el-col>
                                    <el-col>
                                        <el-form-item :label="langConfig['date']">
                                            <el-date-picker
                                                    align="right" style="width: 95%"
                                                    v-model="params.date"
                                                    type="date"
                                                    :placeholder="langConfig['pickDate']"
                                            >
                                            </el-date-picker>
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
                                                                <span style="float: left !important;">{{langConfig['no']}}:.........</span>

                          </div>
                          <div class="row">
                              <div style="widows: 50% !important; float:right">
                                  {{langConfig['currency']}}: {{currencyHeader}}
                              </div>
                              <div style="width: 50% !important;">
                                  {{langConfig['date']}}: {{dateHeader}}
                              </div>

                          </div>
                      </caption>

                <thead style="margin-top: 5px">
                    <tr>
                        <th>{{langConfig['no']}}</th>
                        <th>{{langConfig['loanAccount']}}</th>
                        <th>{{langConfig['clientName']}}</th>
                        <th>{{langConfig['dayLate']}}</th>
                        <th>{{langConfig['currency']}}</th>
                        <th>{{langConfig['phoneNumber']}}</th>
                        <th>{{langConfig['address']}}</th>
                        <th>{{langConfig['principle']}}</th>
                        <th>{{langConfig['interest']}}</th>
                        <th>{{langConfig['penalty']}}</th>
                        <th>{{langConfig['total']}}</th>
                    </tr>
                </thead>
                <tbody style="margin-bottom: 5px;" v-html="loanCollectionSheetHtml">

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
                    date: null,
                    paymentType: "",
                    creditOfficerId: "",
                    exchangeId: ""
                },
                rolesArea: '',
                activeName: '1',
                loanCollectionSheetHtml: "",
                labelPosition: 'top',
                branchOptions: [],
                areaOptions: [],
                creditOfficerOptions: [],
                exchangeOptions: [],


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
                paymentTypeOptions: [
                    {label: "Fee", value: "Fee"},
                    {label: "CollectionSheet", value: "CollectionSheet"},
                    {label: "Prepay", value: "Prepay"},
                    {label: "Pay Off", value: "Pay Off"},
                ],

                rules: {
                    exchangeId: [{required: true, message: 'Please input Exchange', trigger: 'change'}]
                },
                pickerDateOptions: {
                    shortcuts: [{
                        text: 'Last week',
                        onClick(picker) {
                            const end = moment().endOf("day").toDate();
                            const start= moment().startOf("day").toDate();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: 'Last month',
                        onClick(picker) {
                            const end = moment().add(-1, "month").endOf("month").toDate();
                            const start = moment().add(-1, "month").startOf("month").toDate();
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: 'Last 3 months',
                        onClick(picker) {
                            const end = moment().add(-1, "month").endOf("month").toDate();
                            const start = moment().add(-4, "month").startOf("month").toDate();
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: 'This month',
                        onClick(picker) {
                            const end = moment().endOf("month").toDate();
                            const start = moment().startOf("month").toDate();
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: 'Today',
                        onClick(picker) {
                            const end = moment().endOf("day").toDate();
                            const start= moment().startOf("day").toDate();
                            picker.$emit('pick', [start, end]);
                        }
                    }]
                }
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
            this.fetchExchange();
            this.fetchCreditOfficer();
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
            fetchExchange() {
                Meteor.call('queryExchangeOptionReport', (err, result) => {
                    if (result) {
                        this.exchangeOptions = result;
                    }
                });
            },
            fetchCreditOfficer(query) {
                if (!!query) {
                    setTimeout(() => {
                        Meteor.call('queryLoanCreditOfficerOption', query, Session.get("area"), (err, result) => {
                            if (!err) {
                                this.creditOfficerOptions = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryLoanCreditOfficerOption', "", Session.get("area"), (err, result) => {
                        if (!err) {
                            this.creditOfficerOptions = result;
                        } else {
                            console.log(err.message);
                        }
                    })
                }
            },
            handleRun() {
                this.loading = true;

                if (this.params.date == "" || this.params.date == undefined) {
                    alertify.error("Date can't not empty!!");
                    this.loading = false;
                    return false;
                }
                this.$refs["loanCollectionSheet-report"].validate((valid) => {
                    if (valid) {
                        Meteor.call('loanCollectionSheetReport', this.params, this.langConfig, (err, result) => {
                            if (result) {
                                this.loanCollectionSheetHtml = result.loanCollectionSheetHTML;
                                this.dateHeader = result.dateHeader;
                                this.currencyHeader = result.currencyHeader;
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
                let data = compoLangReport.filter(config => config.lang === this.langSessionReport)[0]['collectionSheet'];
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