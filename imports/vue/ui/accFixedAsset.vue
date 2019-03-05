<template>
    <div class="acc_fixedAsset">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddFixedAsset = true,resetForm()">
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
                        <loader></loader>
                    </div>
                </div>
            </slot>
            <slot v-else>
                <el-table
                        v-loading="newLoading"
                        :data="fixedAssetData"
                        stripe
                        border
                        style="width: 100%">
                    <!--prop="exDate"-->
                    <el-table-column
                            :label="langConfig['buyDate']"
                            prop="buyDateName"
                            sortable
                            width="180">
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['account']"
                            prop="accountDoc.name"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['code']"
                            prop="code"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['value']"
                            prop="value"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['currency']"
                            prop="currencyId"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['life']"
                            prop="life"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['estSalvage']"
                            prop="estSalvage"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['voucher']"
                            prop="voucherId"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['description']"
                            prop="description"
                            sortable>
                    </el-table-column>

                    <el-table-column
                            :label="langConfig['action']"
                            width="160"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removeFixedAsset(scope.$index,scope.row,fixedAssetData)"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="popUpUpdateFixedAsset(scope.row),findFixedAssetById(scope)"></el-button>

                                <el-button type="info" icon="el-icon-printer" size="small" class="cursor-pointer"
                                           @click="printFixedAsstSchedule(scope.row._id)"></el-button>
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
                :visible.sync="dialogAddFixedAsset"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="fixedAssetForm" :rules="rules" ref="fixedAssetFormAdd" label-width="120px"
            >
                <el-form-item :label="langConfig['buyDate']" prop="buyDate">
                    <el-date-picker style="width: 100%"
                                    v-model="fixedAssetForm.buyDate"
                                    type="date"
                                    :placeholder="langConfig['pickDate']">
                    </el-date-picker>
                </el-form-item>


                <el-form-item :label="langConfig['account']" prop="account">
                    <el-select style="display: block !important;" filterable clearable
                               v-model="fixedAssetForm.account"
                               :placeholder="langConfig['account']">
                        <el-option
                                v-for="item in accountOption"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="langConfig['value']" prop="value">
                    <el-input type="number" v-model.number="fixedAssetForm.value"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['currency']" prop="currencyId">
                    <el-select style="display: block !important;" filterable clearable
                               v-model="fixedAssetForm.currencyId"
                               :placeholder="langConfig['currency']">
                        <el-option
                                v-for="item in currencyOption"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="langConfig['life']" prop="life">
                    <el-input type="number" v-model.number="fixedAssetForm.life"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['estSalvage']" prop="estSalvage">
                    <el-input type="number" v-model.number="fixedAssetForm.estSalvage"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['code']" prop="code">
                    <el-input type="string" v-model="fixedAssetForm.code"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['voucher']" prop="voucherId">
                    <el-input type="string" v-model="fixedAssetForm.voucherId"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['description']" prop="description">
                    <el-input type="string" v-model="fixedAssetForm.description"></el-input>
                </el-form-item>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddFixedAsset= false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="saveFixedAsset($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateFixedAsset"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="fixedAssetForm" :rules="rules" ref="fixedAssetFormUpdate" label-width="120px"
                     class="chartAccountForm">
                <el-form-item :label="langConfig['buyDate']" prop="buyDate">
                    <el-date-picker style="width: 100%"
                                    v-model="fixedAssetForm.buyDate"
                                    type="date"
                                    :placeholder="langConfig['pickDate']">
                    </el-date-picker>
                </el-form-item>
                <el-form-item :label="langConfig['account']" prop="account">
                    <el-select style="display: block !important;" filterable clearable
                               v-model="fixedAssetForm.account"
                               :placeholder="langConfig['account']">
                        <el-option
                                v-for="item in accountOption"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="langConfig['value']" prop="value">
                    <el-input type="number" v-model.number="fixedAssetForm.value"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['currency']" prop="currencyId">
                    <el-select style="display: block !important;" filterable clearable
                               v-model="fixedAssetForm.currencyId"
                               :placeholder="langConfig['currency']">
                        <el-option
                                v-for="item in currencyOption"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="langConfig['life']" prop="life">
                    <el-input type="number" v-model.number="fixedAssetForm.life"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['estSalvage']" prop="estSalvage">
                    <el-input type="number" v-model.number="fixedAssetForm.estSalvage"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['code']" prop="code">
                    <el-input type="string" v-model="fixedAssetForm.code"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['voucher']" prop="voucherId">
                    <el-input type="string" v-model="fixedAssetForm.voucherId"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['description']" prop="description">
                    <el-input type="string" v-model="fixedAssetForm.description"></el-input>
                </el-form-item>

                <input type="hidden" v-model="fixedAssetForm._id"/>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateFixedAsset= false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="updateFixedAsset">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-acc'
    import {Acc_FixedAssetReact} from "../../collection/accFixedAsset";

    export default {
        meteor: {
            langSession() {
                return Session.get('lang') || "en";
            },
            newRe() {
                let vm = this;
                Acc_FixedAssetReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                newLoading: true,
                fixedAssetData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddFixedAsset: false,
                dialogUpdateFixedAsset: false,
                fixedAssetForm: {
                    account: "",
                    value: 0,
                    life: 0,
                    estSalvage: 0,
                    code: "",
                    description: "",
                    buyDate: "",
                    voucherId: "",
                    currencyId: "",
                    _id: ""
                },
                accountOption: [],
                currencyOption: [
                    {label: "KHR", value: "KHR"},
                    {label: "USD", value: "USD"},
                    {label: "THB", value: "THB"}
                ],
                rules: {
                    buyDate: [{
                        required: true,
                        type: 'date',
                        message: 'Please input Date',
                        trigger: 'blur'
                    }],
                    account: [
                        {type: 'string', required: true, message: 'Please input account', trigger: 'change'}
                    ],
                    currencyId: [
                        {type: 'string', required: true, message: 'Please input currency', trigger: 'change'}
                    ],
                    value: [{
                        type: 'number',
                        required: true,
                        message: 'Please input value',
                        trigger: 'blur'
                    }],
                    life: [{type: 'number', required: true, message: 'Please input life', trigger: 'blur'}],

                    estSalvage: [{
                        type: 'number',
                        required: true,
                        message: 'Please input Estimate Salvage',
                        trigger: 'blur'
                    }],
                    code: [{type: 'string', required: true, message: 'Please input Code', trigger: 'blur'}],
                    voucherId: [{type: 'string', required: true, message: 'Please input voucherId', trigger: 'blur'}]
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
                Meteor.call('queryAccFixedAsset', {
                    q: val,
                    filter: this.filter,
                    rolesArea:Session.get('area'),
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.fixedAssetData = result.shcFixedAssets;
                        this.count = result.countAccFixedAsset;
                    }
                    this.isSearching = false;
                    this.newLoading = false;
                });
            }, 300),

            fetchChartAccountOpt() {
                let selector = {};
                let vm = this;
                Meteor.call("queryChartAccountFixAssetOption", selector, (err, result) => {
                    if (result) {
                        vm.accountOption = result.listFixedAsset;
                    }
                })
            },
            saveFixedAsset(event) {
                event.preventDefault();
                let vm = this;
                this.$refs["fixedAssetFormAdd"].validate((valid) => {
                    if (valid) {

                        let fixedAssetDoc = {
                            account: vm.fixedAssetForm.account,
                            value: vm.fixedAssetForm.value,
                            life: vm.fixedAssetForm.life,
                            estSalvage: vm.fixedAssetForm.estSalvage,
                            code: vm.fixedAssetForm.code,
                            description: vm.fixedAssetForm.description,
                            buyDate: vm.fixedAssetForm.buyDate,
                            buyDateName: moment(vm.fixedAssetForm.buyDate).format("DD/MM/YYYY"),
                            voucherId: vm.fixedAssetForm.voucherId,
                            currencyId: vm.fixedAssetForm.currencyId,
                            rolesArea: Session.get("area")
                        };

                        Meteor.call("insertAccFixedAsset", fixedAssetDoc, (err, result) => {
                            if (!err) {
                                this.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                this.dialogAddFixedAsset = false;
                                this.$refs["fixedAssetFormAdd"].resetFields();
                                vm.resetForm();

                            } else {
                                this.$message({
                                    duration: 1000,
                                    message: `Insert Failed! May be duplicated Date!`,
                                    type: 'error'
                                });
                            }
                        })
                    }
                })

            },
            updateFixedAsset() {
                let vm = this;
                this.$refs["fixedAssetFormUpdate"].validate((valid) => {
                    if (valid) {

                        let fixedAssetDoc = {
                            _id: vm.fixedAssetForm._id,
                            account: vm.fixedAssetForm.account,
                            value: vm.fixedAssetForm.value,
                            life: vm.fixedAssetForm.life,
                            estSalvage: vm.fixedAssetForm.estSalvage,
                            code: vm.fixedAssetForm.code,
                            description: vm.fixedAssetForm.description,
                            buyDate: vm.fixedAssetForm.buyDate,
                            buyDateName: moment(vm.fixedAssetForm.buyDate).format("DD/MM/YYYY"),
                            voucherId: vm.fixedAssetForm.voucherId,
                            currencyId: vm.fixedAssetForm.currencyId,
                            rolesArea: Session.get("area")
                        };
                        console.log(fixedAssetDoc);

                        Meteor.call("updateAccFixedAsset", fixedAssetDoc, (err, result) => {
                            if (!err) {
                                this.$message({
                                    duration: 1000,
                                    message: `Update Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogUpdateFixedAsset = false;
                                vm.$refs["fixedAssetFormUpdate"].resetFields();
                                vm.resetForm();

                            } else {
                                vm.$message({
                                    duration: 1000,
                                    message: `Update Failed! May be duplicated Date`,
                                    type: 'error'
                                });
                            }
                        })
                    }
                })

            },
            removeFixedAsset(index, row, rows) {
                if (row.transaction[0].month > 0) {
                    this.$message({
                        type: 'error',
                        message: 'Already have expense'
                    });
                    return false;
                }

                this.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeAccFixedAsset", row._id, (err, result) => {
                        if (!err) {
                            rows.splice(index, 1);
                            this.$message({
                                message: `លុប ${row.code} : ${moment(row.exDate).format("DD/MM/YYYY")} បានជោគជ័យ`,
                                type: 'success'
                            });
                        } else {
                            this.$message({
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
            findFixedAssetById(doc) {
                Meteor.call("queryAccFixedAssetById", doc.row._id, (err, result) => {
                    if (result) {
                        this.fixedAssetForm = result;
                    }
                })
            },
            printFixedAsstSchedule(id) {
                FlowRouter.go('/acc-data/accFixedAssetSchedule/print?inv=' + id);
            },
            cancel() {
                this.$message({
                    type: 'info',
                    message: 'Canceled'
                });
            },
            resetForm() {
                if (this.$refs["fixedAssetFormAdd"]) {
                    this.$refs["fixedAssetFormAdd"].resetFields();
                }
                if (this.$refs["fixedAssetFormUpdate"]) {
                    this.$refs["fixedAssetFormUpdate"].resetFields();
                }
            },
            popUpUpdateFixedAsset(data) {
                if (data.transaction[0].month === 0) {
                    this.dialogUpdateFixedAsset = true;
                } else {
                    this.$message({
                        type: 'error',
                        message: 'Already have expense'
                    });
                }
            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            this.fetchChartAccountOpt();
            Meteor.subscribe('Acc_FixedAssetReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['fixedAsset'];
                return data;
            }
        }
    }
</script>