import './sch_inputScore.html';
import schInputScore from '/imports/vue/ui/schInputScore';

let indexTmpl = Template.sch_inputScore;
indexTmpl.onRendered(function () {
    new Vue({
        render: h => h(schInputScore)
    }).$mount('sch_inputScore');
});

indexTmpl.onDestroyed(function () {
    $('.sch_inputScore').remove();
});

