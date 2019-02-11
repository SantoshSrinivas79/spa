<template>
    <div class="pos_location">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddPosLocation = true,resetForm()">
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
                        :data="posLocationData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="code"
                            :label="langConfig['code']"
                            width="120"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="name"
                            :label="langConfig['name']"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="khName"
                            :label="langConfig['khName']">
                    </el-table-column>
                    <el-table-column
                            prop="phoneNumber"
                            :label="langConfig['phoneNumber']">
                    </el-table-column>
                    <el-table-column
                            prop="address"
                            :label="langConfig['address']">
                    </el-table-column>

                    <el-table-column
                            prop="status"
                            :label="langConfig['isMainLocation']"
                            width="150"
                            filter-placement="bottom-end">
                        <template slot-scope="scope">
                            <el-tag
                                    :type="scope.row.isMainLocation === true ? 'success' : 'warning'"
                                    close-transition>{{scope.row.isMainLocation}}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="note"
                            :label="langConfig['note']">
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['action']"
                            width="120"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removePosLocation(scope.$index,scope.row,posLocationData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findPosLocationById(scope),dialogUpdatePosLocation= true"
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
                :visible.sync="dialogAddPosLocation"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posLocationForm" :rules="rules" ref="posLocationFormAdd" label-width="120px"
                     class="posLocationForm">
                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="posLocationForm.name"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['khName']" prop="khName">
                    <el-input v-model="posLocationForm.khName"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['code']" prop="code">
                    <el-input v-model="posLocationForm.code"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['phoneNumber']" prop="phoneNumber">
                    <el-input v-model="posLocationForm.phoneNumber"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['address']" prop="address">
                    <el-input v-model="posLocationForm.address"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['note']" prop="note">
                    <el-input type="textarea" v-model="posLocationForm.note"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['isMainLocation']" prop="isMainLocation">
                    <el-switch
                            v-model="posLocationForm.isMainLocation"
                            active-color="#13ce66"
                            inactive-color="#ff4949"
                    >
                    </el-switch>
                </el-form-item>


                <el-form-item :label="langConfig['applyUser']" prop="applyUser">
                    <el-checkbox-group v-model="posLocationForm.applyUser">
                        <el-checkbox v-for="mt in applyUserOption" :label="mt.value" :key="mt.value">{{mt.label}}
                        </el-checkbox>
                    </el-checkbox-group>
                </el-form-item>


                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddPosLocation = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="savePosLocation($event)">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdatePosLocation"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posLocationForm" :rules="rules" ref="posLocationFormUpdate" label-width="120px"
                     class="posLocationForm">

                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="posLocationForm.name"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['khName']" prop="khName">
                    <el-input v-model="posLocationForm.khName"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['code']" prop="code">
                    <el-input v-model="posLocationForm.code"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['phoneNumber']" prop="phoneNumber">
                    <el-input v-model="posLocationForm.phoneNumber"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['address']" prop="address">
                    <el-input v-model="posLocationForm.address"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['note']" prop="note">
                    <el-input type="textarea" v-model="posLocationForm.note"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['isMainLocation']" prop="isMainLocation">
                    <el-switch
                            v-model="posLocationForm.isMainLocation"
                            active-color="#13ce66"
                            inactive-color="#ff4949"
                    >
                    </el-switch>
                </el-form-item>

                <el-form-item :label="langConfig['applyUser']" prop="applyUser">
                    <el-checkbox-group v-model="posLocationForm.applyUser">
                        <el-checkbox v-for="mt in applyUserOption" :label="mt.value" :key="mt.value">{{mt.label}}
                        </el-checkbox>
                    </el-checkbox-group>
                </el-form-item>

                <input type="hidden" v-model="posLocationForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdatePosLocation = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="updatePosLocation">{{langConfig['save']}} <i>(Ctrl + Enter)</i>
                    </el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label'
    import {Pos_LocationReact} from "../../collection/posLocation";

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
                Pos_LocationReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                posLocationData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddPosLocation: false,
                dialogUpdatePosLocation: false,

                posLocationForm: {
                    name: "",
                    khName: "",
                    code: "",
                    note: "",
                    address: "",
                    phoneNumber: "",
                    applyUser: [],
                    _id: "",
                    isMainLocation: false
                },
                rules: {
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    code: [{required: true, message: 'Please input code', trigger: 'blur'}],
                },
                // Options
                applyUserOption: [],
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
                Meteor.call('queryPosLocation', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.posLocationData = result.content;
                        this.count = result.countPosLocation;
                    }
                    this.isSearching = false;
                });
            }, 300),

            fetchUser() {
                Meteor.call("queryUserOption", (err, result) => {
                    this.applyUserOption = result;
                })
            },
            savePosLocation(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["posLocationFormAdd"].validate((valid) => {
                    if (valid) {
                        let posLocationDoc = {
                            code: vm.posLocationForm.code,
                            name: vm.posLocationForm.name,
                            khName: vm.posLocationForm.khName,
                            note: vm.posLocationForm.note,
                            address: vm.posLocationForm.address,
                            phoneNumber: vm.posLocationForm.phoneNumber,
                            applyUser: vm.posLocationForm.applyUser,
                            isMainLocation: vm.posLocationForm.isMainLocation,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("insertPosLocation", posLocationDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogAddPosLocation = false;

                                vm.$refs["posLocationFormAdd"].resetFields();
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
            updatePosLocation() {
                let vm = this;
                this.$refs["posLocationFormUpdate"].validate((valid) => {
                    if (valid) {
                        let posLocationDoc = {
                            _id: vm.posLocationForm._id,
                            code: vm.posLocationForm.code,
                            name: vm.posLocationForm.name,
                            khName: vm.posLocationForm.khName,
                            note: vm.posLocationForm.note,
                            address: vm.posLocationForm.address,
                            phoneNumber: vm.posLocationForm.phoneNumber,
                            applyUser: vm.posLocationForm.applyUser,
                            isMainLocation: vm.posLocationForm.isMainLocation,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updatePosLocation", posLocationDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Successfully
                        !`,
                                    type: 'success'
                                });
                                vm.dialogUpdatePosLocation = false;

                                vm.$refs["posLocationFormUpdate"].resetFields();
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
            removePosLocation(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removePosLocation", row._id, (err, result) => {
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
            findPosLocationById(doc) {
                let vm = this;
                vm.posLocationForm = {};

                Meteor.call("queryPosLocationById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.posLocationForm._id = result._id;
                        vm.posLocationForm = result;
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
                this.posLocationForm._id = "";
                if (this.$refs["posLocationFormAdd"]) {
                    this.$refs["posLocationFormAdd"].resetFields();
                }

                if (this.$refs["posLocationFormUpdate"]) {
                    this.$refs["posLocationFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.fetchUser();
            this.queryData();
            Meteor.subscribe('Pos_LocationReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['location'];
                return data;
            }
        }
    }
</script>