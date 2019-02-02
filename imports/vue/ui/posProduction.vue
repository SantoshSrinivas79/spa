<template>
    <div class="pos_production">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddPosProduction = true,resetForm()">
                            <i class="fa fa-plus"></i> {{langConfig['title']}}
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
                <el-table
                        :data="posProductionData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="name"
                            :label="langConfig['name']"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="dateName"
                            :label="langConfig['date']"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="locationDoc.name"
                            :label="langConfig['location']"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="productConvertDoc"
                            :label="langConfig['convert']"
                    >
                        <template slot-scope="scope">
                            <div v-for="d in scope.row.productConvertDoc">
                                <p>{{d.productConvertDoc.name}} = {{d.convert.qty}} </p>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column
                            prop="description"
                            :label="langConfig['desc']">
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['status']"
                            width="150"
                            filter-placement="bottom-end">
                        <template slot-scope="scope">
                            <el-tag
                                    :type="scope.row.status === false ? 'primary' : 'success'"
                                    close-transition>{{scope.row.status}}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['action']"
                            width="120"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removePosProduction(scope.$index,scope.row,posProductionData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findPosProductionById(scope),dialogUpdatePosProduction= true"
                                           :disabled="disabledUpdate"></el-button>
                            </el-button-group>

                        </template>
                    </el-table-column>

                </el-table>
                <!--Pagination-->
                <br>
                <el-row type="flex" class="row-bg" justify="center">
                    <el-col :span="24" style="text-align: center;">
                        <div class="block">
                            <el-pagination @size-change="handleSizeChange" background @current-change="handleCurrentChange"
                                           :current-page.sync="currentPage" :page-sizes="[10,20, 50, 100,200]"
                                           :page-size="currentSize"
                                           layout="total, sizes, prev, pager, next, jumper" :total="count">
                            </el-pagination>
                        </div>
                    </el-col>
                </el-row>
                <br>
            </slot>
            <!--End Pagination-->
        </div>

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['add']"
                :visible.sync="dialogAddPosProduction"
                width="40%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posProductionForm" :rules="rules" ref="posProductionFormAdd"
                     label-width="120px"
                     class="posProductionForm">
                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="posProductionForm.name"></el-input>
                </el-form-item>


                <el-form-item :label="langConfig['date']" prop="date">
                    <el-date-picker
                            v-model="posProductionForm.date"
                            type="date"
                            style="width: 100%;"
                            placeholder="Pick a day"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item :label="langConfig['location']" prop="locationId">
                    <el-select style="display: block !important;" filterable clearable
                               v-model="posProductionForm.locationId"
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
                    <el-input type="textarea" v-model="posProductionForm.description"></el-input>
                </el-form-item>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddPosProduction = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="savePosProduction($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i>
                    </el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdatePosProduction"
                width="40%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posProductionForm" :rules="rules" ref="posProductionFormUpdate"
                     label-width="120px"
                     class="posProductionForm">

                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="posProductionForm.name"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['date']" prop="date">
                    <el-date-picker
                            v-model="posProductionForm.date"
                            type="date"
                            style="width: 100%;"
                            placeholder="Pick a day"
                    >
                    </el-date-picker>
                </el-form-item>
                <el-form-item :label="langConfig['location']" prop="locationId">
                    <el-select style="display: block !important;" filterable clearable
                               v-model="posProductionForm.locationId"
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
                    <el-input type="textarea" v-model="posProductionForm.description"></el-input>
                </el-form-item>


                <el-form-item :label="langConfig['status']" prop="status">
                    <el-switch
                            v-model="posProductionForm.status"
                            active-color="#13ce66"
                            inactive-color="#ff4949">
                    </el-switch>
                </el-form-item>

                <input type="hidden" v-model="posProductionForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdatePosProduction = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="updatePosProduction">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
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
                posProductionData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddPosProduction: false,
                dialogUpdatePosProduction: false,
                convertData: [{
                    productId: "",
                    qty: 0
                }],
                posProductionForm: {
                    locationId: "",
                    date: moment().toDate(),
                    description: "",
                    convert: [],
                    _id: "",
                    name: "",
                    status: false
                },
                rules: {

                    locationId: [{
                        required: true, type: 'string',
                        message: 'Please input Location', trigger: 'change'
                    }],
                    date: [{
                        type: 'date',
                        required: true,
                        message: 'Please input Date',
                        trigger: 'blur'
                    }],
                    name: [{
                        type: 'string',
                        required: true,
                        message: 'Please input name',
                        trigger: 'blur'
                    }],
                },
                // Options
                productOption: [],
                locationOption: [],
                skip: 0
            }
        },
        watch: {
            currentSize(val) {
                this.isSearching = true;
                this.skip = (this.currentPage - 1) * val;
                this.queryData(this.searchData, this.skip, val + this.skip);
            },
            currentPage(val) {
                this.isSearching = true;
                this.skip = (val - 1) * this.currentSize;
                this.queryData(this.searchData, this.skip, this.currentSize + this.skip);
            },
            searchData(val) {
                this.isSearching = true;
                this.skip = (this.currentPage - 1) * this.currentSize;
                this.queryData(val, this.skip, this.currentSize + this.skip);
            }
        },
        methods: {
            handleSizeChange(val) {
                this.currentSize = val;
            },
            handleCurrentChange(val) {
                this.currentPage = val;
            },
            indexMethod(index) {
                return index + 1;
            },
            queryData: _.debounce(function (val, skip, limit) {
                Meteor.call('queryPosProduction', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.posProductionData = result.content;
                        this.count = result.countPosProduction;
                    }
                    this.isSearching = false;
                });
            }, 300),
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
            locationOpt() {
                let selector = {};
                Meteor.call('queryLocationOption', selector, (err, result) => {
                    this.locationOption = result;
                })
            },
            savePosProduction(event) {
                event.preventDefault();
                let vm = this;
                this.$refs["posProductionFormAdd"].validate((valid) => {
                    if (valid) {
                        let posProductionDoc = {
                            locationId: vm.posProductionForm.locationId,
                            date: vm.posProductionForm.date,
                            name: vm.posProductionForm.name,
                            dateName: moment(vm.posProductionForm.date).format("DD/MM/YYYY"),
                            convert: vm.convertData,
                            rolesArea: Session.get('area'),

                            description: vm.posProductionForm.description
                        };

                        Meteor.call("insertPosProduction", posProductionDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogAddPosProduction = false;
                                vm.productOpt();
                                vm.$refs["posProductionFormAdd"].resetFields();
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
            updatePosProduction() {
                let vm = this;
                this.$refs["posProductionFormUpdate"].validate((valid) => {
                    if (valid) {
                        let posProductionDoc = {
                            _id: vm.posProductionForm._id,
                            locationId: vm.posProductionForm.locationId,
                            date: vm.posProductionForm.date,
                            name: vm.posProductionForm.name,
                            status: vm.posProductionForm.status,

                            dateName: moment(vm.posProductionForm.date).format("DD/MM/YYYY"),
                            convert: vm.convertData,
                            rolesArea: Session.get('area'),
                            description: vm.posProductionForm.description
                        };

                        Meteor.call("updatePosProduction", posProductionDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Successfully
                        !`,
                                    type: 'success'
                                });
                                vm.dialogUpdatePosProduction = false;
                                vm.productOpt();
                                vm.$refs["posProductionFormUpdate"].resetFields();
                            } else {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Failed
                        !`,
                                    type: 'error'
                                });
                            }
                        })
                    }
                })

            },
            removePosProduction(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removePosProduction", row._id, (err, result) => {
                        if (!err) {
                            rows.splice(index, 1);

                            vm.$message({
                                message: `
                        លុប ${row.code} : ${row.productId} បានជោគជ័យ`,
                                type: 'success'
                            });

                        } else {
                            vm.$message({
                                type: 'error',
                                message: 'Delete Fialed'
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
            findPosProductionById(doc) {
                let vm = this;
                vm.posProductionForm = {};

                Meteor.call("queryPosProductionById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.posProductionForm._id = result._id;
                        vm.posProductionForm = result;
                        vm.convertData = result.convert || [{
                            productId: "",
                            qty: 0
                        }];
                    }
                })
            },
            cancel() {
                this.$message({
                    type: 'info',
                    message: 'Canceled'
                });
            },
            resetForm() {
                this.posProductionForm._id = "";

                this.convertData = [{
                    productId: "",
                    qty: 0
                }];
                if (this.$refs["posProductionFormAdd"]) {
                    this.$refs["posProductionFormAdd"].resetFields();
                }

                if (this.$refs["posProductionFormUpdate"]) {
                    this.$refs["posProductionFormUpdate"].resetFields();
                }

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
            }
        },
        created() {
            this.isSearching = true;
            this.productOpt();
            this.locationOpt();
            this.queryData();
            Meteor.subscribe('Pos_ProductionReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['production'];
                return data;
            }
        }
    }
</script>