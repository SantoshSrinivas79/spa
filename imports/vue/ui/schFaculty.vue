<template>
    <div class="sch_faculty">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddSchFaculty = true,resetForm()">
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
                        :data="schFacultyData"
                        stripe
                        border
                        style="width: 100%">
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
                            prop="note"
                            :label="langConfig['desc']">
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['action']"
                            width="120"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removeSchFaculty(scope.$index,scope.row,schFacultyData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findSchFacultyById(scope),dialogUpdateSchFaculty= true"
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
                :visible.sync="dialogAddSchFaculty"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schFacultyForm" :rules="rules" ref="schFacultyFormAdd" label-width="120px"
                     class="schFacultyForm">
                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="schFacultyForm.name"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['khName']" prop="khName">
                    <el-input v-model="schFacultyForm.khName"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['desc']" prop="desc">
                    <el-input type="textarea" v-model="schFacultyForm.desc"></el-input>
                </el-form-item>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddSchFaculty = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="saveSchFaculty($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateSchFaculty"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schFacultyForm" :rules="rules" ref="schFacultyFormUpdate" label-width="120px"
                     class="schFacultyForm">

                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="schFacultyForm.name"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['khName']" prop="khName">
                    <el-input v-model="schFacultyForm.khName"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['desc']" prop="desc">
                    <el-input type="textarea" v-model="schFacultyForm.desc"></el-input>
                </el-form-item>

                <input type="hidden" v-model="schFacultyForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateSchFaculty = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="updateSchFaculty">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-sch'
    import {Sch_FacultyReact} from "../../collection/schFaculty";

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
                Sch_FacultyReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                schFacultyData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddSchFaculty: false,
                dialogUpdateSchFaculty: false,

                schFacultyForm: {
                    name: "",
                    khName: "",
                    desc: "",
                    _id: ""
                },
                rules: {
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                },
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
                Meteor.call('querySchFaculty', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.schFacultyData = result.content;
                        this.count = result.countSchFaculty;
                    }
                    this.isSearching = false;
                });
            }, 300),

            fetchUser() {
                Meteor.call("queryUserOption", (err, result) => {
                    this.applyUserOption = result;
                })
            },
            saveSchFaculty(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["schFacultyFormAdd"].validate((valid) => {
                    if (valid) {
                        let schFacultyDoc = {
                            name: vm.schFacultyForm.name,
                            khName: vm.schFacultyForm.khName,
                            desc: vm.schFacultyForm.desc,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("insertSchFaculty", schFacultyDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogAddSchFaculty = false;

                                vm.$refs["schFacultyFormAdd"].resetFields();
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
            updateSchFaculty() {
                let vm = this;
                this.$refs["schFacultyFormUpdate"].validate((valid) => {
                    if (valid) {
                        let schFacultyDoc = {
                            _id: vm.schFacultyForm._id,
                            name: vm.schFacultyForm.name,
                            khName: vm.schFacultyForm.khName,
                            desc: vm.schFacultyForm.desc,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updateSchFaculty", schFacultyDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Successfully
                        !`,
                                    type: 'success'
                                });
                                vm.dialogUpdateSchFaculty = false;

                                vm.$refs["schFacultyFormUpdate"].resetFields();
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
            removeSchFaculty(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeSchFaculty", row._id, (err, result) => {
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
            findSchFacultyById(doc) {
                let vm = this;
                vm.schFacultyForm = {};
                Meteor.call("querySchFacultyById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.schFacultyForm._id = result._id;
                        vm.schFacultyForm = result;
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
                this.schFacultyForm._id = "";
                if (this.$refs["schFacultyFormAdd"]) {
                    this.$refs["schFacultyFormAdd"].resetFields();
                }

                if (this.$refs["schFacultyFormUpdate"]) {
                    this.$refs["schFacultyFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.fetchUser();
            this.queryData();
            Meteor.subscribe('Sch_FacultyReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['faculty'];
                return data;
            }
        }
    }
</script>