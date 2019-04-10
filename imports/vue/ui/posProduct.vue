<template>
    <div class="pos_product">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddPosProduct = true,resetForm(),popUpAdd()">
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
                        :data="posProductData"
                        stripe
                        border
                        style="width: 100%">
                    <el-table-column
                            prop="code"
                            :label="langConfig['code']"
                            width="120"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="name"
                            :label="langConfig['name']"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="categoryName"
                            :label="langConfig['category']"
                            sortable>
                    </el-table-column>
                    <el-table-column
                            prop="description"
                            :label="langConfig['memo']"
                            sortable>
                    </el-table-column>
                    <!--<el-table-column
                            prop="qtyOnHand"
                            label="Qty On Hand"
                    >
                    </el-table-column>-->
                    <!--<el-table-column
                            prop="whPrice"
                            label="Whole Price"
                    >
                    </el-table-column>
                    <el-table-column
                            prop="rePrice"
                            label="Retail Price"
                    >
                    </el-table-column>
                    <el-table-column
                            prop="cost"
                            label="Cost"
                    >
                    </el-table-column>-->
                    <!--<el-table-column
                            prop="barcode"
                            label="Barcode"
                    >
                    </el-table-column>-->
                    <el-table-column
                            prop="productType"
                            :label="langConfig['productType']"
                            width="150"
                            filter-placement="bottom-end">
                        <template slot-scope="scope">
                            <el-tag
                                    :type="scope.row.productType === 'Inventory' ? 'primary' : scope.row.productType==='Service' ? 'success': scope.row.productType==='Non Inventory' ? 'warning' : 'danger'"
                                    close-transition>{{scope.row.productType}}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <!--<el-table-column
                            prop="isTaxable"
                            label="Is Taxable"
                            width="150"
                            filter-placement="bottom-end">
                        <template slot-scope="scope">
                            <el-tag
                                    :type="scope.row.isTaxable === true ? 'danger' : 'success'"
                                    close-transition>{{scope.row.isTaxable}}
                            </el-tag>
                        </template>
                    </el-table-column>-->

                    <!--<el-table-column
                            prop="description"
                            label="Memo">
                    </el-table-column>-->
                    <el-table-column
                            prop="imagePath"
                            width="120"
                            :label="langConfig['image']">
                        <template slot-scope="scope">

                            <img v-if="scope.row.imagePath" :src=scope.row.imagePath
                                 style="width: 50%!important;height: 50%!important;border-radius: 5px !important;cursor: auto"
                                 @click="handlePictureCardPreview(scope.row.imagePath)">
                        </template>
                    </el-table-column>
                    <el-table-column
                            :label="langConfig['action']"
                            width="120"
                    >
                        <template slot-scope="scope">
                            <el-button-group>
                                <el-button type="danger" class="cursor-pointer" icon="el-icon-delete" size="small"
                                           @click="removePosProduct(scope.$index,scope.row,posProductData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findPosProductById(scope),dialogUpdatePosProduct= true,popUpUpdate()"
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
                :title="langConfig['add']"
                :visible.sync="dialogAddPosProduct"
                width="50%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posProductForm" :rules="rules" :ref="refForm" label-width="120px"
                     class="posProductForm">
                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="posProductForm.name"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['khName']" prop="khName">
                    <el-input v-model="posProductForm.khName"></el-input>
                </el-form-item>


                <el-form-item :label="langConfig['category']" prop="categoryId">
                    <el-select style="display: block !important;" filterable clearable
                               v-model="posProductForm.categoryId"
                               :placeholder="langConfig['category']">
                        <el-option
                                v-for="item in categoryDataOption"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['code']" prop="code">
                            <el-input v-model="posProductForm.code"></el-input>
                        </el-form-item>
                    </el-col>
                    <!--<el-col :span="12">
                        <el-form-item :label="langConfig['qtyOnHand']" prop="qtyOnHand">
                            <el-input v-model.number="posProductForm.qtyOnHand"></el-input>
                        </el-form-item>
                    </el-col>-->
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['retailSalePrice']" prop="rePrice">
                            <el-input v-model.number="posProductForm.rePrice"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['wholeSalePrice']" prop="whPrice">
                            <el-input v-model.number="posProductForm.whPrice"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['cost']" prop="cost">
                            <el-input v-model.number="posProductForm.cost"></el-input>
                        </el-form-item>

                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['unit']" prop="unitId">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="posProductForm.unitId"
                                       :placeholder="langConfig['unit']">
                                <el-option
                                        v-for="item in unitDataOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>


                <el-form-item :label="langConfig['barcode']" prop="barcode">
                    <el-input type="text" v-model="posProductForm.barcode"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['memo']" prop="description">
                    <el-input type="textarea" v-model="posProductForm.description"></el-input>
                </el-form-item>
                <el-row>
                    <el-col :span="12">

                        <el-form-item :label="langConfig['isTaxable']" prop="isTaxable">
                            <el-switch
                                    v-model="posProductForm.isTaxable"
                                    active-color="#ff4949"
                                    inactive-color="#13ce66">
                            </el-switch>
                        </el-form-item>
                        <el-form-item :label="langConfig['minimumStock']" prop="minimumStock">
                            <el-input-number :min="0" v-model.number="posProductForm.minimumStock"></el-input-number>
                        </el-form-item>
                        <el-form-item label="">
                            <el-radio-group v-model="posProductForm.productType">
                                <el-radio-button v-for="mt in productpTypeOption" :label="mt.value" :key="mt.value">
                                    {{mt.label}}
                                </el-radio-button>
                            </el-radio-group>

                        </el-form-item>
                    </el-col>
                    <el-col :span="12">


                        <el-form-item :label="langConfig['image']" v-if="isCoffee">
                            <croppa v-model="thumbImgCroppa" id="my-file"
                                    v-loading="isloadingImage"
                                    :width="130"
                                    :height="100"
                                    :quality="1"
                                    :canvas-color="'grey'"
                                    :file-size-limit="3096000"
                                    accept=".jpg,.jpeg,.png"
                                    :loading-end="generateThumbImgUrl"
                                    placeholder="130 x 100"
                                    :placeholder-color="'black'"
                                    :placeholder-font-size="16"
                                    @image-remove="handleThumbImgRemove"
                                    @move="handleThumbImgCroppaMove"
                                    @zoom="handleThumbImgCroppaZoom"
                                    :zoom-speed="10"
                                    crossOrigin="anonymous"
                            >
                            </croppa>

                            <img :src="imgUrlUpdate" crossOrigin="anonymous"
                                 slot="initial">
                        </el-form-item>
                    </el-col>
                </el-row>

                <!--<div style="text-align: center !important;">

                </div>-->


                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddPosProduct = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="savePosProduct($event)">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdatePosProduct"
                width="50%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posProductForm" :rules="rules" :ref="refForm" label-width="120px"
                     class="posProductForm">

                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="posProductForm.name"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['khName']" prop="khName">
                    <el-input v-model="posProductForm.khName"></el-input>
                </el-form-item>


                <el-form-item :label="langConfig['category']" prop="categoryId">
                    <el-select style="display: block !important;" filterable clearable
                               v-model="posProductForm.categoryId"
                               placeholder="Sub Category Of">
                        <el-option
                                v-for="item in categoryDataOption"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['code']" prop="code">
                            <el-input v-model="posProductForm.code"></el-input>
                        </el-form-item>
                    </el-col><!--
                    <el-col :span="12">
                        <el-form-item :label="langConfig['qtyOnHand']" prop="qtyOnHand">
                            <el-input v-model.number="posProductForm.qtyOnHand"></el-input>
                        </el-form-item>
                    </el-col>-->
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['retailSalePrice']" prop="rePrice">
                            <el-input v-model.number="posProductForm.rePrice"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['wholeSalePrice']" prop="whPrice">
                            <el-input v-model.number="posProductForm.whPrice"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['cost']" prop="cost">
                            <el-input v-model.number="posProductForm.cost"></el-input>
                        </el-form-item>

                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['unit']" prop="unitId">
                            <el-select style="display: block !important;" filterable clearable
                                       v-model="posProductForm.unitId"
                                       :placeholder="langConfig['unit']">
                                <el-option
                                        v-for="item in unitDataOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        :disabled="item.disabled">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item :label="langConfig['barcode']" prop="barcode">
                    <el-input type="text" v-model="posProductForm.barcode"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['memo']" prop="description">
                    <el-input type="textarea" v-model="posProductForm.description"></el-input>
                </el-form-item>

                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="langConfig['isTaxable']" prop="isTaxable">
                            <el-switch
                                    v-model="posProductForm.isTaxable"
                                    active-color="#ff4949"
                                    inactive-color="#13ce66">
                            </el-switch>
                        </el-form-item>
                        <el-form-item :label="langConfig['minimumStock']" prop="minimumStock">
                            <el-input-number :min="0" v-model.number="posProductForm.minimumStock"></el-input-number>
                        </el-form-item>
                        <el-form-item label="">

                            <el-radio-group v-model="posProductForm.productType">
                                <el-radio-button v-for="mt in productpTypeOption" :label="mt.value" :key="mt.value">
                                    {{mt.label}}
                                </el-radio-button>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">


                        <el-form-item :label="langConfig['image']" v-if="isCoffee">
                            <croppa v-model="thumbImgCroppa" id="my-file"
                                    :width="130"
                                    :height="100"
                                    :quality="1"
                                    :canvas-color="'grey'"
                                    :file-size-limit="3096000"
                                    accept=".jpg,.jpeg,.png"
                                    :loading-end="generateThumbImgUrl"
                                    placeholder="130 x 100"
                                    :placeholder-color="'black'"
                                    :placeholder-font-size="16"
                                    @image-remove="handleThumbImgRemove"
                                    @move="handleThumbImgCroppaMove"
                                    @zoom="handleThumbImgCroppaZoom"
                                    :zoom-speed="10"
                                    crossOrigin="anonymous"
                            >
                                <img :src="imgUrlUpdate" crossOrigin="anonymous"
                                     slot="initial">
                            </croppa>
                        </el-form-item>
                    </el-col>
                </el-row>


                <!--<div style="text-align: center">

                </div>-->
                <input type="hidden" v-model="posProductForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdatePosProduct = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="updatePosProduct">{{langConfig['save']}} <i>(Ctrl + Enter)</i>
                    </el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <el-dialog :visible.sync="dialogVisible" width="30%">
            <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
    </div>
