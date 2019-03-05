<template>
    <div class="sch_promotion">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddSchPromotion = true,resetForm()">
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
                        :data="schPromotionData"
                        stripe
                        border
                        style="width: 100%">
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
                            prop="promotionType"
                            :label="langConfig['promotionType']">
                    </el-table-column>
                    <el-table-column
                            prop="value"
                            :label="langConfig['value']">
                    </el-table-column>
                    <el-table-column
                            prop="note"
                            :label="langConfig['desc']">
                    </el-table-column>
                    <el-table-column
                            prop="status"
                            :label="langConfig['status']"
                            width="150"
                            filter-placement="bottom-end">
                        <template slot-scope="scope">
                            <el-tag
                                    :type="scope.row.status === true ? 'primary' : 'danger'"
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
                                           @click="removeSchPromotion(scope.$index,scope.row,schPromotionData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findSchPromotionById(scope),dialogUpdateSchPromotion= true"
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
                :visible.sync="dialogAddSchPromotion"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schPromotionForm" :rules="rules" ref="schPromotionFormAdd" label-width="120px"
                     class="schPromotionForm">

                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="schPromotionForm.name"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['khName']" prop="khName">
                    <el-input v-model="schPromotionForm.khName"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['promotionType']" prop="promotionType">
                    <el-radio-group v-model="schPromotionForm.promotionType">
                        <el-radio v-for="mt in promotionTypeList" :label="mt.value" :key="mt.value" border>
                            {{mt.label}}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item :label="langConfig['value']" prop="value">
                    <el-input v-model="schPromotionForm.value"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['desc']" prop="desc">
                    <el-input type="textarea" v-model="schPromotionForm.desc"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['status']" prop="status">
                    <el-switch
                            v-model="schPromotionForm.status"
                            active-color="#13ce66"
                            inactive-color="#ff4949"
                    >
                    </el-switch>

                </el-form-item>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddSchPromotion = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="saveSchPromotion($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateSchPromotion"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schPromotionForm" :rules="rules" ref="schPromotionFormUpdate" label-width="120px"
                     class="schPromotionForm">

                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="schPromotionForm.name"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['khName']" prop="khName">
                    <el-input v-model="schPromotionForm.khName"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['promotionType']" prop="promotionType">
                    <el-radio-group v-model="schPromotionForm.promotionType">
                        <el-radio v-for="mt in promotionTypeList" :label="mt.value" :key="mt.value" border>
                            {{mt.label}}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item :label="langConfig['value']" prop="value">
                    <el-input v-model="schPromotionForm.value"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['desc']" prop="desc">
                    <el-input type="textarea" v-model="schPromotionForm.desc"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['status']" prop="status">
                    <el-switch
                            v-model="schPromotionForm.status"
                            active-color="#13ce66"
                            inactive-color="#ff4949"
                    >
                    </el-switch>

                </el-form-item>
                <input type="hidden" v-model="schPromotionForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateSchPromotion = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="updateSchPromotion">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-sch'
    import {Sch_PromotionReact} from "../../collection/schPromotion";

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
                Sch_PromotionReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                newLoading: true,
                schPromotionData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddSchPromotion: false,
                dialogUpdateSchPromotion: false,
                promotionTypeList: [
                    {label: "Amount", value: "Amount"},
                    {label: "Percent (%)", value: "Percent"},
                ],
                schPromotionForm: {
                    name: "",
                    khName: "",
                    desc: "",
                    _id: "",
                    value: 0,
                    promotionType: "",
                    status: false

                },
                rules: {
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    value: [{required: true, message: 'Please input Price', trigger: 'blur'}],
                    promotionType:
                        [{
                            required: true,
                            type: "string",
                            message: 'Please choose Promotion Type',
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
                Meteor.call('querySchPromotion', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.schPromotionData = result.content;
                        this.count = result.countSchPromotion;
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
            saveSchPromotion(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["schPromotionFormAdd"].validate((valid) => {
                    if (valid) {
                        let schPromotionDoc = {
                            name: vm.schPromotionForm.name,
                            khName: vm.schPromotionForm.khName,
                            desc: vm.schPromotionForm.desc,
                            value: vm.schPromotionForm.value,
                            promotionType: vm.schPromotionForm.promotionType,
                            status: vm.schPromotionForm.status,

                            rolesArea: Session.get('area')
                        };

                        Meteor.call("insertSchPromotion", schPromotionDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogAddSchPromotion = false;

                                vm.$refs["schPromotionFormAdd"].resetFields();
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
            updateSchPromotion() {
                let vm = this;
                this.$refs["schPromotionFormUpdate"].validate((valid) => {
                    if (valid) {
                        let schPromotionDoc = {
                            _id: vm.schPromotionForm._id,
                            name: vm.schPromotionForm.name,
                            khName: vm.schPromotionForm.khName,
                            desc: vm.schPromotionForm.desc,
                            value: vm.schPromotionForm.value,
                            promotionType: vm.schPromotionForm.promotionType,
                            status: vm.schPromotionForm.status,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updateSchPromotion", schPromotionDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Successfully
                        !`,
                                    type: 'success'
                                });
                                vm.dialogUpdateSchPromotion = false;

                                vm.$refs["schPromotionFormUpdate"].resetFields();
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
            removeSchPromotion(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeSchPromotion", row._id, (err, result) => {
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
            findSchPromotionById(doc) {
                let vm = this;
                vm.schPromotionForm = {};
                Meteor.call("querySchPromotionById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.schPromotionForm._id = result._id;
                        vm.schPromotionForm = result;
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
                this.schPromotionForm._id = "";
                if (this.$refs["schPromotionFormAdd"]) {
                    this.$refs["schPromotionFormAdd"].resetFields();
                }

                if (this.$refs["schPromotionFormUpdate"]) {
                    this.$refs["schPromotionFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.fetchUser();
            this.queryData();
            Meteor.subscribe('Sch_PromotionReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['promotion'];
                return data;
            }
        }
    }
</script>