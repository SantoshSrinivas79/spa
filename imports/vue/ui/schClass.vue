<template>
    <div class="sch_class">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddSchClass = true,resetForm()">
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
                        :data="schClassData"
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
                            prop="timeDoc.name"
                            :label="langConfig['time']">
                    </el-table-column>
                    <el-table-column
                            prop="note"
                            :label="langConfig['desc']">
                    </el-table-column>
                    <el-table-column
                            prop="classDateName"
                            :label="langConfig['classDate']">
                    </el-table-column>
                    <el-table-column
                            prop="status"
                            :label="langConfig['status']"
                            width="150"
                            filter-placement="bottom-end">
                        <template slot-scope="scope">
                            <el-tag
                                    :type="scope.row.status === true ? 'primary' : 'danger'"
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
                                           @click="removeSchClass(scope.$index,scope.row,schClassData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findSchClassById(scope),dialogUpdateSchClass= true"
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
                :visible.sync="dialogAddSchClass"
                width="60%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schClassForm" :rules="rules" ref="schClassFormAdd" label-width="120px"
                     class="schClassForm">
                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['classDate']" prop="classDate">
                            <el-date-picker
                                    v-model="schClassForm.classDate"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item :label="langConfig['name']" prop="name">
                            <el-input v-model="schClassForm.name"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['khName']" prop="khName">
                            <el-input v-model="schClassForm.khName"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['code']" prop="code">
                            <el-input v-model="schClassForm.code"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['level']" prop="levelId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schClassForm.levelId"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in levelList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>

                    </el-col>
                    <el-col :span="12">

                        <el-form-item :label="langConfig['time']" prop="timeId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schClassForm.timeId"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in timeList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['teacher']" prop="teacherId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schClassForm.teacherId"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in teacherList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['charge']" prop="charge">
                            <el-input v-model="schClassForm.charge">
                                <template slot="append">%</template>
                            </el-input>

                        </el-form-item>
                        <el-form-item :label="langConfig['desc']" prop="desc">
                            <el-input type="textarea" v-model="schClassForm.desc"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['status']" prop="status">
                            <el-switch
                                    v-model="schClassForm.status"
                                    active-color="#13ce66"
                                    inactive-color="#ff4949"
                            >
                            </el-switch>

                        </el-form-item>
                    </el-col>
                </el-row>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddSchClass = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="saveSchClass($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateSchClass"
                width="60%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schClassForm" :rules="rules" ref="schClassFormUpdate" label-width="120px"
                     class="schClassForm">
                <el-row>
                    <el-col :span="12">

                        <el-form-item :label="langConfig['classDate']" prop="classDate">
                            <el-date-picker
                                    v-model="schClassForm.classDate"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item :label="langConfig['name']" prop="name">
                            <el-input v-model="schClassForm.name"></el-input>
                        </el-form-item>

                        <el-form-item :label="langConfig['khName']" prop="khName">
                            <el-input v-model="schClassForm.khName"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['code']" prop="code">
                            <el-input v-model="schClassForm.code"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['level']" prop="levelId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schClassForm.levelId"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in levelList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">

                        <el-form-item :label="langConfig['time']" prop="timeId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schClassForm.timeId"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in timeList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['teacher']" prop="teacherId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schClassForm.teacherId"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in teacherList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['charge']" prop="charge">
                            <el-input v-model="schClassForm.charge">
                                <template slot="append">%</template>
                            </el-input>

                        </el-form-item>
                        <el-form-item :label="langConfig['desc']" prop="desc">
                            <el-input type="textarea" v-model="schClassForm.desc"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['status']" prop="status">
                            <el-switch
                                    v-model="schClassForm.status"
                                    active-color="#13ce66"
                                    inactive-color="#ff4949"
                            >
                            </el-switch>

                        </el-form-item>

                    </el-col>
                </el-row>
                <input type="hidden" v-model="schClassForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateSchClass = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="updateSchClass">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-sch'
    import {Sch_ClassReact} from "../../collection/schClass";

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
                Sch_ClassReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                schClassData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddSchClass: false,
                dialogUpdateSchClass: false,

                schClassForm: {
                    name: "",
                    khName: "",
                    code: "",
                    desc: "",
                    _id: "",
                    teacherId: "",
                    levelId: "",
                    status: false,
                    classDate: moment().toDate(),
                    charge: 0,
                    timeId: ""
                },
                teacherList: [],
                levelList: [],
                timeList: [],

                rules: {
                    classDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input Class Date',
                        trigger: 'blur'
                    }],
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    //code: [{required: true, message: 'Please input code', trigger: 'blur'}],
                    /*  teacherId:
                          [{
                              required: true,
                              type: 'string',
                              message: 'Please choose Teacher',
                              trigger: 'change'
                          }],*/
                    levelId:
                        [{
                            required: true,
                            type: 'string',
                            message: 'Please choose Level',
                            trigger: 'change'
                        }],
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
                Meteor.call('querySchClass', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.schClassData = result.content;
                        this.count = result.countSchClass;
                    }
                    this.isSearching = false;
                });
            }, 300),

            fetchUser() {
                Meteor.call("queryUserOption", (err, result) => {
                    this.applyUserOption = result;
                })
            },
            teacherOpt() {
                let selector = {};
                Meteor.call("queryTeacherOption", selector, (err, result) => {
                    this.teacherList = result;
                })
            },
            levelOpt() {
                let selector = {};
                Meteor.call("queryLevelOption", selector, (err, result) => {
                    this.levelList = result;
                })
            },
            timeOpt() {
                let selector = {};
                Meteor.call("queryTimeOption", selector, (err, result) => {
                    this.timeList = result;
                })
            },
            saveSchClass(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["schClassFormAdd"].validate((valid) => {
                    if (valid) {
                        let schClassDoc = {
                            code: vm.schClassForm.code,
                            name: vm.schClassForm.name,
                            khName: vm.schClassForm.khName,
                            desc: vm.schClassForm.desc,
                            teacherId: vm.schClassForm.teacherId,
                            levelId: vm.schClassForm.levelId,
                            status: vm.schClassForm.status,
                            classDate: vm.schClassForm.classDate,
                            charge: vm.schClassForm.charge,
                            timeId: vm.schClassForm.timeId,
                            classDateName: moment(vm.schClassForm.classDate).format("DD/MM/YYYY"),
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("insertSchClass", schClassDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogAddSchClass = false;

                                vm.$refs["schClassFormAdd"].resetFields();
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
            updateSchClass() {
                let vm = this;
                this.$refs["schClassFormUpdate"].validate((valid) => {
                    if (valid) {
                        let schClassDoc = {
                            _id: vm.schClassForm._id,
                            code: vm.schClassForm.code,
                            name: vm.schClassForm.name,
                            khName: vm.schClassForm.khName,
                            desc: vm.schClassForm.desc,
                            teacherId: vm.schClassForm.teacherId,
                            levelId: vm.schClassForm.levelId,
                            status: vm.schClassForm.status,
                            classDate: vm.schClassForm.classDate,
                            charge: vm.schClassForm.charge,
                            timeId: vm.schClassForm.timeId,
                            classDateName: moment(vm.schClassForm.classDate).format("DD/MM/YYYY"),
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updateSchClass", schClassDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Successfully
                        !`,
                                    type: 'success'
                                });
                                vm.dialogUpdateSchClass = false;

                                vm.$refs["schClassFormUpdate"].resetFields();
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
            removeSchClass(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeSchClass", row._id, (err, result) => {
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
            findSchClassById(doc) {
                let vm = this;
                vm.schClassForm = {};
                Meteor.call("querySchClassById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.schClassForm._id = result._id;
                        vm.schClassForm = result;
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
                this.schClassForm._id = "";
                if (this.$refs["schClassFormAdd"]) {
                    this.$refs["schClassFormAdd"].resetFields();
                }

                if (this.$refs["schClassFormUpdate"]) {
                    this.$refs["schClassFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.fetchUser();
            this.teacherOpt();
            this.levelOpt();
            this.timeOpt();
            this.queryData();
            Meteor.subscribe('Sch_ClassReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['class'];
                return data;
            }
        }
    }
</script>