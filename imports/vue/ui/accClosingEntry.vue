<template>
    <div class="closing-entry">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="popUpAdd(),dialogAddClosingEntry = true,resetForm()">
                            <i class="fa fa-plus"></i> Closing Entry
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
                                    placeholder="Search Here..."
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
                        :data="closingEntryData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="closeDateName"
                            label="Date"
                            sortable
                    >
                    </el-table-column>
                    <el-table-column
                            prop="month"
                            label="Month"
                            sortable
                    >
                    </el-table-column>
                    <el-table-column
                            prop="year"
                            label="Year">
                    </el-table-column>
                    <el-table-column
                            label="Action"
                            width="120"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removeClosingEntry(scope.$index,scope.row,closingEntryData)"></el-button>

                                <!--<el-button type="primary" :disabled="scope.row.month!=12" icon="more"
                                           class="cursor-pointer"
                                           @click="reportCurrencyClosing(scope)"></el-button>-->
                                <el-button type="primary" icon="el-icon-more" size="small"
                                           class="cursor-pointer"
                                           @click="reportCurrencyClosing(scope.row)"></el-button>
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
                title="Add Closing Entry"
                :visible.sync="dialogAddClosingEntry"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="closingEntryForm" :rules="rules" ref="closingEntryForm" label-width="120px"
                     class="closingEntryForm">
                <el-form-item label="Close Date" prop="closeDate">
                    <el-date-picker
                            v-model="closingEntryForm.closeDate"
                            type="date"
                            style="width: 100%;"
                            placeholder="Pick a day"
                            :picker-options="options"
                            :disabled="disabledDate">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="Exchange" prop="exchangeId">
                    <el-select style="display: block !important;" filterable
                               v-model="closingEntryForm.exchangeId"
                               placeholder="Exchange">
                        <el-option
                                v-for="item in exchangeOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                        >
                        </el-option>
                    </el-select>
                </el-form-item>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddClosingEntry= false, cancel()">Cancel</el-button>
                    <el-button type="primary" @click="saveClosingEntry($event)">Save</el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                title="Update Closing Entry"
                :visible.sync="dialogUpdateClosingEntry"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="closingEntryForm" :rules="rules" ref="closingEntryForm" label-width="120px"
                     class="closingEntryForm">
                <el-form-item label="Close Date" prop="closeDate">
                    <el-date-picker
                            v-model="closingEntryForm.closeDate"
                            type="date"
                            style="width: 100%;"
                            placeholder="Pick a day"
                            :picker-options="options"
                            :disabled="disabledDate">
                    </el-date-picker>
                </el-form-item>
                <input type="hidden" v-model="closingEntryForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateClosingEntry= false ,cancel()">Cancel</el-button>
                    <el-button type="primary" @click="updateClosingEntry">Save</el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->
    </div>
