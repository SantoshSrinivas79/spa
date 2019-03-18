import {Acc_ClosingEntry} from '../../imports/collection/accClosingEntry';
import {Acc_ChartAccountBalance} from '../../imports/collection/accChartAccountBalance';
import {Acc_ChartAccount} from '../../imports/collection/accChartAccount';
import {Pos_Invoice} from '../../imports/collection/posInvoice';
import {Pos_Vendor} from '../../imports/collection/posVendor';
import {Pos_Customer} from '../../imports/collection/posCustomer';
import {Pos_Term} from '../../imports/collection/posTerm';
import {Pos_Bill} from '../../imports/collection/posBill';
import {Pos_ConvertInventory} from '../../imports/collection/posConvertInventory';
import {Pos_ReceivePayment} from '../../imports/collection/posReceivePayment';
import {Pos_SaleOrder} from '../../imports/collection/posSaleOrder';
import {Pos_TransferInventory} from '../../imports/collection/posTransferInventory';
import {Pos_Unit} from '../../imports/collection/posUnit';
import {Pos_Location} from '../../imports/collection/posLocation';
import {Pos_Category} from '../../imports/collection/posCategory';
import {Pos_PayBill} from '../../imports/collection/posPayBill';
import {Pos_Product} from '../../imports/collection/posProduct';
import {Sch_Student} from '../../imports/collection/schStudent';
import {Sch_Teacher} from '../../imports/collection/schTeacher';
import {Sch_Register} from '../../imports/collection/schRegister';
import {Sch_Payment} from '../../imports/collection/schPayment';
import {Sch_BusRegister} from '../../imports/collection/schBusRegister';
import {Sch_BusPayment} from '../../imports/collection/schBusPayment';
import {Sch_Class} from '../../imports/collection/schClass';
import {Sch_TeacherActivity} from '../../imports/collection/schTeacherActivity';
import {Sch_Time} from '../../imports/collection/schTime';
import {Sch_Faculty} from "../../imports/collection/schFaculty";
import {Sch_Major} from "../../imports/collection/schMajor";
import {Sch_Program} from "../../imports/collection/schProgram";
import {Sch_Level} from "../../imports/collection/schLevel";
import {Sch_Promotion} from "../../imports/collection/schPromotion";
import {Sch_Subject} from "../../imports/collection/schSubject";
import {Sch_Ciriculumn} from "../../imports/collection/schCiriculumn";
import {Sch_Mention} from "../../imports/collection/schMention";
import {Sch_Position} from "../../imports/collection/schPosition";
import {Sch_Activity} from "../../imports/collection/schActivity";
import {Sch_BusStop} from "../../imports/collection/schBusStop";
import {Sch_Bus} from "../../imports/collection/schBus";


Sch_Student._ensureIndex({
    "personal.name": 1,
    "personal.latinName": 1,
    rolesArea: 1,
    "personal.dobName": 1
}, {unique: 1});

Sch_Teacher._ensureIndex({
    "personal.name": 1,
    "personal.latinName": 1,
    rolesArea: 1,
    "personal.dobName": 1
}, {unique: 1});

Sch_Register._ensureIndex({
    registerDateName: 1,
    studentId: 1,
    levelId: 1,
    programId: 1,
    rolesArea: 1
}, {unique: 1});

Sch_Payment._ensureIndex({
    paymentDateName: 1,
    studentId: 1,
    classId: 1,
    paymentNo: 1,
    rolesArea: 1
}, {unique: 1});
Sch_BusRegister._ensureIndex({
    busRegisterDateName: 1,
    studentId: 1,
    busId: 1,
    busStopId: 1,
    rolesArea: 1
}, {unique: 1});
Sch_BusPayment._ensureIndex({
    busPaymentDateName: 1,
    studentId: 1,
    busRegisterId: 1,
    busPaymentNo: 1,
    rolesArea: 1
}, {unique: 1});
Sch_Class._ensureIndex({
    name: 1,
    code: 1,
    teacherId: 1,
    levelId: 1,
    timeId: 1,
    classDateName: 1,
    rolesArea: 1
}, {unique: 1});
Sch_TeacherActivity._ensureIndex({
    teacherId: 1,
    activityId: 1,
    startDateName: 1,
    endDateName: 1,
    rolesArea: 1
}, {unique: 1});
Sch_Time._ensureIndex({
    name: 1,
    rolesArea: 1
}, {unique: 1});

