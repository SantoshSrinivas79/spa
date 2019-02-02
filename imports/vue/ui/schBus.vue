<template>
    <div class="sch_bus">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddSchBus = true,resetForm(),popUpAdd()">
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
                        :data="schBusData"
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
                            prop="contact"
                            :label="langConfig['contact']"
                            sortable>
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
                                           @click="removeSchBus(scope.$index,scope.row,schBusData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findSchBusById(scope),dialogUpdateSchBus= true,popUpUpdate()"
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
                :visible.sync="dialogAddSchBus"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schBusForm" :rules="rules" :ref="ref" label-width="120px"
                     class="schBusForm">
                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="schBusForm.name"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['code']" prop="code">
                    <el-input v-model="schBusForm.code"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['contact']" prop="contact">
                    <el-input v-model="schBusForm.contact"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['desc']" prop="desc">
                    <el-input type="textarea" v-model="schBusForm.desc"></el-input>
                </el-form-item>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddSchBus = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="saveSchBus($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateSchBus"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schBusForm" :rules="rules" :ref="ref" label-width="120px"
                     class="schBusForm">

                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="schBusForm.name"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['code']" prop="code">
                    <el-input v-model="schBusForm.code"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['contact']" prop="contact">
                    <el-input v-model="schBusForm.contact"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['desc']" prop="desc">
                    <el-input type="textarea" v-model="schBusForm.desc"></el-input>
                </el-form-item>

                <input type="hidden" v-model="schBusForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateSchBus = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="updateSchBus">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-sch'
    import {Sch_BusReact} from "../../collection/schBus";

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
                Sch_BusReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                ref: "",
                schBusData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddSchBus: false,
                dialogUpdateSchBus: false,
                schBusForm: {
                    name: "",
                    contact: "",
                    code: "",
                    desc: "",
                    _id: "",

                },
                rules: {
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    code: [{required: true, message: 'Please input code', trigger: 'blur'}],
                    contact: [{required: true, message: 'Please input Price', trigger: 'blur'}]
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
                Meteor.call('querySchBus', {
                    q: val,
                    filter: this.filter,
                    rolesArea:Session.get('area'),
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.schBusData = result.content;
                        this.count = result.countSchBus;
                    }
                    this.isSearching = false;
                });
            }, 300),

            fetchUser() {
                Meteor.call("queryUserOption", (err, result) => {
                    this.applyUserOption = result;
                })
            },
            saveSchBus(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["schBusFormAdd"].validate((valid) => {
                    if (valid) {
                        let schBusDoc = {
                            code: vm.schBusForm.code,
                            name: vm.schBusForm.name,
                            contact: vm.schBusForm.contact,
                            desc: vm.schBusForm.desc,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("insertSchBus", schBusDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogAddSchBus = false;

                                vm.$refs["schBusFormAdd"].resetFields();
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
            updateSchBus() {
                let vm = this;
                this.$refs["schBusFormUpdate"].validate((valid) => {
                    if (valid) {
                        let schBusDoc = {
                            _id: vm.schBusForm._id,
                            code: vm.schBusForm.code,
                            name: vm.schBusForm.name,
                            contact: vm.schBusForm.khName,
                            desc: vm.schBusForm.desc,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updateSchBus", schBusDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Successfully
                        !`,
                                    type: 'success'
                                });
                                vm.dialogUpdateSchBus = false;

                                vm.$refs["schBusFormUpdate"].resetFields();
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
            removeSchBus(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeSchBus", row._id, (err, result) => {
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
            findSchBusById(doc) {
                let vm = this;
                vm.schBusForm = {};
                Meteor.call("querySchBusById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.schBusForm._id = result._id;
                        vm.schBusForm = result;
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
                this.schBusForm._id = "";
                if (this.$refs["schBusFormAdd"]) {
                    this.$refs["schBusFormAdd"].resetFields();
                }

                if (this.$refs["schBusFormUpdate"]) {
                    this.$refs["schBusFormUpdate"].resetFields();
                }

            },
            popUpAdd() {
                this.ref = "schBusFormAdd";
            },
            popUpUpdate() {
                this.ref = "schBusFormUpdate";
            }
        },
        created() {
            this.isSearching = true;
            this.fetchUser();
            this.queryData();
            Meteor.subscribe('Sch_BusReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['bus'];
                return data;
            }
        }
    }
</script>