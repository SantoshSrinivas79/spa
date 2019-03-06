import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import 'lodash';
import 'jsbarcode';
import 'material-design-icons';
import 'meteor/tap:i18n-ui';
import '../imports/ui/area/area';
import '../imports/ui/actionButtons/actionButton';
import '../imports/ui/preloader/preloader';
import 'jszip';
import 'paper-css/paper.css';
import 'print-this';
import fa from 'fontawesome'
// import Tabular from 'meteor/aldeed:tabular';

//Page
import './layout.html';
import {CheckRoles} from "../imports/api/methods/checkRoles";
import {WB_waterBillingSetup} from "../imports/collection/waterBillingSetup";
import {Manage_Module} from "../imports/collection/manageModule";
//collection
import {Pos_Invoice} from '../imports/collection/posInvoice';
import {LoginSetup} from '../imports/collection/loginSetup';
import {Pos_AverageInventory} from "../imports/collection/posAverageInventory";

const Counts = new Mongo.Collection('counts');

// let mobileSyncTmpCollection = new Mongo.Collection('tmp_mobileSynced_notify');
Template.navbar.onRendered(function () {
    $(".dropdown-button").dropdown();
    $('#settings-dropdown').dropdown();
    $(".enable-sidenav").sideNav();


});
var countDown;

Template.sidebar.onRendered(function () {
    let selector = $('.main-sidebar');
    // if (selector.length) {
    //     $('.main-sidebar').slimScroll({
    //         color: "",
    //         size: '10px',
    //         // height: '180px',
    //         alwaysVisible: true
    //     });
    // }
});


