<template>
    <div class="pos_agent">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddPosAgent = true,resetForm()">
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
                        :data="posAgentData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="name"
                            :label="langConfig['name']"
                            sortable>
                    </el-table-column>
                    <!--<el-table-column
                            prop="khName"
                            label="Khmer Name">
                    </el-table-column>-->
                    <el-table-column
                            prop="address"
                            :label="langConfig['address']">
                    </el-table-column>
                    <!--<el-table-column
                            prop="termDoc.name"
                            label="Term">
                    </el-table-column>-->
                    <el-table-column
                            prop="phoneNumber"
                            :label="langConfig['phoneNumber']">
                    </el-table-column>
                    <!--<el-table-column
                            prop="email"
                            label="Email">
                    </el-table-column>-->
                    <el-table-column
                            prop="description"
                            :label="langConfig['description']">
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['action']"
                            width="120"

                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removePosAgent(scope.$index,scope.row,posAgentData)"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findPosAgentById(scope),dialogUpdatePosAgent= true"></el-button>
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
                :visible.sync="dialogAddPosAgent"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posAgentForm" :rules="rules" ref="posAgentFormAdd" label-width="120px"
                     class="posAgentForm">

                <el-row>
                    <el-col :span="24">
                        <el-form-item :label="langConfig['name']" prop="name">
                            <el-input v-model="posAgentForm.name"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['address']" prop="address">
                            <el-input v-model="posAgentForm.address"></el-input>
                        </el-form-item>


                        <el-form-item :label="langConfig['phoneNumber']" prop="phoneNumber">
                            <el-input v-model="posAgentForm.phoneNumber"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['description']" prop="description">
                            <el-input v-model="posAgentForm.description"></el-input>
                        </el-form-item>
                    </el-col>

                </el-row>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddPosAgent = false, cancel()"
                    >{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="savePosAgent">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdatePosAgent"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posAgentForm" :rules="rules" ref="posAgentFormUpdate" label-width="120px"
                     class="posAgentForm">
                <el-row>
                    <el-col :span="24">
                        <el-form-item :label="langConfig['name']" prop="name">
                            <el-input v-model="posAgentForm.name"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['address']" prop="address">
                            <el-input v-model="posAgentForm.address"></el-input>
                        </el-form-item>


                        <el-form-item :label="langConfig['phoneNumber']" prop="phoneNumber">
                            <el-input v-model="posAgentForm.phoneNumber"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['description']" prop="description">
                            <el-input v-model="posAgentForm.description"></el-input>
                        </el-form-item>
                    </el-col>


                    <input type="hidden" v-model="posAgentForm._id"/>
                </el-row>


                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdatePosAgent = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="updatePosAgent">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label'

    export default {
        meteor: {
            langSession() {
                return Session.get('lang') || "en";
            }
        },
        data() {
            return {
                langSession: null,
                posAgentData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddPosAgent: false,
                dialogUpdatePosAgent: false,

                posAgentForm: {
                    name: "",
                    address: "",
                    phoneNumber: "",
                    description: "",
                    _id: ""
                },
                rules: {
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    address: [{required: true, message: 'Please input Address', trigger: 'blur'}]

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
                Meteor.call('queryPosAgent', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.posAgentData = result.content;
                        this.count = result.countPosAgent;
                    }
                    this.isSearching = false;
                });
            }, 300),
            savePosAgent() {
                let vm = this;
                this.$refs["posAgentFormAdd"].validate((valid) => {
                    if (valid) {
                        let posAgentDoc = {
                            name: vm.posAgentForm.name,
                            address: vm.posAgentForm.address,
                            phoneNumber: vm.posAgentForm.phoneNumber,
                            description: vm.posAgentForm.description,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("insertPosAgent", posAgentDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['saveSuccess'],
                                    type: 'success'
                                });
                                vm.dialogAddPosAgent = false;
                                vm.queryData();
                                vm.resetForm();

                                vm.$refs["posAgentForm"].resetFields();
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
            updatePosAgent() {
                let vm = this;
                this.$refs["posAgentFormUpdate"].validate((valid) => {
                    if (valid) {
                        let posAgentDoc = {
                            _id: vm.posAgentForm._id,
                            name: vm.posAgentForm.name,
                            address: vm.posAgentForm.address,
                            phoneNumber: vm.posAgentForm.phoneNumber,
                            description: vm.posAgentForm.description,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updatePosAgent", posAgentDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['updateSuccess'],
                                    type: 'success'
                                });
                                vm.dialogUpdatePosAgent = false;
                                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
                                vm.resetForm();

                                vm.$refs["posAgentForm"].resetFields();
                            } else {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['updateFail'],
                                    type: 'error'
                                });
                            }
                        })
                    }
                })

            },
            removePosAgent(index, row, rows) {
                let vm = this;
                if (row.transactionNumber <= 0) {
                    this.$confirm(this.langConfig['message'], this.langConfig['warning'], {
                        confirmButtonText: 'OK',
                        cancelButtonText: 'Cancel',
                        type: 'warning'
                    }).then(() => {
                        Meteor.call("removePosAgent", row._id, (err, result) => {
                            if (!err) {
                                rows.splice(index, 1);

                                vm.$message({
                                    message: `${row.name}` + this.langConfig['removeSuccess'],
                                    type: 'success'
                                });


                            } else {
                                vm.$message({
                                    type: 'error',
                                    message: this.langConfig['removeFail']
                                });
                            }

                        })

                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: this.langConfig['cancel']
                        });
                    });
                } else {
                    this.$message({
                        type: 'error',
                        message: this.langConfig['messageInovice'] + " " + row.transactionNumber
                    });
                }
            },
            findPosAgentById(doc) {
                let vm = this;
                vm.posAgentForm = {};

                Meteor.call("queryPosAgentById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.posAgentForm._id = result._id;
                        vm.posAgentForm = result;
                    }
                })
            },
            cancel() {
                this.$message({
                    type: 'info',
                    message: this.langConfig['cancel']
                });
            },
            resetForm() {
                this.posAgentForm._id = "";
                if (this.$refs["posAgentFormAdd"]) {
                    this.$refs["posAgentFormAdd"].resetFields();
                }

                if (this.$refs["posAgentFormUpdate"]) {
                    this.$refs["posAgentFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['agent'];
                return data;
            }
        }
    }
</script>