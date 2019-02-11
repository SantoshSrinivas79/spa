<template>
    <div class="sch_register">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddSchRegister = true,popupSchRegisterAdd()">
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
                        :data="schRegisterData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="registerDateName"
                            :label="langConfig['registerDate']"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="studentDoc.personal.name"
                            :label="langConfig['student']"
                            sortable>
                    </el-table-column>

                    <el-table-column
                            prop="levelDoc.name"
                            :label="langConfig['level']"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="programDoc.name"
                            :label="langConfig['program']">
                    </el-table-column>
                    <el-table-column
                            prop="note"
                            :label="langConfig['note']">
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['action']"
                            width="240"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removeSchRegister(scope.$index,scope.row,schRegisterData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="popupSchRegisterUpdate(scope.row),findSchRegisterById(scope),dialogUpdateSchRegister= true"
                                           :disabled="disabledUpdate"></el-button>
                                <el-button type="success" icon="el-icon-caret-right" size="small" class="cursor-pointer"
                                           @click="popupSchRegisterUpdateToClass(scope.row),findSchRegisterById(scope),dialogUpdateSchRegisterToClass= true"
                                           :disabled="disabledUpdate"></el-button>
                                <el-button type="success" size="small" class="cursor-pointer"
                                           @click="dialoginputTranscript= true,popUpInputTranscript(scope.row)"
                                           :disabled="disabledUpdate">T
                                </el-button>
                                <el-button type="warning" icon="el-icon-printer" size="small" class="cursor-pointer"
                                           @click="printTranscript(scope.row)"
                                >
                                </el-button>
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
                :visible.sync="dialogAddSchRegister"
                width="60%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schRegisterForm" :rules="rules" :ref="ref" label-width="120px"
                     class="schRegisterForm">
                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['registerDate']" prop="registerDate">
                            <el-date-picker
                                    v-model="schRegisterForm.registerDate"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item :label="langConfig['student']" prop="studentId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schRegisterForm.studentId" remote :remote-method="studentOpt"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in studentList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['program']" prop="programId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schRegisterForm.programId"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in programList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['major']" prop="majorId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schRegisterForm.majorId"
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
                    <el-col :span="12">
                        <el-form-item :label="langConfig['level']" prop="levelId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schRegisterForm.levelId"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in levelList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['promotion']" prop="promotionId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schRegisterForm.promotionId"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in promotionList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['term']" prop="term">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schRegisterForm.term"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in termList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="langConfig['note']" prop="note">
                            <el-input type="textarea" v-model="schRegisterForm.note"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddSchRegister = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="saveSchRegister($event)">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateSchRegister"
                width="60%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schRegisterForm" :rules="rules" :ref="ref" label-width="120px"
                     class="schRegisterForm">
                <el-row>
                    <el-col :span="12">

                        <el-form-item :label="langConfig['registerDate']" prop="registerDate">
                            <el-date-picker
                                    v-model="schRegisterForm.registerDate"
                                    type="date"
                                    :disabled="disableUpdateField"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item :label="langConfig['student']" prop="studentId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schRegisterForm.studentId" :remote-method="studentOpt"
                                       :disabled="disableUpdateField"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in studentList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['program']" prop="programId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schRegisterForm.programId"
                                       :disabled="disableUpdateField"

                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in programList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['major']" prop="majorId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schRegisterForm.majorId"
                                       :disabled="disableUpdateField"


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
                    <el-col :span="12">
                        <el-form-item :label="langConfig['level']" prop="levelId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schRegisterForm.levelId"
                                       :disabled="disableUpdateField"

                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in levelList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['promotion']" prop="promotionId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schRegisterForm.promotionId"
                                       :disabled="disableUpdateField"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in promotionList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['term']" prop="term">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schRegisterForm.term"
                                       :disabled="disableUpdateField"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in termList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="langConfig['note']" prop="note">
                            <el-input type="textarea" v-model="schRegisterForm.note"></el-input>
                        </el-form-item>

                    </el-col>
                </el-row>
                <input type="hidden" v-model="schRegisterForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateSchRegister = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="updateSchRegister">{{langConfig['save']}} <i>(Ctrl + Enter)</i>
                    </el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>

        <el-dialog
                :title="langConfig['addToClass']"
                :visible.sync="dialogUpdateSchRegisterToClass"
                width="60%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schRegisterForm" :rules="rules" :ref="ref" label-width="120px"
                     class="schRegisterForm">
                <el-row>
                    <el-col :span="12">

                        <el-form-item :label="langConfig['class']" prop="classId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schRegisterForm.classId"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in classList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['startClassDate']" prop="startClassDate">
                            <el-date-picker
                                    v-model="schRegisterForm.startClassDate"
                                    type="date"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <hr>

                        <el-form-item :label="langConfig['registerDate']" prop="registerDate">
                            <el-date-picker
                                    v-model="schRegisterForm.registerDate"
                                    type="date"
                                    disabled="disabled"
                                    style="width: 100%;"
                                    placeholder="Pick a day"
                            >
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item :label="langConfig['student']" prop="studentId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schRegisterForm.studentId"
                                       disabled="disabled"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in studentList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['program']" prop="programId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="schRegisterForm.programId"
                                       disabled="disabled"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in programList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">

                        <el-form-item :label="langConfig['major']" prop="majorId">
                            <el-select style="display: block !important;"
                                       filterable
                                       disabled="disabled"
                                       v-model="schRegisterForm.majorId"
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
                        <el-form-item :label="langConfig['level']" prop="levelId">
                            <el-select style="display: block !important;"
                                       filterable
                                       disabled="disabled"
                                       v-model="schRegisterForm.levelId"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in levelList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="langConfig['promotion']" prop="promotionId">
                            <el-select style="display: block !important;"
                                       filterable
                                       disabled="disabled"
                                       v-model="schRegisterForm.promotionId"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in promotionList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="langConfig['term']" prop="term">
                            <el-select style="display: block !important;"
                                       filterable
                                       disabled="disabled"
                                       v-model="schRegisterForm.term"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in termList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item :label="langConfig['note']" prop="note">
                            <el-input type="textarea" v-model="schRegisterForm.note" disabled="disabled"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <input type="hidden" v-model="schRegisterForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateSchRegisterToClass = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="updateSchRegister">{{langConfig['save']}} <i>(Ctrl + Enter)</i>
                    </el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>

        <el-dialog
                :title="langConfig['inputTranscript']"
                :visible.sync="dialoginputTranscript"
                :fullscreen="fullscreen">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="inputTranscriptForm" :rules="rules" :ref="ref" label-width="120px"
                     class="inputTranscriptForm">

                <el-row>
                    <el-col :span="8">
                        <el-form-item :label="langConfig['student']" prop="studentName">
                            <input type="hidden" v-model="inputTranscriptForm.studentId"/>
                            <el-input v-model="inputTranscriptForm.studentName" disabled></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item :label="langConfig['major']" prop="majorId">
                            <el-select style="display: block !important;"
                                       filterable :disabled="true"
                                       v-model="inputTranscriptForm.majorId"
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
                    <el-col :span="8">
                        <el-form-item :label="langConfig['curiculumn']" prop="curiculumnId">
                            <el-select style="display: block !important;"
                                       filterable
                                       v-model="inputTranscriptForm.curiculumnId" :disabled="disabledCuriculumn"
                                       :placeholder="langConfig['chooseItem']">
                                <el-option
                                        v-for="item in curiculumnList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <span><b>ឆមាស ១(Semester 1)</b></span>
                        <el-table
                                :data="culumnData1"
                                stripe
                                style="width: 100%">
                            <el-table-column
                                    type="index"
                                    :index="indexMethod">
                            </el-table-column>
                            <el-table-column width="70"
                                             :label="langConfig['year']">
                                <template slot-scope="scope">
                                    <el-input size="small" v-model="scope.row.year" type="number"
                                              :placeholder="langConfig['chooseItem']" :disabled="true"
                                              @keyup.native="handleEditCulumn2(scope.$index, scope.row)"
                                              @change="handleEditCulumn2(scope.$index, scope.row)"></el-input>
                                    <!--<el-select style="display: block !important;"
                                               filterable
                                               v-model="scope.row.year" :disabled="true"
                                               @change="handleEditCulumn1(scope.$index, scope.row)"
                                               :placeholder="langConfig['chooseItem']">
                                        <el-option
                                                v-for="item in yearList"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                                :disabled="item.disabled">
                                        </el-option>
                                    </el-select>-->
                                </template>
                            </el-table-column>
                            <el-table-column min-width="250"
                                             :label="langConfig['subject']">
                                <template slot-scope="scope">
                                    <el-select style="display: block !important;"
                                               filterable
                                               v-model="scope.row.subjectId" :disabled="true"
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
                                              :placeholder="langConfig['credit']" :disabled="true"
                                              @keyup.native="handleEditCulumn1(scope.$index, scope.row)"
                                              @change="handleEditCulumn1(scope.$index, scope.row)"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['score']">
                                <template slot-scope="scope">
                                    <el-input size="small" v-model="scope.row.score" type="number"
                                              :placeholder="langConfig['score']"
                                              @keyup.native="handleEditCulumn1(scope.$index, scope.row)"
                                              @change="handleEditCulumn1(scope.$index, scope.row)"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['grades']">
                                <template slot-scope="scope">
                                    <el-input size="small" v-model="scope.row.grade"
                                              :placeholder="langConfig['grades']" disabled
                                              @keyup.native="handleEditCulumn1(scope.$index, scope.row)"
                                              @change="handleEditCulumn1(scope.$index, scope.row)"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['gradePoint']">
                                <template slot-scope="scope">
                                    <el-input size="small" v-model="scope.row.gradePoint"
                                              :placeholder="langConfig['gradePoint']" disabled
                                              @keyup.native="handleEditCulumn1(scope.$index, scope.row)"
                                              @change="handleEditCulumn1(scope.$index, scope.row)"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['action']"
                                    width="60"
                            >
                                <template slot-scope="scope">
                                    <el-button type="danger" class="cursor-pointer" icon="el-icon-refresh"
                                               size="small"
                                               @click="removeCulumn1(scope.$index,scope.row)"
                                    ></el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                    </el-col>
                    <el-col :span="12">
                        <span><b>ឆមាស ២(Semester 2)</b></span>
                        <el-table
                                :data="culumnData2"
                                stripe
                                style="width: 100%">
                            <!--<el-table-column
                                    type="index"
                                    :index="indexMethod">
                            </el-table-column>-->
                            <el-table-column width="70"
                                             :label="langConfig['year']">
                                <template slot-scope="scope">
                                    <el-input size="small" v-model="scope.row.year" type="number"
                                              :placeholder="langConfig['chooseItem']" :disabled="true"
                                              @keyup.native="handleEditCulumn2(scope.$index, scope.row)"
                                              @change="handleEditCulumn2(scope.$index, scope.row)"></el-input>
                                </template>

                            </el-table-column>
                            <el-table-column min-width="250"
                                             :label="langConfig['subject']">
                                <template slot-scope="scope">
                                    <el-select style="display: block !important;"
                                               filterable
                                               v-model="scope.row.subjectId" :disabled="true"
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
                                              :placeholder="langConfig['credit']" :disabled="true"
                                              @keyup.native="handleEditCulumn2(scope.$index, scope.row)"
                                              @change="handleEditCulumn2(scope.$index, scope.row)"></el-input>
                                </template>
                            </el-table-column>

                            <el-table-column
                                    :label="langConfig['score']">
                                <template slot-scope="scope">
                                    <el-input size="small" v-model="scope.row.score" type="number"
                                              :placeholder="langConfig['score']"
                                              @keyup.native="handleEditCulumn2(scope.$index, scope.row)"
                                              @change.native="handleEditCulumn2(scope.$index, scope.row)"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['grades']">
                                <template slot-scope="scope">
                                    <el-input size="small" v-model="scope.row.grade"
                                              :placeholder="langConfig['grade']" disabled
                                              @keyup.native="handleEditCulumn1(scope.$index, scope.row)"
                                              @change="handleEditCulumn1(scope.$index, scope.row)"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['gradePoint']">
                                <template slot-scope="scope">
                                    <el-input size="small" v-model="scope.row.gradePoint"
                                              :placeholder="langConfig['gradePoint']" disabled
                                              @keyup.native="handleEditCulumn1(scope.$index, scope.row)"
                                              @change="handleEditCulumn1(scope.$index, scope.row)"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['action']"
                                    width="60"
                            >
                                <template slot-scope="scope">
                                    <el-button type="danger" class="cursor-pointer" icon="el-icon-refresh"
                                               size="small"
                                               @click="removeCulumn2(scope.$index,scope.row)"
                                    ></el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </el-col>
                </el-row>
                <hr style="margin-top: 0px !important;">
                <el-row>
                    <el-col :span="12">
                        <span><b>ប្រលងបញ្ចប់(State Exam)</b></span>
                        <el-table
                                :data="stateExam"
                                stripe
                                style="width: 100%">
                            <el-table-column
                                    type="index"
                                    :index="indexMethod">
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['subject']">
                                <template slot-scope="scope">
                                    <el-select style="display: block !important;"
                                               filterable
                                               v-model="scope.row.subjectId"
                                               @change="handleEditStateExam(scope.$index, scope.row)"
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
                                    :label="langConfig['score']">
                                <template slot-scope="scope">
                                    <el-input size="small" v-model="scope.row.score" type="number"
                                              :placeholder="langConfig['score']"
                                              @keyup.native="handleEditStateExam(scope.$index, scope.row)"
                                              @change.native="handleEditStateExam(scope.$index, scope.row)"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['grades']">
                                <template slot-scope="scope">
                                    <el-input size="small" v-model="scope.row.grade"
                                              :placeholder="langConfig['grades']" disabled
                                              @keyup.native="handleEditStateExam(scope.$index, scope.row)"
                                              @change="handleEditStateExam(scope.$index, scope.row)"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['gradePoint']">
                                <template slot-scope="scope">
                                    <el-input size="small" v-model="scope.row.gradePoint"
                                              :placeholder="langConfig['gradePoint']" disabled
                                              @keyup.native="handleEditStateExam(scope.$index, scope.row)"
                                              @change="handleEditStateExam(scope.$index, scope.row)"></el-input>
                                </template>
                            </el-table-column>
                            <el-table-column
                                    :label="langConfig['action']"
                                    width="120"
                            >
                                <template slot-scope="scope">
                                    <el-button type="primary" class="cursor-pointer" icon="el-icon-circle-plus"
                                               size="small"
                                               @click="handleAddStateExam()"

                                    ></el-button>
                                    <el-button type="danger" class="cursor-pointer" icon="el-icon-remove"
                                               size="small"
                                               @click="removeStateExam(scope.$index,scope.row)"
                                    ></el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                    </el-col>
                    <el-col :span="2">
                        <div>&nbsp;</div>
                    </el-col>
                    <el-col :span="5">
                        <el-form-item :label="langConfig['requiredCredit']" prop="requiredCredit">
                            <el-input v-model="inputTranscriptForm.requiredCredit" disabled></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="5">
                        <el-form-item :label="langConfig['isCompleted']" prop="isCompleted">
                            <el-switch
                                    v-model="inputTranscriptForm.isCompleted"
                                    active-color="#13ce66"
                                    inactive-color="#ff4949"
                            >
                            </el-switch>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer fix-dialog-footer"
            >
                <hr style="margin-top: 0px !important;">
                 <el-row>
                    <el-col :span="12" style="text-align: left !important;">
                        <el-button type="danger" @click="dialoginputTranscript= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">
                         <el-button type="primary" @click.native="saveTranscript"><i
                                 class="el-icon-circle-check"> </i>&nbsp; {{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                    </el-col>
                </el-row>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-sch'
    import {Sch_RegisterReact} from "../../collection/schRegister";

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
                Sch_RegisterReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                ref: "",
                fullscreen: true,
                dialoginputTranscript: false,
                disableUpdateField: false,
                schRegisterData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddSchRegister: false,
                dialogUpdateSchRegister: false,
                dialogUpdateSchRegisterToClass: false,
                studentList: [],
                levelList: [],
                programList: [],
                classList: [],
                majorList: [],
                promotionList: [],
                subjectList: [],
                yearList: [
                    {label: "1", value: 1},
                    {label: "2", value: 2},
                    {label: "3", value: 3},
                    {label: "4", value: 4},
                ],
                schRegisterForm: {
                    studentId: "",
                    levelId: "",
                    majorId: "",
                    programId: "",
                    promotionId: "",
                    term: "",
                    classId: "",
                    registerDate: "",
                    startClassDate: "",
                    _id: "",
                    note: ""

                },
                inputTranscriptForm: {
                    majorId: "",
                    curiculumnId: "",
                    culumnSemester1: [],
                    culumnSemester2: [],
                    studentName: "",
                    studentId: "",
                    registerId: "",
                    requiredCredit: 0,
                    transcriptId: "",
                    isCompleted: false
                },
                termList: [],
                rules: {
                    curiculumnId:
                        [{
                            required: true,
                            type: 'string',
                            message: 'Please choose Curriculumn',
                            trigger: 'change'
                        }],
                    registerDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input Register Date',
                        trigger: 'blur'
                    }],
                    studentId:
                        [{
                            required: true,
                            type: "string",
                            message: 'Please choose Student',
                            trigger: 'change'
                        }],
                    levelId:
                        [{
                            required: true,
                            type: "string",
                            message: 'Please choose Level',
                            trigger: 'change'
                        }],
                    promotionId:
                        [{
                            required: true,
                            type: "string",
                            message: 'Please choose Promotion',
                            trigger: 'change'
                        }],
                    majorId:
                        [{
                            required: true,
                            type: "string",
                            message: 'Please choose Major',
                            trigger: 'change'
                        }],
                    term:
                        [{
                            required: true,
                            type: "number",
                            message: 'Please choose term',
                            trigger: 'change'
                        }],
                    programId:
                        [{
                            required: true,
                            type: "string",
                            message: 'Please choose Program',
                            trigger: 'change'
                        }],
                },
                culumnData1: [
                    {year: "", subjectId: "", credit: 0, score: 0, grade: "Un Range", gradePoint: 0, ind: 1, sem: 1}
                ],
                culumnData2: [
                    {year: "", subjectId: "", credit: 0, score: 0, grade: "Un Range", gradePoint: 0, ind: 1, sem: 2}
                ],
                stateExam: [
                    {subjectId: "", score: 0, grade: "Un Range", gradePoint: 0}
                ],
                curiculumnList: [],
                mentionRange: [],
                disabledCuriculumn: false,
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
            "schRegisterForm.programId"(val) {
                this.majorOpt(val);
                if (this.ref !== "schRegisterFormUpdate") {
                    this.schRegisterForm.majorId = "";
                }
            },
            "schRegisterForm.majorId"(val) {
                this.levelOpt(val);
                if (this.ref !== "schRegisterFormUpdate") {
                    this.schRegisterForm.levelId = "";
                    this.ciriculumnOpt(val);

                }
            },

            "inputTranscriptForm.curiculumnId"(val) {

                if (this.inputTranscriptForm.transcriptId === "") {
                    this.findCuriculumnById(val);
                }
            },
            "schRegisterForm.levelId"(val) {
                let vm = this;
                if (val) {
                    Meteor.call("querySchLevelById", val, (err, result) => {
                        if (result) {
                            vm.termList = [];
                            for (let i = 1; i <= result.term; i++) {
                                if (result.term % i === 0) {
                                    vm.termList.push({label: i + " months", value: i});
                                }
                            }
                        }
                    })
                } else {
                    vm.termList = [];
                }
            },
            "schRegisterForm.classId"(val) {
                let vm = this;
                Meteor.call("querySchClassById", val, (err, result) => {
                    if (result) {
                        if (vm.schRegisterForm.startClassDate === "" || vm.schRegisterForm.startClassDate === undefined) {
                            vm.schRegisterForm.startClassDate = result.classDate;
                        }
                    }
                })
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
                Meteor.call('querySchRegister', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.schRegisterData = result.content;
                        this.count = result.countSchRegister;
                    }
                    this.isSearching = false;
                });
            }, 300),
            indexMethod(index) {
                return index + 1;
            },
            fetchUser() {
                Meteor.call("queryUserOption", (err, result) => {
                    this.applyUserOption = result;
                })
            },
            programOpt() {
                let selector = {};
                Meteor.call("queryProgramOption", selector, (err, result) => {
                    this.programList = result;
                })
            },
            majorOpt(val) {
                let selector = {};
                if (val) {
                    selector.programId = val;
                }
                Meteor.call("queryMajorOption", selector, (err, result) => {
                    this.majorList = result;
                })
            },
            promotionOpt() {
                let selector = {};
                Meteor.call("queryPromotionOption", selector, (err, result) => {
                    this.promotionList = result;
                })
            },
            classOpt(val) {
                let selector = {};
                if (val) {
                    selector.levelId = val;
                }
                Meteor.call("queryClassOption", selector, (err, result) => {
                    this.classList = result;
                })
            },
            levelOpt(val) {
                let selector = {};
                selector.majorId = val;
                Meteor.call("queryLevelOption", selector, (err, result) => {
                    this.levelList = result;
                })
            },
            ciriculumnOpt(val) {
                let selector = {};
                selector.majorId = val;
                Meteor.call('queryCiriculumnOption', selector, (err, result) => {
                    this.curiculumnList = result;
                })
            },
            studentOpt(query) {
                let vm = this;
                if (!!query) {
                    //vm.loading = true;
                    setTimeout(() => {
                        //vm.loading = false;
                        Meteor.call('querySchStudentOption', query, (err, result) => {
                            if (!err) {
                                vm.studentList = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('querySchStudentOption', "", (err, result) => {
                        if (!err) {
                            vm.studentList = result;
                        } else {
                            console.log(err.message);
                        }
                    })
                }
            },
            saveSchRegister(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["schRegisterFormAdd"].validate((valid) => {
                    if (valid) {
                        let schRegisterDoc = {
                            studentId: vm.schRegisterForm.studentId,
                            levelId: vm.schRegisterForm.levelId,
                            programId: vm.schRegisterForm.programId,
                            majorId: vm.schRegisterForm.majorId,
                            promotionId: vm.schRegisterForm.promotionId,
                            term: vm.schRegisterForm.term,
                            note: vm.schRegisterForm.note,
                            registerDate: vm.schRegisterForm.registerDate,
                            registerDateName: moment(vm.schRegisterForm.registerDate).format("DD/MM/YYYY"),
                            rolesArea: Session.get('area')
                        };
                        Meteor.call("insertSchRegister", schRegisterDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                vm.dialogAddSchRegister = false;

                                vm.$refs["schRegisterFormAdd"].resetFields();
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
            updateSchRegister() {
                let vm = this;
                this.$refs["schRegisterFormUpdate"].validate((valid) => {
                    if (valid) {
                        let schRegisterDoc = {
                            _id: vm.schRegisterForm._id,
                            studentId: vm.schRegisterForm.studentId,
                            levelId: vm.schRegisterForm.levelId,
                            programId: vm.schRegisterForm.programId,
                            majorId: vm.schRegisterForm.majorId,
                            promotionId: vm.schRegisterForm.promotionId,
                            term: vm.schRegisterForm.term,
                            registerDate: vm.schRegisterForm.registerDate,
                            registerDateName: moment(vm.schRegisterForm.registerDate).format("DD/MM/YYYY"),
                            classId: vm.schRegisterForm.classId,
                            note: vm.schRegisterForm.note,

                            startClassDate: vm.schRegisterForm.startClassDate,
                            rolesArea: Session.get('area')
                        };
                        Meteor.call("updateSchRegister", schRegisterDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `
                        Update
                        Successfully
                        !`,
                                    type: 'success'
                                });
                                vm.dialogUpdateSchRegister = false;
                                vm.dialogUpdateSchRegisterToClass = false;

                                vm.$refs["schRegisterFormUpdate"].resetFields();
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
            removeSchRegister(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeSchRegister", row._id, (err, result) => {
                        if (!err) {
                            rows.splice(index, 1);

                            vm.$message({
                                message: `
                        លុប បានជោគជ័យ`,
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
            findSchRegisterById(doc) {
                let vm = this;
                vm.schRegisterForm = {};
                Meteor.call("querySchRegisterById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.schRegisterForm._id = result._id;
                        vm.schRegisterForm = result;

                        vm.disableUpdateField = result.classId !== undefined ? true : false;
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
                this.schRegisterForm._id = "";
                if (this.$refs["schRegisterFormAdd"]) {
                    this.$refs["schRegisterFormAdd"].resetFields();
                }

                if (this.$refs["schRegisterFormUpdate"]) {
                    this.$refs["schRegisterFormUpdate"].resetFields();
                }

                this.inputTranscriptForm = {};
                this.inputTranscriptForm = {
                    majorId: "",
                    curiculumnId: "",
                    culumnSemester1: [],
                    culumnSemester2: [],
                    studentName: "",
                    studentId: "",
                    requiredCredit: "",
                    transcriptId: "",
                    isCompleted: false
                };
                this.culumnData1 = [
                    {year: "", subjectId: "", credit: 0, score: 0, grade: "Un Range", ind: 1, sem: 1}
                ];
                this.culumnData2 = [
                    {year: "", subjectId: "", credit: 0, score: 0, grade: "Un Range", ind: 1, sem: 2}
                ];
                this.stateExam = [
                    {subjectId: "", score: 0, grade: "Un Range"}
                ];

            },
            popupSchRegisterAdd() {
                this.ref = "schRegisterFormAdd";

                this.resetForm();
                this.studentOpt();
                this.programOpt();
                this.promotionOpt();

            },
            popupSchRegisterUpdate(row) {
                this.ref = "schRegisterFormUpdate";
                this.resetForm();
                this.studentOpt(row.studentDoc._id);
                this.levelOpt();
                this.majorOpt();
                this.programOpt();
                this.promotionOpt();

            },
            popupSchRegisterUpdateToClass(doc) {
                this.ref = "schRegisterFormUpdate";
                this.resetForm();
                this.studentOpt();
                this.programOpt();
                this.majorOpt();
                this.levelOpt();
                this.promotionOpt();
                this.classOpt(doc.levelId);
            },
            findCuriculumnById(id) {
                let vm = this;
                vm.inputTranscriptForm.isCompleted = false;
                Meteor.call("querySchCiriculumnById", id, (err, result) => {
                    if (result) {
                        let i = 1;
                        let j = 1;
                        let cul1Dif = 0;
                        let cul2Dif = 0;
                        vm.inputTranscriptForm.requiredCredit = result.requiredCredit;
                        vm.inputTranscriptForm.isCompleted = false;

                        result.culumnSemester1.map((obj) => {
                            if (cul1Dif !== obj.year) {
                                i = 1;
                            }
                            obj.score = 0;
                            obj.grade = "Un Range";
                            obj.gradePoint = 0;
                            obj.ind = i;
                            obj.sem = 1;
                            cul1Dif = obj.year;
                            i++;
                            return obj;
                        });
                        vm.culumnData1 = result.culumnSemester1;

                        result.culumnSemester2.map((obj) => {
                            if (cul2Dif !== obj.year) {
                                j = 1;
                            }
                            obj.score = 0;
                            obj.grade = "Un Range";
                            obj.gradePoint = 0;
                            obj.ind = j;
                            obj.sem = 2;

                            cul2Dif = obj.year;
                            j++;
                            return obj;
                        });
                        vm.culumnData2 = result.culumnSemester2;
                    }
                })
            },
            saveTranscript() {
                let vm = this;
                this.$refs["inputTranscriptForm"].validate((valid) => {
                    if (valid) {
                        let data = {};
                        data.studentId = vm.inputTranscriptForm.studentId;
                        data.majorId = vm.inputTranscriptForm.majorId;
                        data.registerId = vm.inputTranscriptForm.registerId;
                        data.curiculumnId = vm.inputTranscriptForm.curiculumnId;
                        data.culumnSemester1 = vm.culumnData1;
                        data.culumnSemester2 = vm.culumnData2;
                        let stateList = [];
                        this.stateExam.map((obj) => {
                            if (obj.subjectId) {
                                stateList.push(obj)
                            }
                        });
                        data.state = stateList;
                        data.requiredCredit = vm.inputTranscriptForm.requiredCredit;
                        data.isCompleted = vm.inputTranscriptForm.isCompleted;
                        data.rolesArea = Session.get('area');

                        Meteor.call("inputTranscript", data, (err, result) => {
                            if (result !== false) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['saveSuccess'],
                                    type: 'success'
                                });
                                vm.dialoginputTranscript = false;

                                vm.$refs["inputTranscriptForm"].resetFields();
                                vm.resetForm();
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
            removeCulumn1(index, row) {
                row.grade = "Un Range";
                row.gradePoint = 0;
                row.score = 0;
                this.culumnData1[index] = row;
                this.$message({
                    message: `លុប បានជោគជ័យ`,
                    type: 'success'
                });
            },

            handleAddCulumn1() {
                this.culumnData1.push(
                    {year: "", subjectId: "", credit: 0, grade: "Un Range", gradePoint: 0, ind: 1, sem: 1}
                )
            },
            handleEditCulumn1(index, row) {
                let gradeDoc = this.getMentionByScore(row.score);
                row.grade = gradeDoc.grade;
                row.gradePoint = gradeDoc.gradePoint;

                this.culumnData1[index] = row;
            },
            removeCulumn2(index, row) {
                row.grade = "Un Range";
                row.gradePoint = 0;
                row.score = 0;
                this.culumnData2[index] = row;
                this.$message({
                    message: `លុប បានជោគជ័យ`,
                    type: 'success'
                });
            },

            handleAddCulumn2() {
                this.culumnData2.push(
                    {year: "", subjectId: "", credit: 0, grade: "Un Range", gradePoint: 0}
                )
            },
            handleEditCulumn2(index, row) {
                let gradeDoc = this.getMentionByScore(row.score);
                row.grade = gradeDoc.grade;
                row.gradePoint = gradeDoc.gradePoint;
                this.culumnData2[index] = row;
            },

            removeStateExam(index, row) {
                if (this.stateExam.length > 1) {
                    this.stateExam.splice(index, 1);
                    this.$message({
                        message: `លុប បានជោគជ័យ`,
                        type: 'success'
                    });
                } else {
                    this.stateExam = [
                        {subjectId: "", score: 0, grade: "Un Range"}
                    ];
                }
            },

            handleAddStateExam() {
                this.stateExam.push(
                    {subjectId: "", score: 0, grade: "Un Range"}
                )
            },
            handleEditStateExam(index, row) {
                let gradeDoc = this.getMentionByScore(row.score);
                row.grade = gradeDoc.grade;
                row.gradePoint = gradeDoc.gradePoint;

                this.stateExam[index] = row;
            },
            subjectOpt() {
                let selector = {};
                Meteor.call('querySubjectOption', selector, (err, result) => {
                    this.subjectList = result;
                })
            },
            popUpInputTranscript(data) {
                let vm = this;
                vm.ref = "inputTranscriptForm";
                this.majorOpt();
                vm.resetForm();
                Meteor.call("querySchStudentById", data.studentId, (err, res) => {
                    if (res) {
                        this.inputTranscriptForm.studentName = res.personal.name;
                        this.inputTranscriptForm.studentId = data.studentId;
                        this.inputTranscriptForm.majorId = data.majorId;
                        this.inputTranscriptForm.registerId = data._id;
                        this.inputTranscriptForm.requiredCredit = res.requiredCredit;
                        this.ciriculumnOpt(data.majorId);

                        this.inputTranscriptForm.isCompleted = false;
                        this.ciriculumnOpt(data.majorId);
                        vm.inputTranscriptForm.transcriptId = "";
                        vm.disabledCuriculumn = false;
                        Meteor.call("queryTranscriptByStudentIdMajorId", res._id, data.majorId, (err, result) => {
                            if (result) {
                                vm.inputTranscriptForm.curiculumnId = result.curiculumnId;
                                vm.inputTranscriptForm.transcriptId = result._id;
                                vm.inputTranscriptForm.requiredCredit = result.requiredCredit;
                                vm.inputTranscriptForm.isCompleted = result.isCompleted;

                                vm.culumnData1 = result.culumnSemester1;
                                vm.culumnData2 = result.culumnSemester2;
                                if (result.state.length > 0) {
                                    vm.stateExam = result.state;
                                } else {
                                    vm.stateExam = [
                                        {subjectId: "", score: 0, grade: "Un Range"}
                                    ];
                                }
                                vm.disabledCuriculumn = true;
                            }
                        });
                    }
                });

            },
            getMention() {
                Meteor.call("querySchMentionByActive", Session.get("area"), (err, result) => {
                    if (result) {
                        this.mentionRange = result.range;
                    }
                });
            },
            getMentionByScore(val) {
                val = parseFloat(val) || 0;

                function checkMention(range) {
                    return range.from <= val && range.to > val;
                }

                let data = this.mentionRange.find(checkMention);
                if (data === null || data === undefined) {
                    let newData = {};
                    newData.grade = "Un Range";
                    newData.gradePoint = 0;
                    return newData;
                }
                return data;
            },
            printTranscript(data) {
                FlowRouter.go('/sch-data/schTranscript/print?studentId=' + data.studentId + '&majorId=' + data.majorId);
            }
        },
        created() {
            this.isSearching = true;
            this.fetchUser();
            this.queryData();
            this.getMention();
            this.subjectOpt();
            Meteor.subscribe('Sch_RegisterReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['register'];
                return data;
            }
        }
    }
</script>