</template>
<script>
    import compoLang from '../../../both/i18n/lang/elem-label'
    import {Pos_ProductReact} from "../../collection/posProduct";
    import {Images} from "../../collection/fileImages";
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
                Pos_ProductReact.find({}).fetch();
                vm.queryData(vm.searchData, vm.skip, vm.currentSize + vm.skip);
            },
            isCoffee() {
                let ma = Manage_Module.findOne();
                if (ma && ma.feature) {
                    return (ma.feature.indexOf("Coffee") > -1 ? true : false);
                }

                return false;
            }
        },
        mounted() {
            this.$jQuery('body').off();

        },
        data() {
            return {
                newLoading: true,
                dialogImageUrl: "",
                dialogVisible: false,
                isloadingImage: false,
                thumbImgCroppa: null,
                imgUrl: "",
                imgUrlUpdate: "",
                refForm: "",
                posProductData: [],
                loading: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddPosProduct: false,
                dialogUpdatePosProduct: false,

                posProductForm: {
                    name: "",
                    khName: "",
                    code: "",
                    description: "",
                    categoryId: "",
                    productType: "Inventory",
                    isTaxable: false,
                    qtyOnHand: 0,
                    whPrice: 0,
                    rePrice: 0,
                    cost: 0,
                    _id: "",
                    minimumStock: "",
                    barcode: "",
                    unitId: ""
                },
                rules: {
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    unitId: [{required: true, message: 'Please input Unit', trigger: 'change'}],
                    categoryId: [{required: true, message: 'Please input Category', trigger: 'change'}],
                    code: [{required: true, message: 'Please input code', trigger: 'blur'}],
                },
                categoryDataOption: [],
                unitDataOption: [],
                productpTypeOption: [
                    {label: "Inventory", value: "Inventory"},
                    // {label: "Non Inventory", value: "Non Inventory"},
                    {label: "Service", value: "Service"},
                    // {label: "Bundle", value: "Bundle"}
                ],
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
            "posProductForm.categoryId"(val) {
                let vm = this;
                if (this.refForm === "posProductFormAdd") {
                    Meteor.call("getProductCodeByCateogry", val, (err, result) => {
                        if (!err) {
                            vm.posProductForm.code = result;
                        }
                    })
                }
            },
            'thumbImgCroppa.loading'(val) {
                if (!val) {
                    this.generateThumbImgUrl();
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
                Meteor.call('queryPosProduct', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.posProductData = result.content;
                        this.count = result.countPosProduct;
                    }
                    this.isSearching = false;
                    this.newLoading = false;
                });
            }, 300),

            queryCategoryDataOption() {
                let selector = {};
                let vm = this;
                Meteor.call("queryCategoryOption", selector, (err, result) => {
                    if (result) {
                        vm.categoryDataOption = result;
                    }
                })
            },
            queryUnitDataOption() {
                let selector = {};
                let vm = this;
                Meteor.call("queryPosUnitOption", selector, (err, result) => {
                    if (result) {
                        vm.unitDataOption = result;
                    }
                })
            },
            savePosProduct(event) {
                event.preventDefault();
                let vm = this;
                this.$refs["posProductFormAdd"].validate((valid) => {
                    if (valid) {

                        let imageId = "";
                        let imagePath = "";
                        if (vm.thumbImgCroppa && vm.thumbImgCroppa.hasImage() && vm.imgUrl) {
                            const upload = Images.insert({
                                file: vm.imgUrl,
                                streams: 'dynamic',
                                chunkSize: 'dynamic'
                            }, false);

                            upload.on('start', function (error, result) {
                                if (error) {
                                    console.log(error.message);
                                }
                            })

                            upload.on('end', function (error, fileObj) {
                                if (error) {
                                    console.log(error.message);
                                } else {
                                    imageId = fileObj._id;
                                    imagePath = fileObj._downloadRoute + "/" + fileObj._collectionName + "/" + fileObj._id + "/original/" + fileObj._id + fileObj.extensionWithDot;

                                    let posProductDoc = {
                                        code: vm.posProductForm.code,
                                        name: vm.posProductForm.name,
                                        khName: vm.posProductForm.khName,
                                        productType: vm.posProductForm.productType,
                                        categoryId: vm.posProductForm.categoryId,
                                        whPrice: vm.posProductForm.whPrice,
                                        rePrice: vm.posProductForm.rePrice,
                                        cost: vm.posProductForm.cost,
                                        qtyOnHand: vm.posProductForm.qtyOnHand,
                                        isTaxable: vm.posProductForm.isTaxable,
                                        description: vm.posProductForm.description,
                                        minimumStock: vm.posProductForm.minimumStock,
                                        unitId: vm.posProductForm.unitId,
                                        barcode: vm.posProductForm.barcode,
                                        imageId: imageId,
                                        imagePath: imagePath

                                    };

                                    Meteor.call("insertPosProduct", posProductDoc, (err, result) => {
                                        if (!err) {
                                            vm.$message({
                                                duration: 1000,
                                                message: `Save Successfully!`,
                                                type: 'success'
                                            });
                                            vm.dialogAddPosProduct = false;
                                            vm.queryCategoryDataOption();
                                            if (vm.$refs["posProductFormAdd"]) {
                                                vm.$refs["posProductFormAdd"].resetFields();
                                            }
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

                            upload.start();
                        } else {
                            let posProductDoc = {
                                code: vm.posProductForm.code,
                                name: vm.posProductForm.name,
                                khName: vm.posProductForm.khName,
                                productType: vm.posProductForm.productType,
                                categoryId: vm.posProductForm.categoryId,
                                whPrice: vm.posProductForm.whPrice,
                                rePrice: vm.posProductForm.rePrice,
                                cost: vm.posProductForm.cost,
                                qtyOnHand: vm.posProductForm.qtyOnHand,
                                isTaxable: vm.posProductForm.isTaxable,
                                description: vm.posProductForm.description,
                                minimumStock: vm.posProductForm.minimumStock,
                                barcode: vm.posProductForm.barcode,
                                unitId: vm.posProductForm.unitId

                            };

                            Meteor.call("insertPosProduct", posProductDoc, (err, result) => {
                                if (!err) {
                                    vm.$message({
                                        duration: 1000,
                                        message: `Save Successfully!`,
                                        type: 'success'
                                    });
                                    vm.dialogAddPosProduct = false;
                                    vm.queryCategoryDataOption();
                                    if (vm.$refs["posProductFormAdd"]) {
                                        vm.$refs["posProductFormAdd"].resetFields();
                                    }
                                } else {
                                    vm.$message({
                                        duration: 1000,
                                        message: err.message,
                                        type: 'error'
                                    });
                                }
                            })
                        }
                    }
                })

            },
            updatePosProduct() {
                let vm = this;
                this.$refs["posProductFormUpdate"].validate((valid) => {
                    if (valid) {
                        if (vm.thumbImgCroppa && vm.thumbImgCroppa.hasImage() && vm.imgUrl) {
                            const upload = Images.insert({
                                file: vm.imgUrl,
                                streams: 'dynamic',
                                chunkSize: 'dynamic'
                            }, false);

                            upload.on('start', function (error, result) {
                                if (error) {
                                    console.log(error.message);
                                }
                            })

                            upload.on('end', function (error, fileObj) {
                                if (error) {
                                    console.log(error.message);
                                } else {
                                    let imageId = fileObj._id;
                                    let imagePath = fileObj._downloadRoute + "/" + fileObj._collectionName + "/" + fileObj._id + "/original/" + fileObj._id + fileObj.extensionWithDot;

                                    let posProductDoc = {
                                        _id: vm.posProductForm._id,
                                        code: vm.posProductForm.code,
                                        name: vm.posProductForm.name,
                                        khName: vm.posProductForm.khName,
                                        productType: vm.posProductForm.productType,
                                        categoryId: vm.posProductForm.categoryId,
                                        whPrice: vm.posProductForm.whPrice,
                                        rePrice: vm.posProductForm.rePrice,
                                        cost: vm.posProductForm.cost,
                                        qtyOnHand: vm.posProductForm.qtyOnHand,
                                        isTaxable: vm.posProductForm.isTaxable,
                                        description: vm.posProductForm.description,
                                        minimumStock: vm.posProductForm.minimumStock,
                                        unitId: vm.posProductForm.unitId,
                                        barcode: vm.posProductForm.barcode,

                                        imageId: imageId,
                                        imagePath: imagePath
                                    };

                                    Meteor.call("updatePosProduct", posProductDoc, (err, result) => {
                                        if (!err) {
                                            vm.$message({
                                                duration: 1000,
                                                message: `
                        Update
                        Successfully
                        !`,
                                                type: 'success'
                                            });
                                            vm.dialogUpdatePosProduct = false;
                                            vm.queryCategoryDataOption();
                                            if (vm.$refs["posProductFormUpdate"]) {
                                                vm.$refs["posProductFormUpdate"].resetFields();
                                            }
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

                            upload.start();

                        } else {


                            let posProductDoc = {
                                _id: vm.posProductForm._id,
                                code: vm.posProductForm.code,
                                name: vm.posProductForm.name,
                                khName: vm.posProductForm.khName,
                                productType: vm.posProductForm.productType,
                                categoryId: vm.posProductForm.categoryId,
                                whPrice: vm.posProductForm.whPrice,
                                rePrice: vm.posProductForm.rePrice,
                                cost: vm.posProductForm.cost,
                                qtyOnHand: vm.posProductForm.qtyOnHand,
                                isTaxable: vm.posProductForm.isTaxable,
                                description: vm.posProductForm.description,
                                barcode: vm.posProductForm.barcode,
                                minimumStock: vm.posProductForm.minimumStock,
                                unitId: vm.posProductForm.unitId
                            };

                            Meteor.call("updatePosProduct", posProductDoc, (err, result) => {
                                if (!err) {
                                    vm.$message({
                                        duration: 1000,
                                        message: `
                        Update
                        Successfully
                        !`,
                                        type: 'success'
                                    });
                                    vm.dialogUpdatePosProduct = false;
                                    vm.queryCategoryDataOption();
                                    if (vm.$refs["posProductFormUpdate"]) {
                                        vm.$refs["posProductFormUpdate"].resetFields();
                                    }
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
                    }
                })

            },
            removePosProduct(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removePosProduct", row._id, row.imageId, (err, result) => {
                        if (!err) {
                            rows.splice(index, 1);

                            vm.$message({
                                message: `
                        លុប ${row.code} : ${row.name} បានជោគជ័យ`,
                                type: 'success'
                            });

                            vm.queryCategoryDataOption();
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
            findPosProductById(doc) {
                let vm = this;
                vm.posProductForm = {};

                Meteor.call("queryPosProductById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.posProductForm._id = result._id;
                        vm.posProductForm = result;
                        vm.imgUrlUpdate = result.imagePath || "";
                        this.queryCategoryDataOption();
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
                this.posProductForm._id = "";
                this.refForm = "";
                this.queryCategoryDataOption();
                if (this.$refs["posProductFormAdd"]) {
                    this.$refs["posProductFormAdd"].resetFields();
                }

                if (this.$refs["posProductFormUpdate"]) {
                    this.$refs["posProductFormUpdate"].resetFields();
                }

            },
            popUpAdd() {
                this.refForm = "posProductFormAdd";
            },
            popUpUpdate() {
                this.refForm = "posProductFormUpdate";
            },
            generateThumbImgUrl: function () {
                this.isloadingImage = true;
                let url = this.thumbImgCroppa && this.thumbImgCroppa.getChosenFile();
                this.isloadingImage = false;
                // let url = this.thumbImgCroppa && this.thumbImgCroppa.generateDataUrl();
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
            this.queryCategoryDataOption();
            this.queryUnitDataOption();
            this.queryData();
            Meteor.subscribe('Pos_ProductReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['product'];
                return data;
            }
        }
    }
</script>