<template>
    <div class="sch_mention">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddSchMention = true,resetForm()">
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
                        :data="schMentionData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="dateName"
                            :label="langConfig['date']"
                            sortable>
                    </el-table-column>

                    <el-table-column
                            prop="status"
                            :label="langConfig['status']"
                            width="150"
                            filter-placement="bottom-end">
                        <template slot-scope="scope">
                            <el-tag
                                    :type="scope.row.status === true ? 'success' :  'danger'"
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
                                           @click="removeSchMention(scope.$index,scope.row,schMentionData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findSchMentionById(scope),dialogUpdateSchMention= true"
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
                :visible.sync="dialogAddSchMention"
                width="50%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schMentionForm" :rules="rules" ref="schMentionFormAdd" label-width="120px"
                     class="schMentionForm">


                <el-row>
                    <p>{{langConfig['Range']}}</p>
                    <el-table
                            :data="rangeData"
                            stripe
                            style="width: 100%">
                        <el-table-column
                                type="index"
                                :index="indexMethod">
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['from']">
                            <template slot-scope="scope">
                                <el-input size="small" v-model="scope.row.from"
                                          :placeholder="langConfig['from']"
                                          @change="handleEditRange(scope.$index, scope.row)"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['to']">
                            <template slot-scope="scope">
                                <el-input size="small" v-model="scope.row.to"
                                          :placeholder="langConfig['to']"
                                          @change="handleEditRange(scope.$index, scope.row)"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['grade']">
                            <template slot-scope="scope">
                                <el-input size="small" v-model="scope.row.grade" :placeholder="langConfig['grade']"
                                          @change="handleEditRange(scope.$index, scope.row)"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['gradePoint']">
                            <template slot-scope="scope">
                                <el-input size="small" v-model="scope.row.gradePoint"
                                          :placeholder="langConfig['gradePoint']"
                                          @change="handleEditRange(scope.$index, scope.row)"></el-input>
                            </template>
                        </el-table-column>

                        <el-table-column
                                :label="langConfig['action']"
                                width="120"
                        >
                            <template slot-scope="scope">
                                <el-button type="primary" class="cursor-pointer" icon="el-icon-circle-plus"
                                           size="small"
                                           @click="handleAddRange()"

                                ></el-button>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-remove"
                                           size="small"
                                           @click="removeRange(scope.$index,scope.row)"
                                ></el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-row>
                <br>
                <el-row>
                    <el-col :span="12">

                        <el-form-item :label="langConfig['date']" prop="date">
                            <el-date-picker
                                    v-model="schMentionForm.date"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">

                        <el-form-item :label="langConfig['status']" prop="status">
                            <el-switch
                                    v-model="schMentionForm.status"
                                    active-color="#13ce66"
                                    inactive-color="#ff4949"
                            >
                            </el-switch>
                        </el-form-item>
                    </el-col>
                </el-row>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddSchMention = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="saveSchMention($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateSchMention"
                width="50%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schMentionForm" :rules="rules" ref="schMentionFormUpdate" label-width="120px"
                     class="schMentionForm">

                <el-row>
                    <p>{{langConfig['Range']}}</p>
                    <el-table
                            :data="rangeData"
                            stripe
                            style="width: 100%">
                        <el-table-column
                                type="index"
                                :index="indexMethod">
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['from']">
                            <template slot-scope="scope">
                                <el-input size="small" v-model="scope.row.from"
                                          :placeholder="langConfig['from']"
                                          @change="handleEditRange(scope.$index, scope.row)"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['to']">
                            <template slot-scope="scope">
                                <el-input size="small" v-model="scope.row.to"
                                          :placeholder="langConfig['to']"
                                          @change="handleEditRange(scope.$index, scope.row)"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['grade']">
                            <template slot-scope="scope">
                                <el-input size="small" v-model="scope.row.grade" :placeholder="langConfig['grade']"
                                          @change="handleEditRange(scope.$index, scope.row)"></el-input>
                            </template>
                        </el-table-column>

                        <el-table-column
                                :label="langConfig['gradePoint']">
                            <template slot-scope="scope">
                                <el-input size="small" v-model="scope.row.gradePoint"
                                          :placeholder="langConfig['gradePoint']"
                                          @change="handleEditRange(scope.$index, scope.row)"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['action']"
                                width="120"
                        >
                            <template slot-scope="scope">
                                <el-button type="primary" class="cursor-pointer" icon="el-icon-circle-plus"
                                           size="small"
                                           @click="handleAddRange()"

                                ></el-button>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-remove"
                                           size="small"
                                           @click="removeRange(scope.$index,scope.row)"
                                ></el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-row>
                <br>

                <el-row>
                    <el-col :span="12">

                        <el-form-item :label="langConfig['date']" prop="date">
                            <el-date-picker
                                    v-model="schMentionForm.date"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">

                        <el-form-item :label="langConfig['status']" prop="status">
                            <el-switch
                                    v-model="schMentionForm.status"
                                    active-color="#13ce66"
                                    inactive-color="#ff4949"
                            >
                            </el-switch>
                        </el-form-item>
                    </el-col>
                </el-row>
                <input type="hidden" v-model="schMentionForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateSchMention = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="updateSchMention">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-sch'
    import {Sch_MentionReact} from "../../collection/schMention";

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
                Sch_MentionReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                schMentionData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddSchMention: false,
                dialogUpdateSchMention: false,

                schMentionForm: {
                    date: "",
                    status: false,
                    range: [],
                    _id: ""
                },
                rules: {
                    date: [{required: true, message: 'Please input date', trigger: 'blur'}],
                },
                rangeData: [
                    {from: "", to: "", grade: "", gradePoint: ""}
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
                Meteor.call('querySchMention', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.schMentionData = result.content;
                        this.count = result.countSchMention;
                    }
                    this.isSearching = false;
                });
            }, 300),
            indexMethod(index) {
                return index + 1;
            },
            handleEditRange(index, row) {
                this.rangeData[index] = row;
            },
            handleAddRange() {
                this.rangeData.push({
                    from: "",
                    to: "",
                    grade: ""
                })
            },
            removeRange(index, row) {
                if (this.rangeData.length > 1) {
                    this.rangeData.splice(index, 1);
                    this.$message({
                        message: `លុប បានជោគជ័យ`,
                        type: 'success'
                    });
                } else {
                    this.rangeData = [{
                        from: "",
                        to: "",
                        grade: ""
                    }];
                }
            },
            saveSchMention(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["schMentionFormAdd"].validate((valid) => {
                    if (valid) {
                        let schMentionDoc = {
                            date: vm.schMentionForm.date,
                            dateName: moment(vm.schMentionForm.date).format("DD/MM/YYYY"),
                            status: vm.schMentionForm.status,
                            range: vm.rangeData,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("insertSchMention", schMentionDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogAddSchMention = false;

                                vm.$refs["schMentionFormAdd"].resetFields();
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
            updateSchMention() {
                let vm = this;
                this.$refs["schMentionFormUpdate"].validate((valid) => {
                    if (valid) {
                        let schMentionDoc = {
                            date: vm.schMentionForm.date,
                            dateName: moment(vm.schMentionForm.date).format("DD/MM/YYYY"),
                            status: vm.schMentionForm.status,
                            range: vm.rangeData,
                            rolesArea: Session.get('area'),
                            _id: vm.schMentionForm._id
                        };

                        Meteor.call("updateSchMention", schMentionDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Successfully
                        !`,
                                    type: 'success'
                                });
                                vm.dialogUpdateSchMention = false;

                                vm.$refs["schMentionFormUpdate"].resetFields();
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
            removeSchMention(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeSchMention", row._id, (err, result) => {
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
            findSchMentionById(doc) {
                let vm = this;
                Meteor.call("querySchMentionById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.schMentionForm._id = result._id;
                        vm.schMentionForm.date = result.date;
                        vm.schMentionForm.status = result.status;
                        vm.rangeData = result.range;
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
                this.schMentionForm._id = "";
                this.schMentionForm.status = false;

                this.rangeData = [{
                    from: "",
                    to: "",
                    grade: "",
                    gradePoint: ""
                }];

                if (this.$refs["schMentionFormAdd"]) {
                    this.$refs["schMentionFormAdd"].resetFields();
                }

                if (this.$refs["schMentionFormUpdate"]) {
                    this.$refs["schMentionFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            Meteor.subscribe('Sch_MentionReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['mention'];
                return data;
            }
        }
    }
</script>