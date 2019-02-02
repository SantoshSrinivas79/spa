<template>
    <div class="pos_SaleOrder">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer"
                           @click="popupPosSaleOrderAdd(),dialogAddPosSaleOrder= true,resetForm()"
                        >
                            <i class="fa fa-plus"></i> {{langConfig['saleOrder']}}
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
                        :data="posSaleOrderDataDisplay"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="saleOrderDateName"
                            :label="langConfig['saleOrderDate']"
                            sortable
                    >
                    </el-table-column>
                    <el-table-column
                            prop="saleOrderNo"
                            :label="langConfig['saleOrderNo']"
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
                    <!--<el-table-column
                            prop="currencyId"
                            sortable
                            label="Currency"
                            width="140"
                    >
                    </el-table-column>-->

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
                                           @click="removePosSaleOrder(scope.$index,scope.row,posSaleOrderDataDisplay)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="popupPosSaleOrderUpdate(scope.$index,scope.row,scope)"
                                           :disabled="disabledUpdate"></el-button>
                                <el-button type="success" icon="el-icon-view" size="small" class="cursor-pointer"
                                           @click="popupPosSaleOrderShow(scope.row)"></el-button>
                                <el-button type="info" icon="el-icon-printer" size="small" class="cursor-pointer"
                                           @click="printSaleOrder(scope.row)"></el-button>
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
                @close="handleCloseModal"
                :title="langConfig['add']"
                :visible.sync="dialogAddPosSaleOrder"
                :fullscreen="fullScreen"
                class="dialogSaleOrder"

        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posSaleOrderForm" :rules="rules" :ref="refForm" label-width="120px"
                     :label-position="labelPosition"
                     class="posSaleOrderForm">
                <el-row :gutter="20">
                    <el-col :span="18" class="posSaleOrderForm">
                        <table class="table table-responsive​​​ table-striped table-hover responstable">
                            <thead>
                            <tr>
                                <th colspan="3" style="width: 30% !important;">
                                    <el-form-item label="" prop="locationId">

                                        <el-select style="display: block !important"
                                                   filterable clearable
                                                   v-model="posSaleOrderForm.locationId"
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
                                                  v-model="posSaleOrderForm.code" autofocus
                                                  @keyup.native.13="addToPosSaleOrderData(null)"
                                        >
                                        </el-input>
                                    </el-form-item>
                                </th>
                                <th style="width: 20% !important;">
                                    <el-form-item label="">
                                        <el-select style="display: block !important;"
                                                   filterable clearable :remote-method="itemOpt"
                                                   v-model="posSaleOrderForm.itemId" :disabled="disabledItem"
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
                                                  v-model.number="posSaleOrderForm.total"
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
                            <!--<draggable v-model="posSaleOrderData" :element="'tbody'">-->
                            <tr v-for="(posSaleOrderDoc,index ) in this.posSaleOrderData" :key="index">
                                <td style="vertical-align: middle">{{index + 1}}</td>
                                <td style="vertical-align: middle">{{posSaleOrderDoc.itemName}}</td>
                                <td style="vertical-align: middle">
                                    <el-switch
                                            v-model="posSaleOrderDoc.isRetail"
                                            active-color="#13ce66"
                                            inactive-color="#ff4949"
                                            @change="updatePosSaleOrderDetailByRetail(posSaleOrderDoc, index)"
                                    >
                                    </el-switch>
                                </td>


                                <!--<td>
                                    <el-input placeholder="Please input Unit1" v-model.number=posSaleOrderDoc.unit1
                                              @keyup.native="updatePosSaleOrderDetail(posSaleOrderDoc, index)"></el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Please input Unit2" v-model.number=posSaleOrderDoc.unit2
                                              @keyup.native="updatePosSaleOrderDetail(posSaleOrderDoc, index)"></el-input>
                                </td>-->

                                <td>
                                    <el-input placeholder="Please input Qty"
                                              v-model.number=posSaleOrderDoc.qty type='number'
                                              @keyup.native="updatePosSaleOrderDetail(posSaleOrderDoc, index)"
                                              @change="updatePosSaleOrderDetail(posSaleOrderDoc, index)">
                                        <template slot="append">{{posSaleOrderDoc.unitName || ""}}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Please input Price" v-model.number=posSaleOrderDoc.price
                                              type='number'
                                              @keyup.native="updatePosSaleOrderDetail(posSaleOrderDoc, index)"
                                              @change="updatePosSaleOrderDetail(posSaleOrderDoc, index)"
                                    ></el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Amount" v-model.number=posSaleOrderDoc.amount
                                              disabled>
                                        <!--<template slot="append">{{currencySymbol}}</template>-->
                                        <template slot="append">
                                            <el-dropdown trigger="click" :hide-on-click="false">
                                                    <span class="el-dropdown-link">
                                                        {{langConfig['desc']}} <span v-if="posSaleOrderDoc.desc==''">
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
                                                                  v-model.number=posSaleOrderDoc.desc
                                                                  @keyup.native="updatePosSaleOrderDetail(posSaleOrderDoc, index)"></el-input>
                                                    </el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </template>
                                    </el-input>
                                </td>
                                <td style="text-align: center;vertical-align: middle">
                                    <el-button type="danger" icon="el-icon-delete" size="small"
                                               @click="removePosSaleOrderDetailByIndex(index,posSaleOrderDoc)"></el-button>
                                </td>
                            </tr>
                            <!--</draggable>-->
                            <thead>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['netTotal']}} :
                                </th>
                                <th colspan="2">
                                    <el-input :placeholder="langConfig['netTotal']"
                                              v-model.number="posSaleOrderForm.netTotal"
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
                                    <el-input placeholder="USD" v-model.number="posSaleOrderForm.paidUSD" type='number'
                                              @change.native="getTotal()" @focus.native="clearZero($event)"
                                              @keyup.native="getTotal()"

                                    >
                                        <template slot="append">{{posSaleOrderForm.remainUSD}} $</template>
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

                                              v-model.number="posSaleOrderForm.paidKHR" type='number'
                                    >
                                        <template slot="append">{{posSaleOrderForm.remainKHR}} ៛</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidBaht']}}:
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="THB" v-model.number="posSaleOrderForm.paidTHB" type='number'
                                              @change="getTotal()"
                                              @keyup.native="getTotal()"
                                    >
                                        <template slot="append">{{posSaleOrderForm.remainTHB}} B</template>
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
                                    <span class="plan-ribbon red">{{posSaleOrderForm.discountValue}}{{currencySymbol}}</span>
                                    <span class="ui header">{{langConfig['balanceDue']}}</span>

                                </div>
                                <div class="ui  attached segment feature">
                                    <div class="amount">
                                        {{posSaleOrderForm.balanceUnpaid}}{{currencySymbol}}
                                    </div>
                                </div>
                            </div>


                            <el-form-item :label="langConfig['customer']" prop="customerId">
                                <el-select style="display: block !important;"
                                           filterable clearable
                                           v-model="posSaleOrderForm.customerId" remote :remote-method="customerOpt"
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
                                        <el-input type="textarea" v-model="posSaleOrderForm.address"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="1">
                                    <div class="">&nbsp;</div>
                                </el-col>
                                <el-col :span="11">
                                    <el-form-item :label="langConfig['saleOrderNo']" prop="saleOrderNo">
                                        <el-input v-model="posSaleOrderForm.saleOrderNo"
                                                  prefix-icon="el-icon-edit" size="small"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>


                            <el-row>
                                <el-col :span="12">
                                    <el-form-item :label="langConfig['saleOrderDate']" prop="saleOrderDate">
                                        <el-date-picker
                                                v-model="posSaleOrderForm.saleOrderDate"
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
                                                v-model="posSaleOrderForm.dueDate"
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
                                                   v-model="posSaleOrderForm.termId"
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
                                        <el-input type="textarea" v-model="posSaleOrderForm.note" :rows="3"></el-input>
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
                        <el-button type="danger" @click.native="dialogAddPosSaleOrder= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">

                        <!--<el-button type="success" @click="savePosSaleOrder(true,$event,true)"><i
                                class="fa fa-print"></i>&nbsp; {{langConfig['saveAndPrint']}}</el-button>
