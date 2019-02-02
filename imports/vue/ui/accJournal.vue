<template>
    <div class="journal">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer"
                           @click="popupJournalAdd(),dialogAddJournal = true,autoIncreseVouchers(),resetForm()">
                            <i class="fa fa-plus"></i> {{langConfig['title']}}
                        </a>
                    </h4>
                </el-col>
                <el-col :span="16" style="text-align: right; margin-right: 10px">
                    <br>
                    <el-row type="flex" justify="center">
                        <el-col :span="15">
                            <div class="block">
                               <span class="wrapper">
                                      <el-button :plain="true" type="warning" icon="arrow-up"
                                                 @click="popupJournalPayment(),dialogPaid = true,autoIncreseVouchers(),resetForm()">
                                Payment (Account)
                                         </el-button>
                                      <el-button :plain="true" icon="arrow-down"
                                                 type="success"
                                                 @click="popupJournalReceive(),dialogPaid = true,autoIncreseVouchers(),resetForm()"> Receive (Account)</el-button>
                                </span>
                            </div>
                        </el-col>
                        <el-col :span="1"></el-col>

                        <el-col :span="8">
                            <el-input
                                    placeholder="Search Here..."
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
                        <loader></loader>
                    </div>
                </div>
            </slot>
            <slot v-else>
                <el-table
                        :data="journalDataDisplay"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="journalDateName"
                            label="Journal Date"
                            sortable
                            width="180">
                    </el-table-column>
                    <el-table-column
                            prop="voucherId"
                            label="Voucher"
                            sortable
                            width="180">
                    </el-table-column>
                    <el-table-column
                            prop="total"
                            label="Total">
                    </el-table-column>
                    <el-table-column
                            prop="currencyId"
                            sortable
                            label="Currency"
                            width="140"
                    >
                    </el-table-column>
                    <el-table-column
                            prop="memo"
                            sortable
                            label="Description">
                    </el-table-column>
                    <el-table-column
                            prop="name"
                            sortable
                            label="Name">
                    </el-table-column>

                    <el-table-column
                            prop="status"
                            label="Status"
                            width="150"
                            filter-placement="bottom-end">
                        <template slot-scope="scope">
                            <el-tag
                                    :type="scope.row.status === 'Normal' ? 'primary' : 'success'"
                                    close-transition>{{scope.row.status}}
                            </el-tag>
                        </template>
                    </el-table-column>

                    <el-table-column
                            label="Action"
                            width="200"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removeJournal(scope.$index,scope.row,journalDataDisplay)"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="popupJournalUpdate(scope.$index,scope.row,scope)"></el-button>
                                <el-button type="success" icon="el-icon-view" size="small" class="cursor-pointer"
                                           @click="popupJournalShow(scope.row)"></el-button>
                                <el-button type="info" icon="el-icon-printer" size="small" class="cursor-pointer"
                                           @click="printPaymentInvoice(scope.row._id)"></el-button>
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
                title="Add Journal Entry"
                :visible.sync="dialogAddJournal"
                :fullscreen="fullscreen"
                class="dialogJournal"


        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="journalForm" :rules="rules" ref="journalFormAdd" label-width="120px"
                     :label-position="labelPosition"
                     class="journalForm">
                <el-row :gutter="20">
                    <el-col :span="16" class="journalForm">
                        <table class="table table-responsive​​​ table-striped table-hover responstable">
                            <thead>
                            <tr>
                                <th rowspan="2" style="vertical-align: middle; text-align: center">#</th>
                                <th style="text-align: center">Account</th>
                                <th style="text-align: center">Dr</th>
                                <th style="text-align: center">Cr</th>
                                <th style="text-align: center">Action</th>
                            </tr>
                            <tr>
                                <th>
                                    <el-select style="display: block !important;"
                                               filterable clearable
                                               v-model="journalForm.account"
                                               @keyup.native.enter="addToJournalData"
                                               placeholder="Account">
                                        <el-option
                                                v-for="item in chartAccountDataOption"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                                :disabled="item.disabled">
                                        </el-option>
                                    </el-select>


                                </th>
                                <th>

                                    <div class="el-input">
                                        <input autocomplete="off" placeholder="Dr" v-model.lazy="journalForm.dr"
                                               @keyup.enter="addToJournalData()" type="text" rows="2"
                                               validateevent="true"
                                               class="el-inputDR el-input__inner">
                                    </div>
                                    <!-- <el-input placeholder="Dr" v-model.number="journalForm.dr"
                                               @keyup.native.enter="addToJournalData"></el-input>-->

                                </th>
                                <th>
                                    <div class="el-input">
                                        <input autocomplete="off" placeholder="Cr" v-model.lazy="journalForm.cr"
                                               @keyup.enter="addToJournalData()" type="text" rows="2"
                                               validateevent="true"
                                               class="el-inputCR el-input__inner">
                                    </div>
                                    <!--<el-input placeholder="Cr" v-model.number="journalForm.cr"
                                              @keyup.native.enter="addToJournalData"></el-input>-->
                                </th>
                                <th style="text-align: center">
                                    <el-button type="success" icon="el-icon-circle-plus" size="small"
                                               @click="addToJournalData"></el-button>
                                </th>
                            </tr>
                            </thead>
                            <draggable v-model="journalData" :element="'tbody'">
                                <tr v-for="(journalDoc,index ) in this.journalData" :key="index">
                                    <td>{{index + 1}}</td>
                                    <td>{{journalDoc.accountName}}</td>
                                    <td>
                                        <el-input placeholder="Please input Dr" v-model.number=journalDoc.dr
                                                  type="number"
                                                  @keyup.native="updateJournalDetail(journalDoc, index)"
                                                  @change="updateJournalDetail(journalDoc, index)"></el-input>
                                    </td>
                                    <td>
                                        <el-input placeholder="Please input Cr" v-model.number=journalDoc.cr
                                                  type="number"
                                                  @keyup.native="updateJournalDetail(journalDoc, index)"
                                                  @change="updateJournalDetail(journalDoc, index)"></el-input>
                                    </td>
                                    <!--<td>
                                        <el-input placeholder="Please input Cr" :value=journalDoc.cr></el-input>
                                    </td>-->
                                    <td style="text-align: center">
                                        <el-button type="danger" icon="el-icon-remove" size="small"
                                                   @click="removeJournalDetailByIndex(index,journalDoc)"></el-button>
                                    </td>
                                </tr>
                            </draggable>
                            <thead>
                            <tr>
                                <th colspan="2" style="text-align: right">Total :</th>
                                <th>
                                    <el-input placeholder="Cr" v-model="journalForm.totalDr"
                                              :disabled="true"></el-input>
                                </th>
                                <th>
                                    <el-input placeholder="Cr" v-model="journalForm.totalCr"
                                              :disabled="true"></el-input>
                                </th>
                                <th></th>
                            </tr>
                            </thead>
                        </table>
                    </el-col>
                    <el-col :span="8">
                        <div class="w3-code">
                            <el-row>
                                <el-col :span="12">
                                    <el-form-item label="Journal Date" prop="journalDate">
                                        <el-date-picker
                                                v-model="journalForm.journalDate"
                                                type="date"
                                                style="width: 100%;"
                                                placeholder="Pick a day"
                                                :picker-options="options"
                                                :disabled="disabledDate"
                                        >
                                        </el-date-picker>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="Currency" prop="currencyId">
                                        <el-select v-model="journalForm.currencyId" placeholder="please select currency"
                                                   style="width: 100%">
                                            <el-option label="KHR" value="KHR"></el-option>
                                            <el-option label="USD" value="USD"></el-option>
                                            <el-option label="THB" value="THB"></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-form-item label="Journal No" prop="voucherId">
                                <el-input v-model="journalForm.voucherId" icon="el-icon-edit"></el-input>
                            </el-form-item>
                            <el-form-item label="Name">
                                <el-input v-model="journalForm.name"></el-input>
                            </el-form-item>
                            <el-form-item label="Memo" prop="memo">
                                <el-input type="textarea" v-model="journalForm.memo" :rows="4"></el-input>
                            </el-form-item>
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
                        <el-button type="danger" @click.native="dialogAddJournal = false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;​Cancel <i>(ESC)</i></el-button>
                    </el-col>
                    <el-col :span="12" class="pull-right">
                        <el-button type="success" @click="saveJournal(false,$event)"><i
                                class="el-icon-circle-check"> </i>&nbsp; Save and New <i>(Ctl + Alt + Enter)</i></el-button>

                        <el-button type="primary" @click.native="saveJournal(true,$event)"><i
                                class="el-icon-check"> </i>&nbsp; Save <i>(Ctl + Enter)</i></el-button>

                    </el-col>
                </el-row>
            </span>
        </el-dialog>
        <!--End Form modal-->


        <!--Form Modal-->
        <el-dialog
                title="Payment (Account)"
                :visible.sync="dialogPaid"
                :fullscreen="fullscreen"

                class="dialogJournal"

        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="journalForm" :rules="rulesPayment" ref="journalFormPayment" label-width="120px"
                     :label-position="labelPosition"
                     class="journalForm">
                <el-row :gutter="20">
                    <el-col :span="16" class="journalForm">
                        <table class="table table-responsive​​​ table-striped table-hover responstable">
                            <thead>
                            <tr>
                                <th colspan="4">
                                    <el-form-item prop="method">
                                        <el-radio-group v-model="journalForm.method">
                                            <el-radio v-for="mt in methodOption" :label="mt.value" :key="mt.value"
                                                      border>
                                                {{mt.label}}
                                            </el-radio>
                                        </el-radio-group>
                                    </el-form-item>
                                </th>
                            </tr>
                            <tr>
                                <th rowspan="2" style="vertical-align: middle; text-align: center">#</th>
                                <th style="text-align: center">Chart Account</th>
                                <th style="text-align: center">Amount</th>
                                <th style="text-align: center">Action</th>
                            </tr>
                            <tr>
                                <th>
                                    <el-select style="display: block !important;"
                                               filterable clearable
                                               ref="account"
                                               v-model="journalForm.account"
                                               @keyup.native.enter="addToJournalPaymentReceiveData"
                                               placeholder="Account">
                                        <el-option
                                                v-for="item in chartAccountDataOption"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                                :disabled="item.disabled">
                                        </el-option>
                                    </el-select>

                                </th>
                                <th>

                                    <div class="el-input">
                                        <input autocomplete="off" placeholder="Dr" v-model.lazy="journalForm.amount"
                                               @keyup.enter="addToJournalPaymentReceiveData" type="text" rows="2"
                                               validateevent="true"
                                               class="el-inputAmount el-input__inner">
                                    </div>

                                </th>
                                <th style="text-align: center">
                                    <el-button type="success" icon="el-icon-circle-plus" size="small"
                                               @click="addToJournalPaymentReceiveData"></el-button>
                                </th>
                            </tr>
                            </thead>
                            <draggable v-model="journalData" :element="'tbody'">
                                <tr v-for="(journalDoc,index ) in this.journalData" :key="index">
                                    <td>{{index + 1}}</td>
                                    <td>{{journalDoc.accountName}}</td>
                                    <td>
                                        <el-input placeholder="Please input Amount"
                                                  v-model.number=journalDoc.amount
                                                  @keyup.native="updateJournalDetailPaymentReceive(journalDoc, index)"
                                                  @change="updateJournalDetailPaymentReceive(journalDoc, index)"></el-input>
                                    </td>
                                    <td style="text-align: center">
                                        <el-button type="danger" icon="el-icon-remove" size="small"
                                                   @click="removeJournalDetailByIndex(index,journalDoc)"></el-button>
                                    </td>
                                </tr>
                            </draggable>
                            <thead>
                            <tr>
                                <th colspan="2" style="text-align: right">Total :</th>
                                <th>
                                    <el-input placeholder="Amount" v-model="journalForm.totalAmount"
                                              :disabled="true"></el-input>
                                </th>
                                <th></th>
                            </tr>
                            </thead>
                        </table>
                    </el-col>
                    <el-col :span="8">
                        <div class="w3-code">
                            <el-row>
                                <el-col :span="12">
                                    <el-form-item label="Journal Date" prop="journalDate">
                                        <el-date-picker
                                                v-model="journalForm.journalDate"
                                                type="date"
                                                style="width: 100%;"
                                                placeholder="Pick a day"
                                                :picker-options="options"
                                                :disabled="disabledDate"
                                        >
                                        </el-date-picker>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="Currency" prop="currencyId">
                                        <el-select v-model="journalForm.currencyId" placeholder="please select currency"
                                                   style="width: 100%">
                                            <el-option label="KHR" value="KHR"></el-option>
                                            <el-option label="USD" value="USD"></el-option>
                                            <el-option label="THB" value="THB"></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-form-item label="Journal No" prop="voucherId">
                                <el-input v-model="journalForm.voucherId" icon="el-icon-edit"></el-input>
                            </el-form-item>
                            <el-form-item label="Name">
                                <el-input v-model="journalForm.name"></el-input>
                            </el-form-item>
                            <el-form-item label="Memo" prop="memo">
                                <el-input type="textarea" v-model="journalForm.memo" :rows="4"></el-input>
                            </el-form-item>
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
                        <el-button type="danger" @click.native="dialogAddJournal = false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;​Cancel</el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">
                           <el-button type="success" @click="saveJournalPaid(true,$event,type,true)"><i
                                   class="fa fa-print"></i>&nbsp; {{langConfig['saveAndPrint']}}</el-button>

                        <el-button type="success" @click="saveJournalPaid(false,$event,type)"><i
                                class="el-icon-circle-check"> </i>&nbsp; Save and New <i>(Ctrl + Alt + Enter)</i></el-button>

                        <el-button type="primary" @click.native="saveJournalPaid(true,$event,type)"><i
                                class="el-icon-check"> </i>&nbsp; Save <i>(Ctrl + Enter)</i></el-button>
                    </el-col>
                </el-row>
            </span>
        </el-dialog>
        <!--End Form modal-->


        <!--Form Modal-->
        <el-dialog
                title="Update Journal Entry"
                :visible.sync="dialogUpdateJournal"
                :fullscreen="fullscreen"
                class="dialogJournal"
        >
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="journalForm" :rules="rules" ref="journalFormUpdate" label-width="120px"
                     :label-position="labelPosition"
                     class="journalForm">
                <el-row :gutter="20">
                    <el-col :span="16" class="journalForm">
                        <table class="table table-responsive​​​ table-striped table-hover responstable">
                            <thead>
                            <tr>
                                <th rowspan="2" style="vertical-align: middle; text-align: center">#</th>
                                <th style="text-align: center">Account</th>
                                <th style="text-align: center">Dr</th>
                                <th style="text-align: center">Cr</th>
                                <th style="text-align: center">Action</th>
                            </tr>
                            <tr>
                                <th>
                                    <el-select style="display: block !important;"
                                               filterable clearable
                                               v-model="journalForm.account"
                                               @keyup.native.enter="addToJournalData"
                                               placeholder="Account">
                                        <el-option
                                                v-for="item in chartAccountDataOption"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                                :disabled="item.disabled">
                                        </el-option>
                                    </el-select>


                                </th>

                                <th>

                                    <div class="el-input">
                                        <input autocomplete="off" placeholder="Dr" v-model.lazy="journalForm.dr"
                                               @keyup.enter="addToJournalData" type="text" rows="2" validateevent="true"
                                               class="el-inputDR el-input__inner">
                                    </div>
                                </th>
                                <th>
                                    <div class="el-input">
                                        <input autocomplete="off" placeholder="Cr" v-model.lazy="journalForm.cr"
                                               @keyup.enter="addToJournalData()" type="text" rows="2"
                                               validateevent="true"
                                               class="el-inputCR el-input__inner">
                                    </div>
                                </th>
                                <!-- <th>
                                     <el-input placeholder="Dr" v-model.number="journalForm.dr"
                                               @keyup.native.enter="addToJournalData"></el-input>

                                 </th>
                                 <th>
                                     <el-input placeholder="Cr" v-model.number="journalForm.cr"
                                               @keyup.native.enter="addToJournalData"></el-input>
                                 </th>-->
                                <th style="text-align: center">
                                    <el-button type="success" icon="el-icon-circle-plus" size="small"
                                               @click="addToJournalData()"></el-button>
                                </th>
                            </tr>
                            </thead>
                            <draggable v-model="journalData" :element="'tbody'">
                                <tr v-for="(journalDoc,index ) in this.journalData" :key="index">
                                    <td>{{index + 1}}</td>
                                    <td>{{journalDoc.accountName}}</td>
                                    <td>
                                        <el-input placeholder="Please input Dr" v-model.number=journalDoc.dr
                                                  @keyup.native="updateJournalDetail(journalDoc, index)"
                                                  @change="updateJournalDetail(journalDoc, index)"></el-input>
                                    </td>
                                    <td>
                                        <el-input placeholder="Please input Cr" v-model.number=journalDoc.cr
                                                  @keyup.native="updateJournalDetail(journalDoc, index)"
                                                  @change="updateJournalDetail(journalDoc, index)"></el-input>
                                    </td>
                                    <td style="text-align: center">
                                        <el-button type="danger" icon="el-icon-remove" size="small"
                                                   @click="removeJournalDetailByIndex(index,journalDoc)"></el-button>
                                    </td>
                                </tr>
                            </draggable>
                            <thead>
                            <tr>
                                <th colspan="2" style="text-align: right">Total :</th>
                                <th>
                                    <el-input placeholder="Cr" v-model="journalForm.totalDr"
                                              :disabled="true"></el-input>
                                </th>
                                <th>
                                    <el-input placeholder="Cr" v-model="journalForm.totalCr"
                                              :disabled="true"></el-input>
                                </th>
                                <th></th>
                            </tr>
                            </thead>
                        </table>
                    </el-col>
                    <el-col :span="8">
                        <div class="w3-code">
                            <el-row>
                                <el-col :span="12">
                                    <el-form-item label="Journal Date" prop="journalDate">
                                        <el-date-picker
                                                v-model="journalForm.journalDate"
                                                type="date"
                                                style="width: 100%;"
                                                placeholder="Pick a day"
                                                :picker-options="options"
                                                :disabled="disabledDate"
                                        >
                                        </el-date-picker>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="Currency" prop="currencyId">
                                        <el-select v-model="journalForm.currencyId" placeholder="please select currency"
                                                   style="width: 100%">
                                            <el-option label="KHR" value="KHR"></el-option>
                                            <el-option label="USD" value="USD"></el-option>
                                            <el-option label="THB" value="THB"></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-form-item label="Journal No" prop="voucherId">
                                <el-input v-model="journalForm.voucherId" icon="arrow-up"></el-input>
                            </el-form-item>
                            <el-form-item label="Name">
                                <el-input v-model="journalForm.name"></el-input>
                            </el-form-item>
                            <el-form-item label="Memo" prop="memo">
                                <el-input type="textarea" v-model="journalForm.memo" :rows="4"></el-input>
                            </el-form-item>
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
                        <el-button type="danger" @click="dialogUpdateJournal = false, cancel(),resetForm()"> <i
                                class="el-icon-circle-cross"> </i>&nbsp;​Cancel</el-button>
                    </el-col>
                    <el-col :span="11" class="pull-right">
                         <el-button type="primary" @click.native="updateJournal(journalId,$event)"><i
                                 class="el-icon-circle-check"> </i>&nbsp; Save</el-button>
                    </el-col>
                </el-row>
            </span>
        </el-dialog>
        <!--End Form modal-->


        <el-dialog
                title="Show Journal Entry"
                :visible.sync="dialogShowJournal"
        >
            <div class="row">
                <div class="col-md-6">
                    <label for="" style="width: 150px">Journal Id : </label>{{journalDetail._id || ""}}
                </div>
                <div class="col-md-6">
                    <label for="" style="width: 150px">Voucher : </label>{{journalDetail.voucherId || ""}}
                </div>
                <div class="col-md-6">
                    <label for="" style="width: 150px">Journal Date : </label>{{journalDetail.journalDateName || ""}}
                </div>
                <div class="col-md-6">
                    <label for="" style="width: 150px">Currency : </label>{{journalDetail.currencyId || ""}}
                </div>

                <div class="col-md-6">
                    <label for="" style="width: 150px">Memo : </label>{{journalDetail.memo || ""}}
                </div>
                <div class="col-md-6">
                    <label for="" style="width: 150px">Name : </label>{{journalDetail.name || ""}}
                </div>
            </div>
            <br>
            <el-table
                    :data="journalDetail.transaction"
                    style="width: 100%"
                    border
            >
                <el-table-column
                        prop="accountDoc.code"
                        label="Code"
                        width="125"
                >
                </el-table-column>
                <el-table-column
                        prop="accountDoc.name"
                        label="Name"
                >
                </el-table-column>
                <el-table-column
                        prop="dr"
                        label="Dr"
                        width="180"

                >
                </el-table-column>

                <el-table-column
                        prop="cr"
                        label="Cr"
                        width="180"
                >
                </el-table-column>
                <el-table-column
                        prop="drcr"
                        label="Dr-Cr"
                        width="180"
                >
                </el-table-column>
            </el-table>

        </el-dialog>
    </div>