Sch_Program._ensureIndex({
    name: 1,
    rolesArea: 1
}, {unique: 1});
Sch_Faculty._ensureIndex({
    name: 1,
    rolesArea: 1
}, {unique: 1});
Sch_Major._ensureIndex({
    name: 1,
    rolesArea: 1
}, {unique: 1});
Sch_Level._ensureIndex({
    name: 1,
    programId: 1,
    majorId: 1,
    code: 1,
    rolesArea: 1
}, {unique: 1});

Sch_Promotion._ensureIndex({
    name: 1,
    rolesArea: 1
}, {unique: 1});
Sch_Subject._ensureIndex({
    name: 1,
    code: 1,
    rolesArea: 1
}, {unique: 1});

Sch_Ciriculumn._ensureIndex({
    name: 1,
    majorId: 1,
    rolesArea: 1
}, {unique: 1});
Sch_Mention._ensureIndex({
    dateName: 1,
    rolesArea: 1
}, {unique: 1});
Sch_Position._ensureIndex({
    name: 1,
    rolesArea: 1
}, {unique: 1});
Sch_Activity._ensureIndex({
    name: 1,
    rolesArea: 1
}, {unique: 1});
Sch_BusStop._ensureIndex({
    name: 1,
    rolesArea: 1
}, {unique: 1});
Sch_Bus._ensureIndex({
    name: 1,
    rolesArea: 1
}, {unique: 1});


Acc_ClosingEntry._ensureIndex({month: 1, year: 1, rolesArea: 1}, {unique: 1});
Acc_ChartAccount._ensureIndex({code: 1, rolesArea: 1}, {unique: 1});
Acc_ChartAccountBalance._ensureIndex({month: 1, year: 1, rolesArea: 1, chartAccountId: 1, currencyId: 1}, {unique: 1});
Pos_Vendor._ensureIndex({name: 1, rolesArea: 1, createdUser: 1, phoneNumber: 1}, {unique: 1});
Pos_Customer._ensureIndex({name: 1, rolesArea: 1, createdUser: 1, phoneNumber: 1}, {unique: 1});
Pos_Term._ensureIndex({name: 1, rolesArea: 1, createdUser: 1}, {unique: 1});
Pos_Bill._ensureIndex({payBillDateName: 1, vendorId: 1, billNo: 1, rolesArea: 1, createdUser: 1}, {unique: 1});
Pos_Invoice._ensureIndex({invoiceDateName: 1, customerId: 1, invoiceNo: 1, rolesArea: 1, createdUser: 1}, {unique: 1});
Pos_PayBill._ensureIndex({
    payBillDate: 1,
    totalPaid: 1,
    locationId: 1,
    vendorId: 1,
    billId: 1,
    rolesArea: 1,
    createdUser: 1
}, {unique: 1});
Pos_Unit._ensureIndex({name: 1, code: 1, rolesArea: 1, createdUser: 1}, {unique: 1});
Pos_Location._ensureIndex({name: 1, code: 1, rolesArea: 1, createdUser: 1}, {unique: 1});
Pos_Category._ensureIndex({name: 1, code: 1, subCategoryOf: 1, rolesArea: 1, createdUser: 1}, {unique: 1});
Pos_Product._ensureIndex({name: 1, code: 1, categoryId: 1, rolesArea: 1, createdUser: 1}, {unique: 1});
Pos_ConvertInventory._ensureIndex({
    date: 1,
    productId: 1,
    locationId: 1,
    qty: 1,
    rolesArea: 1,
    createdUser: 1,
    description: 1,
}, {unique: 1});

Pos_ReceivePayment._ensureIndex({
    receivePaymentDate: 1,
    totalPaid: 1,
    customerId: 1,
    locationId: 1,
    rolesArea: 1,
    invoiceId: 1,
    createdUser: 1
}, {unique: 1});
Pos_SaleOrder._ensureIndex({
    saleOrderDate: 1,
    customerId: 1,
    locationId: 1,
    rolesArea: 1,
    saleOrderNo: 1,
    createdUser: 1
}, {unique: 1});
Pos_TransferInventory._ensureIndex({
    transferInventoryDate: 1,
    locationFromId: 1,
    locationToId: 1,
    total: 1,
    rolesArea: 1,
    note: 1,
    createdUser: 1
}, {unique: 1});


