/**
 * Created by lijuanZhang on 2015/9/28.
 */
var ReqConstant ={
   sumbmitUrl:{NEWREQAPPLYURL:"/req/newReqApply",
       CONFIRMINGURL:"/req/comforming",
       DESIGNINGURL:"/req/design",
       DESCOMFIRMURL:"/req/desComfirm",
       TODEVURL:"/req/toDev",
       SUBMITURL:"/req/submit",
       ADDDEALERURL:"/req/addDealer"},
    stateId:{
          APPLYED:1,
          CONFIRMED:2,
          DESIGNING:3,
          DESIGNED:4,
          DESCONFIRMED:5,
          DEVED:6,
          MODIFY:7,
          REDESIGN:8
    },
    processStepId:{
        APPLY:1,
        CONFIRM:2,
        DESIGNING:3,
        DESCONFIRM:4,
        TODEV:5
    }
}
module.exports = ReqConstant