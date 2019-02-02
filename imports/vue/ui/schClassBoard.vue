<template>
    <div class="sch_classBoard">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="5">
                    <h2>
                        <a class="cursor-pointer" @click="dialogAddSchClass = true,resetForm()">
                            {{langConfig['title']}}
                        </a>
                    </h2>
                </el-col>

                <el-col :span="5">
                    <h4>
                        <el-select style="display: block !important;width: 100% !important;"
                                   filterable
                                   clearable
                                   v-model="facultyBoardId"
                                   :placeholder="langConfig['faculty']">
                            <el-option
                                    v-for="item in facultyBoardList"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                    :disabled="item.disabled">
                            </el-option>
                        </el-select>
                    </h4>
                </el-col>
                <el-col :span="2">
                    <div></div>
                </el-col>
                <el-col :span="5">
                    <h4>
                        <el-select style="display: block !important;width: 100% !important;"
                                   filterable
                                   v-model="majorBoardId"
                                   clearable
                                   :placeholder="langConfig['major']">
                            <el-option
                                    v-for="item in majorBoardList"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                    :disabled="item.disabled">
                            </el-option>
                        </el-select>
                    </h4>
                </el-col>
                <el-col :span="8" style="text-align: right; margin-right: 10px">
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
                <el-row type="flex" class="row-bg" justify="center">
                    <el-col :span="24" style="text-align: center;">
                        <div class="block">
                            <el-pagination @size-change="handleSizeChange" background @current-change="handleCurrentChange"
                                           :current-page.sync="currentPage" :page-sizes="[12,24, 48, 96,192]"
                                           :page-size="currentSize"
                                           layout="total, sizes, prev, pager, next, jumper" :total="count">
                            </el-pagination>
                        </div>
                    </el-col>
                </el-row>
                <br>
                <div style="margin-top: 20px; height: 100px;">
                    <el-row>
                        <el-col style="padding-bottom: 40px !important;" :span="5" v-for="(d, index) in schClassData"
                                :key="d._id"
                                :offset="index > 0 ? index%4===0 ? 0 : 1 : 0">
                            <el-card :body-style="{ padding: '0px' }" @dblclick.native="popUpSchAddStudentToClass(d)">
                                <transition v-show=true name="el-zoom-in-center">
                                    <div class="transition-box">
                                        {{d.name}}<br> <span
                                            style="float: left !important;"> <i
                                            class="material-icons">group</i> &nbsp;<span
                                            style="padding-top: 12px !important;">{{d.classTableDoc && d.classTableDoc.studentList &&d.classTableDoc.studentList.length || 0}}</span>
                                        </span><span
                                            style="float: right !important;bottom: 0px !important;padding-top: 12px !important;">{{langConfig['code']}} : {{d.code || ""}}</span>
                                    </div>
                                </transition>
                                <div style="padding: 14px;">
                                    <span><b>{{langConfig['teacher']}} : </b>{{d.teacherDoc && d.teacherDoc.personal.name || ""}} ({{d.teacherDoc && d.teacherDoc.personal.phoneNumber || ""}})</span>
                                    <div class="bottom clearfix">
                                        <time class="time" style="float: left !important;"><b>{{langConfig['startClassDate']}}
                                            :</b> {{
                                            d.classDate |
                                            momentFormat}}
                                        </time>
                                        <br>
                                        <div style="float: left !important;">
                                            <b>{{langConfig['level']}} :</b> {{d.levelDoc && d.levelDoc.code || ""}}
                                            {{d.levelDoc &&
                                            d.levelDoc.name ||
                                            ""}}
                                        </div>
                                        <br>
                                        <div style="float: left !important;">
                                            <b>{{langConfig['time']}} : </b>{{d.timeDoc && d.timeDoc.name|| ""}}
                                        </div>
                                        <el-button type="text" class="button" style="float: right !important;">
                                            <el-button type="success" icon="el-icon-circle-close-outline"
                                                       @click="closeSchClass(index,d,schClassData)"
                                                       circle></el-button>
                                        </el-button>
                                    </div>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </div>
                <div>
                    <span></span>
                </div>
                <!--Pagination-->
                <br>

            </slot>
            <!--End Pagination-->
        </div>

        <el-dialog
                @close="handleCloseModal"
                :title="langConfig['studentClass']"
                :visible.sync="dialogAddSchStudentToClass"
                :fullscreen="fullScreen"
                class="dialogSchStudentToClass"

        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schAddStudentToClass" :rules="rules" ref="schAddStudentToClass" label-width="120px"
                     :label-schition="labelPosition"
                     class="schAddStudentToClass">
                <el-tabs :tab-position="tabPosition" style="min-height: 200px;">
                    <el-tab-pane :label="langConfig['student']">
                        <template>

                            <el-card class="box-card">
                                <div slot="header" class="clearfix">
                                    <span><b>{{langConfig['class']}} : {{className}}</b>({{classDate}})</span><br><br>
                                    <span><b>{{langConfig['teacher']}} : {{teacher}}</b>({{teacherPhoneNumber}})</span><br><br>
                                    <span><b>{{langConfig['code']}} : {{code}}</b></span>
                                </div>
                                <el-table
                                        ref="multipleTable"
                                        :data="studentList"
                                        style="width: 100%">
                                    <el-table-column
                                            type="index"
                                            width="50">
                                    </el-table-column>
                                    <el-table-column
                                            property="studentDoc.personal.name"
                                            :label="langConfig['name']"
                                    >
                                    </el-table-column>
                                    <el-table-column
                                            property="studentDoc.personal.gender"
                                            :label="langConfig['gender']"
                                    >
                                    </el-table-column>
                                    <el-table-column
                                            property="studentDoc.personal.dobName"
                                            :label="langConfig['dob']"
                                    >
                                    </el-table-column>

                                    <el-table-column
                                            property="studentDoc.personal.phoneNumber"
                                            :label="langConfig['phoneNumber']"
                                            show-overflow-tooltip>
                                    </el-table-column>
                                    <el-table-column
                                            prop="status"
                                            :label="langConfig['status']"
                                            width="150"
                                            filter-placement="bottom-end">
                                        <template slot-scope="scope">
                                            <el-tag
                                                    :type="scope.row.studentList.status === 'Active' ? 'warning'  : scope.row.studentList.status === 'Graduated'? 'success': scope.row.studentList.status === 'Suspend' ? 'info':  scope.row.studentList.status === 'Pass'? 'primary':'danger'"
                                                    close-transition>{{scope.row.studentList.status}}
                                            </el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                            :label="langConfig['action']"
                                            width="180"
                                    >
                                        <template slot-scope="scope">


                                            <el-button-group>

                                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete"
                                                           size="small"
                                                           @click="removeSchStudentFromClass(scope.row.studentList.classId,scope.row.studentList.studentId)"
                                                ></el-button>
                                                <el-button type="primary" icon="el-icon-edit" size="small"
                                                           class="cursor-pointer"
                                                           @click="dialogUpdateStatusStudent=true,popUpUpdateStaus(scope.row.studentList)"
                                                ></el-button>

                                                <el-button type="primary" icon="el-icon-d-caret" size="small"
                                                           class="cursor-pointer"
                                                           @click="dialogUpdatePromotionStudent=true,popUpUpdatePromotion(scope.row.studentList)"
                                                ></el-button>
                                            </el-button-group>

                                        </template>
                                    </el-table-column>
                                </el-table>

                            </el-card>

                        </template>
                    </el-tab-pane>
                    <el-tab-pane :label="langConfig['promote']">
                        <template>

                            <el-card class="box-card">
                                <div slot="header" class="clearfix">

                                    <div style="margin-top: 20px">
                                        <el-button type="danger" round style="float: right !important;"
                                                   @click="popUpUnPromoteToClass()">
                                            {{langConfig['unPromoteToClass']}}
                                        </el-button>
                                        <el-button type="primary" round style="float: right !important;"
                                                   @click="popUpPromoteToClass()">
                                            {{langConfig['promote']}}
                                        </el-button>
                                        <el-button type="success" round style="float: right !important;"
                                                   @click="popUpPromoteToGraduated()">
                                            {{langConfig['promoteToGraduated']}}
                                        </el-button>
                                        <span><b>{{langConfig['class']}} : {{className}}</b>({{classDate}})</span><br><br>
                                        <span><b>{{langConfig['teacher']}} : {{teacher}}</b>({{teacherPhoneNumber}})</span><br><br>
                                        <span><b>{{langConfig['code']}} : {{code}}</b></span>
                                    </div>
                                </div>
                                <el-table
                                        ref="multipleTableNotPromote"
                                        :data="studentListNotPromote"
                                        style="width: 100%"
                                        @selection-change="handleSelectionChangeNotPromote">
                                    <el-table-column
                                            type="selection"
                                            width="55">
                                    </el-table-column>
                                    <el-table-column
                                            type="index"
                                            width="50">
                                    </el-table-column>

                                    <el-table-column
                                            property="studentDoc.personal.name"
                                            :label="langConfig['name']"
                                    >
                                    </el-table-column>
                                    <el-table-column
                                            property="studentDoc.personal.gender"
                                            :label="langConfig['gender']"
                                    >
                                    </el-table-column>
                                    <el-table-column
                                            property="studentDoc.personal.dobName"
                                            :label="langConfig['dob']"
                                    >
                                    </el-table-column>

                                    <el-table-column
                                            property="studentDoc.personal.phoneNumber"
                                            :label="langConfig['phoneNumber']"
                                            show-overflow-tooltip>
                                    </el-table-column>
                                    <el-table-column
                                            prop="status"
                                            :label="langConfig['status']"
                                            width="150"
                                            filter-placement="bottom-end">
                                        <template slot-scope="scope">
                                            <el-tag
                                                    :type="scope.row.studentList.status === 'Active' ? 'warning'  : scope.row.studentList.status === 'Graduated'? 'success': scope.row.studentList.status === 'Suspend' ? 'info':  scope.row.studentList.status === 'Pass'? 'primary':'danger'"
                                                    close-transition>{{scope.row.studentList.status}}
                                            </el-tag>
                                        </template>
                                    </el-table-column>

                                </el-table>
                            </el-card>
                        </template>
                    </el-tab-pane>
                    <el-tab-pane :label="langConfig['alreadyPromote']">
                        <template>
                            <el-card class="box-card">
                                <div slot="header" class="clearfix">

                                    <div style="margin-top: 20px">
                                        <span><b>{{langConfig['class']}} : {{className}}</b>({{classDate}})</span><br><br>
                                        <span><b>{{langConfig['teacher']}} : {{teacher}}</b>({{teacherPhoneNumber}})</span><br><br>
                                        <span><b>{{langConfig['code']}} : {{code}}</b></span>
                                    </div>
                                </div>
                                <el-table
                                        ref="multipleTableAlreadyPromote"
                                        :data="studentListPromote"
                                        style="width: 100%"
                                        @selection-change="handleSelectionChangeAlreadyPromote">
                                    <el-table-column
                                            type="index"
                                            width="50">
                                    </el-table-column>

                                    <el-table-column
                                            property="studentDoc.personal.name"
                                            :label="langConfig['name']"
                                    >
                                    </el-table-column>
                                    <el-table-column
                                            property="studentDoc.personal.gender"
                                            :label="langConfig['gender']"
                                    >
                                    </el-table-column>
                                    <el-table-column
                                            property="studentDoc.personal.dobName"
                                            :label="langConfig['dob']"
                                    >
                                    </el-table-column>

                                    <el-table-column
                                            property="studentDoc.personal.phoneNumber"
                                            :label="langConfig['phoneNumber']"
                                            show-overflow-tooltip>
                                    </el-table-column>
                                    <el-table-column
                                            property="newClassDoc.name"
                                            :label="langConfig['class']"
                                            show-overflow-tooltip>
                                    </el-table-column>
                                    <el-table-column
                                            prop="status"
                                            :label="langConfig['status']"
                                            width="150"
                                            filter-placement="bottom-end">
                                        <template slot-scope="scope">
                                            <el-tag
                                                    :type="scope.row.studentList.status === 'Active' ? 'warning'  : scope.row.studentList.status === 'Graduated'? 'success': scope.row.studentList.status === 'Suspend' ? 'info':  scope.row.studentList.status === 'Pass'? 'primary':'danger'"
                                                    close-transition>{{scope.row.studentList.status}}
                                            </el-tag>
                                        </template>
                                    </el-table-column>
                                </el-table>

                            </el-card>

                        </template>
                    </el-tab-pane>
                </el-tabs>
                <!--<el-row :gutter="20">
                    <el-transfer
                            filterable
                            :filter-method="filterMethod"
                            :titles="['Source', 'Target']"
                            filter-placeholder="State Abbreviations"
                            v-model="schAddStudentToClass.value"
                            :data="studentList">
                    </el-transfer>
                    &lt;!&ndash;</el-card>&ndash;&gt;
                </el-row>-->
            </el-form>
            <!--<span slot="footer" class="dialog-footer fix-dialog-footer"
            >
                <hr style="margin-top: 0px !important;">
                <el-row>
                    <el-col :span="12" style="text-align: left !important;">
                        <el-button type="danger"
                                   @click.native="dialogAddSchStudentToClass= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">
                        <el-button type="primary" @click.native="saveSchStudentToClass(true,$event,false)"><i
                                class="el-icon-check"> </i>&nbsp; {{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>

                    </el-col>
                </el-row>
            </span>-->
        </el-dialog>
        <el-dialog
                :title="langConfig['promoteToClass']"
                :visible.sync="dialogPromoteToClass"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schPromoteToClassForm" :rules="rules" :ref="ref" label-width="120px"
                     class="schPromoteToClassForm">
                <h4 style="color: green; text-align: center;"> សិស្ស <b style="color: black !important;">{{numSelectStudentPromoted}}</b>
                    នាក់ បានឡើងថ្នាក់
                    ដោយជោគជ័យ!</h4>
                <hr style="margin-top: 0px !important;">
                <el-form-item :label="langConfig['program']" prop="programId">
                    <el-select style="display: block !important;"
                               filterable
                               disabled
                               v-model="schPromoteToClassForm.programId"
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
                               disabled
                               v-model="schPromoteToClassForm.majorId"
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
                               v-model="schPromoteToClassForm.levelId"
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
                <el-form-item :label="langConfig['class']" prop="classId">
                    <el-select style="display: block !important;"
                               filterable
                               v-model="schPromoteToClassForm.classId"
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
                <!--<el-form-item :label="langConfig['promotion']" prop="promotionId">
                    <el-select style="display: block !important;"
                               filterable
                               v-model="schPromoteToClassForm.promotionId"
                               :placeholder="langConfig['chooseItem']">
                        <el-option
                                v-for="item in promotionList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>-->
                <el-form-item :label="langConfig['startClassDate']" prop="startClassDate">
                    <el-date-picker
                            v-model="schPromoteToClassForm.startClassDate"
                            type="date"
                            style="width: 100%;"
                            placeholder="Pick a day"
                    >
                    </el-date-picker>
                </el-form-item>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogPromoteToClass= false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="savePromoteToClass($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <el-dialog
                :title="langConfig['unPromoteToClass']"
                :visible.sync="dialogUnPromoteToClass"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schUnPromoteToClassForm" :rules="rules" :ref="ref" label-width="120px"
                     class="schUnPromoteToClassForm">
                <h4 style="color: green; text-align: center;"> សិស្ស <b style="color: black !important;">{{numSelectStudentPromoted}}</b>
                    នាក់ ធ្លាក់ ត្រូវត្រួតថ្នាក់!</h4>
                <hr style="margin-top: 0px !important;">
                <el-form-item :label="langConfig['program']" prop="programId">
                    <el-select style="display: block !important;"
                               filterable
                               disabled
                               v-model="schUnPromoteToClassForm.programId"
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
                               disabled
                               v-model="schUnPromoteToClassForm.majorId"
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
                               disabled
                               v-model="schUnPromoteToClassForm.levelId"
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
                <el-form-item :label="langConfig['class']" prop="classId">
                    <el-select style="display: block !important;"
                               filterable
                               v-model="schUnPromoteToClassForm.classId"
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
                <!--<el-form-item :label="langConfig['promotion']" prop="promotionId">
                    <el-select style="display: block !important;"
                               filterable
                               v-model="schUnPromoteToClassForm.promotionId"
                               :placeholder="langConfig['chooseItem']">
                        <el-option
                                v-for="item in promotionList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>-->
                <el-form-item :label="langConfig['startClassDate']" prop="startClassDate">
                    <el-date-picker
                            v-model="schUnPromoteToClassForm.startClassDate"
                            type="date"
                            style="width: 100%;"
                            placeholder="Pick a day"
                    >
                    </el-date-picker>
                </el-form-item>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUnPromoteToClass= false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="saveUnPromoteToClass">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>

        <el-dialog
                :title="langConfig['promoteToGraduated']"
                :visible.sync="dialogPromoteToGraduated"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schPromoteToGraduatedForm" :rules="rules" :ref="ref" label-width="120px"
                     class="schPromoteToClassForm">

                <h3 style="color: green">សិស្ស <b style="color: black !important;">{{numSelectStudentPromoted}}</b> នាក់
                    បញ្ចប់ការសិក្សាបាន ដោយជោគជ័យ!
                </h3>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogPromoteToGraduated= false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="savePromoteToGraduated($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>

        <el-dialog
                :title="langConfig['updateStatusStudent']"
                :visible.sync="dialogUpdateStatusStudent"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="updateStatusStudentForm" :rules="rulesUpdateStatus" :ref="ref" label-width="120px"
                     class="schPromoteToClassForm">
                <el-form-item :label="langConfig['status']" prop="statusId">
                    <el-select style="display: block !important;"
                               filterable
                               v-model="updateStatusStudentForm.statusId"
                               :placeholder="langConfig['chooseItem']">
                        <el-option
                                v-for="item in statusList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdateStatusStudent= false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    <el-button type="primary" @click="saveUpdateStatusStudent($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i>
                    </el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>

        <el-dialog
                :title="langConfig['updatePromotionStudent']"
                :visible.sync="dialogUpdatePromotionStudent"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="updatePromotionStudentForm" :rules="rulesUpdatePromotion" :ref="ref" label-width="120px"
                     class="schPromoteToClassForm">
                <el-form-item :label="langConfig['promotion']" prop="promotionId">
                    <el-select style="display: block !important;"
                               filterable
                               v-model="updatePromotionStudentForm.promotionId"
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
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdatePromotionStudent= false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="saveUpdatePromotionStudent($event)">{{langConfig['save']}} <i>(Ctrl + Enter)</i>
                    </el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>

    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-sch'
    import {Sch_ClassTableReact} from "../../collection/schClassTable";

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
                Sch_ClassTableReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {

            /*const generateStudentList = _ => {
                const data = [];
                const states = ['California', 'Illinois', 'Maryland', 'Texas', 'Florida', 'Colorado', 'Connecticut '];
                const initials = ['CA', 'IL', 'MD', 'TX', 'FL', 'CO', 'CT'];
                states.forEach((city, index) => {
                    data.push({
                        label: city,
                        key: index,
                        initial: initials[index]
                    });
                });
                return data;
            };*/
            return {
                dialogPromoteToGraduated: false,
                dialogUnPromoteToClass: false,
                dialogUpdateStatusStudent: false,
                dialogUpdatePromotionStudent: false,
                tabPosition: 'left',
                fullScreen: true,
                ref: "",
                labelPosition: top,
                schClassData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 12,
                count: 0,
                dialogAddSchStudentToClass: false,
                dialogPromoteToClass: false,
                schClassForm: {
                    name: "",
                    khName: "",
                    code: "",
                    desc: "",
                    _id: "",
                    teacherId: "",
                    programId: "",
                    status: false
                },
                schPromoteToClassForm: {
                    levelId: "",
                    majorId: "",
                    programId: "",
                    classId: "",

                    startClassDate: ""
                },
                schUnPromoteToClassForm: {
                    levelId: "",
                    majorId: "",
                    programId: "",
                    classId: "",

                    startClassDate: ""

                },
                updateStatusStudentForm: {
                    statusId: "",
                    classId: "",
                    studentId: "",
                    programId: "",
                    levelId: "",
                    majorId: ""
                },
                updatePromotionStudentForm: {
                    statusId: "",
                    classId: "",
                    studentId: "",
                    programId: "",
                    levelId: "",
                    majorId: ""
                },
                schPromoteToGraduatedForm: {},
                schAddStudentToClass: {
                    value: []
                },
                statusList: [
                    {label: "Active", value: "Active"},
                    {label: "Suspend", value: "Suspend"},
                    {label: "Dropout", value: "Dropout"}
                ],
                teacherList: [],
                levelList: [],
                programList: [],
                promotionList: [],
                classList: [],
                majorList: [],
                facultyBoardList: [],
                majorBoardList: [],
                rules: {},
                studentList: [],
                studentListNotPromote: [],
                studentListPromote: [],
                multipleSelectionAlreadyPromote: [],
                multipleSelectionNotPromote: [],

                className: "",
                code: "",
                teacher: "",
                teacherPhoneNumber: "",
                classDate: "",
                programId: "",
                programName: "",
                majorId: "",
                majorName: "",
                levelName: "",
                oldClassId: "",
                facultyBoardId: "",
                majorBoardId: "",
                numSelectStudentPromoted: 0,
                rulesUpdateStatus: {
                    statusId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose status',
                        trigger: 'change'
                    }],
                },
                rulesUpdatePromotion: {
                    promotionId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Scholarship',
                        trigger: 'change'
                    }],
                },
                skip: 0
            }

        }
        ,
        watch: {
            currentSize(val) {
                this.isSearching = true;
                this.skip = (this.currentPage - 1) * val;
                this.queryData(this.searchData, this.skip, val + this.skip);
            }
            ,
            currentPage(val) {
                this.isSearching = true;
                this.skip = (val - 1) * this.currentSize;
                this.queryData(this.searchData, this.skip, this.currentSize + this.skip);
            }
            ,
            searchData(val) {
                this.isSearching = true;
                this.skip = (this.currentPage - 1) * this.currentSize;
                this.queryData(val, this.skip, this.currentSize + this.skip);
            },
            "schPromoteToClassForm.programId"(val) {
                this.majorOpt(val);
                /*if (this.ref !== "promoteToClass") {
                    this.schPromoteToClassForm.majorId = "";
                }*/
            },
            "schPromoteToClassForm.majorId"(val) {
                this.levelOpt(val);
                if (this.ref !== "promoteToClass") {
                    this.schPromoteToClassForm.levelId = "";
                }
            },
            "schPromoteToClassForm.levelId"(val) {
                let vm = this;
                vm.classOpt(val);
                if (vm.ref === "promoteToClass") {
                    vm.schPromoteToClassForm.classId = "";
                }
            },
            "schPromoteToClassForm.classId"(val) {
                let vm = this;
                Meteor.call("querySchClassById", val, (err, result) => {
                    if (result) {
                        if (vm.schPromoteToClassForm.startClassDate === "" || vm.schPromoteToClassForm.startClassDate === undefined) {
                            vm.schPromoteToClassForm.startClassDate = result.classDate;
                        }
                    }
                })
            },
            "schUnPromoteToClassForm.classId"(val) {
                let vm = this;
                Meteor.call("querySchClassById", val, (err, result) => {
                    if (result) {
                        if (vm.schUnPromoteToClassForm.startClassDate === "" || vm.schUnPromoteToClassForm.startClassDate === undefined) {
                            vm.schUnPromoteToClassForm.startClassDate = result.classDate;
                        }
                    }
                })
            },
            "facultyBoardId"(val) {
                this.majorBoardOpt(val);
                this.facultyBoardId = val;
                this.majorBoardId = "";
                this.queryData();

            },
            "majorBoardId"(val) {
                this.majorBoardId = val;
                this.queryData();

            }
        }
        ,
        methods: {
            handleSizeChange(val) {
                this.currentSize = val;
            }
            ,
            handleCurrentChange(val) {
                this.currentPage = val;
            }
            ,
            handleCloseModal() {

                this.resetForm();
                this.refForm = "";
            }
            ,
            queryData: _.debounce(function (val, skip, limit) {
                let vm = this;
                Meteor.call('querySchClassBoard', {
                    q: val,
                    filter: vm.filter,
                    faculty: vm.facultyBoardId,
                    major: vm.majorBoardId,
                    options: {skip: skip || 0, limit: limit || 12}
                }, (err, result) => {
                    if (!err) {
                        this.schClassData = result.content;
                        this.count = result.countSchClass;
                    }
                    this.isSearching = false;
                });
            }, 300),


            findSchClassById(doc) {
                let vm = this;
                vm.schClassForm = {};
                Meteor.call("querySchClassById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.schClassForm._id = result._id;
                        vm.schClassForm = result;
                    }
                })
            }
            ,
            cancel() {
                this.$message({
                    type: 'info',
                    message: 'Canceled'
                });
            }
            ,
            programOpt() {
                let selector = {};
                Meteor.call("queryProgramOption", selector, (err, result) => {
                    this.programList = result;
                })
            },
            promotionOpt() {
                let selector = {};
                Meteor.call("queryPromotionOption", selector, (err, result) => {
                    this.promotionList = result;
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
            majorBoardOpt(val) {
                let selector = {};
                selector.facultyId = val;
                Meteor.call("queryMajorOption", selector, (err, result) => {
                    this.majorBoardList = result;
                })
            },
            facultyBoardOpt() {
                let selector = {};
                Meteor.call("queryFacultyOption", selector, (err, result) => {
                    this.facultyBoardList = result;
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
            closeSchClass(index, row, rows) {
                let vm = this;
                this.$confirm('This will end your class. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("updateSchClassById", row._id, (err, result) => {
                        if (!err) {
                            rows.splice(index, 1);

                            vm.$message({
                                message: `
                        បិទថ្នាក់ បានជោគជ័យ`,
                                type: 'success'
                            });


                        } else {
                            vm.$message({
                                type: 'error',
                                message: 'Close Failed'
                            });
                        }

                    })

                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: 'Delete canceled'
                    });
                });


            }
            ,
            popUpSchAddStudentToClass(doc) {
                this.dialogAddSchStudentToClass = true;
                this.className = doc.name || "";
                this.oldClassId = doc._id || "";
                this.code = doc.code || "";
                this.programName = doc.programDoc && doc.programDoc.name || "";
                this.programId = doc.programDoc && doc.programDoc._id || "";

                this.majorName = doc.majorDoc && doc.majorDoc.name || "";
                this.majorId = doc.majorDoc && doc.majorDoc._id || "";

                this.levelName = doc.levelDoc && doc.levelDoc.name || "";

                this.teacher = doc.teacherDoc && doc.teacherDoc.personal.name || "";
                this.teacherPhoneNumber = doc.teacherDoc && doc.teacherDoc.personal.phoneNumber;
                this.classDate = moment(doc.classDate).format("DD/MM/YYYY");

                this.schPromoteToClassForm.programId = doc.programDoc && doc.programDoc._id || "";
                this.schPromoteToClassForm.majorId = doc.majorDoc && doc.majorDoc._id || "";

                this.schUnPromoteToClassForm.programId = doc.programDoc && doc.programDoc._id || "";
                this.schUnPromoteToClassForm.majorId = doc.majorDoc && doc.majorDoc._id || "";
                this.schUnPromoteToClassForm.levelId = doc.levelDoc && doc.levelDoc._id || "";

                this.generateStudentList(doc);
            }
            ,
            generateStudentList(classDoc) {
                Meteor.call("queryStudentByClassId", classDoc._id, (err, result) => {
                    this.studentList = [];
                    this.studentListNotPromote = [];
                    this.studentListPromote = [];
                    if (!err && result.data && result.data.length > 0 && result.data[0].studentDoc) {
                        this.studentList = result.data;
                        this.studentListNotPromote = result.dataNotPromote;
                        this.studentListPromote = result.dataPromote;
                    }
                })
            }
            ,
            filterMethod(query, item) {
                return item.label.toLowerCase().indexOf(query.toLowerCase()) > -1;
            }
            ,
            resetForm() {
                this.schAddStudentToClass = {
                    value: []
                }
            }
            ,
            saveSchStudentToClass(isCloseDialog, event, isPrint) {
                event.preventDefault();
            },
            toggleSelection(rows) {
                if (rows) {
                    rows.forEach(row => {
                        this.$refs.multipleTable.toggleRowSelection(row);
                    });
                } else {
                    this.$refs.multipleTable.clearSelection();
                }
            },
            handleSelectionChangeAlreadyPromote(val) {
                this.multipleSelectionAlreadyPromote = val;
            },
            handleSelectionChangeNotPromote(val) {
                this.multipleSelectionNotPromote = val;
            },
            savePromoteToClass(event) {
                event.preventDefault();

                let vm = this;
                let data = {};
                data.studentList = this.multipleSelectionNotPromote;
                let promoteToClassDoc = {
                    levelId: vm.schPromoteToClassForm.levelId,
                    majorId: vm.schPromoteToClassForm.majorId,
                    programId: vm.schPromoteToClassForm.programId,
                    classId: vm.schPromoteToClassForm.classId,
                    startClassDate: vm.schPromoteToClassForm.startClassDate,
                    rolesArea: Session.get('area')
                };
                data.classFormDoc = promoteToClassDoc;
                let oldClassDoc = {};
                oldClassDoc._id = this.oldClassId;
                Meteor.call("addPromoteToClass", data, (err, result) => {
                    if (result) {
                        vm.$message({
                            message: `សិស្សឡើងថ្នាក់បានជោគជ័យ`,
                            type: 'success'
                        });
                        vm.generateStudentList(oldClassDoc);
                        vm.dialogPromoteToClass = false;
                    } else {
                        vm.$message({
                            type: 'error',
                            message: err.message
                        });
                        vm.generateStudentList(oldClassDoc);

                    }
                })

            },
            saveUnPromoteToClass(event) {
                event.preventDefault();

                let vm = this;
                let data = {};
                data.studentList = this.multipleSelectionNotPromote;
                let unPromoteToClassDoc = {
                    levelId: vm.schUnPromoteToClassForm.levelId,
                    majorId: vm.schUnPromoteToClassForm.majorId,
                    programId: vm.schUnPromoteToClassForm.programId,
                    classId: vm.schUnPromoteToClassForm.classId,
                    startClassDate: vm.schUnPromoteToClassForm.startClassDate,
                    rolesArea: Session.get('area')
                };
                data.classFormDoc = unPromoteToClassDoc;
                let oldClassDoc = {};
                oldClassDoc._id = this.oldClassId;
                Meteor.call("addUnPromoteToClass", data, (err, result) => {
                    if (result) {
                        vm.$message({
                            message: `សិស្សត្រួតថ្នាក់`,
                            type: 'success'
                        });
                        vm.generateStudentList(oldClassDoc);
                        vm.dialogUnPromoteToClass = false;
                    } else {
                        vm.$message({
                            type: 'error',
                            message: err.message
                        });
                        vm.generateStudentList(oldClassDoc);

                    }
                })

            },
            savePromoteToGraduated(event) {
                event.preventDefault();

                let vm = this;
                let data = {};
                data.studentList = this.multipleSelectionNotPromote;
                let oldClassDoc = {};
                oldClassDoc._id = this.oldClassId;
                Meteor.call("addPromoteToGraduated", data, (err, result) => {
                    if (!err) {
                        vm.$message({
                            message: `សិស្សបញ្ចប់ការសិក្សាបានជោគជ័យ`,
                            type: 'success'
                        });
                        vm.generateStudentList(oldClassDoc);

                        vm.dialogPromoteToGraduated = false;
                    } else {
                        vm.generateStudentList(oldClassDoc);
                        vm.$message({
                            type: 'error',
                            message: err.message
                        });
                    }
                })

            },
            saveUpdateStatusStudent(event) {
                event.preventDefault();

                let vm = this;
                let data = {};
                data.classId = this.updateStatusStudentForm.classId;
                data.studentId = this.updateStatusStudentForm.studentId;
                data.programId = this.updateStatusStudentForm.programId;
                data.levelId = this.updateStatusStudentForm.levelId;
                data.majorId = this.updateStatusStudentForm.majorId;
                let oldClassDoc = {};
                oldClassDoc._id = data.classId;
                this.$refs["updateStatusStudent"].validate((valid) => {
                    Meteor.call("updateStudentStatus", data, this.updateStatusStudentForm.statusId, (err, result) => {
                        if (!err) {
                            vm.$message({
                                message: `សិស្សកែប្រែស្ថានភាពបានជោគជ័យ`,
                                type: 'success'
                            });
                            vm.generateStudentList(oldClassDoc);

                            vm.dialogUpdateStatusStudent = false;
                        } else {
                            vm.generateStudentList(oldClassDoc);
                            vm.$message({
                                type: 'error',
                                message: err.message
                            });
                        }
                    })
                })

            },
            saveUpdatePromotionStudent(event) {
                event.preventDefault();

                let vm = this;
                let data = {};
                data.classId = this.updatePromotionStudentForm.classId;
                data.studentId = this.updatePromotionStudentForm.studentId;
                data.programId = this.updatePromotionStudentForm.programId;
                data.levelId = this.updatePromotionStudentForm.levelId;
                data.majorId = this.updatePromotionStudentForm.majorId;
                let oldClassDoc = {};
                oldClassDoc._id = data.classId;
                this.$refs["updatePromotionStudent"].validate((valid) => {
                    Meteor.call("updateStudentPromotion", data, vm.updatePromotionStudentForm.promotionId, (err, result) => {
                        if (!err) {
                            vm.$message({
                                message: `សិស្សកែប្រែអាហារូបករណ៍បានជោគជ័យ`,
                                type: 'success'
                            });
                            vm.generateStudentList(oldClassDoc);

                            vm.dialogUpdatePromotionStudent = false;
                        } else {
                            vm.generateStudentList(oldClassDoc);
                            vm.$message({
                                type: 'error',
                                message: err.message
                            });
                        }
                    })
                })

            },
            popUpPromoteToClass() {
                this.ref = "promoteToClass";
                this.dialogPromoteToClass = true;
                this.programOpt();
                this.classOpt();
                this.numSelectStudentPromoted = this.multipleSelectionNotPromote.length;

            },
            popUpUnPromoteToClass() {
                this.ref = "unPromoteToClass";
                this.dialogUnPromoteToClass = true;
                this.programOpt();
                this.classOpt(this.schUnPromoteToClassForm.levelId);
                this.numSelectStudentPromoted = this.multipleSelectionNotPromote.length;
            },
            popUpPromoteToGraduated() {
                this.ref = "promoteToGraduated";
                this.dialogPromoteToGraduated = true;
                this.programOpt();
                this.classOpt();
                this.levelOpt();
                this.majorOpt();
                this.numSelectStudentPromoted = this.multipleSelectionNotPromote.length;
            },
            popUpUpdateStaus(data) {
                this.ref = "updateStatusStudent";
                this.updateStatusStudentForm.classId = data.classId;
                this.updateStatusStudentForm.studentId = data.studentId;
                this.updateStatusStudentForm.programId = data.programId;
                this.updateStatusStudentForm.levelId = data.levelId;
                this.updateStatusStudentForm.majorId = data.majorId;

            },
            popUpUpdatePromotion(data) {
                this.promotionOpt();

                this.ref = "updatePromotionStudent";
                this.updatePromotionStudentForm.classId = data.classId;
                this.updatePromotionStudentForm.studentId = data.studentId;
                this.updatePromotionStudentForm.programId = data.programId;
                this.updatePromotionStudentForm.levelId = data.levelId;
                this.updatePromotionStudentForm.majorId = data.majorId;

            },
            removeSchStudentFromClass(classId, studentId) {
                let vm = this;
                let oldClassDoc = {};
                oldClassDoc._id = classId;
                this.$confirm('This will permanently delete Student from class. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeSchStudentFromClass", classId, studentId, (err, result) => {
                        if (!err) {
                            vm.$message({
                                message: `
                        លុប សិស្សពីថ្នាក់ បានជោគជ័យ`,
                                type: 'success'
                            });
                            vm.generateStudentList(oldClassDoc);

                        } else {
                            vm.$message({
                                type: 'error',
                                message: err.message
                            });
                        }

                    })

                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: 'Delete canceled'
                    });
                });


            }


        }
        ,

        created() {
            this.isSearching = true;
            this.queryData();
            this.facultyBoardOpt();
            Meteor.subscribe('Sch_ClassTableReact');

        }
        ,
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['classBoard'];
                return data;
            }
        }
    }
</script>
<style>
    .transition-box {
        margin-bottom: 10px;
        width: 100%;
        height: 110px;
        border-radius: 4px;
        background-color: #409EFF;
        text-align: center;
        color: #fff;
        padding: 40px 20px;
        box-sizing: border-box;
        margin-right: 20px;
    }

    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }

    .clearfix:after {
        clear: both
    }

    .box-card {
        width: 100%;
    }
</style>
