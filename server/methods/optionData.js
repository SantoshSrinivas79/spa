import {Acc_ChartAccount} from '../../imports/collection/accChartAccount';
import {Pos_Category} from '../../imports/collection/posCategory';
import {Acc_AccountType} from '../../imports/collection/accAccountType';
import {Pos_Term} from '../../imports/collection/posTerm';
import {Pos_Vendor} from '../../imports/collection/posVendor';
import {Pos_Product} from '../../imports/collection/posProduct';
import {Pos_Customer} from '../../imports/collection/posCustomer';
import {Pos_Location} from '../../imports/collection/posLocation';
import {Pos_Unit} from '../../imports/collection/posUnit';

import {SpaceChar} from "../../both/config.js/space"
import {Sch_Level} from "../../imports/collection/schLevel";
import {Sch_Program} from "../../imports/collection/schProgram";
import {Sch_Subject} from "../../imports/collection/schSubject";
import {Sch_Ciriculumn} from "../../imports/collection/schCiriculumn";
import {Sch_Teacher} from "../../imports/collection/schTeacher";
import {Sch_Student} from "../../imports/collection/schStudent";
import {Sch_Promotion} from "../../imports/collection/schPromotion";
import {Sch_Class} from "../../imports/collection/schClass";
import {Sch_Major} from "../../imports/collection/schMajor";
import {Sch_Faculty} from "../../imports/collection/schFaculty";
import {Sch_ClassTable} from "../../imports/collection/schClassTable";
import {Sch_Time} from "../../imports/collection/schTime";
import {Sch_Bus} from "../../imports/collection/schBus";
import {Sch_BusStop} from "../../imports/collection/schBusStop";
import {Sch_BusRegister} from "../../imports/collection/schBusRegister";
import {Sch_Position} from "../../imports/collection/schPosition";
import {Sch_Activity} from "../../imports/collection/schActivity";
import {Pos_Production} from "../../imports/collection/posProduction";
import {Pos_TableLocation} from "../../imports/collection/posTableLocation";
import {Pos_Table} from "../../imports/collection/posTable";
import {Loan_Penalty} from "../../imports/collection/loanPenalty";
import {Loan_PenaltyClosing} from "../../imports/collection/loanPenaltyClosing";
import {Loan_CreditOfficer} from "../../imports/collection/loanCreditOfficer";
import {Loan_Product} from "../../imports/collection/loanProduct";
import {Loan_Disbursement} from "../../imports/collection/loanDisbursement";
import {formatCurrency} from "../../imports/api/methods/roundCurrency";

