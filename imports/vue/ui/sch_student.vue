<template>
    <div class="sch_student">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddSchStudent = true,resetForm(),popUpAdd()">
                            <i class="fa fa-plus"></i> {{langConfig['title']}}
                        </a>
                    </h4>
                </el-col>
                <el-col :span="16" style="text-align: right; margin-right: 10px">
                    <br>
                    <el-row type="flex" justify="center">
                        <el-col :span="8"></el-col>
                        <el-col :span="4"></el-col>
                        <el-col :span="12">
                            <el-input
                                    :placeholder="langConfig['searchHere']"
                                    suffix-icon="el-icon-search"
                                    v-model="searchData"
                            >
                                <el-select v-model="sortItem" slot="prepend"
                                           :placeholder="langConfig['chooseItem']"
                                >
                                    <el-option
                                            v-for="item in sortItemList"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                            :disabled="item.disabled">
                                    </el-option>
                                </el-select>
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
                        :data="schStudentData"
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
                            prop="personal.code"
                            :label="langConfig['code']">
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
                    <!--  <el-table-column
                              :label="langConfig['image']"
                              fit="true"

                      >
                          <template slot-scope="scope">
                              <img :src="scope.row.imgUrl" alt="" @click="handlePictureCardPreview(scope.row.imgUrl)"
                                   style="width: 30% !important; height: 30% !important;">
                          </template>
                      </el-table-column>-->
                    <el-table-column
                            :label="langConfig['action']"
                            width="120"

                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removeSchStudent(scope.$index,scope.row,schStudentData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findSchStudentById(scope),dialogUpdateSchStudent= true"
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
                :visible.sync="dialogAddSchStudent"
                :fullscreen="fullscreen"
        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="schStudentForm" :rules="rules" ref="schStudentFormAdd" label-width="120px"
                     class="schStudentForm">
                <el-row>
                    <el-col :span="10">
                        <p><b><i class="material-icons">
                            perm_identity
                        </i> {{langConfig['personalInfo']}}</b>
                            <!--  <el-date-picker
                                      v-model="schStudentForm.yearFrom"
                                      type="year"
                                      placeholder="Pick start year">
                              </el-date-picker>
                              To
                              <el-date-picker
                                      v-model="schStudentForm.yearTo"
                                      type="year"
                                      placeholder="Pick end year">
                              </el-date-picker>-->
                        </p>
                        <hr>
                        <el-row>
                            <el-col :span="24">
                                <el-row>
                                    <el-col :span="14">
                                        <el-form-item :label="langConfig['name']" prop="name">
                                            <el-input v-model="schStudentForm.name"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="10">
                                        <el-form-item :label="langConfig['code']" prop="code">
                                            <el-input v-model="schStudentForm.code"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col :span="14">
                                        <el-form-item :label="langConfig['latinName']" prop="latinName">
                                            <el-input v-model="schStudentForm.latinName"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="10">
                                        <el-form-item :label="langConfig['dob']" prop="dob">
                                            <el-date-picker
                                                    v-model="schStudentForm.dob"
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
                                            <el-radio-group v-model="schStudentForm.gender">
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
                                                       v-model="schStudentForm.status"
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
                                            <el-input v-model="schStudentForm.nationality"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['nation']" prop="nation">
                                            <el-input v-model="schStudentForm.nation"></el-input>
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
                                                <el-input v-model="schStudentForm.village"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['commune']" prop="commune">
                                                <el-input v-model="schStudentForm.commune"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['district']" prop="district">
                                                <el-input v-model="schStudentForm.district"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['province']" prop="province">
                                                <el-input v-model="schStudentForm.province"></el-input>
                                            </el-form-item>
                                        </el-col>
                                    </el-row>
                                </el-card>
                                <br>
                                <el-row>
                                    <!--<el-col :span="12">
                                        <el-form-item :label="langConfig['level']" prop="level">
                                            <el-select style="display: block !important;"
                                                       filterable
                                                       v-model="schStudentForm.level"
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
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['program']" prop="programId">
                                            <el-select style="display: block !important;"
                                                       filterable
                                                       v-model="schStudentForm.programId"
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
                                    </el-col>-->
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['fromSchool']" prop="fromSchool">
                                            <el-input v-model="schStudentForm.fromSchool"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['provinceSchool']" prop="provinceSchool">
                                            <el-input v-model="schStudentForm.provinceSchool"></el-input>
                                        </el-form-item>
                                    </el-col>


                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['occupation']" prop="occupation">
                                            <el-input v-model="schStudentForm.occupation"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['occupationPlace']" prop="occupationPlace">
                                            <el-input v-model="schStudentForm.occupationPlace"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-card class="box-card">
                                    <div slot="header" class="clearfix">
                                        <span style="line-height: 36px;">{{langConfig['address']}}</span>
                                    </div>
                                    <el-row>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['homeNo']" prop="homeNoCurrent">
                                                <el-input v-model="schStudentForm.homeNoCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['group']" prop="groupCurrent">
                                                <el-input v-model="schStudentForm.groupCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['village']" prop="villageCurrent">
                                                <el-input v-model="schStudentForm.villageCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['commune']" prop="communeCurrent">
                                                <el-input v-model="schStudentForm.communeCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['district']" prop="districtCurrent">
                                                <el-input v-model="schStudentForm.districtCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['province']" prop="provinceCurrent">
                                                <el-input v-model="schStudentForm.provinceCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                    </el-row>
                                </el-card>
                                <br>
                                <el-row>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['degree']" prop="degree">
                                            <el-input v-model="schStudentForm.degree"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['degreeYear']" prop="degreeYear">
                                            <el-input v-model="schStudentForm.degreeYear"></el-input>
                                        </el-form-item>
                                    </el-col>
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
                                    <el-input v-model="schStudentForm.faName"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['bornYear']" prop="faYob">
                                    <el-input v-model="schStudentForm.faYob" type="number"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['nationality']" prop="faNationality">
                                    <el-input v-model="schStudentForm.faNationality"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['nation']" prop="faNation">
                                    <el-input v-model="schStudentForm.faNation"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['isDie']" prop="faIsDie">
                                    <el-switch
                                            v-model="schStudentForm.faIsDie"
                                            active-color="#13ce66"
                                            inactive-color="#ff4949"
                                    >
                                    </el-switch>

                                </el-form-item>
                                <el-form-item :label="langConfig['occupation']" prop="faOccupation">
                                    <el-input v-model="schStudentForm.faOccupation"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item :label="langConfig['moName']" prop="moName">
                                    <el-input v-model="schStudentForm.moName"></el-input>
                                </el-form-item>

                                <el-form-item :label="langConfig['bornYear']" prop="moYob">
                                    <el-input v-model="schStudentForm.moYob" type="number"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['nationality']" prop="moNationality">
                                    <el-input v-model="schStudentForm.moNationality"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['nation']" prop="moNation">
                                    <el-input v-model="schStudentForm.moNation"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['isDie']" prop="moIsDie">
                                    <el-switch
                                            v-model="schStudentForm.moIsDie"
                                            active-color="#13ce66"
                                            inactive-color="#ff4949"
                                    >
                                    </el-switch>
                                </el-form-item>
                                <el-form-item :label="langConfig['occupation']" prop="moOccupation">
                                    <el-input v-model="schStudentForm.moOccupation"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="24">
                                <el-form-item :label="langConfig['address']" prop="address">
                                    <el-input v-model="schStudentForm.address"></el-input>
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
                        <br>
                        <br>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item :label="langConfig['personalContract']" prop="personalContract">
                                    <el-input type="textarea" v-model="schStudentForm.personalContract"></el-input>
                                </el-form-item>

                                <el-form-item :label="langConfig['note']" prop="note">
                                    <el-input type="textarea" v-model="schStudentForm.note"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['phoneNumber']" prop="phoneNumber">
                                    <el-input v-model="schStudentForm.phoneNumber"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="4"></el-col>
                            <el-col :span="8" style="float: right !important;">
                                <!-- <croppa v-model="thumbImgCroppa"
                                         :width="151.18110236"
                                         :height="226.77165354"
                                         :quality="1"
                                         :canvas-color="'teal'"
                                         :file-size-limit="3096000"
                                         accept=".jpg,.jpeg,.png"
                                         :loading-end="generateThumbImgUrl"
                                         placeholder="Upload Image 4 x 6"
                                         :placeholder-color="'black'"
                                         :placeholder-font-size="16"
                                         @image-remove="handleThumbImgRemove"
                                         @move="handleThumbImgCroppaMove"
                                         @zoom="handleThumbImgCroppaZoom"
                                         :zoom-speed="10"
                                         crossOrigin="anonymous"
                                 >
                                 </croppa>-->
                            </el-col>
                        </el-row>
                        <br><br>
                    </el-col>
                </el-row>


            </el-form>
            <span slot="footer" class="dialog-footer fix-dialog-footer">
                <hr style="margin-top: 0px !important;">
                <el-row>
                    <el-col :span="12" style="text-align: left !important;">
                        <el-button type="danger" @click="dialogAddSchStudent= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">
                         <el-button type="primary" @click.native="saveSchStudent($event)"><i
                                 class="el-icon-circle-check"> </i>&nbsp; {{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                    </el-col>
                </el-row>
            </span>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdateSchStudent"
                :fullscreen="fullscreen"
        >
            <hr style="margin-top: 0px !important;border-top: 2px solid teal">
            <el-form :model="schStudentForm" :rules="rules" ref="schStudentFormUpdate" label-width="120px"
                     class="schStudentForm">
                <el-row>
                    <el-col :span="10">
                        <p><b><i class="material-icons">
                            perm_identity
                        </i> {{langConfig['personalInfo']}}</b>
                            <!--<el-date-picker
                                    v-model="schStudentForm.yearFrom"
                                    type="year"
                                    placeholder="Pick start year">
                            </el-date-picker>
                            To
                            <el-date-picker
                                    v-model="schStudentForm.yearTo"
                                    type="year"
                                    placeholder="Pick end year">
                            </el-date-picker>-->
                        </p>
                        <hr>
                        <el-row>
                            <el-col :span="24">

                                <el-row>
                                    <el-col :span="14">
                                        <el-form-item :label="langConfig['name']" prop="name">
                                            <el-input v-model="schStudentForm.name"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="10">
                                        <el-form-item :label="langConfig['code']" prop="code">
                                            <el-input v-model="schStudentForm.code"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-row>
                                    <el-col :span="14">
                                        <el-form-item :label="langConfig['latinName']" prop="latinName">
                                            <el-input v-model="schStudentForm.latinName"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="10">
                                        <el-form-item :label="langConfig['dob']" prop="dob">
                                            <el-date-picker
                                                    v-model="schStudentForm.dob"
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
                                            <el-radio-group v-model="schStudentForm.gender">
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
                                                       v-model="schStudentForm.status"
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
                                            <el-input v-model="schStudentForm.nationality"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['nation']" prop="nation">
                                            <el-input v-model="schStudentForm.nation"></el-input>
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
                                                <el-input v-model="schStudentForm.village"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['commune']" prop="commune">
                                                <el-input v-model="schStudentForm.commune"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['district']" prop="district">
                                                <el-input v-model="schStudentForm.district"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['province']" prop="province">
                                                <el-input v-model="schStudentForm.province"></el-input>
                                            </el-form-item>
                                        </el-col>
                                    </el-row>
                                </el-card>
                                <br>
                                <el-row>
                                    <!--<el-col :span="12">
                                        <el-form-item :label="langConfig['level']" prop="level">
                                            <el-select style="display: block !important;"
                                                       filterable
                                                       v-model="schStudentForm.level"
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
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['program']" prop="programId">
                                            <el-select style="display: block !important;"
                                                       filterable
                                                       v-model="schStudentForm.programId"
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
                                    </el-col>-->
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['fromSchool']" prop="fromSchool">
                                            <el-input v-model="schStudentForm.fromSchool"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['provinceSchool']" prop="provinceSchool">
                                            <el-input v-model="schStudentForm.provinceSchool"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['occupation']" prop="occupation">
                                            <el-input v-model="schStudentForm.occupation"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['occupationPlace']" prop="occupationPlace">
                                            <el-input v-model="schStudentForm.occupationPlace"></el-input>
                                        </el-form-item>
                                    </el-col>
                                </el-row>
                                <el-card class="box-card">
                                    <div slot="header" class="clearfix">
                                        <span style="line-height: 36px;">{{langConfig['address']}}</span>
                                    </div>
                                    <el-row>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['homeNo']" prop="homeNoCurrent">
                                                <el-input v-model="schStudentForm.homeNoCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['group']" prop="groupCurrent">
                                                <el-input v-model="schStudentForm.groupCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['village']" prop="villageCurrent">
                                                <el-input v-model="schStudentForm.villageCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['commune']" prop="communeCurrent">
                                                <el-input v-model="schStudentForm.communeCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['district']" prop="districtCurrent">
                                                <el-input v-model="schStudentForm.districtCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="12">
                                            <el-form-item :label="langConfig['province']" prop="provinceCurrent">
                                                <el-input v-model="schStudentForm.provinceCurrent"></el-input>
                                            </el-form-item>
                                        </el-col>
                                    </el-row>
                                </el-card>
                                <br>
                                <el-row>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['degree']" prop="degree">
                                            <el-input v-model="schStudentForm.degree"></el-input>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="12">
                                        <el-form-item :label="langConfig['degreeYear']" prop="degreeYear">
                                            <el-input v-model="schStudentForm.degreeYear"></el-input>
                                        </el-form-item>
                                    </el-col>
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
                                    <el-input v-model="schStudentForm.faName"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['bornYear']" prop="faYob">
                                    <el-input v-model="schStudentForm.faYob" type="number"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['nationality']" prop="faNationality">
                                    <el-input v-model="schStudentForm.faNationality"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['nation']" prop="faNation">
                                    <el-input v-model="schStudentForm.faNation"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['isDie']" prop="faIsDie">
                                    <el-switch
                                            v-model="schStudentForm.faIsDie"
                                            active-color="#13ce66"
                                            inactive-color="#ff4949"
                                    >
                                    </el-switch>

                                </el-form-item>
                                <el-form-item :label="langConfig['occupation']" prop="faOccupation">
                                    <el-input v-model="schStudentForm.faOccupation"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item :label="langConfig['moName']" prop="moName">
                                    <el-input v-model="schStudentForm.moName"></el-input>
                                </el-form-item>

                                <el-form-item :label="langConfig['bornYear']" prop="moYob">
                                    <el-input v-model="schStudentForm.moYob" type="number"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['nationality']" prop="moNationality">
                                    <el-input v-model="schStudentForm.moNationality"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['nation']" prop="moNation">
                                    <el-input v-model="schStudentForm.moNation"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['isDie']" prop="moIsDie">
                                    <el-switch
                                            v-model="schStudentForm.moIsDie"
                                            active-color="#13ce66"
                                            inactive-color="#ff4949"
                                    >
                                    </el-switch>
                                </el-form-item>
                                <el-form-item :label="langConfig['occupation']" prop="moOccupation">
                                    <el-input v-model="schStudentForm.moOccupation"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="24">
                                <el-form-item :label="langConfig['address']" prop="address">
                                    <el-input v-model="schStudentForm.address"></el-input>
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
                        <br>
                        <br>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item :label="langConfig['personalContract']" prop="personalContract">
                                    <el-input type="textarea" v-model="schStudentForm.personalContract"></el-input>
                                </el-form-item>

                                <el-form-item :label="langConfig['note']" prop="note">
                                    <el-input type="textarea" v-model="schStudentForm.note"></el-input>
                                </el-form-item>
                                <el-form-item :label="langConfig['phoneNumber']" prop="phoneNumber">
                                    <el-input v-model="schStudentForm.phoneNumber"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="4"></el-col>
                            <el-col :span="8" style="float: right !important;">
                                <!--<croppa v-model="thumbImgCroppa"
                                        :width="151.18110236"
                                        :height="226.77165354"
                                        :quality="1"
                                        :canvas-color="'teal'"
                                        :file-size-limit="3096000"
                                        accept=".jpg,.jpeg,.png"
                                        :loading-end="generateThumbImgUrl"
                                        placeholder=""
                                        :placeholder-color="'black'"
                                        :placeholder-font-size="16"
                                        @image-remove="handleThumbImgRemove"
                                        @move="handleThumbImgCroppaMove"
                                        @zoom="handleThumbImgCroppaZoom"
                                        :zoom-speed="10"
                                        crossOrigin="anonymous"

                                >
                                    &lt;!&ndash;<img :src="imgUrlUpdate" crossOrigin="anonymous"
                                         slot="initial">&ndash;&gt;&lt;!&ndash;
                                    <img :src="imgUrlUpdate"
                                         slot="placeholder">&ndash;&gt;
                                </croppa>-->
                            </el-col>
                        </el-row>
                        <br><br>
                    </el-col>
                </el-row>

            </el-form>
            <span slot="footer" class="dialog-footer fix-dialog-footer"
            >
                <hr style="margin-top: 0px !important;">
                <el-row>
                    <el-col :span="12" style="text-align: left !important;">
                        <el-button type="danger" @click="dialogUpdateSchStudent= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">
                         <el-button type="primary" @click.native="updateSchStudent(schStudentId)"><i
                                 class="el-icon-circle-check"> </i>&nbsp; {{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                    </el-col>
                </el-row>
            </span>
        </el-dialog>

        <el-dialog :visible.sync="dialogVisible" width="30%">
            <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label-sch'
    import storagePath from '../../firebase/storage_path';
    import firebase from '../../firebase/config';
    import sha256 from 'sha256';
    import {Sch_StudentReact} from "../../collection/schStudent";

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
                Sch_StudentReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                dialogImageUrl: '',
                dialogVisible: false,
                fullscreen: true,
                langSession: null,
                schStudentData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddSchStudent: false,
                dialogUpdateSchStudent: false,
                schStudentId: "",
                imgUrl: "",
                imgUrlUpdate: "",
                thumbImgCroppa: null,
                sortItem: "createdAt",
                sortItemList: [
                    {label: "Created At", value: "createdAt"},
                    {label: "Latin Name", value: "latinName"},
                    {label: "Name", value: "name"},
                ],
                cousinData: [{
                    name: "",
                    gender: "",
                    age: "",
                    occupation: ""
                }],
                studyData: [{
                    studyAt: "",
                    duration: "",
                    grade: "Un Range",
                    where: "",
                    graduatedYear: "",
                }],


                genderList: [
                    {value: "Male", label: "Male"},
                    {value: "Female", label: "Female"}
                ],
                statusList:
                    [
                        {value: "Single", label: "Single"},
                        {value: "Married", label: "Married"}
                    ],
                schStudentForm:
                    {
                        name: "",
                        latinName: "",
                        code: "",
                        gender: "",
                        nationality: "",
                        nation: "",
                        status: "",
                        dob: "",
                        dobName: "",
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
                        personalStudy: [],
                        personalContract: "",
                        note: "",
                        fromSchool: "",
                        provinceSchool: ""
                    }
                ,
                rules: {
                    "name":
                        [{required: true, message: 'Please input name', trigger: 'blur'}],
                    "latinName":
                        [{required: true, message: 'Please input latin name', trigger: 'blur'}],

                    "code":
                        [{required: true, message: 'Please input code', trigger: 'blur'}],

                    "dob":
                        [{required: true, message: 'Please input dob', trigger: 'blur'}],


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
            'thumbImgCroppa.loading'(val) {
                if (!val) {
                    this.generateThumbImgUrl();
                }
            },
            "sortItem"(val) {
                let vm = this;
                this.sortItem = val;
                this.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
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
                Meteor.call('querySchStudent', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10},
                    sortItem: this.sortItem
                }, (err, result) => {
                    if (!err) {
                        this.schStudentData = result.content;
                        this.count = result.countSchStudent;
                    }
                    this.isSearching = false;
                });
            }, 300),
            indexMethod(index) {
                return index + 1;
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
            saveSchStudent(event) {
                event.preventDefault();
                let vm = this;
                this.$refs["schStudentFormAdd"].validate((valid) => {
                    if (valid) {

                        let personal = {
                            name: vm.schStudentForm.name,
                            code: vm.schStudentForm.code,
                            latinName: vm.schStudentForm.latinName,
                            gender: vm.schStudentForm.gender,
                            nationality: vm.schStudentForm.nationality,
                            nation: vm.schStudentForm.nation,
                            status: vm.schStudentForm.status,
                            dob: vm.schStudentForm.dob,
                            dobName: moment(vm.schStudentForm.dob).format("DD//MM/YYYY"),
                            homeNo: vm.schStudentForm.homeNo,
                            village: vm.schStudentForm.village,
                            commune: vm.schStudentForm.commune,
                            district: vm.schStudentForm.district,
                            province: vm.schStudentForm.province,
                            occupation: vm.schStudentForm.occupation,
                            homeNoCurrent: vm.schStudentForm.homeNoCurrent,
                            groupCurrent: vm.schStudentForm.groupCurrent,
                            villageCurrent: vm.schStudentForm.villageCurrent,
                            communeCurrent: vm.schStudentForm.communeCurrent,
                            districtCurrent: vm.schStudentForm.districtCurrent,
                            provinceCurrent: vm.schStudentForm.provinceCurrent,
                            occupationPlace: vm.schStudentForm.occupationPlace,

                            degree: vm.schStudentForm.degree,
                            degreeYear: vm.schStudentForm.degreeYear,
                            phoneNumber: vm.schStudentForm.phoneNumber
                        };


                        let family = {};
                        let personalStudy = [];
                        let cousin = [];

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

                        let parent = {
                            faName: vm.schStudentForm.faName,
                            faYob: vm.schStudentForm.faYob,
                            faNationality: vm.schStudentForm.faNationality,
                            faNation: vm.schStudentForm.faNation,
                            faIsDie: vm.schStudentForm.faIsDie,
                            faOccupation: vm.schStudentForm.faOccupation,

                            moName: vm.schStudentForm.moName,
                            moYob: vm.schStudentForm.moYob,
                            moNationality: vm.schStudentForm.moNationality,
                            moNation: vm.schStudentForm.moNation,
                            moIsDie: vm.schStudentForm.moIsDie,
                            moOccupation: vm.schStudentForm.moOccupation,
                            address: vm.schStudentForm.address,
                        };
                        family.parent = parent;
                        family.cousin = cousin;
                        let schStudentDoc = {
                            personal: personal,
                            family: family,
                            personalStudy: personalStudy,
                            note: vm.schStudentForm.note,
                            personalContract: vm.schStudentForm.personalContract,
                            fromSchool: vm.schStudentForm.fromSchool,
                            provinceSchool: vm.schStudentForm.provinceSchool,
                            rolesArea: Session.get('area')
                        };

                        Meteor.call("insertSchStudent", schStudentDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['saveSuccess'],
                                    type: 'success'
                                });
                                if (vm.imgUrl) {
                                    const storageRef = storagePath.student(firebase.storage, Meteor.userId(), result);
                                    let uploadTask = storageRef
                                        .child("student")
                                        .putString(this.imgUrl, "data_url");
                                    uploadTask.on(
                                        "state_changed",
                                        function (snapshot) {
                                            // Observe state change events such as progress, pause, and resume
                                            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                                            var progress =
                                                snapshot.bytesTransferred / snapshot.totalBytes * 100;
                                            console.log("Upload is " + progress + "% done");
                                            switch (snapshot.state) {
                                                case firebase.storageState.PAUSED: // or 'paused'
                                                    console.log("Upload is paused");
                                                    break;
                                                case firebase.storageState.RUNNING: // or 'running'
                                                    console.log("Upload is running " + progress);
                                                    break;
                                            }
                                        },
                                        function (error) {
                                            /*setTimeout(() => {
                                                loading.close();
                                            }, 1000)*/
                                        },
                                        function () {
                                            uploadTask.snapshot.ref.getDownloadURL()
                                                .then(url => {
                                                    Meteor.call('sch_updateStudentImageURlById', result, url, (err, re) => {
                                                        if (err) {
                                                            console.log(err.message);
                                                        } else {
                                                            vm.thumbImgCroppa = null;
                                                        }
                                                    });
                                                }).catch(err => console.log(err));
                                        });
                                }
                                vm.dialogAddSchStudent = false;
                                vm.sortItem = "createdAt";
                                vm.$refs["schStudentFormAdd"].resetFields();
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
            updateSchStudent(_id) {
                let vm = this;
                this.$refs["schStudentFormUpdate"].validate((valid) => {
                    if (valid) {
                        let personal = {
                            name: vm.schStudentForm.name,
                            code: vm.schStudentForm.code,
                            latinName: vm.schStudentForm.latinName,
                            gender: vm.schStudentForm.gender,
                            nationality: vm.schStudentForm.nationality,
                            nation: vm.schStudentForm.nation,
                            status: vm.schStudentForm.status,
                            dob: vm.schStudentForm.dob,
                            dobName: moment(vm.schStudentForm.dob).format("DD//MM/YYYY"),
                            homeNo: vm.schStudentForm.homeNo,
                            village: vm.schStudentForm.village,
                            commune: vm.schStudentForm.commune,
                            district: vm.schStudentForm.district,
                            province: vm.schStudentForm.province,
                            occupation: vm.schStudentForm.occupation,
                            homeNoCurrent: vm.schStudentForm.homeNoCurrent,
                            groupCurrent: vm.schStudentForm.groupCurrent,
                            villageCurrent: vm.schStudentForm.villageCurrent,
                            communeCurrent: vm.schStudentForm.communeCurrent,
                            districtCurrent: vm.schStudentForm.districtCurrent,
                            provinceCurrent: vm.schStudentForm.provinceCurrent,
                            occupationPlace: vm.schStudentForm.occupationPlace,

                            degree: vm.schStudentForm.degree,
                            degreeYear: vm.schStudentForm.degreeYear,
                            phoneNumber: vm.schStudentForm.phoneNumber
                        };


                        let family = {};


                        let personalStudy = [];
                        let cousin = [];

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

                        let parent = {
                            faName: vm.schStudentForm.faName,
                            faYob: vm.schStudentForm.faYob,
                            faNationality: vm.schStudentForm.faNationality,
                            faNation: vm.schStudentForm.faNation,
                            faIsDie: vm.schStudentForm.faIsDie,
                            faOccupation: vm.schStudentForm.faOccupation,

                            moName: vm.schStudentForm.moName,
                            moYob: vm.schStudentForm.moYob,
                            moNationality: vm.schStudentForm.moNationality,
                            moNation: vm.schStudentForm.moNation,
                            moIsDie: vm.schStudentForm.moIsDie,
                            moOccupation: vm.schStudentForm.moOccupation,
                            address: vm.schStudentForm.address,
                        };
                        family.parent = parent;
                        family.cousin = cousin;
                        let schStudentDoc = {
                            personal: personal,
                            family: family,
                            personalStudy: personalStudy,
                            note: vm.schStudentForm.note,
                            personalContract: vm.schStudentForm.personalContract,
                            fromSchool: vm.schStudentForm.fromSchool,
                            provinceSchool: vm.schStudentForm.provinceSchool,
                            rolesArea: Session.get('area'),
                            _id: _id
                        };

                        Meteor.call("updateSchStudent", schStudentDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: this.langConfig['updateSuccess'],
                                    type: 'success'
                                });

                                if (vm.imgUrl) {
                                    const storageRef = storagePath.student(firebase.storage, Meteor.userId(), _id);
                                    let uploadTask = storageRef
                                        .child("student")
                                        .putString(this.imgUrl, "data_url");
                                    uploadTask.on(
                                        "state_changed",
                                        function (snapshot) {
                                            // Observe state change events such as progress, pause, and resume
                                            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                                            var progress =
                                                snapshot.bytesTransferred / snapshot.totalBytes * 100;
                                            console.log("Upload is " + progress + "% done");
                                            switch (snapshot.state) {
                                                case firebase.storageState.PAUSED: // or 'paused'
                                                    console.log("Upload is paused");
                                                    break;
                                                case firebase.storageState.RUNNING: // or 'running'
                                                    console.log("Upload is running " + progress);
                                                    break;
                                            }
                                        },
                                        function (error) {
                                            /*setTimeout(() => {
                                                loading.close();
                                            }, 1000)*/
                                        },
                                        function () {
                                            uploadTask.snapshot.ref.getDownloadURL()
                                                .then(url => {
                                                    Meteor.call('sch_updateStudentImageURlById', _id, url, (err, re) => {
                                                        if (err) {
                                                            console.log(err.message);
                                                        } else {
                                                        }
                                                    });
                                                }).catch(err => console.log(err));
                                        });
                                }

                                vm.dialogUpdateSchStudent = false;

                                vm.$refs["schStudentFormUpdate"].resetFields();
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
            removeSchStudent(index, row, rows) {
                let vm = this;
                this.$confirm(this.langConfig['messageWarning'], this.langConfig['warning'], {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeSchStudent", row._id, (err, result) => {
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
            findSchStudentById(doc) {
                let vm = this;
                Meteor.call("querySchStudentById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.schStudentId = result._id;
                        vm.schStudentForm.personal = result.personal;


                        vm.schStudentForm.name = result.personal.name;
                        vm.schStudentForm.code = result.personal.code;
                        vm.schStudentForm.latinName = result.personal.latinName;
                        vm.schStudentForm.gender = result.personal.gender;
                        vm.schStudentForm.nationality = result.personal.nationality;
                        vm.schStudentForm.nation = result.personal.nation;
                        vm.schStudentForm.status = result.personal.status;
                        vm.schStudentForm.dob = result.personal.dob;
                        vm.schStudentForm.village = result.personal.village;
                        vm.schStudentForm.commune = result.personal.commune;
                        vm.schStudentForm.district = result.personal.district;
                        vm.schStudentForm.province = result.personal.province;
                        vm.schStudentForm.homeNoCurrent = result.personal.homeNoCurrent;
                        vm.schStudentForm.groupCurrent = result.personal.groupCurrent;
                        vm.schStudentForm.villageCurrent = result.personal.villageCurrent;
                        vm.schStudentForm.communeCurrent = result.personal.communeCurrent;
                        vm.schStudentForm.districtCurrent = result.personal.districtCurrent;
                        vm.schStudentForm.provinceCurrent = result.personal.provinceCurrent;
                        vm.schStudentForm.occupation = result.personal.occupation;
                        vm.schStudentForm.occupationPlace = result.personal.occupationPlace;
                        vm.schStudentForm.degree = result.personal.degree;
                        vm.schStudentForm.degreeYear = result.personal.degreeYear;
                        vm.schStudentForm.phoneNumber = result.personal.phoneNumber;


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

                        if (result.family.cousin > 0) {
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

                        vm.schStudentForm.faName = result.family.parent.faName;
                        vm.schStudentForm.faYob = result.family.parent.faYob;
                        vm.schStudentForm.faNationality = result.family.parent.faNationality;
                        vm.schStudentForm.faNation = result.family.parent.faNation;
                        vm.schStudentForm.faIsDie = result.family.parent.faIsDie;
                        vm.schStudentForm.faOccupation = result.family.parent.faOccupation;

                        vm.schStudentForm.moName = result.family.parent.moName;
                        vm.schStudentForm.moYob = result.family.parent.moYob;
                        vm.schStudentForm.moNationality = result.family.parent.moNationality;
                        vm.schStudentForm.moNation = result.family.parent.moNation;
                        vm.schStudentForm.moIsDie = result.family.parent.moIsDie;
                        vm.schStudentForm.moOccupation = result.family.parent.moOccupation;
                        vm.schStudentForm.address = result.family.parent.address;

                        vm.schStudentForm.personalContract = result.personalContract;
                        vm.schStudentForm.fromSchool = result.fromSchool;
                        vm.schStudentForm.provinceSchool = result.provinceSchool;
                        vm.schStudentForm.note = result.note;

                        vm.imgUrlUpdate = result.imgUrl;
                        vm.thumbImgCroppa = null;

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
                this.schStudentForm._id = "";
                this.inputTranscriptForm = {};
                this.cousinData =
                    [{
                        name: "",
                        gender: "",
                        age: "",
                        occupation: ""
                    }];
                this.studyData =
                    [{
                        studyAt: "",
                        duration: "",
                        grade: "",
                        where: "",
                        graduatedYear: "",
                    }];
                this.thumbImgCroppa = null;
                this.imgUrl = "";
                this.imgUrlUpdate = "";

                if (this.$refs["schStudentFormAdd"]) {
                    this.$refs["schStudentFormAdd"].resetFields();
                    this.schStudentForm = {
                        name: "",
                        code: "",
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
                        personalStudy: [],
                        personalContract: "",
                        fromSchool: "",
                        provinceSchool: "",
                        note: ""

                    };
                }

                if (this.$refs["schStudentFormUpdate"]) {
                    this.$refs["schStudentFormUpdate"].resetFields();
                    this.schStudentForm = {
                        name: "",
                        code: "",
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
                        personalStudy: [],
                        personalContract: "",
                        fromSchool: "",
                        provinceSchool: "",
                        note: ""

                    };

                }

            },
            popUpAdd() {
                let vm = this;
                Meteor.call("sch_getIdStudent", Session.get("area"), (err, result) => {
                        if (result) {
                            vm.schStudentForm.code = result;
                        }
                    }
                )
            },
            generateThumbImgUrl: function () {
                console.log(this.thumbImgCroppa);
                let url = this.thumbImgCroppa && this.thumbImgCroppa.generateDataUrl();
                console.log(this.url);

                if (!url) {
                    return
                }
                this.imgUrl = url
            },
            handleThumbImgCroppaZoom() {
                this.generateThumbImgUrl();
            },
            handleThumbImgCroppaMove() {
                this.generateThumbImgUrl();
            },
            handleThumbImgRemove() {
                this.imgUrl = null
            },
            handlePictureCardPreview(url) {
                this.dialogImageUrl = url;
                this.dialogVisible = true;
            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            Meteor.subscribe('Sch_StudentReact');


        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['student'];
                return data;
            }
        }
    }
</script>