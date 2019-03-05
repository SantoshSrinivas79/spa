<template>
    <div class="wb-waterBillingSetup">
        <!--el-row type="flex" justify="left" class="customer-breadcrumb">
            <el-col :span="12">
                <el-breadcrumb separator="/">
                    <el-breadcrumb-item><a href="/">Home</a></el-breadcrumb-item>
                    <el-breadcrumb-item>waterBillingSetup</el-breadcrumb-item>
                </el-breadcrumb>
            </el-col>
        </el-row>-->
        <div class="jumbotron" style="background: white;padding: 10px;">
            <el-tabs type="card" @tab-click="handleClick">
                <el-tab-pane label="Company" type="border-card">
                    <el-row justify="left" type="flex">
                        <el-col :span="6">
                            <el-button v-show="isEmptyCompany" type="primary" icon="plus" size="small"
                                       @click="dialogFormVisible = true">
                                Add waterBillingSetup
                            </el-button>

                        </el-col>
                    </el-row>
                    <br>
                    <el-table
                            resizable="true"
                            :data="tableData"
                            border
                            style="width: 100%">
                        <el-table-column
                                label="Khmer Name"
                                fit
                                prop="khName">
                        </el-table-column>
                        <el-table-column
                                label="English Name"
                                prop="enName">
                        </el-table-column>
                        <el-table-column
                                label="Khmer Short Name"
                                prop="khShortName">
                        </el-table-column>
                        <el-table-column
                                label="English Short Name"
                                prop="enShortName">
                        </el-table-column>
                        <el-table-column
                                label="Operations" width="70">
                            <template slot-scope="scope">
                                <el-button
                                        size="small" type="success"
                                        @click="handleEdit(scope.$index, scope.row)">Edit
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-dialog title="Setup" :show-close="false" :visible.sync="dialogFormVisible">
                        <el-form :model="form" ref="waterBillingSetupForm" :rules="rules"
                                 label-width="120px">

                            <el-row>
                                <el-col :span="12">
                                    <el-form-item label="Khmer Name" prop="khName">
                                        <el-input v-model="form.khName" auto-complete="off"></el-input>
                                    </el-form-item>

                                    <el-form-item label="English Name" prop="enName">
                                        <el-input v-model="form.enName" auto-complete="off"></el-input>
                                    </el-form-item>

                                    <el-form-item label="Kh ShortName" prop="khShortName">
                                        <el-input v-model="form.khShortName" auto-complete="off"></el-input>
                                    </el-form-item>


                                    <el-form-item label="En ShortName" prop="enShortName">
                                        <el-input v-model="form.enShortName" auto-complete="off"></el-input>
                                    </el-form-item>

                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="Water Billing Short Name">
                                        <el-select prop="waterBillingUsageShortName"
                                                   v-model="form.waterBillingUsageShortName"
                                                   placeholder="(Select one)">
                                            <el-option
                                                    v-for="item in waterBillingUsageShortNameOptions"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value">
                                            </el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="Phone Number" prop="phoneNumber">
                                        <el-input v-model="form.phoneNumber" auto-complete="off"></el-input>
                                    </el-form-item>
                                    <el-form-item label="Email" prop="email">
                                        <el-input v-model="form.email" auto-complete="off"></el-input>
                                    </el-form-item>
                                    <el-form-item label="Website" prop="website">
                                        <el-input v-model="form.website" auto-complete="off"></el-input>
                                    </el-form-item>

                                </el-col>
                            </el-row>

                            <el-form-item label="Address" prop="address">
                                <el-input v-model="form.address" auto-complete="off"></el-input>
                            </el-form-item>
                            <el-form-item label="Khmer Address" prop="khAddress">
                                <el-input v-model="form.khAddress" auto-complete="off"></el-input>
                            </el-form-item>


                            <el-row>
                                <el-col :span="12">
                                    <el-form-item label="Base Currency">
                                        <el-radio-group v-model="form.baseCurrency">
                                            <el-radio :label="'USD'">USD</el-radio>
                                            <el-radio :label="'KHR'">KHR</el-radio>
                                            <el-radio :label="'THB'">THB</el-radio>
                                        </el-radio-group>
                                    </el-form-item>

                                    <el-form-item label="English Ministry Name">
                                        <el-input v-model="form.ministryEnName"></el-input>
                                    </el-form-item>
                                    <el-form-item label="Khmer Ministry Name">
                                        <el-input v-model="form.ministryKhName"></el-input>
                                    </el-form-item>
                                    <el-form-item label="Integrated Pos and Account">
                                        <el-radio-group v-model="form.integratedPosAccount">
                                            <el-radio :label="true">Yes</el-radio>
                                            <el-radio :label="false">No</el-radio>
                                        </el-radio-group>

                                    </el-form-item>
                                    <el-form-item label="Depreciation Type">
                                        <el-select v-model="form.depreciationType" filterable placeholder="Select">
                                            <el-option
                                                    v-for="item in depreciationTypeOption"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value">
                                            </el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="Depreciation Per Time">
                                        <el-select v-model="form.depreciationPerTime" filterable placeholder="Select">
                                            <el-option
                                                    v-for="item in depreciationPerTimeOption"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value">
                                            </el-option>
                                        </el-select>
                                    </el-form-item>

                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="Director">
                                        <el-input v-model="form.director" auto-complete="off"></el-input>
                                    </el-form-item>
                                    <el-form-item label="Province">
                                        <el-input v-model="form.province"></el-input>
                                    </el-form-item>
                                    <el-form-item label="Round Type">
                                        <el-select v-model="form.roundType" filterable placeholder="Select">
                                            <el-option
                                                    v-for="item in roundTypeOption"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value">
                                            </el-option>
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item label="Round KHR">
                                        <el-input-number v-model="form.khrDigit" :step="2"></el-input-number>
                                    </el-form-item>

                                    <el-form-item label="Round USD">
                                        <el-input-number v-model="form.usdDigit" :step="2"></el-input-number>
                                    </el-form-item>

                                    <el-form-item label="Round THB">
                                        <el-input-number v-model="form.thbDigit" :step="2"></el-input-number>
                                    </el-form-item>

                                    <el-form-item label="Validate Stock">
                                        <el-switch v-model="form.validateStock">
                                        </el-switch>
                                    </el-form-item>
                                    <el-form-item label="Password">
                                        <el-input v-model="form.password" type="password"></el-input>
                                    </el-form-item>
                                    <el-form-item label="Pass If Greater Than Or Equal">
                                        <el-input v-model="form.passIfGreaterThan" type="Number"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>


                        </el-form>
                        <span slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">Exit</el-button>
                 <el-button type="primary" @click="saveWaterBillingSetup('waterBillingSetupForm')">Save</el-button>
            </span>
                    </el-dialog>
                </el-tab-pane>
                <!--<slot v-if="!isEmptyCompany">
                    <el-tab-pane label="General">
                        <el-row :gutter="10">
                            <el-col :span="4">
                                Invoice Expire After
                                <el-input v-model.number="form.invoiceExpiredAfter"></el-input>
                            </el-col>

                        </el-row>
                        <el-row :gutter="10">
                            <el-col :span="4">
                                Cutting Amount
                                <el-input v-model.number="form.cutValue"></el-input>
                            </el-col>

                        </el-row>
                        <br>
                        <el-row :gutter="10">
                            <el-col :span="8">
                                Enable zero water consumption
                                <el-switch
                                        v-model="form.enableZeroWaterConsumption"
                                        active-color="#13ce66"
                                        inactive-color="#ff4949">
                                </el-switch>
                            </el-col>
                        </el-row>
                        <el-row>
                            <br>
                            <el-col :span="4">
                                <el-button type="primary" @click.native="updateInvoiceExpired">Update</el-button>
                            </el-col>
                        </el-row>
                    </el-tab-pane>
                </slot>-->
                <!--<el-tab-pane label="Role">Role</el-tab-pane>-->
                <!--<el-tab-pane label="Task">Task</el-tab-pane>-->
            </el-tabs>
        </div>
    </div>
