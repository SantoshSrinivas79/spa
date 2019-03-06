<!--suppress ALL -->
<template>
    <div class="ledger-report">
        <a4>
            <div slot="header" class="no-print">
                <el-row type="flex" class="row-bg" justify="center">
                    <el-col :span="24">


                        <el-card class="box-card">
                            <div slot="header" class="clearfix">
                                <span>Ledger Report Filter <i class="header-icon el-icon-info"></i>
                            For each account in your chart of accounts, the report shows all the transactions that occurred in that account over a period of time. It includes the beginning balance and total for each account.
                       </span>
                                <el-button :loading="loading" @click="handleRun" type="primary" icon="caret-right"
                                           style="float: right"
                                           size="small">RUN REPORT
                                </el-button>
                            </div>
                            <el-form :label-position="labelPosition">
                                <el-row type="flex" class="row-bg" justify="center">
                                    <el-col>
                                        <el-form-item label="Branch">
                                            <el-select filterable v-model="params.branch"
                                                       placeholder="All" clearable>
                                                <el-option
                                                        v-for="item in branchOptions"
                                                        :label="item.label"
                                                        :value="item.value" :key="item._id">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>
                                        <el-form-item label="Currency">
                                            <el-select filterable v-model="params.currency" placeholder="All"
                                                       clearable>
                                                <el-option
                                                        v-for="item in currencyOptions"
                                                        :label="item.label"
                                                        :value="item.value" :key="item._id">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>
                                    </el-col>
                                    <el-col>
                                        <el-form-item label="Area">
                                            <el-select filterable v-model="params.area" clearable placeholder="All">
                                                <el-option
                                                        v-for="item in areaOptions"
                                                        :label="item.label"
                                                        :value="item.value" :key="item._id">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>
                                        <el-form-item label="Date">
                                            <el-date-picker
                                                    v-model="params.date"
                                                    type="daterange"
                                                    placeholder="Pick a range"
                                                    :picker-options="pickerOptions"
                                                    align="right">
                                            </el-date-picker>
                                        </el-form-item>
                                    </el-col>
                                    <el-col>
                                        <el-form-item label="Exchange">
                                            <el-select filterable v-model="params.exchangeId"
                                                       placeholder="Select One">
                                                <el-option
                                                        v-for="item in exchangeOptions"
                                                        :label="item.label"
                                                        :value="item.value" :key="item._id">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>
                                    </el-col>
                                    <el-col>
                                        <el-form-item label="Account Type">
                                            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll"
                                                         @change="handleCheckAllChange">Check all
                                            </el-checkbox>
                                            <hr style="margin: 0px; padding: 0px">
                                            <el-checkbox-group v-model="params.checkedAccountType"
                                                               @change="handleCheckedAccountTypeChange">
                                                <div style="padding: 6px;list-style: none;height: 150px;overflow: auto;box-sizing: border-box;">
                                                    <div style="margin: 0px;"
                                                         v-for="accountType in accountTypes">
                                                        <el-checkbox :label="accountType.value"
                                                                     :key="accountType.value"
                                                                     style="margin: 0px">{{accountType.label}}
                                                        </el-checkbox>
                                                    </div>
                                                </div>
                                            </el-checkbox-group>
                                        </el-form-item>
                                    </el-col>
                                    <el-col>
                                        <el-form-item label="Account">
                                            <el-select filterable v-model="params.account" clearable
                                                       placeholder="All">
                                                <el-option
                                                        v-for="item in accountOptions"
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
                              <div class="col-md-3">

                              </div>
                              <div class="col-md-6"
                                   style="text-align: center;font-family: 'Khmer OS Muol'; font-size: 15px; border: 0px !important;">
                                  <p>Ledger Report</p>
                              </div>
                              <div class="col-md-3">
                              </div>
                          </div>



                          <div class="row">
                                  លេខ..........{{waterBillingSetup.khShortName}}
                          </div>
                          <div style="width: 100%;display: inline-block">
                              <div style="float: right;width: 50%;text-align: right !important;">
                                  Currency: {{currencyHeader}}
                              </div>
                              <div style="width: 50%">
                                  Date: {{dateHeader}}
                              </div>

                          </div>
                      </caption>

                <thead style="margin-top: 5px">
                    <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Voucher</th>
                        <th>Memo/Description</th>
                        <th>Split</th>
                        <th>Amount</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody style="margin-bottom: 5px;" v-html="ledgerHtml">

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
                    currency: '',
                    checkedAccountType: [],
                    account: "",
                    date: null,
                    exchangeId: ""
                },
                rolesArea: '',
                activeName: '1',
                ledgerHtml: "",
                labelPosition: 'top',
                branchOptions: [],
                areaOptions: [],
                exchangeOptions: [],
                currencyOptions: [
                    {label: "KHR", value: "KHR"},
                    {label: "USD", value: "USD"},
                    {label: "THB", value: "THB"},
                ],
                accountOptions: [],

                waterBillingSetup: {
                    khName: '',
                    enName: ''
                },

                loading: false,
                exportLoading: false,

                checkAll: false,
                accountTypeOptions: [],
                accountTypes: [],
                isIndeterminate: true,
                dateHeader: "",
                currencyHeader: "",
                pickerOptions: {
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
                },
            };
        },
        meteor: {
            rolesArea() {
                return Session.get('area');
            }
        },
        watch: {

            "params.branch"(val) {
                this.params.area = "";
                this.fetchArea(val);
            },
            "params.checkedAccountType"(val) {
                this.fetchAccount(val);
            }
        },
        created() {
            Meteor.call('getWaterBillingSetup', Session.get('area'), (err, result) => {
                if (result) {
                    this.waterBillingSetup = result;
                }
            })
            this.fetchAccountType();
            this.fetchExchange();
            this.fetchBranch();
        },
        methods: {

            fetchAccountType() {
                Meteor.call('queryAccountTypeOptionReport', (err, result) => {
                    if (result) {
                        this.accountTypeOptions = result.listWithId;
                        this.accountTypes = result.list;
                    }
                });
            },
            fetchExchange() {
                Meteor.call('queryExchangeOptionReport', (err, result) => {
                    if (result) {
                        this.exchangeOptions = result;
                    }
                });
            },
            fetchAccount(accountTypeList) {
                let selector = {};
                selector.accountTypeId = {$in: accountTypeList}
                Meteor.call('queryChartAccountOptionReport', selector, (err, result) => {
                    if (result) {
                        this.accountOptions = result;
                    }
                });
            },
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
            handleRun() {
                this.loading = true;

                if (this.params.date == "" || this.params.date == undefined) {
                    alertify.error("Date can't not empty!!");
                    this.loading = false;
                    return false;
                }
                if (this.params.exchangeId == "" || this.params.exchangeId == undefined) {
                    alertify.error("Exchange can't not empty!!");
                    this.loading = false;
                    return false;
                }

                Meteor.call('ledgerReport', this.params, (err, result) => {
                    if (result) {
                        this.ledgerHtml = result.ledgerHTML;
                        this.dateHeader = result.dateHeader;
                        this.currencyHeader = result.currencyHeader;

                    }
                    this.loading = false;
                });
            },
            handleCheckAllChange() {
                this.params.checkedAccountType = this.checkAll ? this.accountTypeOptions : [];
                this.isIndeterminate = false;
            },
            handleCheckedAccountTypeChange(value) {
                let checkedCount = value.length;
                this.checkAll = checkedCount === this.accountTypes.length;
                this.isIndeterminate = checkedCount > 0 && checkedCount < this.accountTypes.length;
            },


        },
        computed: {
            dataExist() {
                return this.journalsData.length > 0;
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