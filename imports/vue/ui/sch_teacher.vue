<template>
    <div class="sch_teacher">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddSchTeacher = true,resetForm()">
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
                        :data="schTeacherData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="personal.name"
                            :label="langConfig['name']">
                    </el-table-column>
                    <el-table-column
                            prop="personal.latinName"
                            :label="langConfig['latinName']">
                    </el-table-column>
                    <el-table-column
                            prop="personal.gender"
                            :label="langConfig['gender']">
                    </el-table-column>
                    <el-table-column
                            prop="personal.phoneNumber"
                            :label="langConfig['phoneNumber']">
                    </el-table-column>
                    <el-table-column
                            prop="personal.dobName"
                            :label="langConfig['dob']">
                    </el-table-column>
                    <el-table-column
                            prop="personal.province"
                            :label="langConfig['province']">
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['action']"
                            width="120"

                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removeSchTeacher(scope.$index,scope.row,schTeacherData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findSchTeacherById(scope),dialogUpdateSchTeacher= true"
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
                :visible.sync="dialogAddSchTeacher"
                :fullscreen="fullscreen"
        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schTeacherForm" :rules="rules" ref="schTeacherFormAdd" label-width="120px"
                     class="schTeacherForm">
                <el-row>
                    <el-col :span="10">
                        <p><b><i class="material-icons">
                            perm_identity
                        </i> {{langConfig['personalInfo']}}</b>
                        </p>
                        <hr>
                        <el-row>
                            <el-col :span="24">
                                <el-row>
                                    <el-col :span="14">

                                        <el-form-item :label="langConfig['name']" prop="name">
                                            <el-input v-model="schTeacherForm.name"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="10">
                                        <el-form-item :label="langConfig['idNumber']" prop="idNumber">
                                            <el-input v-model="schTeacherForm.idNumber"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col :span="14">
                                        <el-form-item :label="langConfig['latinName']" prop="latinName">
                                            <el-input v-model="schTeacherForm.latinName"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="10">
                                        <el-form-item :label="langConfig['idCode']" prop="idCode">
                                            <el-input v-model="schTeacherForm.idCode"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col :span="14">
                                        <el-form-item :label="langConfig['startWorkDate']" prop="startWorkDate">
                                            <el-date-picker
                                                    v-model="schTeacherForm.startWorkDate"
                                                    type="date"
                                                    style="width: 100%;"
                                                    placeholder="Pick a day"
                                            >
                                            </el-date-picker>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="10">
                                        <el-form-item :label="langConfig['dob']" prop="dob">
                                            <el-date-picker
                                                    v-model="schTeacherForm.dob"
                                                    type="date"
                                                    style="width: 100%;"
                                                    placeholder="Pick a day"
                                            >
                                            </el-date-picker>
                                        </el-form-item>
                                    </el-col>
                                </el-row>

                                <el-row>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['gender']" prop="gender">
                                            <el-radio-group v-model="schTeacherForm.gender">
                                                <el-radio v-for="mt in genderList" :label="mt.value"
                                                          :key="mt.value"
                                                >
                                                    {{mt.label}}
                                                </el-radio>
                                            </el-radio-group>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['status']" prop="status">
                                            <el-select style="display: block !important;"
                                                       filterable
                                                       v-model="schTeacherForm.status"
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
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['nationality']" prop="nationality">
                                            <el-input v-model="schTeacherForm.nationality"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['nation']" prop="nation">
                                            <el-input v-model="schTeacherForm.nation"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>


                                <el-card class="box-card">
                                    <div slot="header" class="clearfix">
                                        <span style="line-height: 36px;">{{langConfig['pob']}}</span>
                                    </div>
                                    <el-row>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['village']" prop="village">
                                                <el-input v-model="schTeacherForm.village"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['commune']" prop="commune">
                                                <el-input v-model="schTeacherForm.commune"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['district']" prop="district">
                                                <el-input v-model="schTeacherForm.district"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['province']" prop="province">
                                                <el-input v-model="schTeacherForm.province"></el-input>
                                            </el-form-item>
                                        </el-col>
                                    </el-row>
                                </el-card>
                                <br>
                                <el-card class="box-card">
                                    <div slot="header" class="clearfix">
                                        <span style="line-height: 36px;">{{langConfig['address']}}</span>
                                    </div>
                                    <el-row>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['homeNo']" prop="homeNoCurrent">
                                                <el-input v-model="schTeacherForm.homeNoCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['group']" prop="groupCurrent">
                                                <el-input v-model="schTeacherForm.groupCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['village']" prop="villageCurrent">
                                                <el-input v-model="schTeacherForm.villageCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['commune']" prop="communeCurrent">
                                                <el-input v-model="schTeacherForm.communeCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['district']" prop="districtCurrent">
                                                <el-input v-model="schTeacherForm.districtCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['province']" prop="provinceCurrent">
                                                <el-input v-model="schTeacherForm.provinceCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                    </el-row>
                                </el-card>
                                <br>
                                <el-form-item :label="langConfig['phoneNumber']" prop="phoneNumber">
                                    <el-input v-model="schTeacherForm.phoneNumber"></el-input>
                                </el-form-item>
                                <el-row>
                                    <el-col :span="14">
                                        <el-form-item :label="langConfig['bankAccount']" prop="bankAccount">
                                            <el-input v-model="schTeacherForm.bankAccount"></el-input>
                                        </el-form-item>

                                    </el-col>
                                    <el-col :span="10">
                                        <el-form-item :label="langConfig['bankName']" prop="bankName">
                                            <el-input v-model="schTeacherForm.bankName"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col :span="14">
                                        <el-form-item :label="langConfig['major']" prop="major">
                                            <el-input v-model="schTeacherForm.major"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="10">
                                        <el-form-item :label="langConfig['generation']" prop="generation">
                                            <el-input v-model="schTeacherForm.generation"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-form-item :label="langConfig['startDateInSchool']" prop="startDate">
                                        <el-date-picker
                                                v-model="schTeacherForm.startDate"
                                                type="date"
                                                style="width: 100%;"
                                                placeholder="Pick a day"
                                        >
                                        </el-date-picker>
                                    </el-form-item>
                                </el-row>


                            </el-col>
                        </el-row>
                    </el-col>
                    <el-col :span="1">
                        <div>&nbsp;</div>
                    </el-col>
                    <el-col :span="13">
                        <p><b><i class="material-icons">
                            group
                        </i> {{langConfig['family']}}</b></p>
                        <hr>
                        <el-row>
                            <p>{{langConfig['parent']}}</p>
                            <el-col :span="12">
                                <el-form-item :label="langConfig['faName']" prop="faName">
                                    <el-input v-model="schTeacherForm.faName"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['bornYear']" prop="faYob">
                                    <el-input v-model="schTeacherForm.faYob" type="number"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['nationality']" prop="faNationality">
                                    <el-input v-model="schTeacherForm.faNationality"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['nation']" prop="faNation">
                                    <el-input v-model="schTeacherForm.faNation"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['isDie']" prop="faIsDie">
                                    <el-switch
                                            v-model="schTeacherForm.faIsDie"
                                            active-color="#13ce66"
                                            inactive-color="#ff4949"
                                    >
                                    </el-switch>

                                </el-form-item>
                                <el-form-item :label="langConfig['occupation']" prop="faOccupation">
                                    <el-input v-model="schTeacherForm.faOccupation"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item :label="langConfig['moName']" prop="moName">
                                    <el-input v-model="schTeacherForm.moName"></el-input>
                                </el-form-item>

                                <el-form-item :label="langConfig['bornYear']" prop="moYob">
                                    <el-input v-model="schTeacherForm.moYob" type="number"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['nationality']" prop="moNationality">
                                    <el-input v-model="schTeacherForm.moNationality"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['nation']" prop="moNation">
                                    <el-input v-model="schTeacherForm.moNation"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['isDie']" prop="moIsDie">
                                    <el-switch
                                            v-model="schTeacherForm.moIsDie"
                                            active-color="#13ce66"
                                            inactive-color="#ff4949"
                                    >
                                    </el-switch>
                                </el-form-item>
                                <el-form-item :label="langConfig['occupation']" prop="moOccupation">
                                    <el-input v-model="schTeacherForm.moOccupation"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="24">
                                <el-form-item :label="langConfig['address']" prop="address">
                                    <el-input v-model="schTeacherForm.address"></el-input>
                                </el-form-item>
                            </el-col>

                        </el-row>
                        <el-row>
                            <p>{{langConfig['cousin']}}</p>
                            <el-table
                                    :data="cousinData"
                                    stripe
                                    style="width: 100%">
                                <el-table-column
                                        type="index"
                                        :index="indexMethod">
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['name']">
                                    <template slot-scope="scope">
                                        <el-input size="small" v-model="scope.row.name"
                                                  :placeholder="langConfig['name']"
                                                  @change="handleEditCousin(scope.$index, scope.row)"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['gender']">
                                    <template slot-scope="scope">
                                        <el-radio-group v-model="scope.row.gender" :placeholder="langConfig['gender']"
                                                        @change="handleEditCousin(scope.$index, scope.row)">
                                            <el-radio v-for="mt in genderList" :label="mt.value"
                                                      :key="mt.value"
                                            >
                                                {{mt.label}}
                                            </el-radio>
                                        </el-radio-group>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['age']">
                                    <template slot-scope="scope">
                                        <el-input size="small" v-model="scope.row.age" :placeholder="langConfig['age']"
                                                  @change="handleEditCousin(scope.$index, scope.row)"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['occupation']">
                                    <template slot-scope="scope">
                                        <el-input size="small" v-model="scope.row.occupation"
                                                  :placeholder="langConfig['occupation']"
                                                  @change="handleEditCousin(scope.$index, scope.row)"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['action']"
                                        width="120"
                                >
                                    <template slot-scope="scope">
                                        <el-button type="primary" class="cursor-pointer" icon="el-icon-circle-plus"
                                                   size="small"
                                                   @click="handleAddCousin()"

                                        ></el-button>
                                        <el-button type="danger" class="cursor-pointer" icon="el-icon-remove"
                                                   size="small"
                                                   @click="removeCousinData(scope.$index,scope.row)"
                                        ></el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-row>

                        <p><b><i class="material-icons">
                            school
                        </i> {{langConfig['study']}}</b></p>
                        <hr>
                        <el-row>
                            <el-table
                                    :data="studyData"
                                    stripe
                                    style="width: 100%">
                                <el-table-column
                                        type="index"
                                        :index="indexMethod">
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['studyAt']">
                                    <template slot-scope="scope">
                                        <el-input size="small" v-model="scope.row.studyAt"
                                                  :placeholder="langConfig['studyAt']"
                                                  @change="handleEditStudy(scope.$index, scope.row)"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['duration']"
                                >
                                    <template slot-scope="scope">
                                        <el-input size="small" v-model="scope.row.duration"
                                                  :placeholder="langConfig['duration']"
                                                  @change="handleEditStudy(scope.$index, scope.row)"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['grade']">
                                    <template slot-scope="scope">
                                        <el-input size="small" v-model="scope.row.grade"
                                                  :placeholder="langConfig['grade']"
                                                  @change="handleEditStudy(scope.$index, scope.row)"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['where']">
                                    <template slot-scope="scope">
                                        <el-input size="small" v-model="scope.row.where"
                                                  :placeholder="langConfig['where']"
                                                  @change="handleEditStudy(scope.$index, scope.row)"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        prop="graduatedYear"
                                        :label="langConfig['graduatedYear']">
                                    <template slot-scope="scope">
                                        <el-input size="small" v-model="scope.row.graduatedYear"
                                                  :placeholder="langConfig['graduatedYear']"
                                                  @change="handleEditStudy(scope.$index, scope.row)"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['action']"
                                        width="120"
                                >
                                    <template slot-scope="scope">
                                        <el-button type="primary" class="cursor-pointer" icon="el-icon-circle-plus"
                                                   size="small"
                                                   @click="handleAddStudy()"

                                        ></el-button>
                                        <el-button type="danger" class="cursor-pointer" icon="el-icon-remove"
                                                   size="small"
                                                   @click="removeStudy(scope.$index,scope.row)"
                                        ></el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-row>

                        <p><b><i class="material-icons">
                            whatshot
                        </i> {{langConfig['position']}}</b></p>
                        <hr>
                        <el-row>
                            <el-table
                                    :data="positionData"
                                    stripe
                                    style="width: 100%">
                                <el-table-column
                                        type="index"
                                        :index="indexMethod">
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['startDate']" style="margin-left:0px !important; ">
                                    <template slot-scope="scope">
                                        <el-date-picker
                                                v-model="scope.row.startDate"
                                                type="date"
                                                style="width: 100%;"
                                                placeholder="Pick a day"
                                                @change="handleEditPosition(scope.$index, scope.row)"
                                        >
                                        </el-date-picker>
                                    </template>
                                </el-table-column>

                                <el-table-column
                                        :label="langConfig['position']">
                                    <template slot-scope="scope">
                                        <el-select style="display: block !important;"
                                                   filterable
                                                   v-model="scope.row.positionId"
                                                   @change="handleEditPosition(scope.$index, scope.row)"
                                                   :placeholder="langConfig['chooseItem']">
                                            <el-option
                                                    v-for="item in positionList"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value"
                                                    :disabled="item.disabled">
                                            </el-option>
                                        </el-select>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['action']"
                                        width="120"
                                >
                                    <template slot-scope="scope">
                                        <el-button type="primary" class="cursor-pointer" icon="el-icon-circle-plus"
                                                   size="small"
                                                   @click="handleAddPosition()"

                                        ></el-button>
                                        <el-button type="danger" class="cursor-pointer" icon="el-icon-remove"
                                                   size="small"
                                                   @click="removePositionData(scope.$index,scope.row)"
                                        ></el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-row>


                        <br>
                        <br>
                    </el-col>
                </el-row>
                <p><b><i class="material-icons">
                    attach_money
                </i> {{langConfig['levelSalary']}}</b></p>
                <hr>
                <el-row>
                    <el-table
                            :data="levelSalaryData"
                            stripe
                            style="width: 100%">
                        <el-table-column
                                type="index"
                                :index="indexMethod">
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['order']">
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.order"
                                          :placeholder="langConfig['order']"
                                          @change="handleEditLevelSalary(scope.$index, scope.row)"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['number']"
                        >
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.number"
                                          :placeholder="langConfig['number']"
                                          @change="handleEditLevelSalary(scope.$index, scope.row)"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['date']" style="margin-left:0px !important; ">
                            <template slot-scope="scope">
                                <el-date-picker
                                        v-model="scope.row.date"
                                        type="date"
                                        style="width: 100%;"
                                        placeholder="Pick a day"
                                        @change="handleEditLevelSalary(scope.$index, scope.row)"
                                >
                                </el-date-picker>
                            </template>
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['kambrak']">
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.level"
                                          placeholder="ក.៣.៤"
                                          @change="handleEditLevelSalary(scope.$index, scope.row)"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['meaning']">
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.meaning"
                                          :placeholder="langConfig['meaning']"
                                          @change="handleEditLevelSalary(scope.$index, scope.row)"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['desc']">
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.desc"
                                          :placeholder="langConfig['desc']"
                                          @change="handleEditLevelSalary(scope.$index, scope.row)"></el-input>
                            </template>
                        </el-table-column>

                        <el-table-column
                                :label="langConfig['action']"
                                width="120"
                        >
                            <template slot-scope="scope">
                                <el-button type="primary" class="cursor-pointer" icon="el-icon-circle-plus"
                                           size="small"
                                           @click="handleAddLevelSalary()"

                                ></el-button>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-remove"
                                           size="small"
                                           @click="removeLevelSalaryData(scope.$index,scope.row)"
                                ></el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-row>
                <br>
                <br>

            </el-form>
            <span slot="footer" class="dialog-footer fix-dialog-footer">
                <hr style="margin-top: 0px !important;">
                <el-row>
                    <el-col :span="12" style="text-align: left !important;">
                        <el-button type="danger" @click="dialogAddSchTeacher= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">
                         <el-button type="primary" @click.native="saveSchTeacher($event)"><i
                                 class="el-icon-circle-check"> </i>&nbsp; {{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                    </el-col>
                </el-row>
            </span>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateSchTeacher"
                :fullscreen="fullscreen"
        >
            <hr style="margin-top: 0px !important;border-top: 2px solid teal">
            <el-form :model="schTeacherForm" :rules="rules" ref="schTeacherFormUpdate" label-width="120px"
                     class="schTeacherForm">
                <el-row>
                    <el-col :span="10">
                        <p><b><i class="material-icons">
                            perm_identity
                        </i> {{langConfig['personalInfo']}}</b>
                        </p>
                        <hr>
                        <el-row>
                            <el-col :span="24">
                                <el-row>
                                    <el-col :span="14">

                                        <el-form-item :label="langConfig['name']" prop="name">
                                            <el-input v-model="schTeacherForm.name"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="10">
                                        <el-form-item :label="langConfig['idNumber']" prop="idNumber">
                                            <el-input v-model="schTeacherForm.idNumber"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col :span="14">
                                        <el-form-item :label="langConfig['latinName']" prop="latinName">
                                            <el-input v-model="schTeacherForm.latinName"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="10">
                                        <el-form-item :label="langConfig['idCode']" prop="idCode">
                                            <el-input v-model="schTeacherForm.idCode"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col :span="14">
                                        <el-form-item :label="langConfig['startWorkDate']" prop="startWorkDate">
                                            <el-date-picker
                                                    v-model="schTeacherForm.startWorkDate"
                                                    type="date"
                                                    style="width: 100%;"
                                                    placeholder="Pick a day"
                                            >
                                            </el-date-picker>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="10">
                                        <el-form-item :label="langConfig['dob']" prop="dob">
                                            <el-date-picker
                                                    v-model="schTeacherForm.dob"
                                                    type="date"
                                                    style="width: 100%;"
                                                    placeholder="Pick a day"
                                            >
                                            </el-date-picker>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['gender']" prop="gender">
                                            <el-radio-group v-model="schTeacherForm.gender">
                                                <el-radio v-for="mt in genderList" :label="mt.value"
                                                          :key="mt.value"
                                                >
                                                    {{mt.label}}
                                                </el-radio>
                                            </el-radio-group>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['status']" prop="status">
                                            <el-select style="display: block !important;"
                                                       filterable
                                                       v-model="schTeacherForm.status"
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
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['nationality']" prop="nationality">
                                            <el-input v-model="schTeacherForm.nationality"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['nation']" prop="nation">
                                            <el-input v-model="schTeacherForm.nation"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>


                                <el-card class="box-card">
                                    <div slot="header" class="clearfix">
                                        <span style="line-height: 36px;">{{langConfig['pob']}}</span>
                                    </div>
                                    <el-row>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['village']" prop="village">
                                                <el-input v-model="schTeacherForm.village"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['commune']" prop="commune">
                                                <el-input v-model="schTeacherForm.commune"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['district']" prop="district">
                                                <el-input v-model="schTeacherForm.district"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['province']" prop="province">
                                                <el-input v-model="schTeacherForm.province"></el-input>
                                            </el-form-item>
                                        </el-col>
                                    </el-row>
                                </el-card>
                                <br>
                                <el-card class="box-card">
                                    <div slot="header" class="clearfix">
                                        <span style="line-height: 36px;">{{langConfig['address']}}</span>
                                    </div>
                                    <el-row>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['homeNo']" prop="homeNoCurrent">
                                                <el-input v-model="schTeacherForm.homeNoCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['group']" prop="groupCurrent">
                                                <el-input v-model="schTeacherForm.groupCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['village']" prop="villageCurrent">
                                                <el-input v-model="schTeacherForm.villageCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['commune']" prop="communeCurrent">
                                                <el-input v-model="schTeacherForm.communeCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['district']" prop="districtCurrent">
                                                <el-input v-model="schTeacherForm.districtCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['province']" prop="provinceCurrent">
                                                <el-input v-model="schTeacherForm.provinceCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                    </el-row>
                                </el-card>
                                <br>
                                <el-form-item :label="langConfig['phoneNumber']" prop="phoneNumber">
                                    <el-input v-model="schTeacherForm.phoneNumber"></el-input>
                                </el-form-item>
                                <el-row>
                                    <el-col :span="14">
                                        <el-form-item :label="langConfig['bankAccount']" prop="bankAccount">
                                            <el-input v-model="schTeacherForm.bankAccount"></el-input>

                                        </el-form-item>

                                    </el-col>
                                    <el-col :span="10">
                                        <el-form-item :label="langConfig['bankName']" prop="bankName">
                                            <el-input v-model="schTeacherForm.bankName"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col :span="14">
                                        <el-form-item :label="langConfig['major']" prop="major">
                                            <el-input v-model="schTeacherForm.major"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="10">
                                        <el-form-item :label="langConfig['generation']" prop="generation">
                                            <el-input v-model="schTeacherForm.generation"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-form-item :label="langConfig['startDateInSchool']" prop="startDate">
                                        <el-date-picker
                                                v-model="schTeacherForm.startDate"
                                                type="date"
                                                style="width: 100%;"
                                                placeholder="Pick a day"
                                        >
                                        </el-date-picker>
                                    </el-form-item>
                                </el-row>

                            </el-col>
                        </el-row>
                    </el-col>
                    <el-col :span="1">
                        <div>&nbsp;</div>
                    </el-col>
                    <el-col :span="13">
                        <p><b><i class="material-icons">
                            group
                        </i> {{langConfig['family']}}</b></p>
                        <hr>
                        <el-row>
                            <p>{{langConfig['parent']}}</p>
                            <el-col :span="12">
                                <el-form-item :label="langConfig['faName']" prop="faName">
                                    <el-input v-model="schTeacherForm.faName"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['bornYear']" prop="faYob">
                                    <el-input v-model="schTeacherForm.faYob" type="number"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['nationality']" prop="faNationality">
                                    <el-input v-model="schTeacherForm.faNationality"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['nation']" prop="faNation">
                                    <el-input v-model="schTeacherForm.faNation"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['isDie']" prop="faIsDie">
                                    <el-switch
                                            v-model="schTeacherForm.faIsDie"
                                            active-color="#13ce66"
                                            inactive-color="#ff4949"
                                    >
                                    </el-switch>

                                </el-form-item>
                                <el-form-item :label="langConfig['occupation']" prop="faOccupation">
                                    <el-input v-model="schTeacherForm.faOccupation"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item :label="langConfig['moName']" prop="moName">
                                    <el-input v-model="schTeacherForm.moName"></el-input>
                                </el-form-item>

                                <el-form-item :label="langConfig['bornYear']" prop="moYob">
                                    <el-input v-model="schTeacherForm.moYob" type="number"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['nationality']" prop="moNationality">
                                    <el-input v-model="schTeacherForm.moNationality"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['nation']" prop="moNation">
                                    <el-input v-model="schTeacherForm.moNation"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['isDie']" prop="moIsDie">
                                    <el-switch
                                            v-model="schTeacherForm.moIsDie"
                                            active-color="#13ce66"
                                            inactive-color="#ff4949"
                                    >
                                    </el-switch>
                                </el-form-item>
                                <el-form-item :label="langConfig['occupation']" prop="moOccupation">
                                    <el-input v-model="schTeacherForm.moOccupation"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="24">
                                <el-form-item :label="langConfig['address']" prop="address">
                                    <el-input v-model="schTeacherForm.address"></el-input>
                                </el-form-item>
                            </el-col>

                        </el-row>
                        <el-row>
                            <p>{{langConfig['cousin']}}</p>
                            <el-table
                                    :data="cousinData"
                                    stripe
                                    style="width: 100%">
                                <el-table-column
                                        type="index"
                                        :index="indexMethod">
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['name']">
                                    <template slot-scope="scope">
                                        <el-input size="small" v-model="scope.row.name"
                                                  :placeholder="langConfig['name']"
                                                  @change="handleEditCousin(scope.$index, scope.row)"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['gender']">
                                    <template slot-scope="scope">
                                        <el-radio-group v-model="scope.row.gender" :placeholder="langConfig['gender']"
                                                        @change="handleEditCousin(scope.$index, scope.row)">
                                            <el-radio v-for="mt in genderList" :label="mt.value"
                                                      :key="mt.value"
                                            >
                                                {{mt.label}}
                                            </el-radio>
                                        </el-radio-group>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['age']">
                                    <template slot-scope="scope">
                                        <el-input size="small" v-model="scope.row.age" :placeholder="langConfig['age']"
                                                  @change="handleEditCousin(scope.$index, scope.row)"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['occupation']">
                                    <template slot-scope="scope">
                                        <el-input size="small" v-model="scope.row.occupation"
                                                  :placeholder="langConfig['occupation']"
                                                  @change="handleEditCousin(scope.$index, scope.row)"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['action']"
                                        width="120"
                                >
                                    <template slot-scope="scope">
                                        <el-button type="primary" class="cursor-pointer" icon="el-icon-circle-plus"
                                                   size="small"
                                                   @click="handleAddCousin()"

                                        ></el-button>
                                        <el-button type="danger" class="cursor-pointer" icon="el-icon-remove"
                                                   size="small"
                                                   @click="removeCousinData(scope.$index,scope.row)"
                                        ></el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-row>

                        <p><b><i class="material-icons">
                            school
                        </i> {{langConfig['study']}}</b></p>
                        <hr>
                        <el-row>
                            <el-table
                                    :data="studyData"
                                    stripe
                                    style="width: 100%">
                                <el-table-column
                                        type="index"
                                        :index="indexMethod">
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['studyAt']">
                                    <template slot-scope="scope">
                                        <el-input size="small" v-model="scope.row.studyAt"
                                                  :placeholder="langConfig['studyAt']"
                                                  @change="handleEditStudy(scope.$index, scope.row)"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['duration']"
                                >
                                    <template slot-scope="scope">
                                        <el-input size="small" v-model="scope.row.duration"
                                                  :placeholder="langConfig['duration']"
                                                  @change="handleEditStudy(scope.$index, scope.row)"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['grade']">
                                    <template slot-scope="scope">
                                        <el-input size="small" v-model="scope.row.grade"
                                                  :placeholder="langConfig['grade']"
                                                  @change="handleEditStudy(scope.$index, scope.row)"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['where']">
                                    <template slot-scope="scope">
                                        <el-input size="small" v-model="scope.row.where"
                                                  :placeholder="langConfig['where']"
                                                  @change="handleEditStudy(scope.$index, scope.row)"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        prop="graduatedYear"
                                        :label="langConfig['graduatedYear']">
                                    <template slot-scope="scope">
                                        <el-input size="small" v-model="scope.row.graduatedYear"
                                                  :placeholder="langConfig['graduatedYear']"
                                                  @change="handleEditStudy(scope.$index, scope.row)"></el-input>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['action']"
                                        width="120"
                                >
                                    <template slot-scope="scope">
                                        <el-button type="primary" class="cursor-pointer" icon="el-icon-circle-plus"
                                                   size="small"
                                                   @click="handleAddStudy()"

                                        ></el-button>
                                        <el-button type="danger" class="cursor-pointer" icon="el-icon-remove"
                                                   size="small"
                                                   @click="removeStudy(scope.$index,scope.row)"
                                        ></el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-row>


                        <p><b><i class="material-icons">
                            whatshot
                        </i> {{langConfig['position']}}</b></p>
                        <hr>
                        <el-row>
                            <el-table
                                    :data="positionData"
                                    stripe
                                    style="width: 100%">
                                <el-table-column
                                        type="index"
                                        :index="indexMethod">
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['startDate']" style="margin-left:0px !important; ">
                                    <template slot-scope="scope">
                                        <el-date-picker
                                                v-model="scope.row.startDate"
                                                type="date"
                                                style="width: 100%;"
                                                placeholder="Pick a day"
                                                @change="handleEditPosition(scope.$index, scope.row)"
                                        >
                                        </el-date-picker>
                                    </template>
                                </el-table-column>

                                <el-table-column
                                        :label="langConfig['position']">
                                    <template slot-scope="scope">
                                        <el-select style="display: block !important;"
                                                   filterable
                                                   v-model="scope.row.positionId"
                                                   @change="handleEditPosition(scope.$index, scope.row)"
                                                   :placeholder="langConfig['chooseItem']">
                                            <el-option
                                                    v-for="item in positionList"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value"
                                                    :disabled="item.disabled">
                                            </el-option>
                                        </el-select>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        :label="langConfig['action']"
                                        width="120"
                                >
                                    <template slot-scope="scope">
                                        <el-button type="primary" class="cursor-pointer" icon="el-icon-circle-plus"
                                                   size="small"
                                                   @click="handleAddPosition()"

                                        ></el-button>
                                        <el-button type="danger" class="cursor-pointer" icon="el-icon-remove"
                                                   size="small"
                                                   @click="removePositionData(scope.$index,scope.row)"
                                        ></el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-row>


                        <br>
                        <br>
                    </el-col>
                </el-row>
                <p><b><i class="material-icons">
                    attach_money
                </i> {{langConfig['levelSalary']}}</b></p>
                <hr>
                <el-row>
                    <el-table
                            :data="levelSalaryData"
                            stripe
                            style="width: 100%">
                        <el-table-column
                                type="index"
                                :index="indexMethod">
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['order']">
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.order"
                                          :placeholder="langConfig['order']"
                                          @change="handleEditLevelSalary(scope.$index, scope.row)"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['number']"
                        >
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.number"
                                          :placeholder="langConfig['number']"
                                          @change="handleEditLevelSalary(scope.$index, scope.row)"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['date']" style="margin-left:0px !important; ">
                            <template slot-scope="scope">
                                <el-date-picker
                                        v-model="scope.row.date"
                                        type="date"
                                        style="width: 100%;"
                                        placeholder="Pick a day"
                                        @change="handleEditLevelSalary(scope.$index, scope.row)"
                                >
                                </el-date-picker>
                            </template>
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['kambrak']">
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.level"
                                          placeholder="ក.៣.៤"
                                          @change="handleEditLevelSalary(scope.$index, scope.row)"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['meaning']">
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.meaning"
                                          :placeholder="langConfig['meaning']"
                                          @change="handleEditLevelSalary(scope.$index, scope.row)"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column
                                :label="langConfig['desc']">
                            <template slot-scope="scope">
                                <el-input v-model="scope.row.desc"
                                          :placeholder="langConfig['desc']"
                                          @change="handleEditLevelSalary(scope.$index, scope.row)"></el-input>
                            </template>
                        </el-table-column>

                        <el-table-column
                                :label="langConfig['action']"
                                width="120"
                        >
                            <template slot-scope="scope">
                                <el-button type="primary" class="cursor-pointer" icon="el-icon-circle-plus"
                                           size="small"
                                           @click="handleAddLevelSalary()"

                                ></el-button>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-remove"
                                           size="small"
                                           @click="removeLevelSalaryData(scope.$index,scope.row)"
                                ></el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-row>
                <br>
                <br>
            </el-form>
            <span slot="footer" class="dialog-footer fix-dialog-footer"
            >
                <hr style="margin-top: 0px !important;">
                <el-row>
                    <el-col :span="12" style="text-align: left !important;">
                        <el-button type="danger" @click="dialogUpdateSchTeacher= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">
                         <el-button type="primary" @click.native="updateSchTeacher(schTeacherId)"><i
                                 class="el-icon-circle-check"> </i>&nbsp; {{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                    </el-col>
                </el-row>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-sch'
    import {Sch_TeacherReact} from "../../collection/schTeacher";

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
                Sch_TeacherReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                newLoading: true,
                fullscreen: true,
                langSession: null,
                schTeacherData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddSchTeacher: false,
                dialogUpdateSchTeacher: false,
                schTeacherId: "",
                cousinData: [{
                    name: "",
                    gender: "",
                    age: "",
                    occupation: ""
                }],
                positionData: [{
                    startDate: "",
                    positionId: ""
                }],
                levelSalaryData: [{
                    order: "",
                    number: "",
                    date: "",
                    level: "",
                    desc: "",
                    meaning: "",
                }],
                studyData: [{
                    studyAt: "",
                    duration: "",
                    grade: "Un Range",
                    where: "",
                    graduatedYear: "",
                }],
                programList: [],
                subjectList: [],
                positionList: [],

                genderList: [
                    {value: "Male", label: "Male"},
                    {value: "Female", label: "Female"}
                ],
                statusList:
                    [
                        {value: "Single", label: "Single"},
                        {value: "Married", label: "Married"}
                    ],
                schTeacherForm:
                    {
                        name: "",
                        latinName:
                            "",
                        gender:
                            "",
                        nationality:
                            "",
                        nation:
                            "",
                        status:
                            "",
                        dob:
                            "",
                        dobName:
                            "",

                        village:
                            "",
                        commune:
                            "",
                        district:
                            "",
                        province:
                            "",
                        homeNoCurrent:
                            "",
                        groupCurrent:
                            "",
                        villageCurrent:
                            "",
                        communeCurrent:
                            "",
                        districtCurrent:
                            "",
                        provinceCurrent:
                            "",
                        occupation:
                            "",
                        occupationPlace:
                            "",

                        degree:
                            "",
                        degreeYear:
                            "",
                        phoneNumber:
                            "",

                        faName:
                            "",
                        faYob:
                            "",
                        faNationality:
                            "",
                        faNation:
                            "",
                        faIsDie:
                            false,
                        faOccupation:
                            "",

                        moName:
                            "",
                        moYob:
                            "",
                        moNationality:
                            "",
                        moNation:
                            "",
                        moIsDie:
                            false,
                        moOccupation:
                            "",
                        address:
                            "",

                        cousin:
                            [],
                        personalStudy:
                            [],
                        idNumber: "",
                        idCode: "",
                        startWorkDate: "",
                        position: [],
                        levelSalary: [],
                        bankAccount: "",
                        bankName: "",
                        major: "",
                        generation: "",
                        startDate: ""

                    }
                ,
                rules: {
                    "name":
                        [{required: true, message: 'Please input name', trigger: 'blur'}],
                    "latinName":
                        [{required: true, message: 'Please input latin name', trigger: 'blur'}],

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
            },
            "inputTranscriptForm.curiculumnId"(val) {

                if (this.inputTranscriptForm.transcriptId === "") {
                    this.findCuriculumnById(val);
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
                Meteor.call('querySchTeacher', {
                    q: val,
                    filter: this.filter,
                    rolesArea:Session.get('area'),
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.schTeacherData = result.content;
                        this.count = result.countSchTeacher;
                    }
                    this.isSearching = false;
                    this.newLoading = false;
                });
            }, 300),
            indexMethod(index) {
                return index + 1;
            },
            postitionOpt() {
                let selector = {};
                Meteor.call('queryPositionOption', selector, (err, result) => {
                    this.positionList = result;
                })
            },
            handleAddCousin() {
                this.cousinData.push({
                    name: "",
                    gender: "",
                    age: "",
                    occupation: ""
                })
            },
            handleEditCousin(index, row) {
                this.cousinData[index] = row;
            },
            removeCousinData(index, row) {
                if (this.cousinData.length > 1) {
                    this.cousinData.splice(index, 1);
                    this.$message({
                        message: `លុប ${row.name} បានជោគជ័យ`,
                        type: 'success'
                    });
                } else {
                    this.cousinData = [{
                        name: "",
                        gender: "",
                        age: "",
                        occupation: ""
                    }];
                }
            },

            handleAddStudy() {
                this.studyData.push({
                    studyAt: "",
                    duration: "",
                    grade: "",
                    where: "",
                    graduatedYear: "",

                })
            },
            handleEditStudy(index, row) {
                this.studyData[index] = row;

            },
            removeStudy(index, row) {
                if (this.studyData.length > 1) {
                    this.studyData.splice(index, 1);
                    this.$message({
                        message: `លុប ${row.studyAt} បានជោគជ័យ`,
                        type: 'success'
                    });
                } else {
                    this.studyData = [{
                        studyAt: "",
                        duration: "",
                        grade: "",
                        where: "",
                        graduatedYear: "",
                    }];
                }
            },
            handleAddLevelSalary() {
                this.levelSalaryData.push({
                    order: "",
                    number: "",
                    date: "",
                    level: "",
                    desc: "",
                    meaning: "",
                })
            },
            handleEditLevelSalary(index, row) {
                this.levelSalaryData[index] = row;
            },
            removeLevelSalaryData(index, row) {
                if (this.levelSalaryData.length > 1) {
                    this.levelSalaryData.splice(index, 1);
                    this.$message({
                        message: `លុប ${row.name} បានជោគជ័យ`,
                        type: 'success'
                    });
                } else {
                    this.levelSalaryData = [{
                        order: "",
                        number: "",
                        date: "",
                        level: "",
                        desc: "",
                        meaning: "",
                    }];
                }
            },
            handleAddPosition() {
                this.positionData.push({
                    startDate: "",
                    positionId: ""
                })
            },

            handleEditPosition(index, row) {
                this.positionData[index] = row;
            },
            removePositionData(index, row) {
                if (this.positionData.length > 1) {
                    this.positionData.splice(index, 1);
                    this.$message({
                        message: `លុប ${row.name} បានជោគជ័យ`,
                        type: 'success'
                    });
                } else {
                    this.positionData = [{
                        startDate: "",
                        positionId: ""
                    }];
                }
            },


            saveSchTeacher(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["schTeacherFormAdd"].validate((valid) => {
                    if (valid) {

                        let personal = {
                            name: vm.schTeacherForm.name,
                            latinName: vm.schTeacherForm.latinName,
                            gender: vm.schTeacherForm.gender,
                            nationality: vm.schTeacherForm.nationality,
                            nation: vm.schTeacherForm.nation,
                            status: vm.schTeacherForm.status,
                            dob: vm.schTeacherForm.dob,
                            dobName: moment(vm.schTeacherForm.dob).format("DD//MM/YYYY"),
                            homeNo: vm.schTeacherForm.homeNo,
                            village: vm.schTeacherForm.village,
                            commune: vm.schTeacherForm.commune,
                            district: vm.schTeacherForm.district,
                            province: vm.schTeacherForm.province,
                            occupation: vm.schTeacherForm.occupation,
                            homeNoCurrent: vm.schTeacherForm.homeNoCurrent,
                            groupCurrent: vm.schTeacherForm.groupCurrent,
                            villageCurrent: vm.schTeacherForm.villageCurrent,
                            communeCurrent: vm.schTeacherForm.communeCurrent,
                            districtCurrent: vm.schTeacherForm.districtCurrent,
                            provinceCurrent: vm.schTeacherForm.provinceCurrent,
                            occupationPlace: vm.schTeacherForm.occupationPlace,

                            degree: vm.schTeacherForm.degree,
                            degreeYear: vm.schTeacherForm.degreeYear,
                            phoneNumber: vm.schTeacherForm.phoneNumber,
                            idNumber: vm.schTeacherForm.idNumber,
                            idCode: vm.schTeacherForm.idCode,
                            bankAccount: vm.schTeacherForm.bankAccount,
                            bankName: vm.schTeacherForm.bankName,
                            major: vm.schTeacherForm.major,
                            generation: vm.schTeacherForm.generation,

                        };


                        let family = {};
                        let personalStudy = [];
                        let cousin = [];
                        let position = [];
                        let levelSalary = [];
                        this.studyData.map((obj) => {
                            if (obj.studyAt) {
                                personalStudy.push(obj)
                            }
                        });

                        this.cousinData.map((obj) => {
                            if (obj.name) {
                                cousin.push(obj);
                            }
                        });
                        this.positionData.map((obj) => {
                            if (obj.positionId) {
                                position.push(obj);
                            }
                        });

                        this.levelSalaryData.map((obj) => {
                            if (obj.date) {
                                obj.type = obj.level && obj.level.substring(0, 1) || "";
                                levelSalary.push(obj);
                            }
                        });

                        let parent = {
                            faName: vm.schTeacherForm.faName,
                            faYob: vm.schTeacherForm.faYob,
                            faNationality: vm.schTeacherForm.faNationality,
                            faNation: vm.schTeacherForm.faNation,
                            faIsDie: vm.schTeacherForm.faIsDie,
                            faOccupation: vm.schTeacherForm.faOccupation,

                            moName: vm.schTeacherForm.moName,
                            moYob: vm.schTeacherForm.moYob,
                            moNationality: vm.schTeacherForm.moNationality,
                            moNation: vm.schTeacherForm.moNation,
                            moIsDie: vm.schTeacherForm.moIsDie,
                            moOccupation: vm.schTeacherForm.moOccupation,
                            address: vm.schTeacherForm.address,
                        };
                        family.parent = parent;
                        family.cousin = cousin;
                        let schTeacherDoc = {
                            personal: personal,
                            family: family,
                            personalStudy: personalStudy,
                            personalContract: vm.schTeacherForm.personalContract,

                            rolesArea: Session.get('area'),
                            startWorkDate: vm.schTeacherForm.startWorkDate,
                            startDate: vm.schTeacherForm.startDate,
                            position: position,
                            levelSalary: levelSalary,
                        };

                        Meteor.call("insertSchTeacher", schTeacherDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['saveSuccess'],
                                    type: 'success'
                                });
                                vm.dialogAddSchTeacher = false;

                                vm.$refs["schTeacherFormAdd"].resetFields();
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
            updateSchTeacher(_id) {
                let vm = this;
                this.$refs["schTeacherFormUpdate"].validate((valid) => {
                    if (valid) {
                        let personal = {
                            name: vm.schTeacherForm.name,
                            latinName: vm.schTeacherForm.latinName,
                            gender: vm.schTeacherForm.gender,
                            nationality: vm.schTeacherForm.nationality,
                            nation: vm.schTeacherForm.nation,
                            status: vm.schTeacherForm.status,
                            dob: vm.schTeacherForm.dob,
                            dobName: moment(vm.schTeacherForm.dob).format("DD//MM/YYYY"),
                            homeNo: vm.schTeacherForm.homeNo,
                            village: vm.schTeacherForm.village,
                            commune: vm.schTeacherForm.commune,
                            district: vm.schTeacherForm.district,
                            province: vm.schTeacherForm.province,
                            occupation: vm.schTeacherForm.occupation,
                            homeNoCurrent: vm.schTeacherForm.homeNoCurrent,
                            groupCurrent: vm.schTeacherForm.groupCurrent,
                            villageCurrent: vm.schTeacherForm.villageCurrent,
                            communeCurrent: vm.schTeacherForm.communeCurrent,
                            districtCurrent: vm.schTeacherForm.districtCurrent,
                            provinceCurrent: vm.schTeacherForm.provinceCurrent,
                            occupationPlace: vm.schTeacherForm.occupationPlace,

                            degree: vm.schTeacherForm.degree,
                            degreeYear: vm.schTeacherForm.degreeYear,
                            phoneNumber: vm.schTeacherForm.phoneNumber,
                            idNumber: vm.schTeacherForm.idNumber,
                            idCode: vm.schTeacherForm.idCode,

                            bankAccount: vm.schTeacherForm.bankAccount,
                            bankName: vm.schTeacherForm.bankName,
                            major: vm.schTeacherForm.major,
                            generation: vm.schTeacherForm.generation,


                        };


                        let family = {};


                        let personalStudy = [];
                        let cousin = [];
                        let position = [];
                        let levelSalary = [];

                        this.studyData.map((obj) => {
                            if (obj.studyAt) {
                                personalStudy.push(obj)
                            }
                        });

                        this.cousinData.map((obj) => {
                            if (obj.name) {
                                cousin.push(obj);
                            }
                        });
                        this.positionData.map((obj) => {
                            if (obj.positionId) {
                                position.push(obj);
                            }
                        });
                        this.levelSalaryData.map((obj) => {
                            if (obj.date) {
                                obj.type = obj.level && obj.level.substring(0, 1) || "";
                                levelSalary.push(obj);
                            }
                        });

                        let parent = {
                            faName: vm.schTeacherForm.faName,
                            faYob: vm.schTeacherForm.faYob,
                            faNationality: vm.schTeacherForm.faNationality,
                            faNation: vm.schTeacherForm.faNation,
                            faIsDie: vm.schTeacherForm.faIsDie,
                            faOccupation: vm.schTeacherForm.faOccupation,

                            moName: vm.schTeacherForm.moName,
                            moYob: vm.schTeacherForm.moYob,
                            moNationality: vm.schTeacherForm.moNationality,
                            moNation: vm.schTeacherForm.moNation,
                            moIsDie: vm.schTeacherForm.moIsDie,
                            moOccupation: vm.schTeacherForm.moOccupation,
                            address: vm.schTeacherForm.address,
                        };
                        family.parent = parent;
                        family.cousin = cousin;
                        let schTeacherDoc = {
                            personal: personal,
                            family: family,
                            personalStudy: personalStudy,
                            rolesArea: Session.get('area'),
                            _id: _id,
                            personalContract: vm.schTeacherForm.personalContract,
                            startWorkDate: vm.schTeacherForm.startWorkDate,
                            startDate: vm.schTeacherForm.startDate,
                            position: position,
                            levelSalary: levelSalary,

                        };

                        Meteor.call("updateSchTeacher", schTeacherDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['updateSuccess'],
                                    type: 'success'
                                });
                                vm.dialogUpdateSchTeacher = false;

                                vm.$refs["schTeacherFormUpdate"].resetFields();
                                vm.resetForm();
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
            removeSchTeacher(index, row, rows) {
                let vm = this;
                this.$confirm(this.langConfig['messageWarning'], this.langConfig['warning'], {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeSchTeacher", row._id, (err, result) => {
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
            findSchTeacherById(doc) {
                let vm = this;
                Meteor.call("querySchTeacherById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.schTeacherId = result._id;
                        vm.schTeacherForm.idNumber = result.personal.idNumber;
                        vm.schTeacherForm.idCode = result.personal.idCode;
                        vm.schTeacherForm.bankAccount = result.personal.bankAccount;
                        vm.schTeacherForm.bankName = result.personal.bankName;
                        vm.schTeacherForm.major = result.personal.major;
                        vm.schTeacherForm.generation = result.personal.generation;

                        vm.schTeacherForm.startWorkDate = result.startWorkDate;
                        vm.schTeacherForm.startDate = result.startDate;
                        vm.schTeacherForm.personal = result.personal;


                        vm.schTeacherForm.name = result.personal.name;
                        vm.schTeacherForm.latinName = result.personal.latinName;
                        vm.schTeacherForm.gender = result.personal.gender;
                        vm.schTeacherForm.nationality = result.personal.nationality;
                        vm.schTeacherForm.nation = result.personal.nation;
                        vm.schTeacherForm.status = result.personal.status;
                        vm.schTeacherForm.dob = result.personal.dob;
                        vm.schTeacherForm.village = result.personal.village;
                        vm.schTeacherForm.commune = result.personal.commune;
                        vm.schTeacherForm.district = result.personal.district;
                        vm.schTeacherForm.province = result.personal.province;
                        vm.schTeacherForm.homeNoCurrent = result.personal.homeNoCurrent;
                        vm.schTeacherForm.groupCurrent = result.personal.groupCurrent;
                        vm.schTeacherForm.villageCurrent = result.personal.villageCurrent;
                        vm.schTeacherForm.communeCurrent = result.personal.communeCurrent;
                        vm.schTeacherForm.districtCurrent = result.personal.districtCurrent;
                        vm.schTeacherForm.provinceCurrent = result.personal.provinceCurrent;
                        vm.schTeacherForm.occupation = result.personal.occupation;
                        vm.schTeacherForm.occupationPlace = result.personal.occupationPlace;
                        vm.schTeacherForm.degree = result.personal.degree;
                        vm.schTeacherForm.degreeYear = result.personal.degreeYear;
                        vm.schTeacherForm.phoneNumber = result.personal.phoneNumber;


                        if (result.personalStudy.length > 0) {
                            vm.studyData = result.personalStudy;

                        } else {
                            vm.studyData =
                                [{
                                    studyAt: "",
                                    duration: "",
                                    grade: "",
                                    where: "",
                                    graduatedYear: "",
                                }];
                        }
                        if (result.family.cousin.length > 0) {
                            vm.cousinData = result.family.cousin;

                        } else {
                            vm.cousinData =
                                [{
                                    name: "",
                                    gender: "",
                                    age: "",
                                    occupation: ""
                                }];
                        }
                        if (result.position.length > 0) {
                            vm.positionData = result.position;

                        } else {

                            vm.positionData =
                                [{
                                    startDate: "",
                                    positionId: ""
                                }];

                        }
                        if (result.levelSalary.length > 0) {
                            vm.levelSalaryData = result.levelSalary;

                        } else {

                            vm.levelSalaryData =
                                [{
                                    order: "",
                                    number: "",
                                    date: "",
                                    level: "",
                                    desc: "",
                                    meaning: "",
                                }];

                        }

                        vm.schTeacherForm.faName = result.family.parent.faName;
                        vm.schTeacherForm.faYob = result.family.parent.faYob;
                        vm.schTeacherForm.faNationality = result.family.parent.faNationality;
                        vm.schTeacherForm.faNation = result.family.parent.faNation;
                        vm.schTeacherForm.faIsDie = result.family.parent.faIsDie;
                        vm.schTeacherForm.faOccupation = result.family.parent.faOccupation;

                        vm.schTeacherForm.moName = result.family.parent.moName;
                        vm.schTeacherForm.moYob = result.family.parent.moYob;
                        vm.schTeacherForm.moNationality = result.family.parent.moNationality;
                        vm.schTeacherForm.moNation = result.family.parent.moNation;
                        vm.schTeacherForm.moIsDie = result.family.parent.moIsDie;
                        vm.schTeacherForm.moOccupation = result.family.parent.moOccupation;
                        vm.schTeacherForm.address = result.family.parent.address;


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
                this.schTeacherForm._id = "";
                this.inputTranscriptForm = {};
                this.cousinData =
                    [{
                        name: "",
                        gender: "",
                        age: "",
                        occupation: ""
                    }];

                this.positionData =
                    [{
                        startDate: "",
                        positionId: ""
                    }];
                this.levelSalaryData =
                    [{
                        order: "",
                        number: "",
                        date: "",
                        level: "",
                        desc: "",
                        meaning: "",
                    }];

                this.studyData =
                    [{
                        studyAt: "",
                        duration: "",
                        grade: "",
                        where: "",
                        graduatedYear: "",
                    }];


                if (this.$refs["schTeacherFormAdd"]) {
                    this.$refs["schTeacherFormAdd"].resetFields();
                    this.schTeacherForm = {
                        name: "",
                        latinName: "",
                        gender: "",
                        nationality: "",
                        nation: "",
                        status: "",
                        dob: "",

                        village: "",
                        commune: "",
                        district: "",
                        province: "",
                        homeNoCurrent: "",
                        groupCurrent: "",
                        villageCurrent: "",
                        communeCurrent: "",
                        districtCurrent: "",
                        provinceCurrent: "",
                        occupation: "",
                        occupationPlace: "",

                        degree: "",
                        degreeYear: "",
                        phoneNumber: "",

                        faName: "",
                        faYob: "",
                        faNationality: "",
                        faNation: "",
                        faIsDie: false,
                        faOccupation: "",

                        moName: "",
                        moYob: "",
                        moNationality: "",
                        moNation: "",
                        moIsDie: false,
                        moOccupation: "",
                        address: "",

                        cousin: [],
                        personalStudy: []

                    };
                }

                if (this.$refs["schTeacherFormUpdate"]) {
                    this.$refs["schTeacherFormUpdate"].resetFields();
                    this.schTeacherForm = {
                        name: "",
                        latinName: "",
                        gender: "",
                        nationality: "",
                        nation: "",
                        status: "",
                        dob: "",

                        village: "",
                        commune: "",
                        district: "",
                        province: "",
                        homeNoCurrent: "",
                        groupCurrent: "",
                        villageCurrent: "",
                        communeCurrent: "",
                        districtCurrent: "",
                        provinceCurrent: "",
                        occupation: "",
                        occupationPlace: "",

                        degree: "",
                        degreeYear: "",
                        phoneNumber: "",

                        faName: "",
                        faYob: "",
                        faNationality: "",
                        faNation: "",
                        faIsDie: false,
                        faOccupation: "",

                        moName: "",
                        moYob: "",
                        moNationality: "",
                        moNation: "",
                        moIsDie: false,
                        moOccupation: "",
                        address: "",

                        cousin: [],
                        personalStudy: []

                    };

                }

            }
        },
        created() {
            this.isSearching = true;
            this.postitionOpt();
            this.queryData();
            Meteor.subscribe('Sch_TeacherReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['teacher'];
                return data;
            }
        }
    }
</script>