Meteor.methods({

    queryLoanPenaltyOption(selector) {
        let list = [];

        Loan_Penalty.find(selector).fetch().forEach(function (obj) {
            list.push({label: obj.name, value: obj._id});
        });
        return list;
    }
    , queryLoanPenaltyClosingOption(selector) {
        let list = [];

        Loan_PenaltyClosing.find(selector).fetch().forEach(function (obj) {
            list.push({label: obj.name, value: obj._id});
        });
        return list;
    }
    ,
    querySchStudentOption(q) {
        let selector = {};
        if (q !== "") {
            q = q.replace(/[/\\]/g, '');
            let reg = new RegExp(q, 'mi');
            selector.$or = [
                {"personal.name": {$regex: reg}},
                {_id: q}
            ];
        }
        return Sch_Student.find(selector, {limit: 300}).fetch().map(obj => ({
            label: (obj.personal && obj.personal.name || "") + " ( " + (obj.personal && obj.personal.dobName || "") + ")",
            value: obj._id
        }));
    },
    querySchBusRegisterOption(q) {
        let selector = {};
        selector.status = "Active";
        if (q !== "") {
            q = q.replace(/[/\\]/g, '');
            let reg = new RegExp(q, 'mi');
            let studentList = Sch_Student.find({"personal.name": {$regex: reg}}, {limit: 300}).fetch().map(function (obj) {
                return obj._id;
            });
            selector.$or = [
                {studentId: {$in: studentList}},
                {_id: q}
            ];
        }

        return Sch_BusRegister.aggregate([
            {$match: selector},
            {$limit: 300},
            {
                $lookup: {
                    from: 'sch_student',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'studentDoc'
                }
            },
            {
                $unwind: {
                    path: "$studentDoc",
                    preserveNullAndEmptyArrays: true
                }
            }

        ]).map(obj => ({
            label: (obj.studentDoc.personal && obj.studentDoc.personal.name || "") + " ( " + (obj.studentDoc.personal && obj.studentDoc.personal.dobName || "") + ")",
            value: obj._id
        }));
    },
    queryStudentOptionByClass(classId) {
        let list = [];

        let studentList = Sch_ClassTable.aggregate([
            {$match: {classId: classId}},
            {
                $unwind: {
                    path: "$studentList",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'sch_student',
                    localField: 'studentList.studentId',
                    foreignField: '_id',
                    as: 'studentDoc'
                }
            },
            {
                $unwind: {
                    path: "$studentDoc",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]);
        studentList.forEach((obj) => {
            if (obj && obj.studentDoc) {
                list.push({
                    label: (obj.studentDoc && obj.studentDoc.personal && obj.studentDoc.personal.name || "") + " ( " + (obj.studentDoc && obj.studentDoc.personal && obj.studentDoc.personal.dobName || "") + ")",
                    value: obj.studentDoc._id
                });
            }
        });
        return list;
    },
    queryItemOption(q) {
        let list = [];
        let selector = {};
        if (q != "") {
            q = q.replace(/[/\\]/g, '');
            let reg = new RegExp(q, 'mi');
            selector.$or = [
                {name: {$regex: reg, $options: 'mi'}},
                {
                    code: {
                        $regex: reg,
                        $options: 'mi'
                    }
                },
                {_id: q}
            ];
        }
        Pos_Product.find(selector, {sort: {code: 1}, limit: 300}).fetch().forEach(function (obj) {
            list.push({label: obj.code + " : " + obj.name, value: obj._id});
        });
        return list;
    }
    ,
    queryItemOptionReport(q, categoryId) {
        let list = [];
        let selector = {};
        if (q != "") {
            q = q.replace(/[/\\]/g, '');
            let reg = new RegExp(q, 'mi');
            selector.$or = [
                {name: {$regex: reg}},
                {_id: q}
            ];
        }
        selector.categoryId = categoryId;
        Pos_Product.find(selector, {sort: {code: 1}, limit: 300}).fetch().forEach(function (obj) {
            list.push({label: obj.code + " : " + obj.name, value: obj._id});
        });
        return list;
    }
    , queryCategoryOptionReport(q, categoryId) {
        let list = [];
        let selector = {};
        if (q != "") {
            q = q.replace(/[/\\]/g, '');
            let reg = new RegExp(q, 'mi');
            selector.$or = [
                {name: {$regex: reg}},
                {_id: q}
            ];
        }
        Pos_Category.find(selector, {sort: {code: 1}, limit: 300}).fetch().forEach(function (obj) {
            list.push({label: obj.code + " : " + obj.name, value: obj._id});
        });
        return list;
    }
    ,

    queryLevelOption(selector) {
        let list = [];

        Sch_Level.find(selector, {sort: {code: 1}}).fetch().forEach(function (obj) {
            list.push({label: obj.code + " : " + obj.name, value: obj._id});
        });
        return list;
    }
    ,
    queryTimeOption(selector) {
        let list = [];

        Sch_Time.find(selector).fetch().forEach(function (obj) {
            list.push({label: obj.name, value: obj._id});
        });
        return list;
    }
    ,
    queryFacultyOption(selector) {
        let list = [];

        Sch_Faculty.find(selector).fetch().forEach(function (obj) {
            list.push({label: obj.name, value: obj._id});
        });
        return list;
    },
    queryBusOption(selector) {
        let list = [];

        Sch_Bus.find(selector).fetch().forEach(function (obj) {
            list.push({label: obj.name, value: obj._id});
        });
        return list;
    },
    queryBusStopOption(selector) {
        let list = [];

        Sch_BusStop.find(selector).fetch().forEach(function (obj) {
            list.push({label: obj.name, value: obj._id});
        });
        return list;
    }
    ,
    queryMajorOption(selector) {
        let list = [];
        Sch_Major.find(selector, {sort: {code: 1}}).fetch().forEach(function (obj) {
            list.push({label: obj.code + " : " + obj.name, value: obj._id});
        });
        return list;
    }
    ,
    queryTeacherOption(selector) {
        let list = [];
        Sch_Teacher.find(selector, {sort: {"personal.name": 1}}).fetch().forEach(function (obj) {
            list.push({label: obj.personal.name, value: obj._id});
        });
        return list;
    }
    ,
    queryProgramOption() {
        let list = [];
        Sch_Program.find().fetch().forEach(function (obj) {
            list.push({label: obj.name, value: obj._id});
        });
        return list;
    },

    queryActivityOption() {
        let list = [];
        Sch_Activity.find().fetch().forEach(function (obj) {
            list.push({label: obj.name, value: obj._id});
        });
        return list;
    }
    ,
    queryClassOption(selector) {
        let list = [];
        //selector.status = true;
        Sch_Class.aggregate([
            {$match: selector},
            {
                $lookup: {
                    from: "sch_time",
                    localField: "timeId",
                    foreignField: "_id",
                    as: "timeDoc"
                }
            },
            {
                $unwind: {
                    path: "$timeDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $limit: 200
            }
        ]).forEach(function (obj) {
            list.push({
                label: obj.name + " - " + obj.classDateName + "(" + (obj.timeDoc && obj.timeDoc.name || "") + ")",
                value: obj._id
            });
        });
        return list;
    }
    ,

    queryClassOptionSearch(q) {
        let selector = {};
        if (q !== "") {
            q = q.replace(/[/\\]/g, '');
            let reg = new RegExp(q, 'mi');
            selector.$or = [
                {name: {$regex: reg}},
                {classDateName: {$regex: reg}},
                {_id: q}
            ];
        }
        selector.status = true;


        let list = [];

        Sch_Class.aggregate([
            {$match: selector},
            {
                $lookup: {
                    from: "sch_time",
                    localField: "timeId",
                    foreignField: "_id",
                    as: "timeDoc"
                }
            },
            {
                $unwind: {
                    path: "$timeDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $limit: 200
            }
        ]).forEach(function (obj) {
            list.push({
                label: obj.name + " - " + obj.classDateName + "(" + (obj.timeDoc && obj.timeDoc.name || "") + ")",
                value: obj._id
            });
        });
        return list;
    },
    queryClassOptionSearchStatusNull(q, date) {
        let selector = {};
        if (q !== "") {
            q = q.replace(/[/\\]/g, '');
            let reg = new RegExp(q, 'mi');
            selector.$or = [
                {name: {$regex: reg}},
                {classDateName: {$regex: reg}},
                {_id: q}
            ];
        }
        if (date !== null && date !== "") {
            selector.classDate = {
                $lte: moment(date[1]).endOf("day").toDate(),
                $gte: moment(date[0]).startOf("day").toDate()
            };
        } else {
            selector.status = true;
        }

        let list = [];

        Sch_Class.aggregate([
            {$match: selector},
            {
                $lookup: {
                    from: "sch_time",
                    localField: "timeId",
                    foreignField: "_id",
                    as: "timeDoc"
                }
            },
            {
                $unwind: {
                    path: "$timeDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $limit: 200
            }
        ]).forEach(function (obj) {
            list.push({
                label: obj.name + " - " + obj.classDateName + "(" + (obj.timeDoc && obj.timeDoc.name || "") + ")",
                value: obj._id
            });
        });

        return list;
    },
    queryClassOptionActive(selector) {
        let list = [];
        selector.status = true;

        Sch_Class.aggregate([
            {$match: selector},
            {
                $lookup: {
                    from: "sch_time",
                    localField: "timeId",
                    foreignField: "_id",
                    as: "timeDoc"
                }
            },
            {
                $unwind: {
                    path: "$timeDoc",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]).forEach(function (obj) {
            list.push({
                label: obj.name + " - " + obj.classDateName + "(" + (obj.timeDoc && obj.timeDoc.name || "") + ")",
                value: obj._id
            });
        });

        return list;
    }
    ,
    queryPromotionOption(selector) {
        let list = [];
        selector.status = true;
        Sch_Promotion.find(selector).fetch().forEach(function (obj) {
            list.push({label: obj.name, value: obj._id});
        });
        return list;
    }
    ,
    queryPromotionOptionNoStatus(selector) {
        let list = [];
        Sch_Promotion.find(selector).fetch().forEach(function (obj) {
            list.push({label: obj.name, value: obj._id});
        });
        return list;
    }
    ,
    queryCiriculumnOption(selector) {
        let list = [];

        Sch_Ciriculumn.find(selector).fetch().forEach(function (obj) {
            list.push({label: obj.name, value: obj._id});
        });
        return list;
    }
    ,
    querySubjectOption(selector) {
        let list = [];

        Sch_Subject.find(selector, {sort: {code: 1}}).fetch().forEach(function (obj) {
            list.push({label: obj.code + " : " + obj.name, value: obj._id});
        });
        return list;
    },
    querySubjectOptionLimit(q) {
        let selector = {};
        if (q != "") {
            q = q.replace(/[/\\]/g, '');
            let reg = new RegExp(q, 'mi');
            selector.$or = [
                {name: {$regex: reg}},
                {_id: q}
            ];
        }
        return Sch_Subject.find(selector, {limit: 100}).fetch().map(obj => ({label: obj.name, value: obj._id}));

    },
    queryPositionOption(selector) {
        let list = [];

        Sch_Position.find(selector).fetch().forEach(function (obj) {
            list.push({label: obj.name, value: obj._id});
        });
        return list;
    }
    ,
    queryPosTermOption() {
        let list = [];
        Pos_Term.find().fetch().forEach(function (obj) {
            list.push({label: obj.name, value: obj._id});
        });
        return list;
    },
    queryProductionOption(selector) {
        let list = [];
        Pos_Production.find(selector).fetch().forEach(function (obj) {
            list.push({label: obj.name + " (" + obj.dateName + ")", value: obj._id});
        });
        return list;
    }
    ,
    queryPosUnitOption() {
        let list = [];
        Pos_Unit.find().fetch().forEach(function (obj) {
            list.push({label: obj.code + " : " + obj.name, value: obj._id});
        });
        return list;
    }
    ,
    queryPosVendorOption(rolesArea) {
        let list = [];
        let selector = {};
        selector.$or = [{rolesArea: rolesArea}, {_id: "001"}];
        Pos_Vendor.find(selector).fetch().forEach(function (obj) {
            list.push({label: obj.name, value: obj._id});
        });
        return list;
    }
    ,
    queryPosCustomerOption(q, rolesArea) {
        let selector = {};
        if (q != "") {
            q = q.replace(/[/\\]/g, '');
            let reg = new RegExp(q, 'mi');
            selector.$or = [
                {name: {$regex: reg}},
                {_id: q}
            ];
        }
        selector.$or = [{rolesArea: rolesArea}, {_id: "001"}];

        return Pos_Customer.find(selector, {limit: 100}).fetch().map(obj => ({label: obj.name, value: obj._id}));
    },
    queryLoanDisbursementOption(q, rolesArea) {
        let selector = {};
        if (q != "") {
            q = q.replace(/[/\\]/g, '');
            let reg = new RegExp(q, 'mi');

            let clientList = Pos_Customer.find({name: {$regex: reg}}).map((obj) => obj._id);
            selector.$or = [
                {disbursementDateName: {$regex: reg}},
                {_id: q},
                {loanAcc: q},
                {clientId: {$in: clientList}}
            ];
        }
        selector.status = "Active";
        selector.rolesArea = rolesArea;
        return Loan_Disbursement.aggregate([
            {$match: selector},
            {

                $lookup: {
                    from: "pos_customer",
                    localField: "clientId",
                    foreignField: "_id",
                    as: "clientDoc"
                }
            },
            {
                $unwind: {
                    path: "$clientDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {$limit: 300}

        ]).map(obj => ({
            label: obj.loanAcc + " | Dis Date : " + obj.disbursementDateName + " | Client : " + obj.clientDoc.name + " | Amount : " + formatCurrency(obj.loanAmount),
            value: obj._id
        }));
    }
    , queryLoanProductOption(q) {
        let selector = {};
        if (q != "") {
            q = q.replace(/[/\\]/g, '');
            let reg = new RegExp(q, 'mi');
            selector.$or = [
                {name: {$regex: reg}},
                {_id: q}
            ];
        }
        return Loan_Product.find(selector, {limit: 100}).fetch().map(obj => ({
            label: obj.name + " : " + obj.rateType,
            value: obj._id
        }));
    }
    ,
    queryLoanCreditOfficerOption(q, rolesArea) {
        let selector = {};
        if (q != "") {
            q = q.replace(/[/\\]/g, '');
            let reg = new RegExp(q, 'mi');
            selector.$or = [
                {name: {$regex: reg}},
                {_id: q}
            ];
        }
        selector.rolesArea = rolesArea;

        return Loan_CreditOfficer.find(selector, {limit: 100}).fetch().map(obj => ({
            label: obj.name,
            value: obj._id
        }));
    }
    ,
    queryPosCustomerOptionUnPaid(q, rolesArea) {
        let selector = {};
        if (q != "") {
            q = q.replace(/[/\\]/g, '');
            let reg = new RegExp(q, 'mi');
            selector.name = {$regex: reg};
        }
        selector.$or = [{rolesArea: rolesArea}, {_id: "001"}];


        return Pos_Customer.aggregate([
            {$match: selector},
            {

                $lookup: {
                    from: "pos_invoice",
                    localField: "_id",
                    foreignField: "customerId",
                    as: "invoiceDoc"
                }
            },
            {
                $unwind: {
                    path: "$invoiceDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    "invoiceDoc.status": {$in: ["Active", "Partial"]}
                }
            },
            {
                $group: {
                    _id: {
                        name: "$name",
                        id: "$_id"
                    }
                }
            },

            {$limit: 100}

        ]).map(obj => ({label: obj._id.name, value: obj._id.id}));
    },
    queryPosCustomerSaleOrderOptionUnPaid(q, rolesArea) {
        let selector = {};
        if (q != "") {
            q = q.replace(/[/\\]/g, '');
            let reg = new RegExp(q, 'mi');
            selector.name = {$regex: reg};
        }
        selector.$or = [{rolesArea: rolesArea}, {_id: "001"}];


        return Pos_Customer.aggregate([
            {$match: selector},
            {

                $lookup: {
                    from: "pos_saleOrder",
                    localField: "_id",
                    foreignField: "customerId",
                    as: "saleOderDoc"
                }
            },
            {
                $unwind: {
                    path: "$saleOderDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    "saleOderDoc.status": {$in: ["Active", "Partial"]}
                }
            },
            {
                $group: {
                    _id: {
                        name: "$name",
                        id: "$_id"
                    }
                }
            },

            {$limit: 100}

        ]).map(obj => ({label: obj._id.name, value: obj._id.id}));
    }
    ,

    queryPosVendorOptionUnPaid(q, rolesArea) {
        let selector = {};
        if (q != "") {
            q = q.replace(/[/\\]/g, '');
            let reg = new RegExp(q, 'mi');
            selector.name = {$regex: reg};
        }
        selector.$or = [{rolesArea: rolesArea}, {_id: "001"}];

        return Pos_Vendor.aggregate([
            {$match: selector},
            {

                $lookup: {
                    from: "pos_bill",
                    localField: "_id",
                    foreignField: "vendorId",
                    as: "billDoc"
                }
            },
            {
                $unwind: {
                    path: "$billDoc",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    "billDoc.status": {$in: ["Active", "Partial"]}
                }
            },
            {
                $group: {
                    _id: {
                        name: "$name",
                        id: "$_id"
                    }
                }
            },
            {$limit: 100}

        ]).map(obj => ({label: obj._id.name, value: obj._id.id}));
    }
    ,
    queryAccountTypeOption() {
        let list = [];

        let accountType = Acc_AccountType.find().fetch().forEach(function (obj) {
            list.push({label: obj._id + " : " + obj.name, value: obj._id});
        })
        return list;
    }
    ,
    queryParentChartAccountOption(selector, chartAccountId) {
        return Acc_ChartAccount.find(selector, {sort: {code: 1}}).fetch().map(function (obj) {
            let valDisable = false;
            if (obj._id == chartAccountId) {
                valDisable = true;
            }
            return {
                label: SpaceChar.space(obj.level * 6) + obj.code + " | " + obj.name,
                value: obj._id,
                disabled: valDisable

            }
        })

    }
    ,
    queryChartAccountFixAssetOption(selector) {
        let listFixedAsset = [];
        let listAccumulated = [];
        let listExpense = [];
        let obj = {};
        Acc_ChartAccount.find(selector, {sort: {code: 1}}).fetch().map(function (obj) {
            if (obj.accountTypeId === "20") {
                listFixedAsset.push({
                    label: SpaceChar.space(obj.level * 6) + obj.code + " | " + obj.name,
                    value: obj._id
                })

                listAccumulated.push({
                    label: SpaceChar.space(obj.level * 6) + obj.code + " | " + obj.name,
                    value: obj._id
                })
            } else if (obj.accountTypeId === "60" || obj.accountTypeId === "61") {
                listExpense.push({
                    label: SpaceChar.space(obj.level * 6) + obj.code + " | " + obj.name,
                    value: obj._id
                })
            }
        })
        obj.listFixedAsset = listFixedAsset;
        obj.listAccumulated = listAccumulated;
        obj.listExpense = listExpense;
        return obj;

    }
    ,
    queryParentPosCategoryOption(selector, categoryId) {
        return Pos_Category.find(selector, {sort: {code: 1}}).fetch().map(function (obj) {
            let valDisable = false;
            if (obj._id == categoryId) {
                valDisable = true;
            }
            return {
                label: SpaceChar.space(obj.level * 6) + obj.code + " | " + obj.name,
                value: obj._id,
                disabled: valDisable

            }
        })

    },
    queryPosTableLocationOption(selector) {
        return Pos_TableLocation.find(selector).fetch().map(function (obj) {
            return {
                label: obj.name,
                value: obj._id,
            }
        })

    }
    ,
    queryChartAccountOption(selector) {
        let list = [];
        Acc_ChartAccount.find(selector, {sort: {code: 1}}).fetch().forEach(function (obj) {
            let subAccountOfDoc = Acc_ChartAccount.findOne({subAccountOf: obj._id});
            let valDisable = false;
            if (subAccountOfDoc) {
                valDisable = true;
            }
            list.push({
                label: SpaceChar.space(obj.level * 6) + obj.code + " | " + obj.name,
                value: obj._id,
                disabled: valDisable
            })
        })
        return list;
    }
    ,
    queryChartAccountMethodOption(selector) {
        let list = [];
        selector.isPayment = true;
        Acc_ChartAccount.find(selector, {sort: {code: 1}}).fetch().forEach(function (obj) {
            let subAccountOfDoc = Acc_ChartAccount.findOne({subAccountOf: obj._id});
            let valDisable = false;
            if (subAccountOfDoc) {
                valDisable = true;
            }
            list.push({
                label: obj.name,
                value: obj._id,
                disabled: valDisable
            })
        })
        return list;
    }
    ,
    queryCategoryOption(selector) {
        let list = [];
        Pos_Category.find(selector, {sort: {code: 1}}).fetch().forEach(function (obj) {
            let subCategoryOfDoc = Pos_Category.findOne({subCategoryOf: obj._id});
            let valDisable = false;
            if (subCategoryOfDoc) {
                valDisable = true;
            }
            list.push({
                label: SpaceChar.space(obj.level * 6) + obj.code + " : " + obj.name,
                value: obj._id,
                disabled: valDisable
            })
        })
        return list;
    }
    ,
    queryUserOption() {
        let data = Meteor.users.find().fetch().map((obj) => {
            return {label: obj.username, value: obj._id};
        });
        return data;
    }
    ,
    queryLocationOption() {
        let userId = Meteor.userId();
        let data = Pos_Location.aggregate([
            {$unwind: "$applyUser"},
            {$match: {applyUser: userId}}
        ]).map((obj) => {
            return {label: obj.code + " : " + obj.name, value: obj._id};
        });
        return data;
    },
    queryTableOption(rolesArea) {
        let userId = Meteor.userId();
        if (userId) {
            let data = Pos_Table.find({rolesArea: rolesArea}).map((obj) => {
                return {label: obj.name, value: obj._id};
            });
            return data;
        }
        return [];
    },
    queryTableLocationOption(rolesArea) {
        let userId = Meteor.userId();
        if (userId) {
            let data = Pos_TableLocation.find({rolesArea: rolesArea}).map((obj) => {
                return {label: obj.name, value: obj._id};
            });
            data.unshift({label: "All", value: ""});
            return data;
        }
        return [];
    }
})
;
