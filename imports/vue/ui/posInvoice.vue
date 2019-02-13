<template>
    <div class="pos_Invoice">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer"
                           @click="popupPosInvoiceAdd(),dialogAddPosInvoice= true,resetForm()"
                        >
                            <i class="fa fa-plus"></i> {{langConfig['invoice']}}
                        </a>
                    </h4>
                </el-col>
                <el-col :span="16" style="text-align: right; margin-right: 10px">
                    <br>
                    <el-row type="flex" justify="center">
                        <el-col :span="8"></el-col>
                        <el-col :span="8">
                            <el-button type="success" round
                                       @click="popupPosReceiveItem(),dialogAddPosReceiveItem = true,resetForm()">
                                {{langConfig['receiveItem']}}
                            </el-button>
                        </el-col>
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
                        :data="posInvoiceDataDisplay"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="invoiceDateName"
                            :label="langConfig['invoiceDate']"
                            sortable
                    >
                    </el-table-column>
                    <el-table-column
                            prop="invoiceNo"
                            :label="langConfig['invoiceNo']"
                            sortable
                    >
                    </el-table-column>
                    <el-table-column
                            prop="customerDoc.name"
                            :label="langConfig['customer']"
                    >
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
                            width="200"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removePosInvoice(scope.$index,scope.row,posInvoiceDataDisplay)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="popupPosInvoiceUpdate(scope.$index,scope.row,scope)"
                                           :disabled="disabledUpdate"></el-button>
                                <el-button type="success" icon="el-icon-view" size="small" class="cursor-pointer"
                                           @click="popupPosInvoiceShow(scope.row)"></el-button>

                                <el-button type="info" icon="el-icon-printer" size="small" class="cursor-pointer"
                                           @click="printInvoice(scope.row)"></el-button>
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
                :title="langConfig['add']"
                :visible.sync="dialogAddPosInvoice"
                :fullscreen="fullScreen"
                class="dialogInvoice"

        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posInvoiceForm" :rules="rules" :ref="refForm" label-width="120px"
                     :label-position="labelPosition"
                     class="posInvoiceForm">
                <el-row :gutter="20">
                    <el-col :span="18" class="posInvoiceForm">
                        <table class="table table-responsive​​​ table-striped table-hover responstable">
                            <thead>
                            <tr>
                                <th colspan="3" style="width: 30% !important;">
                                    <el-form-item label="" prop="locationId">

                                        <el-select style="display: block !important"
                                                   filterable clearable
                                                   v-model="posInvoiceForm.locationId"
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
                                                  v-model="posInvoiceForm.code" autofocus
                                                  @keyup.native.13="addToPosInvoiceData(null)"
                                        >
                                        </el-input>
                                    </el-form-item>
                                </th>
                                <th style="width: 20% !important;">
                                    <el-form-item label="">
                                        <el-select style="display: block !important;"
                                                   filterable clearable :remote-method="itemOpt"
                                                   v-model="posInvoiceForm.itemId" :disabled="disabledItem"
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

                                <th colspan="2">
                                    <el-form-item label="">
                                        <el-input :placeholder="langConfig['total']"
                                                  v-model.number="posInvoiceForm.total"
                                                  disabled>
                                            <template slot="prepend">{{langConfig['total']}} :</template>
                                            <template slot="append">{{currencySymbol}}</template>
                                        </el-input>
                                    </el-form-item>
                                </th>
                            </tr>
                            </thead>
                            <thead>
                            <tr>
                                <th>{{langConfig['no']}}</th>
                                <th style="min-width: 220px">{{langConfig['name']}}</th>
                                <th>{{langConfig['retail']}}</th>
                                <!--<th>{{langConfig['longitude']}}</th>
                                <th>{{langConfig['width']}}</th>-->
                                <th>{{langConfig['qty']}}</th>
                                <th>{{langConfig['price']}}</th>
                                <th colspan="2">{{langConfig['amount']}}</th>
                            </tr>
                            </thead>
                            <!--<draggable v-model="posInvoiceData" :element="'tbody'">-->
                            <tr v-for="(posInvoiceDoc,index ) in this.posInvoiceData" :key="index">
                                <td style="vertical-align: middle">{{index + 1}}</td>
                                <td style="vertical-align: middle">{{posInvoiceDoc.itemName}}</td>
                                <td style="vertical-align: middle">
                                    <el-switch
                                            v-model="posInvoiceDoc.isRetail"
                                            active-color="#13ce66"
                                            inactive-color="#ff4949"
                                            @change="updatePosInvoiceDetailByRetail(posInvoiceDoc, index)"
                                    >
                                    </el-switch>
                                </td>


                                <!--<td>
                                    <el-input placeholder="Please input Unit1" v-model.number=posInvoiceDoc.unit1
                                              @keyup.native="updatePosInvoiceDetail(posInvoiceDoc, index)"></el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Please input Unit2" v-model.number=posInvoiceDoc.unit2
                                              @keyup.native="updatePosInvoiceDetail(posInvoiceDoc, index)"></el-input>
                                </td>-->

                                <td>
                                    <el-input placeholder="Please input Qty"
                                              v-model.number=posInvoiceDoc.qty type='number'
                                              @keyup.native="updatePosInvoiceDetail(posInvoiceDoc, index)"
                                              @change="updatePosInvoiceDetail(posInvoiceDoc, index)">
                                        <template slot="append">{{posInvoiceDoc.unitName || ""}}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Please input Price" v-model.number=posInvoiceDoc.price
                                              type='number'
                                              @keyup.native="updatePosInvoiceDetail(posInvoiceDoc, index)"
                                              @change="updatePosInvoiceDetail(posInvoiceDoc, index)"
                                    ></el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Amount" v-model.number=posInvoiceDoc.amount
                                              disabled>
                                        <!--<template slot="append">{{currencySymbol}}</template>-->
                                        <template slot="append" v-if="phoneShop===false">
                                            <el-dropdown trigger="click" :hide-on-click="false">
                                                    <span class="el-dropdown-link">
                                                        <span v-if="phoneShop===false">{{langConfig['des']}}</span>
                                                        <span v-if="phoneShop===true">{{langConfig['imei']}}</span>
                                                         <span v-if="posInvoiceDoc.desc==''">
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
                                                                  v-model.number=posInvoiceDoc.desc
                                                                  @keyup.native="updatePosInvoiceDetail(posInvoiceDoc, index)"></el-input>
                                                        <el-input v-if="phoneShop===true"
                                                                  :placeholder="langConfig['imei']"
                                                                  type="textarea"
                                                                  v-model.number=posInvoiceDoc.desc
                                                                  @keyup.native="updatePosInvoiceDetail(posInvoiceDoc, index)"></el-input>
                                                    </el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </template>
                                        <template slot="append" v-if="phoneShop===true">
                                            <el-button slot="append" type="primary" icon="el-icon-plus"
                                                       @click.native="popUpAddImei(posInvoiceDoc,index)"
                                            >
                                                 <span class="el-dropdown-link">
                                                        {{langConfig['imei']}}
                                                         <span v-if="posInvoiceDoc.desc==''">
                                                                <i
                                                                        class="el-icon-caret-bottom el-icon--right"></i>
                                                            </span>
                                                            <span v-else>
                                                                {{posInvoiceDoc.numImei || 0}} <i
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
                                               @click="removePosInvoiceDetailByIndex(index,posInvoiceDoc)"></el-button>
                                </td>
                            </tr>
                            <!--</draggable>-->
                            <thead>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['discount']}} :
                                    <el-radio-group v-model="posInvoiceForm.discountType">
                                        <el-radio-button v-for="mt in discountTypeOption" :label="mt.value"
                                                         :key="mt.value"
                                        >
                                            {{langConfig[mt.label]}}
                                        </el-radio-button>
                                    </el-radio-group>
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="Amount Discount" prop="discount"
                                              v-model.number="posInvoiceForm.discount" type='number'>
                                        <template slot="append">{{typeDiscount}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['netTotal']}} :
                                </th>
                                <th colspan="2">
                                    <el-input :placeholder="langConfig['netTotal']"
                                              v-model.number="posInvoiceForm.netTotal"
                                              disabled>
                                        <template slot="append">{{currencySymbol}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidDollar']}}:
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="USD" v-model.number="posInvoiceForm.paidUSD" type='number'
                                              @change.native="getTotal()" @focus.native="clearZero($event)"
                                              @keyup.native="getTotal()"

                                    >
                                        <el-button slot="append" @click="clickUSD(posInvoiceForm.remainUSD)">
                                            {{posInvoiceForm.remainUSD}} $
                                        </el-button>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidRiel']}} :
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="KHR" @change="getTotal()"
                                              @keyup.native="getTotal()"

                                              v-model.number="posInvoiceForm.paidKHR" type='number'
                                    >
                                        <el-button slot="append" @click="clickKHR(posInvoiceForm.remainKHR)">
                                            {{posInvoiceForm.remainKHR}} ៛
                                        </el-button>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidBaht']}}:
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="THB" v-model.number="posInvoiceForm.paidTHB" type='number'
                                              @change="getTotal()"
                                              @keyup.native="getTotal()"
                                    >
                                        <el-button slot="append" @click="clickTHB(posInvoiceForm.remainTHB)">
                                            {{posInvoiceForm.remainTHB}} B
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
                                    <span class="plan-ribbon red">{{posInvoiceForm.discountValue}}{{currencySymbol}}</span>
                                    <span class="ui header">{{langConfig['balanceDue']}}</span>

                                </div>
                                <div class="ui  attached segment feature">
                                    <div class="amount">
                                        {{posInvoiceForm.balanceUnPaid}}{{currencySymbol}}
                                    </div>
                                </div>
                            </div>


                            <el-form-item :label="langConfig['customer']" prop="customerId">
                                <el-select style="display: block !important;"
                                           filterable clearable
                                           v-model="posInvoiceForm.customerId" remote :remote-method="customerOpt"
                                           :loading="loading"
                                           :placeholder="langConfig['customer']">
                                    <el-option
                                            v-for="item in customerOption"
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
                                        <el-input type="textarea" v-model="posInvoiceForm.address"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="1">
                                    <div class="">&nbsp;</div>
                                </el-col>
                                <el-col :span="11">
                                    <el-form-item :label="langConfig['invoiceNo']" prop="invoiceNo">
                                        <el-input v-model="posInvoiceForm.invoiceNo"
                                                  prefix-icon="el-icon-edit" size="small"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>


                            <el-row>
                                <el-col :span="12">
                                    <el-form-item :label="langConfig['invoiceDate']" prop="invoiceDate">
                                        <el-date-picker
                                                v-model="posInvoiceForm.invoiceDate"
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
                                                v-model="posInvoiceForm.dueDate"
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
                                                   v-model="posInvoiceForm.termId"
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
                                        <el-input type="textarea" v-model="posInvoiceForm.note" :rows="3"></el-input>
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
                        <el-button type="danger" @click.native="dialogAddPosInvoice= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">

                        <el-button type="success" @click="savePosInvoice(true,$event,true)"><i class="fa fa-print"></i>&nbsp; {{langConfig['saveAndPrint']}} ( + )</el-button>

                        <el-button type="warning" @click="savePosInvoice(false,$event,false)"><i
                                class="el-icon-circle-check"> </i>&nbsp; {{langConfig['saveAndNew']}} <i>(Ctrl + Alt + Enter)</i></el-button>

                        <el-button type="primary" @click.native="savePosInvoice(true,$event,false)"><i
                                class="el-icon-check"> </i>&nbsp; {{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>

                    </el-col>
                </el-row>
            </span>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                @close="handleCloseModal"
                :title="langConfig['update']"
                :visible.sync="dialogUpdatePosInvoice"
                :fullscreen="fullScreen"
                class="dialogInvoice"

        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posInvoiceForm" :rules="rules" :ref="refForm" label-width="120px"
                     :label-position="labelPosition"
                     class="posInvoiceForm">
                <el-row :gutter="20">
                    <el-col :span="18" class="posInvoiceForm">
                        <table class="table table-responsive​​​ table-striped table-hover responstable">
                            <thead>
                            <tr>
                                <th colspan="3" style="width: 30% !important;">
                                    <el-form-item label="" prop="locationId">
                                        <el-select style="display: block !important"
                                                   filterable clearable
                                                   v-model="posInvoiceForm.locationId" :disabled="disabledItem"
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
                                                  v-model="posInvoiceForm.code" autofocus
                                                  @keyup.native.13="addToPosInvoiceData(null)"
                                        >
                                        </el-input>
                                    </el-form-item>
                                </th>
                                <th style="width: 20% !important;">
                                    <el-form-item label="">
                                        <el-select style="display: block !important;"
                                                   filterable clearable
                                                   v-model="posInvoiceForm.itemId" :remote-method="itemOpt"
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

                                <th colspan="2">
                                    <el-form-item label="">
                                        <el-input :placeholder="langConfig['total']"
                                                  v-model.number="posInvoiceForm.total"
                                                  disabled>
                                            <template slot="prepend">{{langConfig['total']}} :</template>
                                            <template slot="append">{{currencySymbol}}</template>
                                        </el-input>
                                    </el-form-item>
                                </th>
                            </tr>
                            </thead>
                            <thead>
                            <tr>
                                <th>{{langConfig['no']}}</th>
                                <th style="min-width: 220px">{{langConfig['name']}}</th>
                                <th>{{langConfig['retail']}}</th>
                                <!--<th>{{langConfig['longitude']}}</th>
                                <th>{{langConfig['width']}}</th>-->
                                <th>{{langConfig['qty']}}</th>
                                <th>{{langConfig['price']}}</th>
                                <th colspan="2">{{langConfig['amount']}}</th>
                            </tr>
                            </thead>
                            <!--<draggable v-model="posInvoiceData" :element="'tbody'">-->
                            <tr v-for="(posInvoiceDoc,index ) in this.posInvoiceData" :key="index">
                                <td style="vertical-align: middle">{{index + 1}}</td>
                                <td style="vertical-align: middle">{{posInvoiceDoc.itemName}}</td>
                                <td style="vertical-align: middle">
                                    <el-switch
                                            v-model="posInvoiceDoc.isRetail"
                                            active-color="#13ce66"
                                            inactive-color="#ff4949"
                                            @change="updatePosInvoiceDetailByRetail(posInvoiceDoc, index)"
                                    >
                                    </el-switch>
                                </td>


                                <!--<td>
                                    <el-input placeholder="Please input Unit1" v-model.number=posInvoiceDoc.unit1
                                              @keyup.native="updatePosInvoiceDetail(posInvoiceDoc, index)"></el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Please input Unit2" v-model.number=posInvoiceDoc.unit2
                                              @keyup.native="updatePosInvoiceDetail(posInvoiceDoc, index)"></el-input>
                                </td>-->

                                <td>
                                    <el-input placeholder="Please input Qty" v-model.number=posInvoiceDoc.qty
                                              type='number'
                                              @keyup.native="updatePosInvoiceDetail(posInvoiceDoc, index)"
                                              @change="updatePosInvoiceDetail(posInvoiceDoc, index)"
                                    >
                                        <template slot="append">{{posInvoiceDoc.unitName || ""}}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Please input Price" v-model.number=posInvoiceDoc.price
                                              type='number'
                                              @keyup.native="updatePosInvoiceDetail(posInvoiceDoc, index)"
                                              @change="updatePosInvoiceDetail(posInvoiceDoc, index)"
                                    ></el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Amount" v-model.number=posInvoiceDoc.amount
                                              disabled>
                                        <template slot="append" v-if="phoneShop===false">
                                            <el-dropdown trigger="click" :hide-on-click="false">
                                                    <span class="el-dropdown-link">
                                                        <span v-if="phoneShop===false">{{langConfig['des']}}</span>
                                                        <span v-if="phoneShop===true">{{langConfig['imei']}}</span>
                                                         <span v-if="posInvoiceDoc.desc==''">
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
                                                                  v-model.number=posInvoiceDoc.desc
                                                                  @keyup.native="updatePosInvoiceDetail(posInvoiceDoc, index)"></el-input>
                                                        <el-input v-if="phoneShop===true"
                                                                  :placeholder="langConfig['imei']"
                                                                  type="textarea"
                                                                  v-model.number=posInvoiceDoc.desc
                                                                  @keyup.native="updatePosInvoiceDetail(posInvoiceDoc, index)"></el-input>
                                                    </el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </template>
                                        <template slot="append" v-if="phoneShop===true">
                                            <el-button slot="append" type="primary" icon="el-icon-plus"
                                                       @click.native="popUpAddImei(posInvoiceDoc,index)"
                                            >
                                                 <span class="el-dropdown-link">
                                                        {{langConfig['imei']}}
                                                         <span v-if="posInvoiceDoc.desc==''">
                                                                <i
                                                                        class="el-icon-caret-bottom el-icon--right"></i>
                                                            </span>
                                                            <span v-else>
                                                                {{posInvoiceDoc.numImei || 0}} <i
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
                                               @click="removePosInvoiceDetailByIndex(index,posInvoiceDoc)"></el-button>
                                </td>
                            </tr>
                            <!--</draggable>-->
                            <thead>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['discount']}} :
                                    <el-radio-group v-model="posInvoiceForm.discountType">
                                        <el-radio-button v-for="mt in discountTypeOption" :label="mt.value"
                                                         :key="mt.value"
                                        >
                                            {{langConfig[mt.label]}}
                                        </el-radio-button>
                                    </el-radio-group>
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="Amount Discount" prop="discount" type='number'
                                              v-model.number="posInvoiceForm.discount">
                                        <template slot="append">{{typeDiscount}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['netTotal']}} :
                                </th>
                                <th colspan="2">
                                    <el-input :placeholder="langConfig['netTotal']"
                                              v-model.number="posInvoiceForm.netTotal"
                                              disabled>
                                        <template slot="append">{{currencySymbol}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidDollar']}}:
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="USD" v-model.number="posInvoiceForm.paidUSD" type='number'
                                              @keyup.native="getTotal()" @change="getTotal()"
                                              @click.native="clearZero($event)"
                                    >
                                        <el-button slot="append" @click="clickUSD(posInvoiceForm.remainUSD)">
                                            {{posInvoiceForm.remainUSD}} $
                                        </el-button>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidRiel']}} :
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="KHR" @change="getTotal()" @keyup.native="getTotal()"
                                              v-model.number="posInvoiceForm.paidKHR" type='number'
                                    >
                                        <el-button slot="append" @click="clickKHR(posInvoiceForm.remainKHR)">
                                            {{posInvoiceForm.remainKHR}} ៛
                                        </el-button>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidBaht']}}:
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="THB" v-model.number="posInvoiceForm.paidTHB" type='number'
                                              @change="getTotal()" @keyup.native="getTotal()"
                                    >
                                        <el-button slot="append" @click="clickTHB(posInvoiceForm.remainTHB)">
                                            {{posInvoiceForm.remainTHB}} B
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
                                    <span class="plan-ribbon red">{{posInvoiceForm.discountValue}}{{currencySymbol}}</span>
                                    <span class="ui header">{{langConfig['balanceDue']}}</span>

                                </div>
                                <div class="ui  attached segment feature">
                                    <div class="amount">
                                        {{posInvoiceForm.balanceUnPaid}}{{currencySymbol}}
                                    </div>
                                </div>
                            </div>


                            <el-form-item :label="langConfig['customer']" prop="customerId">
                                <el-select style="display: block !important;"
                                           filterable clearable
                                           v-model="posInvoiceForm.customerId" remote :remote-method="customerOpt"
                                           :loading="loading"
                                           :placeholder="langConfig['customer']">
                                    <el-option
                                            v-for="item in customerOption"
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
                                        <el-input type="textarea" v-model="posInvoiceForm.address"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="1">
                                    <div class="">&nbsp;</div>
                                </el-col>
                                <el-col :span="11">
                                    <el-form-item :label="langConfig['invoiceNo']" prop="invoiceNo">
                                        <el-input v-model="posInvoiceForm.invoiceNo" prefix-icon="el-icon-edit"
                                                  size="small"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>


                            <el-row>
                                <el-col :span="12">
                                    <el-form-item :label="langConfig['invoiceDate']" prop="invoiceDate">
                                        <el-date-picker
                                                v-model="posInvoiceForm.invoiceDate"
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
                                                v-model="posInvoiceForm.dueDate"
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
                                                   v-model="posInvoiceForm.termId"
                                                   :placeholder="langConfig['term']">
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
                                        <el-input type="textarea" v-model="posInvoiceForm.note" :rows="3"></el-input>
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
                        <el-button type="danger" @click="dialogUpdatePosInvoice= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">

                         <el-button type="success" @click.native="updatePosInvoice(posInvoiceId,true)"><i
                                 class="fa fa-print"></i>&nbsp;&nbsp; {{langConfig['saveAndPrint']}}</el-button>

                         <el-button type="primary" @click.native="updatePosInvoice(posInvoiceId,false)"><i
                                 class="el-icon-circle-check"> </i>&nbsp; {{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                    </el-col>
                </el-row>
            </span>
        </el-dialog>


        <el-dialog
                :title="langConfig['show']"
                :visible.sync="dialogShowPosInvoice"
        >
            <div class="row">
                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['invoiceNo']}} : </label>{{posInvoiceShowData.invoiceNo
                    || ""}}
                </div>
                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['customer']}} : </label>{{posInvoiceShowData.customerName
                    || ""}}
                </div>
                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['invoiceDate']}} : </label>{{posInvoiceShowData.invoiceDateName
                    ||
                    ""}}
                </div>
                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['dueDate']}} : </label>{{posInvoiceShowData.dueDate
                    | momentFormat
                    }}
                </div>
                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['total']}}: </label>{{posInvoiceShowData.total ||
                    ""}}
                </div>
                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['address']}} : </label>{{posInvoiceShowData.address
                    || ""}}
                </div>


            </div>
            <br>
            <el-table
                    :data="posInvoiceShowData.item"
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
                        prop="price"
                        :label="langConfig['price']"
                >
                </el-table-column>
                <!--<el-table-column
                        prop="unit1"
                        :label="langConfig['longitude']"
                >
                </el-table-column>
                <el-table-column
                        prop="unit2"
                        :label="langConfig['width']"
                >
                </el-table-column>-->

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

                <!--<el-table-column
                        prop="totalUnit"
                        :label="langConfig['square']"
                >
                </el-table-column>-->

                <el-table-column
                        prop="amount"
                        :label="langConfig['amount']"
                >
                </el-table-column>

            </el-table>

        </el-dialog>


        <!--Form Modal-->
        <el-dialog
                @close="handleCloseModal"
                :title="langConfig['receiveItem']"
                :visible.sync="dialogAddPosReceiveItem"
                :fullscreen="fullScreen"

        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posInvoiceForm" :rules="rules" :ref="refForm" label-width="120px"
                     :label-position="labelPosition"
                     class="posInvoiceForm">
                <el-row :gutter="20">
                    <el-col :span="18" class="posInvoiceForm">
                        <table class="table table-responsive​​​ table-striped table-hover responstable">
                            <thead>
                            <tr>
                                <th colspan="3" style="width: 30% !important;">
                                    <el-form-item label="" prop="locationId">

                                        <el-select style="display: block !important"
                                                   filterable clearable
                                                   v-model="posInvoiceForm.locationId" disabled
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
                                <th colspan="2">
                                    <el-form-item label="">
                                        <el-input :placeholder="langConfig['total']"
                                                  v-model.number="posInvoiceForm.total"
                                                  disabled>
                                            <template slot="prepend">{{langConfig['total']}} :</template>
                                            <template slot="append">{{currencySymbol}}</template>
                                        </el-input>
                                    </el-form-item>
                                </th>
                                <th colspan="2">
                                    <el-form-item label="">

                                        <el-input :placeholder="langConfig['paidOnSaleOrderRaw']"
                                                  v-model.number="posInvoiceForm.balanceNotCutFull"
                                                  disabled>
                                            <template slot="prepend">{{langConfig['paidOnSaleOrderRaw']}} :</template>
                                            <template slot="append">{{currencySymbol}}</template>
                                        </el-input>
                                    </el-form-item>
                                </th>
                            </tr>
                            </thead>
                            <thead>
                            <tr>
                                <th>{{langConfig['no']}}</th>
                                <th style="min-width: 220px">{{langConfig['name']}}</th>
                                <th>{{langConfig['price']}}</th>
                                <th>{{langConfig['amount']}}</th>
                                <th>{{langConfig['qty']}}</th>
                                <th style="color: #e91e63 !important;">{{langConfig['qtyReceive']}}</th>
                                <th style="vertical-align: middle;">
                                    <el-checkbox v-model="posInvoiceForm.isReceiveAll"></el-checkbox>
                                </th>
                            </tr>
                            </thead>
                            <!--<draggable v-model="posInvoiceData" :element="'tbody'">-->
                            <tr v-for="(posInvoiceDoc,index ) in this.posInvoiceData" :key="index">
                                <td style="vertical-align: middle">{{index + 1}}</td>
                                <td style="vertical-align: middle">{{posInvoiceDoc.itemName}}</td>

                                <td>
                                    <el-input placeholder="Please input Price" v-model.number=posInvoiceDoc.price
                                              type='number'
                                              @keyup.native="updatePosInvoiceDetailReceiveItem(posInvoiceDoc, index)"
                                              @change="updatePosInvoiceDetailReceiveItem(posInvoiceDoc, index)"
                                    ></el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Amount" v-model.number=posInvoiceDoc.amount
                                              disabled>
                                        <!--<template slot="append">{{currencySymbol}}</template>-->

                                    </el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Please input Qty"
                                              v-model.number=posInvoiceDoc.rawQty type='number' disabled
                                    >
                                        <template slot="append">{{posInvoiceDoc.unitName || ""}}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Please input Qty"
                                              v-model.number=posInvoiceDoc.qty type='number'
                                              @keyup.native="updatePosInvoiceDetailReceiveItemQty(posInvoiceDoc, index)"
                                              @change="updatePosInvoiceDetailReceiveItemQty(posInvoiceDoc, index)">
                                        <template slot="append">
                                            <el-dropdown trigger="click" :hide-on-click="false">
                                                    <span class="el-dropdown-link">
                                                        {{langConfig['desc']}} <span v-if="posInvoiceDoc.desc==''">
                                                                <i class="el-icon-caret-bottom el-icon--right"></i>
                                                            </span>
                                                            <span v-else>
                                                                <i class="el-icon-circle-check el-icon--right"
                                                                   style="color: blue"></i>

                                                            </span>
                                                    </span>
                                                <el-dropdown-menu slot="dropdown">
                                                    <el-dropdown-item class="clearfix">
                                                        <el-input :placeholder="langConfig['desc']" type="textarea"
                                                                  v-model.number=posInvoiceDoc.desc
                                                                  @keyup.native="updatePosInvoiceDetailReceiveItem(posInvoiceDoc, index)"></el-input>
                                                    </el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </template>
                                    </el-input>
                                </td>
                                <td style="text-align: center;vertical-align: middle; width: auto">
                                    <input type="text" v-model="posInvoiceDoc.saleOrderId" hidden="hidden"/>
                                    <el-checkbox v-model="posInvoiceDoc.isReceive"
                                                 @change="updatePosInvoiceDetailReceiveItem(posInvoiceDoc, index)"></el-checkbox>

                                </td>
                            </tr>
                            <!--</draggable>-->
                            <thead>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['discount']}} :
                                    <el-radio-group v-model="posInvoiceForm.discountType">
                                        <el-radio-button v-for="mt in discountTypeOption" :label="mt.value"
                                                         :key="mt.value"
                                        >
                                            {{langConfig[mt.label]}}
                                        </el-radio-button>
                                    </el-radio-group>
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="Amount Discount" prop="discount"
                                              v-model.number="posInvoiceForm.discount" type='number'>
                                        <template slot="append">{{typeDiscount}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['netTotal']}} :
                                </th>
                                <th colspan="2">
                                    <el-input :placeholder="langConfig['netTotal']"
                                              v-model.number="posInvoiceForm.netTotal"
                                              disabled>
                                        <template slot="append">{{currencySymbol}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidOnSaleOrder']}}:
                                </th>
                                <th colspan="2">
                                    <el-input :placeholder="langConfig['paidOnSaleOrder']"
                                              v-model.number="posInvoiceForm.balanceNotCut"
                                              disabled>
                                        <template slot="append">{{currencySymbol}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidDollar']}}:
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="USD" v-model.number="posInvoiceForm.paidUSD"
                                              type='number'
                                              @change.native="getTotal()" @focus.native="clearZero($event)"
                                              @keyup.native="getTotal()"

                                    >
                                        <template slot="append">{{posInvoiceForm.remainUSD}} $</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidRiel']}} :
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="KHR" @change="getTotal()"
                                              @keyup.native="getTotal()"

                                              v-model.number="posInvoiceForm.paidKHR" type='number'
                                    >
                                        <template slot="append">{{posInvoiceForm.remainKHR}} ៛</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidBaht']}}:
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="THB" v-model.number="posInvoiceForm.paidTHB"
                                              type='number'
                                              @change="getTotal()"
                                              @keyup.native="getTotal()"
                                    >
                                        <template slot="append">{{posInvoiceForm.remainTHB}} B</template>
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
                                    <span class="plan-ribbon red">{{posInvoiceForm.discountValue}}{{currencySymbol}}</span>
                                    <span class="ui header">{{langConfig['balanceDue']}}</span>

                                </div>
                                <div class="ui  attached segment feature">
                                    <div class="amount">
                                        {{posInvoiceForm.balanceUnPaid}}{{currencySymbol}}
                                    </div>
                                </div>
                            </div>


                            <el-form-item :label="langConfig['customer']" prop="customerId">
                                <el-select style="display: block !important;"
                                           filterable clearable
                                           v-model="posInvoiceForm.customerId" remote :remote-method="customerOpt"
                                           :loading="loading"
                                           :placeholder="langConfig['customer']">
                                    <el-option
                                            v-for="item in customerOption"
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
                                        <el-input type="textarea" v-model="posInvoiceForm.address"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="1">
                                    <div class="">&nbsp;</div>
                                </el-col>
                                <el-col :span="11">
                                    <el-form-item :label="langConfig['invoiceNo']" prop="invoiceNo">
                                        <el-input v-model="posInvoiceForm.invoiceNo"
                                                  prefix-icon="el-icon-edit" size="small"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>


                            <el-row>
                                <el-col :span="12">
                                    <el-form-item :label="langConfig['invoiceDate']" prop="invoiceDate">
                                        <el-date-picker
                                                v-model="posInvoiceForm.invoiceDate"
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
                                                v-model="posInvoiceForm.dueDate"
                                                type="date"
                                                style="width: 100%;"
                                                placeholder="Pick a day"
                                                :picker-options="options"
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
                                                   v-model="posInvoiceForm.termId"
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
                                        <el-input type="textarea" v-model="posInvoiceForm.note" :rows="3"></el-input>
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
                        <el-button type="danger"
                                   @click.native="dialogAddPosReceiveItem= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">

                        <el-button type="success" @click="savePosReceiveItem(true,$event,true)"><i
                                class="fa fa-print"></i>&nbsp; {{langConfig['saveAndPrint']}}</el-button>

                        <el-button type="warning" @click="savePosReceiveItem(false,$event,false)"><i
                                class="el-icon-circle-check"> </i>&nbsp; {{langConfig['saveAndNew']}} <i>(Ctrl + Alt + Enter)</i></el-button>

                        <el-button type="primary" @click.native="savePosReceiveItem(true,$event,false)"><i
                                class="el-icon-check"> </i>&nbsp; {{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>

                    </el-col>
                </el-row>
            </span>
        </el-dialog>
        <!--End Form modal-->

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
    // require('cleave.js/dist/addons/cleave-phone.ac');
    // require('cleave.js/dist/addons/cleave-phone.{country}');
    import compoLang from '../../../both/i18n/lang/elem-label'
    import {Pos_InvoiceReact} from "../../collection/posInvoice";

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
                Pos_InvoiceReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        components: {
            draggable
        },
        data() {
            return {
                newLoading: true,
                keyCode: [],
                refForm: '',
                posInvoiceData: [],
                posInvoiceDataDisplay: [],
                posInvoiceShowData: {},

                multipleSelection: [],
                posInvoiceId: "",
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddPosInvoice: false,
                dialogUpdatePosInvoice: false,
                dialogShowPosInvoice: false,
                dialogAddPosReceiveItem: false,
                dialogAddImei: false,
                typeDiscount: "",
                fullScreen: true,
                phoneShop: false,
                validateImei: false,
                isMiniInvoice: false,
                posInvoiceForm: {
                    itemId: "",
                    itemName: "",
                    price: 0,
                    qty: 0,
                    amount: 0,
                    total: 0,
                    netTotal: 0,
                    balanceUnPaid: 0,
                    paid: 0,
                    invoiceDate: moment().toDate(),
                    dueDate: moment().add(1, "month").toDate(),
                    invoiceNo: "",

                    note: "",

                    discountType: "Amount",
                    discount: 0,
                    discountValue: 0,
                    termId: "",
                    address: "",
                    customerId: "001",

                    isRetail: true,
                    paidUSD: 0,
                    paidKHR: 0,
                    paidTHB: 0,

                    remainUSD: 0,
                    remainKHR: 0,
                    remainTHB: 0,
                    unit1: 1,
                    unit2: 1,
                    totalUnit: 1,
                    desc: "",
                    locationId: "001",
                    rawQty: 0,
                    isReceiveAll: false,
                    balanceNotCut: 0,
                    balanceNotCutFull: 0,
                    code: "",
                    imei: []

                },
                rules: {
                    invoiceDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input PosInvoiceDate',
                        trigger: 'blur'
                    }],
                    invoiceNo: [{required: true, type: 'string', message: 'Please input Invoice No', trigger: 'blur'}],
                    discount: [{
                        required: true,
                        type: 'string',
                        message: 'Please input Discount',
                        trigger: 'blur'
                    }],
                    customerId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose customer',
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
                    }],

                    // note: [{required: true, type: 'string', message: 'Please input Memo', trigger: 'blur'}],
                },

                // Options
                itemOption: [],
                customerOption: [],
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
                posInvoiceDetail: {},
                discountTypeOption: [
                    {label: "amount", value: "Amount"},
                    {label: "percent", value: "Percent"}
                ],
                locationOption: [],
                disabledItem: true,
                timeStamp: [],
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

            let elem = this.$jQuery('el-dialog.dialogInvoice');
            let checkEvent = $._data($('body').get(0), 'events');
            if (checkEvent.keyup.length <= 1) {
                this.$nextTick(() => {
                    this.$jQuery('body').on('keyup', elem, this.barcodeScanInvoice);
                })
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
            "posInvoiceForm.invoiceDate"(val) {
                let vm = this;
                if (vm.dialogUpdatePosInvoice === false) {
                    vm.posInvoiceForm.posInvoiceDate = val;
                }
                if (vm.closeDate && vm.closeDate !== "" && vm.closeDate !== undefined) {
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
                if (this.$refs["posInvoiceFormAdd"]) {
                    this.getVoucherByRoleAndDate(val);
                }
            },
            /*dialogAddPosInvoice(val) {
                if (val) {
                    this._inputMaskPosInvoice();
                }
            },*/
            dialogUpdatePosInvoice(val) {
                if (val) {
                    this._inputMaskPosInvoice();
                }
            },
            "posInvoiceForm.itemId"(val) {
                if (val) {
                    this.addToPosInvoiceData(val);
                }
            },
            "posInvoiceForm.customerId"(val) {
                let vm = this;
                if (val) {
                    Meteor.call("queryPosCustomerById", val, (err, result) => {
                        if (result) {
                            vm.posInvoiceForm.address = result.address;

                            if (vm.refForm === "posInvoiceFormAdd") {
                                vm.posInvoiceForm.termId = result.termId;
                            }
                        }
                    })

                }
                if (vm.refForm === "posReceiveItem") {
                    vm.findPosSaleOrderIdByCustomerId(val);
                }

            },
            "posInvoiceForm.discount"(val) {
                if (val || val === 0) {
                    this.posInvoiceForm.discount = val;
                    // this.posInvoiceForm.discount = this.$_numeral(val).format("0,00");
                    this.getTotal();

                }
            },
            "posInvoiceForm.discountType"(val) {
                if (val) {
                    this.posInvoiceForm.discountType = val;
                    this.getTotal();
                }
            },
            "posInvoiceForm.locationId"(val) {
                if (val && val !== "") {
                    this.disabledItem = false;
                } else {
                    this.disabledItem = true;
                }
            },
            "posInvoiceForm.isReceiveAll"(val) {

                let vm = this;
                if (vm.refForm === "posReceiveItem") {
                    let ind = 0;
                    if (val === false) {
                        vm.posInvoiceForm.isReceiveAll = false;
                    }
                    vm.posInvoiceData.map((obj) => {
                        obj.isReceive = val;
                        if (obj.isReceive === false) {
                            obj.isReceiveAll = false;
                        }
                        vm.updatePosInvoiceDetailReceiveItem(obj, ind);
                        ind++;
                    })
                }
            },
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
                this.posInvoiceForm.paidTHB = this.$_numeral(val).value();
                this.getTotal();
            },
            clickUSD(val) {
                this.posInvoiceForm.paidUSD = this.$_numeral(val).value();
                this.getTotal();
            },
            clickKHR(val) {
                this.posInvoiceForm.paidKHR = this.$_numeral(val).value();
                this.getTotal();
            },
            _inputMaskPosInvoice() {
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
            barcodeScanInvoice(e) {
                let vm = this;
                if ((this.dialogAddPosInvoice === true || this.dialogUpdatePosInvoice === true) && this.dialogAddImei === false) {
                    let scannerSensitivity = 100;
                    let charCode = event.which || event.keyCode;
                    if (charCode !== 13 && charCode !== 16 && charCode !== 18 && charCode !== 17) {
                        this.takeBarcode += String.fromCharCode(charCode);
                    }


                    if (e.keyCode === 107 && !e.ctrlKey && !e.altKey) {
                        e.preventDefault();
                        vm.savePosInvoice(true, e, true);

                    }

                    this.timeStamp.push(Date.now());
                    if (this.timeStamp.length > 1) {
                        if (this.timeStamp[1] - this.timeStamp[0] >= scannerSensitivity) {
                            this.takeBarcode = '';
                            this.timeStamp = [];
                        } else {
                            if (e.keyCode === 13) {
                                this.posInvoiceForm.code = this.takeBarcode;
                                if (this.takeBarcode !== "") {
                                    vm.addToPosInvoiceData(null);
                                }
                                this.timeStamp = [];
                                this.takeBarcode = ''
                            }
                        }
                    }
                } else {
                    if (e.keyCode === 107 && !e.ctrlKey && !e.altKey) {
                        e.preventDefault();
                        this.popupPosInvoiceAdd();
                        this.dialogAddPosInvoice = true;
                        this.resetForm();
                    }
                }
            },

            indexMethod(index) {
                return index + 1;
            },
            queryData: _.debounce(function (val, skip, limit) {
                this.newLoading = true;
                Meteor.call('queryPosInvoice', {
                    q: val,
                    filter: this.filter,
                    rolesArea: Session.get('area'),
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.posInvoiceDataDisplay = result.content;
                        this.count = result.countPosInvoice;
                    }
                    this.isSearching = false;
                    this.newLoading = false;
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
            customerOpt(query) {
                if (!!query) {
                    setTimeout(() => {
                        let lists = [];
                        Meteor.call('queryPosCustomerOption', query, Session.get("area"), (err, result) => {
                            if (!err) {
                                this.customerOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryPosCustomerOption', "", Session.get("area"), (err, result) => {
                        if (!err) {
                            this.customerOption = result;
                        } else {
                            console.log(err.message);
                        }
                    })
                }
            },
            termOpt() {
                let selector = {};
                Meteor.call('queryPosTermOption', selector, (err, result) => {
                    this.termOption = result;
                })
            },
            /*checkValidatedNumber() {
                let charCode = (val.which) ? val.which : val.keyCode;
                if ($(val.currentTarget).val().indexOf('.') != -1) {
                    if (charCode == 46) {
                        return false;
                    }
                }
                return !(charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57));

            },*/
            savePosInvoice(isCloseDialog, event, isPrint) {
                event.preventDefault();
                let vm = this;

                if (vm.posInvoiceData.length === 0) {
                    vm.$message({
                        duration: 1000,
                        message: this.langConfig['noItemAdd'],
                        type: 'error'
                    });
                    return false;
                }
                this.$refs["posInvoiceFormAdd"].validate((valid) => {
                    if (valid) {
                        let posInvoiceDoc = {
                            total: vm.$_numeral(vm.posInvoiceForm.total).value(),
                            netTotal: vm.$_numeral(vm.posInvoiceForm.netTotal).value(),
                            balanceUnPaid: vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value(),
                            paid: vm.$_numeral(vm.posInvoiceForm.netTotal).value() - vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value(),

                            paidUSD: vm.$_numeral(vm.posInvoiceForm.paidUSD).value(),
                            paidKHR: vm.$_numeral(vm.posInvoiceForm.paidKHR).value(),
                            paidTHB: vm.$_numeral(vm.posInvoiceForm.paidTHB).value(),

                            remainUSD: vm.$_numeral(vm.posInvoiceForm.remainUSD).value(),
                            remainKHR: vm.$_numeral(vm.posInvoiceForm.remainKHR).value(),
                            remainTHB: vm.$_numeral(vm.posInvoiceForm.remainTHB).value(),

                            invoiceDate: moment(vm.posInvoiceForm.invoiceDate).toDate(),
                            invoiceDateName: moment(vm.posInvoiceForm.invoiceDate).format("DD/MM/YYYY"),
                            dueDate: moment(vm.posInvoiceForm.dueDate).toDate(),
                            invoiceNo: vm.posInvoiceForm.invoiceNo,

                            note: vm.posInvoiceForm.note,

                            discountType: vm.posInvoiceForm.discountType,


                            discount: vm.$_numeral(vm.posInvoiceForm.discount).value(),
                            discountValue: vm.$_numeral(vm.posInvoiceForm.discountValue).value(),
                            termId: vm.posInvoiceForm.termId,
                            address: vm.posInvoiceForm.address,
                            imei: vm.imei,

                            rolesArea: Session.get('area'),
                            paymentNumber: 1,
                            customerId: vm.posInvoiceForm.customerId,
                            locationId: vm.posInvoiceForm.locationId,
                            closeDate: vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value() === 0 ? moment(vm.posInvoiceForm.invoiceDate).toDate() : "",
                            status: vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value() === 0 ? "Complete" : vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value() < vm.$_numeral(vm.posInvoiceForm.netTotal).value() ? "Partial" : "Active"
                        };
                        posInvoiceDoc.item = vm.posInvoiceData;
                        Meteor.call("insertPosInvoice", posInvoiceDoc, (err, result) => {
                            if (!err) {
                                if (isPrint) {
                                    if (vm.isMiniInvoice === true) {
                                        FlowRouter.go('/pos-data/posInvoiceSmall/print?inv=' + result);
                                    } else {
                                        FlowRouter.go('/pos-data/posInvoice/print?inv=' + result);
                                    }
                                } else {
                                    vm.$message({
                                        duration: 1000,
                                        message: this.langConfig['saveSuccess'],
                                        type: 'success'
                                    });
                                }
                                if (isCloseDialog) {
                                    this.dialogAddPosInvoice = false;
                                } else {
                                    vm.getVoucherByRoleAndDate(moment().toDate());
                                }

                                Session.set("transactionActionNumber", (Session.get("transactionActionNumber") || 0) + 1);

                                vm.resetForm();
                            } else {
                                vm.$notify.error({
                                    duration: 5000,
                                    title: 'Error',
                                    message: err.error
                                });
                                /*vm.$message({
                                    type: 'error',
                                    message: err.error
                                });*/
                            }
                        })

                    }
                })


            },
            updatePosInvoice(id, isPrint) {
                event.preventDefault();
                let vm = this;
                vm.$refs["posInvoiceFormUpdate"].validate((valid) => {
                    if (valid) {
                        let posInvoiceDoc = {
                            total: vm.$_numeral(vm.posInvoiceForm.total).value(),
                            netTotal: vm.$_numeral(vm.posInvoiceForm.netTotal).value(),
                            balanceUnPaid: vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value(),
                            paid: vm.$_numeral(vm.posInvoiceForm.netTotal).value() - vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value(),

                            paidUSD: vm.$_numeral(vm.posInvoiceForm.paidUSD).value(),
                            paidKHR: vm.$_numeral(vm.posInvoiceForm.paidKHR).value(),
                            paidTHB: vm.$_numeral(vm.posInvoiceForm.paidTHB).value(),

                            remainUSD: vm.$_numeral(vm.posInvoiceForm.remainUSD).value(),
                            remainKHR: vm.$_numeral(vm.posInvoiceForm.remainKHR).value(),
                            remainTHB: vm.$_numeral(vm.posInvoiceForm.remainTHB).value(),

                            invoiceDate: moment(vm.posInvoiceForm.invoiceDate).toDate(),
                            invoiceDateName: moment(vm.posInvoiceForm.invoiceDate).format("DD/MM/YYYY"),
                            dueDate: moment(vm.posInvoiceForm.dueDate).toDate(),
                            invoiceNo: vm.posInvoiceForm.invoiceNo,

                            note: vm.posInvoiceForm.note,

                            discountType: vm.posInvoiceForm.discountType,
                            discount: vm.$_numeral(vm.posInvoiceForm.discount).value(),
                            discountValue: vm.$_numeral(vm.posInvoiceForm.discountValue).value(),

                            termId: vm.posInvoiceForm.termId,
                            address: vm.posInvoiceForm.address,
                            imei: vm.imei,

                            rolesArea: Session.get('area'),
                            customerId: vm.posInvoiceForm.customerId,
                            _id: id,
                            locationId: vm.posInvoiceForm.locationId,
                            closeDate: vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value() === 0 ? moment(vm.posInvoiceForm.invoiceDate).toDate() : "",
                            status: vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value() === 0 ? "Complete" : vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value() < vm.$_numeral(vm.posInvoiceForm.netTotal).value() ? "Partial" : "Active"
                        };
                        posInvoiceDoc.item = vm.posInvoiceData;
                        Meteor.call("updatePosInvoice", posInvoiceDoc, id, (err, result) => {
                            if (!err) {

                                if (isPrint) {
                                    FlowRouter.go('/pos-data/posInvoice/print?inv=' + id);
                                } else {
                                    vm.$message({
                                        duration: 1000,
                                        message: this.langConfig['saveSuccess'],
                                        type: 'success'
                                    });
                                }

                                Session.set("transactionActionNumber", (Session.get("transactionActionNumber") || 0) + 1);

                                vm.dialogUpdatePosInvoice = false;

                                vm.resetForm();
                            } else {
                                vm.$notify.error({
                                    duration: 5000,
                                    title: 'Error',
                                    message: err.error
                                });
                                /*vm.$message({
                                    duration: 1000,
                                    message: err.error,
                                    type: 'error'
                                });*/
                            }
                        })
                    }
                })

            },
            savePosReceiveItem(isCloseDialog, id, isPrint) {
                event.preventDefault();
                let vm = this;
                this.$refs["posReceiveItem"].validate((valid) => {
                    if (valid) {
                        let posInvoiceDoc = {
                            total: vm.$_numeral(vm.posInvoiceForm.total).value(),
                            netTotal: vm.$_numeral(vm.posInvoiceForm.netTotal).value(),
                            balanceUnPaid: vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value(),
                            paid: vm.$_numeral(vm.posInvoiceForm.netTotal).value() - vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value() - vm.$_numeral(vm.posInvoiceForm.balanceNotCut).value(),

                            paidUSD: vm.$_numeral(vm.posInvoiceForm.paidUSD).value(),
                            paidKHR: vm.$_numeral(vm.posInvoiceForm.paidKHR).value(),
                            paidTHB: vm.$_numeral(vm.posInvoiceForm.paidTHB).value(),

                            remainUSD: vm.$_numeral(vm.posInvoiceForm.remainUSD).value(),
                            remainKHR: vm.$_numeral(vm.posInvoiceForm.remainKHR).value(),
                            remainTHB: vm.$_numeral(vm.posInvoiceForm.remainTHB).value(),

                            invoiceDate: moment(vm.posInvoiceForm.invoiceDate).toDate(),
                            invoiceDateName: moment(vm.posInvoiceForm.invoiceDate).format("DD/MM/YYYY"),
                            dueDate: moment(vm.posInvoiceForm.dueDate).toDate(),
                            invoiceNo: vm.posInvoiceForm.invoiceNo,

                            note: vm.posInvoiceForm.note,

                            discountType: vm.posInvoiceForm.discountType,


                            discount: vm.$_numeral(vm.posInvoiceForm.discount).value(),
                            discountValue: vm.$_numeral(vm.posInvoiceForm.discountValue).value(),
                            termId: vm.posInvoiceForm.termId,
                            address: vm.posInvoiceForm.address,
                            balanceNotCut: vm.$_numeral(vm.posInvoiceForm.balanceNotCut).value(),
                            rolesArea: Session.get('area'),
                            paymentNumber: 1,
                            customerId: vm.posInvoiceForm.customerId,
                            locationId: vm.posInvoiceForm.locationId,
                            closeDate: vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value() === 0 ? moment(vm.posInvoiceForm.invoiceDate).toDate() : "",
                            status: vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value() === 0 ? "Complete" : vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value() < vm.$_numeral(vm.posInvoiceForm.netTotal).value() ? "Partial" : "Active"
                        };
                        let newPosInvoiceData = [];
                        vm.posInvoiceData.map((obj) => {
                            if (obj.isReceive === true) {
                                newPosInvoiceData.push(obj);
                            }
                        });
                        posInvoiceDoc.item = newPosInvoiceData;

                        Meteor.call("insertPosInvoice", posInvoiceDoc, true, (err, result) => {
                            if (!err) {
                                if (isPrint) {
                                    FlowRouter.go('/pos-data/posInvoiceReceiveItem/print?inv=' + result);
                                } else {
                                    vm.$message({
                                        duration: 1000,
                                        message: vm.langConfig['saveSuccess'],
                                        type: 'success'
                                    });
                                }
                                if (isCloseDialog) {
                                    this.dialogAddPosReceiveItem = false;
                                } else {
                                    vm.getVoucherByRoleAndDate(moment().toDate());
                                }

                                Session.set("transactionActionNumber", (Session.get("transactionActionNumber") || 0) + 1);

                                vm.resetForm();
                            } else {
                                vm.$notify.error({
                                    duration: 5000,
                                    title: 'Error',
                                    message: err.error
                                });
                            }
                        })


                    }
                })
            },
            removePosInvoice(index, row, rows) {
                let vm = this;

                let companyDoc = WB_waterBillingSetup.findOne({});
                if (companyDoc.integratedPosAccount) {
                    Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                        if (re !== undefined) {
                            vm.closeDate = re.closeDate;
                        } else {
                            vm.closeDate = "";
                        }

                        if (vm.closeDate && vm.closeDate.getTime() >= row.invoiceDate.getTime()) {
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
                                Meteor.call("removePosInvoice", row._id, row, (err, result) => {
                                    if (!err) {
                                        rows.splice(index, 1);
                                        vm.$message({
                                            message: `${row.invoiceDateName}​ : ${row.invoiceNo} ` + vm.langConfig['removeSuccess'],
                                            type: 'success'
                                        });
                                        Session.set("transactionActionNumber", (Session.get("transactionActionNumber") || 0) + 1);
                                    } else {
                                        vm.$message({
                                            type: 'error',
                                            message: vm.langConfig['removeFail']
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
                            Meteor.call("removePosInvoice", row._id, row, (err, result) => {
                                if (!err) {
                                    rows.splice(index, 1);
                                    vm.$message({
                                        message: `${row.invoiceDateName}​ : ${row.invoiceNo} ` + vm.langConfig['removeSuccess'],
                                        type: 'success'
                                    });
                                    Session.set("transactionActionNumber", (Session.get("transactionActionNumber") || 0) + 1);
                                } else {
                                    vm.$message({
                                        type: 'error',
                                        message: vm.langConfig['removeFail']
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
            popupPosInvoiceAdd() {
                this.refForm = "posInvoiceFormAdd";
                this.resetForm();
                this.itemOpt();
                let vm = this;
                $(".el-dialog__title").text(this.langConfig['add']);

                this.customerOpt();
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
            popupPosReceiveItem() {
                this.refForm = "posReceiveItem";
                this.resetForm();
                this.itemOpt();
                let vm = this;
                $(".el-dialog__title").text(this.langConfig['receiveItem']);

                this.customerOpt();
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
            getVoucherByRoleAndDate(date) {
                let vm = this;
                Meteor.call("pos_getInvoiceNoByRoleAndDate", Session.get("area"), date, (err, result) => {
                    if (!err) {
                        vm.posInvoiceForm.invoiceNo = result;
                    }
                })
            },
            popupPosInvoiceUpdate(index, row, scope) {
                this.refForm = "posInvoiceFormUpdate";
                this.resetForm();
                this.itemOpt();
                let vm = this;
                $(".el-dialog__title").text(this.langConfig['update']);

                let companyDoc = WB_waterBillingSetup.findOne({});
                if (companyDoc.integratedPosAccount) {
                    Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                        if (re !== undefined) {
                            vm.closeDate = re.closeDate;
                        } else {
                            vm.closeDate = "";
                        }

                        if (vm.closeDate && vm.closeDate.getTime() >= row.invoiceDate.getTime()) {
                            vm.$message({
                                duration: 1000,
                                message: "Already Closing Entry In Account!!",
                                type: 'error'
                            });
                            return false;
                        }
                        if ((row.status === "Active" || row.paymentNumber < 2) && row.transactionType !== "Invoice Sale Order") {
                            vm.customerOpt(row.customerDoc._id);
                            vm.termOpt();
                            vm.dialogUpdatePosInvoice = true;
                            vm.findPosInvoiceById(scope);
                        } else {
                            vm.$message({
                                duration: 1000,
                                message: "Not Active State!!",
                                type: 'error'
                            });
                        }

                    })
                } else {
                    if ((row.status === "Active" || row.paymentNumber < 2) && row.transactionType !== "Invoice Sale Order") {
                        vm.customerOpt(row.customerDoc._id);
                        vm.termOpt();
                        vm.dialogUpdatePosInvoice = true;
                        vm.findPosInvoiceById(scope);
                    } else {
                        vm.$message({
                            duration: 1000,
                            message: "Not Active State!!",
                            type: 'error'
                        });
                    }
                }


            },
            findPosInvoiceById(doc) {
                let vm = this;
                this.posInvoiceId = doc.row._id;
                let companyDoc = WB_waterBillingSetup.findOne({});
                Meteor.call("queryPosInvoiceById", doc.row._id, (err, data) => {
                    vm.posInvoiceData = [];
                    if (data) {
                        vm.posInvoiceData = data.item;
                        vm.imei = data.imei;

                        vm.posInvoiceForm = {
                            total: formatCurrency(data.total, companyDoc.baseCurrency),
                            netTotal: formatCurrency(data.netTotal, companyDoc.baseCurrency),
                            balanceUnPaid: formatCurrency(data.balanceUnPaid, companyDoc.baseCurrency),
                            paid: data.paid,
                            paidUSD: data.paidUSD,
                            paidKHR: data.paidKHR,
                            paidTHB: data.paidTHB,
                            remainUSD: data.remainUSD,
                            remainKHR: data.remainKHR,
                            remainTHB: data.remainTHB,
                            invoiceDate: data.invoiceDate,
                            dueDate: data.dueDate,
                            invoiceNo: data.invoiceNo,
                            note: data.note,
                            discountType: data.discountType,
                            discount: data.discount,
                            discountValue: data.discountValue,
                            termId: data.termId,
                            address: data.address,
                            rolesArea: Session.get('area'),
                            customerId: data.customerId,
                            locationId: data.locationId
                        };

                        vm.getTotal();
                    }


                })

            },
            addToPosInvoiceData(val) {
                let vm = this;

                if (val === null) {
                    val = vm.posInvoiceForm.code;
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

                let isFound = vm.posInvoiceData.find(function (element) {
                    return element.itemId === val || element.code === val || element.barcode === val;
                });
                if (isFound !== undefined) {
                    /*this.$message({
                        type: 'error',
                        message: 'Item already add!'
                    });
                    let s = new buzz.sound('/the-calling.mp3');
                    s.play();*/

                    let companyDoc = WB_waterBillingSetup.findOne({});
                    if (isFound.qty + 1 > isFound.rawQty && companyDoc.validateStock === true) {
                        vm.$message({
                            type: 'error',
                            message: 'ស្តុកមានមិនគ្រប់គ្រាន់ ។ ស្តុកនៅសល់តែ ' + isFound.rawQty + ' ប៉ុន្នោះ !!'
                        });
                        return false;
                    }

                    isFound.qty = isFound.qty + 1;
                    isFound.amount = isFound.qty * isFound.price;
                    vm.posInvoiceData[isFound.itemId] = isFound;
                    this.$message({
                        type: 'success',
                        message: 'បន្ថែមចំនួនបានជោគជ័យ!'
                    });
                    this.getTotal();
                    vm.posInvoiceForm.itemId = "";
                    vm.posInvoiceForm.code = "";
                    return false;
                }
                vm.posInvoiceForm.isRetail = true;
                Meteor.call("queryPosProductById", val, (err, data) => {
                    if (data) {
                        Meteor.call("queryPosAverageCostById", data._id, Session.get("area"), vm.posInvoiceForm.locationId, (err, dataStock) => {
                            if (dataStock) {
                                vm.posInvoiceData.push({
                                    itemId: data._id,
                                    itemName: data.code + " : " + data.name,
                                    code: data.code,
                                    barcode: data.barcode || "",
                                    unit1: 1,
                                    unit2: 1,
                                    totalUnit: 1,
                                    unitId: data.unitId,
                                    unitName: data.unitName,

                                    price: vm.posInvoiceForm.isRetail === true ? vm.$_numeral(data.rePrice).value() : vm.$_numeral(data.whPrice).value(),
                                    qty: vm.$_numeral(1).value(),
                                    amount: vm.posInvoiceForm.isRetail === true ? formatCurrency(data.rePrice) : formatCurrency(data.whPrice),
                                    isRetail: true,
                                    desc: "",
                                    rawQty: vm.$_numeral(dataStock.qtyEnding).value()
                                });

                                vm.posInvoiceForm.itemId = "";
                                vm.posInvoiceForm.code = "";
                                vm.$message({
                                    duration: 1000,
                                    message: `បន្ថែម ` + data.code + " : " + data.name + " បានជោគជ័យ !",
                                    type: 'success'
                                });

                                this.getTotal();

                            } else {
                                vm.$message({
                                    duration: 3000,
                                    message: "ទំនិញនេះ អស់ពីស្តុកហើយ!!",
                                    type: 'error'
                                });
                                let s = new buzz.sound('/the-calling.mp3');
                                s.play();
                            }
                        })
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
            removePosInvoiceDetailByIndex(index, row) {
                this.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {

                    this.posInvoiceData.splice(index, 1);
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
            }
            ,
            updatePosInvoiceDetail(row, index) {
                let companyDoc = WB_waterBillingSetup.findOne({});
                if (row.qty > row.rawQty && companyDoc.validateStock === true) {
                    this.$message({
                        type: 'error',
                        message: 'ស្តុកមានមិនគ្រប់គ្រាន់ ។ ស្តុកនៅសល់តែ ' + row.rawQty + ' ប៉ុន្នោះ !!'
                    });
                }
                row.totalUnit = this.$_math.round(row.unit1 * row.unit2 * row.qty, 2);
                row.amount = formatCurrency(row.price * row.totalUnit);

                this.posInvoiceData[index] = row;
                /*this.$message({
                    duration: 1000,
                    message: `Update Row Number ` + newIndex + " Successfully !",
                    type: 'success'
                });*/
                this.getTotal();
            }
            ,
            updatePosInvoiceDetailReceiveItem(row, index) {

                if (row.isReceive === true) {
                    row.qty = row.rawQty;
                } else {
                    row.qty = 0;
                }

                row.totalUnit = this.$_math.round(row.unit1 * row.unit2 * row.qty, 2);
                row.amount = formatCurrency(row.price * row.totalUnit);

                this.posInvoiceData[index] = row;
                this.getTotal();
            }
            ,
            updatePosInvoiceDetailReceiveItemQty(row, index) {

                if (row.qty > 0) {
                    row.isReceive = true;
                } else {
                    row.isReceive = false;
                }

                row.totalUnit = this.$_math.round(row.unit1 * row.unit2 * row.qty, 2);
                row.amount = formatCurrency(row.price * row.totalUnit);

                this.posInvoiceData[index] = row;
                this.getTotal();
            }
            ,
            updatePosInvoiceDetailByRetail(row, index) {
                let vm = this;
                Meteor.call("queryPosProductById", row.itemId, (err, data) => {
                    if (data) {
                        if (row.isRetail === true) {
                            row.price = data.rePrice;
                            row.amount = vm.$_numeral(formatCurrency(data.rePrice * row.totalUnit)).value();
                        } else {
                            row.price = data.whPrice;
                            row.amount = vm.$_numeral(formatCurrency(data.whPrice * row.totalUnit)).value();

                        }
                        this.posInvoiceData[index] = row;
                        let newIndex = index + 1;
                        this.$message({
                            duration: 1000,
                            message: `Update Row Number ` + newIndex + " Successfully !",
                            type: 'success'
                        });
                        this.getTotal();
                    }
                })
            }
            ,
            clearZero(event) {
                /*debugger;
                $(event.currentTarget).select();
                console.log(event);*/
            }
            ,
            cancel() {
                this.resetForm();
                this.$message({
                    type: 'info',
                    message: this.langConfig['cancel']
                });
            }
            ,
            resetForm() {
                this.posInvoiceData = [];
                this.posInvoiceForm.discountValue = 0;
                this.posInvoiceForm.code = "";
                this.posInvoiceForm.paidUSD = 0;
                this.posInvoiceForm.paidKHR = 0;
                this.posInvoiceForm.paidTHB = 0;
                this.posInvoiceForm.discount = 0;
                this.posInvoiceForm.invoiceNo = "";
                this.posInvoiceForm.customerId = "";
                this.posInvoiceForm.locationId = "";
                this.posInvoiceForm.balanceNotCut = 0;


                if (this.$refs["posInvoiceFormAdd"]) {
                    this.$refs["posInvoiceFormAdd"].resetFields();
                }
                if (this.$refs["posInvoiceFormUpdate"]) {
                    this.$refs["posInvoiceFormUpdate"].resetFields();
                }
                this.posInvoiceForm.locationId = "001";
                this.posInvoiceForm.customerId = "001";
                if (this.posInvoiceForm.locationId && this.posInvoiceForm.locationId !== "") {
                    this.disabledItem = false;
                } else {
                    this.disabledItem = true;
                }
                let vm = this;
                if (this.posInvoiceForm.customerId) {
                    Meteor.call("queryPosCustomerById", this.posInvoiceForm.customerId, (err, result) => {
                        if (result) {
                            vm.posInvoiceForm.address = result.address;
                            if (vm.refForm === "posInvoiceFormAdd") {
                                vm.posInvoiceForm.termId = result.termId;
                            }
                        }
                    })
                }
                this.getTotal();
                this.imeiShow = [];
                this.imei = [];
                this.imeiInput = "";

            }
            ,
            getTotal() {
                let vm = this;
                let total = 0;
                vm.posInvoiceData.forEach(function (obj) {
                    total += parseFloat(vm.$_numeral(obj.amount || 0).value());

                });
                if (total >= vm.$_numeral(vm.posInvoiceForm.balanceNotCutFull).value()) {
                    vm.posInvoiceForm.balanceNotCut = vm.posInvoiceForm.balanceNotCutFull;
                } else {
                    vm.posInvoiceForm.balanceNotCut = formatCurrency(total);
                }
                let companyDoc = WB_waterBillingSetup.findOne({});
                this.currencySymbol = getCurrencySymbolById(companyDoc.baseCurrency);
                vm.posInvoiceForm.total = formatCurrencyLast(total, companyDoc.baseCurrency);

                if (vm.posInvoiceForm.discountType === "Amount") {
                    vm.posInvoiceForm.netTotal = formatCurrencyLast(total - vm.posInvoiceForm.discount, companyDoc.baseCurrency);
                    vm.posInvoiceForm.balanceUnPaid = formatCurrencyLast(total - vm.posInvoiceForm.discount - vm.$_numeral(vm.posInvoiceForm.balanceNotCut).value() - GeneralFunction.exchange("USD", companyDoc.baseCurrency, vm.posInvoiceForm.paidUSD, Session.get("area")) - GeneralFunction.exchange("KHR", companyDoc.baseCurrency, vm.posInvoiceForm.paidKHR, Session.get("area")) - GeneralFunction.exchange("THB", companyDoc.baseCurrency, vm.posInvoiceForm.paidTHB, Session.get("area")), companyDoc.baseCurrency);

                    vm.posInvoiceForm.remainUSD = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "USD", vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value(), Session.get("area")), "USD");
                    vm.posInvoiceForm.remainKHR = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "KHR", vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value(), Session.get("area")), "KHR");
                    vm.posInvoiceForm.remainTHB = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "THB", vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value(), Session.get("area")), "THB");
                    vm.posInvoiceForm.discountValue = formatCurrencyLast(vm.posInvoiceForm.discount, companyDoc.baseCurrency);

                    vm.posInvoiceForm.balanceUnPaid = vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value() <= 0 ? 0 : vm.posInvoiceForm.balanceUnPaid;
                    this.typeDiscount = getCurrencySymbolById(companyDoc.baseCurrency);
                } else {
                    vm.posInvoiceForm.netTotal = formatCurrencyLast(total - (total * vm.posInvoiceForm.discount / 100), companyDoc.baseCurrency);
                    vm.posInvoiceForm.balanceUnPaid = formatCurrencyLast(total - (total * vm.posInvoiceForm.discount / 100) - GeneralFunction.exchange("USD", companyDoc.baseCurrency, vm.posInvoiceForm.paidUSD, Session.get("area")) - GeneralFunction.exchange("KHR", companyDoc.baseCurrency, vm.posInvoiceForm.paidKHR, Session.get("area")) - GeneralFunction.exchange("THB", companyDoc.baseCurrency, vm.posInvoiceForm.paidTHB, Session.get("area")), companyDoc.baseCurrency);

                    vm.posInvoiceForm.remainUSD = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "USD", vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value(), Session.get("area")), "USD");
                    vm.posInvoiceForm.remainKHR = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "KHR", vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value(), Session.get("area")), "KHR");
                    vm.posInvoiceForm.remainTHB = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "THB", vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value(), Session.get("area")), "THB");
                    vm.posInvoiceForm.discountValue = formatCurrencyLast((total * vm.posInvoiceForm.discount / 100), companyDoc.baseCurrency);

                    vm.posInvoiceForm.balanceUnPaid = vm.$_numeral(vm.posInvoiceForm.balanceUnPaid).value() <= 0 ? 0 : vm.posInvoiceForm.balanceUnPaid;
                    this.typeDiscount = "%";
                }
            }
            ,
            popupPosInvoiceShow(row) {
                let vm = this;
                this.dialogShowPosInvoice = true;
                $(".el-dialog__title").text(this.langConfig['show']);
                Meteor.call("queryPosInvoiceByIdShow", row._id, (err, result) => {
                    if (result) {
                        vm.posInvoiceShowData = result;
                        vm.posInvoiceShowData.customerName = row.customerDoc.name;
                    } else {
                        console.log(err.message);
                    }
                })
            }
            ,
            findPosSaleOrderIdByCustomerId(customerId) {
                let vm = this;
                Meteor.call("queryPosSaleOrderByCustomerId", customerId, (err, data) => {
                    vm.posInvoiceData = [];
                    if (data) {
                        vm.posInvoiceData = data.item;
                        vm.posInvoiceForm.note = data.note;
                        vm.posInvoiceForm.termId = data.termId;
                        vm.posInvoiceForm.address = data.address;
                        vm.posInvoiceForm.rolesArea = Session.get('area');
                        vm.posInvoiceForm.customerId = data.customerId;
                        vm.posInvoiceForm.locationId = data.locationId;

                        vm.posInvoiceForm.balanceNotCutFull = data.balanceNotCut;
                        vm.getTotal();
                    }
                })
            },
            printInvoice(data) {
                if (data.transactionType === "Invoice Sale Order") {
                    FlowRouter.go('/pos-data/posInvoiceReceiveItem/print?inv=' + data._id);
                } else {
                    if (this.isMiniInvoice === true) {
                        FlowRouter.go('/pos-data/posInvoiceSmall/print?inv=' + data._id);
                    } else {
                        FlowRouter.go('/pos-data/posInvoice/print?inv=' + data._id);
                    }
                }

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

                    if (this.validateImei === true) {
                        Meteor.call("queryPosImeiBillByImei", vm.imeiInput, (err, result) => {
                            if (result) {
                                let isFindImei = vm.imei.find((obj) => {
                                    return obj.name === vm.imeiInput;
                                })
                                if (isFindImei) {
                                    vm.$message({
                                        type: 'error',
                                        message: 'បញ្ចូលរួចម្តងហើយ!!!!!!!'
                                    });
                                    return false;
                                } else {
                                    Meteor.call("queryPosImeiInvoiceByImei", vm.imeiInput, (err, result) => {
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
                                            vm.updatePosInvoiceDetail(vm.rowDoc, vm.indexRow);

                                            vm.$message({
                                                message: `បញ្ចូល ${vm.imeiInput} បានជោគជ័យ`,
                                                type: 'success'
                                            });
                                        }
                                    })
                                }
                            } else {
                                vm.$message({
                                    type: 'error',
                                    message: 'មិនមាន Imei នេះទេ!!!!!!!'
                                });
                            }
                        })
                    } else {
                        let isFindImei = vm.imei.find((obj) => {
                            return obj.name === vm.imeiInput;
                        })
                        if (isFindImei) {
                            vm.$message({
                                type: 'error',
                                message: 'បញ្ចូលរួចម្តងហើយ!!!!!!!'
                            });
                            return false;
                        } else {
                            Meteor.call("queryPosImeiInvoiceByImei", vm.imeiInput, (err, result) => {
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
                                    vm.updatePosInvoiceDetail(vm.rowDoc, vm.indexRow);

                                    vm.$message({
                                        message: `បញ្ចូល ${vm.imeiInput} បានជោគជ័យ`,
                                        type: 'success'
                                    });
                                }
                            })
                        }
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
                this.updatePosInvoiceDetail(this.rowDoc, this.indexRow);
                this.imeiInput = "";

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
            Meteor.subscribe('Pos_InvoiceReact');

            let ma = Manage_Module.findOne();
            if (ma && ma.feature) {
                this.phoneShop = ma.feature.indexOf("Phone Shop") > -1 ? true : false;
                this.validateImei = ma.validateImei;
                this.isMiniInvoice = ma.isMiniInvoice;
            }

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['invoice'];
                return data;
            }
        }
    }


</script>