</template>

<!--<script src="cleave-phone.{country}.js"></script>-->
<script>
    import draggable from 'vuedraggable';
    import compoLang from '../../../both/i18n/lang/elem-label-acc'
    import {Acc_JournalReact} from "../../collection/accJournal";

    // require('cleave.js/dist/addons/cleave-phone.ac');
    // require('cleave.js/dist/addons/cleave-phone.{country}');

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
                Acc_JournalReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            }
        },

        components: {
            draggable
        },
        data() {
            return {
                fullscreen: true,
                journalData: [],
                journalDataDisplay: [],
                multipleSelection: [],
                journalId: "",
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddJournal: false,
                dialogUpdateJournal: false,
                dialogShowJournal: false,
                dialogPaid: false,


                journalForm: {
                    account: "",
                    dr: 0,
                    cr: 0,
                    journalDate: moment().toDate(),
                    currencyId: "KHR",
                    voucherId: "",
                    name: "",
                    memo: "",
                    totalDr: 0,
                    totalCr: 0,
                    totalAmount: 0,
                    amount: 0,
                    method: ""

                },
                rules: {
                    journalDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input Journal Date',
                        trigger: 'blur'
                    }],
                    currencyId: [{required: true, type: 'string', message: 'Please input Currency', trigger: 'blur'}],
                    voucherId: [{required: true, type: 'string', message: 'Please input Journal No', trigger: 'blur'}],
                    memo: [{required: true, type: 'string', message: 'Please input Memo', trigger: 'blur'}],
                },
                rulesPayment: {
                    journalDate: [{
                        type: 'date',
                        required: true,
                        message: 'Please input Journal Date',
                        trigger: 'blur'
                    }],
                    currencyId: [{required: true, type: 'string', message: 'Please input Currency', trigger: 'blur'}],
                    method: [{required: true, type: 'string', message: 'Please input Cash Method', trigger: 'blur'}],
                    voucherId: [{required: true, type: 'string', message: 'Please input Journal No', trigger: 'blur'}],
                    memo: [{required: true, type: 'string', message: 'Please input Memo', trigger: 'blur'}],
                },

                // Options
                chartAccountDataOption: [],

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
                methodOption: [],
                type: "",
                journalDetail: {},
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
            }


            let elem = this.$jQuery('el-dialog.dialogJournal');
            let checkEvent = $._data($('body').get(0), 'events');
            if (checkEvent.keyup.length <= 1) {
                this.$nextTick(() => {
                    this.$jQuery('body').on('keydown', elem, this.inputHandler);

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
            "journalForm.journalDate"(val) {
                let vm = this;
                if (vm.dialogUpdateJournal == false) {
                    vm.journalForm.journalDate = val;
                    vm.autoIncreseVouchers(val);
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
            "journalForm.currencyId"(val) {
                if (this.dialogUpdateJournal == false) {
                    this.journalForm.currencyId = val;
                    this.autoIncreseVouchers();
                }
            },
            dialogAddJournal(val) {
                if (val) {
                    this._inputMaskJournal();
                }
            },
            dialogUpdateJournal(val) {
                if (val) {
                    this._inputMaskJournal();
                }
            },
            "journalForm.account"(val) {
                if (val) {
                    this._inputMaskJournal();
                }
            },
            "journalForm.dr"(val) {
                if (val) {
                    this.journalForm.cr = 0;
                }
            },
            "journalForm.cr"(val) {
                if (val) {
                    this.journalForm.dr = 0;
                }
            },
            "journalForm.method"(val) {
                if (val) {
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
            _inputMaskJournal() {
                setTimeout(() => {
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


                }, 200)
            },
            queryData: _.debounce(function (val, skip, limit) {
                Meteor.call('queryJournal', {
                    q: val,
                    filter: this.filter,
                    rolesArea:Session.get('area'),
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.journalDataDisplay = result.content;
                        this.count = result.countJournal;
                    }
                    this.isSearching = false;
                });
            }, 300),

            inputHandler(e) {
                if (e.data.init(0).selector === "el-dialog.dialogJournal") {
                    let vm = this;
                    if (vm.dialogAddJournal === true) {
                        if (e.keyCode === 13 && e.ctrlKey && !e.altKey) {
                            e.preventDefault();
                            vm.saveJournal(true, e);
                        } else if (e.keyCode === 13 && e.ctrlKey && e.altKey) {
                            e.preventDefault();
                            vm.saveJournal(false, e);
                        }
                    } else if (vm.dialogPaid === true) {
                        if (e.keyCode === 13 && e.ctrlKey && !e.altKey) {
                            e.preventDefault();
                            vm.saveJournalPaid(true, e, vm.type);
                        } else if (e.keyCode === 13 && e.ctrlKey && e.altKey) {
                            e.preventDefault();
                            vm.saveJournalPaid(false, e, vm.type);

                        }
                    }

                    if (vm.dialogAddJournal === false && vm.dialogUpdateJournal === false && vm.dialogPaid === false) {
                        if (e.keyCode === 107 && !e.ctrlKey && !e.altKey) {
                            e.preventDefault();
                            vm.popupJournalAdd();
                            vm.dialogAddJournal = true;
                            vm.autoIncreseVouchers();
                            vm.resetForm();
                        }
                    }
                    if (e.keyCode === 27 && !e.ctrlKey && !e.altKey) {
                        e.preventDefault();
                        vm.dialogAddJournal = false;
                    }
                }


            },
            chartAccountOption() {
                let selector = {};
                if (this.accountTypeId !== "" && this.accountTypeId !== undefined) {
                    selector.accountTypeId = this.accountTypeId;
                }

                Meteor.call('queryChartAccountOption', selector, (err, result) => {
                    this.chartAccountDataOption = result;
                })
            },
            chartAccountMethodOption() {
                let selector = {};
                if (this.accountTypeId !== "" && this.accountTypeId !== undefined) {
                    selector.accountTypeId = this.accountTypeId;
                }
                Meteor.call('queryChartAccountMethodOption', selector, (err, result) => {
                    this.methodOption = result;
                })
            },
            saveJournal(isCloseDialog, event) {
                event.preventDefault();
                let vm = this;
                let checkSubmit = this.checkDrCr();
                if (checkSubmit === false || vm.journalData.length === 0) {
                    vm.$notify.error({
                        title: 'Error',
                        message: 'Dr and Cr is not balance!'

                    });

                    return false;
                } else {
                    this.$refs["journalFormAdd"].validate((valid) => {
                        if (valid) {
                            let journalDoc = {
                                journalDate: vm.journalForm.journalDate,
                                journalDateName: moment(vm.journalForm.journalDate).format("DD/MM/YYYY"),
                                voucherId: vm.journalForm.voucherId,
                                currencyId: vm.journalForm.currencyId,
                                name: vm.journalForm.name,
                                memo: vm.journalForm.memo,
                                total: vm.$_numeral(vm.journalForm.totalDr).value(),
                                rolesArea: Session.get('area')
                            };
                            journalDoc.transaction = vm.journalData;
                            Meteor.call("insertJournal", journalDoc, (err, result) => {
                                if (!err) {
                                    vm.$message({
                                        duration: 1000,
                                        message: `Save Successfully!`,
                                        type: 'success'
                                    });

                                    if (isCloseDialog) {
                                        this.dialogAddJournal = false;
                                    }
                                    vm.resetForm();
                                }
                            })
                        }
                    })
                }


            },
            saveJournalPaid(isCloseDialog, event, type, isPrint) {
                event.preventDefault();
                let vm = this;
                this.$refs["journalFormPayment"].validate((valid) => {
                    if (valid) {
                        let journalDoc = {
                            journalDate: vm.journalForm.journalDate,
                            journalDateName: moment(vm.journalForm.journalDate).format("DD/MM/YYYY"),
                            voucherId: vm.journalForm.voucherId,
                            currencyId: vm.journalForm.currencyId,
                            name: vm.journalForm.name,
                            memo: vm.journalForm.memo,
                            total: vm.$_numeral(vm.journalForm.totalAmount).value(),
                            rolesArea: Session.get('area'),
                            method: vm.journalForm.method
                        };
                        journalDoc.transaction = vm.journalData;
                        if (journalDoc.transaction.length <= 0) {
                            vm.$message({
                                duration: 1000,
                                message: `Add Payment Account!`,
                                type: 'error'
                            });
                            return false;
                        }

                        Meteor.call("insertJournalPaid", journalDoc, type, (err, result) => {
                            if (!err) {
                                if (isPrint === true) {
                                    FlowRouter.go('/acc-data/accPayment/print?inv=' + result);

                                } else {
                                    vm.$message({
                                        duration: 1000,
                                        message: `Save Successfully!`,
                                        type: 'success'
                                    });

                                }

                                if (isCloseDialog) {
                                    this.dialogPaid = false;
                                }
                                vm.resetForm();
                            }
                        })
                    }
                })


            },
            printPaymentInvoice(journalId) {
                FlowRouter.go('/acc-data/accPayment/print?inv=' + journalId);
            },
            updateJournal(id) {
                event.preventDefault();
                let vm = this;
                let checkSubmit = vm.checkDrCr();
                if (checkSubmit === false || vm.journalData.length === 0) {
                    vm.$notify.error({
                        title: 'Error',
                        message: 'Dr and Cr is not balance!'
                    });
                    return false;
                } else {
                    vm.$refs["journalFormUpdate"].validate((valid) => {
                        if (valid) {
                            let journalDoc = {
                                journalDate: vm.journalForm.journalDate,
                                journalDateName: moment(vm.journalForm.journalDate).format("DD/MM/YYYY"),
                                voucherId: vm.journalForm.voucherId,
                                currencyId: vm.journalForm.currencyId,
                                name: vm.journalForm.name,
                                memo: vm.journalForm.memo,
                                total: vm.$_numeral(vm.journalForm.totalDr).value(),
                                rolesArea: Session.get('area')
                            };
                            journalDoc.transaction = vm.journalData;
                            Meteor.call("updateJournal", journalDoc, id, (err, result) => {
                                if (!err) {
                                    vm.$message({
                                        duration: 1000,
                                        message: `Save Successfully!`,
                                        type: 'success'
                                    });

                                    vm.dialogUpdateJournal = false;

                                    vm.resetForm();
                                }
                            })
                        }
                    })
                }

            },
            removeJournal(index, row, rows) {
                let vm = this;
                if (row.status == "Normal") {
                    Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                        if (re == undefined || re.closeDate.getTime() < row.journalDate.getTime()) {
                            vm.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                                confirmButtonText: 'OK',
                                cancelButtonText: 'Cancel',
                                type: 'warning'
                            }).then(() => {


                                Meteor.call("removeJournal", row._id, (err, result) => {
                                    if (!err) {
                                        rows.splice(index, 1);
                                        vm.$message({
                                            message: `លុប ${row.journalDateName}​ : ${row.voucherId} បានជោគជ័យ`,
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
                                vm.$message({
                                    type: 'info',
                                    message: 'Delete canceled'
                                });
                            });
                        } else {
                            vm.$message({
                                duration: 1000,
                                message: "You already Closing Entry!!",
                                type: 'error'
                            });
                        }
                    })
                } else {
                    vm.$message({
                        duration: 1000,
                        message: "Not Normal State!!",
                        type: 'error'
                    });
                }


            },
            popupJournalAdd() {
                let vm = this;
                $(".el-dialog__title").text("Add Journal Entry");
                Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                    if (re != undefined) {
                        vm.closeDate = re.closeDate;
                    } else {
                        vm.closeDate = "";
                    }
                })
            },
            popupJournalPayment() {
                let vm = this;
                vm.type = "Payment";
                // $('#dialog').attr('title', 'New Title').dialog();

                $(".el-dialog__title").text("Payment (Account)");
                vm.journalForm.method = "";

                Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                    if (re != undefined) {
                        vm.closeDate = re.closeDate;
                    } else {
                        vm.closeDate = "";
                    }
                })
            },
            popupJournalReceive() {
                let vm = this;
                vm.type = "Receive";
                vm.journalForm.method = "";

                // $('#dialog').attr('title', 'New Title').dialog();
                $(".el-dialog__title").text("Receive (Account)");

                Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                    if (re !== undefined) {
                        vm.closeDate = re.closeDate;
                    } else {
                        vm.closeDate = "";
                    }
                })
            },
            popupJournalUpdate(index, row, scope) {
                let vm = this;
                $(".el-dialog__title").text("Update Journal Entry");
                if (row.status === "Normal") {
                    Meteor.call("queryLastClosingEntry", Session.get("area"), function (err, re) {
                        if (re === undefined || re.closeDate.getTime() < row.journalDate.getTime()) {
                            vm.dialogUpdateJournal = true;
                            vm.findJournalById(scope);
                            if (re !== undefined) {
                                vm.closeDate = re.closeDate;
                            } else {
                                vm.closeDate = "";
                            }

                        } else {
                            vm.$message({
                                duration: 1000,
                                message: "You already Closing Entry!!",
                                type: 'error'
                            });
                            vm.dialogUpdateJournal = false;
                            vm.closeDate = "";
                        }
                    })
                } else {
                    vm.closeDate = "";
                    this.$message({
                        duration: 1000,
                        message: "Not Normal State!!",
                        type: 'error'
                    });
                }
            },
            popupJournalShow(row) {
                let vm = this;
                this.dialogShowJournal = true;
                $(".el-dialog__title").text("Show Journal Entry");
                Meteor.call("queryJournalByIdShow", row._id, (err, result) => {
                    if (result) {
                        vm.journalDetail = result;
                    } else {
                        console.log(err.message);
                    }
                })
            },
            findJournalById(doc) {
                let vm = this;
                this.journalId = doc.row._id;

                Meteor.call("queryJournalById", doc.row._id, (err, result) => {
                    vm.journalData = [];
                    if (result) {
                        result.transaction.forEach(function (obj) {
                            Meteor.call("queryChartAccountById", obj.account, (err, data) => {
                                vm.journalData.push({
                                    account: obj.account,
                                    accountName: data.code + " : " + data.name,
                                    dr: obj.dr,
                                    cr: obj.cr
                                })

                                vm.getTotalDrCr();
                            })
                        });
                        vm.journalForm.journalDate = result.journalDate;
                        vm.journalForm.currencyId = result.currencyId;
                        vm.journalForm.memo = result.memo;
                        vm.journalForm.name = result.name;
                        vm.journalForm.voucherId = result.voucherId.substr(8, 20);
                    }
                })

            },
            addToJournalData() {
                let vm = this;
                if (vm.journalForm.account == "" || vm.journalForm.account == undefined) {
                    this.$message({
                        duration: 1000,
                        message: "Account Can't Empty!!",
                        type: 'error'
                    });
                    return false;
                }

                Meteor.call("queryChartAccountById", vm.journalForm.account, (err, data) => {
                    if (data) {
                        vm.journalData.push({
                            account: vm.journalForm.account,
                            accountName: data.code + " : " + data.name,
                            dr: vm.$_numeral(vm.journalForm.dr).value(),
                            cr: vm.$_numeral(vm.journalForm.cr).value()
                        })
                        vm.journalForm.account = "";

                        vm.$message({
                            duration: 1000,
                            message: `បន្ថែម ` + data.code + " : " + data.name + " បានជោគជ័យ !",
                            type: 'success'
                        });
                        vm.getTotalDrCr();
                    } else {
                        vm.$message({
                            duration: 1000,
                            message: "មិនមានឈ្មេាះគណនីនេះឡើយ!!",
                            type: 'error'
                        });
                    }
                })


            },
            addToJournalPaymentReceiveData() {

                let vm = this;
                if (vm.journalForm.account == "" || vm.journalForm.account == undefined) {
                    this.$message({
                        duration: 1000,
                        message: "Account Can't Empty!!",
                        type: 'error'
                    });
                    return false;
                }
                Meteor.call("queryChartAccountById", vm.journalForm.account, (err, data) => {
                    if (data) {
                        vm.journalData.push({
                            account: vm.journalForm.account,
                            accountName: data.code + " : " + data.name,
                            amount: vm.$_numeral(vm.journalForm.amount).value(),
                        })
                        vm.journalForm.account = "";

                        vm.$message({
                            duration: 1000,
                            message: `បន្ថែម ` + data.code + " : " + data.name + " បានជោគជ័យ !",
                            type: 'success'
                        });
                        vm.getTotalAmount();
                    } else {
                        vm.$message({
                            duration: 1000,
                            message: "មិនមានឈ្មេាះគណនីនេះឡើយ!!",
                            type: 'error'
                        });
                    }


                })
            },
            removeJournalDetailByIndex(index, row) {
                this.$confirm('This will permanently delete the file. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {

                    this.journalData.splice(index, 1);
                    this.$message({
                        message: `លុប ${row.accountName} បានជោគជ័យ`,
                        type: 'success'
                    });
                    this.getTotalDrCr();

                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: 'Delete canceled'
                    });
                });
            },
            updateJournalDetail(row, index) {
                this.journalData[index] = row;
                let newIndex = index + 1;
                /*this.$message({
                    duration: 1000,
                    message: `Update Row Number ` + newIndex + " Successfully !",
                    type: 'success'
                });*/
                this.getTotalDrCr();

            },
            updateJournalDetailPaymentReceive(row, index) {
                this.journalData[index] = row;
                let newIndex = index + 1;
                /*this.$message({
                    duration: 1000,
                    message: `Update Row Number ` + newIndex + " Successfully !",
                    type: 'success'
                });*/
                this.getTotalAmount();

            },
            cancel() {
                this.$message({
                    type: 'info',
                    message: 'Canceled'
                });
            },
            resetForm() {
                this.journalData = [];
                this.journalForm.method = "";
                if (this.$refs["journalFormAdd"]) {
                    this.$refs["journalFormAdd"].resetFields();
                    this.getTotalDrCr();

                }
                if (this.$refs["journalFormUpdate"]) {
                    this.$refs["journalFormUpdate"].resetFields();
                    this.getTotalDrCr();
                }
                if (this.$refs["journalFormPayment"]) {
                    this.$refs["journalFormPayment"].resetFields();
                    this.getTotalAmount();
                }
                this.journalForm.name = "";
                this.autoIncreseVouchers();
            },
            getTotalDrCr() {
                let vm = this;
                let totalDr = 0;
                let totalCr = 0;
                vm.journalData.forEach(function (obj) {
                    totalDr += parseFloat(obj.dr);
                    totalCr += parseFloat(obj.cr);
                });
                vm.journalForm.totalDr = this.$_numeral(totalDr).format("0,00.000");
                vm.journalForm.totalCr = this.$_numeral(totalCr).format("0,00.000");
                vm.setFormInputDrCr();
            },
            getTotalAmount() {
                let vm = this;
                let totalAmount = 0;

                vm.journalData.forEach(function (obj) {
                    totalAmount += parseFloat(obj.amount);
                });

                vm.journalForm.totalAmount = this.$_numeral(totalAmount).format("0,00.000");
                vm.setFormInputAmount();
            },
            setFormInputDrCr() {
                this.journalForm.dr = parseFloat(this.$_numeral(this.journalForm.totalDr).value()) - parseFloat(this.$_numeral(this.journalForm.totalCr).value()) > 0 ? 0 : -(parseFloat(this.$_numeral(this.journalForm.totalDr).value()) - parseFloat(this.$_numeral(this.journalForm.totalCr).value()));
                this.journalForm.cr = parseFloat(this.$_numeral(this.journalForm.totalDr).value()) - parseFloat(this.$_numeral(this.journalForm.totalCr).value()) > 0 ? (parseFloat(this.$_numeral(this.journalForm.totalDr).value()) - parseFloat(this.$_numeral(this.journalForm.totalCr).value())) : 0;
                this._inputMaskJournal();
            },
            setFormInputAmount() {
                let vm = this;
                vm.journalForm.amount = 0;
                vm._inputMaskJournal();
            },
            checkDrCr() {
                let vm = this;
                if (vm.$_numeral(vm.journalForm.totalDr).value() === vm.$_numeral(vm.journalForm.totalCr).value()) {
                    return true;
                }
                return false;
            },
            autoIncreseVouchers(val) {
                let vm = this;
                if (val) {
                    vm.journalForm.journalDate = val;
                }
                Meteor.call("autoIncreseVoucher", Session.get('area'), vm.journalForm.journalDate, vm.journalForm.currencyId, (err, result) => {
                    if (!err) {
                        vm.journalForm.voucherId = (parseInt(result) + 1).toString();
                    }
                })
            }
        },
        created() {
            this.isSearching = true;
            this.chartAccountOption();
            this.chartAccountMethodOption();
            this.queryData();
            Meteor.subscribe('Acc_JournalReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['journal'];
                return data;
            }
        }
    }


</script>




