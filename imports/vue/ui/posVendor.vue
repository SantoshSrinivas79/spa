<template>
    <div class="pos_vendor">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddPosVendor = true,resetForm()">
                            <i class="fa fa-plus"></i> {{langConfig['vendor']}}
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
                        :data="posVendorData"
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
                            prop="billNumber"
                            :label="langConfig['numberOfBill']">
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['action']"
                            width="120"

                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removePosVendor(scope.$index,scope.row,posVendorData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findPosVendorById(scope),dialogUpdatePosVendor= true"
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
                :visible.sync="dialogAddPosVendor"
                width="40%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posVendorForm" :rules="rules" ref="posVendorFormAdd" label-width="120px"
                     class="posVendorForm">
                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['companyName']" prop="name">
                            <el-input v-model="posVendorForm.name"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['khCompanyName']" prop="khName">
                            <el-input v-model="posVendorForm.khName"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['address']" prop="address">
                            <el-input v-model="posVendorForm.address"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['email']" prop="email">
                            <el-input v-model="posVendorForm.email"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['phoneNumber']" prop="phoneNumber">
                            <el-input v-model="posVendorForm.phoneNumber"></el-input>
                        </el-form-item>

                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['term']" prop="termId">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="posVendorForm.termId"
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
                            <el-input v-model="posVendorForm.openingBalance"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['accountNo']" prop="accountNo">
                            <el-input v-model="posVendorForm.accountNo"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['businessNo']" prop="businessNo">
                            <el-input v-model="posVendorForm.businessNo"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['note']" prop="note">
                            <el-input type="textarea" v-model="posVendorForm.note"></el-input>
                        </el-form-item>

                    </el-col>
                </el-row>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddPosVendor = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="savePosVendor($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdatePosVendor"
                width="40%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posVendorForm" :rules="rules" ref="posVendorFormUpdate" label-width="120px"
                     class="posVendorForm">
                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['companyName']" prop="name">
                            <el-input v-model="posVendorForm.name"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['khCompanyName']" prop="khName">
                            <el-input v-model="posVendorForm.khName"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['address']" prop="address">
                            <el-input v-model="posVendorForm.address"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['email']" prop="email">
                            <el-input v-model="posVendorForm.email"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['phoneNumber']" prop="phoneNumber">
                            <el-input v-model="posVendorForm.phoneNumber"></el-input>
                        </el-form-item>

                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['term']" prop="termId">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="posVendorForm.termId"
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
                            <el-input v-model="posVendorForm.openingBalance"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['accountNo']" prop="accountNo">
                            <el-input v-model="posVendorForm.accountNo"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['businessNo']" prop="businessNo">
                            <el-input v-model="posVendorForm.businessNo"></el-input>
                        </el-form-item>
                        <el-form-item :label="langConfig['note']" prop="note">
                            <el-input type="textarea" v-model="posVendorForm.note"></el-input>
                        </el-form-item>

                        <input type="hidden" v-model="posVendorForm._id"/>
                    </el-col>
                </el-row>


                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdatePosVendor = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="updatePosVendor">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label'
    import {Pos_VendorReact} from "../../collection/posVendor";

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
                Pos_VendorReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                newLoading: true,
                posVendorData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddPosVendor: false,
                dialogUpdatePosVendor: false,

                posVendorForm: {
                    name: "",
                    khName: "",
                    address: "",
                    email: "",
                    phoneNumber: "",
                    termId: "",
                    openingBalance: "",
                    accountNo: "",
                    businessNo: "",
                    note: "",
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
                this.newLoading = true;
                Meteor.call('queryPosVendor', {
                    q: val,
                    filter: this.filter,
                    rolesArea:Session.get('area'),
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.posVendorData = result.content;
                        this.count = result.countPosVendor;
                    }
                    this.isSearching = false;
                    this.newLoading = false;
                });
            }, 300),
            posTermOption() {
                let selector = {};
                Meteor.call('queryPosTermOption', selector, this.posVendorForm._id, (err, result) => {
                    this.termDataOption = result;
                })
            },
            savePosVendor(event) {
                event.preventDefault();
                let vm = this;
                this.$refs["posVendorFormAdd"].validate((valid) => {
                    if (valid) {
                        let posVendorDoc = {
                            name: vm.posVendorForm.name,
                            khName: vm.posVendorForm.khName,
                            address: vm.posVendorForm.address,
                            email: vm.posVendorForm.email,
                            phoneNumber: vm.posVendorForm.phoneNumber,
                            termId: vm.posVendorForm.termId,
                            openingBalance: vm.posVendorForm.openingBalance,
                            accountNo: vm.posVendorForm.accountNo,
                            businessNo: vm.posVendorForm.businessNo,
                            note: vm.posVendorForm.note,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("insertPosVendor", posVendorDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig["saveSuccess"],
                                    type: 'success'
                                });
                                vm.dialogAddPosVendor = false;

                                vm.$refs["posVendorFormAdd"].resetFields();
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
            updatePosVendor() {
                let vm = this;
                this.$refs["posVendorFormUpdate"].validate((valid) => {
                    if (valid) {
                        let posVendorDoc = {
                            _id: vm.posVendorForm._id,
                            name: vm.posVendorForm.name,
                            khName: vm.posVendorForm.khName,
                            address: vm.posVendorForm.address,
                            email: vm.posVendorForm.email,
                            phoneNumber: vm.posVendorForm.phoneNumber,
                            termId: vm.posVendorForm.termId,
                            openingBalance: vm.posVendorForm.openingBalance,
                            accountNo: vm.posVendorForm.accountNo,
                            businessNo: vm.posVendorForm.businessNo,
                            note: vm.posVendorForm.note,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updatePosVendor", posVendorDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig["updateSuccess"],
                                    type: 'success'
                                });
                                vm.dialogUpdatePosVendor = false;

                                vm.$refs["posVendorFormUpdate"].resetFields();
                            } else {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig["updateFail"],
                                    type: 'error'
                                });
                            }
                        })
                    }
                })

            },
            removePosVendor(index, row, rows) {
                let vm = this;
                if (row.billNumber <= 0) {
                    this.$confirm(this.langConfig["messageWarning"], this.langConfig["warning"], {
                        confirmButtonText: 'OK',
                        cancelButtonText: 'Cancel',
                        type: 'warning'
                    }).then(() => {
                        Meteor.call("removePosVendor", row._id, (err, result) => {
                            if (!err) {
                                rows.splice(index, 1);

                                vm.$message({
                                    message: `${row.name} ` + this.langConfig["removeSuccess"],
                                    type: 'success'
                                });
                            } else {
                                vm.$message({
                                    type: 'error',
                                    message: this.langConfig["removeFail"]
                                });
                            }

                        })

                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: 'Delete canceled'
                        });
                    });
                } else {
                    this.$message({
                        type: 'error',
                        message: 'This Vendor has ' + row.billNumber + ' bills'
                    });
                }

            },
            findPosVendorById(doc) {
                let vm = this;
                vm.posVendorForm = {};

                Meteor.call("queryPosVendorById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.posVendorForm._id = result._id;
                        vm.posVendorForm = result;
                    }
                })
            },
            cancel() {
                this.$message({
                    type: 'info',
                    message: this.langConfig["cancel"]
                });
            },
            resetForm() {
                this.posVendorForm._id = "";
                if (this.$refs["posVendorFormAdd"]) {
                    this.$refs["posVendorFormAdd"].resetFields();
                }

                if (this.$refs["posVendorFormUpdate"]) {
                    this.$refs["posVendorFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.posTermOption();
            this.queryData();
            Meteor.subscribe('Pos_VendorReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['vendor'];
                return data;
            }
        }
    }
</script>