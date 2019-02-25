<!--suppress ALL -->
<template>
    <div class="schReExam-report">
        <a4>
            <div slot="header" class="no-print">
                <el-row type="flex" class="row-bg" justify="center">
                    <el-col :span="24">
                        <el-card class="box-card">
                            <div slot="header" class="clearfix">
                                <span> {{langConfig['titleFilter']}} <i class="header-icon el-icon-info"></i></span>
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
                                        <el-form-item :label="langConfig['promotion']">
                                            <el-select filterable v-model="params.promotionId" clearable
                                                       :placeholder="langConfig['all']"
                                                       style="width: 95%">
                                                <el-option
                                                        v-for="item in promotionOptions"
                                                        :label="item.label"
                                                        :value="item.value" :key="item._id">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>

                                    </el-col>


                                    <el-col>
                                        <el-form-item :label="langConfig['generation']" prop="generation">
                                            <el-input-number v-model="params.generation"
                                                             controls-position="right"
                                                             :min="1"></el-input-number>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row type="flex" class="row-bg" justify="center">
                                    <el-col>
                                        <el-form-item :label="langConfig['program']">
                                            <el-select filterable v-model="params.programId" clearable
                                                       :placeholder="langConfig['selectOne']"
                                                       style="width: 95%">
                                                <el-option
                                                        v-for="item in programOptions"
                                                        :label="item.label"
                                                        :value="item.value" :key="item._id">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>

                                    </el-col>
                                    <el-col>
                                        <el-form-item :label="langConfig['major']">
                                            <el-select filterable v-model="params.majorId" clearable
                                                       :placeholder="langConfig['selectOne']"
                                                       style="width: 95%">
                                                <el-option
                                                        v-for="item in majorOptions"
                                                        :label="item.label"
                                                        :value="item.value" :key="item._id">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>

                                    </el-col>
                                    <el-col>
                                        <el-form-item :label="langConfig['year']">
                                            <el-select filterable v-model="params.year" clearable
                                                       :placeholder="langConfig['selectOne']"
                                                       style="width: 95%">
                                                <el-option
                                                        v-for="item in yearOptions"
                                                        :label="item.label"
                                                        :value="item.value" :key="item._id">
                                                </el-option>
                                            </el-select>
                                        </el-form-item>

                                    </el-col>
                                    <el-col>
                                        <el-form-item :label="langConfig['semester']">
                                            <el-select filterable v-model="params.semester" clearable
                                                       :placeholder="langConfig['all']"
                                                       style="width: 95%">
                                                <el-option
                                                        v-for="item in semesterOptions"
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
                <table class="table table-bordered table-header-rotated table-hover" style="overflow-x: scroll !important;width: 100% !important;display:grid !important;">
                      <caption>
                          <div class="row">
                                <div class="col-md-4"
                                     style="text-align: center !important;width: 33% !important; justify-content: center !important;float: left !important;">

                                        <span class="blueOnPrint"
                                              style="font-family:Khmer os muol; font-size: 15px  !important;padding-top: 15px !important;">
 <img style="width: auto;height: 100px; padding-top: 20px !important;"
      src="/mih.png"
      alt=""
      :onLoad="onLoadHandler()">

                                              <p style="font-family: 'Khmer OS Muol' !important;" class="blueOnPrint">{{waterBillingSetup.ministryKhName || ""}}</p>
                                              <p style="font-family: 'Khmer OS Muol' !important;" class="blueOnPrint">{{waterBillingSetup.khName}}</p>
                                            </span>
                              </div>
                              <div class="col-md-4"
                                   style="text-align: center !important;width: 33% !important;float: left !important;">
                                   <span style="text-align: center;font-size: 15px; border: 0px !important;"
                                   >
                                  <p style="font-family: 'Khmer OS Muol' !important;" class="blueOnPrint">ព្រះរាជាណាចក្រកម្ពុជា</p>
                                  <p style="font-family: 'Khmer OS Muol' !important;" class="blueOnPrint">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                                  <p style="font-family:tacteing;font-size: 40px; margin: 0px !important;">6</p>

                              </span>
                              </div>
                              <div class="col-md-4" style="width: 33% !important;float: left !important;">&nbsp;</div>
                          </div>
                          <div class="row">
                              <div class="col-md-12  balckOnPrint" style="text-align: center;">
                                                                   <p style="font-family: 'Khmer OS Moul'">បញ្ចីឈ្មោះសិស្សប្រលងសង {{params.semester==="" ? "" : "ឆមាសទី "}}  {{params.semester}} និស្សិតផ្នែក​ {{programName}}{{majorName}} ឆ្នាំទី {{params.year}} ជំនាន់ {{params.generation}} ឆ្នាំសិក្សា {{yearStudy}}</p>

                                  <p>សម័យប្រលង៖ {{examDate}}</p>
                                  <p style="font-family:tacteing ">rs</p>
                              </div>
                          </div>
                          <div class="row">
                              <div style="width: 50% !important; float:right">
                              </div>
                              <div style="width: 50% !important;">
                              </div>

                          </div>
                      </caption>

                <tbody style="margin-bottom: 5px;" v-html="reExamHtml">

                </tbody>


            </table>
                 <div class="row" style="width: 100% !important;">
                    <div style="width: 50%;float: left !important;text-align: center !important;">
                        <br>
                        <br>
                        បានឃើញ និង ឯកភាព<br><br>
                        ថ្ងៃ ........................    ខែ  ........................ឆ្នាំ .................................<br><br>
                        .......................... ថ្ងៃទី ............    ខែ  ....................  ឆ្នាំ ...................<br><span
                            style="font-family: 'Khmer OS Muol'">ប្រធានគណៈកម្មការមណ្ឌលប្រឡង</span>
                    </div>

                    <div style="width: 50%;float: right !important;text-align: center !important;">
                          ថ្ងៃ ........................    ខែ  ........................ឆ្នាំ .................................<br><br>
                        .......................... ថ្ងៃទី  ............ ខែ   ....................  ឆ្នាំ  ...................<br><br><b>ប្រធានអនុគណៈកម្មការសម្រង់ពិន្ទុ</b><br><br>
                    </div>

                </div>
           </span>
        </a4>
    </div>
