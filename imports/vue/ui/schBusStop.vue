<template>
    <div class="sch_busStop">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddSchBusStop = true,resetForm(),popUpAdd()">
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
                        :data="schBusStopData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="name"
                            :label="langConfig['name']"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="priceRange"
                            :label="langConfig['price']">
                        <template slot-scope="scope">
                            <el-table
                                    :data="scope.row.priceRange"
                                    style="width: 100%"
                                    :row-class-name="tableRowClassName({row:scope.row,rowIndex:scope.$index})">
                                <el-table-column
                                        :label="langConfig['type']"
                                        prop="type">
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['price']"
                                        prop="price">
                                </el-table-column>
                            </el-table>
                        </template>

                    </el-table-column>
                    <el-table-column
                            :label="langConfig['action']"
                            width="120"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removeSchBusStop(scope.$index,scope.row,schBusStopData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findSchBusStopById(scope),dialogUpdateSchBusStop= true,popUpUpdate()"
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
                :visible.sync="dialogAddSchBusStop"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schBusStopForm" :rules="rules" :ref="ref" label-width="120px"
                     class="schBusStopForm">
                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="schBusStopForm.name"></el-input>
                </el-form-item>

                <el-row>
                    <p>{{langConfig['range']}}</p>
                    <el-table
                            :data="priceRange"
                            stripe
                            style="width: 100%">
                        <el-table-column
                                type="index"
                                :index="indexMethod">
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['type']">
                            <template slot-scope="scope">
                                <el-input size="small" v-model="scope.row.type" disabled
                                          :placeholder="langConfig['type']"
                                ></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['price']">
                            <template slot-scope="scope">
                                <el-input size="small" v-model="scope.row.price" type='number'
                                          :placeholder="langConfig['price']"
                                          @keyup.native="updatePriceRange(scope.row, scope.$index)"
                                          @change="updatePriceRange(scope.row, scope.$index)"
                                ></el-input>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-row>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddSchBusStop = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="saveSchBusStop($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateSchBusStop"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schBusStopForm" :rules="rules" :ref="ref" label-width="120px"
                     class="schBusStopForm">

                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="schBusStopForm.name"></el-input>
                </el-form-item>

                <el-row>
                    <p>{{langConfig['range']}}</p>
                    <el-table
                            :data="priceRange"
                            stripe
                            style="width: 100%">
                        <el-table-column
                                type="index"
                                :index="indexMethod">
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['type']">
                            <template slot-scope="scope">
                                <el-input size="small" v-model="scope.row.type" disabled
                                          :placeholder="langConfig['type']"
                                ></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['price']">
                            <template slot-scope="scope">
                                <el-input size="small" v-model="scope.row.price" type='number'
                                          :placeholder="langConfig['price']"
                                          @keyup.native="updatePriceRange(scope.row, scope.$index)"
                                          @change="updatePriceRange(scope.row, scope.$index)"
                                ></el-input>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-row>

                <input type="hidden" v-model="schBusStopForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateSchBusStop = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="updateSchBusStop">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-sch'
    import {Sch_BusStopReact} from "../../collection/schBusStop";

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
                Sch_BusStopReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                ref: "",
                schBusStopData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddSchBusStop: false,
                dialogUpdateSchBusStop: false,
                schBusStopForm: {
                    name: "",

                    _id: "",
                    priceRange: [
                        {type: "One Way", price: 0},
                        {type: "Round", price: 0},
                        {type: "Three Turn", price: 0},
                        {type: "Four Turn", price: 0},
                    ],
                },
                rules: {
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    price: [{required: true, message: 'Please input Price', trigger: 'blur'}]
                },
                priceRange: [
                    {type: "One Way", price: 0},
                    {type: "Round", price: 0},
                    {type: "Three Turn", price: 0},
                    {type: "Four Turn", price: 0},
                ],
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
            queryData: _.debounce(function (val, skip, limit) {
                Meteor.call('querySchBusStop', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.schBusStopData = result.content;
                        this.count = result.countSchBusStop;
                    }
                    this.isSearching = false;
                });
            }, 300),
            indexMethod(index) {
                return index + 1;
            },
            fetchUser() {
                Meteor.call("queryUserOption", (err, result) => {
                    this.applyUserOption = result;
                })
            },
            saveSchBusStop(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["schBusStopFormAdd"].validate((valid) => {
                    if (valid) {
                        let schBusStopDoc = {

                            name: vm.schBusStopForm.name,
                            priceRange: vm.priceRange,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("insertSchBusStop", schBusStopDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogAddSchBusStop = false;

                                vm.$refs["schBusStopFormAdd"].resetFields();
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
            updateSchBusStop() {
                let vm = this;
                this.$refs["schBusStopFormUpdate"].validate((valid) => {
                    if (valid) {
                        let schBusStopDoc = {
                            _id: vm.schBusStopForm._id,
                            name: vm.schBusStopForm.name,
                            priceRange: vm.priceRange,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updateSchBusStop", schBusStopDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Successfully
                        !`,
                                    type: 'success'
                                });
                                vm.dialogUpdateSchBusStop = false;

                                vm.$refs["schBusStopFormUpdate"].resetFields();
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
            removeSchBusStop(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeSchBusStop", row._id, (err, result) => {
                        if (!err) {
                            rows.splice(index, 1);

                            vm.$message({
                                message: `
                        លុប ${row.name} បានជោគជ័យ`,
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
            findSchBusStopById(doc) {
                let vm = this;
                vm.schBusStopForm = {};
                Meteor.call("querySchBusStopById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.schBusStopForm._id = result._id;
                        vm.priceRange = result.priceRange;
                        vm.schBusStopForm = result;
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
                this.schBusStopForm._id = "";

                if (this.$refs["schBusStopFormAdd"]) {
                    this.$refs["schBusStopFormAdd"].resetFields();
                }

                if (this.$refs["schBusStopFormUpdate"]) {
                    this.$refs["schBusStopFormUpdate"].resetFields();
                }

            },
            popUpAdd() {
                this.ref = "schBusStopFormAdd";
            },
            popUpUpdate() {
                this.ref = "schBusStopFormUpdate";
            },
            updatePriceRange(row, index) {
                this.priceRange[index] = row;
            },
            tableRowClassName({row, rowIndex}) {
                if (rowIndex === 1) {
                    return 'warning-row';
                } else if (rowIndex === 3) {
                    return 'success-row';
                }
                return '';
            }
        },
        created() {
            this.isSearching = true;
            this.fetchUser();
            this.queryData();
            Meteor.subscribe('Sch_BusStopReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['busStop'];
                return data;
            }
        }
    }
</script>