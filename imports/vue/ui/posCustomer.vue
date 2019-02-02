<template>
    <div class="pos_customer">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddPosCustomer = true,resetForm()">
                            <i class="fa fa-plus"></i> {{langConfig['customer']}}
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
                        :data="posCustomerData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="name"
                            :label="langConfig['companyName']"
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
                            prop="invoiceNumber"
                            :label="langConfig['numberOfInvoice']">
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['action']"
                            width="120"

                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removePosCustomer(scope.$index,scope.row,posCustomerData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findPosCustomerById(scope),dialogUpdatePosCustomer= true"
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
                :title="langConfig['addCustomer']"
                :visible.sync="dialogAddPosCustomer"
                width="40%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posCustomerForm" :rules="rules" ref="posCustomerFormAdd" label-width="120px"
                     class="posCustomerForm">

                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['companyName']" prop="name">
                            <el-input v-model="posCustomerForm.name"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['khCompanyName']" prop="khName">
                            <el-input v-model="posCustomerForm.khName"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['dob']" prop="dob">
                            <el-date-picker
                                    v-model="posCustomerForm.dob"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>

                        <el-form-item :label="langConfig['address']" prop="address">
                            <el-input v-model="posCustomerForm.address"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['email']" prop="email">
                            <el-input v-model="posCustomerForm.email"></el-input>
                        </el-form-item>


                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['term']" prop="termId">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="posCustomerForm.termId"
                                       :placeholder="langConfig['term']">
                                <el-option
                                        v-for="item in termDataOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="langConfig['openingBalance']" prop="openingBalance">
                            <el-input v-model="posCustomerForm.openingBalance"></el-input>
                        </el-form-item>

                        <el-form-item :label="langConfig['nationId']" prop="nationId">
                            <el-input v-model="posCustomerForm.nationId"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['phoneNumber']" prop="phoneNumber">
                            <el-input v-model="posCustomerForm.phoneNumber"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['note']" prop="note">
                            <el-input type="textarea" v-model="posCustomerForm.note"></el-input>
                        </el-form-item>

                    </el-col>
                </el-row>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddPosCustomer = false, cancel()"
                    >{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="savePosCustomer($event)">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['updateCustomer']"
                :visible.sync="dialogUpdatePosCustomer"
                width="40%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posCustomerForm" :rules="rules" ref="posCustomerFormUpdate" label-width="120px"
                     class="posCustomerForm">
                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['companyName']" prop="name">
                            <el-input v-model="posCustomerForm.name"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['khCompanyName']" prop="khName">
                            <el-input v-model="posCustomerForm.khName"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['dob']" prop="dob">
                            <el-date-picker
                                    v-model="posCustomerForm.dob"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>

                        <el-form-item :label="langConfig['address']" prop="address">
                            <el-input v-model="posCustomerForm.address"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['email']" prop="email">
                            <el-input v-model="posCustomerForm.email"></el-input>
                        </el-form-item>


                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['term']" prop="termId">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="posCustomerForm.termId"
                                       :placeholder="langConfig['term']">
                                <el-option
                                        v-for="item in termDataOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="langConfig['openingBalance']" prop="openingBalance">
                            <el-input v-model="posCustomerForm.openingBalance"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['nationId']" prop="nationId">
                            <el-input v-model="posCustomerForm.nationId"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['phoneNumber']" prop="phoneNumber">
                            <el-input v-model="posCustomerForm.phoneNumber"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['note']" prop="note">
                            <el-input type="textarea" v-model="posCustomerForm.note"></el-input>
                        </el-form-item>


                        <input type="hidden" v-model="posCustomerForm._id"/>
                    </el-col>
                </el-row>


                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdatePosCustomer = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="updatePosCustomer">{{langConfig['save']}} <i>(Ctrl + Enter)</i>
                    </el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label'
    import {Pos_CustomerReact} from "../../collection/posCustomer";

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
                Pos_CustomerReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                langSession: null,
                posCustomerData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddPosCustomer: false,
                dialogUpdatePosCustomer: false,

                posCustomerForm: {
                    name: "",
                    khName: "",
                    address: "",
                    email: "",
                    phoneNumber: "",
                    termId: "",
                    openingBalance: "",
                    note: "",
                    dob: "",
                    nationId: "",
                    _id: ""
                },
                rules: {
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    termId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose customer',
                        trigger: 'change'
                    }],

                },
                termDataOption: [],
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
                Meteor.call('queryPosCustomer', {
                    q: val,
                    filter: this.filter,
                    rolesArea:Session.get('area'),
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.posCustomerData = result.content;
                        this.count = result.countPosCustomer;
                    }
                    this.isSearching = false;
                });
            }, 300),
            posTermOption() {
                let selector = {};
                Meteor.call('queryPosTermOption', selector, this.posCustomerForm._id, (err, result) => {
                    this.termDataOption = result;
                })
            },
            savePosCustomer(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["posCustomerFormAdd"].validate((valid) => {
                    if (valid) {
                        let posCustomerDoc = {
                            name: vm.posCustomerForm.name,
                            khName: vm.posCustomerForm.khName,
                            address: vm.posCustomerForm.address,
                            email: vm.posCustomerForm.email,
                            phoneNumber: vm.posCustomerForm.phoneNumber,
                            termId: vm.posCustomerForm.termId,
                            openingBalance: vm.posCustomerForm.openingBalance,
                            note: vm.posCustomerForm.note,
                            dob: vm.posCustomerForm.dob,
                            nationId: vm.posCustomerForm.nationId,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("insertPosCustomer", posCustomerDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['saveSuccess'],
                                    type: 'success'
                                });
                                vm.dialogAddPosCustomer = false;

                                vm.$refs["posCustomerForm"].resetFields();
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
            updatePosCustomer() {
                let vm = this;
                this.$refs["posCustomerFormUpdate"].validate((valid) => {
                    if (valid) {
                        let posCustomerDoc = {
                            _id: vm.posCustomerForm._id,
                            name: vm.posCustomerForm.name,
                            khName: vm.posCustomerForm.khName,
                            address: vm.posCustomerForm.address,
                            email: vm.posCustomerForm.email,
                            phoneNumber: vm.posCustomerForm.phoneNumber,
                            termId: vm.posCustomerForm.termId,
                            openingBalance: vm.posCustomerForm.openingBalance,
                            note: vm.posCustomerForm.note,
                            dob: vm.posCustomerForm.dob,
                            nationId: vm.posCustomerForm.nationId,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updatePosCustomer", posCustomerDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['updateSuccess'],
                                    type: 'success'
                                });
                                vm.dialogUpdatePosCustomer = false;

                                vm.$refs["posCustomerForm"].resetFields();
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
            removePosCustomer(index, row, rows) {
                let vm = this;
                if (row.invoiceNumber <= 0) {
                    this.$confirm(this.langConfig['message'], this.langConfig['warning'], {
                        confirmButtonText: 'OK',
                        cancelButtonText: 'Cancel',
                        type: 'warning'
                    }).then(() => {
                        Meteor.call("removePosCustomer", row._id, (err, result) => {
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
                        message: this.langConfig['messageInovice'] + " " + row.invoiceNumber
                    });
                }


            },
            findPosCustomerById(doc) {
                let vm = this;
                vm.posCustomerForm = {};

                Meteor.call("queryPosCustomerById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.posCustomerForm._id = result._id;
                        vm.posCustomerForm = result;
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
                this.posCustomerForm._id = "";
                if (this.$refs["posCustomerFormAdd"]) {
                    this.$refs["posCustomerFormAdd"].resetFields();
                }

                if (this.$refs["posCustomerFormUpdate"]) {
                    this.$refs["posCustomerFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.posTermOption();
            this.queryData();
            Meteor.subscribe('Pos_CustomerReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['customer'];
                return data;
            }
        }
    }
</script>