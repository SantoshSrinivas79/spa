<template>
    <div class="pos_tableLocation">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddPosTableLocation = true,resetForm()">
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
                        v-loading="newLoading"
                        :data="posTableLocationData"
                        stripe
                        border
                        style="width: 100%">

                    <el-table-column
                            prop="name"
                            :label="langConfig['name']"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="description"
                            :label="langConfig['memo']">
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['action']"
                            width="120"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removePosTableLocation(scope.$index,scope.row,posTableLocationData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findPosTableLocationById(scope),dialogUpdatePosTableLocation= true"
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
                :visible.sync="dialogAddPosTableLocation"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posTableLocationForm" :rules="rules" ref="posTableLocationFormAdd" label-width="120px"
                     class="posTableLocationForm">
                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="posTableLocationForm.name"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['memo']" prop="description">
                    <el-input type="textarea" v-model="posTableLocationForm.description"></el-input>
                </el-form-item>


                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddPosTableLocation = false, cancel()">{{langConfig['cancel']}}
                        <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="savePosTableLocation($event)">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdatePosTableLocation"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posTableLocationForm" :rules="rules" ref="posTableLocationFormUpdate" label-width="120px"
                     class="posTableLocationForm">

                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="posTableLocationForm.name"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['memo']" prop="description">
                    <el-input type="textarea" v-model="posTableLocationForm.description"></el-input>
                </el-form-item>
                <input type="hidden" v-model="posTableLocationForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdatePosTableLocation = false ,cancel()">{{langConfig['cancel']}}
                        <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="updatePosTableLocation">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i>
                    </el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label'
    import {Pos_TableLocationReact} from "../../collection/posTableLocation";


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
                Pos_TableLocationReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                newLoading: true,
                dialogImageUrl: "",
                dialogVisible: false,
                posTableLocationData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddPosTableLocation: false,
                dialogUpdatePosTableLocation: false,

                posTableLocationForm: {
                    name: "",
                    description: "",
                    _id: ""
                },
                rules: {
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                },
                // Options
                subTableLocationDataOption: [],
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
                this.newLoading = true;
                Meteor.call('queryPosTableLocation', {
                    q: val,
                    filter: this.filter,
                    rolesArea:Session.get('area'),
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.posTableLocationData = result.content;
                        this.count = result.countPosTableLocation;
                    }
                    this.isSearching = false;
                    this.newLoading = false;
                });
            }, 300),
            savePosTableLocation(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["posTableLocationFormAdd"].validate((valid) => {
                    if (valid) {

                        let posTableLocationDoc = {
                            name: vm.posTableLocationForm.name,
                            description: vm.posTableLocationForm.description
                        };
                        Meteor.call("insertPosTableLocation", posTableLocationDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogAddPosTableLocation = false;
                                vm.$refs["posTableLocationFormAdd"].resetFields();

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
            updatePosTableLocation() {
                let vm = this;
                this.$refs["posTableLocationFormUpdate"].validate((valid) => {
                    if (valid) {


                        let posTableLocationDoc = {
                            _id: vm.posTableLocationForm._id,
                            name: vm.posTableLocationForm.name,
                            description: vm.posTableLocationForm.description,
                        };

                        Meteor.call("updatePosTableLocation", posTableLocationDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Successfully
                        !`,
                                    type: 'success'
                                });
                                vm.dialogUpdatePosTableLocation = false;
                                vm.$refs["posTableLocationFormUpdate"].resetFields();
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
            removePosTableLocation(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removePosTableLocation", row._id, (err, result) => {
                        if (!err) {
                            rows.splice(index, 1);

                            vm.$message({
                                message: `
                        លុប ${row.code} : ${row.name} បានជោគជ័យ`,
                                type: 'success'
                            });

                        } else {
                            vm.$message({
                                type: 'error',
                                message: 'Delete Failed'
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
            findPosTableLocationById(doc) {
                let vm = this;
                vm.posTableLocationForm = {};

                Meteor.call("queryPosTableLocationById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.posTableLocationForm._id = result._id;
                        vm.posTableLocationForm = result;
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

                this.posTableLocationForm._id = "";
                if (this.$refs["posTableLocationFormAdd"]) {
                    this.$refs["posTableLocationFormAdd"].resetFields();
                }

                if (this.$refs["posTableLocationFormUpdate"]) {
                    this.$refs["posTableLocationFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            Meteor.subscribe('Pos_TableLocationReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['tableLocation'];
                return data;
            }
        }
    }
</script>