</template>

<script>
    import {WB_waterBillingSetup} from '../../collection/waterBillingSetup.js';

    export default {
        data() {
            return {
                newLoading: true,
                isShowing: false,
                tableData: [],
                dialogFormVisible: false,
                showClosed: false,
                activeName: 'first',
                rolesArea: '',
                companyId: '',
                waterBillingUsageShortNameOptions: [
                    {
                        label: 'En', value: 'en'
                    },
                    {
                        label: 'Kh', value: 'kh'
                    }
                ],
                depreciationPerTimeOption: [
                    {label: "1 Month", value: 1},
                    {label: "2 Month", value: 2},
                    {label: "3 Month", value: 3},
                    {label: "4 Month", value: 4},
                    {label: "6 Month", value: 6},
                    {label: "12 Month", value: 12}
                ],
                form: {
                    cutValue: 480,
                    invoiceExpiredAfter: 0,
                    khName: '',
                    enName: '',
                    ministryKhName: '',
                    ministryEnName: '',
                    khShortName: '',
                    enableZeroWaterConsumption: false,
                    enShortName: '',
                    waterBillingUsageShortName: '',
                    baseCurrency: "KHR",
                    roundType: "",
                    khrDigit: -2,
                    usdDigit: 2,
                    thbDigit: 0,
                    address: "",
                    phoneNumber: "",
                    email: "",
                    website: "",
                    director: "",
                    province: "",
                    khAddress: "",
                    integratedPosAccount: false,
                    depreciationType: "",
                    depreciationPerTime: 12,
                    password: "",
                    validateStock: false,
                    passIfGreaterThan: ""
                },
                rules: {
                    khName: [
                        {required: 'true', message: 'Please Input Khmer Name', trigger: 'blur'}
                    ],
                    enName: [
                        {required: 'true', message: 'Please Input English Name', trigger: 'blur'}
                    ],
                    enShortName: [
                        {required: 'true', message: 'Please Input English Short Name', trigger: 'blur'}
                    ],
                    khShortName: [
                        {required: 'true', message: 'Please Input Khmer Short Name', trigger: 'blur'}
                    ],
                    waterBillingUsageShortName: [
                        {required: 'true', message: 'Please Select Water Billing Setup Short Name', trigger: 'blur'}
                    ],
                },
                roundTypeOption: [
                    {label: "Normal", value: "Normal"},
                    {label: "Up", value: "Up"},
                    {label: "Down", value: "Down"}
                ],
                depreciationTypeOption: [
                    {label: "001 : Straight-Line Depreciation Method", value: "001"},
                    {label: "002 : Double Declining Balance Depreciation Method", value: "002"},
                    {label: "003 : Sum-of-the-Years-Digits Depreciation Method", value: "003"},
                ]

            }
        },
        computed: {
            isEmptyCompany() {
                return this.tableData.length == 0
            },
        },
        methods: {
            updateInvoiceExpired() {
                Meteor.call('updateWaterBillingSetup', {
                    _id: this.tableData[0]._id,
                    data: {
                        cutValue: this.form.cutValue,
                        invoiceExpiredAfter: +this.form.invoiceExpiredAfter,
                        enableZeroWaterConsumption: this.form.enableZeroWaterConsumption
                    }
                }, (err, result) => {
                    if (!err) {
                        this.$message({
                            message: 'Update Successfully',
                            type: 'success'
                        });
                        this.fetchWaterBillingSetup();
                        this.dialogFormVisible = false;
                    }
                });
            },
            handleClick(tab, event) {
//                console.log(tab, event);
            },
            handleEdit(index, row) {
                this.dialogFormVisible = true;
                this.companyId = row._id;
                for (let k in this.form) {
                    this.form[k] = row[k];
                }
            },
            handleDelete(index, row) {
                console.log(index, row);
            },
            updateWaterBillingSetup({_id, data}) {
                Meteor.call('updateWaterBillingSetup', {_id, data}, (err, result) => {
                    if (!err) {
                        this.$message({
                            message: 'Update Successfully',
                            type: 'success'
                        });
                        this.fetchWaterBillingSetup();
                        this.dialogFormVisible = false;
                    }
                });
            },
            insertWaterBillingSetup({data}) {
                data.rolesArea = Session.get('area');
                Meteor.call('insertWaterBillingSetup', {data}, (err, result) => {
                    if (!err) {
                        this.dialogFormVisible = false;
                        this.form = {
                            khName: '',
                            enName: '',
                            ministryKhName: '',
                            ministryEnName: '',
                            khShortName: '',
                            enShortName: '',
                            waterBillingUsageShortName: '',
                            address: '',
                            phoneNumber: '',
                            email: '',
                            website: '',
                            director: '',
                            province: '',
                            khAddress: "",
                            validateStock: "",
                            password: "",
                            passIfGreaterThan: ""
                        };
                        this.$message({
                            message: 'Successfully',
                            type: 'success'
                        });
                        if (this.$refs['waterBillingSetupForm']) {
                            this.$refs['waterBillingSetupForm'].reset();

                        }

                        this.fetchWaterBillingSetup();
                    } else {
                        this.$message({
                            message: err.message,
                            type: 'error'
                        })
                    }
                });
            },
            saveWaterBillingSetup(formName) {
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        if (this.tableData.length > 0) {
                            this.updateWaterBillingSetup({_id: this.companyId, data: this.form})
                        } else {
                            this.insertWaterBillingSetup({data: this.form});

                        }
                    }
                });
            },
            fetchWaterBillingSetup() {
                this.newLoading = true;
                Meteor.call('fetchWaterBillingSetup', (err, result) => {
                    if (!err) {
                        this.tableData = result;
                        this.form.cutValue = result[0] && result[0].cutValue || 0;
                        this.form.invoiceExpiredAfter = result[0] && result[0].invoiceExpiredAfter || 0;
                        this.form.enableZeroWaterConsumption = result[0] && result[0].enableZeroWaterConsumption || false;
                        this.newLoading = false;
                    }
                })
            },
        },
        mounted() {
            this.$jQuery('body').off();

        },
        created() {
            this.fetchWaterBillingSetup();
        }
    };
</script>