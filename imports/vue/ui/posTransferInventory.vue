<template>
    <div class="pos_transferInventory">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer"
                           @click="popupTransferInventoryAdd(),dialogAddTransferInventory= true,resetForm()"
                        >
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
                        :data="posTransferInventoryDataDisplay"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="transferInventoryDateName"
                            :label="langConfig['transferInventoryDate']"
                            sortable>
                    </el-table-column>

                    <el-table-column
                            prop="locationFromDoc.name"
                            :label="langConfig['locationFrom']">
                    </el-table-column>
                    <el-table-column
                            prop="locationToDoc.name"
                            :label="langConfig['locationTo']">
                    </el-table-column>
                    <el-table-column
                            prop="total"
                            :label="langConfig['total']">
                    </el-table-column>

                    <el-table-column
                            prop="note"
                            :label="langConfig['note']">
                    </el-table-column>

                    <el-table-column
                            :label="langConfig['action']"
                            width="160"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removeTransferInventory(scope.$index,scope.row,posTransferInventoryDataDisplay)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="popupTransferInventoryUpdate(scope.$index,scope.row,scope)"
                                           :disabled="disabledUpdate"></el-button>
                                <el-button type="success" icon="el-icon-view" size="small" class="cursor-pointer"
                                           @click="popupTransferInventoryShow(scope.row)"></el-button>
                            </el-button-group>
                        </template>
                    </el-table-column>

                </el-table>
                <!--Pagination-->
                <br>
                <el-row type="flex" class="row-bg" justify="center">
                    <el-col :span="24" style="text-align: center;">
                        <div class="block">
                            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
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
                :visible.sync="dialogAddTransferInventory"
                :fullscreen="fullscreen"
                class="transferInventory"

        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posTransferInventoryForm" :rules="rules" :ref="refForm" label-width="120px"
                     :label-position="labelPosition"
                     class="posTransferInventoryForm">
                <el-row :gutter="20">
                    <el-col :span="18" class="posTransferInventoryForm">
                        <table class="table table-responsive​​​ table-striped table-hover responstable">
                            <thead>
                            <tr>
                                <th colspan="2" style="width: 40% !important;">
                                    <el-form-item label="">
                                        <el-input :placeholder="langConfig['barcode']" :disabled="disableItem"
                                                  @keyup.native.13="addToTransferInventoryData(null)"
                                                  v-model="posTransferInventoryForm.code" autofocus
                                        >
                                        </el-input>
                                    </el-form-item>
                                </th>
                                <th colspan="3" style="width: 40% !important;">
                                    <el-form-item label="">

                                        <el-select style="display: block !important;"
                                                   filterable clearable :remote-method="itemOpt"
                                                   v-model="posTransferInventoryForm.itemId" :disabled="disableItem"
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

                                <th colspan="3">

                                </th>
                            </tr>
                            </thead>
                            <thead>
                            <tr>
                                <th>{{langConfig['no']}}</th>
                                <th>{{langConfig['name']}}</th>
                                <th>{{langConfig['cost']}}</th>
                                <th>{{langConfig['rawQty']}}</th>
                                <th>{{langConfig['qty']}}</th>
                                <th colspan="2">{{langConfig['amount']}}</th>
                            </tr>
                            </thead>
                            <tr v-for="(posTransferInventoryDoc,index ) in this.posTransferInventoryData" :key="index">
                                <td style="vertical-align: middle">{{index + 1}}</td>
                                <td style="vertical-align: middle">{{posTransferInventoryDoc.itemName}}</td>
                                <td>
                                    <el-input placeholder="Please input Cost" disabled
                                              v-model.number=posTransferInventoryDoc.cost
                                              @keyup.native="updateTransferInventoryDetail(posTransferInventoryDoc, index)"></el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Please input Raw Qty" disabled
                                              v-model.number=posTransferInventoryDoc.rawQty
                                              @keyup.native="updateTransferInventoryDetail(posTransferInventoryDoc, index)"></el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Please input Qty" v-model.number=posTransferInventoryDoc.qty
                                              type="number"
                                              @change.native="updateTransferInventoryDetail(posTransferInventoryDoc, index)"
                                              @keyup.native="updateTransferInventoryDetail(posTransferInventoryDoc, index)"></el-input>
                                </td>

                                <td>
                                    <el-input :placeholder="langConfig['amount']"
                                              v-model.number=posTransferInventoryDoc.amount
                                              disabled>
                                        <template slot="append">
                                            <el-dropdown trigger="click" :hide-on-click="false">
                                                    <span class="el-dropdown-link">
                                                        {{langConfig['des']}} <span
                                                            v-if="posTransferInventoryDoc.desc==''">
                                                                <i class="el-icon-caret-bottom el-icon--right"></i>
                                                            </span>
                                                            <span v-else>
                                                                <i class="el-icon-circle-check el-icon--right"
                                                                   style="color: blue"></i>

                                                            </span>
                                                    </span>
                                                <el-dropdown-menu slot="dropdown">
                                                    <el-dropdown-item class="clearfix">
                                                        <el-input :placeholder="langConfig['des']"
                                                                  type="textarea"
                                                                  v-model.number=posTransferInventoryDoc.desc
                                                                  @keyup.native="updateTransferInventoryDetail(posTransferInventoryDoc, index)"></el-input>
                                                    </el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </template>
                                    </el-input>
                                </td>
                                <td style="text-align: center;vertical-align: middle">
                                    <el-button type="danger" icon="el-icon-delete" size="small"
                                               @click="removeTransferInventoryDetailByIndex(index,posTransferInventoryDoc)"></el-button>
                                </td>
                            </tr>
                        </table>
                    </el-col>
                    <el-col :span="6">
                        <div class="w3-code">
                            <div class="ui segments plan">
                                <div class="ui top attached segment teal inverted plan-title">
                                    <span class="plan-ribbon red">0</span>
                                    <span class="ui header">{{langConfig['balanceTransfer']}}</span>

                                </div>
                                <div class="ui  attached segment feature">
                                    <div class="amount">{{posTransferInventoryForm.total}}{{currencySymbol}}
                                    </div>
                                </div>
                            </div>
                            <el-form-item :label="langConfig['locationFrom']" prop="locationFromId">

                                <el-select style="display: block !important"
                                           filterable clearable
                                           v-model="posTransferInventoryForm.locationFromId"
                                           :disabled="disableLocationFrom"
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
                            <el-form-item :label="langConfig['locationTo']" prop="locationToId">

                                <el-select style="display: block !important"
                                           filterable clearable
                                           v-model="posTransferInventoryForm.locationToId"
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
                            <el-form-item :label="langConfig['transferInventoryDate']"
                                          prop="transferInventoryDate">
                                <el-date-picker
                                        v-model="posTransferInventoryForm.transferInventoryDate"
                                        type="date"
                                        style="width: 100%;"
                                        placeholder="Pick a day"
                                        :picker-options="options"
                                        :disabled="disabledDate"
                                >
                                </el-date-picker>
                            </el-form-item>

                            <el-form-item :label="langConfig['note']" prop="note">
                                <el-input type="textarea" v-model="posTransferInventoryForm.note" :rows="3"></el-input>
                            </el-form-item>
                        </div>
                        <!--</el-card>-->
                    </el-col>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer"
                  style="bottom: 15px !important; left: 25px !important;right:25px !important; position: fixed !important;">
                <hr style="margin-top: 0px !important;">
                <el-row>
                    <el-col :span="12" style="text-align: left !important;">
                        <el-button type="danger"
                                   @click.native="dialogAddTransferInventory= false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">
                        <el-button type="success" @click="saveTransferInventory(false,$event)"><i
                                class="el-icon-circle-check"> </i>&nbsp; {{langConfig['saveAndNew']}} <i>(Ctrl + Alt + Enter)</i></el-button>

                        <el-button type="primary" @click.native="saveTransferInventory(true,$event)"><i
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
                :visible.sync="dialogUpdateTransferInventory"
                :fullscreen="fullscreen"
                class="transferInventory"
        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posTransferInventoryForm" :rules="rules" :ref="refForm" label-width="120px"
                     :label-position="labelPosition"
                     class="posTransferInventoryForm">
                <el-row :gutter="20">
                    <el-col :span="18" class="posTransferInventoryForm">
                        <table class="table table-responsive​​​ table-striped table-hover responstable">
                            <thead>
                            <tr>
                                <th colspan="2" style="width: 40% !important;">
                                    <el-form-item label="">
                                        <el-input :placeholder="langConfig['barcode']" :disabled="disableItem"
                                                  @keyup.native.13="addToTransferInventoryData(null)"
                                                  v-model="posTransferInventoryForm.code" autofocus
                                        >
                                        </el-input>
                                    </el-form-item>
                                </th>
                                <th colspan="3" style="width: 40% !important;">
                                    <el-form-item label="">

                                        <el-select style="display: block !important;"
                                                   filterable clearable :remote-method="itemOpt"
                                                   v-model="posTransferInventoryForm.itemId" :disabled="disableItem"
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

                                <th colspan="3">

                                </th>
                            </tr>
                            </thead>
                            <thead>
                            <tr>
                                <th>{{langConfig['no']}}</th>
                                <th>{{langConfig['name']}}</th>
                                <th>{{langConfig['cost']}}</th>
                                <th>{{langConfig['rawQty']}}</th>
                                <th>{{langConfig['qty']}}</th>
                                <th colspan="2">{{langConfig['amount']}}</th>
                            </tr>
                            </thead>
                            <tr v-for="(posTransferInventoryDoc,index ) in this.posTransferInventoryData" :key="index">
                                <td style="vertical-align: middle">{{index + 1}}</td>
                                <td style="vertical-align: middle">{{posTransferInventoryDoc.itemName}}</td>
                                <td>
                                    <el-input placeholder="Please input Cost" disabled
                                              v-model.number=posTransferInventoryDoc.cost
                                              @keyup.native="updateTransferInventoryDetail(posTransferInventoryDoc, index)"></el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Please input Raw Qty" disabled
                                              v-model.number=posTransferInventoryDoc.rawQty
                                              @keyup.native="updateTransferInventoryDetail(posTransferInventoryDoc, index)"></el-input>
                                </td>
                                <td>
                                    <el-input placeholder="Please input Qty" v-model.number=posTransferInventoryDoc.qty
                                              type="number"
                                              @change.native="updateTransferInventoryDetail(posTransferInventoryDoc, index)"
                                              @keyup.native="updateTransferInventoryDetail(posTransferInventoryDoc, index)"></el-input>
                                </td>

                                <td>
                                    <el-input :placeholder="langConfig['amount']"
                                              v-model.number=posTransferInventoryDoc.amount
                                              disabled>
                                        <template slot="append">
                                            <el-dropdown trigger="click" :hide-on-click="false">
                                                    <span class="el-dropdown-link">
                                                        {{langConfig['des']}} <span
                                                            v-if="posTransferInventoryDoc.desc==''">
                                                                <i class="el-icon-caret-bottom el-icon--right"></i>
                                                            </span>
                                                            <span v-else>
                                                                <i class="el-icon-circle-check el-icon--right"
                                                                   style="color: blue"></i>

                                                            </span>
                                                    </span>
                                                <el-dropdown-menu slot="dropdown">
                                                    <el-dropdown-item class="clearfix">
                                                        <el-input :placeholder="langConfig['des']"
                                                                  type="textarea"
                                                                  v-model.number=posTransferInventoryDoc.desc
                                                                  @keyup.native="updateTransferInventoryDetail(posTransferInventoryDoc, index)"></el-input>
                                                    </el-dropdown-item>
                                                </el-dropdown-menu>
                                            </el-dropdown>
                                        </template>
                                    </el-input>
                                </td>
                                <td style="text-align: center;vertical-align: middle">
                                    <el-button type="danger" icon="el-icon-delete" size="small"
                                               @click="removeTransferInventoryDetailByIndex(index,posTransferInventoryDoc)"></el-button>
                                </td>
                            </tr>
                        </table>
                    </el-col>
                    <el-col :span="6">
                        <div class="w3-code">
                            <div class="ui segments plan">
                                <div class="ui top attached segment teal inverted plan-title">
                                    <span class="plan-ribbon red">0</span>
                                    <span class="ui header">{{langConfig['balanceTransfer']}}</span>

                                </div>
                                <div class="ui  attached segment feature">
                                    <div class="amount">{{posTransferInventoryForm.total}}{{currencySymbol}}
                                    </div>
                                </div>
                            </div>
                            <el-form-item :label="langConfig['locationFrom']" prop="locationFromId">

                                <el-select style="display: block !important"
                                           filterable clearable
                                           v-model="posTransferInventoryForm.locationFromId"
                                           :disabled="disableLocationFrom"
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
                            <el-form-item :label="langConfig['locationTo']" prop="locationToId">

                                <el-select style="display: block !important"
                                           filterable clearable
                                           v-model="posTransferInventoryForm.locationToId"
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
                            <el-form-item :label="langConfig['transferInventoryDate']"
                                          prop="transferInventoryDate">
                                <el-date-picker
                                        v-model="posTransferInventoryForm.transferInventoryDate"
                                        type="date"
                                        style="width: 100%;"
                                        placeholder="Pick a day"
                                        :picker-options="options"
                                        :disabled="disabledDate"
                                >
                                </el-date-picker>
                            </el-form-item>

                            <el-form-item :label="langConfig['note']" prop="note">
                                <el-input type="textarea" v-model="posTransferInventoryForm.note" :rows="3"></el-input>
                            </el-form-item>
                        </div>
                        <!--</el-card>-->
                    </el-col>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer"
                  style="bottom: 15px !important; left: 25px !important;right:25px !important; position: fixed !important;">
                        <hr style="margin-top: 0px !important;">
                        <el-row>
                            <el-col :span="12" style="text-align: left !important;">
                                <el-button type="danger"
                                           @click="dialogUpdateTransferInventory= false, cancel(),resetForm()"> <i
                                        class="el-icon-circle-cross"> </i>&nbsp;{{langConfig['cancel']}} <i>(ESC)</i></el-button>
                            </el-col>
                            <el-col :span="11" class="pull-right">
                                 <el-button type="primary"
                                            @click.native="updateTransferInventory(posTransferInventoryId)"><i
                                         class="el-icon-circle-check"> </i>&nbsp; {{langConfig['save']}} <i>(Ctrl + Enter)</i></el-button>
                            </el-col>
                        </el-row>
                    </span>
        </el-dialog>

        <el-dialog
                :title="langConfig['show']"
                :visible.sync="dialogShowTransferInventory"
        >
            <div class="row">
                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['locationFrom']}} : </label>{{posTransferInventoryShowData.locationFrom
                    || ""}}
                </div>
                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['locationTo']}} : </label>{{posTransferInventoryShowData.locationTo
                    || ""}}
                </div>
                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['transferInventoryDate']}} : </label>{{posTransferInventoryShowData.transferInventoryDateName
                    ||
                    ""}}
                </div>

                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['note']}} : </label>{{posTransferInventoryShowData.note
                    || ""}}
                </div>
                <div class="col-md-6">
                    <label for="" style="width: 150px">{{langConfig['total']}}: </label>{{posTransferInventoryShowData.total
                    ||
                    ""}}
                </div>

            </div>
            <br>
            <el-table
                    :data="posTransferInventoryShowData.item"
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
                        prop="rawQty"
                        :label="langConfig['rawQty']"
                >
                </el-table-column>
                <el-table-column
                        prop="qty"
                        :label="langConfig['qty']"
                >
                </el-table-column>

                <el-table-column
                        prop="amount"
                        :label="langConfig['amount']"
                >
                </el-table-column>
                <el-table-column
                        prop="desc"
                        :label="langConfig['des']"
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
    import {GeneralFunction} from "../../../imports/api/methods/generalFunction";
    import {getCurrencySymbolById} from "../../../imports/api/methods/roundCurrency";
    import {WB_waterBillingSetup} from "../../collection/waterBillingSetup";
    import compoLang from '../../../both/i18n/lang/elem-label'
    // require('cleave.js/dist/addons/cleave-phone.ac');
    // require('cleave.js/dist/addons/cleave-phone.{country}');
    import {Pos_TransferInventoryReact} from "../../collection/posTransferInventory";

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
                Pos_TransferInventoryReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },
        components: {
            draggable
        },
        data() {
            return {
                keyCode: [],
                timeStamp: [],
                takeBarcode: '',

                fullscreen: true,
                refForm: "",
                posTransferInventoryData: [],
                posTransferInventoryShowData: {},
                posTransferInventoryDataDisplay: [],
                multipleSelection: [],
                posTransferInventoryId: "",
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddTransferInventory: false,
                dialogUpdateTransferInventory: false,
                dialogShowTransferInventory: false,

                posTransferInventoryForm: {
                    itemId: "",
                    itemName: "",
                    cost: 0,
                    rawQty: 0,
                    qty: 0,
                    price: 0,
                    amount: 0,
                    total: 0,
                    transferInventoryDate: moment().toDate(),
                    note: "",
                    desc: "",
                    locationFromId: "",
                    locationToId: "",
                    code: ""

                },
                rules: {
                    transferInventoryDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input TransferInventoryDate',
                        trigger: 'blur'
                    }],
                    locationFromId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Location From',
                        trigger: 'change'
                    }],
                    locationToId: [{
                        required: true,
                        type: 'string',
                        message: 'Please choose Location To',
                        trigger: 'change'
                    }]
                    // note: [{required: true, type: 'string', message: 'Please input Memo', trigger: 'blur'}],
                },

                // Options
                itemOption: [],

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
                type: "",
                posTransferInventoryDetail: {},
                locationOption: [],
                disableItem: true,
                disableLocationFrom: false,
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

            let elem = this.$jQuery('el-dialog.transferInventory');
            let checkEvent = $._data($('body').get(0), 'events');
            if (checkEvent.keyup.length <= 1) {
                this.$nextTick(() => {
                    this.$jQuery('body').on('keyup', elem, this.barcodeScanTransferInventory);
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
            "posTransferInventoryForm.transferInventoryDate"(val) {
                let vm = this;
                if (vm.dialogUpdateTransferInventory == false) {
                    vm.posTransferInventoryForm.posTransferInventoryDate = val;
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

            },
            "posTransferInventoryForm.itemId"(val) {
                if (val) {
                    this.addToTransferInventoryData(val);
                }
            },
            "posTransferInventoryForm.locationFromId"(val) {
                if (val) {
                    this.disableItem = false;
                } else {
                    this.disableItem = true;
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
            _inputMaskTransferInventory() {
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
            barcodeScanTransferInventory(e) {
                if (this.dialogAddTransferInventory === true || this.dialogUpdateTransferInventory === true) {
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
                                this.posTransferInventoryForm.code = this.takeBarcode;
                                this.addToTransferInventoryData(null);
                                this.timeStamp = [];
                                this.takeBarcode = ''
                            }
                        }
                    }
                }
            },
            queryData: _.debounce(function (val, skip, limit) {
                Meteor.call('queryTransferInventory', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.posTransferInventoryDataDisplay = result.content;
                        this.count = result.countTransferInventory;
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

            saveTransferInventory(isCloseDialog, event) {
                event.preventDefault();
                let vm = this;
                let item = vm.posTransferInventoryData;

                this.$refs["posTransferInventoryFormAdd"].validate((valid) => {
                    if (valid) {
                        let posTransferInventoryDoc = {
                            total: vm.$_numeral(vm.posTransferInventoryForm.total).value(),
                            transferInventoryDate: moment(vm.posTransferInventoryForm.transferInventoryDate).toDate(),
                            transferInventoryDateName: moment(vm.posTransferInventoryForm.transferInventoryDate).format("DD/MM/YYYY"),

                            note: vm.posTransferInventoryForm.note,

                            rolesArea: Session.get('area'),
                            item: item,
                            locationFromId: vm.posTransferInventoryForm.locationFromId,
                            locationToId: vm.posTransferInventoryForm.locationToId,

                        };
                        posTransferInventoryDoc.transaction = vm.posTransferInventoryData;
                        Meteor.call("insertTransferInventory", posTransferInventoryDoc, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                Session.set("transactionActionNumber", (Session.get("transactionActionNumber") || 0) + 1);

                                if (isCloseDialog) {
                                    this.dialogAddTransferInventory = false;
                                }
                                vm.resetForm();
                            }
                        })
                    }
                })
            },
            updateTransferInventory(id) {
                event.preventDefault();
                let vm = this;
                vm.$refs["posTransferInventoryFormUpdate"].validate((valid) => {
                    if (valid) {
                        let posTransferInventoryDoc = {
                            total: vm.$_numeral(vm.posTransferInventoryForm.total).value(),
                            transferInventoryDate: moment(vm.posTransferInventoryForm.transferInventoryDate).toDate(),
                            transferInventoryDateName: moment(vm.posTransferInventoryForm.transferInventoryDate).format("DD/MM/YYYY"),

                            note: vm.posTransferInventoryForm.note,

                            rolesArea: Session.get('area'),
                            item: vm.posTransferInventoryData,
                            locationFromId: vm.posTransferInventoryForm.locationFromId,
                            locationToId: vm.posTransferInventoryForm.locationToId,

                        };
                        posTransferInventoryDoc.item = vm.posTransferInventoryData;
                        Meteor.call("updateTransferInventory", posTransferInventoryDoc, id, (err, result) => {
                            if (!err) {
                                vm.$message({
                                    duration: 1000,
                                    message: `Save Successfully!`,
                                    type: 'success'
                                });
                                Session.set("transactionActionNumber", (Session.get("transactionActionNumber") || 0) + 1);

                                vm.dialogUpdateTransferInventory = false;

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
            removeTransferInventory(index, row, rows) {
                let vm = this;
                vm.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removeTransferInventory", row._id, row, (err, result) => {
                        if (!err) {
                            rows.splice(index, 1);
                            vm.$message({
                                message: `លុប ${row.transferInventoryDateName}​ បានជោគជ័យ`,
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

            },
            popupTransferInventoryAdd() {
                this.refForm = "posTransferInventoryFormAdd";
                this.resetForm();
                this.itemOpt();
                let vm = this;
                $(".el-dialog__title").text(this.langConfig['add']);
            },
            popupTransferInventoryUpdate(index, row, scope) {
                this.refForm = "posTransferInventoryFormUpdate";

                this.resetForm();
                this.itemOpt();
                let vm = this;
                $(".el-dialog__title").text(this.langConfig['update']);
                vm.dialogUpdateTransferInventory = true;
                vm.findTransferInventoryById(scope);
            },
            findTransferInventoryById(doc) {
                let vm = this;
                this.posTransferInventoryId = doc.row._id;
                let companyDoc = WB_waterBillingSetup.findOne({rolesArea: Session.get("area")});
                Meteor.call("queryTransferInventoryById", doc.row._id, (err, data) => {
                    vm.posTransferInventoryData = [];
                    if (data) {
                        vm.posTransferInventoryData = data.item;
                        vm.posTransferInventoryForm = {
                            total: formatCurrency(data.total, companyDoc.baseCurrency),
                            transferInventoryDate: moment(data.transferInventoryDate).toDate(),
                            transferInventoryDateName: moment(data.transferInventoryDate).format("DD/MM/YYYY"),

                            note: data.note,

                            rolesArea: data.rolesArea,
                            item: data.item,
                            locationFromId: data.locationFromId,
                            locationToId: data.locationToId,
                        }
                        vm.getTotal();
                    }
                })

            },
            addToTransferInventoryData(val) {
                let vm = this;
                if (val === null) {
                    val = vm.posTransferInventoryForm.code;
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

                let isFound = vm.posTransferInventoryData.find(function (element) {
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
                Meteor.call("queryPosProductById", val, (err, dataRaw) => {
                    if (dataRaw) {
                        Meteor.call("queryPosAverageCostById", dataRaw._id, Session.get("area"), this.posTransferInventoryForm.locationFromId, (err, data) => {
                            if (data) {
                                vm.posTransferInventoryData.push({
                                    itemId: data.itemId,
                                    itemName: data.code + " : " + data.name,
                                    cost: formatCurrency(data.averageCost),
                                    rawQty: vm.$_numeral(data.qtyEnding).value(),
                                    qty: 0,
                                    code: dataRaw.code,
                                    amount: 0,
                                    desc: ""
                                });
                                vm.disableLocationFrom = vm.posTransferInventoryData.length > 0 ? true : false;
                                vm.posTransferInventoryForm.itemId = "";
                                vm.posTransferInventoryForm.code = "";
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
            removeTransferInventoryDetailByIndex(index, row) {
                this.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {

                    this.posTransferInventoryData.splice(index, 1);
                    this.$message({
                        message: `លុប ${row.itemName} បានជោគជ័យ`,
                        type: 'success'
                    });
                    this.getTotal();
                    this.disableLocationFrom = this.posTransferInventoryData.length > 0 ? true : false;

                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: 'Delete canceled'
                    });
                });
            },
            updateTransferInventoryDetail(row, index) {
                if (row.qty > row.rawQty) {
                    this.$message({
                        type: 'error',
                        message: 'ស្តុកមានមិនគ្រប់គ្រាន់'
                    });
                }
                row.amount = formatCurrency(this.$_numeral(row.cost).value() * row.qty);
                this.posTransferInventoryData[index] = row;
                let newIndex = index + 1;
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
                this.posTransferInventoryData = [];
                this.posTransferInventoryForm.locationFromId = "";
                this.posTransferInventoryForm.locationToId = "";

                if (this.$refs["posTransferInventoryFormAdd"]) {
                    this.$refs["posTransferInventoryFormAdd"].resetFields();
                    this.getTotal();

                }
                if (this.$refs["posTransferInventoryFormUpdate"]) {
                    this.$refs["posTransferInventoryFormUpdate"].resetFields();
                    this.getTotal();
                }
            },
            getTotal() {
                let vm = this;
                let total = 0;
                vm.posTransferInventoryData.forEach(function (obj) {
                    total += parseFloat(vm.$_numeral(obj.amount).value());
                });

                vm.disableLocationFrom = vm.posTransferInventoryData.length > 0 ? true : false;

                let companyDoc = WB_waterBillingSetup.findOne({rolesArea: Session.get("area")});
                this.currencySymbol = getCurrencySymbolById(companyDoc.baseCurrency);
                vm.posTransferInventoryForm.total = formatCurrency(total, companyDoc.baseCurrency);

            },
            popupTransferInventoryShow(row) {
                let vm = this;
                this.dialogShowTransferInventory = true;
                $(".el-dialog__title").text(this.langConfig['show']);
                Meteor.call("queryTransferInventoryByIdShow", row._id, (err, result) => {
                    if (result) {
                        vm.posTransferInventoryShowData = result;
                    } else {
                        console.log(err.message);
                    }
                })
            }
        },
        created() {
            this.isSearching = true;
            this.queryData();
            this.getTotal();
            this.locationOpt();
            Meteor.subscribe('Pos_TransferInventoryReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['transferInventory'];
                return data;
            }
        }
    }


</script>




