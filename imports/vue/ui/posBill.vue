<template>
    <div class="pos_Bill">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer"
                           @click="popupPosBillAdd(),dialogAddPosBill= true,resetForm()"
                        >
                            <i class="fa fa-plus"></i> {{langConfig['bill']}}
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
                        :data="posBillDataDisplay"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="billDateName"
                            :label="langConfig['billDate']"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="billNo"
                            :label="langConfig['billNo']"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="vendorDoc.name"
                            :label="langConfig['vendor']">
                    </el-table-column>
                    <el-table-column
                            prop="total"
                            :label="langConfig['total']">
                    </el-table-column>
                    <el-table-column
                            prop="note"
                            :label="langConfig['note']"
                    >
                    </el-table-column>
                    <el-table-column
                            prop="status"
                            :label="langConfig['status']"
                            width="150"
                            filter-placement="bottom-end">
                        <template slot-scope="scope">
                            <el-tag
                                    :type="scope.row.status === 'Active' ? 'primary' : scope.row.status === 'Partial' ? 'warning' : 'success'"
                                    close-transition>{{scope.row.status}}
                            </el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column
                            :label="langConfig['action']"
                            width="160"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removePosBill(scope.$index,scope.row,posBillDataDisplay)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="popupPosBillUpdate(scope.$index,scope.row,scope)"
                                           :disabled="disabledUpdate"></el-button>
                                <el-button type="success" icon="el-icon-view" size="small" class="cursor-pointer"
                                           @click="popupPosBillShow(scope.row)"></el-button>
                            </el-button-group>
                        </template>
                    </el-table-column>

                </el-table>
                <!--Pagination-->
                <br>
                <el-row type="flex" class="row-bg" justify="center">
                    <el-col :span="24" style="text-align: center;">
                        <div class="block">
                            <el-pagination @size-change="handleSizeChange" background
                                           @current-change="handleCurrentChange"
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
                @close="handleCloseModal"
                :title="langConfig['addBill']"
                :visible.sync="dialogAddPosBill"
                :fullscreen="fullScreen"
                class="dialogBill"
        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posBillForm" :rules="rules" :ref="refForm" label-width="120px"
                     :label-position="labelPosition"
                     class="posBillForm">
                <el-row :gutter="20">
                    <el-col :span="18" class="posBillForm">
                        <table class="table table-responsive​​​ table-striped table-hover responstable">
                            <thead>
                            <tr>
                                <th colspan="2" style="width: 30% !important;">
                                    <el-form-item label="" prop="locationId">

                                        <el-select style="display: block !important"
                                                   filterable clearable
                                                   v-model="posBillForm.locationId"
                                                   :placeholder="langConfig['chooseLocation']">
                                            <el-option
                                                    v-for="item in locationOption"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value"
                                                    :disabled="item.disabled">
                                            </el-option>
                                        </el-select>
                                    </el-form-item>
                                </th>
                                <th style="width: 20% !important;">
                                    <el-form-item label="">
                                        <el-input :placeholder="langConfig['barcode']" :disabled="disabledItem"
                                                  v-model="posBillForm.code" autofocus
                                                  @keyup.native.13="addToPosBillData(null)"
                                        >
                                        </el-input>
                                    </el-form-item>
                                </th>
                                <th style="width: 20% !important;">
                                    <el-form-item label="">
                                        <el-select style="display: block !important;"
                                                   filterable clearable :remote-method="itemOpt"
                                                   v-model="posBillForm.itemId" :disabled="disabledItem"
                                                   :placeholder="langConfig['chooseItem']">
                                            <el-option
                                                    v-for="item in itemOption"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value"
                                                    :disabled="item.disabled">
                                            </el-option>
                                        </el-select>
                                    </el-form-item>
                                </th>

                                <th>
                                    <el-form-item label="">
                                        <el-input :placeholder="langConfig['total']" v-model.number="posBillForm.total"
                                                  disabled>
                                            <template slot="append">{{currencySymbol}}</template>
                                        </el-input>
                                    </el-form-item>
                                </th>
                                <th style="vertical-align: middle">
                                    <el-form-item label="">

                                        : {{langConfig['total']}}
                                    </el-form-item>
                                </th>
                            </tr>
                            </thead>
                            <thead>
                            <tr>
                                <th>{{langConfig['no']}}</th>
                                <th>{{langConfig['name']}}</th>
                                <th>{{langConfig['cost']}}</th>
                                <th>{{langConfig['qty']}}</th>
                                <th colspan="2">{{langConfig['amount']}}</th>
                            </tr>
                            </thead>
                            <tr v-for="(posBillDoc,index ) in this.posBillData" :key="index">
                                <td style="vertical-align: middle">{{index + 1}}</td>
                                <td style="vertical-align: middle">{{posBillDoc.itemName}}</td>
                                <td>
                                    <el-input placeholder="Please input Cost" v-model.number=posBillDoc.cost
                                              type='number'
                                              @keyup.native="updatePosBillDetail(posBillDoc, index)"
                                              @change="updatePosBillDetail(posBillDoc, index)"></el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Please input Qty" v-model.number=posBillDoc.qty type='number'
                                              @keyup.native="updatePosBillDetail(posBillDoc, index)" :min="numMini"
                                              @change="updatePosBillDetail(posBillDoc, index)"
                                    >
                                        <template slot="append">{{posBillDoc.unitName || ""}}</template>


                                    </el-input>
                                </td>

                                <td>
                                    <el-input :placeholder="langConfig['amount']" v-model.number=posBillDoc.amount
                                              disabled>
                                        <template slot="append" v-if="phoneShop===false">
                                            <el-dropdown trigger="click" :hide-on-click="false">
                                                    <span class="el-dropdown-link">
                                                        <span v-if="phoneShop===false">{{langConfig['des']}}</span>
                                                        <span v-if="phoneShop===true">{{langConfig['imei']}}</span>
                                                         <span v-if="posBillDoc.desc==''">
                                                                <i class="el-icon-caret-bottom el-icon--right"></i>
                                                            </span>
                                                            <span v-else>
                                                                <i class="el-icon-circle-check el-icon--right"
                                                                   style="color: blue"></i>

                                                            </span>
                                                    </span>
                                                <el-dropdown-menu slot="dropdown">
                                                    <el-dropdown-item class="clearfix">
                                                        <el-input v-if="phoneShop===false"
                                                                  :placeholder="langConfig['des']"
                                                                  type="textarea"
                                                                  v-model.number=posBillDoc.desc
                                                                  @keyup.native="updatePosBillDetail(posBillDoc, index)"></el-input>
                                                        <el-input v-if="phoneShop===true"
                                                                  :placeholder="langConfig['imei']"
                                                                  type="textarea"
                                                                  v-model.number=posBillDoc.desc
                                                                  @keyup.native="updatePosBillDetail(posBillDoc, index)"></el-input>
                                                    </el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </template>
                                        <template slot="append" v-if="phoneShop===true">
                                            <el-button slot="append" type="primary" icon="el-icon-plus"
                                                       @click.native="popUpAddImei(posBillDoc,index)"
                                            >
                                                 <span class="el-dropdown-link">
                                                        {{langConfig['imei']}}
                                                         <span v-if="posBillDoc.desc==''">
                                                                <i
                                                                        class="el-icon-caret-bottom el-icon--right"></i>
                                                            </span>
                                                            <span v-else>
                                                                {{posBillDoc.numImei || 0}} <i
                                                                    class="el-icon-circle-check el-icon--right"
                                                                    style="color: blue"></i>

                                                            </span>
                                                    </span>
                                            </el-button>


                                        </template>
                                    </el-input>
                                </td>
                                <td style="text-align: center;vertical-align: middle">
                                    <el-button type="danger" icon="el-icon-delete" size="small"
                                               @click="removePosBillDetailByIndex(index,posBillDoc)"></el-button>
                                </td>
                            </tr>
                            <thead>
                            <tr>
                                <th colspan="4" style="text-align: right;vertical-align: middle">
                                    {{langConfig['discount']}} :
                                    <el-radio-group v-model="posBillForm.discountType">
                                        <el-radio-button v-for="mt in discountTypeOption" :label="mt.value"
                                                         :key="mt.value"
                                        >
                                            {{langConfig[mt.label]}}
                                        </el-radio-button>
                                    </el-radio-group>
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="Amount Discount" type='number'
                                              v-model.number="posBillForm.discount">
                                        <template slot="append">{{typeDiscount}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="4" style="text-align: right;vertical-align: middle">
                                    {{langConfig['netTotal']}} :
                                </th>
                                <th colspan="2">
                                    <el-input :placeholder="langConfig['netTotal']"
                                              v-model.number="posBillForm.netTotal"
                                              disabled>
                                        <template slot="append">{{currencySymbol}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="4" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidDollar']}}:
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="USD" v-model.number="posBillForm.paidUSD" type='number'
                                              @change="getTotal()" @keyup.native="getTotal()"
                                    >
                                        <el-button slot="append" @click="clickUSD(posBillForm.remainUSD)">
                                            {{posBillForm.remainUSD}} $
                                        </el-button>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="4" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidRiel']}} :
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="KHR" @change="getTotal()" @keyup.native="getTotal()"
                                              v-model.number="posBillForm.paidKHR" type='number'
                                    >
                                        <el-button slot="append" @click="clickKHR(posBillForm.remainKHR)">
                                            {{posBillForm.remainKHR}} ៛
                                        </el-button>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="4" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidBaht']}}:
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="THB" v-model.number="posBillForm.paidTHB" type='number'
                                              @change="getTotal()" @keyup.native="getTotal()"
                                    >
                                        <el-button slot="append" @click="clickTHB(posBillForm.remainTHB)">
                                            {{posBillForm.remainTHB}} B
                                        </el-button>
                                    </el-input>
                                </th>
                            </tr>


                            </thead>
                        </table>
                    </el-col>
                    <el-col :span="6">
                        <div class="w3-code">
                            <div class="ui segments plan">
                                <div class="ui top attached segment teal inverted plan-title">
                                    <span class="plan-ribbon red">{{posBillForm.discountValue}}{{currencySymbol}}</span>
                                    <span class="ui header">{{langConfig['balanceDue']}}</span>

                                </div>
                                <div class="ui  attached segment feature">
                                    <div class="amount">{{posBillForm.balanceUnpaid}}{{currencySymbol}}</div>
                                </div>
                            </div>


                            <el-form-item :label="langConfig['vendor']" prop="vendorId">
                                <el-select style="display: block !important;"
                                           filterable clearable
                                           v-model="posBillForm.vendorId"
                                           :placeholder="langConfig['vendor']">
                                    <el-option
                                            v-for="item in vendorOption"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                            :disabled="item.disabled">
                                    </el-option>
                                </el-select>
                            </el-form-item>

                            <el-row>
                                <el-col :span="12">
                                    <el-form-item :label="langConfig['address']" prop="address">
                                        <el-input type="textarea" v-model="posBillForm.address"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="1">
                                    <div class="">&nbsp;</div>
                                </el-col>
                                <el-col :span="11">
                                    <el-form-item :label="langConfig['billNo']" prop="billNo">
                                        <el-input v-model="posBillForm.billNo" prefix-icon="el-icon-edit"
                                                  size="mini"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>


                            <el-row>
                                <el-col :span="12">
                                    <el-form-item :label="langConfig['billDate']" prop="billDate">
                                        <el-date-picker
                                                v-model="posBillForm.billDate"
                                                type="date"
                                                style="width: 100%;"
                                                placeholder="Pick a day"
                                                :picker-options="options"
                                                :disabled="disabledDate"
                                        >
                                        </el-date-picker>
                                    </el-form-item>
                                </el-col>

                                <el-col :span="1">
                                    <div class="">&nbsp;</div>
                                </el-col>
                                <el-col :span="11">
                                    <el-form-item :label="langConfig['dueDate']" prop="dueDate">
                                        <el-date-picker
                                                v-model="posBillForm.dueDate"
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
                                    <el-form-item :label="langConfig['term']" prop="termId">
                                        <el-select style="display: block !important;"
                                                   filterable clearable
                                                   v-model="posBillForm.termId"
                                                   placeholder="Term">
                                            <el-option
                                                    v-for="item in termOption"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value"
                                                    :disabled="item.disabled">
                                            </el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="1">
                                    <div class="">&nbsp;</div>
                                </el-col>
                                <el-col :span="11">
                                    <el-form-item :label="langConfig['note']" prop="note">
                                        <el-input type="textarea" v-model="posBillForm.note" :rows="3"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                        </div>
                        <!--</el-card>-->
                    </el-col>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer fix-dialog-footer"
            >
                <hr style="margin-top: 0px !important;">
                <el-row>
                    <el-col :span="12" style="text-align: left !important;">
                        <el-button type="danger" @click.native="dialogAddPosBill= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">
                        <el-button type="success" @click="savePosBill(false,$event)"><i
                                class="el-icon-circle-check"> </i>&nbsp; {{langConfig['saveAndNew']}} <i>(Ctrl + Alt + Enter)</i></el-button>

                        <el-button type="primary" @click.native="savePosBill(true,$event)"><i
                                class="el-icon-check"> </i>&nbsp; {{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>

                    </el-col>
                </el-row>
            </span>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                @close="handleCloseModal"
                :title="langConfig['updateBill']"
                :visible.sync="dialogUpdatePosBill"
                :fullscreen="fullScreen"
                class="dialogBill"
        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posBillForm" :rules="rules" :ref="refForm" label-width="120px"
                     :label-position="labelPosition"
                     class="posBillForm">
                <el-row :gutter="20">
                    <el-col :span="18" class="posBillForm">
                        <table class="table table-responsive​​​ table-striped table-hover responstable">
                            <thead>
                            <tr>
                                <th colspan="2" style="width: 30% !important;">
                                    <el-form-item label="" prop="locationId">
                                        <el-select style="display: block !important"
                                                   filterable clearable
                                                   v-model="posBillForm.locationId"
                                                   :placeholder="langConfig['chooseLocation']">
                                            <el-option
                                                    v-for="item in locationOption"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value"
                                                    :disabled="item.disabled">
                                            </el-option>
                                        </el-select>
                                    </el-form-item>
                                </th>
                                <th style="width: 20% !important;">
                                    <el-form-item label="">
                                        <el-input :placeholder="langConfig['barcode']" :disabled="disabledItem"
                                                  @keyup.native.13="addToPosBillData(null)"
                                                  v-model="posBillForm.code" autofocus
                                        >
                                        </el-input>
                                    </el-form-item>
                                </th>
                                <th style="width: 20% !important;">
                                    <el-form-item label="">
                                        <el-select style="display: block !important;" :disabled="disabledItem"
                                                   filterable clearable
                                                   v-model="posBillForm.itemId" :remote-method="itemOpt"
                                                   :placeholder="langConfig['chooseItem']">
                                            <el-option
                                                    v-for="item in itemOption"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value"
                                                    :disabled="item.disabled">
                                            </el-option>
                                        </el-select>
                                    </el-form-item>


                                </th>

                                <th>
                                    <el-form-item label="">

                                        <el-input :placeholder="langConfig['total']" v-model.number="posBillForm.total"
                                                  disabled>
                                            <template slot="append">{{currencySymbol}}</template>
                                        </el-input>
                                    </el-form-item>
                                </th>
                                <th style="vertical-align: middle">
                                    <el-form-item label="">
                                        : {{langConfig['total']}}
                                    </el-form-item>
                                </th>
                            </tr>
                            </thead>
                            <thead>
                            <tr>
                                <th>{{langConfig['no']}}</th>
                                <th>{{langConfig['name']}}</th>
                                <th>{{langConfig['cost']}}</th>
                                <th>{{langConfig['qty']}}</th>
                                <th colspan="2">{{langConfig['amount']}}</th>
                            </tr>
                            </thead>
                            <tr v-for="(posBillDoc,index ) in this.posBillData" :key="index">
                                <td style="vertical-align: middle">{{index + 1}}</td>
                                <td style="vertical-align: middle">{{posBillDoc.itemName}}</td>
                                <td>
                                    <el-input placeholder="Please input Cost" v-model.number=posBillDoc.cost
                                              type='number'
                                              @keyup.native="updatePosBillDetail(posBillDoc, index)"
                                              @change="updatePosBillDetail(posBillDoc, index)"
                                    ></el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Please input Qty" v-model.number=posBillDoc.qty type='number'
                                              @keyup.native="updatePosBillDetail(posBillDoc, index)" :min="numMini"
                                              @change="updatePosBillDetail(posBillDoc, index)"
                                    >
                                        <template slot="append">{{posBillDoc.unitName || ""}}</template>

                                    </el-input>
                                </td>
                                <td>
                                    <el-input :placeholder="langConfig['amount']" v-model.number=posBillDoc.amount
                                              disabled>
                                        <template slot="append" v-if="phoneShop===false">
                                            <el-dropdown trigger="click" :hide-on-click="false">
                                                    <span class="el-dropdown-link">
                                                        <span v-if="phoneShop===false">{{langConfig['des']}}</span>
                                                        <span v-if="phoneShop===true">{{langConfig['imei']}}</span>
                                                         <span v-if="posBillDoc.desc==''">
                                                                <i class="el-icon-caret-bottom el-icon--right"></i>
                                                            </span>
                                                            <span v-else>
                                                                <i class="el-icon-circle-check el-icon--right"
                                                                   style="color: blue"></i>

                                                            </span>
                                                    </span>
                                                <el-dropdown-menu slot="dropdown">
                                                    <el-dropdown-item class="clearfix">
                                                        <el-input v-if="phoneShop===false"
                                                                  :placeholder="langConfig['des']"
                                                                  type="textarea"
                                                                  v-model.number=posBillDoc.desc
                                                                  @keyup.native="updatePosBillDetail(posBillDoc, index)"></el-input>
                                                        <el-input v-if="phoneShop===true"
                                                                  :placeholder="langConfig['imei']"
                                                                  type="textarea"
                                                                  v-model.number=posBillDoc.desc
                                                                  @keyup.native="updatePosBillDetail(posBillDoc, index)"></el-input>
                                                    </el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </template>
                                        <template slot="append" v-if="phoneShop===true">
                                            <el-button slot="append" type="primary" icon="el-icon-plus"
                                                       @click.native="popUpAddImei(posBillDoc,index)"
                                            >
                                                 <span class="el-dropdown-link">
                                                        {{langConfig['imei']}}
                                                         <span v-if="posBillDoc.desc==''">
                                                                <i
                                                                        class="el-icon-caret-bottom el-icon--right"></i>
                                                            </span>
                                                            <span v-else>
                                                                {{posBillDoc.numImei || 0}} <i
                                                                    class="el-icon-circle-check el-icon--right"
                                                                    style="color: blue"></i>

                                                            </span>
                                                    </span>
                                            </el-button>
                                        </template>
                                    </el-input>
                                </td>
                                <td style="text-align: center;vertical-align: middle">
                                    <el-button type="danger" icon="el-icon-delete" size="small"
                                               @click="removePosBillDetailByIndex(index,posBillDoc)"></el-button>
                                </td>
                            </tr>
                            <thead>
                            <tr>
                                <th colspan="4" style="text-align: right;vertical-align: middle">
                                    {{langConfig['discount']}} :
                                    <el-radio-group v-model="posBillForm.discountType">
                                        <el-radio-button v-for="mt in discountTypeOption" :label="mt.value"
                                                         :key="mt.value"
                                        >
                                            {{langConfig[mt.label]}}
                                        </el-radio-button>
                                    </el-radio-group>
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="Amount Discount" type='number'
                                              v-model.number="posBillForm.discount">
                                        <template slot="append">{{typeDiscount}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="4" style="text-align: right;vertical-align: middle">
                                    {{langConfig['netTotal']}} :
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="Net Total" v-model.number="posBillForm.netTotal"
                                              disabled>
                                        <template slot="append">{{currencySymbol}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="4" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidDollar']}}:
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="USD" v-model.number="posBillForm.paidUSD" type='number'
                                              @change="getTotal()" @keyup.native="getTotal()"
                                    >
                                        <el-button slot="append" @click="clickUSD(posBillForm.remainUSD)">
                                            {{posBillForm.remainUSD}} $
                                        </el-button>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="4" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidRiel']}} :
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="KHR" @change="getTotal()" @keyup.native="getTotal()"
                                              v-model.number="posBillForm.paidKHR" type='number'
                                    >
                                        <el-button slot="append" @click="clickKHR(posBillForm.remainKHR)">
                                            {{posBillForm.remainKHR}} ៛
                                        </el-button>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="4" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidBaht']}}:
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="THB" v-model.number="posBillForm.paidTHB" type='number'
                                              @change.native="getTotal()" @keyup.native="getTotal()"
                                    >
                                        <el-button slot="append" @click="clickTHB(posBillForm.remainTHB)">
                                            {{posBillForm.remainTHB}} B
                                        </el-button>
                                    </el-input>
                                </th>
                            </tr>


                            </thead>
                        </table>
                    </el-col>
                    <el-col :span="6">
                        <div class="w3-code">
                            <div class="ui segments plan">
                                <div class="ui top attached segment teal inverted plan-title">
                                    <span class="plan-ribbon red">{{posBillForm.discountValue}}{{currencySymbol}}</span>
                                    <span class="ui header">{{langConfig['balanceDue']}}</span>

                                </div>
                                <div class="ui  attached segment feature">
                                    <div class="amount">{{posBillForm.balanceUnpaid}}{{currencySymbol}}</div>
                                </div>
                            </div>


                            <el-form-item :label="langConfig['vendor']" prop="vendorId">
                                <el-select style="display: block !important;"
                                           filterable clearable
                                           v-model="posBillForm.vendorId"
                                           :placeholder="langConfig['vendor']">
                                    <el-option
                                            v-for="item in vendorOption"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                            :disabled="item.disabled">
                                    </el-option>
                                </el-select>
                            </el-form-item>

                            <el-row>
                                <el-col :span="12">
                                    <el-form-item :label="langConfig['address']" prop="address">
                                        <el-input type="textarea" v-model="posBillForm.address"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="1">
                                    <div class="">&nbsp;</div>
                                </el-col>
                                <el-col :span="11">
                                    <el-form-item :label="langConfig['billNo']" prop="billNo">
                                        <el-input v-model="posBillForm.billNo" prefix-icon="el-icon-edit"
                                                  size="mini"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>


                            <el-row>
                                <el-col :span="12">
                                    <el-form-item :label="langConfig['billDate']" prop="billDate">
                                        <el-date-picker
                                                v-model="posBillForm.billDate"
                                                type="date"
                                                style="width: 100%;"
                                                placeholder="Pick a day"
                                                :picker-options="options"
                                                :disabled="disabledDate"
                                        >
                                        </el-date-picker>
                                    </el-form-item>
                                </el-col>

                                <el-col :span="1">
                                    <div class="">&nbsp;</div>
                                </el-col>
                                <el-col :span="11">
                                    <el-form-item :label="langConfig['dueDate']" prop="dueDate">
                                        <el-date-picker
                                                v-model="posBillForm.dueDate"
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
                                    <el-form-item :label="langConfig['term']" prop="termId">
                                        <el-select style="display: block !important;"
                                                   filterable clearable
                                                   v-model="posBillForm.termId"
                                                   placeholder="Term">
                                            <el-option
                                                    v-for="item in termOption"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value"
                                                    :disabled="item.disabled">
                                            </el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="1">
                                    <div class="">&nbsp;</div>
                                </el-col>
                                <el-col :span="11">
                                    <el-form-item :label="langConfig['note']" prop="note">
                                        <el-input type="textarea" v-model="posBillForm.note" :rows="3"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                        </div>
                        <!--</el-card>-->
                    </el-col>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer fix-dialog-footer"
            >
                <hr style="margin-top: 0px !important;">
                <el-row>
                    <el-col :span="12" style="text-align: left !important;">
                        <el-button type="danger" @click="dialogUpdatePosBill= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">
                         <el-button type="primary" @click.native="updatePosBill(posBillId)"><i
                                 class="el-icon-circle-check"> </i>&nbsp; {{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                    </el-col>
                </el-row>
            </span>
        </el-dialog>

        <el-dialog
                :title="langConfig['show']"
                :visible.sync="dialogShowPosBill"
        >
            <div class="row">
                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['billNo']}} : </label>{{posBillShowData.billNo
                    || ""}}
                </div>
                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['vendor']}} : </label>{{posBillShowData.vendorName
                    || ""}}
                </div>
                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['billDate']}} : </label>{{posBillShowData.billDateName
                    ||
                    ""}}
                </div>

                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['address']}} : </label>{{posBillShowData.address
                    || ""}}
                </div>
                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['total']}}: </label>{{posBillShowData.total ||
                    ""}}
                </div>

            </div>
            <br>
            <el-table
                    :data="posBillShowData.item"
                    style="width: 100%"
                    border
            >
                <el-table-column
                        prop="itemName"
                        :label="langConfig['item']"
                        width="300px"
                >
                </el-table-column>
                <el-table-column
                        prop="cost"
                        :label="langConfig['cost']"
                >
                </el-table-column>

                <el-table-column
                        prop="qty"
                        :label="langConfig['qty']"
                >
                </el-table-column>

                <el-table-column
                        prop="unitName"
                        :label="langConfig['unit']"
                >
                </el-table-column>

                <el-table-column
                        prop="amount"
                        :label="langConfig['amount']"
                >
                </el-table-column>

            </el-table>

        </el-dialog>

        <el-dialog
                title="Add Imei"
                :visible.sync="dialogAddImei"
        >
            <el-row style="font-family: 'Kh Battambang';font-size: 20px !important;font-weight: bold">
                <span>បញ្ចូលលេខ Imei សម្រាប់  {{itemName}}</span>
            </el-row>
            <br>
            <el-input v-model="imeiInput" prefix-icon="el-icon-edit"
                      @keyup.native.13="addImei()" autofocus>
                <el-button slot="append" type="primary" icon="el-icon-plus"
                           @click="addImei()"></el-button>
            </el-input>
            <br>
            <el-table
                    :data="imeiShow"
                    style="width: 100%"
                    max-height="450"
                    border
            >
                <el-table-column
                        type="index"
                        :index="indexMethod"
                        :label="langConfig['no']"
                        width="60"
                >
                </el-table-column>
                <el-table-column
                        prop="name"
                        :label="langConfig['imei']"
                >
                </el-table-column>
                <el-table-column
                        :label="langConfig['action']"
                        width="60"
                >
                    <template slot-scope="scope">
                        <el-button-group>
                            <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="mini"
                                       @click="removeImei(scope.$index,scope.row)"
                            ></el-button>
                        </el-button-group>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>