</template>

<script>
    import PageA4 from '/imports/vue/ui/report/page/PageA4.vue';
    import {GenerateFile} from '/imports/api/mixins/file-saver-fn.js';
    import compoLangReport from '../../../../both/i18n/lang/elem-label-sch-report';

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
                    programId: "",
                    majorId: "",
                    year: "",
                    promotionId: "",
                    generation: 1,
                    semester: 1

                },
                rolesArea: '',
                activeName: '1',
                reExamHtml: "",
                labelPosition: 'top',
                branchOptions: [],
                areaOptions: [],
                programOptions: [],
                majorOptions: [],
                levelOptions: [],
                promotionOptions: [],


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
                            const end = new Date();
                            const start = new Date();
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
                            const end = new Date();
                            const start = new Date();
                            picker.$emit('pick', [start, end]);
                        }
                    }]
                },
                yearOptions: [
                    {label: "1", value: 1},
                    {label: "2", value: 2},
                    {label: "3", value: 3},
                    {label: "4", value: 4},
                ],
                semesterOptions: [
                    {label: "1", value: 1},
                    {label: "2", value: 2}
                ],
                programName: "",
                majorName: "",
                yearStudy: "",
                examDate: ""

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
            },
            "params.programId"(val) {
                if (val !== "") {
                    this.fetchMajor(val);
                } else {
                    this.params.majorId = "";
                }
            }
        },
        created() {
            Meteor.call('getWaterBillingSetup', Session.get('area'), (err, result) => {
                if (result) {
                    this.waterBillingSetup = result;
                }
            })
            this.fetchBranch();
            this.fetchProgram();
            this.fetchPromotion();
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
            fetchProgram() {
                let selector = {};
                Meteor.call("queryProgramOption", selector, (err, result) => {
                    if (result) {
                        this.programOptions = result;
                    }
                })
            },
            fetchMajor(programId) {
                let selector = {};
                selector.programId = programId;
                Meteor.call("queryMajorOption", selector, (err, result) => {
                    if (result) {
                        this.majorOptions = result;
                    }
                })
            },
            fetchPromotion() {
                let selector = {};
                Meteor.call("queryPromotionOptionNoStatus", selector, (err, result) => {
                    if (result) {
                        this.promotionOptions = result;
                    }
                })
            },
            handleRun() {
                if (this.params.programId === "") {
                    alertify.error("Program can't not empty!!");
                    return false;
                }
                if (this.params.majorId === "") {
                    alertify.error("Major can't not empty!!");
                    return false;
                }
                if (this.params.year === "") {
                    alertify.error("Year can't not empty!!");
                    return false;
                }

                this.loading = true;
                Meteor.call('schReExamReport', this.params, this.langConfig, (err, result) => {
                    if (result) {
                        this.reExamHtml = result.reExamHTML;
                        this.programName = result.programName || "";
                        this.majorName = result.majorName || "";
                        this.yearStudy = result.yearStudy || "";
                        this.examDate = result.examDate || "";
                    }
                    this.loading = false;
                });
            },
            onLoadHandler: function () {
                this.onLoad = true;
            }


        },
        computed: {
            dataExist() {
                // return this.posSaleData.length > 0;
            },
            langConfig() {
                let data = compoLangReport.filter(config => config.lang === this.langSessionReport)[0]['reExam'];
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

    /*.table-header-rotated th.rotate {
        height: 160px;
        width: 40px;
        min-width: 40px;
        max-width: 40px;
        position: relative;
        vertical-align: bottom;
        padding: 0;
        font-size: 12px;
        line-height: 0.8;
    }*/

    /*.table-header-rotated th.rotate > div {
        position: relative;
        top: 0px;
        left: -80px; !* 80 * tan(45) / 2 = 40 where 80 is the height on the cell and 45 is the transform angle*!
        height: 100%;
        -ms-transform: skew(45deg, 0deg);
        -moz-transform: skew(45deg, 0deg);
        -webkit-transform: skew(45deg, 0deg);
        -o-transform: skew(45deg, 0deg);
        transform: skew(45deg, 0deg);
        overflow: hidden;
    }

    .table-header-rotated th.rotate span {
        -ms-transform: skew(-45deg, 0deg) rotate(45deg);
        -moz-transform: skew(-45deg, 0deg) rotate(45deg);
        -webkit-transform: skew(-45deg, 0deg) rotate(45deg);
        -o-transform: skew(-45deg, 0deg) rotate(45deg);
        transform: skew(-45deg, 0deg) rotate(45deg);
        position: absolute;
        bottom: 120px; !* 40 cos(45) = 28 with an additional 2px margin*!
        left: -25px; !*Because it looked good, but there is probably a mathematical link here as well*!
        display: inline-block;
        width: 100%;
        width: 85px; !* 80 / cos(45) - 40 cos (45) = 85 where 80 is the height of the cell, 40 the width of the cell and 45 the transform angle*!
        text-align: left;
        white-space: nowrap; !*whether to display in one line or not*!
    }*/

</style>