<template>
    <div class="pos_productionBoard">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddPosClass = true,resetForm()">
                            {{langConfig['title']}}
                        </a>
                    </h4>
                </el-col>
                <el-col :span="16" style="text-align: right; margin-right: 10px">
                    <br>
                    <el-row type="flex" justify="center">
                        <el-col :span="8"></el-col>
                        <el-col :span="8"></el-col>
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
                <el-row type="flex" class="row-bg" justify="center">
                    <el-col :span="24" style="text-align: center;">
                        <div class="block">
                            <el-pagination @size-change="handleSizeChange" background @current-change="handleCurrentChange"
                                           :current-page.sync="currentPage" :page-sizes="[12,24, 48, 96,192]"
                                           :page-size="currentSize"
                                           layout="total, sizes, prev, pager, next, jumper" :total="count">
                            </el-pagination>
                        </div>
                    </el-col>
                </el-row>
                <br>
                <div style="margin-top: 20px; height: 100px;">
                    <el-row>
                        <el-col style="padding-bottom: 40px !important;" :span="5"
                                v-for="(d, index) in posProductionData"
                                :key="d._id"
                                :offset="index > 0 ? index%4===0 ? 0 : 1 : 0">
                            <el-card :body-style="{ padding: '0px' }" @dblclick.native="popUpProductionResult(d)">
                                <transition v-show=true name="el-zoom-in-center">
                                    <div class="transition-box">
                                        {{d.name}}<br> <span
                                            style="float: left !important;"> <i
                                            class="material-icons">group</i> &nbsp;<span
                                            style="padding-top: 12px !important;">{{d.locationDoc.name || "0"}}</span>
                                        </span>
                                    </div>
                                </transition>
                                <div style="padding: 14px;">
                                    <div class="bottom clearfix">
                                        <time class="time" style="float: left !important;">{{d.dateName}}
                                        </time>
                                        <el-button type="text" class="button" style="float: right !important;">
                                            <el-button type="success" icon="el-icon-circle-close-outline"
                                                       @click="closePosProductionBoard(index,d,posProductionData)"
                                                       circle></el-button>
                                        </el-button>
                                    </div>
                                </div>
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


        <!--Form Modal-->
        <el-dialog
                :title="langConfig['addProductionResult']"
                :visible.sync="dialogAddPosProductionResult"
                width="40%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posProductionResultForm" :rules="productionResultRules" ref="posProductionResultFormAdd"
                     label-width="120px"
                     class="posProductionResultForm">
                <el-form-item :label="langConfig['production']" prop="productionId">
                    <el-select style="display: block !important;" filterable clearable
                               v-model="posProductionResultForm.productionId"
                               :disabled="true"
                               :placeholder="langConfig['production']">
                        <el-option
                                v-for="item in productionOption"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item :label="langConfig['date']" prop="date">
                    <el-date-picker
                            v-model="posProductionResultForm.date"
                            type="date"
                            style="width: 100%;"
                            placeholder="Pick a day"
                    >
                    </el-date-picker>
                </el-form-item>


                <el-form-item :label="langConfig['location']" prop="locationId">
                    <el-select style="display: block !important;" filterable clearable
                               v-model="posProductionResultForm.locationId"
                               :placeholder="langConfig['location']">
                        <el-option
                                v-for="item in locationOption"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>


                <h3 style="font-family: 'Khmer OS Moul">{{langConfig['convert']}}</h3>
                <el-table
                        :data="convertData"
                        stripe
                        style="width: 100%">
                    <el-table-column
                            type="index"
                            :index="indexMethod">
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['product']">
                        <template slot-scope="scope">

                            <el-select style="display: block !important;" filterable clearable
                                       v-model="scope.row.productId" :remote-method="productOpt"
                                       :placeholder="langConfig['product']"
                                       @change="handleEditConvert(scope.$index, scope.row)"
                            >
                                <el-option
                                        v-for="item in productOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['qty']">
                        <template slot-scope="scope">
                            <el-input size="small" v-model="scope.row.qty" type="number"
                                      :placeholder="langConfig['qty']"
                                      @change="handleEditConvert(scope.$index, scope.row)"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['action']"
                            width="120"
                    >
                        <template slot-scope="scope">
                            <el-button type="primary" class="cursor-pointer" icon="el-icon-circle-plus"
                                       size="small"
                                       @click="handleAddConvert()"

                            ></el-button>
                            <el-button type="danger" class="cursor-pointer" icon="el-icon-remove"
                                       size="small"
                                       @click="removeConvertData(scope.$index,scope.row)"
                            ></el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <br>

                <el-form-item :label="langConfig['desc']" prop="description">
                    <el-input type="textarea" v-model="posProductionResultForm.description"></el-input>
                </el-form-item>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddPosProductionResult = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="savePosProductionResult($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i>
                    </el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label'
    import {Pos_ProductionReact} from "../../collection/posProduction";

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
                Pos_ProductionReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {

            return {
                tabPosition: 'left',
                fullScreen: true,
                dialogAddPosProductionResult: false,
                ref: "",
                labelPosition: top,
                posProductionData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 12,
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
                posProductionResultForm: {
                    locationId: "",
                    date: moment().toDate(),
                    description: "",
                    convert: [],
                    _id: "",
                    productionId: ""
                },

                rules: {},
                productionResultRules: {
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
                productionOption: [],
                skip: 0
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
            }
            ,
            queryData: _.debounce(function (val, skip, limit) {
                Meteor.call('queryPosProductionBoard', {
                    q: val,
                    filter: this.filter,
                    rolesArea:Session.get('area'),
                    options: {skip: skip || 0, limit: limit || 12}
                }, (err, result) => {
                    if (!err) {
                        this.posProductionData = result.content;
                        this.count = result.countPosProduction;
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
            productionOpt() {
                let selector = {};
                selector.status = false;
                Meteor.call('queryProductionOption', selector, (err, result) => {
                    this.productionOption = result;
                })
            },
            locationOpt() {
                let selector = {};
                Meteor.call('queryLocationOption', selector, (err, result) => {
                    this.locationOption = result;
                })
            },
            findPosProductionById(doc) {
                let vm = this;
                vm.posClassForm = {};
                Meteor.call("queryPosProductionById", doc.row._id, (err, result) => {
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
            closePosProductionBoard(index, row, rows) {
                let vm = this;
                this.$confirm('This will end your Production. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("updatePosProductionById", row._id, (err, result) => {
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
            popUpProductionResult(data) {
                this.productionOpt();
                this.productOpt();
                this.locationOpt();
                this.posProductionResultForm.productionId = data._id;
                this.dialogAddPosProductionResult = true;
            },
            handleAddConvert() {
                this.convertData.push({
                    productId: "",
                    qty: 0
                })
            },
            handleEditConvert(index, row) {
                this.convertData[index] = row;
            },
            removeConvertData(index, row) {
                if (this.convertData.length > 1) {
                    this.convertData.splice(index, 1);
                    this.$message({
                        message: `លុប ${row.productId} បានជោគជ័យ`,
                        type: 'success'
                    });
                } else {
                    this.convertData = [{
                        productId: "",
                        qty: 0
                    }];
                }
            },
            savePosProductionResult(event) {
                event.preventDefault();
                let vm = this;
                this.$refs["posProductionResultFormAdd"].validate((valid) => {
                    if (valid) {
                        let posProductionResultDoc = {
                            locationId: vm.posProductionResultForm.locationId,
                            productionId: vm.posProductionResultForm.productionId,
                            date: vm.posProductionResultForm.date,
                            dateName: moment(vm.posProductionResultForm.date).format("DD/MM/YYYY"),
                            convert: vm.convertData,
                            rolesArea: Session.get('area'),

                            description: vm.posProductionResultForm.description
                        };

                        Meteor.call("insertPosProductionResult", posProductionResultDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogAddPosProductionResult = false;
                                vm.$refs["posProductionResultFormAdd"].resetFields();
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
            Meteor.subscribe('Pos_ProductionReact');

        }
        ,
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['production'];
                return data;
            }
        }
    }
</script>
<style>
    .transition-box {
        margin-bottom: 10px;
        width: 100%;
        height: 110px;
        border-radius: 4px;
        background-color: #409EFF;
        text-align: center;
        color: #fff;
        padding: 40px 20px;
        box-sizing: border-box;
        margin-right: 20px;
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
