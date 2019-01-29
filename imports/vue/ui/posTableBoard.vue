<template>
    <div class="pos_tableBoard">
        <body class="custom-login-background-coffee">

        <div class="card card-stats" style="background-color: black !important; color:white !important;">
            <div class="card-header card-header-icon" data-background-color="purple" @click="goToInvoice">
                <i class="material-icons"><i class="material-icons">cancel</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a style="color: white !important;" class="cursor-pointer">
                            <p>Login As : {{username}}</p>
                            <p>Today : {{todaySt}}</p>
                            <p>Time : {{timeSt}}</p>
                        </a>
                    </h4>
                </el-col>

                <el-col :span="16" style="text-align: right; margin-right: 10px">
                    <br>
                    <el-row type="flex" justify="center">
                        <el-col :span="16" class="pull-left">
                            <el-radio v-for="tl in tableLocationOption" style="color: white !important;"
                                      v-model="tableLocation" :label="tl.value"
                                      :key="tl.value"
                                      border>{{tl.label}}
                            </el-radio>
                        </el-col>
                        <el-col :span="8">
                            <el-input
                                    :placeholder="langConfig['searchHere']"
                                    suffix-icon="el-icon-search"
                                    v-model="searchData"
                            >
                            </el-input>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
            <hr>
            <br>
            <slot v-if="loading">
                <div class="row">
                    <div class="col-md-12" style="padding: 30px; margin-top: 70px">
                        <!--<loader></loader>-->
                    </div>
                </div>
            </slot>

            <slot v-else>
                <div style="margin-left: 50px;">
                    <el-row>
                        <el-col style="padding-bottom: 40px !important;" :span="3"
                                v-for="(d, index) in posTableData"
                                :key="d._id"
                                :offset="index > 0 ? index%6===0 ? 0 : 1 : 0">
                            <el-card :body-style="{ padding: '0px' }" @click.native="popUpOpenInvoice(d)">
                                <transition v-show=true name="el-zoom-in-center">

                                    <div v-if="d.status===true" class="transition-box-full">
                                        {{d.name}}<br> <span
                                            style="float: left !important;"> <i
                                            class="material-icons">location_on</i> &nbsp;<span
                                            style="padding-top: 12px !important;">{{d.tableLocationDoc.name || "0"}}</span>
                                        </span>
                                    </div>
                                    <div v-if="d.status===false" class="transition-box-empty">
                                        {{d.name}}<br> <span
                                            style="float: left !important;"> <i
                                            class="material-icons">location_on</i> &nbsp;<span
                                            style="padding-top: 12px !important;">{{d.tableLocationDoc.name || "0"}}</span>
                                        </span>
                                    </div>

                                </transition>
                                <!--<div class="bottom clearfix">
                                    <time class="time" style="float: left !important;">{{d.status}}
                                    </time>
                                    <el-button type="success" round icon="el-icon-check"
                                               style="float: right !important;">
                                        {{langConfig['order']}}
                                    </el-button>
                                </div>-->
                            </el-card>
                        </el-col>
                    </el-row>
                </div>
                <div>
                    <span></span>
                </div>
                <!--Pagination-->
                <br>

            </slot>
            <!--End Pagination-->
        </div>
        </body>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label'
    import {Pos_TableReact} from "../../collection/posTable";

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
                Pos_TableReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();
            this.time();

        },
        data() {

            return {
                tabPosition: 'left',
                fullScreen: true,
                dialogAddPosTableResult: false,
                ref: "",
                labelPosition: top,
                posTableData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 12000,
                count: 0,
                productOption: [],
                locationOption: [],
                convertData: [{
                    productId: "",
                    qty: 0
                }],
                posClassForm: {
                    name: "",
                    khName: "",
                    code: "",
                    desc: "",
                    _id: "",
                    teacherId: "",
                    programId: "",
                    status: false
                },
                posTableResultForm: {
                    locationId: "",
                    date: moment().toDate(),
                    description: "",
                    convert: [],
                    _id: "",
                    tableId: ""
                },

                rules: {},
                tableResultRules: {
                    date: [{
                        type: 'date',
                        required: true,
                        message: 'Please input PayBillDate',
                        trigger: 'blur'
                    }],
                    locationId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Location',
                        trigger: 'change'
                    }]
                },
                tableOption: [],
                tableLocationOption: [],
                skip: 0,
                username: Meteor.user().username,
                todaySt: "",
                timeSt: "",
                tableLocation: ""
            }

        }
        ,
        watch: {
            currentSize(val) {
                this.isSearching = true;
                this.skip = (this.currentPage - 1) * val;
                this.queryData(this.searchData, this.skip, val + this.skip);
            }
            ,
            currentPage(val) {
                this.isSearching = true;
                this.skip = (val - 1) * this.currentSize;
                this.queryData(this.searchData, this.skip, this.currentSize + this.skip);
            }
            ,
            searchData(val) {
                this.isSearching = true;
                this.skip = (this.currentPage - 1) * this.currentSize;
                this.queryData(val, this.skip, this.currentSize + this.skip);
            },
            tableLocation(val) {
                this.queryData(val);
            }
        }
        ,
        methods: {
            handleSizeChange(val) {
                this.currentSize = val;
            }
            ,
            handleCurrentChange(val) {
                this.currentPage = val;
            }
            ,
            handleCloseModal() {

                this.resetForm();
                this.refForm = "";
            },
            goToInvoice() {
                FlowRouter.go("/pos-sale/posInvoice");
            }
            ,
            queryData: _.debounce(function (val, skip, limit) {
                Meteor.call('queryPosTable', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 1200}
                }, (err, result) => {
                    if (!err) {
                        this.posTableData = result.content;
                        this.count = result.countPosTable;
                    }
                    this.isSearching = false;
                });
            }, 300),
            indexMethod(index) {
                return index + 1;
            },
            productOpt(query) {
                if (!!query) {
                    setTimeout(() => {
                        Meteor.call('queryItemOption', query, (err, result) => {
                            if (!err) {
                                this.productOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryItemOption', "", (err, result) => {
                        if (!err) {
                            this.productOption = result;
                        } else {
                            console.log(err.message);
                        }
                    })
                }
            },
            tableOpt() {
                Meteor.call('queryTableOption', (err, result) => {
                    this.tableOption = result;
                })
            },
            tableLocationOpt() {
                let selector = {};
                Meteor.call('queryTableLocationOption', selector, (err, result) => {
                    this.tableLocationOption = result;
                })
            },
            locationOpt() {
                let selector = {};
                Meteor.call('queryLocationOption', selector, (err, result) => {
                    this.locationOption = result;
                })
            },
            time() {
                let self = this;
                this.todaySt = moment().format("DD/MM/YYYY");
                this.timeSt = moment().format("hh:mm:ss");
                setTimeout(self.time, 1000);
            },
            findPosTableById(doc) {
                let vm = this;
                vm.posClassForm = {};
                Meteor.call("queryPosTableById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.posClassForm._id = result._id;
                        vm.posClassForm = result;
                    }
                })
            }
            ,
            cancel() {
                this.$message({
                    type: 'info',
                    message: 'Canceled'
                });
            }
            ,

            resetForm() {

            },
            closePosTableBoard(index, row, rows) {
                let vm = this;
                this.$confirm('This will end your Table. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("updatePosTableById", row._id, (err, result) => {
                        if (!err) {
                            rows.splice(index, 1);

                            vm.$message({
                                message: `
                        បិទថ្នាក់ បានជោគជ័យ`,
                                type: 'success'
                            });


                        } else {
                            vm.$message({
                                type: 'error',
                                message: 'Close Failed'
                            });
                        }

                    })

                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: 'Delete canceled'
                    });
                });


            },
            popUpOpenInvoice(data) {
                FlowRouter.go('/pos-sale/posSaleRestaurant?tableId=' + data._id);

            },
            savePosTableResult(event) {
                event.preventDefault();
                let vm = this;
                this.$refs["posTableResultFormAdd"].validate((valid) => {
                    if (valid) {
                        let posTableResultDoc = {
                            locationId: vm.posTableResultForm.locationId,
                            tableId: vm.posTableResultForm.tableId,
                            date: vm.posTableResultForm.date,
                            dateName: moment(vm.posTableResultForm.date).format("DD/MM/YYYY"),
                            convert: vm.convertData,
                            rolesArea: Session.get('area'),

                            description: vm.posTableResultForm.description
                        };

                        Meteor.call("insertPosTableResult", posTableResultDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogAddPosTableResult = false;
                                vm.$refs["posTableResultFormAdd"].resetFields();
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

        }
        ,

        created() {
            this.isSearching = true;
            this.queryData();
            this.tableLocationOpt();
            Meteor.subscribe('Pos_TableReact');

        }
        ,
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['table'];
                return data;
            }
        }
    }
</script>
<style>
    .transition-box-empty {
        margin-bottom: 0px !important;
        width: 100%;
        height: 110px;
        border-radius: 4px;
        background-color: gray;
        text-align: center;
        color: #fff;
        padding: 40px 20px;
        box-sizing: border-box;
        margin-right: 20px;
        font-size: 15px;
    }

    .transition-box-full {
        margin-bottom: 0px !important;
        width: 100%;
        height: 110px;
        border-radius: 4px;
        background-color: green;
        text-align: center;
        color: #fff;
        padding: 40px 20px;
        box-sizing: border-box;
        margin-right: 20px;
        font-size: 16px;
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
