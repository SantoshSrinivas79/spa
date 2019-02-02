<template>
    <div class="sch_major">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddSchMajor = true,resetForm()">
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
                        :data="schMajorData"
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
                                           @click="removeSchMajor(scope.$index,scope.row,schMajorData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findSchMajorById(scope),dialogUpdateSchMajor= true"
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
                :visible.sync="dialogAddSchMajor"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schMajorForm" :rules="rules" ref="schMajorFormAdd" label-width="120px"
                     class="schMajorForm">
                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="schMajorForm.name"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['khName']" prop="khName">
                    <el-input v-model="schMajorForm.khName"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['program']" prop="programId">
                    <el-select style="display: block !important;"
                               filterable
                               v-model="schMajorForm.programId"
                               :placeholder="langConfig['chooseItem']">
                        <el-option
                                v-for="item in programList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="langConfig['faculty']" prop="facultyId">
                    <el-select style="display: block !important;"
                               filterable
                               v-model="schMajorForm.facultyId"
                               :placeholder="langConfig['chooseItem']">
                        <el-option
                                v-for="item in facultyList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="langConfig['code']" prop="code">
                    <el-input v-model="schMajorForm.code"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['degree']" prop="degree">
                    <el-input v-model="schMajorForm.degree"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['desc']" prop="desc">
                    <el-input type="textarea" v-model="schMajorForm.desc"></el-input>
                </el-form-item>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddSchMajor = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="saveSchMajor($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateSchMajor"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schMajorForm" :rules="rules" ref="schMajorFormUpdate" label-width="120px"
                     class="schMajorForm">

                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="schMajorForm.name"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['khName']" prop="khName">
                    <el-input v-model="schMajorForm.khName"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['program']" prop="programId">
                    <el-select style="display: block !important;"
                               filterable
                               v-model="schMajorForm.programId"
                               :placeholder="langConfig['chooseItem']">
                        <el-option
                                v-for="item in programList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="langConfig['faculty']" prop="facultyId">
                    <el-select style="display: block !important;"
                               filterable
                               v-model="schMajorForm.facultyId"
                               :placeholder="langConfig['chooseItem']">
                        <el-option
                                v-for="item in facultyList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="langConfig['code']" prop="code">
                    <el-input v-model="schMajorForm.code"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['degree']" prop="degree">
                    <el-input v-model="schMajorForm.degree"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['desc']" prop="desc">
                    <el-input type="textarea" v-model="schMajorForm.desc"></el-input>
                </el-form-item>

                <input type="hidden" v-model="schMajorForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateSchMajor = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="updateSchMajor">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-sch'
    import {Sch_MajorReact} from "../../collection/schMajor";

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
                Sch_MajorReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                schMajorData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddSchMajor: false,
                dialogUpdateSchMajor: false,
                programList: [],
                facultyList: [],
                schMajorForm: {
                    name: "",
                    khName: "",
                    code: "",
                    desc: "",
                    _id: "",
                    programId: "",
                    facultyId: "",
                    degree: ""
                },
                rules: {
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    programId:
                        [{
                            required: true,
                            type: "string",
                            message: 'Please choose program',
                            trigger: 'change'
                        }],
                    facultyId:
                        [{
                            required: true,
                            type: "string",
                            message: 'Please choose faculty',
                            trigger: 'change'
                        }],
                    //code: [{required: true, message: 'Please input code', trigger: 'blur'}]
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
                Meteor.call('querySchMajor', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.schMajorData = result.content;
                        this.count = result.countSchMajor;
                    }
                    this.isSearching = false;
                });
            }, 300),

            fetchUser() {
                Meteor.call("queryUserOption", (err, result) => {
                    this.applyUserOption = result;
                })
            },
            programOpt() {
                Meteor.call("queryProgramOption", (err, result) => {
                    if (result) {
                        this.programList = result;
                    }
                })
            },
            facultyOpt() {
                let selector = {};
                Meteor.call("queryFacultyOption", selector, (err, result) => {
                    if (result) {
                        this.facultyList = result;
                    }
                })
            },
            saveSchMajor(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["schMajorFormAdd"].validate((valid) => {
                    if (valid) {
                        let schMajorDoc = {
                            code: vm.schMajorForm.code,
                            name: vm.schMajorForm.name,
                            khName: vm.schMajorForm.khName,
                            desc: vm.schMajorForm.desc,
                            programId: vm.schMajorForm.programId,
                            facultyId: vm.schMajorForm.facultyId,
                            degree: vm.schMajorForm.degree,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("insertSchMajor", schMajorDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogAddSchMajor = false;

                                vm.$refs["schMajorFormAdd"].resetFields();
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
            updateSchMajor() {
                let vm = this;
                this.$refs["schMajorFormUpdate"].validate((valid) => {
                    if (valid) {
                        let schMajorDoc = {
                            _id: vm.schMajorForm._id,
                            code: vm.schMajorForm.code,
                            name: vm.schMajorForm.name,
                            khName: vm.schMajorForm.khName,
                            desc: vm.schMajorForm.desc,
                            programId: vm.schMajorForm.programId,
                            facultyId: vm.schMajorForm.facultyId,
                            degree: vm.schMajorForm.degree,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updateSchMajor", schMajorDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Successfully
                        !`,
                                    type: 'success'
                                });
                                vm.dialogUpdateSchMajor = false;

                                vm.$refs["schMajorFormUpdate"].resetFields();
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
            removeSchMajor(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeSchMajor", row._id, (err, result) => {
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
            findSchMajorById(doc) {
                let vm = this;
                vm.schMajorForm = {};
                Meteor.call("querySchMajorById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.schMajorForm._id = result._id;
                        vm.schMajorForm = result;
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
                this.schMajorForm._id = "";
                if (this.$refs["schMajorFormAdd"]) {
                    this.$refs["schMajorFormAdd"].resetFields();
                }

                if (this.$refs["schMajorFormUpdate"]) {
                    this.$refs["schMajorFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.fetchUser();
            this.programOpt();
            this.facultyOpt();
            this.queryData();
            Meteor.subscribe('Sch_MajorReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['major'];
                return data;
            }
        }
    }
</script>