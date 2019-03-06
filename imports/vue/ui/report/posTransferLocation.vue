<!--suppress ALL -->
<template>
    <div class="posTransferLocation-report">
        <a4>
            <div slot="header" class="no-print">
                <el-row type="flex" class="row-bg" justify="center">
                    <el-col :span="24">
                        <el-card class="box-card">
                            <div slot="header" class="clearfix">
                                <span>{{langConfig['titleFilter']}} <i class="header-icon el-icon-info"></i></span>
                                <el-button :loading="loading" @click="handleRun" type="primary" icon="caret-right"
                                           style="float: right"
                                           size="small">{{langConfig['run']}}
                                </el-button>
                            </div>
                            <el-form :label-position="labelPosition">
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
                                        <el-form-item :label="langConfig['locationFrom']">
                                            <el-select filterable v-model="params.locationFromId" clearable
                                                       :placeholder="langConfig['all']"
                                                       style="width: 95%">
                                                <el-option
                                                        v-for="item in locationOptions"
                                                        :label="item.label"
                                                        :value="item.value" :key="item._id">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>

                                    </el-col>
                                    <el-col>
                                        <el-form-item :label="langConfig['locationTo']">
                                            <el-select filterable v-model="params.locationToId" clearable
                                                       :placeholder="langConfig['all']"
                                                       style="width: 95%">
                                                <el-option
                                                        v-for="item in locationOptions"
                                                        :label="item.label"
                                                        :value="item.value" :key="item._id">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>

                                    </el-col>
                                    <el-col>
                                        <el-form-item :label="langConfig['dateRange']">
                                            <el-date-picker
                                                    align="right" style="width: 95%"
                                                    v-model="params.date"
                                                    type="daterange"
                                                    :picker-options="pickerDateOptions"
                                                    :placeholder="langConfig['pickDateRange']"
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
                        <th>{{langConfig['date']}}</th>
                        <th>{{langConfig['item']}}</th>
                        <th>{{langConfig['qty']}}</th>
                        <th>{{langConfig['cost']}}</th>
                        <th>{{langConfig['amount']}}</th>
                    </tr>
                </thead>
                <tbody style="margin-bottom: 5px;" v-html="transferLocationHtml">

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
    import compoLangReport from '../../../../both/i18n/lang/elem-label-report';

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
                    locationFromId: "",
                    locationToId: ""
                },
                rolesArea: '',
                activeName: '1',
                transferLocationHtml: "",
                labelPosition: 'top',
                branchOptions: [],
                areaOptions: [],
                locationOptions: [],


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
            this.fetchLocation();
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
            fetchLocation(branchList) {
                Meteor.call("queryLocationOptionReport", Session.get('area'), (err, result) => {
                    if (result) {
                        this.locationOptions = result;
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
                Meteor.call('posTransferLocationReport', this.params, this.langConfig, (err, result) => {

                    if (result) {
                        this.transferLocationHtml = result.transferLocationHTML;
                        this.dateHeader = result.dateHeader;
                        this.currencyHeader = result.currencyHeader;
                    }
                    this.loading = false;
                });
            }


        },
        computed: {
            dataExist() {
                // return this.posSaleData.length > 0;
            }, langConfig() {
                let data = compoLangReport.filter(config => config.lang === this.langSessionReport)[0]['transferLocation'];
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