-->
                         <el-button type="success" @click="savePosSaleOrder(true,$event,true)"><i
                                 class="fa fa-print"></i>&nbsp; {{langConfig['saveAndPrint']}}</el-button>

                        <el-button type="warning" @click="savePosSaleOrder(false,$event,false)"><i
                                class="el-icon-circle-check"> </i>&nbsp; {{langConfig['saveAndNew']}} <i>(Ctrl + Alt + Enter)</i></el-button>

                        <el-button type="primary" @click.native="savePosSaleOrder(true,$event,false)"><i
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
                :visible.sync="dialogUpdatePosSaleOrder"
                :fullscreen="fullScreen"
                class="dialogSaleOrder"

        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posSaleOrderForm" :rules="rules" :ref="refForm" label-width="120px"
                     :label-position="labelPosition"
                     class="posSaleOrderForm">
                <el-row :gutter="20">
                    <el-col :span="18" class="posSaleOrderForm">
                        <table class="table table-responsive​​​ table-striped table-hover responstable">
                            <thead>
                            <tr>
                                <th colspan="3" style="width: 30% !important;">
                                    <el-form-item label="" prop="locationId">
                                        <el-select style="display: block !important"
                                                   filterable clearable
                                                   v-model="posSaleOrderForm.locationId" :disabled="disabledItem"
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
                                                  v-model="posSaleOrderForm.code" autofocus
                                                  @keyup.native.13="addToPosSaleOrderData(null)"
                                        >
                                        </el-input>
                                    </el-form-item>
                                </th>
                                <th style="width: 20% !important;">
                                    <el-form-item label="">
                                        <el-select style="display: block !important;"
                                                   filterable clearable
                                                   v-model="posSaleOrderForm.itemId" :remote-method="itemOpt"
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
                                                  v-model.number="posSaleOrderForm.total"
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
                            <!--<draggable v-model="posSaleOrderData" :element="'tbody'">-->
                            <tr v-for="(posSaleOrderDoc,index ) in this.posSaleOrderData" :key="index">
                                <td style="vertical-align: middle">{{index + 1}}</td>
                                <td style="vertical-align: middle">{{posSaleOrderDoc.itemName}}</td>
                                <td style="vertical-align: middle">
                                    <el-switch
                                            v-model="posSaleOrderDoc.isRetail"
                                            active-color="#13ce66"
                                            inactive-color="#ff4949"
                                            @change="updatePosSaleOrderDetailByRetail(posSaleOrderDoc, index)"
                                    >
                                    </el-switch>
                                </td>


                                <!--<td>
                                    <el-input placeholder="Please input Unit1" v-model.number=posSaleOrderDoc.unit1
                                              @keyup.native="updatePosSaleOrderDetail(posSaleOrderDoc, index)"></el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Please input Unit2" v-model.number=posSaleOrderDoc.unit2
                                              @keyup.native="updatePosSaleOrderDetail(posSaleOrderDoc, index)"></el-input>
                                </td>-->

                                <td>
                                    <el-input placeholder="Please input Qty" v-model.number=posSaleOrderDoc.qty
                                              type='number'
                                              @keyup.native="updatePosSaleOrderDetail(posSaleOrderDoc, index)"
                                              @change="updatePosSaleOrderDetail(posSaleOrderDoc, index)"
                                    >
                                        <template slot="append">{{posSaleOrderDoc.unitName || ""}}</template>
                                    </el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Please input Price" v-model.number=posSaleOrderDoc.price
                                              type='number'
                                              @keyup.native="updatePosSaleOrderDetail(posSaleOrderDoc, index)"
                                              @change="updatePosSaleOrderDetail(posSaleOrderDoc, index)"
                                    ></el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Amount" v-model.number=posSaleOrderDoc.amount
                                              disabled>
                                        <template slot="append">
                                            <el-dropdown trigger="click" :hide-on-click="false">
                                                    <span class="el-dropdown-link">
                                                        {{langConfig['desc']}} <span v-if="posSaleOrderDoc.desc==''">
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
                                                                  v-model.number=posSaleOrderDoc.desc
                                                                  @keyup.native="updatePosSaleOrderDetail(posSaleOrderDoc, index)"></el-input>
                                                    </el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </template>
                                    </el-input>
                                </td>
                                <td style="text-align: center;vertical-align: middle">
                                    <el-button type="danger" icon="el-icon-delete" size="small"
                                               @click="removePosSaleOrderDetailByIndex(index,posSaleOrderDoc)"></el-button>
                                </td>
                            </tr>
                            <!--</draggable>-->
                            <thead>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['netTotal']}} :
                                </th>
                                <th colspan="2">
                                    <el-input :placeholder="langConfig['netTotal']"
                                              v-model.number="posSaleOrderForm.netTotal"
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
                                    <el-input placeholder="USD" v-model.number="posSaleOrderForm.paidUSD" type='number'
                                              @keyup.native="getTotal()" @change="getTotal()"
                                              @click.native="clearZero($event)"
                                    >
                                        <template slot="append">{{posSaleOrderForm.remainUSD}} $</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidRiel']}} :
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="KHR" @change="getTotal()" @keyup.native="getTotal()"
                                              v-model.number="posSaleOrderForm.paidKHR" type='number'
                                    >
                                        <template slot="append">{{posSaleOrderForm.remainKHR}} ៛</template>
                                    </el-input>
                                </th>
                            </tr>
                            <tr>
                                <th colspan="5" style="text-align: right;vertical-align: middle">
                                    {{langConfig['paidBaht']}}:
                                </th>
                                <th colspan="2">
                                    <el-input placeholder="THB" v-model.number="posSaleOrderForm.paidTHB" type='number'
                                              @change="getTotal()" @keyup.native="getTotal()"
                                    >
                                        <template slot="append">{{posSaleOrderForm.remainTHB}} B</template>
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
                                    <span class="plan-ribbon red">{{posSaleOrderForm.discountValue}}{{currencySymbol}}</span>
                                    <span class="ui header">{{langConfig['balanceDue']}}</span>

                                </div>
                                <div class="ui  attached segment feature">
                                    <div class="amount">
                                        {{posSaleOrderForm.balanceUnpaid}}{{currencySymbol}}
                                    </div>
                                </div>
                            </div>


                            <el-form-item :label="langConfig['customer']" prop="customerId">
                                <el-select style="display: block !important;"
                                           filterable clearable
                                           v-model="posSaleOrderForm.customerId" remote :remote-method="customerOpt"
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
                                        <el-input type="textarea" v-model="posSaleOrderForm.address"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="1">
                                    <div class="">&nbsp;</div>
                                </el-col>
                                <el-col :span="11">
                                    <el-form-item :label="langConfig['saleOrderNo']" prop="saleOrderNo">
                                        <el-input v-model="posSaleOrderForm.saleOrderNo" prefix-icon="el-icon-edit"
                                                  size="small"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>


                            <el-row>
                                <el-col :span="12">
                                    <el-form-item :label="langConfig['saleOrderDate']" prop="saleOrderDate">
                                        <el-date-picker
                                                v-model="posSaleOrderForm.saleOrderDate"
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
                                                v-model="posSaleOrderForm.dueDate"
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
                                                   v-model="posSaleOrderForm.termId"
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
                                        <el-input type="textarea" v-model="posSaleOrderForm.note" :rows="3"></el-input>
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
                        <el-button type="danger" @click="dialogUpdatePosSaleOrder= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">

                         <!--<el-button type="success" @click.native="updatePosSaleOrder(posSaleOrderId,true)"><i
                                 class="fa fa-print"></i>&nbsp;&nbsp; {{langConfig['saveAndPrint']}}</el-button>
