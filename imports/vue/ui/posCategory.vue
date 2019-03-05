<template>
    <div class="pos_category">
        <div class="card card-stats">
            <div class="card-header card-header-icon" data-background-color="purple">
                <i class="material-icons"><i class="material-icons">streetview</i></i>
            </div>
            <el-row type="flex" justify="right">
                <el-col :span="8">
                    <h4>
                        <a class="cursor-pointer" @click="dialogAddPosCategory = true,resetForm()">
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
                        :data="posCategoryData"
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
                            prop="subCategoryOfName"
                            :label="langConfig['subCategoryOf']">
                    </el-table-column>
                    <el-table-column
                            prop="description"
                            :label="langConfig['memo']">
                    </el-table-column>
                    <el-table-column
                            prop="level"
                            sortable
                            width="120"
                            :label="langConfig['level']">
                    </el-table-column>
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
                                           @click="removePosCategory(scope.$index,scope.row,posCategoryData)"
                                           :disabled="disabledRemove"></el-button>
                                <el-button type="primary" icon="el-icon-edit" size="small" class="cursor-pointer"
                                           @click="findPosCategoryById(scope),dialogUpdatePosCategory= true"
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
                :visible.sync="dialogAddPosCategory"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posCategoryForm" :rules="rules" ref="posCategoryFormAdd" label-width="120px"
                     class="posCategoryForm">
                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="posCategoryForm.name"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['khName']" prop="khName">
                    <el-input v-model="posCategoryForm.khName"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['subCategoryOf']" prop="subCategoryOf">
                    <el-select style="display: block !important;" filterable clearable
                               v-model="posCategoryForm.subCategoryOf"
                               placeholder="Sub Category Of">
                        <el-option
                                v-for="item in subCategoryDataOption"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="langConfig['code']" prop="code">
                    <el-input v-model="posCategoryForm.code"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['memo']" prop="description">
                    <el-input type="textarea" v-model="posCategoryForm.description"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['image']" v-if="isCoffee">
                    <croppa v-model="thumbImgCroppa" id="my-file"
                            v-loading="isloadingImage"
                            :width="180"
                            :height="100"
                            :quality="1"
                            :canvas-color="'grey'"
                            :file-size-limit="3096000"
                            accept=".jpg,.jpeg,.png"
                            :loading-end="generateThumbImgUrl"
                            placeholder="180 x 100"
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
                <!--<input type="file" id="my-file"/>-->


                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogAddPosCategory = false, cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="savePosCategory($event)">{{langConfig['save']}} <i>(Ctrl +
                        Enter)</i></el-button>
                </el-row>
                <br>
            </el-form>
        </el-dialog>
        <!--End Form modal-->

        <!--Form Modal-->
        <el-dialog
                :title="langConfig['update']"
                :visible.sync="dialogUpdatePosCategory"
                width="30%">
            <!--<hr style="margin-top: 0px !important;border-top: 2px solid teal">-->
            <el-form :model="posCategoryForm" :rules="rules" ref="posCategoryFormUpdate" label-width="120px"
                     class="posCategoryForm">

                <el-form-item :label="langConfig['name']" prop="name">
                    <el-input v-model="posCategoryForm.name"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['khName']" prop="khName">
                    <el-input v-model="posCategoryForm.khName"></el-input>
                </el-form-item>

                <el-form-item :label="langConfig['subCategoryOf']" prop="subCategoryOf">
                    <el-select style="display: block !important;" filterable clearable
                               v-model="posCategoryForm.subCategoryOf"
                               placeholder="Sub Category Of">
                        <el-option
                                v-for="item in subCategoryDataOption"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                                :disabled="item.disabled">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item :label="langConfig['code']" prop="code">
                    <el-input v-model="posCategoryForm.code"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['memo']" prop="description">
                    <el-input type="textarea" v-model="posCategoryForm.description"></el-input>
                </el-form-item>
                <el-form-item :label="langConfig['image']" v-if="isCoffee">
                    <croppa v-model="thumbImgCroppa" id="my-file"
                            :width="180"
                            :height="100"
                            :quality="1"
                            :canvas-color="'grey'"
                            :file-size-limit="3096000"
                            accept=".jpg,.jpeg,.png"
                            :loading-end="generateThumbImgUrl"
                            placeholder="180 x 100"
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

                <input type="hidden" v-model="posCategoryForm._id"/>
                <hr style="margin-top: 0px !important;">
                <el-row class="pull-right">
                    <el-button @click="dialogUpdatePosCategory = false ,cancel()">{{langConfig['cancel']}} <i>(ESC)</i>
                    </el-button>
                    <el-button type="primary" @click="updatePosCategory">{{langConfig['save']}} <i>(Ctrl + Enter)</i>
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
    import {Pos_CategoryReact} from "../../collection/posCategory";
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
                Pos_CategoryReact.find({}).fetch();
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
                posCategoryData: [],
                loading: false,
                isloadingImage: false,
                searchData: '',
                isSearching: false,
                currentPage: 1,
                currentSize: 10,
                count: 0,
                dialogAddPosCategory: false,
                dialogUpdatePosCategory: false,

                posCategoryForm: {
                    name: "",
                    khName: "",
                    code: "",
                    subCategoryOf: "",
                    description: "",
                    _id: ""
                },
                rules: {
                    name: [{required: true, message: 'Please input name', trigger: 'blur'}],
                    code: [{required: true, message: 'Please input code', trigger: 'blur'}],
                },
                // Options
                subCategoryDataOption: [],
                skip: 0,
                thumbImgCroppa: null,
                imgUrl: "",
                imgUrlUpdate: ""
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
                Meteor.call('queryPosCategory', {
                    q: val,
                    filter: this.filter,
                    options: {skip: skip || 0, limit: limit || 10}
                }, (err, result) => {
                    if (!err) {
                        this.posCategoryData = result.content;
                        this.count = result.countPosCategory;
                    }
                    this.isSearching = false;
                    this.newLoading = false;
                });
            }, 300),
            parentPosCategoryOption() {
                let selector = {};
                Meteor.call('queryParentPosCategoryOption', selector, this.posCategoryForm._id, (err, result) => {
                    this.subCategoryDataOption = result;
                })
            },
            savePosCategory(event) {
                event.preventDefault();

                let vm = this;
                this.$refs["posCategoryFormAdd"].validate((valid) => {
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

                                        let posCategoryDoc = {
                                            code: vm.posCategoryForm.code,
                                            name: vm.posCategoryForm.name,
                                            khName: vm.posCategoryForm.khName,
                                            subCategoryOf: vm.posCategoryForm.subCategoryOf,
                                            description: vm.posCategoryForm.description,
                                            imageId: imageId,
                                            imagePath: imagePath,
                                        };
                                        Meteor.call("insertPosCategory", posCategoryDoc, (err, result) => {
                                            if (!err) {
                                                vm.$message({
                                                    duration: 1000,
                                                    message: `Save Successfully!`,
                                                    type: 'success'
                                                });
                                                vm.dialogAddPosCategory = false;
                                                vm.parentPosCategoryOption();
                                                vm.$refs["posCategoryFormAdd"].resetFields();

                                                /*if (vm.imgUrl) {
                                                    const storageRef = storagePath.fileImage(fileImage, Meteor.userId(), result, "category");
                                                    let uploadTask = storageRef
                                                        .child("fileImage")
                                                        .putString(vm.imgUrl, "data_url");
                                                    uploadTask.on(
                                                        "state_changed",
                                                        function (snapshot) {
                                                            // Observe state change events such as progress, pause, and resume
                                                            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                                                            let progress =
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
                                                            /!*setTimeout(() => {
                                                                loading.close();
                                                            }, 1000)*!/
                                                        },
                                                        function () {
                                                            uploadTask.snapshot.ref.getDownloadURL()
                                                                .then(url => {
                                                                    console.log(url);
                                                                    /!*Meteor.call('sch_updateStudentImageURlById', result, url, (err, re) => {
                                                                        if (err) {
                                                                            console.log(err.message);
                                                                        } else {
                                                                            vm.thumbImgCroppa = null;
                                                                        }
                                                                    });*!/
                                                                }).catch(err => console.log(err));
                                                        });
                                                }*/


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

                                //let fsFile = new FS.File(vm.thumbImgCroppa.getChosenFile());
                                /*vm.thumbImgCroppa.generateBlob((result) => {
                                    let reader = new FileReader();
                                    reader.onload = function (event) {
                                        let buffer = new Unit8Array(reader.result);
                                        Files.insert({data: buffer});
                                    }

                                    reader.readAsArrayBuffer(result);
                                });*/


                                /*fsFile = new FS.File(vm.thumbImgCroppa.getChosenFile());
                                console.log(fsFile);
                                CategoryImage.insert(fsFile, function (err, result) {
                                    if (err) {
                                        throw new Meteor.Error(err);
                                    } else {
                                        let imageLoc = '/cfs/files/categoryImage' + result._id;
                                        console.log(imageLoc);
                                    }
                                })*/
                                /*vm.thumbImgCroppa.generateBlob((blob) => {
                                    let fd = new FormData();
                                    fd.append('file', blob, "fileName.jpg");
                                    console.log(fd);
                                    CategoryImage.insert(fd, function (err, result) {
                                        if (err) {
                                            throw new Meteor.Error(err);
                                        } else {
                                            let imageLoc = '/cfs/files/categoryImage' + result._id;
                                            console.log(imageLoc);
                                        }
                                    })


                                })*/

                                /*fsFile = new FS.File(myfi);
                                console.log(fsFile);
                                CategoryImage.insert(fsFile, function (err, result) {
                                    if (err) {
                                        throw new Meteor.Error(err);
                                    } else {
                                        let imageLoc = '/cfs/files/categoryImage' + result._id;
                                        console.log(imageLoc);
                                    }
                                })*/


                            } else {
                                let posCategoryDoc = {
                                    code: vm.posCategoryForm.code,
                                    name: vm.posCategoryForm.name,
                                    khName: vm.posCategoryForm.khName,
                                    subCategoryOf: vm.posCategoryForm.subCategoryOf,
                                    description: vm.posCategoryForm.description
                                };
                                Meteor.call("insertPosCategory", posCategoryDoc, (err, result) => {
                                    if (!err) {
                                        vm.$message({
                                            duration: 1000,
                                            message: `Save Successfully!`,
                                            type: 'success'
                                        });
                                        vm.dialogAddPosCategory = false;
                                        vm.parentPosCategoryOption();
                                        vm.$refs["posCategoryFormAdd"].resetFields();


                                        /*if (vm.imgUrl) {
                                        const storageRef = storagePath.fileImage(fileImage, Meteor.userId(), result, "category");
                                        let uploadTask = storageRef
                                            .child("fileImage")
                                            .putString(vm.imgUrl, "data_url");
                                        uploadTask.on(
                                            "state_changed",
                                            function (snapshot) {
                                                // Observe state change events such as progress, pause, and resume
                                                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                                                let progress =
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
                                                /!*setTimeout(() => {
                                                    loading.close();
                                                }, 1000)*!/
                                            },
                                            function () {
                                                uploadTask.snapshot.ref.getDownloadURL()
                                                    .then(url => {
                                                        console.log(url);
                                                        /!*Meteor.call('sch_updateStudentImageURlById', result, url, (err, re) => {
                                                            if (err) {
                                                                console.log(err.message);
                                                            } else {
                                                                vm.thumbImgCroppa = null;
                                                            }
                                                        });*!/
                                                    }).catch(err => console.log(err));
                                            });
                                    }*/


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
                    }
                )

            },
            updatePosCategory() {
                let vm = this;
                this.$refs["posCategoryFormUpdate"].validate((valid) => {
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

                                    let posCategoryDoc = {
                                        _id: vm.posCategoryForm._id,
                                        code: vm.posCategoryForm.code,
                                        name: vm.posCategoryForm.name,
                                        khName: vm.posCategoryForm.khName,
                                        subCategoryOf: vm.posCategoryForm.subCategoryOf,
                                        description: vm.posCategoryForm.description,
                                        imageId: imageId,
                                        imagePath: imagePath
                                    };

                                    Meteor.call("updatePosCategory", posCategoryDoc, (err, result) => {
                                        if (!err) {
                                            vm.$message({
                                                duration: 1000,
                                                message: `
                        Update
                        Successfully
                        !`,
                                                type: 'success'
                                            });
                                            vm.dialogUpdatePosCategory = false;
                                            vm.parentPosCategoryOption();
                                            vm.$refs["posCategoryFormUpdate"].resetFields();
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


                            let posCategoryDoc = {
                                _id: vm.posCategoryForm._id,
                                code: vm.posCategoryForm.code,
                                name: vm.posCategoryForm.name,
                                khName: vm.posCategoryForm.khName,
                                subCategoryOf: vm.posCategoryForm.subCategoryOf,
                                description: vm.posCategoryForm.description,
                            };

                            Meteor.call("updatePosCategory", posCategoryDoc, (err, result) => {
                                if (!err) {
                                    vm.$message({
                                        duration: 1000,
                                        message: `
                        Update
                        Successfully
                        !`,
                                        type: 'success'
                                    });
                                    vm.dialogUpdatePosCategory = false;
                                    vm.parentPosCategoryOption();
                                    vm.$refs["posCategoryFormUpdate"].resetFields();
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
            removePosCategory(index, row, rows) {
                let vm = this;
                this.$confirm('This will permanently delete the Item. Continue?', 'Warning', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).then(() => {
                    Meteor.call("removePosCategory", row._id, row.imageId, (err, result) => {
                        if (!err) {
                            rows.splice(index, 1);

                            vm.$message({
                                message: `
                        លុប ${row.code} : ${row.name} បានជោគជ័យ`,
                                type: 'success'
                            });

                            vm.parentPosCategoryOption();
                        } else {
                            vm.$message({
                                type: 'error',
                                message: 'Delete Failed'
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
            findPosCategoryById(doc) {
                let vm = this;
                vm.posCategoryForm = {};

                Meteor.call("queryPosCategoryById", doc.row._id, (err, result) => {
                    if (result) {
                        vm.posCategoryForm._id = result._id;
                        if (result.subCategoryOf == undefined || result.subCategoryOf == "") {
                            result.subCategoryOf = "";
                        }
                        vm.posCategoryForm = result;
                        vm.imgUrlUpdate = result.imagePath || "";
                        this.parentPosCategoryOption();
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
                this.imgUrlUpdate = "";
                this.thumbImgCroppa = null;

                this.posCategoryForm._id = "";
                this.parentPosCategoryOption();
                if (this.$refs["posCategoryFormAdd"]) {
                    this.$refs["posCategoryFormAdd"].resetFields();
                }

                if (this.$refs["posCategoryFormUpdate"]) {
                    this.$refs["posCategoryFormUpdate"].resetFields();
                }

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
            this.parentPosCategoryOption();
            this.queryData();
            Meteor.subscribe('Pos_CategoryReact');

        },
        computed: {
            langConfig() {
                let data = compoLang.filter(config => config.lang === this.langSession)[0]['category'];
                return data;
            }
        }
    }
</script>