Template.MainLayout.onCreated(function () {
    this.currentPath = new ReactiveVar();
    this.autorun = (() => {
        let path = FlowRouter.current().path;
        this.currentPath.set(path);
    });

});
Template.MainLayout.helpers({
    showCompany() {
        let wb = WB_waterBillingSetup.findOne({rolesArea: Session.get('area')});
        let moduleName = Session.get("module");
        let sliceModule = moduleName && moduleName.split(" ");
        if (sliceModule && sliceModule.length == 1) {
            return sliceModule[0]
        }
        return '<b>' + sliceModule[0] + '</b> ' + (sliceModule[1] || "");
    },
    notChoosenArea() {
        return _.isUndefined(Session.get('area'));
    },
    skin() {
        return "black-light";
    },
    area() {
        return Session.get("area") != undefined ? Session.get("area") : "";
    },
    isAvailable() {
        return CheckRoles({roles: ['setting', 'super', 'admin', "report", 'reportVendor', 'reportCustomer']});
    },
    isSettingArea() {
        let instance = Template.instance();
        let currentPath = FlowRouter.current().path;
        if (currentPath === "/wb-setting/area") {
            return 'custom-login-background-setting-area'
        }
        return 'custom-login-background'
    },
    isShowSettingRole() {
        return CheckRoles({roles: ['admin', 'super', 'setting']});
    },
    isShowReportRole() {
        return CheckRoles({roles: ['admin', 'super', 'report', 'reportVendor', 'reportCustomer']});
    },
    isPaymentReportRole() {
        return CheckRoles({roles: ['super', 'payment']});
    },
    isTeacherReportRole() {
        return CheckRoles({roles: ['super', 'teacher']});
    },

    createdAt() {
        return moment(this.createdAt).format('DD/MM/YYYY HH:mm');
    },
    posLayout() {
        return Session.get("module") == "POS";
    },
    accountLayout() {
        return Session.get("module") == "Accounting";
    },
    schLayout() {
        return Session.get("module") == "School";
    },
    loanLayout() {
        return Session.get("module") == "Loan";
    },
    loginSetup() {
        return LoginSetup.findOne();
    }
    ,
    isAdminSettingAndSuper() {
        return CheckRoles({roles: ['admin', 'super', 'setting']})
    },
    isSuper() {
        return CheckRoles({roles: ['super']})
    },
    invoiceExpire() {
        return Pos_Invoice.find({
            rolesArea: Session.get("area"), status: {$ne: "Complete"},
            dueDate: {
                $lte: moment().endOf("days").toDate()
            },
        }).count();
    },
    inventoryNonStock() {
        let data = Counts.findOne();
        return data && data.count || 0;

    },
    manageModule() {
        let ob = {};
        let ma = Manage_Module.findOne();
        if (ma && ma.feature) {
            ob.bus = (ma.feature.indexOf("Bus") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.trascript = (ma.feature.indexOf("Transcript") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.score = (ma.feature.indexOf("Score") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.teacher = (ma.feature.indexOf("Teacher") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.student = (ma.feature.indexOf("Student") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.super = CheckRoles({roles: ['super']});

            ob.inventory = (ma.feature.indexOf("Inventory") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.order = (ma.feature.indexOf("Order") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.transfer = (ma.feature.indexOf("Transfer") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.vendor = (ma.feature.indexOf("Vendor") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.customer = (ma.feature.indexOf("Customer") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.production = (ma.feature.indexOf("Production") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.coffee = (ma.feature.indexOf("Coffee") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.restaurant = (ma.feature.indexOf("Restaurant") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.phoneShop = (ma.feature.indexOf("Phone Shop") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.table = ((ma.feature.indexOf("Restaurant") > -1 || ma.feature.indexOf("Coffee") > -1) ? true : false) || CheckRoles({roles: ['super']});
        }

        return ob;
    }

});
Template.sidebar.helpers({
    showCompany() {
        let wb = WB_waterBillingSetup.findOne({rolesArea: Session.get('area')});
        let moduleName = Session.get("module");
        let sliceModule = moduleName && moduleName.split(" ");
        if (sliceModule && sliceModule.length == 1) {
            return sliceModule[0]
        }
        return '<b>' + sliceModule[0] + '</b> ' + (sliceModule[1] || "");
    },
    posLayout() {
        return Session.get("module") === "POS";
    },
    accountLayout() {
        return Session.get("module") === "Accounting";
    },
    loanLayout() {
        return Session.get("module") === "Loan";
    },
    schLayout() {
        return Session.get("module") === "School";
    },
    isAdminSettingAndSuper() {
        return CheckRoles({roles: ['admin', 'super', 'setting']})
    },
    isPaymentRole() {
        return CheckRoles({roles: ['super', 'payment']});
    },
    isTeacherRole() {
        return CheckRoles({roles: ['super', 'teacher']});
    },
    isStudentRole() {
        return CheckRoles({roles: ['super', 'student']});
    },

    manageModule() {
        let ob = {};
        let ma = Manage_Module.findOne();
        if (ma && ma.feature) {
            ob.bus = (ma.feature.indexOf("Bus") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.trascript = (ma.feature.indexOf("Transcript") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.score = (ma.feature.indexOf("Score") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.teacher = (ma.feature.indexOf("Teacher") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.student = (ma.feature.indexOf("Student") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.super = CheckRoles({roles: ['super']});

            ob.inventory = (ma.feature.indexOf("Inventory") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.order = (ma.feature.indexOf("Order") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.transfer = (ma.feature.indexOf("Transfer") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.vendor = (ma.feature.indexOf("Vendor") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.customer = (ma.feature.indexOf("Customer") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.production = (ma.feature.indexOf("Production") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.coffee = (ma.feature.indexOf("Coffee") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.restaurant = (ma.feature.indexOf("Restaurant") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.phoneShop = (ma.feature.indexOf("Phone Shop") > -1 ? true : false) || CheckRoles({roles: ['super']});
            ob.table = ((ma.feature.indexOf("Restaurant") > -1 || ma.feature.indexOf("Coffee") > -1) ? true : false) || CheckRoles({roles: ['super']});

        }
        return ob;
    }
});


Template.navbar.helpers({
    getRouterName() {
        let routeName = FlowRouter.getRouteName();
        return routeName + '.title';
    }
});
Template.MainLayout.events({
    'click .full-screen'(event, instance) {
        go_full_screen();
    }
});


$.AdminLTE = {};
/* --------------------
 * - AdminLTE Options -
 * --------------------
 * Modify these options to suit your implementation
 */
$.AdminLTE.options = {
    //Add slimscroll to navbar menus
    //This requires you to load the slimscroll plugin
    //in every page before app.js
    navbarMenuSlimscroll: true,
    navbarMenuSlimscrollWidth: "3px", //The width of the scroll bar
    navbarMenuHeight: "200px", //The height of the inner menu
    //General animation speed for JS animated elements such as box collapse/expand and
    //sidebar treeview s
    // lide up/down. This option accepts an integer as milliseconds,
    //'fast', 'normal', or 'slow'
    animationSpeed: 500,
    //Sidebar push menu toggle button selector
    sidebarToggleSelector: "[data-toggle='offcanvas']",
    //Activate sidebar push menu
    sidebarPushMenu: true,
    //Activate sidebar slimscroll if the fixed layout is set (requires SlimScroll Plugin)
    sidebarSlimScroll: true,
    //Enable sidebar expand on hover effect for sidebar mini
    //This option is forced to true if both the fixed layout and sidebar mini
    //are used together
    sidebarExpandOnHover: false,
    //BoxRefresh Plugin
    enableBoxRefresh: true,
    //Bootstrap.js tooltip
    enableBSToppltip: true,
    BSTooltipSelector: "[data-toggle='tooltip']",
    //Enable Fast Click. Fastclick.js creates a more
    //native touch experience with touch devices. If you
    //choose to enable the plugin, make sure you load the script
    //before AdminLTE's app.js
    enableFastclick: false,
    //Control Sidebar Tree views
    enableControlTreeView: true,
    //Control Sidebar Options
    enableControlSidebar: true,
    controlSidebarOptions: {
        //Which button should trigger the open/close event
        toggleBtnSelector: "[data-toggle='control-sidebar']",
        //The sidebar selector
        selector: ".control-sidebar",
        //Enable slide over content
        slide: true
    },
    //Box Widget Plugin. Enable this plugin
    //to allow boxes to be collapsed and/or removed
    enableBoxWidget: true,
    //Box Widget plugin options
    boxWidgetOptions: {
        boxWidgetIcons: {
            //Collapse icon
            collapse: 'fa-minus',
            //Open icon
            open: 'fa-plus',
            //Remove icon
            remove: 'fa-times'
        },
        boxWidgetSelectors: {
            //Remove button selector
            remove: '[data-widget="remove"]',
            //Collapse button selector
            collapse: '[data-widget="collapse"]'
        }
    },
    //Direct Chat plugin options
    directChat: {
        //Enable direct chat by default
        enable: true,
        //The button to open and close the chat contacts pane
        contactToggleSelector: '[data-widget="chat-pane-toggle"]'
    },
    //Define the set of colors to use globally around the website
    colors: {
        lightBlue: "#3c8dbc",
        red: "#f56954",
        green: "#00a65a",
        aqua: "#00c0ef",
        yellow: "#f39c12",
        blue: "#0073b7",
        navy: "#001F3F",
        teal: "#39CCCC",
        olive: "#3D9970",
        lime: "#01FF70",
        orange: "#FF851B",
        fuchsia: "#F012BE",
        purple: "#8E24AA",
        maroon: "#D81B60",
        black: "#222222",
        gray: "#d2d6de"
    },
    //The standard screen sizes that bootstrap uses.
    //If you change these in the variables.less file, change
    //them here too.
    screenSizes: {
        xs: 480,
        sm: 768,
        md: 992,
        lg: 1200
    }
};


Template.MainLayout.events({
    'click .sidebar-toggle'() {
        var screenSizes = $.AdminLTE.options.screenSizes;
        if ($(window).width() > (screenSizes.sm - 1)) {
            if ($("body").hasClass('sidebar-collapse')) {
                $("body").removeClass('sidebar-collapse').trigger('expanded.pushMenu');
            } else {
                $("body").addClass('sidebar-collapse').trigger('collapsed.pushMenu');
            }
        }
        //Handle sidebar push menu for small screens
        else {
            if ($("body").hasClass('sidebar-open')) {
                $("body").removeClass('sidebar-open').removeClass('sidebar-collapse').trigger('collapsed.pushMenu');
            } else {
                $("body").addClass('sidebar-open').trigger('expanded.pushMenu');
            }
        }
    },
    'click .content-wrapper'() {
        var screenSizes = $.AdminLTE.options.screenSizes;
        if ($(window).width() <= (screenSizes.sm - 1) && $("body").hasClass("sidebar-open")) {
            $("body").removeClass('sidebar-open');
        }
        if ($.AdminLTE.options.sidebarExpandOnHover
            || ($('body').hasClass('fixed')
                && $('body').hasClass('sidebar-mini'))) {
            this.expandOnHover();
        }
    },
    'click .search-everything'(event, instace) {
        let search = $('#search').val();
        if (!!search) {
            let path = FlowRouter.path('wb.search') + `?q=${search}`;
            FlowRouter.go(path);
        }
    },
    'click .logout'(event, instance) {
        Meteor.logout(function (err) {
            if (!err) {
                Session.set('area', undefined);
                Session.set('areaName', undefined);
                Session.set('module', undefined);
                Session.set('rolesArea::provinceId', undefined);
                FlowRouter.go('wb.home');
            }

        });
    },
});

Template.MainLayout.onRendered(function () {
    $.AdminLTE.pushMenu = {
        expandOnHover: function () {
            var _this = this;
            var screenWidth = $.AdminLTE.options.screenSizes.sm - 1;
            //Expand sidebar on hover
            $('.main-sidebar').hover(function () {
                if ($('body').hasClass('sidebar-mini')
                    && $("body").hasClass('sidebar-collapse')
                    && $(window).width() > screenWidth) {
                    _this.expand();
                }
            }, function () {
                if ($('body').hasClass('sidebar-mini')
                    && $('body').hasClass('sidebar-expanded-on-hover')
                    && $(window).width() > screenWidth) {
                    _this.collapse();
                }
            });
        },
        expand: function () {
            $("body").removeClass('sidebar-collapse').addClass('sidebar-expanded-on-hover');
        },
        collapse: function () {
            if ($('body').hasClass('sidebar-expanded-on-hover')) {
                $('body').removeClass('sidebar-expanded-on-hover').addClass('sidebar-collapse');
            }
        }
    };


    $(window).on('click', function () {
        stopInter();
        let val = 0;
        countDown = setInterval(function () {
            val += 1;
            if (val == 1800) {
                Meteor.logout();
            }
        }, 1000)
    });

    $(window).on('keydown', function () {
        stopInter();
        let val = 0;
        countDown = setInterval(function () {
            val += 1;
            if (val == 1800) {
                Meteor.logout();
            }
        }, 1000)
    });


});

Template.sidebar.helpers({
    isPaymentRole() {
        return CheckRoles({roles: ['payment', 'super', 'admin', 'creditor']})
    },
    isSuper() {
        return CheckRoles({roles: ['super']});
    },
    settingAdminRoles() {
        return CheckRoles({roles: ['admin', 'super', 'setting', 'payment', 'creditor']});
    },
    isAdminAndSuper() {
        return CheckRoles({roles: ['admin', 'super']});
    },
    isAdminSuperAndPayment() {
        return CheckRoles({roles: ['admin', 'super', 'payment', 'creditor']});
    },
});
Template.sidebar.events({
    'click .logout'(event, instance) {
        Meteor.logout(function (err) {
            if (!err) {
                Session.set('area', undefined);
                Session.set('module', undefined);
                Session.set('rolesArea::provinceId', undefined);
                FlowRouter.go('wb.home');
            }

        });
    },
    'click .receivePaymentWithPassword'(event, instance) {
        let ma = Manage_Module.findOne();
        let validateReceivePayment = ma.validateReceivePayment;
        if (validateReceivePayment === true && validateReceivePayment !== undefined) {
            //FlowRouter.go('/pos-sale/posReceivePayment');
            alertify.prompt("Please Input Password", "", "",
                function (evt, value) {
                    let wb = WB_waterBillingSetup.findOne();
                    if (value === wb.password) {
                        alertify.success('Your Password is Correct');
                        FlowRouter.go('/pos-sale/posReceivePayment');
                    } else {
                        alertify.error('Invalid Password !!!');
                        return false;
                    }
                },
                function () {
                    alertify.error('Cancel');
                }).set('type', 'password');

            /*this.$prompt('Please input Password', 'Tip', {
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
                    FlowRouter.go('/pos-sale/posReceivePayment');
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
            });*/
        }
    }
});

function go_full_screen() {
    var elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }
}

function stopInter() {
    clearInterval(countDown);
}