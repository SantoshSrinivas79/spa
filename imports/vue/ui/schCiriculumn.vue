<template>
    <div class="sch_ciriculumn">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddSchCiriculumn = true,resetForm()">
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
                        :data="schCiriculumnData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="name"
                            :label="langConfig['name']"
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
                                           @click="removeSchCiriculumn(scope.$index,scope.row,schCiriculumnData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findSchCiriculumnById(scope),dialogUpdateSchCiriculumn= true"
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
                :visible.sync="dialogAddSchCiriculumn"
                :fullscreen="fullscreen">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schCiriculumnForm" :rules="rules" ref="schCiriculumnFormAdd" label-width="120px"
                     class="schCiriculumnForm" :label-position="labelPosition">

                <el-row>
                    <el-col :span="6">
                        <el-form-item :label="langConfig['name']" prop="name" style="width: 90%">
                            <el-input v-model="schCiriculumnForm.name"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item :label="langConfig['major']" prop="majorId" style="width: 90%">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schCiriculumnForm.majorId"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in majorList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item :label="langConfig['requiredCredit']" prop="requiredCredit" style="width: 90%">
                            <el-input v-model="schCiriculumnForm.requiredCredit"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item :label="langConfig['desc']" prop="desc" style="width: 90%">
                            <el-input v-model="schCiriculumnForm.desc"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="11">
                        <span><b>ឆមាស ១(Semester 1)</b></span>
                        <el-table
                                :data="culumnData1"
                                stripe
                                style="width: 100%">
                            <el-table-column
                                    type="index"
                                    :index="indexMethod">
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['year']">
                                <template slot-scope="scope">

                                    <el-select style="display: block !important;"
                                               filterable
                                               v-model="scope.row.year"
                                               @change="handleEditCulumn1(scope.$index, scope.row)"
                                               :placeholder="langConfig['chooseItem']">
                                        <el-option
                                                v-for="item in yearList"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                                :disabled="item.disabled">
                                        </el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['subject']">
                                <template slot-scope="scope">
                                    <el-select style="display: block !important;"
                                               filterable
                                               v-model="scope.row.subjectId"
                                               @change="handleEditCulumn1(scope.$index, scope.row)"
                                               :placeholder="langConfig['chooseItem']">
                                        <el-option
                                                v-for="item in subjectList"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                                :disabled="item.disabled">
                                        </el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['credit']">
                                <template slot-scope="scope">
                                    <el-input size="small" v-model="scope.row.credit" type="number"
                                              :placeholder="langConfig['credit']"
                                              @keyup.native="handleEditCulumn1(scope.$index, scope.row)"
                                              @change="handleEditCulumn1(scope.$index, scope.row)"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['action']"
                                    width="120"
                            >
                                <template slot-scope="scope">
                                    <el-button type="primary" class="cursor-pointer" icon="el-icon-circle-plus"
                                               size="small"
                                               @click="handleAddCulumn1()"

                                    ></el-button>
                                    <el-button type="danger" class="cursor-pointer" icon="el-icon-remove"
                                               size="small"
                                               @click="removeCulumn1(scope.$index,scope.row)"
                                    ></el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                    </el-col>
                    <el-col :span="2">
                        <div>&nbsp;</div>
                    </el-col>
                    <el-col :span="11">
                        <span><b>ឆមាស ២(Semester 2)</b></span>
                        <el-table
                                :data="culumnData2"
                                stripe
                                style="width: 100%">
                            <el-table-column
                                    type="index"
                                    :index="indexMethod">
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['year']">
                                <template slot-scope="scope">

                                    <el-select style="display: block !important;"
                                               filterable
                                               v-model="scope.row.year"
                                               @change="handleEditCulumn2(scope.$index, scope.row)"
                                               :placeholder="langConfig['chooseItem']">
                                        <el-option
                                                v-for="item in yearList"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                                :disabled="item.disabled">
                                        </el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['subject']">
                                <template slot-scope="scope">
                                    <el-select style="display: block !important;"
                                               filterable
                                               v-model="scope.row.subjectId"
                                               @change="handleEditCulumn2(scope.$index, scope.row)"
                                               :placeholder="langConfig['chooseItem']">
                                        <el-option
                                                v-for="item in subjectList"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                                :disabled="item.disabled">
                                        </el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['credit']">
                                <template slot-scope="scope">
                                    <el-input size="small" v-model="scope.row.credit" type="number"
                                              :placeholder="langConfig['credit']"
                                              @keyup.native="handleEditCulumn2(scope.$index, scope.row)"
                                              @change="handleEditCulumn2(scope.$index, scope.row)"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['action']"
                                    width="120"
                            >
                                <template slot-scope="scope">
                                    <el-button type="primary" class="cursor-pointer" icon="el-icon-circle-plus"
                                               size="small"
                                               @click="handleAddCulumn2()"

                                    ></el-button>
                                    <el-button type="danger" class="cursor-pointer" icon="el-icon-remove"
                                               size="small"
                                               @click="removeCulumn2(scope.$index,scope.row)"
                                    ></el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                    </el-col>
                </el-row>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddSchCiriculumn = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="saveSchCiriculumn($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateSchCiriculumn"
                :fullscreen="fullscreen">

            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schCiriculumnForm" :rules="rules" ref="schCiriculumnFormUpdate" label-width="120px"
                     class="schCiriculumnForm" :label-position="labelPosition">

                <el-row>
                    <el-col :span="6">
                        <el-form-item :label="langConfig['name']" prop="name" style="width: 90%">
                            <el-input v-model="schCiriculumnForm.name"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item :label="langConfig['major']" prop="majorId" style="width: 90%">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schCiriculumnForm.majorId"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in majorList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item :label="langConfig['requiredCredit']" prop="requiredCredit" style="width: 90%">
                            <el-input v-model="schCiriculumnForm.requiredCredit"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">
                        <el-form-item :label="langConfig['desc']" prop="desc" style="width: 90%">
                            <el-input v-model="schCiriculumnForm.desc"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="11">
                        <span><b>ឆមាស ១(Semester 1)</b></span>
                        <el-table
                                :data="culumnData1"
                                stripe
                                style="width: 100%">
                            <el-table-column
                                    type="index"
                                    :index="indexMethod">
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['year']">
                                <template slot-scope="scope">

                                    <el-select style="display: block !important;"
                                               filterable
                                               v-model="scope.row.year"
                                               @change="handleEditCulumn1(scope.$index, scope.row)"
                                               :placeholder="langConfig['chooseItem']">
                                        <el-option
                                                v-for="item in yearList"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                                :disabled="item.disabled">
                                        </el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['subject']">
                                <template slot-scope="scope">
                                    <el-select style="display: block !important;"
                                               filterable
                                               v-model="scope.row.subjectId"
                                               @change="handleEditCulumn1(scope.$index, scope.row)"
                                               :placeholder="langConfig['chooseItem']">
                                        <el-option
                                                v-for="item in subjectList"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                                :disabled="item.disabled">
                                        </el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['credit']">
                                <template slot-scope="scope">
                                    <el-input size="small" v-model="scope.row.credit" type="number"
                                              :placeholder="langConfig['credit']"
                                              @keyup.native="handleEditCulumn1(scope.$index, scope.row)"
                                              @change="handleEditCulumn1(scope.$index, scope.row)"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['action']"
                                    width="120"
                            >
                                <template slot-scope="scope">
                                    <el-button type="primary" class="cursor-pointer" icon="el-icon-circle-plus"
                                               size="small"
                                               @click="handleAddCulumn1()"

                                    ></el-button>
                                    <el-button type="danger" class="cursor-pointer" icon="el-icon-remove"
                                               size="small"
                                               @click="removeCulumn1(scope.$index,scope.row)"
                                    ></el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                    </el-col>
                    <el-col :span="2">
                        <div>&nbsp;</div>
                    </el-col>
                    <el-col :span="11">
                        <span><b>ឆមាស ២(Semester 2)</b></span>
                        <el-table
                                :data="culumnData2"
                                stripe
                                style="width: 100%">
                            <el-table-column
                                    type="index"
                                    :index="indexMethod">
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['year']">
                                <template slot-scope="scope">

                                    <el-select style="display: block !important;"
                                               filterable
                                               v-model="scope.row.year"
                                               @change="handleEditCulumn2(scope.$index, scope.row)"
                                               :placeholder="langConfig['chooseItem']">
                                        <el-option
                                                v-for="item in yearList"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                                :disabled="item.disabled">
                                        </el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['subject']">
                                <template slot-scope="scope">
                                    <el-select style="display: block !important;"
                                               filterable
                                               v-model="scope.row.subjectId"
                                               @change="handleEditCulumn2(scope.$index, scope.row)"
                                               :placeholder="langConfig['chooseItem']">
                                        <el-option
                                                v-for="item in subjectList"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                                :disabled="item.disabled">
                                        </el-option>
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['credit']">
                                <template slot-scope="scope">
                                    <el-input size="small" v-model="scope.row.credit" type="number"
                                              :placeholder="langConfig['credit']"
                                              @keyup.native="handleEditCulumn2(scope.$index, scope.row)"
                                              @change="handleEditCulumn2(scope.$index, scope.row)"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['action']"
                                    width="120"
                            >
                                <template slot-scope="scope">
                                    <el-button type="primary" class="cursor-pointer" icon="el-icon-circle-plus"
                                               size="small"
                                               @click="handleAddCulumn2()"

                                    ></el-button>
                                    <el-button type="danger" class="cursor-pointer" icon="el-icon-remove"
                                               size="small"
                                               @click="removeCulumn2(scope.$index,scope.row)"
                                    ></el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                    </el-col>
                </el-row>

                <input type="hidden" v-model="schCiriculumnForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateSchCiriculumn = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="updateSchCiriculumn">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-sch'
    import {Sch_CiriculumnReact} from "../../collection/schCiriculumn";

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
                Sch_CiriculumnReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                schCiriculumnData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                labelPosition: 'top',
                dialogAddSchCiriculumn: false,
                dialogUpdateSchCiriculumn: false,
                culumnData1: [
                    {year: "", subjectId: "", credit: 0}
                ],
                culumnData2: [
                    {year: "", subjectId: "", credit: 0}
                ],
                majorList: [],
                subjectList: [],
                yearList: [
                    {label: "1", value: 1},
                    {label: "2", value: 2},
                    {label: "3", value: 3},
                    {label: "4", value: 4},
                ],
                fullscreen: true,
                schCiriculumnForm: {
                    name: "",
                    majorId: "",
                    desc: "",
                    _id: "",
                    requiredCredit: "",
                    culumn: []
                },
                rules: {
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    major: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Major',
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
                Meteor.call('querySchCiriculumn', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.schCiriculumnData = result.content;
                        this.count = result.countSchCiriculumn;
                    }
                    this.isSearching = false;
                });
            }, 300),
            majorOpt() {
                let selector = {};
                Meteor.call('queryMajorOption', selector, (err, result) => {
                    this.majorList = result;
                })
            },
            subjectOpt() {
                let selector = {};
                Meteor.call('querySubjectOption', selector, (err, result) => {
                    this.subjectList = result;
                })
            },
            indexMethod(index) {
                return index + 1;
            },
            removeCulumn1(index, row) {
                if (this.culumnData1.length > 1) {
                    this.culumnData1.splice(index, 1);
                    this.$message({
                        message: `លុប បានជោគជ័យ`,
                        type: 'success'
                    });
                } else {
                    this.culumnData1 = [
                        {year: "", subjectId: "", credit: 0}

                    ];
                }
            },

            handleAddCulumn1() {
                this.culumnData1.push(
                    {year: "", subjectId: "", credit: 0}
                )
            },
            handleEditCulumn1(row, index) {
                this.culumnData1[index] = row;

            },

            removeCulumn2(index, row) {
                if (this.culumnData2.length > 1) {
                    this.culumnData2.splice(index, 1);
                    this.$message({
                        message: `លុប បានជោគជ័យ`,
                        type: 'success'
                    });
                } else {
                    this.culumnData2 = [
                        {year: "", subjectId: "", credit: 0}

                    ];
                }
            },

            handleAddCulumn2() {
                this.culumnData2.push(
                    {year: "", subjectId: "", credit: 0}
                )
            },
            handleEditCulumn2(row, index) {
                this.culumnData2[index] = row;
            },
            saveSchCiriculumn(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["schCiriculumnFormAdd"].validate((valid) => {
                    if (valid) {
                        let culumnData1Temp = [];
                        let culumnData2Temp = [];
                        vm.culumnData1.map((obj) => {
                            if (obj.year) {
                                culumnData1Temp.push(obj);
                            }
                        });

                        vm.culumnData2.map((obj) => {
                            if (obj.year) {
                                culumnData2Temp.push(obj);

                            }
                        });

                        let schCiriculumnDoc = {
                            name: vm.schCiriculumnForm.name,
                            desc: vm.schCiriculumnForm.desc,
                            requiredCredit: vm.schCiriculumnForm.requiredCredit,
                            culumnSemester1: culumnData1Temp,
                            culumnSemester2: culumnData2Temp,
                            majorId: vm.schCiriculumnForm.majorId,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("insertSchCiriculumn", schCiriculumnDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogAddSchCiriculumn = false;

                                vm.$refs["schCiriculumnFormAdd"].resetFields();
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
            updateSchCiriculumn() {
                let vm = this;
                this.$refs["schCiriculumnFormUpdate"].validate((valid) => {
                    if (valid) {
                        let culumnData1Temp = [];
                        let culumnData2Temp = [];
                        vm.culumnData1.map((obj) => {
                            if (obj.year) {
                                culumnData1Temp.push(obj);
                            }
                        });

                        vm.culumnData2.map((obj) => {
                            if (obj.year) {
                                culumnData2Temp.push(obj);

                            }
                        });

                        let schCiriculumnDoc = {
                            _id: vm.schCiriculumnForm._id,
                            name: vm.schCiriculumnForm.name,
                            desc: vm.schCiriculumnForm.desc,
                            requiredCredit: vm.schCiriculumnForm.requiredCredit,
                            culumnSemester1: culumnData1Temp,
                            culumnSemester2: culumnData2Temp,
                            majorId: vm.schCiriculumnForm.majorId,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("updateSchCiriculumn", schCiriculumnDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Successfully
                        !`,
                                    type: 'success'
                                });
                                vm.dialogUpdateSchCiriculumn = false;

                                vm.$refs["schCiriculumnFormUpdate"].resetFields();
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
            removeSchCiriculumn(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeSchCiriculumn", row._id, (err, result) => {
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
                                message: 'Delete Failed'
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
            findSchCiriculumnById(doc) {
                let vm = this;
                vm.schCiriculumnForm = {};
                Meteor.call("querySchCiriculumnById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.schCiriculumnForm._id = result._id;
                        vm.schCiriculumnForm = result;
                        vm.culumnData1 = result.culumnSemester1;
                        vm.culumnData2 = result.culumnSemester2;
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
                this.schCiriculumnForm._id = "";

                this.culumnData1 = [
                    {year: "", subjectId: "", credit: 0}
                ];
                this.culumnData2 = [
                    {year: "", subjectId: "", credit: 0}
                ];
                if (this.$refs["schCiriculumnFormAdd"]) {
                    this.$refs["schCiriculumnFormAdd"].resetFields();
                }

                if (this.$refs["schCiriculumnFormUpdate"]) {
                    this.$refs["schCiriculumnFormUpdate"].resetFields();
                }

            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            this.subjectOpt();
            this.majorOpt();
            Meteor.subscribe('Sch_CiriculumnReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['ciriculumn'];
                return data;
            }
        }
    }
</script>