</template>
<script>
    import {Acc_ClosingEntryReact} from "../../collection/accClosingEntry";

    export default {
        data() {
            return {
                newLoading: true,
                closingEntryData: [],
                journalClosingEntry: [],
                exchangeOptions: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddClosingEntry: false,
                dialogUpdateClosingEntry: false,
                closingEntryForm: {
                    closeDate: moment().toDate(),
                    exchangeId: "",
                    _id: ""
                },
                rules: {
                    closeDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input Journal Date',
                        trigger: 'blur'
                    }],
                    exchangeId: [{required: true, message: 'Please input Exchange', trigger: 'blur'}]


                },
                options: {
                    disabledDate(time) {
                        return false;
                    }
                },
                disabledDate: false,
                closeDate: "",
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
            "closingEntryForm.closeDate"(val) {
                let vm = this;
                if (vm.closeDate && vm.closeDate != "" && vm.closeDate != undefined) {
                    vm.options = {
                        disabledDate(time) {
                            let min = moment(vm.closeDate).add(1, "days").toDate().getTime();
                            return time.getTime() < min;
                        }
                    }
                } else {
                    vm.options = {
                        disabledDate(time) {
                            return false;
                        }
                    }
                }
            }
        },
        mounted() {
            this.$jQuery('body').off();
            let vm = this;
            vm.options = {
                disabledDate(time) {
                    let min = moment(vm.closeDate).add(1, "days").toDate().getTime();
                    return time.getTime() < min;
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
                Meteor.call('queryClosingEntry', {
                    q: val,
                    filter: this.filter,
                    rolesArea:Session.get('area'),
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.closingEntryData = result.content;
                        this.count = result.countClosingEntry;
                    }
                    this.isSearching = false;
                    this.newLoading = false;
                });
            }, 300),

            reportCurrencyClosing(data) {
                let params = {};
                let queryParams = {};
                queryParams._id = data._id;
                queryParams.area = Session.get("area");
                let path = FlowRouter.path("acc.currencyClosingReport", params, queryParams);
                window.open(path, "_blank");
            },

            fetchExchange() {
                Meteor.call('queryExchangeOptionReport', (err, result) => {
                    if (result) {
                        this.exchangeOptions = result;
                    }
                });
            },
            popUpAdd() {
                let vm = this;
                Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                    if (re != undefined) {
                        vm.closeDate = re.closeDate;
                    } else {
                        vm.closeDate = "";
                    }
                })
            },
            saveClosingEntry(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["closingEntryForm"].validate((valid) => {
                    if (valid) {
                        let closingEntryDoc = {
                            closeDate: vm.closingEntryForm.closeDate,
                            rolesArea: Session.get('area'),
                            month: moment(vm.closingEntryForm.closeDate).format("MM"),
                            year: moment(vm.closingEntryForm.closeDate).format("YYYY"),
                            closeDateName: moment(vm.closingEntryForm.closeDate).format("DD/MM/YYYY"),
                            exchangeId: vm.closingEntryForm.exchangeId
                        };

                        Meteor.call("queryClosingEntryByMonthYear", closingEntryDoc.month, closingEntryDoc.year, Session.get('area'), function (err, re) {
                            if (re == undefined) {
                                Meteor.call("insertClosingEntry", closingEntryDoc, (err, result) => {
                                    if (!err) {
                                        vm.$message({
                                            duration: 1000,
                                            message: `Save Successfully!`,
                                            type: 'success'
                                        });
                                        vm.dialogAddClosingEntry = false;
                                        vm.$refs["closingEntryForm"].resetFields();
                                        vm.resetForm();

                                    } else {
                                        vm.$message({
                                            duration: 1000,
                                            message: `Duplicate Date!!`,
                                            type: 'error'
                                        });
                                    }
                                })
                            } else {
                                vm.$message({
                                    duration: 1000,
                                    message: `Duplicate Date!!`,
                                    type: 'error'
                                });
                            }
                        })

                    }
                })

            },
            updateClosingEntry() {
                let vm = this;
                let closingEntryDoc = {
                    _id: vm.closingEntryForm._id,
                    closeDate: vm.closingEntryForm.closeDate,
                    rolesArea: Session.get('area'),
                    month: moment(vm.closingEntryForm.closeDate).format("MM"),
                    year: moment(vm.closingEntryForm.closeDate).format("YYYY"),
                    closeDateName: moment(this.closingEntryForm.closeDate).format("DD/MM/YYYY")

                };
                Meteor.call("queryClosingEntryByMonthYear", closingEntryDoc.month, closingEntryDoc.year, Session.get('area'), function (err, re) {
                    if (re == undefined) {
                        Meteor.call("updateClosingEntry", closingEntryDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Update Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogUpdateClosingEntry = false;
                                vm.$refs["closingEntryForm"].resetFields();
                                vm.resetForm();

                            } else {
                                vm.$message({
                                    duration: 1000,
                                    message: `Update Failed!`,
                                    type: 'error'
                                });
                            }
                        })
                    } else {
                        vm.$message({
                            duration: 1000,
                            message: `Duplicate Date!!`,
                            type: 'error'
                        });
                    }
                })

            },
            removeClosingEntry(index, row, rows) {
                let vm = this;
                Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                    if (re.month == row.month && re.year == row.year) {
                        vm.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                            confirmButtonText: 'OK',
                            cancelButtonText: 'Cancel',
                            type: 'warning'
                        }).then(() => {
                            Meteor.call("removeClosingEntry", row._id, (err, result) => {
                                if (!err) {
                                    rows.splice(index, 1);

                                    vm.$message({
                                        message: `លុប ${row.closeDateName} បានជោគជ័យ`,
                                        type: 'success'
                                    });
                                } else {
                                    vm.$message({
                                        type: 'error',
                                        message: 'Delete Failed'
                                    });
                                }

                            })

                        }).catch(() => {
                            vm.$message({
                                type: 'info',
                                message: 'Delete canceled'
                            });
                        });
                    } else {
                        vm.$message({
                            type: 'error',
                            message: 'Delete Failed ! Not Last Date!'
                        });
                    }
                })


            },
            findClosingEntryById(doc) {
                Meteor.call("queryClosingEntryById", doc.row._id, (err, result) => {
                    if (result) {
                        this.closingEntryForm = result;
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
                if (this.$refs["closingEntryForm"]) {
                    this.$refs["closingEntryForm"].resetFields();
                }
            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            this.fetchExchange();
            Meteor.subscribe('Acc_ClosingEntryReact');

        },
        meteor: {
            newRe() {
                let vm = this;
                Acc_ClosingEntryReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        }
    }
</script>