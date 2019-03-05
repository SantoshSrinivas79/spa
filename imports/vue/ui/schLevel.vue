<template>
    <div class="sch_level">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddSchLevel = true,resetForm(),popUpAdd()">
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
                        :data="schLevelData"
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
                            prop="price"
                            :label="langConfig['price']">
                    </el-table-column>
                    <el-table-column
                            prop="term"
                            :label="langConfig['term']">
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
                                           @click="removeSchLevel(scope.$index,scope.row,schLevelData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findSchLevelById(scope),dialogUpdateSchLevel= true,popUpUpdate()"
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
                :visible.sync="dialogAddSchLevel"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schLevelForm" :rules="rules" :ref="ref" label-width="120px"
                     class="schLevelForm">
                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="schLevelForm.name"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['khName']" prop="khName">
                    <el-input v-model="schLevelForm.khName"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['code']" prop="code">
                    <el-input v-model="schLevelForm.code"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['program']" prop="programId">
                    <el-select style="display: block !important;"
                               filterable
                               v-model="schLevelForm.programId"
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
                <el-form-item :label="langConfig['major']" prop="majorId">
                    <el-select style="display: block !important;"
                               filterable
                               v-model="schLevelForm.majorId"
                               :placeholder="langConfig['chooseItem']">
                        <el-option
                                v-for="item in majorList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="langConfig['price']" prop="price">
                    <el-input v-model="schLevelForm.price"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['term']" prop="term">
                    <el-select style="display: block !important;"
                               filterable
                               v-model="schLevelForm.term"
                               :placeholder="langConfig['chooseItem']">
                        <el-option
                                v-for="item in termList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item :label="langConfig['desc']" prop="desc">
                    <el-input type="textarea" v-model="schLevelForm.desc"></el-input>
                </el-form-item>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddSchLevel = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="saveSchLevel($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateSchLevel"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schLevelForm" :rules="rules" :ref="ref" label-width="120px"
                     class="schLevelForm">

                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="schLevelForm.name"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['khName']" prop="khName">
                    <el-input v-model="schLevelForm.khName"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['code']" prop="code">
                    <el-input v-model="schLevelForm.code"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['program']" prop="programId">
                    <el-select style="display: block !important;"
                               filterable
                               v-model="schLevelForm.programId"
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
                <el-form-item :label="langConfig['major']" prop="majorId">
                    <el-select style="display: block !important;"
                               filterable
                               v-model="schLevelForm.majorId"
                               :placeholder="langConfig['chooseItem']">
                        <el-option
                                v-for="item in majorList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item :label="langConfig['price']" prop="price">
                    <el-input v-model="schLevelForm.price"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['term']" prop="term">
                    <el-select style="display: block !important;"
                               filterable
                               v-model="schLevelForm.term"
                               :placeholder="langConfig['chooseItem']">
                        <el-option
                                v-for="item in termList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="langConfig['desc']" prop="desc">
                    <el-input type="textarea" v-model="schLevelForm.desc"></el-input>
                </el-form-item>

                <input type="hidden" v-model="schLevelForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateSchLevel = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="updateSchLevel">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-sch'
    import {Sch_LevelReact} from "../../collection/schLevel";

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
                Sch_LevelReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                newLoading: true,
                ref: "",
                schLevelData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddSchLevel: false,
                dialogUpdateSchLevel: false,
                termList: [
                    {label: "1 month", value: 1},
                    {label: "2 months", value: 2},
                    {label: "3 months", value: 3},
                    {label: "4 months", value: 4},
                    {label: "5 months", value: 5},
                    {label: "6 months", value: 6},
                    {label: "7 months", value: 7},
                    {label: "8 months", value: 8},
                    {label: "9 months", value: 9},
                    {label: "10 months", value: 10},
                    {label: "11 months", value: 11},
                    {label: "12 months", value: 12},
                ],
                majorList: [],
                programList: [],
                schLevelForm: {
                    name: "",
                    khName: "",
                    code: "",
                    desc: "",
                    _id: "",
                    price: "",
                    term: "",
                    majorId: "",
                    programId: ""
                },
                rules: {
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    code: [{required: true, message: 'Please input code', trigger: 'blur'}],
                    price: [{required: true, message: 'Please input Price', trigger: 'blur'}],
                    term:
                        [{
                            required: true,
                            type: "number",
                            message: 'Please choose Term',
                            trigger: 'change'
                        }],
                    programId:
                        [{
                            required: true,
                            type: "string",
                            message: 'Please choose Level',
                            trigger: 'change'
                        }],
                    majorId:
                        [{
                            required: true,
                            type: "string",
                            message: 'Please choose Major',
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
            },
            "schLevelForm.programId"(val) {
                this.majorOpt(val);
                if (this.ref === "schLevelFormAdd") {
                    this.schLevelForm.majorId = "";
                }
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
                Meteor.call('querySchLevel', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.schLevelData = result.content;
                        this.count = result.countSchLevel;
                    }
                    this.isSearching = false;
                    this.newLoading = false;
                });
            }, 300),

            fetchUser() {
                Meteor.call("queryUserOption", (err, result) => {
                    this.applyUserOption = result;
                })
            },
            programOpt() {
                let selector = {};
                Meteor.call("queryProgramOption", selector, (err, result) => {
                    this.programList = result;
                })
            },
            majorOpt(programId) {
                let selector = {};
                if (programId === "") {
                    this.majorList = result;
                } else {
                    selector.programId = programId;
                    Meteor.call("queryMajorOption", selector, (err, result) => {
                        this.majorList = result;
                    })
                }
            },
            saveSchLevel(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["schLevelFormAdd"].validate((valid) => {
                    if (valid) {
                        let schLevelDoc = {
                            code: vm.schLevelForm.code,
                            name: vm.schLevelForm.name,
                            khName: vm.schLevelForm.khName,
                            desc: vm.schLevelForm.desc,
                            price: vm.schLevelForm.price,
                            term: vm.schLevelForm.term,
                            programId: vm.schLevelForm.programId,
                            majorId: vm.schLevelForm.majorId,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("insertSchLevel", schLevelDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogAddSchLevel = false;

                                vm.$refs["schLevelFormAdd"].resetFields();
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
            updateSchLevel() {
                let vm = this;
                this.$refs["schLevelFormUpdate"].validate((valid) => {
                    if (valid) {
                        let schLevelDoc = {
                            _id: vm.schLevelForm._id,
                            code: vm.schLevelForm.code,
                            name: vm.schLevelForm.name,
                            khName: vm.schLevelForm.khName,
                            desc: vm.schLevelForm.desc,
                            price: vm.schLevelForm.price,
                            term: vm.schLevelForm.term,
                            programId: vm.schLevelForm.programId,
                            majorId: vm.schLevelForm.majorId,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updateSchLevel", schLevelDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Successfully
                        !`,
                                    type: 'success'
                                });
                                vm.dialogUpdateSchLevel = false;

                                vm.$refs["schLevelFormUpdate"].resetFields();
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
            removeSchLevel(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeSchLevel", row._id, (err, result) => {
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
            findSchLevelById(doc) {
                let vm = this;
                vm.schLevelForm = {};
                Meteor.call("querySchLevelById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.schLevelForm._id = result._id;
                        vm.schLevelForm = result;
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
                this.schLevelForm._id = "";
                if (this.$refs["schLevelFormAdd"]) {
                    this.$refs["schLevelFormAdd"].resetFields();
                }

                if (this.$refs["schLevelFormUpdate"]) {
                    this.$refs["schLevelFormUpdate"].resetFields();
                }

            },
            popUpAdd() {
                this.ref = "schLevelFormAdd";
            },
            popUpUpdate() {
                this.ref = "schLevelFormUpdate";
            }
        },
        created() {
            this.isSearching = true;
            this.fetchUser();
            this.programOpt();
            this.queryData();
            Meteor.subscribe('Sch_LevelReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['level'];
                return data;
            }
        }
    }
</script>