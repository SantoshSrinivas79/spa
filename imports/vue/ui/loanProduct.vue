<template>
    <div class="loan_product">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddLoanProduct = true,resetForm()">
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
                        :data="loanProductData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="name"
                            :label="langConfig['name']">
                    </el-table-column>
                    <el-table-column
                            prop="rate"
                            :label="langConfig['rate']">
                    </el-table-column>
                    <el-table-column
                            prop="currencyId"
                            :label="langConfig['currency']">
                    </el-table-column>
                    <el-table-column
                            prop="productDateName"
                            :label="langConfig['productDate']">
                    </el-table-column>
                    <el-table-column
                            prop="penaltyDoc.name"
                            :label="langConfig['penalty']">
                    </el-table-column>
                    <el-table-column
                            prop="penaltyClosingDoc.name"
                            :label="langConfig['penaltyClosing']">
                    </el-table-column>
                    <el-table-column
                            prop="status"
                            :label="langConfig['status']"
                            width="150"
                            filter-placement="bottom-end">
                        <template slot-scope="scope">
                            <el-tag
                                    :type="scope.row.status === true ? 'primary' : 'danger' "
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
                                           @click="removeLoanProduct(scope.$index,scope.row,loanProductData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findLoanProductById(scope),dialogUpdateLoanProduct= true"
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
                            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
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
                :visible.sync="dialogAddLoanProduct"
                width="40%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="loanProductForm" :rules="rules" ref="loanProductFormAdd" label-width="120px"
                     class="loanProductForm">

                <el-row>
                    <el-form-item :label="langConfig['name']" prop="name">
                        <el-input v-model="loanProductForm.name"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['currency']" prop="currencyId">
                        <el-select style="display: block !important;" filterable clearable
                                   v-model="loanProductForm.currencyId"
                                   placeholder="">
                            <el-option
                                    v-for="item in currencyOption"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                    :disabled="item.disabled">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="langConfig['rate']" prop="rate">
                        <el-input v-model="loanProductForm.rate"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['productDate']" prop="productDate">
                        <el-date-picker
                                v-model="loanProductForm.productDate"
                                type="date"
                                style="width: 100%;"
                                placeholder="Pick a day"
                        >
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item :label="langConfig['penalty']" prop="penaltyId">
                        <el-select style="display: block !important;" filterable clearable
                                   v-model="loanProductForm.penaltyId"
                                   placeholder="">
                            <el-option
                                    v-for="item in penaltyOption"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                    :disabled="item.disabled">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="langConfig['penaltyClosing']" prop="penaltyClosingId">
                        <el-select style="display: block !important;" filterable clearable
                                   v-model="loanProductForm.penaltyClosingId"
                                   placeholder="">
                            <el-option
                                    v-for="item in penaltyClosingOption"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                    :disabled="item.disabled">
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item :label="langConfig['description']" prop="description">
                        <el-input v-model="loanProductForm.description"></el-input>
                    </el-form-item>


                    <el-form-item :label="langConfig['status']" prop="status">
                        <el-switch
                                v-model="loanProductForm.status"
                                active-color="#13ce66"
                                inactive-color="#ff4949"
                        >
                        </el-switch>
                    </el-form-item>

                </el-row>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddLoanProduct = false, cancel()"
                    >{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="saveLoanProduct($event)">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateLoanProduct"
                width="40%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="loanProductForm" :rules="rules" ref="loanProductFormUpdate" label-width="120px"
                     class="loanProductForm">
                <el-row>
                    <el-form-item :label="langConfig['name']" prop="name">
                        <el-input v-model="loanProductForm.name"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['currency']" prop="currencyId">
                        <el-select style="display: block !important;" filterable clearable
                                   v-model="loanProductForm.currencyId"
                                   placeholder="">
                            <el-option
                                    v-for="item in currencyOption"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                    :disabled="item.disabled">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="langConfig['rate']" prop="rate">
                        <el-input v-model="loanProductForm.rate"></el-input>
                    </el-form-item>
                    <el-form-item :label="langConfig['productDate']" prop="productDate">
                        <el-date-picker
                                v-model="loanProductForm.productDate"
                                type="date"
                                style="width: 100%;"
                                placeholder="Pick a day"
                        >
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item :label="langConfig['penalty']" prop="penaltyId">
                        <el-select style="display: block !important;" filterable clearable
                                   v-model="loanProductForm.penaltyId"
                                   placeholder="">
                            <el-option
                                    v-for="item in penaltyOption"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                    :disabled="item.disabled">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item :label="langConfig['penaltyClosing']" prop="penaltyClosingId">
                        <el-select style="display: block !important;" filterable clearable
                                   v-model="loanProductForm.penaltyClosingId"
                                   placeholder="">
                            <el-option
                                    v-for="item in penaltyClosingOption"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                    :disabled="item.disabled">
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item :label="langConfig['description']" prop="description">
                        <el-input v-model="loanProductForm.description"></el-input>
                    </el-form-item>


                    <el-form-item :label="langConfig['status']" prop="status">
                        <el-switch
                                v-model="loanProductForm.status"
                                active-color="#13ce66"
                                inactive-color="#ff4949"
                        >
                        </el-switch>
                    </el-form-item>
                    <input type="hidden" v-model="loanProductForm._id"/>
                </el-row>


                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateLoanProduct = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="updateLoanProduct">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i>
                    </el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-loan'
    import {Loan_ProductReact} from "../../collection/loanProduct";

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
                Loan_ProductReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                langSession: null,
                loanProductData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddLoanProduct: false,
                dialogUpdateLoanProduct: false,

                loanProductForm: {
                    name: "",
                    currencyId: "",
                    rate: "",
                    productDate: "",
                    penaltyId: "",
                    penaltyClosingId: "",
                    description: "",
                    status: false,
                    _id: ""
                },
                rules: {
                    currencyId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose currency',
                        trigger: 'change'
                    }],
                    penaltyId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Penalty',
                        trigger: 'change'
                    }],
                    penaltyClosingId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Penalty Closing',
                        trigger: 'change'
                    }],
                    productDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input Date of birth',
                        trigger: 'blur'
                    }],
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    rate: [{required: true, message: 'Please input Phone number', trigger: 'blur'}],
                },
                currencyOption: [
                    {label: "USD", value: "USD"},
                    {label: "KHR", value: "KHR"},
                    {label: "THB", value: "THB"},
                ],
                penaltyOption: [],
                penaltyClosingOption: [],
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
                Meteor.call('queryLoanProduct', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.loanProductData = result.content;
                        this.count = result.countLoanProduct;
                    }
                    this.isSearching = false;
                });
            }, 300),
            loanPenaltyOption() {
                let selector = {};
                Meteor.call('queryLoanPenaltyOption', selector, (err, result) => {
                    this.penaltyOption = result;
                })
            },
            loanPenaltyClosingOption() {
                let selector = {};
                Meteor.call('queryLoanPenaltyClosingOption', selector, (err, result) => {
                    this.penaltyClosingOption = result;
                })
            },
            saveLoanProduct(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["loanProductFormAdd"].validate((valid) => {
                    if (valid) {
                        let loanProductDoc = {
                            name: vm.loanProductForm.name,
                            currencyId: vm.loanProductForm.currencyId,
                            rate: vm.loanProductForm.rate,
                            productDate: vm.loanProductForm.productDate,
                            status: vm.loanProductForm.status,
                            penaltyId: vm.loanProductForm.penaltyId,
                            penaltyClosingId: vm.loanProductForm.penaltyClosingId,
                            description: vm.loanProductForm.description,
                            rolesArea: Session.get('area')

                        };

                        Meteor.call("insertLoanProduct", loanProductDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['saveSuccess'],
                                    type: 'success'
                                });
                                vm.dialogAddLoanProduct = false;

                                vm.$refs["loanProductFormAdd"].resetFields();
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
            updateLoanProduct() {
                let vm = this;
                this.$refs["loanProductFormUpdate"].validate((valid) => {
                    if (valid) {
                        let loanProductDoc = {
                            _id: vm.loanProductForm._id,
                            name: vm.loanProductForm.name,
                            currencyId: vm.loanProductForm.currencyId,
                            rate: vm.loanProductForm.rate,
                            productDate: vm.loanProductForm.productDate,
                            status: vm.loanProductForm.status,
                            penaltyId: vm.loanProductForm.penaltyId,
                            penaltyClosingId: vm.loanProductForm.penaltyClosingId,
                            description: vm.loanProductForm.description,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updateLoanProduct", loanProductDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['updateSuccess'],
                                    type: 'success'
                                });
                                vm.dialogUpdateLoanProduct = false;

                                vm.$refs["loanProductFormUpdate"].resetFields();
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
            removeLoanProduct(index, row, rows) {
                let vm = this;
                this.$confirm(this.langConfig['message'], this.langConfig['warning'], {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeLoanProduct", row._id, (err, result) => {
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
            },
            findLoanProductById(doc) {
                let vm = this;
                vm.loanProductForm = {};

                Meteor.call("queryLoanProductById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.loanProductForm._id = result._id;
                        vm.loanProductForm = result;
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
                this.loanProductForm._id = "";
                if (this.$refs["loanProductFormAdd"]) {
                    this.$refs["loanProductFormAdd"].resetFields();
                }

                if (this.$refs["loanProductFormUpdate"]) {
                    this.$refs["loanProductFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            this.loanPenaltyOption();
            this.loanPenaltyClosingOption();
            Meteor.subscribe('Loan_ProductReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['product'];
                return data;
            }
        }
    }
</script>