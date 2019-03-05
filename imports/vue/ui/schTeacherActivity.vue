<template>
    <div class="sch_teacherActivity">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddSchTeacherActivity = true,resetForm()">
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
                        :data="schTeacherActivityData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            :label="langConfig['teacher']"
                            sortable>
                        <template slot-scope="scope">
                            <p v-for="o in scope.row.teacherName">{{o}}</p>
                        </template>
                    </el-table-column>
                    <el-table-column
                            prop="activityDoc.name"
                            :label="langConfig['activity']">
                    </el-table-column>
                    <el-table-column
                            prop="startDateName"
                            :label="langConfig['startDate']">
                    </el-table-column>
                    <el-table-column
                            prop="endDateName"
                            :label="langConfig['endDate']">
                    </el-table-column>
                    <el-table-column
                            prop="desc"
                            :label="langConfig['desc']">
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['action']"
                            width="120"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removeSchTeacherActivity(scope.$index,scope.row,schTeacherActivityData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findSchTeacherActivityById(scope),dialogUpdateSchTeacherActivity= true"
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
                :visible.sync="dialogAddSchTeacherActivity"
                width="70%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schTeacherActivityForm" :rules="rules" ref="schTeacherActivityFormAdd" label-width="120px"
                     class="schTeacherActivityForm">

                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['activity']" prop="activityId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schTeacherActivityForm.activityId"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in activityList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="langConfig['startDate']" prop="startDate">
                            <el-date-picker
                                    v-model="schTeacherActivityForm.startDate"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item :label="langConfig['endDate']" prop="endDate">
                            <el-date-picker
                                    v-model="schTeacherActivityForm.endDate"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>

                        <el-form-item :label="langConfig['topic']" prop="topic">
                            <el-input type="text" v-model="schTeacherActivityForm.topic"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['place']" prop="place">
                            <el-input type="text" v-model="schTeacherActivityForm.place"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['desc']" prop="desc">
                            <el-input type="textarea" v-model="schTeacherActivityForm.desc"></el-input>
                        </el-form-item>

                    </el-col>
                    <el-col :span="2">
                        &nbsp;
                    </el-col>
                    <el-col :span="10">
                        <p><b><i class="material-icons">
                            whatshot
                        </i> {{langConfig['teacher']}}</b></p>
                        <hr>
                        <el-row>
                            <el-table
                                    :data="teacherData"
                                    stripe
                                    style="width: 100%">
                                <el-table-column
                                        type="index"
                                        :index="indexMethod">
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['teacher']">
                                    <template slot-scope="scope">
                                        <el-select style="display: block !important;"
                                                   filterable
                                                   v-model="scope.row.teacherId"
                                                   @change="handleEditTeacher(scope.$index, scope.row)"
                                                   :placeholder="langConfig['chooseItem']">
                                            <el-option
                                                    v-for="item in teacherList"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value"
                                                    :disabled="item.disabled">
                                            </el-option>
                                        </el-select>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['action']"
                                        width="120"
                                >
                                    <template slot-scope="scope">
                                        <el-button type="primary" class="cursor-pointer" icon="el-icon-circle-plus"
                                                   size="small"
                                                   @click="handleAddTeacher()"

                                        ></el-button>
                                        <el-button type="danger" class="cursor-pointer" icon="el-icon-remove"
                                                   size="small"
                                                   @click="removeTeacherData(scope.$index,scope.row)"
                                        ></el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-row>


                        <br>
                        <br>
                    </el-col>
                </el-row>


                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddSchTeacherActivity = false, cancel()">{{langConfig['cancel']}}
                        <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="saveSchTeacherActivity($event)">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateSchTeacherActivity"
                width="70%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schTeacherActivityForm" :rules="rules" ref="schTeacherActivityFormUpdate"
                     label-width="120px"
                     class="schTeacherActivityForm">
                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['activity']" prop="activityId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schTeacherActivityForm.activityId"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in activityList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="langConfig['startDate']" prop="startDate">
                            <el-date-picker
                                    v-model="schTeacherActivityForm.startDate"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item :label="langConfig['endDate']" prop="endDate">
                            <el-date-picker
                                    v-model="schTeacherActivityForm.endDate"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item :label="langConfig['topic']" prop="topic">
                            <el-input type="text" v-model="schTeacherActivityForm.topic"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['place']" prop="place">
                            <el-input type="text" v-model="schTeacherActivityForm.place"></el-input>
                        </el-form-item>

                        <el-form-item :label="langConfig['desc']" prop="desc">
                            <el-input type="textarea" v-model="schTeacherActivityForm.desc"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="2">
                        &nbsp;
                    </el-col>
                    <el-col :span="10">
                        <p><b><i class="material-icons">
                            whatshot
                        </i> {{langConfig['teacher']}}</b></p>
                        <hr>
                        <el-row>
                            <el-table
                                    :data="teacherData"
                                    stripe
                                    style="width: 100%">
                                <el-table-column
                                        type="index"
                                        :index="indexMethod">
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['teacher']">
                                    <template slot-scope="scope">
                                        <el-select style="display: block !important;"
                                                   filterable
                                                   v-model="scope.row.teacherId"
                                                   @change="handleEditTeacher(scope.$index, scope.row)"
                                                   :placeholder="langConfig['chooseItem']">
                                            <el-option
                                                    v-for="item in teacherList"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value"
                                                    :disabled="item.disabled">
                                            </el-option>
                                        </el-select>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['action']"
                                        width="120"
                                >
                                    <template slot-scope="scope">
                                        <el-button type="primary" class="cursor-pointer" icon="el-icon-circle-plus"
                                                   size="small"
                                                   @click="handleAddTeacher()"

                                        ></el-button>
                                        <el-button type="danger" class="cursor-pointer" icon="el-icon-remove"
                                                   size="small"
                                                   @click="removeTeacherData(scope.$index,scope.row)"
                                        ></el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-row>


                        <br>
                        <br>
                    </el-col>
                </el-row>


                <input type="hidden" v-model="schTeacherActivityForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateSchTeacherActivity = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="updateSchTeacherActivity">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-sch'
    import {Sch_TeacherActivityReact} from "../../collection/schTeacherActivity";

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
                Sch_TeacherActivityReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                newLoading: true,
                schTeacherActivityData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddSchTeacherActivity: false,
                dialogUpdateSchTeacherActivity: false,
                teacherList: [],
                activityList: [],
                teacherData: [{
                    teacherId: ""
                }],
                schTeacherActivityForm: {
                    teacherId: [],
                    activityId: "",
                    desc: "",
                    startDate: "",
                    endDate: "",
                    _id: ""
                },
                rules: {
                    teacherId:
                        [{
                            required: true,
                            type: "string",
                            message: 'Please choose Teacher',
                            trigger: 'change'
                        }],

                    activityId:
                        [{
                            required: true,
                            type: "string",
                            message: 'Please choose Activity',
                            trigger: 'change'
                        }],
                    startDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input Start Date',
                        trigger: 'blur'
                    }],
                    endDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input End Date',
                        trigger: 'blur'
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
                this.newLoading = true;
                Meteor.call('querySchTeacherActivity', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.schTeacherActivityData = result.content;
                        this.count = result.countSchTeacherActivity;
                    }
                    this.isSearching = false;
                    this.newLoading = false;
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

            teacherOpt() {
                let selector = {};
                Meteor.call("queryTeacherOption", selector, (err, result) => {
                    this.teacherList = result;
                })
            },
            activityOpt() {

                let selector = {};
                Meteor.call("queryActivityOption", selector, (err, result) => {
                    this.activityList = result;
                })
            },
            saveSchTeacherActivity(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["schTeacherActivityFormAdd"].validate((valid) => {
                    if (valid) {
                        let teacher = [];
                        this.teacherData.map((obj) => {
                            if (obj.teacherId) {
                                teacher.push(obj);
                            }
                        });
                        let schTeacherActivityDoc = {
                            teacher: teacher,
                            activityId: vm.schTeacherActivityForm.activityId,
                            startDate: vm.schTeacherActivityForm.startDate,
                            startDateName: moment(vm.schTeacherActivityForm.startDate).format("DD/MM/YYYY"),
                            endDate: vm.schTeacherActivityForm.endDate,
                            endDateName: moment(vm.schTeacherActivityForm.endDate).format("DD/MM/YYYY"),
                            desc: vm.schTeacherActivityForm.desc,
                            topic: vm.schTeacherActivityForm.topic,
                            place: vm.schTeacherActivityForm.place,
                            rolesArea: Session.get('area')
                        };


                        Meteor.call("insertSchTeacherActivity", schTeacherActivityDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogAddSchTeacherActivity = false;

                                vm.$refs["schTeacherActivityFormAdd"].resetFields();
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
            updateSchTeacherActivity() {
                let vm = this;
                this.$refs["schTeacherActivityFormUpdate"].validate((valid) => {
                    if (valid) {
                        let teacher = [];
                        this.teacherData.map((obj) => {
                            if (obj.teacherId) {
                                teacher.push(obj);
                            }
                        });
                        let schTeacherActivityDoc = {
                            _id: vm.schTeacherActivityForm._id,
                            teacher: teacher,
                            activityId: vm.schTeacherActivityForm.activityId,
                            startDate: vm.schTeacherActivityForm.startDate,
                            startDateName: moment(vm.schTeacherActivityForm.startDate).format("DD/MM/YYYY"),
                            endDate: vm.schTeacherActivityForm.endDate,
                            endDateName: moment(vm.schTeacherActivityForm.endDate).format("DD/MM/YYYY"),
                            desc: vm.schTeacherActivityForm.desc,
                            topic: vm.schTeacherActivityForm.topic,
                            place: vm.schTeacherActivityForm.place,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updateSchTeacherActivity", schTeacherActivityDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Successfully
                        !`,
                                    type: 'success'
                                });
                                vm.dialogUpdateSchTeacherActivity = false;

                                vm.$refs["schTeacherActivityFormUpdate"].resetFields();
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
            removeSchTeacherActivity(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeSchTeacherActivity", row._id, (err, result) => {
                        if (!err) {
                            rows.splice(index, 1);

                            vm.$message({
                                message: `
                        លុប បានជោគជ័យ`,
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
            findSchTeacherActivityById(doc) {
                let vm = this;
                vm.schTeacherActivityForm = {};
                Meteor.call("querySchTeacherActivityById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.schTeacherActivityForm._id = result._id;
                        vm.schTeacherActivityForm = result;
                        vm.teacherData = result.teacher;
                    }
                })
            },
            handleAddTeacher() {
                this.teacherData.push({
                    teacherId: ""
                })
            },

            handleEditTeacher(index, row) {
                this.teacherData[index] = row;
            },
            removeTeacherData(index, row) {
                if (this.teacherData.length > 1) {
                    this.teacherData.splice(index, 1);
                    this.$message({
                        message: `លុប បានជោគជ័យ`,
                        type: 'success'
                    });
                } else {
                    this.teacherData = [{
                        teacherId: ""

                    }];
                }
            },
            cancel() {
                this.$message({
                    type: 'info',
                    message: 'Canceled'
                });
            },
            resetForm() {
                this.schTeacherActivityForm._id = "";
                this.teacherData = [{
                    teacherId: ""

                }];
                if (this.$refs["schTeacherActivityFormAdd"]) {
                    this.$refs["schTeacherActivityFormAdd"].resetFields();
                }

                if (this.$refs["schTeacherActivityFormUpdate"]) {
                    this.$refs["schTeacherActivityFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.fetchUser();
            this.queryData();
            this.teacherOpt();
            this.activityOpt();
            Meteor.subscribe('Sch_TeacherActivityReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['teacherActivity'];
                return data;
            }
        }
    }
</script>