<!--<script src="cleave-phone.{country}.js"></script>-->
<script>
    import draggable from 'vuedraggable';
    import {formatCurrency} from "../../../imports/api/methods/roundCurrency";
    import {formatCurrencyLast} from "../../../imports/api/methods/roundCurrency";
    import {GeneralFunction} from "../../../imports/api/methods/generalFunction";
    import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency";
    import {WB_waterBillingSetup} from "../../collection/waterBillingSetup";
    import {Manage_Module} from "../../collection/manageModule";

    import compoLang from '../../../both/i18n/lang/elem-label'
    // require('cleave.js/dist/addons/cleave-phone.ac');
    // require('cleave.js/dist/addons/cleave-phone.{country}');
    //import $ from 'jQuery';
    import {Pos_BillReact} from "../../collection/posBill";

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
                Pos_BillReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        components: {
            draggable
        },
        data() {
            return {
                keyCode: [],
                refForm: "",
                posBillData: [],
                posBillShowData: {},
                posBillDataDisplay: [],
                multipleSelection: [],
                posBillId: "",
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                numMini: 0,
                count: 0,
                dialogAddPosBill: false,
                dialogUpdatePosBill: false,
                dialogShowPosBill: false,
                dialogAddImei: false,
                typeDiscount: "",
                fullScreen: true,
                timeStamp: [],
                phoneShop: false,
                posBillForm: {
                    itemId: "",
                    itemName: "",
                    cost: 0,
                    qty: 0,
                    amount: 0,
                    total: 0,
                    netTotal: 0,
                    balanceUnpaid: 0,
                    paid: 0,
                    billDate: moment().toDate(),
                    dueDate: moment().add(1, "month").toDate(),
                    billNo: "",

                    note: "",

                    discountType: "Amount",
                    discount: 0,
                    discountValue: 0,
                    termId: "",
                    address: "",
                    vendorId: "001",

                    paidUSD: 0,
                    paidKHR: 0,
                    paidTHB: 0,

                    remainUSD: 0,
                    remainKHR: 0,
                    remainTHB: 0,
                    desc: "",
                    locationId: "001",
                    code: "",
                    imei: []


                },
                rules: {
                    billDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input PosBillDate',
                        trigger: 'blur'
                    }],
                    billNo: [{required: true, type: 'string', message: 'Please input PosBillNo', trigger: 'blur'}],
                    vendorId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Vendor',
                        trigger: 'change'
                    }],
                    termId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Term',
                        trigger: 'change'
                    }],
                    locationId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Location',
                        trigger: 'change'
                    }]
                    // note: [{required: true, type: 'string', message: 'Please input Memo', trigger: 'blur'}],
                },

                // Options
                itemOption: [],
                vendorOption: [],
                termOption: [],

                dialog: true,
                notifications: false,
                sound: true,
                widgets: false,
                labelPosition: "top",
                options: {
                    disabledDate(time) {
                        return false;
                    }
                },
                disabledDate: false,
                closeDate: "",
                type: "",
                posBillDetail: {},
                discountTypeOption: [
                    {label: "amount", value: "Amount"},
                    {label: "percent", value: "Percent"}
                ],
                locationOption: [],
                disabledItem: true,
                currencySymbol: "",
                isFocus: false,
                takeBarcode: '',
                skip: 0,
                imei: [],
                imeiShow: [],
                imeiInput: "",
                itemId: "",
                itemName: "",
                indexRow: "",
                rowDoc: "",
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
            };

            let elem = this.$jQuery('el-dialog.dialogBill');
            let checkEvent = $._data($('body').get(0), 'events');
            if (checkEvent.keyup.length <= 1) {
                this.$nextTick(() => {
                    this.$jQuery('body').on('keyup', elem, this.barcodeScanBill);
                })
            }

            /*$(window).ready(function () {

                //$("#bCode").scannerDetection();

                console.log('all is well');

                $(window).scannerDetection();
                $(window).bind('scannerDetectionComplete', function (e, data) {
                    console.log('complete ' + data.string);
                    //$("#bCode").val(data.string);
                })
                    .bind('scannerDetectionError', function (e, data) {
                        console.log('detection error ' + data.string);
                    })
                    .bind('scannerDetectionReceive', function (e, data) {
                        console.log('Recieve');
                        console.log(data.evt.which);
                    })
            });*/
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
            "posBillForm.billDate"(val) {
                let vm = this;
                if (vm.dialogUpdatePosBill == false) {
                    vm.posBillForm.posBillDate = val;
                }
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
                if (this.$refs["posBillFormAdd"]) {
                    this.getVoucherByRoleAndDate(val);
                }

            },
            /*dialogAddPosBill(val) {
                if (val) {
                    this._inputMaskPosBill();
                }
            },*/
            dialogUpdatePosBill(val) {
                if (val) {
                    this._inputMaskPosBill();
                }
            },
            "posBillForm.itemId"(val) {
                if (val) {
                    this.addToPosBillData(val);
                }
            },
            "posBillForm.vendorId"(val) {
                let vm = this;
                if (val) {
                    Meteor.call("queryPosVendorById", val, (err, result) => {
                        if (result) {
                            vm.posBillForm.address = result.address;
                            vm.posBillForm.termId = result.termId;
                        }
                    })
                }
            },
            "posBillForm.discount"(val) {
                if (val || val === 0) {
                    this.posBillForm.discount = val;
                    this.getTotal();
                }
            },
            "posBillForm.discountType"(val) {
                if (val) {
                    this.posBillForm.discountType = val;
                    this.getTotal();
                }
            },
            "posBillForm.locationId"(val) {
                if (val && val !== "") {
                    this.disabledItem = false;
                } else {
                    this.disabledItem = true;
                }
            }
        },
        methods: {
            handleCloseModal() {

                this.resetForm();
                this.refForm = "";
            },
            handleSizeChange(val) {
                this.currentSize = val;
            },
            handleCurrentChange(val) {
                this.currentPage = val;
            },
            clickTHB(val) {
                this.posBillForm.paidTHB = this.$_numeral(val).value();
                this.getTotal();
            },
            clickUSD(val) {
                this.posBillForm.paidUSD = this.$_numeral(val).value();
                this.getTotal();
            },
            clickKHR(val) {
                this.posBillForm.paidKHR = this.$_numeral(val).value();
                this.getTotal();
            },
            _inputMaskPosBill() {
                /*setTimeout(() => {
                    if ($(".el-inputAmount").length) {
                        new this.$_Cleave('.el-inputAmount', {
                            numeral: true,
                            numeralThousandsGroupStyle: 'thousand'
                        });
                    }

                    if ($(".el-inputDR").length) {
                        new this.$_Cleave('.el-inputDR', {
                            numeral: true,
                            numeralThousandsGroupStyle: 'thousand'
                        });
                    }

                    if ($(".el-inputCR").length) {
                        new this.$_Cleave('.el-inputCR', {
                            numeral: true,
                            numeralThousandsGroupStyle: 'thousand'
                        });
                    }


                }, 200)*/
            },
            barcodeScanBill(e) {
                if (e.data.init(0).selector === "el-dialog.dialogBill" && this.dialogAddImei === false) {
                    let vm = this;
                    if (this.dialogAddPosBill === true || this.dialogUpdatePosBill === true) {
                        let scannerSensitivity = 100;
                        let charCode = event.which || event.keyCode;
                        if (charCode !== 13 && charCode !== 16 && charCode !== 18 && charCode !== 17) {
                            this.takeBarcode += String.fromCharCode(charCode);
                        }
                        this.timeStamp.push(Date.now());
                        if (this.timeStamp.length > 1) {
                            if (this.timeStamp[1] - this.timeStamp[0] >= scannerSensitivity) {
                                this.takeBarcode = '';
                                this.timeStamp = [];
                            } else {
                                if (e.keyCode === 13) {
                                    this.posBillForm.code = this.takeBarcode;
                                    if (this.takeBarcode !== "") {
                                        vm.addToPosBillData(null);
                                    }
                                    this.timeStamp = [];
                                    this.takeBarcode = ''
                                }
                            }
                        }
                    }

                    if (this.dialogAddPosBill === false || this.dialogUpdatePosBill === false) {
                        if (e.keyCode === 107 && !e.ctrlKey && !e.altKey) {
                            e.preventDefault();
                            vm.popupPosBillAdd();
                            vm.dialogAddPosBill = true;
                            vm.resetForm();
                        }
                    }

                    if (e.keyCode === 27 && !e.ctrlKey && !e.altKey) {
                        e.preventDefault();
                        vm.dialogAddPosBill = false;
                    }
                }
            },
            indexMethod(index) {
                return index + 1;
            },
            queryData: _.debounce(function (val, skip, limit) {
                Meteor.call('queryPosBill', {
                    q: val,
                    filter: this.filter,
                    rolesArea: Session.get('area'),
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.posBillDataDisplay = result.content;
                        this.count = result.countPosBill;
                    }
                    this.isSearching = false;
                });
            }, 300),
            itemOpt(query) {
                if (!!query) {
                    setTimeout(() => {
                        Meteor.call('queryItemOption', query, (err, result) => {
                            if (!err) {
                                this.itemOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryItemOption', "", (err, result) => {
                        if (!err) {
                            this.itemOption = result;
                        } else {
                            console.log(err.message);
                        }
                    })
                }
            },
            locationOpt() {
                Meteor.call('queryLocationOption', (err, result) => {
                    this.locationOption = result;
                })
            },
            vendorOpt() {
                Meteor.call('queryPosVendorOption', Session.get("area"), (err, result) => {
                    this.vendorOption = result;
                })
            },
            termOpt() {
                let selector = {};
                Meteor.call('queryPosTermOption', selector, (err, result) => {
                    this.termOption = result;
                })
            },

            savePosBill(isCloseDialog, event) {
                event.preventDefault();
                let vm = this;
                if (vm.posBillData.length === 0) {
                    vm.$message({
                        duration: 1000,
                        message: this.langConfig['noItemAdd'],
                        type: 'error'
                    });
                    return false;
                }
                let item = vm.posBillData;

                this.$refs["posBillFormAdd"].validate((valid) => {
                    if (valid) {
                        let posBillDoc = {
                            total: vm.$_numeral(vm.posBillForm.total).value(),
                            netTotal: vm.$_numeral(vm.posBillForm.netTotal).value(),
                            balanceUnpaid: vm.$_numeral(vm.posBillForm.balanceUnpaid).value(),
                            paid: vm.$_numeral(vm.posBillForm.netTotal).value() - vm.$_numeral(vm.posBillForm.balanceUnpaid).value(),
                            billDate: moment(vm.posBillForm.billDate).toDate(),
                            billDateName: moment(vm.posBillForm.billDate).format("DD/MM/YYYY"),
                            dueDate: moment(vm.posBillForm.dueDate).toDate(),
                            billNo: vm.posBillForm.billNo,

                            note: vm.posBillForm.note,

                            discountType: vm.posBillForm.discountType,
                            discount: vm.$_numeral(vm.posBillForm.discount).value(),
                            discountValue: vm.$_numeral(vm.posBillForm.discountValue).value(),
                            termId: vm.posBillForm.termId,
                            address: vm.posBillForm.address,

                            rolesArea: Session.get('area'),
                            item: item,
                            vendorId: vm.posBillForm.vendorId,

                            paidUSD: vm.$_numeral(vm.posBillForm.paidUSD).value(),
                            paidKHR: vm.$_numeral(vm.posBillForm.paidKHR).value(),
                            paidTHB: vm.$_numeral(vm.posBillForm.paidTHB).value(),
                            imei: vm.imei,
                            remainUSD: vm.$_numeral(vm.posBillForm.remainUSD).value(),
                            remainKHR: vm.$_numeral(vm.posBillForm.remainKHR).value(),
                            remainTHB: vm.$_numeral(vm.posBillForm.remainTHB).value(),
                            paymentNumber: 1,
                            locationId: vm.posBillForm.locationId,
                            closeDate: vm.$_numeral(vm.posBillForm.balanceUnPaid).value() === 0 ? moment(vm.posBillForm.billDate).toDate() : "",
                            status: vm.$_numeral(vm.posBillForm.balanceUnpaid).value() == 0 ? "Complete" : vm.$_numeral(vm.posBillForm.balanceUnpaid).value() < vm.$_numeral(vm.posBillForm.netTotal).value() ? "Partial" : "Active"

                        };
                        posBillDoc.transaction = vm.posBillData;
                        Meteor.call("insertPosBill", posBillDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                Session.set("transactionActionNumber", (Session.get("transactionActionNumber") || 0) + 1);

                                if (isCloseDialog) {
                                    this.dialogAddPosBill = false;
                                } else {
                                    this.getVoucherByRoleAndDate(moment().toDate());
                                }
                                vm.skip = 0;
                                vm.resetForm();
                            }
                        })
                    }
                })
            },
            updatePosBill(id) {
                event.preventDefault();
                let vm = this;
                vm.$refs["posBillFormUpdate"].validate((valid) => {
                    if (valid) {
                        let posBillDoc = {
                            total: vm.$_numeral(vm.posBillForm.total).value(),
                            netTotal: vm.$_numeral(vm.posBillForm.netTotal).value(),
                            balanceUnpaid: vm.$_numeral(vm.posBillForm.balanceUnpaid).value(),
                            paid: vm.$_numeral(vm.posBillForm.netTotal).value() - vm.$_numeral(vm.posBillForm.balanceUnpaid).value(),
                            billDate: moment(vm.posBillForm.billDate).toDate(),
                            billDateName: moment(vm.posBillForm.billDate).format("DD/MM/YYYY"),
                            dueDate: moment(vm.posBillForm.dueDate).toDate(),
                            billNo: vm.posBillForm.billNo,

                            note: vm.posBillForm.note,

                            discountType: vm.posBillForm.discountType,

                            discount: vm.$_numeral(vm.posBillForm.discount).value(),
                            discountValue: vm.$_numeral(vm.posBillForm.discountValue).value(),
                            termId: vm.posBillForm.termId,
                            address: vm.posBillForm.address,

                            rolesArea: Session.get('area'),
                            vendorId: vm.posBillForm.vendorId,

                            paidUSD: vm.$_numeral(vm.posBillForm.paidUSD).value(),
                            paidKHR: vm.$_numeral(vm.posBillForm.paidKHR).value(),
                            paidTHB: vm.$_numeral(vm.posBillForm.paidTHB).value(),

                            remainUSD: vm.$_numeral(vm.posBillForm.remainUSD).value(),
                            remainKHR: vm.$_numeral(vm.posBillForm.remainKHR).value(),
                            remainTHB: vm.$_numeral(vm.posBillForm.remainTHB).value(),
                            _id: id,
                            imei: vm.imei,
                            locationId: vm.posBillForm.locationId,
                            closeDate: vm.$_numeral(vm.posBillForm.balanceUnPaid).value() === 0 ? moment(vm.posBillForm.billDate).toDate() : "",
                            status: vm.$_numeral(vm.posBillForm.balanceUnpaid).value() === 0 ? "Complete" : vm.$_numeral(vm.posBillForm.balanceUnpaid).value() < vm.$_numeral(vm.posBillForm.netTotal).value() ? "Partial" : "Active"


                        };
                        posBillDoc.item = vm.posBillData;
                        Meteor.call("updatePosBill", posBillDoc, id, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                Session.set("transactionActionNumber", (Session.get("transactionActionNumber") || 0) + 1);

                                vm.dialogUpdatePosBill = false;

                                vm.resetForm();
                            } else {
                                vm.$message({
                                    duration: 1000,
                                    message: err.message,
                                    type: 'success'
                                });
                            }
                        })
                    }
                })

            },
            removePosBill(index, row, rows) {
                let vm = this;
                let companyDoc = WB_waterBillingSetup.findOne({});
                if (companyDoc.integratedPosAccount) {
                    Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                        if (re !== undefined) {
                            vm.closeDate = re.closeDate;
                        } else {
                            vm.closeDate = "";
                        }

                        if (vm.closeDate && vm.closeDate.getTime() >= row.billDate.getTime()) {
                            vm.$message({
                                duration: 1000,
                                message: "Already Closing Entry In Account!!",
                                type: 'error'
                            });
                            return false;
                        }
                        if (row.status === "Active" || row.paymentNumber < 2) {
                            vm.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                                confirmButtonText: 'OK',
                                cancelButtonText: 'Cancel',
                                type: 'warning'
                            }).then(() => {
                                Meteor.call("removePosBill", row._id, row, (err, result) => {
                                    if (!err) {
                                        rows.splice(index, 1);
                                        vm.$message({
                                            message: `លុប ${row.billDateName}​ : ${row.billNo} បានជោគជ័យ`,
                                            type: 'success'
                                        });

                                        Session.set("transactionActionNumber", (Session.get("transactionActionNumber") || 0) + 1);

                                    } else {
                                        vm.$message({
                                            type: 'error',
                                            message: 'Delete Fialed'
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
                                message: 'Already Paid !!'
                            });
                        }


                    })
                } else {
                    if (row.status === "Active" || row.paymentNumber < 2) {
                        vm.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                            confirmButtonText: 'OK',
                            cancelButtonText: 'Cancel',
                            type: 'warning'
                        }).then(() => {
                            Meteor.call("removePosBill", row._id, row, (err, result) => {
                                if (!err) {
                                    rows.splice(index, 1);
                                    vm.$message({
                                        message: `លុប ${row.billDateName}​ : ${row.billNo} បានជោគជ័យ`,
                                        type: 'success'
                                    });

                                    Session.set("transactionActionNumber", (Session.get("transactionActionNumber") || 0) + 1);

                                } else {
                                    vm.$message({
                                        type: 'error',
                                        message: 'Delete Fialed'
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
                            message: 'Already Paid !!'
                        });
                    }
                }


            },
            popupPosBillAdd() {
                this.refForm = "posBillFormAdd";
                this.resetForm();
                this.itemOpt();
                let vm = this;
                $(".el-dialog__title").text(this.langConfig['add']);

                this.vendorOpt();
                this.termOpt();
                this.getVoucherByRoleAndDate(moment().toDate());


                Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                    if (re !== undefined) {
                        vm.closeDate = re.closeDate;
                    } else {
                        vm.closeDate = "";
                    }
                })
            },
            popupPosBillUpdate(index, row, scope) {
                this.refForm = "posBillFormUpdate";

                this.resetForm();
                this.itemOpt();
                let vm = this;
                $(".el-dialog__title").text(this.langConfig['update']);
                this.vendorOpt();
                this.termOpt();
                let companyDoc = WB_waterBillingSetup.findOne({});
                if (companyDoc.integratedPosAccount) {
                    Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                        if (re !== undefined) {
                            vm.closeDate = re.closeDate;
                        } else {
                            vm.closeDate = "";
                        }

                        if (vm.closeDate && vm.closeDate.getTime() >= row.billDate.getTime()) {
                            vm.$message({
                                duration: 1000,
                                message: "Already Closing Entry In Account!!",
                                type: 'error'
                            });
                            return false;
                        }
                        if (row.status === "Active" || row.paymentNumber < 2) {
                            vm.dialogUpdatePosBill = true;
                            vm.findPosBillById(scope);
                        } else {
                            vm.$message({
                                duration: 1000,
                                message: "Not Active State!!",
                                type: 'error'
                            });
                        }

                    })
                } else {
                    if (row.status === "Active" || row.paymentNumber < 2) {
                        vm.dialogUpdatePosBill = true;
                        vm.findPosBillById(scope);
                    } else {
                        vm.$message({
                            duration: 1000,
                            message: "Not Active State!!",
                            type: 'error'
                        });
                    }
                }
            },
            getVoucherByRoleAndDate(date) {
                let vm = this;
                Meteor.call("pos_getBillNoByRoleAndDate", Session.get("area"), date, (err, result) => {
                    if (!err) {
                        vm.posBillForm.billNo = result;
                    }
                })
            },
            findPosBillById(doc) {
                let vm = this;
                this.posBillId = doc.row._id;
                let companyDoc = WB_waterBillingSetup.findOne({});
                Meteor.call("queryPosBillById", doc.row._id, (err, data) => {
                    vm.posBillData = [];
                    if (data) {
                        vm.imei = data.imei;
                        vm.posBillData = data.item;
                        vm.posBillForm = {
                            total: formatCurrency(data.total, companyDoc.baseCurrency),
                            netTotal: formatCurrency(data.netTotal, companyDoc.baseCurrency),
                            balanceUnpaid: formatCurrency(data.balanceUnpaid, companyDoc.baseCurrency),
                            paid: data.paid,
                            billDate: data.billDate,
                            dueDate: data.dueDate,
                            billNo: data.billNo,
                            note: data.note,
                            discountType: data.discountType,
                            discount: data.discount,
                            discountValue: data.discountValue,
                            termId: data.termId,
                            address: data.address,
                            rolesArea: Session.get('area'),
                            vendorId: data.vendorId,
                            paidUSD: data.paidUSD,
                            paidKHR: data.paidKHR,
                            paidTHB: data.paidTHB,
                            remainUSD: data.remainUSD,
                            remainKHR: data.remainKHR,
                            remainTHB: data.remainTHB,
                            locationId: data.locationId
                        };
                        vm.getTotal();
                    }
                })

            },
            addToPosBillData(val) {
                let vm = this;
                if (val === null) {
                    val = vm.posBillForm.code;
                }

                if (val === "" || val === undefined) {
                    this.$message({
                        duration: 1000,
                        message: "Item Can't Empty!!",
                        type: 'error'
                    });
                    let s = new buzz.sound('/the-calling.mp3');
                    s.play();
                    return false;
                }
                let isFound = vm.posBillData.find(function (element) {
                    return element.itemId === val || element.code === val || element.barcode === val;
                });
                if (isFound !== undefined) {
                    /*this.$message({
                        type: 'error',
                        message: 'Item already add!'
                    });
                    let s = new buzz.sound('/the-calling.mp3');
                    s.play();*/

                    isFound.qty = isFound.qty + 1;
                    isFound.amount = isFound.qty * isFound.cost;
                    vm.posBillData[isFound.itemId] = isFound;

                    this.$message({
                        type: 'success',
                        message: 'បន្ថែមចំនួនបានជោគជ័យ!'
                    });
                    this.getTotal();
                    vm.posBillForm.itemId = "";
                    vm.posBillForm.code = "";
                    return false;
                }
                Meteor.call("queryPosProductById", val, (err, data) => {
                    if (data) {
                        vm.posBillData.push({
                            itemId: data._id,
                            itemName: data.code + " : " + data.name,
                            code: data.code,
                            barcode: data.barcode || "",
                            cost: vm.$_numeral(data.cost).value(),
                            qty: vm.$_numeral(1).value(),
                            amount: formatCurrency(data.cost),
                            desc: "",
                            unitId: data.unitId,
                            unitName: data.unitName,

                        });
                        vm.posBillForm.itemId = "";
                        vm.posBillForm.code = "";
                        vm.$message({
                            duration: 1000,
                            message: `បន្ថែម` + data.code + " : " + data.name + " បានជោគជ័យ !",
                            type: 'success'
                        });

                        this.getTotal();
                    } else {
                        vm.$message({
                            duration: 1000,
                            message: "មិនមានឈ្មេាះនេះឡើយ!!",
                            type: 'error'
                        });
                        let s = new buzz.sound('/the-calling.mp3');
                        s.play();
                    }
                })


            },
            removePosBillDetailByIndex(index, row) {
                this.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {

                    this.posBillData.splice(index, 1);
                    this.$message({
                        message: `លុប ${row.itemName} បានជោគជ័យ`,
                        type: 'success'
                    });
                    this.getTotal();

                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: 'Delete canceled'
                    });
                });
            },
            updatePosBillDetail(row, index) {

                row.amount = formatCurrency(row.cost * row.qty);
                this.posBillData[index] = row;
                let newIndex = index + 1;
                /*this.$message({
                    duration: 1000,
                    message: `Update Row Number ` + newIndex + " Successfully !",
                    type: 'success'
                });*/
                this.getTotal();
            },
            cancel() {
                this.resetForm();
                this.$message({
                    type: 'info',
                    message: 'Canceled'
                });
            },
            resetForm() {
                this.posBillData = [];
                this.posBillForm.discountValue = 0;
                this.posBillForm.discount = 0;
                this.posBillForm.code = "";

                this.posBillForm.paidUSD = 0;
                this.posBillForm.paidKHR = 0;
                this.posBillForm.paidTHB = 0;
                this.posBillForm.billNo = "";
                this.posBillForm.vendorId = "";
                this.posBillForm.locationId = "";

                if (this.$refs["posBillFormAdd"]) {
                    this.$refs["posBillFormAdd"].resetFields();
                    this.getTotal();

                }
                if (this.$refs["posBillFormUpdate"]) {
                    this.$refs["posBillFormUpdate"].resetFields();
                    this.getTotal();
                }
                this.posBillForm.locationId = "001";
                this.posBillForm.vendorId = "001";
                let vm = this;
                if (this.posBillForm.locationId) {
                    Meteor.call("queryPosVendorById", this.posBillForm.locationId, (err, result) => {
                        if (result) {
                            vm.posBillForm.address = result.address;
                            vm.posBillForm.termId = result.termId;
                        }
                    })
                }

                if (this.posBillForm.vendorId && this.posBillForm.vendorId !== "") {
                    this.disabledItem = false;
                } else {
                    this.disabledItem = true;
                }
                this.imeiShow = [];
                this.imei = [];
                this.imeiInput = "";

            },
            getTotal() {
                let vm = this;
                let total = 0;
                vm.posBillData.forEach(function (obj) {
                    total += parseFloat(vm.$_numeral(obj.amount).value());
                });
                let companyDoc = WB_waterBillingSetup.findOne({});
                this.currencySymbol = getCurrencySymbolById(companyDoc.baseCurrency);
                vm.posBillForm.total = formatCurrency(total, companyDoc.baseCurrency);

                if (vm.posBillForm.discountType == "Amount") {
                    vm.posBillForm.netTotal = formatCurrencyLast(total - vm.posBillForm.discount, companyDoc.baseCurrency);
                    vm.posBillForm.balanceUnpaid = formatCurrencyLast(total - vm.posBillForm.discount - GeneralFunction.exchange("USD", companyDoc.baseCurrency, vm.posBillForm.paidUSD, Session.get("area")) - GeneralFunction.exchange("KHR", companyDoc.baseCurrency, vm.posBillForm.paidKHR, Session.get("area")) - GeneralFunction.exchange("THB", companyDoc.baseCurrency, vm.posBillForm.paidTHB, Session.get("area")), companyDoc.baseCurrency);


                    vm.posBillForm.discountValue = formatCurrencyLast(vm.posBillForm.discount, companyDoc.baseCurrency);

                    vm.posBillForm.remainUSD = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "USD", vm.$_numeral(vm.posBillForm.balanceUnpaid).value(), Session.get("area")), "USD");
                    vm.posBillForm.remainKHR = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "KHR", vm.$_numeral(vm.posBillForm.balanceUnpaid).value(), Session.get("area")), "KHR");
                    vm.posBillForm.remainTHB = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "THB", vm.$_numeral(vm.posBillForm.balanceUnpaid).value(), Session.get("area")), "THB");

                    vm.posBillForm.balanceUnpaid = vm.$_numeral(vm.posBillForm.balanceUnpaid).value() <= 0 ? 0 : vm.posBillForm.balanceUnpaid;

                    this.typeDiscount = getCurrencySymbolById(companyDoc.baseCurrency);
                } else {
                    vm.posBillForm.netTotal = formatCurrencyLast(total - (total * vm.posBillForm.discount / 100), companyDoc.baseCurrency);
                    vm.posBillForm.balanceUnpaid = formatCurrencyLast(total - (total * vm.posBillForm.discount / 100) - GeneralFunction.exchange("USD", companyDoc.baseCurrency, vm.posBillForm.paidUSD, Session.get("area")) - GeneralFunction.exchange("KHR", companyDoc.baseCurrency, vm.posBillForm.paidKHR, Session.get("area")) - GeneralFunction.exchange("THB", companyDoc.baseCurrency, vm.posBillForm.paidTHB, Session.get("area")), companyDoc.baseCurrency);
                    vm.posBillForm.discountValue = formatCurrencyLast((total * vm.posBillForm.discount / 100), companyDoc.baseCurrency);

                    vm.posBillForm.remainUSD = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "USD", vm.$_numeral(vm.posBillForm.balanceUnpaid).value(), Session.get("area")), "USD");
                    vm.posBillForm.remainKHR = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "KHR", vm.$_numeral(vm.posBillForm.balanceUnpaid).value(), Session.get("area")), "KHR");
                    vm.posBillForm.remainTHB = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "THB", vm.$_numeral(vm.posBillForm.balanceUnpaid).value(), Session.get("area")), "THB");
                    vm.posBillForm.balanceUnpaid = vm.$_numeral(vm.posBillForm.balanceUnpaid).value() <= 0 ? 0 : vm.posBillForm.balanceUnpaid;

                    this.typeDiscount = "%";
                }

            },
            popupPosBillShow(row) {
                let vm = this;
                this.dialogShowPosBill = true;
                $(".el-dialog__title").text(this.langConfig['show']);
                Meteor.call("queryPosBillByIdShow", row._id, (err, result) => {
                    if (result) {
                        vm.posBillShowData = result;
                        vm.posBillShowData.vendorName = row.vendorDoc.name;
                    } else {
                        console.log(err.message);
                    }
                })
            },
            addImei() {
                let vm = this;
                if (vm.imeiInput !== "") {

                    if (this.rowDoc && vm.imeiShow.length >= this.rowDoc.qty) {
                        vm.$message({
                            type: 'error',
                            message: 'បញ្ចូលគ្រប់ហើយ!!!!!!!'
                        });
                        return false;
                    }
                    let isFindImei = vm.imei.find((obj) => {
                        return obj.name === vm.imeiInput;
                    })
                    if (isFindImei) {
                        vm.$message({
                            type: 'error',
                            message: 'បញ្ចូលរួចម្តងហើយ!!!!!!!'
                        });
                    } else {
                        Meteor.call("queryPosImeiBillByImei", vm.imeiInput, (err, result) => {
                            if (result) {
                                vm.$message({
                                    type: 'error',
                                    message: 'បញ្ចូលរួចម្តងហើយ!!!!!!!'
                                });
                            } else {
                                vm.imei.push({name: vm.imeiInput, itemId: vm.itemId});
                                vm.imeiShow.push({name: vm.imeiInput, itemId: vm.itemId});

                                vm.imeiInput = "";
                                vm.rowDoc.desc = "";
                                vm.imeiShow.forEach((o) => {
                                    vm.rowDoc.desc = vm.rowDoc.desc + " " + o.name;
                                })
                                vm.rowDoc.imei = vm.imeiShow;
                                vm.rowDoc.numImei = vm.imeiShow.length;
                                vm.updatePosBillDetail(vm.rowDoc, vm.indexRow);

                                vm.$message({
                                    message: `បញ្ចូល ${vm.imeiInput} បានជោគជ័យ`,
                                    type: 'success'
                                });
                            }
                        })
                    }
                }


            },
            removeImei(index, row) {
                let removeIndex = this.imei.map(function (item) {
                    return item.name;
                }).indexOf(row.name);

                this.imei.splice(removeIndex, 1);
                this.imeiShow.splice(index, 1);
                this.rowDoc.desc = "";
                this.imeiShow.forEach((o) => {
                    this.rowDoc.desc = this.rowDoc.desc + " " + o.name;

                })
                this.rowDoc.numImei = this.imeiShow.length;
                this.updatePosBillDetail(this.rowDoc, this.indexRow);

            },
            popUpAddImei(doc, index) {
                this.itemId = doc.itemId;
                this.itemName = doc.itemName;
                this.dialogAddImei = true;
                this.getImeiShow(doc.itemId, index);
                this.indexRow = index;
                this.rowDoc = doc;
            },
            getImeiShow(itemId, index) {
                let vm = this;
                this.imeiShow = [];
                this.imei.forEach((obj) => {
                    if (obj.itemId === itemId) {
                        vm.imeiShow.push({name: obj.name, itemId: obj.itemId});
                    }
                })


            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            this.getTotal();
            this.locationOpt();
            Meteor.subscribe('Pos_BillReact');
            let ma = Manage_Module.findOne();
            if (ma && ma.feature) {
                this.phoneShop = ma.feature.indexOf("Phone Shop") > -1 ? true : false;
                if (this.phoneShop === true) {
                    this.numMini = 1;
                }
            }

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['bill'];
                return data;
            }
        }
    }


</script>




