<!--suppress ALL -->
<template>
    <div class="posProductList-report">
        <a4>
            <div slot="header" class="no-print">
                <el-row type="flex" class="row-bg" justify="center">
                    <el-col :span="24">
                        <el-card class="box-card">
                            <div slot="header" class="clearfix">
                                <span>{{langConfig['titleFilter']}} <i
                                        class="header-icon el-icon-info"></i></span>
                                <el-button :loading="loading" @click="handleRun(),isBarcode=true" type="primary"
                                           icon="caret-right"
                                           style="float: right"
                                           size="small">{{langConfig['runBarcode']}}
                                </el-button>
                                <el-button :loading="loading" @click="handleRun(),isBarcode=false" type="success"
                                           icon="caret-right"
                                           style="float: right"
                                           size="small">{{langConfig['run']}}
                                </el-button>
                            </div>
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
                      </caption>

                <thead style="margin-top: 5px" v-if="isBarcode===true">
                    <tr>
                        <th>{{langConfig['no']}}</th>
                        <th>{{langConfig['product']}}</th>

                        <!--  <th>{{langConfig['type']}}</th>
                          <th>{{langConfig['description']}}</th>-->
                        <th>{{langConfig['rePrice']}}</th>
                        <th>{{langConfig['whPrice']}}</th>
                        <th>{{langConfig['cost']}}</th>
                        <th>{{langConfig['barcode']}}</th>
                    </tr>
                </thead>
                <tbody style="margin-bottom: 5px;">
                    <tr v-for="(obj ,index) in productDoc.data">
                            <td style="text-align: center !important;">{{index+1}}</td>
                            <td style="text-align: left !important;">{{obj.code}} : {{obj.name}}</td>
                         <td v-if="isBarcode==false">{{obj.productType}}</td>
                         <td v-if="isBarcode==false">{{obj.description || ""}}</td>
                            <td>{{obj.rePrice | numFormatBaseCurrency}}</td>
                            <td>{{obj.whPrice | numFormatBaseCurrency}}</td>
                            <td>{{obj.cost | numFormatBaseCurrency}}</td>
                            <td v-if="isBarcode==true"><barcode :doc="obj" :company="waterBillingSetup"></barcode></td>
                    </tr>
                </tbody>

                     <thead style="margin-top: 5px" v-if="isBarcode===false">
                    <tr>
                        <th>{{langConfig['no']}}</th>
                        <th>{{langConfig['product']}}</th>

                          <th>{{langConfig['type']}}</th>
                          <th>{{langConfig['description']}}</th>
                        <th>{{langConfig['rePrice']}}</th>
                        <th>{{langConfig['whPrice']}}</th>
                        <th>{{langConfig['cost']}}</th>
                    </tr>
                </thead>

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

    import PosBarcodeProduct from '/imports/vue/components/posBarcodeProduct/PosBarcodeProduct';

    export default {
        //mixins: [GenerateFile],
        mounted() {
            this.$jQuery('body').off();

        },
        components: {
            "barcode": PosBarcodeProduct,
            a4: PageA4
        },
        data() {
            return {
                params: {
                    branch: '',
                    area: '',
                    date: null,
                },
                rolesArea: '',
                activeName: '1',
                productDoc: {},
                labelPosition: 'top',
                branchOptions: [],
                areaOptions: [],
                isBarcode: true,

                waterBillingSetup: {
                    khName: '',
                    enName: ''
                },

                loading: false,
                exportLoading: false,

                checkAll: false,
                isIndeterminate: true,

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
            handleRun() {
                this.loading = true;
                Meteor.call('posProductListReport', this.params, (err, result) => {
                    if (result) {
                        this.productDoc = result.productDoc;
                    }
                    this.loading = false;
                });
            }


        },
        computed: {
            dataExist() {
                // return this.posSaleData.length > 0;
            },
            langConfig() {
                let data = compoLangReport.filter(config => config.lang === this.langSessionReport)[0]['productList'];
                return data;
            }
        }
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