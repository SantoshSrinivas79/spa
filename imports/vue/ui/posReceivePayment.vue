<template>
    <div class="pos_receivePayment">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer"
                           @click="popupPosReceivePaymentAdd(),resetForm()"
                        >
                            <i class="fa fa-plus"></i> {{langConfig['receivePayment']}}
                        </a>
                    </h4>
                </el-col>
                <el-col :span="16" style="text-align: right; margin-right: 10px">
                    <br>
                    <el-row type="flex" justify="center">
                        <el-col :span="8"></el-col>
                        <el-col :span="8">
                            <el-button type="success" round
                                       @click="popupPosReceivePaymentFromSaleOrder(),dialogAddPosReceiveFromSaleOrder = true,resetForm()">
                                {{langConfig['receivePaymentFromSaleOrder']}}
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
                    </div>
                </div>
            </slot>
            <slot v-else>
                <el-table
                        :data="posReceivePaymentDataDisplay"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="receivePaymentDateName"
                            :label="langConfig['receiveDate']"
                            sortable
                            width="180">
                    </el-table-column>

                    <el-table-column
                            prop="customerDoc.name"
                            :label="langConfig['customer']">
                    </el-table-column>

                    <el-table-column
                            prop="totalAmount"
                            :label="langConfig['amount']">
                    </el-table-column>

                    <el-table-column
                            prop="totalDiscount"
                            :label="langConfig['discount']">
                    </el-table-column>
                    <el-table-column
                            prop="totalPaid"
                            :label="langConfig['totalPaid']">
                    </el-table-column>
                    <el-table-column
                            prop="note"
                            :label="langConfig['note']">
                    </el-table-column>
                    <el-table-column
                            prop="invoiceId"
                            :label="langConfig['status']"
                            width="150"
                            filter-placement="bottom-end">
                        <template slot-scope="scope">
                            <el-tag
                                    :type="scope.row.invoiceId != undefined ? 'success' : scope.row.saleOrderId != undefined ? 'warning' : 'primary'"
                                    close-transition>{{scope.row.invoiceId!=undefined ? "Invoice" :
                                scope.row.saleOrderId!=undefined ? "Sale Order" : "Receive Payment"}}
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
                                           @click="removePosReceivePayment(scope.$index,scope.row,posReceivePaymentDataDisplay)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click=""
                                           disabled></el-button>
                                <el-button type="info" icon="el-icon-printer" size="small" class="cursor-pointer"
                                           @click="printReceivePayment(scope.row)"></el-button>
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
                :visible.sync="dialogAddPosReceivePayment"
                :fullscreen="fullScreen"

        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posReceivePaymentForm" :rules="rules" ref="posReceivePaymentFormAdd" label-width="120px"
                     :label-position="labelPosition"
                     class="posReceivePaymentForm">
                <el-row :gutter="20">
                    <el-col :span="18" class="posReceivePaymentForm">
                        <table class="table table-responsive​​​ table-striped table-hover responstable">
                            <thead>
                            <tr>
                                <th colspan="3">
                                    <el-input :placeholder="langConfig['searchByInvoice']" v-model="searchByInvoice"
                                              @keyup.native.enter="searchInvoice()">
                                        <template slot="prepend">{{langConfig['invoice']}}:</template>
                                        <el-button slot="append" icon="el-icon-search"
                                                   @click.native="searchInvoice()"></el-button>
                                    </el-input>
                                </th>

                                <th style="text-align: right; vertical-align: middle;">
                                    <el-checkbox v-model="isOverDue"
                                                 :label="langConfig['overdueStatusOnly']"></el-checkbox>
                                </th>
                                <th colspan="2">
                                    <el-date-picker
                                            v-model="searchByDate"
                                            type="daterange"
                                            align="right"
                                            placeholder="Pick a range"
                                            :picker-options="pickerDateOptions"
                                    >
                                    </el-date-picker>
                                </th>
                                <th colspan="3">
                                    <el-input placeholder="totalPaid"
                                              v-model.number=totalPaidInput
                                              @keyup.native="inputTotalPaid()"
                                              @change="inputTotalPaid()"

                                    >
                                        <template slot="prepend">{{langConfig['totalPaid']}}:</template>
                                        <template slot="append">{{currencySymbol}}</template>

                                    </el-input>
                                </th>
                            </tr>
                            </thead>
                            <thead>
                            <tr>
                                <th>{{langConfig['no']}}</th>

                                <th>{{langConfig['invoiceNo']}}</th>
                                <th>{{langConfig['dueDate']}}</th>
                                <th style="vertical-align: middle; min-width: 120px !important;">
                                    <el-checkbox v-model="posReceivePaymentForm.isAllTerm"></el-checkbox>
                                    {{langConfig['applyTerm']}}
                                </th>
                                <th>{{langConfig['amount']}}</th>
                                <th>{{langConfig['discount']}}</th>
                                <th>{{langConfig['netAmount']}}</th>
                                <th style="color: #e91e63 !important;">{{langConfig['paid']}}</th>
                                <th style="vertical-align: middle;">
                                    <el-checkbox v-model="posReceivePaymentForm.isPaidAll"></el-checkbox>
                                </th>
                            </tr>
                            </thead>
                            <draggable v-model="posReceivePaymentData" :element="'tbody'">
                                <tr v-for="(posReceivePaymentDoc,index ) in this.posReceivePaymentData" :key="index">
                                    <template v-if="posReceivePaymentDoc.isShow">
                                        <td style="vertical-align: middle">
                                            {{index +1}}
                                        </td>
                                        <td style="vertical-align: middle">
                                            #{{posReceivePaymentDoc.invoiceNo |
                                            subStringVoucher}}({{posReceivePaymentDoc.invoiceDate |
                                            momentFormat}})
                                        </td>
                                        <td style="vertical-align: middle">
                                            <el-badge :value=posReceivePaymentDoc.dayOverDue :max="99" class="item">
                                                {{posReceivePaymentDoc.dueDate |
                                                momentFormat}}
                                            </el-badge>
                                        </td>
                                        <td style="vertical-align: middle">
                                            <el-switch
                                                    v-model="posReceivePaymentDoc.isApplyTerm"
                                                    active-color="#13ce66"
                                                    inactive-color="#ff4949"
                                                    @change="updatePosReceivePaymentDetail(posReceivePaymentDoc, index)"
                                            >
                                            </el-switch>
                                        </td>
                                        <td>
                                            <el-input placeholder="Amount" disabled=""
                                                      v-model.number=posReceivePaymentDoc.amount
                                            ></el-input>
                                            <input type="hidden" v-model="posReceivePaymentDoc.rawAmount"/>

                                        </td>

                                        <td>
                                            <el-input placeholder="Discount" disabled
                                                      v-model.number="posReceivePaymentDoc.discount"></el-input>
                                        </td>
                                        <td>
                                            <el-input placeholder="Net Amount"
                                                      v-model.number=posReceivePaymentDoc.netAmount
                                                      disabled>
                                                <template slot="append">{{currencySymbol}}</template>
                                            </el-input>
                                        </td>
                                        <td>
                                            <el-input placeholder="Paid" v-model.number="posReceivePaymentDoc.paid"
                                                      type='number'
                                                      @keyup.native="updatePosReceivePaymentDetailPaid(posReceivePaymentDoc, index)"
                                                      @change="updatePosReceivePaymentDetailPaid(posReceivePaymentDoc, index)"
                                            >
                                                <template slot="append">{{currencySymbol}}</template>
                                            </el-input>
                                        </td>
                                        <td style="vertical-align: middle">
                                            <el-checkbox v-model="posReceivePaymentDoc.isPaid"
                                                         @change="updatePosReceivePaymentDetail(posReceivePaymentDoc, index)"></el-checkbox>
                                        </td>
                                    </template>
                                </tr>
                            </draggable>
                            <thead>
                            <tr>
                                <th colspan="6" style="text-align: right;vertical-align: middle">
                                    {{langConfig['totalNetAmount']}}:
                                </th>
                                <th colspan="3">
                                    <el-input :placeholder="langConfig['totalNetAmount']"
                                              v-model.number="posReceivePaymentForm.totalNetAmount"
                                              disabled>
                                        <template slot="append">{{currencySymbol}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="6" style="text-align: right;vertical-align: middle">
                                    {{langConfig['totalDiscount']}}:
                                </th>
                                <th colspan="3">
                                    <el-input :placeholder="langConfig['totalDiscount']"
                                              v-model.number="posReceivePaymentForm.totalDiscount"
                                              disabled>
                                        <template slot="append">{{currencySymbol}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="6" style="text-align: right;vertical-align: middle">
                                    {{langConfig['balanceUnpaid']}}:
                                </th>
                                <th colspan="3">
                                    <el-input :placeholder="langConfig['balanceUnpaid']"
                                              v-model.number="posReceivePaymentForm.balanceUnPaid"
                                              disabled>
                                        <template slot="append">{{currencySymbol}}</template>
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
                                    <span class="plan-ribbon red">{{posReceivePaymentForm.totalDiscount}}{{currencySymbol}}</span>
                                    <span class="ui header">{{langConfig['amountReceive']}}</span>

                                </div>
                                <div class="ui  attached segment feature">
                                    <div class="amount">
                                        {{posReceivePaymentForm.totalPaid}}{{currencySymbol}}
                                    </div>
                                </div>
                            </div>

                            <el-form-item :label="langConfig['location']" prop="locationId">

                                <el-select style="display: block !important"
                                           filterable clearable
                                           v-model="posReceivePaymentForm.locationId"
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
                            <el-form-item :label="langConfig['customer']" prop="customerId">
                                <el-select style="display: block !important;"
                                           filterable clearable
                                           v-model="posReceivePaymentForm.customerId" remote
                                           :disabled="disabledCustomer"
                                           :remote-method="customerOpt"
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
                            <el-form-item :label="langConfig['receiveDate']" prop="receivePaymentDate">
                                <el-date-picker
                                        v-model="posReceivePaymentForm.receivePaymentDate"
                                        type="date"
                                        style="width: 100%;"
                                        placeholder="Pick a day"
                                        :picker-options="options"
                                        :disabled="disabledDate"
                                >
                                </el-date-picker>
                            </el-form-item>
                            <el-row>
                                <el-col :span="12">
                                    <el-form-item :label="langConfig['address']" prop="address">
                                        <el-input type="textarea" v-model="posReceivePaymentForm.address"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="1">
                                    <div class="">&nbsp;</div>
                                </el-col>
                                <el-col :span="11">
                                    <el-form-item :label="langConfig['note']" prop="note">
                                        <el-input type="textarea" v-model="posReceivePaymentForm.note"
                                                  :rows="3"></el-input>
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
                    <el-col :span="8" style="text-align: left !important;">
                        <el-button type="danger"
                                   @click.native="dialogAddPosReceivePayment= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="15" class="pull-right">
                        <el-button type="success" @click="savePosReceivePayment(true,$event,true)"><i
                                class="fa fa-print"></i>&nbsp; {{langConfig['saveAndPrint']}}</el-button>


                        <el-button type="success" @click="savePosReceivePayment(false,$event)"><i
                                class="el-icon-circle-check"> </i>&nbsp; {{langConfig['saveAndNew']}} <i>(Ctrl + Alt + Enter)</i></el-button>

                        <el-button type="primary" @click.native="savePosReceivePayment(true,$event)"><i
                                class="el-icon-check"> </i>&nbsp; {{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>

                    </el-col>
                </el-row>
            </span>
        </el-dialog>


        <!--Form Modal-->
        <el-dialog
                :title="langConfig['addReceiveFromSaleOrder']"
                :visible.sync="dialogAddPosReceiveFromSaleOrder"
                :fullscreen="fullScreen"

        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posReceivePaymentForm" :rules="rules" ref="posReceivePaymentFormAdd" label-width="120px"
                     :label-position="labelPosition"
                     class="posReceivePaymentForm">
                <el-row :gutter="20">
                    <el-col :span="18" class="posReceivePaymentForm">
                        <table class="table table-responsive​​​ table-striped table-hover responstable">
                            <thead>
                            <tr>
                                <th colspan="3">
                                    &nbsp;
                                </th>
                                <th colspan="3">
                                    <el-input placeholder="totalPaid"
                                              v-model.number=totalPaidInput
                                              @keyup.native="inputTotalPaid()"
                                              @change="inputTotalPaid()"

                                    >
                                        <template slot="prepend">{{langConfig['totalPaid']}}:</template>
                                        <template slot="append">{{currencySymbol}}</template>

                                    </el-input>
                                </th>
                            </tr>
                            </thead>
                            <thead>
                            <tr>
                                <th>{{langConfig['no']}}</th>

                                <th>{{langConfig['orderNo']}}</th>
                                <th>{{langConfig['netAmount']}}</th>
                                <th style="color: #e91e63 !important;">{{langConfig['paid']}}</th>
                                <th style="vertical-align: middle;">
                                    <el-checkbox v-model="posReceivePaymentForm.isPaidAll"></el-checkbox>
                                </th>
                            </tr>
                            </thead>
                            <draggable v-model="posReceivePaymentData" :element="'tbody'">
                                <tr v-for="(posReceivePaymentDoc,index ) in this.posReceivePaymentData" :key="index">
                                    <template v-if="posReceivePaymentDoc.isShow">
                                        <td style="vertical-align: middle">
                                            {{index +1}}
                                        </td>
                                        <td style="vertical-align: middle">
                                            #{{posReceivePaymentDoc.invoiceNo |
                                            subStringVoucher}}({{posReceivePaymentDoc.invoiceDate |
                                            momentFormat}})
                                        </td>
                                        <td>
                                            <el-input placeholder="Net Amount"
                                                      v-model.number=posReceivePaymentDoc.netAmount
                                                      disabled>
                                                <template slot="append">{{currencySymbol}}</template>
                                            </el-input>
                                        </td>
                                        <td>
                                            <el-input placeholder="Paid" v-model.number="posReceivePaymentDoc.paid"
                                                      type='number'
                                                      @keyup.native="updatePosReceivePaymentDetailPaid(posReceivePaymentDoc, index)"
                                                      @change="updatePosReceivePaymentDetailPaid(posReceivePaymentDoc, index)"
                                            >
                                                <template slot="append">{{currencySymbol}}</template>
                                            </el-input>
                                        </td>
                                        <td style="vertical-align: middle">
                                            <el-checkbox v-model="posReceivePaymentDoc.isPaid"
                                                         @change="updatePosReceivePaymentDetail(posReceivePaymentDoc, index)"></el-checkbox>
                                        </td>
                                    </template>
                                </tr>
                            </draggable>
                            <thead>
                            <tr>
                                <th colspan="3" style="text-align: right;vertical-align: middle">
                                    {{langConfig['totalNetAmount']}}:
                                </th>
                                <th colspan="3">
                                    <el-input :placeholder="langConfig['totalNetAmount']"
                                              v-model.number="posReceivePaymentForm.totalNetAmount"
                                              disabled>
                                        <template slot="append">{{currencySymbol}}</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="3" style="text-align: right;vertical-align: middle">
                                    {{langConfig['balanceUnpaid']}}:
                                </th>
                                <th colspan="3">
                                    <el-input :placeholder="langConfig['balanceUnpaid']"
                                              v-model.number="posReceivePaymentForm.balanceUnPaid"
                                              disabled>
                                        <template slot="append">{{currencySymbol}}</template>
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
                                    <span class="plan-ribbon red">{{posReceivePaymentForm.totalDiscount}}{{currencySymbol}}</span>
                                    <span class="ui header">{{langConfig['amountReceive']}}</span>

                                </div>
                                <div class="ui  attached segment feature">
                                    <div class="amount">
                                        {{posReceivePaymentForm.totalPaid}}{{currencySymbol}}
                                    </div>
                                </div>
                            </div>

                            <el-form-item :label="langConfig['location']" prop="locationId">

                                <el-select style="display: block !important"
                                           filterable clearable
                                           v-model="posReceivePaymentForm.locationId"
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
                            <el-form-item :label="langConfig['customer']" prop="customerId">
                                <el-select style="display: block !important;"
                                           filterable clearable
                                           v-model="posReceivePaymentForm.customerId" remote
                                           :disabled="disabledCustomer"
                                           :remote-method="customerSaleOrderOpt"
                                           :loading="loading"
                                           :placeholder="langConfig['customer']">
                                    <el-option
                                            v-for="item in customerSaleOrderOption"
                                            :key="item.value"
                                            :label="item.label"
                                            :value="item.value"
                                            :disabled="item.disabled">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item :label="langConfig['receiveDate']" prop="receivePaymentDate">
                                <el-date-picker
                                        v-model="posReceivePaymentForm.receivePaymentDate"
                                        type="date"
                                        style="width: 100%;"
                                        placeholder="Pick a day"
                                        :picker-options="options"
                                        :disabled="disabledDate"
                                >
                                </el-date-picker>
                            </el-form-item>
                            <el-row>
                                <el-col :span="12">
                                    <el-form-item :label="langConfig['address']" prop="address">
                                        <el-input type="textarea" v-model="posReceivePaymentForm.address"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="1">
                                    <div class="">&nbsp;</div>
                                </el-col>
                                <el-col :span="11">
                                    <el-form-item :label="langConfig['note']" prop="note">
                                        <el-input type="textarea" v-model="posReceivePaymentForm.note"
                                                  :rows="3"></el-input>
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
                    <el-col :span="8" style="text-align: left !important;">
                        <el-button type="danger"
                                   @click.native="dialogAddPosReceivePayment= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="15" class="pull-right">
                        <el-button type="success" @click="savePosReceivePaymentFromSaleOrder(true,$event,true)"><i
                                class="fa fa-print"></i>&nbsp; {{langConfig['saveAndPrint']}}</el-button>


                        <el-button type="success" @click="savePosReceivePaymentFromSaleOrder(false,$event)"><i
                                class="el-icon-circle-check"> </i>&nbsp; {{langConfig['saveAndNew']}} <i>(Ctrl + Alt + Enter)</i></el-button>

                        <el-button type="primary" @click.native="savePosReceivePaymentFromSaleOrder(true,$event)"><i
                                class="el-icon-check"> </i>&nbsp; {{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>

                    </el-col>
                </el-row>
            </span>
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
    // require('cleave.js/dist/addons/cleave-phone.ac');
    // require('cleave.js/dist/addons/cleave-phone.{country}');

    import compoLang from '../../../both/i18n/lang/elem-label'
    import {Pos_ReceivePaymentReact} from "../../collection/posReceivePayment";
    import {Manage_Module} from "../../collection/manageModule";

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
                Pos_ReceivePaymentReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        components: {
            draggable
        },
        data() {
            return {
                posReceivePaymentData: [],
                posReceivePaymentDataDisplay: [],
                multipleSelection: [],
                posReceivePaymentId: "",
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddPosReceivePayment: false,
                dialogUpdatePosReceivePayment: false,
                dialogShowPosReceivePayment: false,
                dialogAddPosReceiveFromSaleOrder: false,
                typeDiscount: "",
                fullScreen: true,

                searchByDate: "",
                searchByInvoice: "",
                isOverDue: false,
                totalPaidInput: 0,
                posReceivePaymentForm: {
                    totalPaid: 0,
                    amount: 0,
                    receivePaymentDate: moment().toDate(),
                    dueDate: moment().add(1, "month").toDate(),

                    note: "",

                    totalDiscount: 0,
                    totalNetAmount: 0,
                    balanceUnPaid: 0,
                    address: "",

                    isApplyTerm: true,
                    isPaidAll: false,
                    isAllTerm: false,
                    customerId: "",
                    locationId: ""

                },
                rules: {
                    receivePaymentDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input PosReceivePaymentDate',
                        trigger: 'blur'
                    }],
                    customerId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose customer',
                        trigger: 'change'
                    }]
                    ,
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
                customerSaleOrderOption: [],
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
                posReceivePaymentDetail: {},

                locationOption: [],
                disabledCustomer: true,
                validateReceivePayment: false,
                pickerDateOptions: {
                    shortcuts: [{
                        text: 'Last week',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: 'Last month',
                        onClick(picker) {
                            const end = moment().add(-1, "month").endOf("month").toDate();
                            const start = moment().add(-1, "month").startOf("month").toDate();
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: 'Last 3 months',
                        onClick(picker) {
                            const end = moment().add(-1, "month").endOf("month").toDate();
                            const start = moment().add(-4, "month").startOf("month").toDate();
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: 'This month',
                        onClick(picker) {
                            const end = moment().endOf("month").toDate();
                            const start = moment().startOf("month").toDate();
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: 'Today',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            picker.$emit('pick', [start, end]);
                        }
                    }]
                },
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
        watch: {
            currentSize(val) {
                this.isSearching = true;
                let skip = (this.currentPage - 1) * val;
                this.queryData(this.searchData, skip, val + skip);
            },
            currentPage(val) {
                this.isSearching = true;
                let skip = (val - 1) * this.currentSize;
                this.queryData(this.searchData, skip, this.currentSize + skip);
            },
            searchData(val) {
                this.isSearching = true;
                let skip = (this.currentPage - 1) * this.currentSize;
                this.queryData(val, skip, this.currentSize + skip);
            },
            "posReceivePaymentForm.receivePaymentDate"(val) {
                /*let vm = this;
                if (vm.dialogUpdatePosReceivePayment == false) {
                    vm.posReceivePaymentForm.posReceivePaymentDate = val;
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
                }*/

                let vm = this;
                if (this.dialogAddPosReceivePayment === true) {

                    let ind = 0;
                    vm.posReceivePaymentForm.receivePaymentDate = val;
                    vm.posReceivePaymentData.map((obj) => {
                        obj.dayOverDue = moment(val).startOf("days").diff(moment(obj.dueDate).startOf("days").toDate(), "days") < 0 ? 0 : moment(val).startOf("days").diff(moment(obj.dueDate).startOf("days").toDate(), "days");
                        vm.updatePosReceivePaymentDetail(obj, ind);
                        ind++;
                    });
                    vm.searchInvoice();
                }
            },
            /*dialogAddPosReceivePayment(val) {
                if (val) {
                    this._inputMaskPosReceivePayment();
                }
            },*/
            dialogUpdatePosReceivePayment(val) {
                if (val) {
                    this._inputMaskPosReceivePayment();
                }
            },
            "posReceivePaymentForm.customerId"(val) {
                let vm = this;
                if (vm.dialogAddPosReceiveFromSaleOrder === true) {
                    if (val) {
                        Meteor.call("queryPosCustomerById", val, (err, result) => {
                            if (result) {
                                vm.posReceivePaymentForm.address = result.address;
                                vm.posReceivePaymentForm.termId = result.termId;
                            }
                        });

                        Meteor.call("queryPosSaleOrderPartialByCustomerId", val, vm.posReceivePaymentForm.receivePaymentDate, vm.posReceivePaymentForm.locationId, (err, result) => {
                            if (result) {
                                vm.posReceivePaymentData = result;
                            }
                            vm.getTotal();
                        })
                    } else {
                        Meteor.call("queryPosSaleOrderPartialByCustomerId", "", vm.posReceivePaymentForm.receivePaymentDate, vm.posReceivePaymentForm.locationId, (err, result) => {
                            if (result) {
                                vm.posReceivePaymentData = result;

                                vm.posReceivePaymentForm.address = "";
                                vm.posReceivePaymentForm.termId = "";
                            }
                            vm.getTotal();
                        })
                    }
                } else {
                    if (val) {
                        Meteor.call("queryPosCustomerById", val, (err, result) => {
                            if (result) {
                                vm.posReceivePaymentForm.address = result.address;
                                vm.posReceivePaymentForm.termId = result.termId;
                            }
                        });

                        Meteor.call("queryPosInvoiceByCustomerId", val, vm.posReceivePaymentForm.receivePaymentDate, vm.posReceivePaymentForm.locationId, (err, result) => {
                            if (result) {
                                vm.posReceivePaymentData = result;
                            }
                            vm.getTotal();
                        })
                    } else {
                        Meteor.call("queryPosInvoiceByCustomerId", "", vm.posReceivePaymentForm.receivePaymentDate, vm.posReceivePaymentForm.locationId, (err, result) => {
                            if (result) {
                                vm.posReceivePaymentData = result;

                                vm.posReceivePaymentForm.address = "";
                                vm.posReceivePaymentForm.termId = "";
                            }
                            vm.getTotal();
                        })
                    }
                }
            },
            "posReceivePaymentForm.isAllTerm"(val) {
                let vm = this;

                let ind = 0;
                vm.posReceivePaymentData.map((obj) => {
                    if (obj.isShow) {
                        obj.isApplyTerm = val;
                        if (obj.isPaid === false) {
                            obj.isApplyTerm = false;
                        }
                        vm.updatePosReceivePaymentDetail(obj, ind);
                    }
                    ind++;
                })
            },
            "posReceivePaymentForm.isPaidAll"(val) {
                let vm = this;
                let ind = 0;
                if (val === false) {
                    vm.posReceivePaymentForm.isAllTerm = false;
                }
                this.posReceivePaymentData.map((obj) => {
                    if (obj.isShow) {
                        obj.isPaid = val;
                        if (obj.isPaid === false) {
                            obj.isApplyTerm = false;
                        }
                        vm.updatePosReceivePaymentDetail(obj, ind);
                    }
                    ind++;
                })
            },
            searchByDate(val) {
                this.searchDate(val);
            },
            isOverDue(val) {
                let vm = this;
                vm.overDueStatus(val);
            },
            "posReceivePaymentForm.locationId"(val) {
                if (val) {
                    this.disabledCustomer = false;
                    this.posReceivePaymentForm.customerId = "";

                } else {
                    this.disabledCustomer = true;

                }
            },
            "totalPaidInput"(val) {
                this.totalPaidInput = val || 0;
            }
        },
        methods: {
            handleSizeChange(val) {
                this.currentSize = val;
            },
            handleCurrentChange(val) {
                this.currentPage = val;
            },
            _inputMaskPosReceivePayment() {
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
            queryData: _.debounce(function (val, skip, limit) {
                Meteor.call('queryPosReceivePayment', {
                    q: val,
                    filter: this.filter,
                    rolesArea:Session.get('area'),
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.posReceivePaymentDataDisplay = result.content;
                        this.count = result.countPosReceivePayment;
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
            customerOpt(query) {
                if (!!query) {
                    this.loading = true;
                    setTimeout(() => {
                        let lists = [];
                        this.loading = false;
                        Meteor.call('queryPosCustomerOptionUnPaid', query,Session.get("area"), (err, result) => {
                            if (!err) {
                                this.customerOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryPosCustomerOptionUnPaid', "", Session.get("area"),(err, result) => {
                        if (!err) {
                            this.customerOption = result;
                        } else {
                            console.log(err.message);
                        }
                    })
                }
            },
            customerSaleOrderOpt(query) {
                if (!!query) {
                    this.loading = true;
                    setTimeout(() => {
                        let lists = [];
                        this.loading = false;
                        Meteor.call('queryPosCustomerSaleOrderOptionUnPaid', query,Session.get("area"), (err, result) => {
                            if (!err) {
                                this.customerSaleOrderOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryPosCustomerSaleOrderOptionUnPaid', "",Session.get("area"), (err, result) => {
                        if (!err) {
                            this.customerSaleOrderOption = result;
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

            savePosReceivePayment(isCloseDialog, event, isPrint) {
                event.preventDefault();
                let vm = this;
                this.$refs["posReceivePaymentFormAdd"].validate((valid) => {
                    if (valid) {
                        let posReceivePaymentDoc = {
                            totalPaid: vm.$_numeral(vm.posReceivePaymentForm.totalPaid).value(),
                            totalNetAmount: vm.$_numeral(vm.posReceivePaymentForm.totalNetAmount).value(),
                            totalDiscount: vm.$_numeral(vm.posReceivePaymentForm.totalDiscount).value(),

                            balanceUnPaid: vm.$_numeral(vm.posReceivePaymentForm.totalNetAmount).value() - vm.$_numeral(vm.posReceivePaymentForm.totalPaid).value(),
                            totalAmount: vm.$_numeral(vm.posReceivePaymentForm.totalNetAmount).value() + vm.$_numeral(vm.posReceivePaymentForm.totalDiscount).value(),

                            receivePaymentDate: moment(vm.posReceivePaymentForm.receivePaymentDate).toDate(),
                            receivePaymentDateName: moment(vm.posReceivePaymentForm.receivePaymentDate).format("DD/MM/YYYY"),
                            note: vm.posReceivePaymentForm.note,
                            address: vm.posReceivePaymentForm.address,

                            rolesArea: Session.get('area'),
                            customerId: vm.posReceivePaymentForm.customerId,
                            locationId: vm.posReceivePaymentForm.locationId,
                        };
                        posReceivePaymentDoc.invoice = vm.posReceivePaymentData;
                        Meteor.call("insertPosReceivePayment", posReceivePaymentDoc, (err, result) => {
                            if (!err) {
                                if (isPrint) {
                                    FlowRouter.go('/pos-data/posInvoiceReceivePayment/print?inv=' + result);
                                } else {
                                    vm.$message({
                                        duration: 1000,
                                        message: this.langConfig['saveSuccess'],
                                        type: 'success'
                                    });
                                }


                                if (isCloseDialog) {
                                    this.dialogAddPosReceivePayment = false;
                                }

                                vm.posReceivePaymentData.forEach((obj) => {
                                    if (obj.isPaid === true) {
                                        Meteor.call("updateInvoiceByReceivePayment", obj, posReceivePaymentDoc.receivePaymentDate, (err, re) => {
                                            if (err) {
                                                console.log(err.message);
                                            }
                                        })
                                    }
                                })

                                vm.resetForm();
                            }
                        })
                    }
                })


            },

            savePosReceivePaymentFromSaleOrder(isCloseDialog, event, isPrint) {
                event.preventDefault();
                let vm = this;
                this.$refs["posReceivePaymentFormAdd"].validate((valid) => {
                    if (valid) {
                        let posReceivePaymentDoc = {
                            totalPaid: vm.$_numeral(vm.posReceivePaymentForm.totalPaid).value(),
                            totalNetAmount: vm.$_numeral(vm.posReceivePaymentForm.totalNetAmount).value(),
                            totalDiscount: vm.$_numeral(vm.posReceivePaymentForm.totalDiscount).value(),

                            balanceUnPaid: vm.$_numeral(vm.posReceivePaymentForm.totalNetAmount).value() - vm.$_numeral(vm.posReceivePaymentForm.totalPaid).value(),
                            totalAmount: vm.$_numeral(vm.posReceivePaymentForm.totalNetAmount).value() + vm.$_numeral(vm.posReceivePaymentForm.totalDiscount).value(),

                            receivePaymentDate: moment(vm.posReceivePaymentForm.receivePaymentDate).toDate(),
                            receivePaymentDateName: moment(vm.posReceivePaymentForm.receivePaymentDate).format("DD/MM/YYYY"),
                            note: vm.posReceivePaymentForm.note,
                            address: vm.posReceivePaymentForm.address,

                            rolesArea: Session.get('area'),
                            customerId: vm.posReceivePaymentForm.customerId,
                            locationId: vm.posReceivePaymentForm.locationId,
                            isSaleOrder: true
                        };
                        posReceivePaymentDoc.invoice = vm.posReceivePaymentData;
                        Meteor.call("insertPosReceivePaymentFromSaleOrder", posReceivePaymentDoc, (err, result) => {
                            if (!err) {
                                if (isPrint) {
                                    FlowRouter.go('/pos-data/posInvoiceReceivePaymentFromSaleOrder/print?inv=' + result);
                                } else {
                                    vm.$message({
                                        duration: 1000,
                                        message: this.langConfig['saveSuccess'],
                                        type: 'success'
                                    });
                                }


                                if (isCloseDialog) {
                                    this.dialogAddPosReceiveFromSaleOrder = false;
                                }

                                vm.posReceivePaymentData.forEach((obj) => {
                                    if (obj.isPaid === true) {
                                        Meteor.call("updateSaleOrderByReceivePayment", obj, posReceivePaymentDoc.receivePaymentDate, (err, re) => {
                                            if (err) {
                                                console.log(err.message);
                                            }
                                        })
                                    }
                                })

                                vm.resetForm();
                            }
                        })
                    }
                })


            },

            removePosReceivePayment(index, row, rows) {
                let vm = this;


                let companyDoc = WB_waterBillingSetup.findOne({});
                if (companyDoc.integratedPosAccount) {
                    Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                        if (re !== undefined) {
                            vm.closeDate = re.closeDate;
                        } else {
                            vm.closeDate = "";
                        }

                        if (vm.closeDate && vm.closeDate.getTime() >= row.receivePaymentDate.getTime()) {
                            vm.$message({
                                duration: 1000,
                                message: "Already Closing Entry In Account!!",
                                type: 'error'
                            });
                            return false;
                        }

                        if (row.canRemove === true) {
                            vm.$confirm(vm.langConfig['messageWarning'], vm.langConfig['warning'], {
                                confirmButtonText: 'OK',
                                cancelButtonText: 'Cancel',
                                type: 'warning'
                            }).then(() => {
                                Meteor.call("removePosReceivePayment", row._id, (err, result) => {
                                    if (!err) {
                                        rows.splice(index, 1);
                                        vm.$message({
                                            message: ` ${row.receivePaymentDateName} ` + vm.langConfig['removeSuccess'],
                                            type: 'success'
                                        });

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
                                message: vm.langConfig['message']
                            });
                        }


                    })
                } else {
                    if (row.canRemove === true) {
                        vm.$confirm(vm.langConfig['messageWarning'], vm.langConfig['warning'], {
                            confirmButtonText: 'OK',
                            cancelButtonText: 'Cancel',
                            type: 'warning'
                        }).then(() => {
                            Meteor.call("removePosReceivePayment", row._id, (err, result) => {
                                if (!err) {
                                    rows.splice(index, 1);
                                    vm.$message({
                                        message: ` ${row.receivePaymentDateName} ` + vm.langConfig['removeSuccess'],
                                        type: 'success'
                                    });

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
                            message: vm.langConfig['message']
                        });
                    }
                }

            },
            popupPosReceivePaymentAdd() {
                let vm = this;
                if (this.validateReceivePayment === true && this.validateReceivePayment !== undefined) {
                    this.$prompt('Please input Password', 'Tip', {
                        confirmButtonText: 'OK',
                        cancelButtonText: 'Cancel',
                        inputType: "password",
                        inputErrorMessage: 'Invalid Password'
                    }).then(({value}) => {
                        let wb = WB_waterBillingSetup.findOne();
                        if (value === wb.password) {
                            this.$message({
                                type: 'success',
                                message: 'Your Password is Correct'
                            });

                            vm.dialogAddPosReceivePayment = true;
                            vm.resetForm();
                            vm.itemOpt();
                            $(".el-dialog__title").text(this.langConfig['add']);
                            vm.customerOpt();
                            vm.termOpt();

                            Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                                if (re !== undefined) {
                                    vm.closeDate = re.closeDate;
                                } else {
                                    vm.closeDate = "";
                                }
                            })


                        } else {
                            this.$message({
                                type: 'error',
                                message: 'Invalid Password !!!'
                            });
                            return false;

                        }

                    }).catch(() => {
                        this.$message({
                            type: 'info',
                            message: 'Input canceled'
                        });
                    });


                } else {
                    vm.dialogAddPosReceivePayment = true;
                    vm.resetForm();
                    vm.itemOpt();
                    $(".el-dialog__title").text(this.langConfig['add']);

                    vm.customerOpt();
                    vm.termOpt();

                    Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                        if (re !== undefined) {
                            vm.closeDate = re.closeDate;
                        } else {
                            vm.closeDate = "";
                        }
                    })
                }

            },
            updatePosReceivePaymentDetail(row, index, type) {
                let vm = this;
                if (row.isPaid === false) {
                    row.paid = 0;
                    row.isApplyTerm = false;
                }
                if (row.isApplyTerm) {
                    Meteor.call("queryPosTermById", row.termId, (err, data) => {
                        if (data && data.isDiscount && row.paid === vm.$_numeral(row.netAmount).value()) {
                            if (row.isPaid) {
                                row.discount = 0;
                                if (moment(vm.posReceivePaymentForm.receivePaymentDate).diff(row.invoiceDate, "days") <= data.daysForDiscount) {
                                    row.discount = vm.$_numeral(row.amount).value() * data.value / 100;
                                }
                                row.paid = vm.$_numeral(row.amount).value() - vm.$_numeral(row.discount).value();
                                row.netAmount = formatCurrency(vm.$_numeral(row.amount).value() - vm.$_numeral(row.discount).value());
                            } else {
                                row.discount = 0;
                                if (moment(vm.posReceivePaymentForm.receivePaymentDate).diff(row.invoiceDate, "days") <= data.daysForDiscount) {
                                    row.discount = formatCurrency(vm.$_numeral(row.amount).value() * data.value / 100);
                                    row.netAmount = formatCurrency(vm.$_numeral(row.amount).value() - row.discount);

                                }
                                row.paid = 0;
                            }
                        } else {
                            if (row.isPaid) {
                                row.discount = 0;
                                row.paid = vm.$_numeral(row.amount).value();
                                row.netAmount = formatCurrency(row.amount);
                            } else {
                                row.discount = 0;
                                row.paid = 0;
                                row.netAmount = formatCurrency(row.amount);
                            }
                        }
                        this.posReceivePaymentData[index] = row;
                        vm.getTotal(type);
                    })

                } else {
                    if (row.isPaid) {
                        row.discount = 0;
                        row.paid = vm.$_numeral(row.amount).value();
                        row.netAmount = formatCurrency(row.amount);
                    } else {
                        row.discount = 0;
                        row.netAmount = formatCurrency(row.amount);
                        row.paid = 0;
                    }
                    this.posReceivePaymentData[index] = row;
                    vm.getTotal();
                }
            },
            updatePosReceivePaymentDetailPaid(row, index, type) {
                if (row.netAmount !== row.paid) {
                    if (row.paid > 0) {
                        row.isPaid = true;
                    } else {
                        row.isPaid = false;
                    }
                    row.discount = 0;
                    row.netAmount = row.amount;
                    this.posReceivePaymentData[index] = row;
                } else {
                    if (row.paid > 0) {
                        row.isPaid = true;
                    } else {
                        row.isPaid = false;
                    }
                    this.posReceivePaymentData[index] = row;
                    this.updatePosReceivePaymentDetail(row, index, type);
                }
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
                this.posReceivePaymentData = [];
                this.posReceivePaymentForm.isPaidAll = false;
                this.posReceivePaymentForm.isApplyTerm = false;
                if (this.$refs["posReceivePaymentFormAdd"]) {
                    this.$refs["posReceivePaymentFormAdd"].resetFields();
                    this.getTotal();

                    this.refForm = "";

                }
            },
            getTotal(type) {
                let vm = this;
                let totalNetAmount = 0;
                let totalDiscount = 0;
                let totalPaid = 0;
                vm.posReceivePaymentData.forEach(function (obj) {
                    if (obj.isShow) {
                        totalNetAmount += parseFloat(vm.$_numeral(obj.netAmount).value() || 0);
                        totalDiscount += parseFloat(vm.$_numeral(obj.discount).value() || 0);
                        totalPaid += parseFloat(vm.$_numeral(obj.paid).value() || 0);
                    }
                });

                if (type === undefined || type === "") {
                    vm.totalPaidInput = totalPaid;
                }
                let companyDoc = WB_waterBillingSetup.findOne({});
                this.currencySymbol = getCurrencySymbolById(companyDoc.baseCurrency);
                vm.posReceivePaymentForm.totalNetAmount = formatCurrencyLast(totalNetAmount, companyDoc.baseCurrency);
                vm.posReceivePaymentForm.totalDiscount = formatCurrencyLast(totalDiscount, companyDoc.baseCurrency);
                vm.posReceivePaymentForm.totalPaid = formatCurrencyLast(totalPaid, companyDoc.baseCurrency);
                vm.posReceivePaymentForm.balanceUnPaid = formatCurrencyLast(totalNetAmount - totalPaid, companyDoc.baseCurrency);
            },
            searchInvoice() {
                let vm = this;
                let canFind = 0;
                let ind = 0;
                vm.posReceivePaymentData.forEach((obj) => {
                    if ((obj.invoiceNo === vm.searchByInvoice || vm.searchByInvoice === "") && ((moment(obj.invoiceDate).toDate().getTime() > moment(vm.searchByDate[0]).toDate().getTime() && moment(obj.invoiceDate).toDate().getTime() < moment(vm.searchByDate[1]).toDate().getTime()) || vm.searchByDate[0] == null)) {
                        obj.isShow = true;
                        canFind++;
                    } else {
                        obj.isShow = false;
                        obj.isPaid = false;
                        obj.isApplyTerm = false;
                    }
                    vm.updatePosReceivePaymentDetail(obj, ind);
                    ind++;
                });
                if (canFind === 0) {
                    this.$message({
                        type: 'error',
                        message: 'Not Found'
                    });
                } else {

                    this.$message({
                        type: 'success',
                        message: 'Have ' + canFind + " Invoices"
                    });
                }
                vm.getTotal();
                if (vm.isOverDue) {
                    vm.overDueStatus(vm.isOverDue);
                }

            },
            searchDate(val) {
                let vm = this;
                let canFind = 0;
                let ind = 0;
                vm.posReceivePaymentData.forEach((obj) => {
                    if ((obj.invoiceNo === vm.searchByInvoice || vm.searchByInvoice === "") && (moment(obj.invoiceDate).toDate().getTime() > moment(val[0]).toDate().getTime() && moment(obj.invoiceDate).toDate().getTime() < moment(val[1]).toDate().getTime()) || val[0] == null) {
                        obj.isShow = true;
                        canFind++;
                    } else {
                        obj.isShow = false;
                        obj.isPaid = false;
                        obj.isApplyTerm = false;
                    }
                    vm.updatePosReceivePaymentDetail(obj, ind);
                    ind++;
                });
                if (canFind == 0) {
                    this.$message({
                        type: 'error',
                        message: 'Not Found'
                    });
                } else {

                    this.$message({
                        type: 'success',
                        message: 'Have ' + canFind + " Invoices"
                    });
                }
                vm.getTotal();
                if (vm.isOverDue) {
                    vm.overDueStatus(vm.isOverDue);
                }
            },
            overDueStatus(val) {
                let vm = this;
                if (val) {
                    vm.posReceivePaymentData.map((obj) => {
                        if (obj.isShow === true && obj.dayOverDue <= 0) {
                            obj.isShow = false;
                        }
                        return obj;
                    })
                } else {
                    vm.searchInvoice();
                }
            },
            printReceivePayment(data) {
                if (data.isSaleOrder) {
                    FlowRouter.go('/pos-data/posInvoiceReceivePaymentFromSaleOrder/print?inv=' + data._id);
                } else {

                    FlowRouter.go('/pos-data/posInvoiceReceivePayment/print?inv=' + data._id);
                }
            },
            inputTotalPaid() {
                let vm = this;
                let totalPaidInput = vm.totalPaidInput;
                let ind = 0;
                vm.posReceivePaymentData.map(function (obj) {
                    if (obj.isShow) {
                        if (totalPaidInput >= 0) {
                            let pay = totalPaidInput > (parseFloat(vm.$_numeral(obj.netAmount).value() || 0)) ? (parseFloat(vm.$_numeral(obj.netAmount).value() || 0)) : totalPaidInput;
                            obj.paid = pay;
                            totalPaidInput -= pay;
                            vm.updatePosReceivePaymentDetailPaid(obj, ind, true);
                            ind++;
                        }

                    }
                });

            },
            popupPosReceivePaymentFromSaleOrder() {
                this.resetForm();
                this.itemOpt();
                let vm = this;
                $(".el-dialog__title").text(this.langConfig['addReceiveFromSaleOrder']);

                this.customerSaleOrderOpt();
                this.termOpt();

                Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                    if (re !== undefined) {
                        vm.closeDate = re.closeDate;
                    } else {
                        vm.closeDate = "";
                    }
                })
            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            this.getTotal();
            this.locationOpt();
            Meteor.subscribe('Pos_ReceivePaymentReact');
            let ma = Manage_Module.findOne();
            this.validateReceivePayment = ma.validateReceivePayment;
        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['receivePayment'];
                return data;
            }
        }
    }


</script>

<style>
    .item {
        /*margin-top: 10px;*/
        margin-right: 10px;
    }

    .el-badge__content.is-fixed {
        margin-right: -5px;
    }
</style>