-->
                          <el-button type="success" @click="savePosSaleOrder(true,$event,true)"><i
                                  class="fa fa-print"></i>&nbsp; {{langConfig['saveAndPrint']}}</el-button>

                         <el-button type="primary" @click.native="updatePosSaleOrder(posSaleOrderId,false)"><i
                                 class="el-icon-circle-check"> </i>&nbsp; {{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                    </el-col>
                </el-row>
            </span>
        </el-dialog>


        <el-dialog
                :title="langConfig['show']"
                :visible.sync="dialogShowPosSaleOrder"
        >
            <div class="row">
                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['saleOrderNo']}} : </label>{{posSaleOrderShowData.saleOrderNo
                    || ""}}
                </div>
                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['customer']}} : </label>{{posSaleOrderShowData.customerName
                    || ""}}
                </div>
                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['saleOrderDate']}} : </label>{{posSaleOrderShowData.saleOrderDateName
                    ||
                    ""}}
                </div>

                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['address']}} : </label>{{posSaleOrderShowData.address
                    || ""}}
                </div>
                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['total']}}: </label>{{posSaleOrderShowData.total ||
                    ""}}
                </div>

            </div>
            <br>
            <el-table
                    :data="posSaleOrderShowData.item"
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
    import {Pos_SaleOrderReact} from "../../collection/posSaleOrder";

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
                Pos_SaleOrderReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        components: {
            draggable
        },
        data() {
            return {
                keyCode: [],
                refForm: '',
                posSaleOrderData: [],
                posSaleOrderDataDisplay: [],
                posSaleOrderShowData: {},

                multipleSelection: [],
                posSaleOrderId: "",
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddPosSaleOrder: false,
                dialogUpdatePosSaleOrder: false,
                dialogShowPosSaleOrder: false,
                typeDiscount: "",
                fullScreen: true,

                posSaleOrderForm: {
                    itemId: "",
                    itemName: "",
                    price: 0,
                    qty: 0,
                    amount: 0,
                    total: 0,
                    netTotal: 0,
                    balanceUnpaid: 0,
                    paid: 0,
                    saleOrderDate: moment().toDate(),
                    dueDate: moment().add(1, "month").toDate(),
                    saleOrderNo: "",

                    note: "",

                    discountType: "Amount",
                    discount: 0,
                    discountValue: 0,
                    termId: "",
                    address: "",
                    customerId: "",

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
                    locationId: "",
                    code: ""

                },
                rules: {
                    saleOrderDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input PosSaleOrderDate',
                        trigger: 'blur'
                    }],
                    saleOrderNo: [{
                        required: true,
                        type: 'string',
                        message: 'Please input SaleOrder No',
                        trigger: 'blur'
                    }],
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
                posSaleOrderDetail: {},
                discountTypeOption: [
                    {label: "amount", value: "Amount"},
                    {label: "percent", value: "Percent"}
                ],
                locationOption: [],
                disabledItem: true,
                timeStamp: [],
                takeBarcode: '',
                skip: 0

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


            let elem = this.$jQuery('el-dialog.dialogSaleOrder');
            let checkEvent = $._data($('body').get(0), 'events');
            if (checkEvent.keyup.length <= 1) {
                this.$nextTick(() => {
                    this.$jQuery('body').on('keyup', elem, this.barcodeScanSaleOrder);
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
            "posSaleOrderForm.saleOrderDate"(val) {
                let vm = this;
                if (vm.dialogUpdatePosSaleOrder == false) {
                    vm.posSaleOrderForm.posSaleOrderDate = val;
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
                if (this.$refs["posSaleOrderFormAdd"]) {
                    this.getVoucherByRoleAndDate(val);
                }
            },
            /*dialogAddPosSaleOrder(val) {
                if (val) {
                    this._inputMaskPosSaleOrder();
                }
            },*/
            dialogUpdatePosSaleOrder(val) {
                if (val) {
                    this._inputMaskPosSaleOrder();
                }
            },
            "posSaleOrderForm.itemId"(val) {
                if (val) {
                    this.addToPosSaleOrderData(val);
                }
            },
            "posSaleOrderForm.customerId"(val) {
                let vm = this;
                if (val) {
                    Meteor.call("queryPosCustomerById", val, (err, result) => {
                        if (result) {
                            vm.posSaleOrderForm.address = result.address;

                            if (vm.refForm === "posSaleOrderFormAdd") {
                                vm.posSaleOrderForm.termId = result.termId;
                            }
                        }
                    })
                }
            },
            "posSaleOrderForm.discount"(val) {
                if (val || val === 0) {
                    this.posSaleOrderForm.discount = val;
                    // this.posSaleOrderForm.discount = this.$_numeral(val).format("0,00");
                    this.getTotal();

                }
            },
            "posSaleOrderForm.discountType"(val) {
                if (val) {
                    this.posSaleOrderForm.discountType = val;
                    this.getTotal();
                }
            },
            "posSaleOrderForm.locationId"(val) {
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
            _inputMaskPosSaleOrder() {
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
            barcodeScanSaleOrder(e) {
                if (this.dialogAddPosSaleOrder === true || this.dialogUpdatePosSaleOrder === true) {
                    let scannerSensitivity = 100;
                    if (e.keyCode !== 13 && !isNaN(e.key)) {
                        this.takeBarcode += e.key;
                    }
                    this.timeStamp.push(Date.now());
                    if (this.timeStamp.length > 1) {
                        if (this.timeStamp[1] - this.timeStamp[0] >= scannerSensitivity) {
                            this.takeBarcode = '';
                            this.timeStamp = [];
                        } else {
                            if (e.keyCode === 13) {
                                this.posSaleOrderForm.code = this.takeBarcode;
                                this.addToPosSaleOrderData(null);
                                this.timeStamp = [];
                                this.takeBarcode = ''
                            }
                        }
                    }
                }
            },
            queryData: _.debounce(function (val, skip, limit) {
                Meteor.call('queryPosSaleOrder', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.posSaleOrderDataDisplay = result.content;
                        this.count = result.countPosSaleOrder;
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
                        Meteor.call('queryPosCustomerOption', query, (err, result) => {
                            if (!err) {
                                this.customerOption = result;
                            } else {
                                console.log(err.message);
                            }
                        })
                    }, 200);
                } else {
                    Meteor.call('queryPosCustomerOption', "", (err, result) => {
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
            savePosSaleOrder(isCloseDialog, event, isPrint) {
                event.preventDefault();
                let vm = this;
                this.$refs["posSaleOrderFormAdd"].validate((valid) => {
                    if (valid) {
                        let posSaleOrderDoc = {
                            total: vm.$_numeral(vm.posSaleOrderForm.total).value(),
                            netTotal: vm.$_numeral(vm.posSaleOrderForm.netTotal).value(),
                            balanceUnpaid: vm.$_numeral(vm.posSaleOrderForm.balanceUnpaid).value(),
                            paid: vm.$_numeral(vm.posSaleOrderForm.netTotal).value() - vm.$_numeral(vm.posSaleOrderForm.balanceUnpaid).value(),

                            paidUSD: vm.$_numeral(vm.posSaleOrderForm.paidUSD).value(),
                            paidKHR: vm.$_numeral(vm.posSaleOrderForm.paidKHR).value(),
                            paidTHB: vm.$_numeral(vm.posSaleOrderForm.paidTHB).value(),

                            remainUSD: vm.$_numeral(vm.posSaleOrderForm.remainUSD).value(),
                            remainKHR: vm.$_numeral(vm.posSaleOrderForm.remainKHR).value(),
                            remainTHB: vm.$_numeral(vm.posSaleOrderForm.remainTHB).value(),

                            saleOrderDate: moment(vm.posSaleOrderForm.saleOrderDate).toDate(),
                            saleOrderDateName: moment(vm.posSaleOrderForm.saleOrderDate).format("DD/MM/YYYY"),
                            dueDate: moment(vm.posSaleOrderForm.dueDate).toDate(),
                            saleOrderNo: vm.posSaleOrderForm.saleOrderNo,

                            note: vm.posSaleOrderForm.note,

                            discountType: vm.posSaleOrderForm.discountType,


                            discount: vm.$_numeral(vm.posSaleOrderForm.discount).value(),
                            discountValue: vm.$_numeral(vm.posSaleOrderForm.discountValue).value(),
                            termId: vm.posSaleOrderForm.termId,
                            address: vm.posSaleOrderForm.address,

                            rolesArea: Session.get('area'),
                            receiveNumber: 1,
                            customerId: vm.posSaleOrderForm.customerId,
                            locationId: vm.posSaleOrderForm.locationId,
                            receiveStatus: "Active",
                            status: vm.$_numeral(vm.posSaleOrderForm.balanceUnpaid).value() == 0 ? "Complete" : vm.$_numeral(vm.posSaleOrderForm.balanceUnpaid).value() < vm.$_numeral(vm.posSaleOrderForm.netTotal).value() ? "Partial" : "Active"
                        };
                        posSaleOrderDoc.item = vm.posSaleOrderData;
                        Meteor.call("insertPosSaleOrder", posSaleOrderDoc, (err, result) => {
                            if (!err) {

                                if (isPrint) {
                                    FlowRouter.go('/pos-data/posSaleOrder/print?inv=' + result);
                                } else {
                                    vm.$message({
                                        duration: 1000,
                                        message: this.langConfig['saveSuccess'],
                                        type: 'success'
                                    });
                                }
                                if (isCloseDialog) {
                                    this.dialogAddPosSaleOrder = false;
                                } else {
                                    vm.getVoucherByRoleAndDate(moment().toDate());
                                }

                                Session.set("transactionActionNumber", (Session.get("transactionActionNumber") || 0) + 1);

                                vm.resetForm();
                            }
                        })
                    }
                })


            },
            updatePosSaleOrder(id, isPrint) {
                event.preventDefault();
                let vm = this;
                vm.$refs["posSaleOrderFormUpdate"].validate((valid) => {
                    if (valid) {
                        let posSaleOrderDoc = {
                            total: vm.$_numeral(vm.posSaleOrderForm.total).value(),
                            netTotal: vm.$_numeral(vm.posSaleOrderForm.netTotal).value(),
                            balanceUnpaid: vm.$_numeral(vm.posSaleOrderForm.balanceUnpaid).value(),
                            paid: vm.$_numeral(vm.posSaleOrderForm.netTotal).value() - vm.$_numeral(vm.posSaleOrderForm.balanceUnpaid).value(),

                            paidUSD: vm.$_numeral(vm.posSaleOrderForm.paidUSD).value(),
                            paidKHR: vm.$_numeral(vm.posSaleOrderForm.paidKHR).value(),
                            paidTHB: vm.$_numeral(vm.posSaleOrderForm.paidTHB).value(),

                            remainUSD: vm.$_numeral(vm.posSaleOrderForm.remainUSD).value(),
                            remainKHR: vm.$_numeral(vm.posSaleOrderForm.remainKHR).value(),
                            remainTHB: vm.$_numeral(vm.posSaleOrderForm.remainTHB).value(),

                            saleOrderDate: moment(vm.posSaleOrderForm.saleOrderDate).toDate(),
                            saleOrderDateName: moment(vm.posSaleOrderForm.saleOrderDate).format("DD/MM/YYYY"),
                            dueDate: moment(vm.posSaleOrderForm.dueDate).toDate(),
                            saleOrderNo: vm.posSaleOrderForm.saleOrderNo,

                            note: vm.posSaleOrderForm.note,

                            discountType: vm.posSaleOrderForm.discountType,
                            discount: vm.$_numeral(vm.posSaleOrderForm.discount).value(),
                            discountValue: vm.$_numeral(vm.posSaleOrderForm.discountValue).value(),

                            termId: vm.posSaleOrderForm.termId,
                            address: vm.posSaleOrderForm.address,

                            rolesArea: Session.get('area'),
                            customerId: vm.posSaleOrderForm.customerId,
                            _id: id,
                            locationId: vm.posSaleOrderForm.locationId,
                            receiveStatus: "Active",
                            status: vm.$_numeral(vm.posSaleOrderForm.balanceUnpaid).value() == 0 ? "Complete" : vm.$_numeral(vm.posSaleOrderForm.balanceUnpaid).value() < vm.$_numeral(vm.posSaleOrderForm.netTotal).value() ? "Partial" : "Active"
                        };
                        posSaleOrderDoc.item = vm.posSaleOrderData;
                        Meteor.call("updatePosSaleOrder", posSaleOrderDoc, id, (err, result) => {
                            if (!err) {

                                if (isPrint) {
                                    FlowRouter.go('/pos-data/posSaleOrder/print?inv=' + id);
                                } else {
                                    vm.$message({
                                        duration: 1000,
                                        message: this.langConfig['saveSuccess'],
                                        type: 'success'
                                    });
                                }

                                Session.set("transactionActionNumber", (Session.get("transactionActionNumber") || 0) + 1);

                                vm.dialogUpdatePosSaleOrder = false;

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
            removePosSaleOrder(index, row, rows) {
                let vm = this;
                let companyDoc = WB_waterBillingSetup.findOne({rolesArea: Session.get("area")});
                if (companyDoc.integratedPosAccount) {
                    Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                        if (re !== undefined) {
                            vm.closeDate = re.closeDate;
                        } else {
                            vm.closeDate = "";
                        }

                        if (vm.closeDate && vm.closeDate.getTime() >= row.saleOrderDate.getTime()) {
                            vm.$message({
                                duration: 1000,
                                message: "Already Closing Entry In Account!!",
                                type: 'error'
                            });
                            return false;
                        }
                        if ((row.status !== "Complete" || row.receiveNumber < 2) && (row.paymentNumber === undefined || row.paymentNumber < 1)) {

                            vm.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                                confirmButtonText: 'OK',
                                cancelButtonText: 'Cancel',
                                type: 'warning'
                            }).then(() => {
                                Meteor.call("removePosSaleOrder", row._id, row, (err, result) => {
                                    if (!err) {
                                        rows.splice(index, 1);
                                        vm.$message({
                                            message: `${row.saleOrderDateName}​ : ${row.saleOrderNo} ` + vm.langConfig['removeSuccess'],
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
                    if ((row.status !== "Complete" || row.receiveNumber < 2) && (row.paymentNumber === undefined || row.paymentNumber < 1)) {

                        vm.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                            confirmButtonText: 'OK',
                            cancelButtonText: 'Cancel',
                            type: 'warning'
                        }).then(() => {
                            Meteor.call("removePosSaleOrder", row._id, row, (err, result) => {
                                if (!err) {
                                    rows.splice(index, 1);
                                    vm.$message({
                                        message: `${row.saleOrderDateName}​ : ${row.saleOrderNo} ` + vm.langConfig['removeSuccess'],
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
            popupPosSaleOrderAdd() {
                this.refForm = "posSaleOrderFormAdd";
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
            getVoucherByRoleAndDate(date) {
                let vm = this;
                Meteor.call("pos_getSaleOrderNoByRoleAndDate", Session.get("area"), date, (err, result) => {
                    if (!err) {
                        vm.posSaleOrderForm.saleOrderNo = result;
                    }
                })
            },
            popupPosSaleOrderUpdate(index, row, scope) {
                this.refForm = "posSaleOrderFormUpdate";
                this.resetForm();
                this.itemOpt();
                let vm = this;
                $(".el-dialog__title").text(this.langConfig['update']);
                this.customerOpt();
                this.termOpt();


                let companyDoc = WB_waterBillingSetup.findOne({rolesArea: Session.get("area")});
                if (companyDoc.integratedPosAccount) {
                    Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                        if (re !== undefined) {
                            vm.closeDate = re.closeDate;
                        } else {
                            vm.closeDate = "";
                        }

                        if (vm.closeDate && vm.closeDate.getTime() >= row.saleOrderDate.getTime()) {
                            vm.$message({
                                duration: 1000,
                                message: "Already Closing Entry In Account!!",
                                type: 'error'
                            });
                            return false;
                        }
                        if ((row.status !== "Complete" || row.receiveNumber < 2) && (row.paymentNumber === undefined || row.paymentNumber < 1)) {
                            vm.dialogUpdatePosSaleOrder = true;
                            vm.findPosSaleOrderById(scope);
                        } else {
                            vm.$message({
                                duration: 1000,
                                message: "Not Active State!!",
                                type: 'error'
                            });
                        }

                    })
                } else {
                    if ((row.status !== "Complete" || row.receiveNumber < 2) && (row.paymentNumber === undefined || row.paymentNumber < 1)) {
                        vm.dialogUpdatePosSaleOrder = true;
                        vm.findPosSaleOrderById(scope);
                    } else {
                        vm.$message({
                            duration: 1000,
                            message: "Not Active State!!",
                            type: 'error'
                        });
                    }
                }

            },
            findPosSaleOrderById(doc) {
                let vm = this;
                this.posSaleOrderId = doc.row._id;
                let companyDoc = WB_waterBillingSetup.findOne({rolesArea: Session.get("area")});
                Meteor.call("queryPosSaleOrderById", doc.row._id, (err, data) => {
                    vm.posSaleOrderData = [];
                    if (data) {
                        vm.posSaleOrderData = data.item;
                        vm.posSaleOrderForm = {
                            total: formatCurrency(data.total, companyDoc.baseCurrency),
                            netTotal: formatCurrency(data.netTotal, companyDoc.baseCurrency),
                            balanceUnpaid: formatCurrency(data.balanceUnpaid, companyDoc.baseCurrency),
                            paid: data.paid,
                            paidUSD: data.paidUSD,
                            paidKHR: data.paidKHR,
                            paidTHB: data.paidTHB,
                            remainUSD: data.remainUSD,
                            remainKHR: data.remainKHR,
                            remainTHB: data.remainTHB,
                            saleOrderDate: data.saleOrderDate,
                            dueDate: data.dueDate,
                            saleOrderNo: data.saleOrderNo,
                            note: data.note,
                            discountType: data.discountType,
                            discount: data.discount,
                            discountValue: data.discountValue,
                            termId: data.termId,
                            address: data.address,
                            rolesArea: Session.get('area'),
                            customerId: data.customerId,
                            locationId: data.locationId
                        }

                        vm.posSaleOrderForm.saleOrderNo = data.saleOrderNo;
                        vm.getTotal();
                    }


                })

            },
            addToPosSaleOrderData(val) {
                let vm = this;

                if (val === null) {
                    val = vm.posSaleOrderForm.code;
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

                let isFound = vm.posSaleOrderData.find(function (element) {
                    return element.itemId === val || element.code === val;
                });
                if (isFound !== undefined) {
                    this.$message({
                        type: 'error',
                        message: 'Item already add!'
                    });
                    let s = new buzz.sound('/the-calling.mp3');
                    s.play();
                    return false;
                }
                vm.posSaleOrderForm.isRetail = true;
                Meteor.call("queryPosProductById", val, (err, data) => {
                    if (data) {
                        vm.posSaleOrderData.push({
                            itemId: data._id,
                            itemName: data.code + " : " + data.name,
                            code: data.code,
                            unit1: 1,
                            unit2: 1,
                            totalUnit: 1,
                            unitId: data.unitId,
                            unitName: data.unitName,

                            price: vm.posSaleOrderForm.isRetail === true ? vm.$_numeral(data.rePrice).value() : vm.$_numeral(data.whPrice).value(),
                            qty: vm.$_numeral(1).value(),
                            amount: vm.posSaleOrderForm.isRetail === true ? formatCurrency(data.rePrice) : formatCurrency(data.whPrice),
                            isRetail: true,
                            desc: ""
                        });
                        vm.posSaleOrderForm.itemId = "";
                        vm.posSaleOrderForm.code = "";
                        vm.$message({
                            duration: 1000,
                            message: `បន្ថែម ` + data.code + " : " + data.name + " បានជោគជ័យ !",
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
            removePosSaleOrderDetailByIndex(index, row) {
                this.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {

                    this.posSaleOrderData.splice(index, 1);
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
            updatePosSaleOrderDetail(row, index) {
                row.totalUnit = this.$_math.round(row.unit1 * row.unit2 * row.qty, 2);

                row.amount = formatCurrency(row.price * row.totalUnit);

                this.posSaleOrderData[index] = row;
                let newIndex = index + 1;
                /*this.$message({
                    duration: 1000,
                    message: `Update Row Number ` + newIndex + " Successfully !",
                    type: 'success'
                });*/
                this.getTotal();
            },
            updatePosSaleOrderDetailByRetail(row, index) {
                let vm = this;
                Meteor.call("queryPosProductById", row.itemId, (err, data) => {
                    if (data) {
                        if (row.isRetail == true) {
                            row.price = data.rePrice;
                            row.amount = vm.$_numeral(formatCurrency(data.rePrice * row.totalUnit)).value();
                        } else {
                            row.price = data.whPrice;
                            row.amount = vm.$_numeral(formatCurrency(data.whPrice * row.totalUnit)).value();

                        }
                        this.posSaleOrderData[index] = row;
                        let newIndex = index + 1;
                        this.$message({
                            duration: 1000,
                            message: `Update Row Number ` + newIndex + " Successfully !",
                            type: 'success'
                        });
                        this.getTotal();
                    }
                })
            },
            clearZero(event) {
                /*debugger;
                $(event.currentTarget).select();
                console.log(event);*/
            },
            cancel() {
                this.resetForm();
                this.$message({
                    type: 'info',
                    message: this.langConfig['cancel']
                });
            },
            resetForm() {
                this.posSaleOrderData = [];
                this.posSaleOrderForm.discountValue = 0;
                this.posSaleOrderForm.paidUSD = 0;
                this.posSaleOrderForm.paidKHR = 0;
                this.posSaleOrderForm.paidTHB = 0;
                this.posSaleOrderForm.discount = 0;
                this.posSaleOrderForm.saleOrderNo = "";
                this.posSaleOrderForm.customerId = "";
                this.posSaleOrderForm.locationId = "";
                this.posSaleOrderForm.code = "";


                if (this.$refs["posSaleOrderFormAdd"]) {
                    this.$refs["posSaleOrderFormAdd"].resetFields();
                }
                if (this.$refs["posSaleOrderFormUpdate"]) {
                    this.$refs["posSaleOrderFormUpdate"].resetFields();
                }
                this.getTotal();

            },
            getTotal() {
                let vm = this;
                let total = 0;
                vm.posSaleOrderData.forEach(function (obj) {
                    total += parseFloat(vm.$_numeral(obj.amount).value());
                });
                let companyDoc = WB_waterBillingSetup.findOne({rolesArea: Session.get("area")});
                this.currencySymbol = getCurrencySymbolById(companyDoc.baseCurrency);
                vm.posSaleOrderForm.total = formatCurrency(total, companyDoc.baseCurrency);

                if (vm.posSaleOrderForm.discountType == "Amount") {
                    vm.posSaleOrderForm.netTotal = formatCurrencyLast(total - vm.posSaleOrderForm.discount, companyDoc.baseCurrency);
                    vm.posSaleOrderForm.balanceUnpaid = formatCurrencyLast(total - vm.posSaleOrderForm.discount - GeneralFunction.exchange("USD", companyDoc.baseCurrency, vm.posSaleOrderForm.paidUSD, Session.get("area")) - GeneralFunction.exchange("KHR", companyDoc.baseCurrency, vm.posSaleOrderForm.paidKHR, Session.get("area")) - GeneralFunction.exchange("THB", companyDoc.baseCurrency, vm.posSaleOrderForm.paidTHB, Session.get("area")), companyDoc.baseCurrency);

                    vm.posSaleOrderForm.remainUSD = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "USD", vm.$_numeral(vm.posSaleOrderForm.balanceUnpaid).value(), Session.get("area")), "USD");
                    vm.posSaleOrderForm.remainKHR = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "KHR", vm.$_numeral(vm.posSaleOrderForm.balanceUnpaid).value(), Session.get("area")), "KHR");
                    vm.posSaleOrderForm.remainTHB = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "THB", vm.$_numeral(vm.posSaleOrderForm.balanceUnpaid).value(), Session.get("area")), "THB");
                    vm.posSaleOrderForm.discountValue = formatCurrencyLast(vm.posSaleOrderForm.discount, companyDoc.baseCurrency);

                    vm.posSaleOrderForm.balanceUnpaid = vm.$_numeral(vm.posSaleOrderForm.balanceUnpaid).value() <= 0 ? 0 : vm.posSaleOrderForm.balanceUnpaid;
                    this.typeDiscount = getCurrencySymbolById(companyDoc.baseCurrency);
                } else {
                    vm.posSaleOrderForm.netTotal = formatCurrencyLast(total - (total * vm.posSaleOrderForm.discount / 100), companyDoc.baseCurrency);
                    vm.posSaleOrderForm.balanceUnpaid = formatCurrencyLast(total - (total * vm.posSaleOrderForm.discount / 100) - GeneralFunction.exchange("USD", companyDoc.baseCurrency, vm.posSaleOrderForm.paidUSD, Session.get("area")) - GeneralFunction.exchange("KHR", companyDoc.baseCurrency, vm.posSaleOrderForm.paidKHR, Session.get("area")) - GeneralFunction.exchange("THB", companyDoc.baseCurrency, vm.posSaleOrderForm.paidTHB, Session.get("area")), companyDoc.baseCurrency);

                    vm.posSaleOrderForm.remainUSD = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "USD", vm.$_numeral(vm.posSaleOrderForm.balanceUnpaid).value(), Session.get("area")), "USD");
                    vm.posSaleOrderForm.remainKHR = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "KHR", vm.$_numeral(vm.posSaleOrderForm.balanceUnpaid).value(), Session.get("area")), "KHR");
                    vm.posSaleOrderForm.remainTHB = formatCurrencyLast(GeneralFunction.exchange(companyDoc.baseCurrency, "THB", vm.$_numeral(vm.posSaleOrderForm.balanceUnpaid).value(), Session.get("area")), "THB");
                    vm.posSaleOrderForm.discountValue = formatCurrencyLast((total * vm.posSaleOrderForm.discount / 100), companyDoc.baseCurrency);

                    vm.posSaleOrderForm.balanceUnpaid = vm.$_numeral(vm.posSaleOrderForm.balanceUnpaid).value() <= 0 ? 0 : vm.posSaleOrderForm.balanceUnpaid;
                    this.typeDiscount = "%";
                }
            },
            popupPosSaleOrderShow(row) {
                let vm = this;
                this.dialogShowPosSaleOrder = true;
                $(".el-dialog__title").text(this.langConfig['show']);
                Meteor.call("queryPosSaleOrderByIdShow", row._id, (err, result) => {
                    if (result) {
                        vm.posSaleOrderShowData = result;
                        vm.posSaleOrderShowData.customerName = row.customerDoc.name;
                    } else {
                        console.log(err.message);
                    }
                })
            },
            printSaleOrder(data) {

                FlowRouter.go('/pos-data/posSaleOrder/print?inv=' + data._id);

            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            this.getTotal();
            this.locationOpt();
            Meteor.subscribe('Pos_SaleOrderReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['saleOrder'];
                return data;
            }
        }
    }


</script>




