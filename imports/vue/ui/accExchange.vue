<template>
    <div class="exchange">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddExchange = true,resetForm()">
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
                        :data="exchangeData"
                        stripe
                        border
                        style="width: 100%">
                    <!--prop="exDate"-->
                    <el-table-column
                            :label="langConfig['date']"
                            prop="exDate"
                            sortable
                            width="180">
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['base']"
                    >
                        <template slot-scope="scope">
                            <span class="label label-primary">{{scope.row.base}}</span>
                        </template>
                    </el-table-column>

                    <el-table-column
                            :label="langConfig['rates']"
                            prop="rates"
                    >
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['status']">
                        <template slot-scope="scope">
                            <div v-if="scope.row.status"><span class="label label-success">True</span></div>
                            <div v-else><span class="label label-warning">False</span></div>
                        </template>
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['action']"
                            width="120"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removeExchange(scope.$index,scope.row,exchangeData)"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="dialogUpdateExchange= true ,findExchangeById(scope)"></el-button>
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
                :visible.sync="dialogAddExchange"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="exchangeForm" :rules="rules" ref="exchangeFormAdd" label-width="120px"
            >
                <el-form-item :label="langConfig['date']" prop="exDate">
                    <el-date-picker style="width: 100%"
                                    v-model="exchangeForm.exDate"
                                    type="date"
                                    :placeholder="langConfig['pickDate']">
                    </el-date-picker>
                </el-form-item>
                <label style="margin-left: 120px !important;margin-bottom: 20px"><span
                        class="badge">{{langConfig['rates']}}</span></label>

                <el-form-item :label="langConfig['usd']">
                    <el-input type="number" v-model="exchangeForm.USD" :disabled="true"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['khr']" prop="KHR">
                    <el-input type="number" v-model.number="exchangeForm.KHR"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['thb']" prop="THB">
                    <el-input type="number" v-model.number="exchangeForm.THB"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['status']">
                    <el-switch v-model="exchangeForm.status"></el-switch>
                </el-form-item>


                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddExchange= false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="saveExchange($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i>
                    </el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateExchange"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="exchangeForm" :rules="rules" ref="exchangeFormUpdate" label-width="120px"
                     class="chartAccountForm">
                <el-form-item :label="langConfig['date']" prop="exDate">
                    <el-date-picker style="width: 100%"
                                    v-model="exchangeForm.exDate"
                                    type="date"
                                    :placeholder="langConfig['pickDate']">
                    </el-date-picker>
                </el-form-item>
                <label style="margin-left: 120px !important;margin-bottom: 20px"><span
                        class="badge">{{langConfig['rates']}}</span></label>

                <el-form-item :label="langConfig['usd']">
                    <el-input v-model="exchangeForm.USD" :disabled="true"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['khr']" prop="KHR">
                    <el-input type="number" v-model.number="exchangeForm.KHR"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['thb']" prop="THB">
                    <el-input type="number" v-model.number="exchangeForm.THB"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['status']">
                    <el-switch v-model="exchangeForm.status"></el-switch>
                </el-form-item>

                <input type="hidden" v-model="exchangeForm._id"/>

                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateExchange= false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="updateExchange">{{langConfig['save']}} <i>(Ctrl + Enter)</i>
                    </el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label'
    import {Acc_ExchangeReact} from "../../collection/accExchange";

    export default {
        meteor: {
            langSession() {
                return Session.get('lang') || "en";
            },
            newRe() {
                let vm = this;
                Acc_ExchangeReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        data() {
            return {
                exchangeData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddExchange: false,
                dialogUpdateExchange: false,
                exchangeForm: {
                    exDate: "",
                    USD: 1,
                    KHR: "",
                    THB: "",
                    status: false
                },
                rules: {
                    exDate: [{
                        required: true,
                        type: 'date',
                        message: 'Please input Date',
                        trigger: 'blur'
                    }],
                    KHR: [
                        {type: 'number', required: true, message: 'Please input KHR', trigger: 'blur'}
                    ],
                    THB: [{
                        type: 'number',
                        required: true,
                        message: 'Please input THB',
                        trigger: 'blur'
                    }]
                },
                skip: 0
            }
        },
        mounted() {
            this.$jQuery('body').off();

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
                Meteor.call('queryExchange', {
                    q: val,
                    filter: this.filter,

                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.exchangeData = result.content.map((obj) => {
                            obj.exDate = moment(obj.exDate).format("DD/MM/YYYY");
                            obj.rates = JSON.stringify(obj.rates);
                            return obj;
                        });
                        this.count = result.countExchange;
                    }
                    this.isSearching = false;
                });
            }, 300),
            saveExchange(event) {
                event.preventDefault();
                let vm = this;
                this.$refs["exchangeFormAdd"].validate((valid) => {
                    if (valid) {
                        let rates = {};

                        rates.KHR = this.exchangeForm.KHR;
                        rates.USD = this.exchangeForm.USD;
                        rates.THB = this.exchangeForm.THB;

                        let exchangeDoc = {
                            exDate: this.exchangeForm.exDate,
                            rates: rates,
                            status: this.exchangeForm.status,
                            rolesArea: Session.get("area")
                        };

                        Meteor.call("insertExchange", exchangeDoc, (err, result) => {
                            if (!err) {
                                this.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                this.dialogAddExchange = false;
                                this.$refs["exchangeFormAdd"].resetFields();
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
            updateExchange() {
                let vm = this;
                this.$refs["exchangeFormUpdate"].validate((valid) => {
                    if (valid) {
                        let exchangeDoc = {
                            _id: this.exchangeForm._id,
                            exDate: this.exchangeForm.exDate,
                            "rates.USD": this.exchangeForm.USD,
                            "rates.KHR": this.exchangeForm.KHR,
                            "rates.THB": this.exchangeForm.THB,
                            status: this.exchangeForm.status,
                            rolesArea: Session.get("area")
                        };

                        Meteor.call("updateExchange", exchangeDoc, (err, result) => {
                            if (!err) {
                                this.$message({
                                    duration: 1000,
                                    message: `Update Successfully!`,
                                    type: 'success'
                                });
                                this.dialogUpdateExchange = false;
                                this.$refs["exchangeFormUpdate"].resetFields();
                                vm.resetForm();

                            } else {
                                this.$message({
                                    duration: 1000,
                                    message: `Update Failed! May be duplicated Date`,
                                    type: 'error'
                                });
                            }
                        })
                    }
                })

            },
            removeExchange(index, row, rows) {
                this.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeExchange", row._id, (err, result) => {
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
            findExchangeById(doc) {
                Meteor.call("queryExchangeById", doc.row._id, (err, result) => {
                    if (result) {
                        this.exchangeForm = result;
                        this.exchangeForm.KHR = result.rates.KHR;
                        this.exchangeForm.USD = result.rates.USD;
                        this.exchangeForm.THB = result.rates.THB;
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
                if (this.$refs["exchangeFormAdd"]) {
                    this.$refs["exchangeFormAdd"].resetFields();
                }
                if (this.$refs["exchangeFormUpdate"]) {
                    this.$refs["exchangeFormUpdate"].resetFields();
                }
            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            Meteor.subscribe('Acc_ExchangeReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['exchange'];
                return data;
            }
        }
    }
</script>