package com.al.crm.rule.socheck.ruleset;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Map.Entry;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;

import com.al.crm.busicommon.dto.model.AtomAction;
import com.al.crm.busicommon.dto.model.Bo2Coupon;
import com.al.crm.busicommon.dto.model.BoAccountInfo;
import com.al.crm.busicommon.dto.model.BoAccountMailing;
import com.al.crm.busicommon.dto.model.BoAccountRela;
import com.al.crm.busicommon.dto.model.BoAcct2PaymentAcct;
import com.al.crm.busicommon.dto.model.BoCust;
import com.al.crm.busicommon.dto.model.BoPaymentAccount;
import com.al.crm.busicommon.dto.model.BoProd2An;
import com.al.crm.busicommon.dto.model.BoProd2Td;
import com.al.crm.busicommon.dto.model.BoProdAddress;
import com.al.crm.busicommon.dto.model.BoProdAn;
import com.al.crm.busicommon.dto.model.BoProdCompItem;
import com.al.crm.busicommon.dto.model.BoProdCompOrder;
import com.al.crm.busicommon.dto.model.BoProdCompRela;
import com.al.crm.busicommon.dto.model.BoProdFeeType;
import com.al.crm.busicommon.dto.model.BoProdItem;
import com.al.crm.busicommon.dto.model.BoProdPassword;
import com.al.crm.busicommon.dto.model.BoProdRela;
import com.al.crm.busicommon.dto.model.BoProdSpec;
import com.al.crm.busicommon.dto.model.BoProdStatus;
import com.al.crm.busicommon.dto.model.BoRela;
import com.al.crm.busicommon.dto.model.BoServ;
import com.al.crm.busicommon.dto.model.BoServItem;
import com.al.crm.busicommon.dto.model.BoServOrder;
import com.al.crm.busicommon.dto.model.BusiObj;
import com.al.crm.busicommon.dto.model.BusiOrder;
import com.al.crm.busicommon.dto.model.BusiOrderAttr;
import com.al.crm.busicommon.dto.model.BusiOrderInfo;
import com.al.crm.busicommon.dto.model.BusiOrderObj;
import com.al.crm.busicommon.dto.model.OlRela;
import com.al.crm.busicommon.dto.model.OoParam;
import com.al.crm.busicommon.dto.model.OoRole;
import com.al.crm.busicommon.dto.model.OrderList;
import com.al.crm.busicommon.dto.model.OrderListAttr;
import com.al.crm.busicommon.dto.model.OrderListInfo;
import com.al.crm.crmcommon.util.ListUtil;
import com.al.crm.crmcommon.util.XmlUtil;
import com.al.crm.dbrouting.DBRoutingContext;
import com.al.crm.rule.sorule.common.AreaMapToDbRegion;
import com.al.crm.rule.sorule.common.InstDataUtil;
import com.al.crm.rule.sorule.common.MDA;
import com.al.crm.rule.sorule.common.OrderListUtil;
import com.al.crm.rule.sorule.common.SoRuleUtil;
import com.al.crm.rule.sorule.dto.BoServDataDto;
import com.al.crm.rule.sorule.dto.ChangePaymentAccountDto;
import com.al.crm.rule.sorule.dto.ItemInfoDto;
import com.al.crm.rule.sorule.dto.OfferCouponDto;
import com.al.crm.rule.sorule.dto.OfferMemberDto;
import com.al.crm.rule.sorule.dto.OfferServItemDto;
import com.al.crm.rule.sorule.dto.OfferSpecRelaExtendsDto;
import com.al.crm.rule.sorule.dto.ProdCfgRule2ItemDto;
import com.al.crm.rule.sorule.dto.ProdCompInfoDto;
import com.al.crm.rule.sorule.dto.ProdServInfoDto;
import com.al.crm.rule.sorule.model.Account;
import com.al.crm.rule.sorule.model.Acct2PaymentAcct;
import com.al.crm.rule.sorule.model.Area;
import com.al.crm.rule.sorule.model.BaseInfo;
import com.al.crm.rule.sorule.model.Coupon;
import com.al.crm.rule.sorule.model.ItemSpec;
import com.al.crm.rule.sorule.model.MemberRole;
import com.al.crm.rule.sorule.model.Offer;
import com.al.crm.rule.sorule.model.OfferCoupon;
import com.al.crm.rule.sorule.model.OfferMember;
import com.al.crm.rule.sorule.model.OfferMemberInstDto;
import com.al.crm.rule.sorule.model.OfferObj;
import com.al.crm.rule.sorule.model.OfferProd;
import com.al.crm.rule.sorule.model.OfferProd2AccessNumber;
import com.al.crm.rule.sorule.model.OfferProd2Addr;
import com.al.crm.rule.sorule.model.OfferProd2Prod;
import com.al.crm.rule.sorule.model.OfferProd2Td;
import com.al.crm.rule.sorule.model.OfferProdAccount;
import com.al.crm.rule.sorule.model.OfferProdComp;
import com.al.crm.rule.sorule.model.OfferProdCompItem;
import com.al.crm.rule.sorule.model.OfferProdFeeType;
import com.al.crm.rule.sorule.model.OfferProdItem;
import com.al.crm.rule.sorule.model.OfferProdNumber;
import com.al.crm.rule.sorule.model.OfferProdObj;
import com.al.crm.rule.sorule.model.OfferProdSpec;
import com.al.crm.rule.sorule.model.OfferProdStatus;
import com.al.crm.rule.sorule.model.OfferRoleRuleGrp;
import com.al.crm.rule.sorule.model.OfferRoles;
import com.al.crm.rule.sorule.model.OfferServ;
import com.al.crm.rule.sorule.model.OfferServItem;
import com.al.crm.rule.sorule.model.OfferServObj;
import com.al.crm.rule.sorule.model.OfferSpec;
import com.al.crm.rule.sorule.model.OfferSpecGrp;
import com.al.crm.rule.sorule.model.OfferSpecGrpRela;
import com.al.crm.rule.sorule.model.OfferSpecInfo;
import com.al.crm.rule.sorule.model.OfferSpecObj;
import com.al.crm.rule.sorule.model.OfferSpecParam;
import com.al.crm.rule.sorule.model.OfferSpecRela;
import com.al.crm.rule.sorule.model.OrderListObj;
import com.al.crm.rule.sorule.model.PartyIdentity;
import com.al.crm.rule.sorule.model.PartyObj;
import com.al.crm.rule.sorule.model.PartySegmentMemberList;
import com.al.crm.rule.sorule.model.ProdSpecObj;
import com.al.crm.rule.sorule.model.ServSpec;
import com.al.crm.rule.sorule.ruleset.SoBaseRule;
import com.al.crm.rule.sorule.smo.OtherSysProDataSMOImpl;
import com.linkage.bss.commons.util.JsonUtilTest.Order;


/**
 * 说明:多个入口重复调用规则在此类编写
 * 如：订购附属，在第一填单提交进行校验在第二填单提交需重复进行校验，
 * 此时该规则归属于多入口重复调用规则，对应eventId = 7000
 * @author raoly
 * @version 2014-06-17
 *
 */
public class MultiEntranceReusableRuleImpl extends SoBaseRule implements IMultiEntranceReusableRule{

    //购物车信息
	//private Long olId;

	//业务动作信息
	//private String boActionTypeCd;
	//private String boActionTypeName;

	//产品信息
	//private Long prodId;
	//private Integer prodSpecId;
	//private String prodSpecName;
	//private String accessNumber;
	//private OfferProdObj offerProdObj;

	//销售品信息
	//private Long offerId;
	//private Long offerSpecId;
	//private String offerSpecName;
	//private OfferObj offerObj;

	//初始化中赋值offerObj
	//private String limitGrpRetval;
	//private String limitGrpResult;
	//private Long offerRoleId;
	//private Long objInstId;
	//private String actionDesc;


	/**
	 * 校验性规则的校验信息
	 */
	public void init(Map<String, Object> inParamMap) throws Exception {
		super.init(inParamMap);
		OrderList orderList = getOrderList();
		BusiOrder busiOrder = getBusiOrder();
		BaseInfo baseInfo = getBaseInfo();
		//1、从inParamMap中取数据
		this.setOlId(OrderListUtil.getOlId(orderList));
		this.setLimitGrpRetval(SoRuleUtil.getString(inParamMap.get("limitGrpRetval")));
		this.setLimitGrpResult(SoRuleUtil.getString(inParamMap.get("limitGrpResult")));
		this.setOfferRoleId(SoRuleUtil.getLong(inParamMap.get("offerRoleId")));
		this.setObjInstId(SoRuleUtil.getLong(inParamMap.get("objInstId")));
		this.setActionDesc(SoRuleUtil.getString(inParamMap.get("actionDesc")));
		//2、赋值校验结果
		setOneLimitRuleResult(MDA.RESFLAG_PROMPT);
		//3、取baseInfo中取
		//3.1、业务动作数据
		this.setBoActionTypeCd(baseInfo.getBoActionTypeCd());
		this.setBoActionTypeName(baseInfo.getBoActionTypeName());
		//取产品的信息
		if (MDA.ACTION_CLASS_PRODUCT == baseInfo.getSourceActionClassCd()) {
			setProdId(busiOrder.getBusiObj().getInstId());
			setProdSpecId(busiOrder.getBusiObj().getObjId().intValue());
			setProdSpecName(busiOrder.getBusiObj().getName());
			setAccessNumber(busiOrder.getBusiObj().getAccessNumber());
			//offerProdObj,这要以后也要改造一下，否则取很多次,而且取这个也要再看看是否需要取哈哈，
			this.setOfferProdObj(instDataSMO.getOfferProdObj(baseInfo.getOlId(), getProdId()));
		} else if (MDA.ACTION_CLASS_OFFER == baseInfo.getSourceActionClassCd()) {
			setOfferSpecId(busiOrder.getBusiObj().getObjId());
			setOfferSpecObj(null);//重置offerSpecObj
			setOfferSpecName(busiOrder.getBusiObj().getName());
			setOfferId(busiOrder.getBusiObj().getInstId());
			setOfferObj(instDataSMO.getOfferObj(baseInfo.getOlId(), getOfferId()));
		}
	}
	
	/**
	 * 
	 * 说明:此处开始编写
     *
	 */
	


	public void setOfferSpecObj(OfferSpecObj offerSpecObj) {
		setValByKey("offerSpecObj", offerSpecObj);
	}

	private OfferSpecObj getOfferSpecObj() {
		if (getOfferSpecId() != null && getOfferSpecObj() != null) {
			setOfferSpecObj(specDataSMO.getOfferSpecObj(this.getOfferSpecId()));
		}
		return getOfferSpecObj();
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.linkage.bss.crm.sorule.ruleset.IMultiEntranceReusableRule#actionCRMSL_T(java.
	 * lang.String)
	 */
	public String actionCRMSCL_T(String ruleCode) {
		return buildLimitResultMsg(ruleCode, this.getOneLimitRuleResult(), "T",
				this.getLimitRuleMsg(), getActionDesc());
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.linkage.bss.crm.sorule.ruleset.IMultiEntranceReusableRule#actionCRMSL_N(java.
	 * lang.String)
	 */
	public String actionCRMSCL_N(String ruleCode) {
		return buildLimitResultMsg(ruleCode, this.getOneLimitRuleResult(), "N",
				this.getLimitRuleMsg(), getActionDesc());
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.linkage.bss.crm.sorule.ruleset.ISoPrepareRule#actionCRMSL_Y(java.
	 * lang.String)
	 */
	public String actionCRMSCL_Y(String ruleCode) {
		return buildLimitResultMsg(ruleCode, this.getOneLimitRuleResult(), "Y",
				this.getLimitRuleMsg(), getActionDesc());
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.linkage.bss.crm.sorule.ruleset.IMultiEntranceReusableRule#condYLimitGrp()
	 */
	public char condYLimitGrp() {
		return 'Y';
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.linkage.bss.crm.sorule.ruleset.IMultiEntranceReusableRule#actionLimitGrpRule(
	 * java.lang.String)
	 */
	public String actionLimitGrpRule(String ruleCode) {
		setRetVal(getLimitGrpRetval());
		return buildLimitResultMsg(ruleCode, getOneLimitRuleResult(), "T", getLimitGrpResult(), getActionDesc());
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see com.linkage.bss.crm.sorule.ruleset.SoBaseRule#init(java.util.Map)
	 */
	public Long getOlId() {
		return getValByKey("olId");
	}

	public void setOlId(Long olId) {
		setValByKey("olId", olId);
	}

	public String getBoActionTypeName() {
		return getValByKey("boActionTypeName");
	}

	public void setBoActionTypeName(String boActionTypeName) {
		setValByKey("boActionTypeName", boActionTypeName);
	}

	public OfferObj getOfferObj() {
		return getValByKey("offerObj");
	}

	public void setOfferObj(OfferObj offerObj) {
		setValByKey("offerObj", offerObj);
	}

	public String getLimitGrpRetval() {
		return getValByKey("limitGrpRetval");
	}

	public void setLimitGrpRetval(String limitGrpRetval) {
		setValByKey("limitGrpRetval", limitGrpRetval);
	}

	public String getLimitGrpResult() {
		return getValByKey("limitGrpResult");
	}

	public void setLimitGrpResult(String limitGrpResult) {
		setValByKey("limitGrpResult", limitGrpResult);
	}

	public String getLimitRuleMsg() {
		return getValByKey("limitRuleMsg");
	}

	public void setLimitRuleMsg(String limitRuleMsg) {
		setValByKey("limitRuleMsg", limitRuleMsg);
	}

	public Long getProdId() {
		return getValByKey("prodId");
	}

	public void setProdId(Long prodId) {
		setValByKey("prodId", prodId);
	}

	public Integer getProdSpecId() {
		return getValByKey("prodSpecId");
	}

	public void setProdSpecId(Integer prodSpecId) {
		setValByKey("prodSpecId", prodSpecId);
	}

	public String getAccessNumber() {
		return getValByKey("accessNumber");
	}

	public void setAccessNumber(String accessNumber) {
		setValByKey("accessNumber", accessNumber);
	}

	public OfferProdObj getOfferProdObj() {
		return getValByKey("offerProdObj");
	}

	public void setOfferProdObj(OfferProdObj offerProdObj) {
		setValByKey("offerProdObj", offerProdObj);
	}

	public Long getOfferId() {
		return getValByKey("offerId");
	}

	public void setOfferId(Long offerId) {
		setValByKey("offerId", offerId);
	}

	public Long getOfferSpecId() {
		return getValByKey("offerSpecId");
	}

	public void setOfferSpecId(Long offerSpecId) {
		setValByKey("offerSpecId", offerSpecId);
	}

	public Long getOfferRoleId() {
		return getValByKey("offerRoleId");
	}

	public void setOfferRoleId(Long offerRoleId) {
		setValByKey("offerRoleId", offerRoleId);
	}

	public Long getObjInstId() {
		return getValByKey("objInstId");
	}

	public void setObjInstId(Long objInstId) {
		setValByKey("objInstId", objInstId);
	}

	public String getBoActionTypeCd() {
		return getValByKey("boActionTypeCd");
	}

	public void setBoActionTypeCd(String boActionTypeCd) {
		setValByKey("boActionTypeCd", boActionTypeCd);
	}

	public String getActionDesc() {
		return getValByKey("actionDesc");
	}

	public void setActionDesc(String actionDesc) {
		setValByKey("actionDesc", actionDesc);
	}

	public String getProdSpecName() {
		return getValByKey("prodSpecName");
	}

	public void setProdSpecName(String prodSpecName) {
		setValByKey("prodSpecName", prodSpecName);
	}

	public String getOfferSpecName() {
		return getValByKey("offerSpecName");
	}

	public void setOfferSpecName(String offerSpecName) {
		setValByKey("offerSpecName", offerSpecName);
	}
	
	/**
	 * 本地化规则： 379产品规格在任何情况下新装时都不允许同时订购翼支付附属销售品
	 * 规则编码：CRMSCL2992003
	 * 规则入口: offer_spec_action_2_rule   109910000927 S1
	 */
	
	public char condcdmawingpaylimit() throws Exception {
		//订购已支付的时候是否是新装	
		Long prodId = null ; 
		List<OoRole> ooRoleList = null;
		// 获取 prodId;
		if(OrderListUtil.isValidateBoStatus(getBusiOrder())){
			ooRoleList = getBusiOrder().getData().getOoRoles();
			if (!SoRuleUtil.isEmptyList(ooRoleList) && ooRoleList.size() == 1) {
				for (OoRole ooRole:ooRoleList){
					if(SoRuleUtil.equals(ooRole.getOfferRoleId().longValue(),MDA.OFFER_ROLES_EPAY) && SoRuleUtil.equals(SoRuleUtil.getInt(ooRole.getObjId()),MDA.SSID_EPAY )){
						prodId = ooRole.getProdId();
						break ;
					}
				}
		    }
		}
		if(prodId == null) return 'N';

		//判断该 prodId 对应业务动作中是否有新装动作
		for (BusiOrder bo : SoRuleUtil.nvlArry(OrderListUtil.getBusiOrders(getOrderList()))) {
			if (OrderListUtil.isValidateBoStatus(bo)
					&& bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_PRODUCT){
				if(SoRuleUtil.equals(prodId, bo.getBusiObj().getInstId())
						&& SoRuleUtil.equals(bo.getBusiObj().getState(),MDA.STATE_ADD)){
					this.setLimitRuleMsg("注意,CDMA产品在新装时不能同时订购[翼支付账户]附属销售品,请检查!");
					return 'Y';  
				}
				
			}
		}
		return 'N';
	}
	

	public char custOfferArea() throws Exception{
		char retVal = 'N';
		String custArea = null;
		String offerArea = null;;
		//根据购物车id和partyid获得用户地区，然后获取用户地区名称
		PartyObj partyObj = instDataSMO.getPartyObj(getOlId(), getBaseInfo().getPartyId());
		if(partyObj == null || partyObj.getAreaId().toString().length() < 3){//取得地区编码长度小于正常长度
			return retVal;
		}
		custArea = specDataSMO.getArea(Long.parseLong(partyObj.getAreaId().toString().substring(0, 3)+"00")).getName();
		
		//获取销售品地区
		if(SoRuleUtil.equals(MDA.ACTION_CLASS_OFFER, getBusiOrder().getBoActionType().getActionClassCd())){
			if(getOrderList().getOrderListInfo().getAreaId().toString().length() > 2){
				offerArea = specDataSMO.getArea(Long.parseLong(getOrderList().getOrderListInfo().getAreaId().toString().substring(0, 3)+"00")).getName();
			}else{
				return retVal;
			}
		}
		if(!custArea.equals(offerArea)){
			setLimitRuleMsg("客户地区【" + custArea + "】和销售品地区【"+ offerArea + "】不一致，请重选安装地区！");
			retVal = 'Y';
			
		}
		return retVal;
	}
	

	public char addSmzOfferAyk() throws Exception{
		char retVal = 'N';
		OrderList orderList = getOrderList();
		if(!SoRuleUtil.equals(orderList.getOrderListInfo().getOlTypeCd().toString(), MDA.ORDER_LIST_TYPE_6)){
			retVal = 'Y';
			setLimitRuleMsg("只能通过预开户才能订购【预开户待补录】销售品");
		}
		return retVal;
	}
	
	
	/**
	 * 本地化规则： osc属性和销售品关系的规则
	 * 规则编码：CRMSCL2992010
	 * 规则入口: prod_spec_action_2_rule;bo_action_type_2_rule
	 */
	public char condocsitemchecklimit() throws Exception{
		String boActionTypeCd = getBusiOrder().getBoActionType().getBoActionTypeCd();
		Long prodId = null;
		int m = 0 ,g = 0;
		int n = 0,f =0;
		List<OfferMemberInstDto> offerMemberList = null;
		List<BoProdItem> boProdItemList =null;
		List<OoRole> ooRoleList = null;
		List<OfferProdItem> offerProdItemList = null;
		OfferProdItem offerProdItemObj = null;
		List<BusiOrder> busiOrderList = OrderListUtil.getBusiOrders(getOrderList());
		//新装情况
		if (boActionTypeCd.equals(MDA.BO_ACTION_TYPE_CD_NEW_INSTALL)){
			if(SoRuleUtil.equals(getBusiOrder().getBusiObj().getState(),MDA.STATE_ADD)){
				prodId = getProdId();
			}
			//获取当前购物车中所有的销售品订购关系
			for (BusiOrder bo : busiOrderList){
				if(OrderListUtil.isValidateBoStatus(bo) && bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_OFFER
						&& OrderListUtil.isValidateAddAo(bo.getBusiObj().getStatusCd(), bo.getBusiObj().getState())
						&& specDataSMO.getOfferSpec2CategoryNodeCountById(bo.getBusiObj().getObjId(), MDA.OFFER_SPEC_OCSOFFERSPEC.intValue()) >0 ){
					ooRoleList = bo.getData().getOoRoles();
					for (OoRole ooRole:SoRuleUtil.nvlArry(ooRoleList)){
						if(SoRuleUtil.equals(ooRole.getState(), MDA.STATE_ADD) && SoRuleUtil.equals(ooRole.getObjInstId(), prodId)){
							m ++ ;
						}
					}
				}
			}
			boProdItemList = OrderListUtil.getBoProdItemListByProdId(busiOrderList,prodId,MDA.ITEM_SPEC_OCS_ITEM);	
			//m>0 说明订购OCS销售品目录下的销售品
			if(m>0){
				if (SoRuleUtil.isEmptyList(boProdItemList)) {
					this.setLimitRuleMsg("当前新装的手机产品定购了[OCS预付资费]目录下的销售品,需要填写[OCS产品属性]属性框,请检查!");
					return 'Y';
				}
				for (BoProdItem boProdItem : boProdItemList){
					if(!boProdItem.getValue().equals(MDA.ITEM_SPEC_OCS_ITEM_OCSVALUE)
					  && MDA.STATE_ADD.equals(boProdItem.getState())){
						this.setLimitRuleMsg("当前新装的手机产品定购了[OCS预付资费]目录下的销售品,但在[OCS产品属性]属性框填写的内容不是[OCS],请检查!");
						return 'Y';
					}
				}
				
			}
			if(m ==0){
				if (SoRuleUtil.isEmptyList(boProdItemList)) {
					return 'N';
				}
				for (BoProdItem boProdItem : boProdItemList){
					if(boProdItem.getValue().equals(MDA.ITEM_SPEC_OCS_ITEM_OCSVALUE)
					  &&MDA.STATE_ADD.equals(boProdItem.getState())){
						this.setLimitRuleMsg("当前新装的手机没有定购[OCS预付资费]目录下的销售品,不允许在[OCS产品属性]属性框选择内容,请检查!");
						return 'Y';
					}
				}
			}
		}
		//改OCS属性
		if (boActionTypeCd.equals(MDA.BO_ACTION_TYPE_CD_CHANGEOCS)){
			String ocsValue = null;
			prodId = getProdId();
			boolean notOcsFlag = false ;//不是非OCS
			//获取当前业务动作新增的OCS属性值
			boProdItemList =  OrderListUtil.getBoProdItemList(getBusiOrder(),MDA.ITEM_SPEC_OCS_ITEM,MDA.STATE_ADD);
			//如果当前业务动作删除的OCS属性值为OCS值,则需要再判断当前购物车中有其他的新增动作
			if (SoRuleUtil.isEmptyList(boProdItemList)) {
				ocsValue = MDA.NULL_STR;
			}else{
				ocsValue = boProdItemList.get(0).getValue();
			}
			
			if(!ocsValue.equals(MDA.ITEM_SPEC_OCS_ITEM_OCSVALUE)){
				//当前购物车新增选择的是非OCS属性值
				notOcsFlag =true;
			}
			//获取当前业务动作删除的OCS属性值
			boProdItemList =  OrderListUtil.getBoProdItemList(getBusiOrder(),MDA.ITEM_SPEC_OCS_ITEM,MDA.STATE_DEL);
			if (!SoRuleUtil.isEmptyList(boProdItemList) && SoRuleUtil.equals(boProdItemList.get(0).getValue(), MDA.ITEM_SPEC_OCS_ITEM_OCSVALUE)) {
				boProdItemList =  OrderListUtil.getBoProdItemListByProdId(busiOrderList,prodId);
				for (BoProdItem boProdItem : SoRuleUtil.nvlArry(boProdItemList)){
					if(OrderListUtil.isValidateAddAo(boProdItem.getStatusCd(),boProdItem.getState()) 
							&& SoRuleUtil.equals(boProdItemList.get(0).getBoId(), boProdItem.getBoId())){
						n ++ ;
					}
				}
				if(n == 0){
					notOcsFlag =true;
				}	
			}
			//查询产品实例中是否已经订购了销售品	
			offerMemberList = instDataSMO.getOfferMemberDtoList(getOlId(),prodId,MDA.OBJ_TYPE_PROD_SPEC);
			
			// 查询购物车中订购/退订的销售品
			ooRoleList = OrderListUtil.getOoRoleListByProdId(busiOrderList,MDA.OBJ_TYPE_PROD_SPEC,prodId,null,null);
			//判断购物车中是否有已订购实例的退订
			for (OfferMemberInstDto offerMember : SoRuleUtil.nvlArry(offerMemberList)) {
				if (!InstDataUtil.ifValidateInstStatus(offerMember.getOmStatusCd())) {
					continue;
				}
				//查询产品实例已订购的销售品是否是OCS属性销售品
			    if (specDataSMO.getOfferSpec2CategoryNodeCountById(offerMember.getOfferSpecId(), MDA.OFFER_SPEC_OCSOFFERSPEC.intValue()) >0){
			    	m ++; //实例中订购OCS销售的数量
			    	for (OoRole ooRole:SoRuleUtil.nvlArry(ooRoleList)){
			    		//判断产品实例已经订购的OCS销售品是否存在退订
			    		if(SoRuleUtil.equals(prodId,MDA.OBJ_TYPE_PROD_SPEC.equals(ooRole.getObjType()) ? ooRole.getObjInstId(): ooRole.getProdId())
			    		   && SoRuleUtil.equals(ooRole.getState(), MDA.STATE_DEL)
			    		   && OrderListUtil.isValidateAoStatus(ooRole.getStatusCd())
			    		   && SoRuleUtil.equals(offerMember.getOfferRoleId(),ooRole.getOfferRoleId())){
			    			m --; //实例中退订的数量
			    		}
					}							
				}																	    		
			}
			//判断产品购车中新订购的OCS销售品数量
			for (BusiOrder bo:SoRuleUtil.nvlArry(busiOrderList)){
				if(OrderListUtil.isValidateAddAo(bo.getBusiObj().getStatusCd(),bo.getBusiObj().getState())
					&& bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_OFFER){
					ooRoleList = bo.getData().getOoRoles() ;
					for (OoRole ooRole:SoRuleUtil.nvlArry(ooRoleList)){
						if (SoRuleUtil.equals(MDA.OBJ_TYPE_PROD_SPEC, ooRole.getObjType()) 
								&& OrderListUtil.isValidateAddAo(ooRole.getStatusCd(),ooRole.getState())
								&& SoRuleUtil.equals(prodId,ooRole.getObjInstId())){
							 if (specDataSMO.getOfferSpec2CategoryNodeCountById(bo.getBusiObj().getObjId(), MDA.OFFER_SPEC_OCSOFFERSPEC.intValue()) >0){
								 f ++;
							 }
						}
					}
				}
			}
			if(m >0 && notOcsFlag){
				this.setLimitRuleMsg("当前实例有有效的[OCS预付资费]目录销售品,其[OCS产品属性]属性框不能为空也不能选择为[非OCS],请检查!");
				return 'Y';
			}
			if(ocsValue.equals(MDA.ITEM_SPEC_OCS_ITEM_OCSVALUE) && m < 1  && f <1){
				this.setLimitRuleMsg("当前实例没有有效的[OCS预付资费]目录销售品,其[OCS产品属性]属性框不能选[OCS],应当为空.请检查!");
				return 'Y';
			}

		}
		//订购 判断：当前订购销售品是否是OCS属性销售品;判断OCS属性值是否为1：从实例或者当前购物车获取
		if (boActionTypeCd.equals(MDA.BO_ACTION_TYPE_CD_OFFER_ORDER)){	
			List<OoRole> thisOoRoleList = getBusiOrder().getData().getOoRoles();
			if(SoRuleUtil.equals(getBusiOrder().getBusiObj().getState(),MDA.STATE_ADD)){
				if (specDataSMO.getOfferSpec2CategoryNodeCountById(getBusiOrder().getBusiObj().getObjId(), MDA.OFFER_SPEC_OCSOFFERSPEC.intValue()) >0){
					for (OoRole ooRole:SoRuleUtil.nvlArry(thisOoRoleList)){		
						if (OrderListUtil.isValidateAddAo(ooRole.getStatusCd(), ooRole.getState()) && OrderListUtil.isValidateBoStatus(getBusiOrder())
								&&SoRuleUtil.equals(MDA.OBJ_TYPE_PROD_SPEC, ooRole.getObjType())) {
							prodId = ooRole.getObjInstId();
							break;
						}
					}
				}
			}
			
			if(prodId !=null){//当前订购了OCS属性的销售品：获取当前实例的OCS属性，如果有再判断是否在当前购物车做了变更
				//判断当前购物车有无OCS属性变更
				boProdItemList = OrderListUtil.getBoProdItemListByProdId(busiOrderList,prodId,MDA.ITEM_SPEC_OCS_ITEM);
				if(boProdItemList != null && !SoRuleUtil.isEmptyList(boProdItemList)){
					for (BoProdItem boProdItem : boProdItemList){
						if(!boProdItem.getValue().equals(MDA.ITEM_SPEC_OCS_ITEM_OCSVALUE)
								&& OrderListUtil.isValidateAddAo(boProdItem.getStatusCd(), boProdItem.getState())){//OCS属性值不为：1
								this.setLimitRuleMsg("当前实例订购了[OCS预付资费]目录销售品,其[OCS产品属性]属性框应选[OSC].请检查！!");
								return 'Y';
						}
					}
				}else{
					//先从实例中获取OCS属性规格值
					offerProdItemList = instDataSMO.getOfferProdItemList(getOlId(), prodId, MDA.ITEM_SPEC_OCS_ITEM);
					offerProdItemObj = SoRuleUtil.isEmptyList(offerProdItemList) ? null: offerProdItemList.get(0);
					if (null != offerProdItemObj && SoRuleUtil.equals(offerProdItemObj.getValue(),MDA.ITEM_SPEC_OCS_ITEM_OCSVALUE)) {
						for (BoProdItem boProdItem : boProdItemList){//当前实例中有OCS属性，需要判断当前购车中有无删除动作
							if(boProdItem.getValue().equals(MDA.ITEM_SPEC_OCS_ITEM_OCSVALUE)
									  && MDA.STATE_DEL.equals(boProdItem.getState())
									  && OrderListUtil.isValidateAoStatus(boProdItem.getStatusCd())){
									this.setLimitRuleMsg("当前实例订购了[OCS预付资费]目录销售品,其[OCS产品属性]属性框应选[OSC].请检查!");
									return 'Y';
							}
						}
					}else{//如果当前实例和购物车都没有查询到OCS属性
						this.setLimitRuleMsg("当前实例订购了[OCS预付资费]目录销售品,其[OCS产品属性]属性框应选[OSC].请检查!");
						return 'Y';
					}
				}
			}else {
				for (OoRole ooRole:SoRuleUtil.nvlArry(thisOoRoleList)){		
					if (OrderListUtil.isValidateAddAo(ooRole.getStatusCd(), ooRole.getState())
							&&SoRuleUtil.equals(MDA.OBJ_TYPE_PROD_SPEC, ooRole.getObjType())) {
						prodId = ooRole.getObjInstId();
						break;
					}
				}
				if(prodId != null){
					n = instDataSMO.queryIfHaveOfferProdItemByProdIdAndItem(prodId,MDA.ITEM_SPEC_OCS_ITEM_OCSVALUE,MDA.INST_STATUS_CD_DSHIX,null,MDA.ITEM_SPEC_OCS_ITEM);
				    f = instDataSMO.queryIfHaveOfferProdItemByProdIdAndItem(prodId,MDA.ITEM_SPEC_OCS_ITEM_NOTOCSVALUE,MDA.INST_STATUS_CD_DSHENGX,getOlId(),MDA.ITEM_SPEC_OCS_ITEM);
				    //当OCS属性变更后当未到次月生效时间时,用来检查实例上是否是ocs属性的
				    if (n > 0 && f >0){
				    	this.setLimitRuleMsg("当前实例的[OCS]产品属性修改为了非OCS,并且是次月生效的,不能订购非OCS销售品.请检查!");
						return 'Y';
				    }
				}
			}
		}
		//退订：判断当前购物车是否将OCS属性的销售品全部退订,且购物车中没有新订购的OCS属性的销售品
		if (boActionTypeCd.equals(MDA.BO_ACTION_TYPE_CD_OFFER_BREAK)){
			Long offerId = null ;
			String ocsValue = null;
			//判断当前业务动作是否是OCS销售品的退订
			if(OrderListUtil.isValidateAoStatus(getBusiOrder().getBusiObj().getStatusCd()) 
					&& SoRuleUtil.equals(getBusiOrder().getBusiObj().getState(), MDA.STATE_DEL)){
				ooRoleList = getBusiOrder().getData().getOoRoles();
				for (OoRole ooRole:SoRuleUtil.nvlArry(ooRoleList)){	
					if (OrderListUtil.isValidateAoStatus(ooRole.getStatusCd())
							&& SoRuleUtil.equals(ooRole.getState(), MDA.STATE_DEL)
							&& SoRuleUtil.equals(MDA.OBJ_TYPE_PROD_SPEC,ooRole.getObjType())) {
						if(specDataSMO.getOfferSpec2CategoryNodeCountById(getBusiOrder().getBusiObj().getObjId(), MDA.OFFER_SPEC_OCSOFFERSPEC.intValue()) >0){
							prodId = ooRole.getObjInstId();
							offerId = getBusiOrder().getBusiObj().getInstId();
							break ;
						}
					}
				}
			}
			if(prodId==null || offerId == null ) return 'N'; //如果当前不是OCS销售品品退订,则直接退出
			
			//获取当前实例中订购OCS销售品且没有在当前购物车中退订的数量
			offerMemberList = instDataSMO.getOfferMemberDtoList(getOlId(),prodId,MDA.OBJ_TYPE_PROD_SPEC);
			for (OfferMemberInstDto offerMember : SoRuleUtil.nvlArry(offerMemberList)) {
				if (!InstDataUtil.ifValidateInstStatus(offerMember.getOmStatusCd())) {
					continue;
				}
				if(!SoRuleUtil.equals(offerId, offerMember.getOfferId())){
					//categoryNodeId = specDataSMO.getOfferSpec2CategoryNodeIdByOfferRoleId(offerMember.getOfferRoleId(),MDA.OFFER_SPEC_OCSOFFERSPEC.intValue());
					if(specDataSMO.getOfferSpec2CategoryNodeCountById(offerMember.getOfferSpecId(), MDA.OFFER_SPEC_OCSOFFERSPEC.intValue()) >0){
						n ++; //记录产品实例已订购OCS属性销售品的数量
						//判断在当前购物中有无退订
						for (BusiOrder bo:SoRuleUtil.nvlArry(busiOrderList)){	
							if(SoRuleUtil.equals(MDA.STATE_DEL, bo.getBusiObj().getState()) 
								&& OrderListUtil.isValidateAoStatus(bo.getBusiObj().getStatusCd())
								&& bo.getBoActionType().getActionClassCd()== MDA.ACTION_CLASS_OFFER
								&& SoRuleUtil.equals(bo.getBusiObj().getInstId(),offerMember.getOfferId())){
								n -- ;//记录实例中被退订的数量
							}
						}
					}
				}
			}
			
			//先从实例中获取OCS属性规格值
			offerProdItemList = instDataSMO.getOfferProdItemList(getOlId(), prodId, MDA.ITEM_SPEC_OCS_ITEM);
			offerProdItemObj = SoRuleUtil.isEmptyList(offerProdItemList) ? null: offerProdItemList.get(0);
			boolean ifExistsDel =false ;
			//判断当前购物车有无OCS属性变更
			boProdItemList = OrderListUtil.getBoProdItemListByProdId(busiOrderList,prodId,MDA.ITEM_SPEC_OCS_ITEM);
			if (null != offerProdItemObj) {//当前实例具有OCS属性，再判断是否存在删除
				for (BoProdItem boProdItem : SoRuleUtil.nvlArry(boProdItemList)){
					if(MDA.STATE_DEL.equals(boProdItem.getState())
					   && OrderListUtil.isValidateAoStatus(boProdItem.getStatusCd())){//如果当前购物车中存在修改OCS属性的动作
						ifExistsDel = true ;
						break ;
					}
				}
				if(ifExistsDel){//如果当前实例中获取不到OCS,则再从当前购物车中判断
					for (BoProdItem boProdItem : SoRuleUtil.nvlArry(boProdItemList)){
						if(OrderListUtil.isValidateAddAo(boProdItem.getState(), boProdItem.getStatusCd())){
							ocsValue = boProdItem.getValue() ;
							break ;
						}		  
					}
				}else{
					ocsValue = offerProdItemObj.getValue();
				}
			}else{//从当前购物才中获取
				for (BoProdItem boProdItem : SoRuleUtil.nvlArry(boProdItemList)){
					if(MDA.STATE_ADD.equals(boProdItem.getState())
					   && OrderListUtil.isValidateAoStatus(boProdItem.getStatusCd())){//如果当前购物车中存在修改OCS属性的动作
						ocsValue = boProdItem.getValue() ;
						break ;
					}
				}
			}
			if(ocsValue == null) return 'N';
			for (BoProdItem boProdItem : SoRuleUtil.nvlArry(boProdItemList)){
				if(MDA.STATE_DEL.equals(boProdItem.getState())
				   && OrderListUtil.isValidateAoStatus(boProdItem.getStatusCd())
				   && SoRuleUtil.equals(boProdItem.getValue(),MDA.ITEM_SPEC_OCS_ITEM_OCSVALUE)){//如果当前购物车中存在修改OCS属性的动作
					m ++ ;
				}
				if(MDA.STATE_ADD.equals(boProdItem.getState())
				   && OrderListUtil.isValidateAoStatus(boProdItem.getStatusCd())
				   && !SoRuleUtil.equals(boProdItem.getValue(),MDA.ITEM_SPEC_OCS_ITEM_OCSVALUE)){//如果当前购物车中存在修改OCS属性的动作
					f ++ ;
				}
			}
			//判断当前购物车中有无OCS销售品订购
			for (BusiOrder bo:SoRuleUtil.nvlArry(busiOrderList)){	
				if(OrderListUtil.isValidateAddAo(bo.getBusiObj().getStatusCd(), bo.getBusiObj().getState())
					&& bo.getBoActionType().getActionClassCd()== MDA.ACTION_CLASS_OFFER){
					ooRoleList = getBusiOrder().getData().getOoRoles();
					for (OoRole ooRole:SoRuleUtil.nvlArry(ooRoleList)){	
						if(SoRuleUtil.equals(ooRole.getObjType(), MDA.OBJ_TYPE_PROD_SPEC) && SoRuleUtil.equals(ooRole.getObjInstId(), prodId)){
							//categoryNodeId = specDataSMO.getOfferSpec2CategoryNodeIdByOfferRoleId(ooRole.getOfferRoleId(),MDA.OFFER_SPEC_OCSOFFERSPEC.intValue());	
							if(specDataSMO.getOfferSpec2CategoryNodeCountById(bo.getBusiObj().getObjId(), MDA.OFFER_SPEC_OCSOFFERSPEC.intValue()) >0){
								g ++ ;
							}
						}
					}
				}
			}
			
			if(SoRuleUtil.equals(ocsValue,MDA.ITEM_SPEC_OCS_ITEM_OCSVALUE) && m <1 && f<1 && n <1 && g <1){
				this.setLimitRuleMsg("当前实例退订了[OCS预付资费]目录销售品,其[OCS产品属性]属性框不能选[OCS].请检查!");
				return 'Y';
			}
		}
		return 'N';
	}
	
	/**
	 * 本地化规则：ocs和非ocs销售品不能同时出现在一个实例上，用销售品的订购来触发
	 * 规则编码：CRMSCL2992016
	 * 规则入口: bo_action_type_2_rule   S1
	 * 7012
	 */
	public char condocsofferorderlimit() throws Exception {
		Long prodId = null;
		int m = 0,n = 0;
		List<OoRole> ooRoleList = null;
		List<BusiOrder> busiOrderList = OrderListUtil.getBusiOrders(getOrderList());
		OfferSpecObj offerSpecObj = null;
		List<OfferSpecParam> offerSpecParams = null;
		List<OfferRoles> offerRolesList = null;
		List<OfferMemberInstDto> offerMemberList = null;
		HashSet<OfferMemberInstDto> copyOfferMemberList = new HashSet<OfferMemberInstDto>();
		
		List<OoRole> thisOoRoleList = getBusiOrder().getData().getOoRoles();
		if (!SoRuleUtil.isEmptyList(thisOoRoleList) 
			&& OrderListUtil.isValidateAddAo(getBusiOrder().getBusiObj().getStatusCd(), getBusiOrder().getBusiObj().getState())) {
			for(OoRole ooRole :thisOoRoleList){
				if(SoRuleUtil.equals(ooRole.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)){
					//categoryNodeId = specDataSMO.getOfferSpec2CategoryNodeIdByOfferRoleId(ooRole.getOfferRoleId(),MDA.OFFER_SPEC_OCSOFFERSPEC.intValue());	
					if(specDataSMO.getOfferSpec2CategoryNodeCountById(getBusiOrder().getBusiObj().getObjId(), MDA.OFFER_SPEC_OCSOFFERSPEC.intValue()) >0){
						prodId = ooRole.getObjInstId();//得到订购OCS销售品的用户
						break ;
					}
				}
			}
		}
		//判断用户实例表是否曾经订购非OCS资费（排除3类预存支付）
		if( prodId != null){
			/**
			 * 1:根据实例判断
			 */
			//查询用户所有的产品实例订购	
			offerMemberList = instDataSMO.getOfferMemberDtoList(getOlId(),prodId,MDA.OBJ_TYPE_PROD_SPEC);
			//排除不符合条件的订购实例
			for (OfferMemberInstDto offerMember : SoRuleUtil.nvlArry(offerMemberList)) {
				/**
				 * 将需要排除的数据先放在copyOfferMemberList中,最后一并删除
				 */
				//排除条件1：查询产品实例已订购的OCS销售品
			    if (specDataSMO.getOfferSpec2CategoryNodeCountById(offerMember.getOfferSpecId(), MDA.OFFER_SPEC_OCSOFFERSPEC.intValue()) >0){		
			    	copyOfferMemberList.add(offerMember);
				}
			    //排除条件2：当前购物车中有销售品删除动作的
			    for (BusiOrder bo : busiOrderList) {
			    	if (bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_OFFER
			    			&& SoRuleUtil.equals(bo.getBusiObj().getState(),MDA.STATE_DEL)
							&& OrderListUtil.isValidateAoStatus(bo.getBusiObj().getStatusCd())
							&& SoRuleUtil.equals(bo.getBusiObj().getInstId(),offerMember.getOfferId())) {
			    			copyOfferMemberList.add(offerMember);
					}
			    }
			    //排除条件3：销售是3类预支付的
			    offerSpecObj = specDataSMO.getOfferSpecObj(offerMember.getOfferSpecId());
			    if(offerSpecObj != null && SoRuleUtil.in(offerSpecObj.getCode(), SoRuleUtil.newArrayList("600000000","700000000","500000000"))){
			    	copyOfferMemberList.add(offerMember);
			    }
			    //排除条件4：销售品属性四川专用送计费预存款和赠送款
			    offerSpecParams = specDataSMO.getOfferSpecParamsByOfferSpecId(offerMember.getOfferSpecId());
				for (OfferSpecParam offerSpecParam : SoRuleUtil.nvlArry(offerSpecParams)) {
					 if (offerSpecParam.getItemSpecId() == 800000000) {
						 copyOfferMemberList.add(offerMember);
						 break ;
					 }
				}
				//排除条件5：销售品成员角色为99998(附属产品成员角色)
				offerRolesList = offerSpecObj.getOfferRoleses();
				for (OfferRoles offerRole : SoRuleUtil.nvlArry(offerRolesList)) {
					if(offerRole.getRoleCd()==99998){
						copyOfferMemberList.add(offerMember);
						break ;
					}
				}	
			}
			//将所有不符合条件的数据删除
			offerMemberList.removeAll(copyOfferMemberList);
			if (offerMemberList.size() > 0){//排除掉不符合条件之后
				this.setLimitRuleMsg("当前购物车实例订购了OCS销售品,但其上还有非OCS的销售品,请检查!");
				return 'Y';
			}	
		}else{//通过其他途径获取prodId
			if (!SoRuleUtil.isEmptyList(thisOoRoleList) 
					&& SoRuleUtil.equals(getBusiOrder().getBusiObj().getState(),MDA.STATE_ADD)) {
					for(OoRole ooRole :thisOoRoleList){
						if(SoRuleUtil.equals(ooRole.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)){
							offerSpecObj = specDataSMO.getOfferSpecObj(getBusiOrder().getBusiObj().getObjId());
							if(offerSpecObj != null && !SoRuleUtil.in(offerSpecObj.getCode(), SoRuleUtil.newArrayList("600000000","700000000","500000000"))){
								//排除条件1：
							    offerSpecParams = specDataSMO.getOfferSpecParamsByOfferSpecId(getBusiOrder().getBusiObj().getObjId());
								for (OfferSpecParam offerSpecParam : SoRuleUtil.nvlArry(offerSpecParams)) {
									 if (offerSpecParam.getItemSpecId() == 800000000)  n ++ ;
								}
								for (OfferRoles offerRole :  SoRuleUtil.nvlArry(offerSpecObj.getOfferRoleses())) {
									if(offerRole.getRoleCd()==99998 && offerSpecObj.getCode().equals("800000000")) n++ ;
								}
								if (n ==0 ){
									prodId = ooRole.getObjInstId();//得到订购OCS销售品的用户
									break ;
								}
							}
						}
					}
				}
			if(prodId == null ) return 'N';	
			offerMemberList = instDataSMO.getOfferMemberDtoList(getOlId(),prodId,MDA.OBJ_TYPE_PROD_SPEC);	
			//判断购物车中是否有已订购实例的退订
			for (OfferMemberInstDto offerMember : SoRuleUtil.nvlArry(offerMemberList)) {	
				if(specDataSMO.getOfferSpec2CategoryNodeCountById(offerMember.getOfferSpecId(), MDA.OFFER_SPEC_OCSOFFERSPEC.intValue()) >0){
					n ++ ;
					for (BusiOrder bo : busiOrderList) {
				    	if (SoRuleUtil.equals(bo.getBusiObj().getState(), MDA.STATE_DEL)
				    			&& OrderListUtil.isBoStatusNotD(bo)
								&& OrderListUtil.isValidateAoStatus(bo.getBusiObj().getStatusCd())
								&& SoRuleUtil.equals(bo.getBusiObj().getInstId(),offerMember.getOfferId())) {
				    			n -- ;
						}
				    }
				}
			}
			
			if (n > 0){//排除掉不符合条件之后
				this.setLimitRuleMsg("当前购物车实例订购了非OCS销售品,但其上还有OCS的销售品,请检查!");
				return 'Y';
			}
			/**
			 * 根据当前购物车判断
			 */
			
			for (BusiOrder bo : busiOrderList) {
		    	if (bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_OFFER
		    			&& OrderListUtil.isValidateBoStatus(bo)
						&& OrderListUtil.isValidateAddAo(bo.getBusiObj().getStatusCd(),bo.getBusiObj().getState())){
		    		ooRoleList = bo.getData().getOoRoles();
		    		for (OoRole ooRole:SoRuleUtil.nvlArry(ooRoleList)){
		    			if(SoRuleUtil.equals(ooRole.getObjType(), MDA.OBJ_TYPE_PROD_SPEC) 
		    					&& SoRuleUtil.equals(ooRole.getObjInstId(),prodId)){
		    				if(specDataSMO.getOfferSpec2CategoryNodeCountById(bo.getBusiObj().getObjId(), MDA.OFFER_SPEC_OCSOFFERSPEC.intValue()) >0){
		    					m ++ ;
		    				}
		    			}
		    		}
		    	}
		    }
			if (m > 0){//排除掉不符合条件之后
				this.setLimitRuleMsg("当前购物车实例订购了非OCS销售品,但其上还有OCS的销售品,请检查!");
				return 'Y';
			}
		}
		return 'N';
	}
	
	public char servSpeclimitOCS() throws Exception{
		char retVal = 'N';
		List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
		int count = 0;
		for(BusiOrder bo : listBusiOrders){
			if(SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
					OrderListUtil.isValidateAoStatus(bo.getBusiOrderInfo().getStatusCd())){
				BusiObj prodOrder = bo.getBusiObj();
				if(SoRuleUtil.equals(prodOrder.getInstId(), getProdId())){
					List<BoProdItem> listBoProdItems = bo.getData().getBoProdItems();
					for(BoProdItem li : listBoProdItems){
						if(SoRuleUtil.equals(li.getItemSpecId(), MDA.ITEM_SPEC_8700000) && 
								SoRuleUtil.equals(li.getValue(), MDA.ITEM_SPEC_VALUE_1) &&
								SoRuleUtil.equals(li.getState(), MDA.STATE_DEL) &&
								SoRuleUtil.in(li.getStatusCd(), SoRuleUtil.newArrayList(MDA.BO_STATU_P,MDA.BO_STATU_S))){
							return retVal;
						}
					}
				}
			}
		}
		flagBre :
			for(BusiOrder bo : listBusiOrders){
				if(OrderListUtil.isValidateAoStatus(bo.getBusiOrderInfo().getStatusCd()) && 
						SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT)){
					BusiObj prodOrder = bo.getBusiObj();
					if(SoRuleUtil.equals(prodOrder.getInstId(), getProdId())){
						List<BoProdItem> listBoProdItems = bo.getData().getBoProdItems();
						for(BoProdItem li : listBoProdItems){
							if(SoRuleUtil.equals(li.getItemSpecId(), MDA.ITEM_SPEC_8700000) && 
									SoRuleUtil.equals(li.getValue(), MDA.ITEM_SPEC_VALUE_1) &&
									OrderListUtil.isValidateAddAo(li.getStatusCd(), li.getState())){
								count ++;
								break flagBre;
							}
						}
					}
				}
			}
		if(count == 0){
			List<OfferProdItem> listOfferProdItems = instDataSMO.getOfferProdItemList(getOlId(), getProdId(), MDA.ITEM_SPEC_8700000);
			for(OfferProdItem li : SoRuleUtil.nvlArry(listOfferProdItems)){
				if(SoRuleUtil.equals(li.getValue(), MDA.ITEM_SPEC_VALUE_1)){
					count ++;
					break;
				}
			}
		}
		if(count > 0){
			count = 0;
			List<BoServOrder> listBoServOrders = getBusiOrder().getData().getBoServOrders();
			List<Integer> listServSpecIds = SoRuleUtil.newArrayList(MDA.SERV_SPEC_619,MDA.SERV_SPEC_660);
			for(BoServOrder li : SoRuleUtil.nvlArry(listBoServOrders)){
				if(SoRuleUtil.in(li.getServSpecId(), listServSpecIds)){
					if((count = specDataSMO.getServSpecsByServSpecId(listServSpecIds).size()) > 0){
						break;
					}
				}
			}
			if(count > 0){
				setLimitRuleMsg("号码【" + getAccessNumber() + "】是实时预付费用户，不能开通国际及港澳台漫游业务。需变更为其他类型套餐，并预存话费即可开通。");
				retVal = 'Y';
				return retVal;
			}else{
				List<Integer> listServSpecIds1 = SoRuleUtil.newArrayList(MDA.SERV_SPEC_380000007);
				for(BoServOrder li : SoRuleUtil.nvlArry(listBoServOrders)){
					if(SoRuleUtil.in(li.getServSpecId(), listServSpecIds1)){
						if(specDataSMO.getServSpecsByServSpecId(listServSpecIds1).size() > 0){
							setLimitRuleMsg("号码【" + getAccessNumber() + "】是OCS用户，不能关闭语音。");
							retVal = 'Y';
							return retVal;
						}
					}
				}
			}
		}
		return retVal;
	}
	public char condMifiLimit() throws Exception{
		char retVal = 'N';
		//MIFI 只能新装订购，预开户也不能订购
		List<OoRole> listOoRoles = getBusiOrder().getData().getOoRoles();
		List<BoProd2Td> listBoProd2Tds = getBusiOrder().getData().getBoProd2Tds();
		if(SoRuleUtil.equals(MDA.ACTION_CLASS_OFFER, getBusiOrder().getBoActionType().getActionClassCd())){
			BusiObj offerOrder = getBusiOrder().getBusiObj();
			if(OrderListUtil.isValidateAddAo(offerOrder.getStatusCd(), offerOrder.getState()) &&
					SoRuleUtil.equals(offerOrder.getObjId(),MDA.OFFER_SPEC_100010002635)){
				for(OoRole lii : listOoRoles){
					if(SoRuleUtil.equals(MDA.STATE_ADD, lii.getState()) &&
							SoRuleUtil.equals(lii.getObjType(),MDA.OBJ_TYPE_SERV_SPEC)){
						OfferProd offerProd = instDataSMO.getOfferProd(getOlId(), lii.getProdId() != null ? lii.getProdId() : lii.getObjInstId());
						if(offerProd != null){
							retVal = 'Y';
							setLimitRuleMsg("非新装不能订购【MiFi服务】,请检查");
							return retVal;
						}
					}
				}
			}
		}
		// 根据MIFI服务的参数“全球漫游”，限制UIM卡。已确定制卡系统使用的卡类型为“普通国际双模卡”。
	    //	根据资源提供的item_spec_id（MIFI卡标识），到rm.terminal_dev_item中进行判断。 
		int count = 0;
		BusiObj prodOrder = null;
		if(SoRuleUtil.equals(MDA.ACTION_CLASS_PRODUCT, getBusiOrder().getBoActionType().getActionClassCd())){
			prodOrder = getBusiOrder().getBusiObj();
			if(SoRuleUtil.in(prodOrder.getState(), SoRuleUtil.newArrayList(MDA.STATE_ADD,MDA.STATE_KIP))){
				List<BoServItem> listBoServItems = getBusiOrder().getData().getBoServItems();
				for(BoServItem lii : listBoServItems){
					if(OrderListUtil.isValidateAddAo(lii.getStatusCd(), lii.getState()) &&
							SoRuleUtil.equals(lii.getItemSpecId(), MDA.ITEM_SPEC_ROAM) &&
							SoRuleUtil.equals(lii.getValue(), MDA.ITEM_SPEC_VALUE_1)){
						count ++;
						break;
					}
				}
			}
		}
		if(count > 0){
			List<OfferProd2Td> listOfferProd2Tds = instDataSMO.getOfferProd2TdListByProdId(getOlId(),prodOrder.getInstId());
			List<BoProd2Td> listBoProd2Tds1 = new ArrayList<BoProd2Td>();
			List<OfferProd2Td> listOfferProd2Tds1 = new ArrayList<OfferProd2Td>();
			List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
			for(BusiOrder bo : listBusiOrders){
				if(SoRuleUtil.equals(getBusiOrder().getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
						OrderListUtil.isValidateBoStatus(bo)){
					BusiObj prodOrderTemp = bo.getBusiObj();
					if(SoRuleUtil.equals(prodOrderTemp.getInstId(), prodOrder.getInstId()) &&
							SoRuleUtil.in(prodOrder.getState(), SoRuleUtil.newArrayList(MDA.STATE_DEL,MDA.STATE_KIP))){
						List<BoProd2Td> listBoProd2Tds2 = bo.getData().getBoProd2Tds();
						for(BoProd2Td lii : listBoProd2Tds2){
							if(SoRuleUtil.equals(lii.getState(), MDA.STATE_DEL) &&
									SoRuleUtil.in(lii.getStatusCd(), SoRuleUtil.newArrayList(MDA.BO_ACTION_STATUS_P,MDA.BO_ACTION_STATUS_S))){
								listBoProd2Tds1.add(lii);
							}
						}
					}
					if(listOfferProd2Tds != null && listOfferProd2Tds.size() > 0 &&
							listBoProd2Tds1 != null && listBoProd2Tds1.size() > 0){
						for(BoProd2Td li : listBoProd2Tds1){
							for(OfferProd2Td lii : listOfferProd2Tds){
								if(SoRuleUtil.equals(li.getTerminalDevId(), lii.getTerminalDevId())){
									listOfferProd2Tds1.add(lii);
								}
							}
						}
					}
				}
			}
			//删除符合以上条件的listOfferProd2Tds1
			if(listOfferProd2Tds1 != null && listOfferProd2Tds1.size() > 0){
				listOfferProd2Tds.removeAll(listOfferProd2Tds1);
			}
			if(SoRuleUtil.isEmptyList(listOfferProd2Tds)){
				int flag1 = 0;//表示是否需要继续
				for(BusiOrder bo : listBusiOrders){
					if(SoRuleUtil.equals(getBusiOrder().getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
							OrderListUtil.isValidateBoStatus(bo)){
						BusiObj prodOrderTemp = bo.getBusiObj();
						if(SoRuleUtil.equals(prodOrderTemp.getInstId(), prodOrder.getInstId()) &&
								SoRuleUtil.in(prodOrder.getState(), SoRuleUtil.newArrayList(MDA.STATE_ADD,MDA.STATE_KIP))){
							List<BoProd2Td> listBoProd2Tds2 = bo.getData().getBoProd2Tds();
							for(BoProd2Td lii : listBoProd2Tds2){
								if(OrderListUtil.isValidateAddAo(lii.getStatusCd(), lii.getState())){
									long flag = 0;
									flag = specDataSMO.getTermianlDevItemCountById(lii.getTerminalDevId(),Long.valueOf(MDA.ITEM_SPEC_MIFI.toString()),MDA.TERMIANL_DEV_ITEM_VALUE);
									if(flag < 1){
										retVal = 'Y';
										setLimitRuleMsg("当前购物车订购了【MiFi服务】附属销售品且其上参数选择为【全球漫游】,但订购手机使用的手机卡不满足条件,请检查!");
										return retVal;
									}
									flag1++;
									break;
								}
							}
						}
					}
					if(flag1 > 0){
						break;
					}
				}
				if(flag1 == 0){
					List<BoProd2Td> listReBoProd2Tds1 = new ArrayList<BoProd2Td>();
					for(BoProd2Td li : listBoProd2Tds){
						if(SoRuleUtil.equals(li.getState(), MDA.STATE_DEL) &&
								SoRuleUtil.in(li.getStatusCd(), SoRuleUtil.newArrayList(MDA.BO_ACTION_STATUS_P,MDA.BO_ACTION_STATUS_S))){
							long flag = 0;
							flag = specDataSMO.getTermianlDevItemCountById(li.getTerminalDevId(),Long.valueOf(MDA.ITEM_SPEC_MIFI.toString()),MDA.TERMIANL_DEV_ITEM_VALUE);//获取条数
							if(flag > 0){
								listReBoProd2Tds1.add(li);
							}
						}
					}
					if(listReBoProd2Tds1 != null && listReBoProd2Tds1.size() >0){
						List<BoProd2Td> listReBoProd2Tds2 = new ArrayList<BoProd2Td>();
						for(BoProd2Td li : listBoProd2Tds){
							if(OrderListUtil.isValidateAddAo(li.getStatusCd(), li.getState())){
								long flag = 0;
								flag = specDataSMO.getTermianlDevItemCountById(li.getTerminalDevId(),Long.valueOf(MDA.ITEM_SPEC_MIFI.toString()),MDA.TERMIANL_DEV_ITEM_VALUE);//获取条数
								if(flag <= 0){
									listReBoProd2Tds2.add(li);
								}
							}
						}
						if(listReBoProd2Tds2 != null && listReBoProd2Tds2.size() > 0){
							retVal = 'Y';
							setLimitRuleMsg("当前购物车出现了将MIFI卡替换为非MIFI卡的情况,业务上不允许,请检查!");
							return retVal;
						}else{
							for(BoProd2Td li : listReBoProd2Tds2){
								for(BoProd2Td lii : listReBoProd2Tds1){
									if(SoRuleUtil.equals(li.getProd2TdId(),lii.getProd2TdId())){
										retVal = 'Y';
										setLimitRuleMsg("当前购物车出现了将MIFI卡替换为非MIFI卡的情况,业务上不允许,请检查!");
										return retVal;
									}
								}
							}
						}
					}
				}
			}else{
				long flag = 0;
				flag = specDataSMO.getTermianlDevItemCountById(listOfferProd2Tds.get(0).getTerminalDevId(),Long.valueOf(MDA.ITEM_SPEC_MIFI.toString()),MDA.TERMIANL_DEV_ITEM_VALUE);
				if(flag < 1){
					retVal = 'Y';
					setLimitRuleMsg("当前购物车订购了【MiFi服务】附属销售品且其上参数选择为【全球漫游】,但订购手机使用的手机卡不满足条件,请检查!");
					return retVal;
				}
			}
		}else{
			List<BoProd2Td> listReBoProd2Tds1 = new ArrayList<BoProd2Td>();
			for(BoProd2Td li : listBoProd2Tds){
				if(SoRuleUtil.equals(li.getState(), MDA.STATE_DEL) &&
						SoRuleUtil.in(li.getStatusCd(), SoRuleUtil.newArrayList(MDA.BO_ACTION_STATUS_P,MDA.BO_ACTION_STATUS_S))){
					long flag = 0;
					flag = specDataSMO.getTermianlDevItemCountById(li.getTerminalDevId(),Long.valueOf(MDA.ITEM_SPEC_MIFI.toString()),MDA.TERMIANL_DEV_ITEM_VALUE);//获取条数
					if(flag > 0){
						listReBoProd2Tds1.add(li);
					}
				}
			}
			if(!SoRuleUtil.isEmptyList(listReBoProd2Tds1)){
				List<BoProd2Td> listReBoProd2Tds2 = new ArrayList<BoProd2Td>();
				for(BoProd2Td li : listBoProd2Tds){
					if(OrderListUtil.isValidateAddAo(li.getStatusCd(), li.getState())){
						long flag = 0;
						flag = specDataSMO.getTermianlDevItemCountById(li.getTerminalDevId(),Long.valueOf(MDA.ITEM_SPEC_MIFI.toString()),MDA.TERMIANL_DEV_ITEM_VALUE);//获取条数
						if(flag > 0){
							listReBoProd2Tds2.add(li);
						}
					}
				}
				if(SoRuleUtil.isEmptyList(listReBoProd2Tds2)){
					retVal = 'Y';
					setLimitRuleMsg("当前购物车出现了将MIFI卡替换为非MIFI卡的情况,业务上不允许,请检查!");
					return retVal;
				}else{
					for(BoProd2Td li : listReBoProd2Tds2){
						for(BoProd2Td lii : listReBoProd2Tds1){
							if(SoRuleUtil.equals(li.getProd2TdId(),lii.getProd2TdId())){
								retVal = 'Y';
								setLimitRuleMsg("当前购物车出现了将MIFI卡替换为非MIFI卡的情况,业务上不允许,请检查!");
								return retVal;
							}
						}
					}
				}
			}
		}
		return retVal;
	}
	
	/**本地规则： 关于网络信息安全相关规则系统支撑的需求(CRM)证件校验部分
	 * 规则编码：CRMSCL2992038
	 * 2、在新增办理固网(含村村通)和移动接入(含无线通)业务入网，以及移动补/换卡、更改套餐、过户等业务时，对实名制信息不全的客户
     * （个人：必须有 身份证、军人证、护照 中的一个证件号码；组织：必须有组织机构代码、营业执照、公章 中的一个证件号码），
     * 或身份证号码不等于18位的客户，系统弹出提示框“客户缺少实名制有效证件信息，请完善客户资料”或“客户身份证号码不是18位，请修改证件号” 
	 * bo_action_type_2_rule   S1,S2,S3,1,11,280104
	 * @return
	 * @throws Exception
	 * 7000
	 * XQ2015012364004 实名制:客户身份证件优化需求  只在2.9 需求优化 ：
	 * 个人证件保留:身份证\军官证\护照  增加：警官证\港澳台通行证\户口簿；单位证件保留:工商执照\组织机构代码 取消：公章
	 */
	public char condnetsafelimit() throws Exception {
		Long partyId =null;
		String identityNum = null;
		int personIdNum = 0;
		int orgIdNum = 0;
		List<BoProdSpec> boProdSpecs = null ;
		BusiOrder busiOrder = getBusiOrder();
		String boActionTypeCd = busiOrder.getBoActionType().getBoActionTypeCd();
		if(OrderListUtil.isValidateBoStatus(getBusiOrder()) && SoRuleUtil.in(boActionTypeCd, SoRuleUtil.newArrayList(MDA.BO_ACTION_TYPE_CD_OFFER_ORDER,MDA.BO_ACTION_TYPE_CD_OFFER_BREAK,
				MDA.BO_ACTION_TYPE_CD_OFFER_ROLE,MDA.BO_ACTION_TYPE_CD_NEW_INSTALL,MDA.BO_ACTION_TYPE_CD_PROD_CUST,MDA.BO_ACTION_TYPE_CD_ADD_CARD))){
			
			if(SoRuleUtil.equals(boActionTypeCd, MDA.BO_ACTION_TYPE_CD_NEW_INSTALL) && SoRuleUtil.equals(busiOrder.getBusiObj().getState(), MDA.STATE_ADD)){
				boProdSpecs = busiOrder.getData().getBoProdSpecs();
				for (BoProdSpec bps : SoRuleUtil.nvlArry(boProdSpecs)){
					if(OrderListUtil.isValidateAddAo(bps.getStatusCd(), bps.getState())
							&& SoRuleUtil.in (bps.getProdSpecId(),SoRuleUtil.newArrayList(MDA.PSID_388,MDA.PSID_PHONE,MDA.PSID_CDMA))){
						partyId = getBaseInfo().getPartyId();
						break ;
					}
				}
			}
			if(partyId == null && SoRuleUtil.in(boActionTypeCd, SoRuleUtil.newArrayList(MDA.BO_ACTION_TYPE_CD_OFFER_ORDER,MDA.BO_ACTION_TYPE_CD_OFFER_BREAK,
					MDA.BO_ACTION_TYPE_CD_OFFER_ROLE,MDA.BO_ACTION_TYPE_CD_PROD_CUST,MDA.BO_ACTION_TYPE_CD_ADD_CARD))){
				boProdSpecs = busiOrder.getData().getBoProdSpecs();
				for (BoProdSpec bps : SoRuleUtil.nvlArry(boProdSpecs)){
					if(SoRuleUtil.equals (bps.getProdSpecId(),MDA.PSID_CDMA)){
						partyId = getBaseInfo().getPartyId();
						break ;
					}
				}
				
				if(partyId== null){
					List<OoRole> ooRoleLists = busiOrder.getData().getOoRoles();
					for (OoRole ooRole : SoRuleUtil.nvlArry(ooRoleLists)){
						if(OrderListUtil.isValidateAoStatus(ooRole.getStatusCd())
							&& SoRuleUtil.equals(ooRole.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)
							&& SoRuleUtil.equals(ooRole.getObjId(), MDA.PSID_CDMA.longValue())){
							partyId = getBaseInfo().getPartyId();
							break ;
						}
					}
				}
				if(partyId== null){
					List<BoCust> listBoCusts = busiOrder.getData().getBoCusts();
					mark : for(BoCust bc : SoRuleUtil.nvlArry(listBoCusts)){
						if(OrderListUtil.isValidateAddAo(bc.getStatusCd(), bc.getState())
							&& SoRuleUtil.in(busiOrder.getBusiObj().getState(), SoRuleUtil.newArrayList(MDA.STATE_ADD,MDA.STATE_KIP))){
							List<OfferProdSpec> offerProdSpec = instDataSMO.getOfferProdSpec(getBaseInfo().getOlId(), busiOrder.getBusiObj().getInstId());
							for (OfferProdSpec ops :SoRuleUtil.nvlArry(offerProdSpec)){
								if(SoRuleUtil.in (ops.getProdSpecId(),SoRuleUtil.newArrayList(MDA.PSID_388,MDA.PSID_PHONE,MDA.PSID_CDMA))){
									partyId = bc.getPartyId() ;
									break mark;
								}
							}
						}
					}
				}
			}
			if(partyId== null) return 'N' ;
			PartyObj partyObj = instDataSMO.getPartyObj(getOlId(), partyId);
			if (partyObj != null ) {
				List<PartyIdentity> partyIdentitys = instDataSMO.selectPartyIdentityByPartyId(partyId);
				if(!SoRuleUtil.isEmptyList(partyIdentitys)){
					if(SoRuleUtil.equals(partyObj.getPartyTypeCd(),MDA.PARTY_TYPE_PERSON)){//个人客户
						for(PartyIdentity partyIdentity:partyIdentitys){
							if(SoRuleUtil.in(partyIdentity.getIdentidiesTypeCd(), 
								SoRuleUtil.newArrayList(MDA.IDENTIFY_TYPE_1,MDA.IDENTIFY_TYPE_2,MDA.IDENTIFY_TYPE_9,
										MDA.IDENTIFY_TYPE_57,MDA.IDENTIFY_TYPE_58,MDA.IDENTIFY_TYPE_59,MDA.IDENTIFY_TYPE_60,MDA.IDENTIFY_TYPE_61))){
								personIdNum ++;
								if(partyIdentity.getIdentidiesTypeCd()==MDA.IDENTIFY_TYPE_1){
									identityNum = partyIdentity.getIdentityNum();
								}
							}	
						}
					}
					if(SoRuleUtil.in(partyObj.getPartyTypeCd(),SoRuleUtil.newArrayList(MDA.PARTY_TYPE_ORG,MDA.PARTY_TYPE_SINGLEORG,
							MDA.PARTY_TYPE_INORG,MDA.PARTY_TYPE_TELCOMORG))){//组织客户
						for(PartyIdentity partyIdentity:partyIdentitys){
							if(SoRuleUtil.in(partyIdentity.getIdentidiesTypeCd(), 
									SoRuleUtil.newArrayList(MDA.IDENTIFY_TYPE_11,MDA.IDENTIFY_TYPE_20,MDA.IDENTIFY_TYPE_56,
											MDA.IDENTIFY_TYPE_62,MDA.IDENTIFY_TYPE_63))){
								orgIdNum ++;
							}	
						}
					}
				}
			}
			
		}
		if(personIdNum==0 && orgIdNum==0){
			this.setLimitRuleMsg("客户缺少实名制有效证件信息，请完善客户资料!");
			return 'Y';
		}
		if(personIdNum >0 && identityNum !=null && identityNum.length() !=18){
			this.setLimitRuleMsg("客户身份证号码不是18位，请修改证件号!");
			return 'Y';
		}
		return 'N';
	}
	
	/**本地规则：关于没有开上网功能的用户限制办理内容计费流量包的需求
	 * 规则编码：CRMSCL2992069
	 * serv_spec_action_2_rule 68050/ADD  200000022/DEL
	 * @return
	 * @throws Exception
	 *  XQ2014031043806 关于没有开上网功能的用户限制办理内容计费流量包的需求
  	 *  如果用户没有开1X/EVDO功能，则不能办理内容计费流量包,并提示用户确认打开1X/EVDO功能后，
  	 *	方可定购内容计费流量包，以规避后台强开，降低用户投诉风险。
	 */
	public char condCheckHave1xOrEvdoServ() throws Exception {
		Long prodId = getProdId();
		String state = null ;
		Integer servSpecId = null;
		List<BoServ> boServs  = null;
		List<BoServOrder> boServOrderList = null;
		List<BusiOrder> busiOrders = null;
		boolean ifExists =false ;
		if(OrderListUtil.isValidateBoStatus(getBusiOrder()) && SoRuleUtil.equals(getBusiOrder().getBusiObj().getInstId(), prodId)){
			boServs  = getBusiOrder().getData().getBoServs();
			boServOrderList = getBusiOrder().getData().getBoServOrders();
			if (SoRuleUtil.isEmptyList(boServs) || SoRuleUtil.isEmptyList(boServOrderList)) {
				return 'N';
			}
			markOne:for (BoServ boServ : boServs) {
				if (OrderListUtil.isValidateAoStatus(boServ.getState())) {
					for (BoServOrder boServOrder : boServOrderList) {
						state = boServ.getState();
						servSpecId = boServOrder.getServSpecId();
						break markOne;
					}
				}
			}
		}
		 /*如果订购“内容计费”服务销售品(68050)，则需要判断该用户是否订购了  EVDO(200000022),如果没有订购，则提示不能继续受理*/
		if(SoRuleUtil.equals(state, MDA.STATE_ADD) && SoRuleUtil.equals(servSpecId,MDA.SSID_BILLCONTENT)){
			busiOrders =  OrderListUtil.getBusiOrders(getOrderList());
			//判断实例中获取有无订购evdo
			//根据serv_spec_id与prodId查  查询是否订购serv_spec_id
			OfferServObj offerServObj = instDataSMO.getOfferServObj(getBaseInfo().getOlId(), MDA.SERV_SPEC_EVDO, prodId);
			if (null != offerServObj && SoRuleUtil.in(offerServObj.getStatusCd(), SoRuleUtil.newArrayList(MDA.INST_STATUS_EFFECTING,MDA.INST_STATUS_EFFECTED))) {
				ifExists = true ;//实例中订购
				markTwo:for (BusiOrder bo : busiOrders) {
					boServs = bo.getData().getBoServs();
					if(SoRuleUtil.isEmptyList(boServs)) continue ;
					for (BoServ boServ : boServs) {//EVDO
						if (MDA.STATE_DEL.equals(boServ.getState()) && SoRuleUtil.equals(boServ.getServId(),offerServObj.getServId())) {
							ifExists =false ;//订购实例在购物车中存在退订
							break markTwo;
						}
					}
				}
			}
			//判断当前购物车中获取有无订购evdo
			if(!ifExists){//如果实例中已存在evdo则不需要判断当前购物车中有无订购
				markThree:for(BusiOrder bo :busiOrders){
					if(OrderListUtil.isValidateBoStatus(bo) && SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
						boServs  = bo.getData().getBoServs();
						boServOrderList = bo.getData().getBoServOrders();
						if (SoRuleUtil.isEmptyList(boServs) || SoRuleUtil.isEmptyList(boServOrderList)) {
							continue;
						}
						for (BoServ boServ : boServs) {
							if (OrderListUtil.isValidateAddAo(boServ.getState(),boServ.getState())) {
								for (BoServOrder boServOrder : boServOrderList) {
									if(SoRuleUtil.equals(boServOrder.getServSpecId(), MDA.SERV_SPEC_EVDO)){
										ifExists = true ;//当前购物车中存在订购
										break markThree;
									}
								}
							}
						}
					}
				}
			}
			if(!ifExists){
				this.setLimitRuleMsg("当前用户没有开【evdo】功能，则不能办理内容计费流量包!");
				return 'Y';
			}	
		}else if(SoRuleUtil.equals(state, MDA.STATE_DEL) && SoRuleUtil.equals(servSpecId,MDA.SERV_SPEC_EVDO)){
		 /*如果退订evdo服务(200000022)，则需要判断该用户是否订购了“内容计费”服务销售品，如果订购了且没有同时退订，则不允许退订*/
			busiOrders =  OrderListUtil.getBusiOrders(getOrderList());
			//判断实例中获取有无订购内容计费
			//根据serv_spec_id与prodId查  查询是否订购serv_spec_id
			OfferServObj offerServObj = instDataSMO.getOfferServObj(getBaseInfo().getOlId(), MDA.SSID_BILLCONTENT, prodId);
			if (null != offerServObj 
				&& SoRuleUtil.in(offerServObj.getStatusCd(), SoRuleUtil.newArrayList(MDA.INST_STATUS_EFFECTING,MDA.INST_STATUS_EFFECTED,MDA.INST_STATUS_UNEFFECT))) {
				ifExists = true ;//实例中订购
				markTwo:for (BusiOrder bo : busiOrders) {
					boServs = bo.getData().getBoServs();
					if(SoRuleUtil.isEmptyList(boServs)) continue ;
					for (BoServ boServ : boServs) {//EVDO
						if (MDA.STATE_DEL.equals(boServ.getState()) && SoRuleUtil.equals(boServ.getServId(),offerServObj.getServId())) {
							ifExists =false ;//订购实例在购物车中存在退订
							break markTwo;
						}
					}
				}
			}
			//判断当前购物车中获取有无订购内容计费
			if(!ifExists){//如果实例中已存在内容计费则不需要判断当前购物车中有无订购
				markThree:for(BusiOrder bo :busiOrders){
					if(OrderListUtil.isValidateBoStatus(bo) && SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
						boServs  = bo.getData().getBoServs();
						boServOrderList = bo.getData().getBoServOrders();
						if (SoRuleUtil.isEmptyList(boServs) || SoRuleUtil.isEmptyList(boServOrderList)) {
							continue;
						}
						for (BoServ boServ : boServs) {
							if (OrderListUtil.isValidateAddAo(boServ.getState(),boServ.getState())) {
								for (BoServOrder boServOrder : boServOrderList) {
									if(SoRuleUtil.equals(boServOrder.getServSpecId(), MDA.SSID_BILLCONTENT)){
										ifExists = true ;//当前购物车中存在订购
										break markThree;
									}
								}
							}
						}
					}
				}
			}
			
			if(ifExists){
				this.setLimitRuleMsg("您订购了【内容计费流量包】,不能退订【evdo】!");
				return 'Y';
			}
		}		
		return 'N';
	}
	
	public char condeImsVideoCall() throws Exception{
		char retVal = 'Y';
		setLimitRuleMsg("号码【" + getAccessNumber() + "】订购【智慧彩屏】业务，必须是光网小区用户，且需开通宽带产品！");
		return retVal;
	}
	
	/**
	 * 本地化规则：预开户待激活不能订购附属销售品 
	 * 规则编码：CRMSCL2992014
	 * 规则入口: bo_action_type_2_rule   S1  75
	 */
	public char condykhdjhlimit() throws Exception{
		if (!soCommonSMO.isHavaOsAuth(getBaseInfo().getStaffId(), MDA.OPERATION_AUTH_YKH)) {
			//产品动作
			int actionClassCd = getBusiOrder().getBoActionType().getActionClassCd();
			Long prodId = null;
			boolean ifExistsBusi =false ;//是否存在预开户业务动作
			//获取当前购物车的该用户所有的产品动作,判断当前购物 该用户有无801101//预开户激活 业务
			List<BusiOrder> prodOrderList = OrderListUtil.getBusiOrdersByInstId(OrderListUtil.getBusiOrders(getOrderList()), prodId);
			if (actionClassCd== MDA.ACTION_CLASS_PRODUCT && SoRuleUtil.equals(getBoActionTypeCd(),MDA.BO_ACTION_TYPE_CD_PARTY_INFO_M)){
				//判断当前购物车中有无预开户激活
				for (BusiOrder bo : prodOrderList) {
					if (OrderListUtil.isValidateBoStatus(bo)
						&& SoRuleUtil.equals(bo.getBoActionType().getBoActionTypeCd(),MDA.BO_ACTION_TYPE_CD_YKHJH)
						&& SoRuleUtil.equals(bo.getBusiObj().getInstId(),getBusiOrder().getBusiObj().getInstId())
						&& bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_PRODUCT
						&& OrderListUtil.isValidateAoStatus(bo.getBusiObj().getStatusCd())){
						ifExistsBusi =true ;
						break ;
					}
				}
				if(!ifExistsBusi){
					prodId = getProdId();
				}
			}
			//销售品动作
			if (actionClassCd== MDA.ACTION_CLASS_OFFER && SoRuleUtil.equals(getBoActionTypeCd(),MDA.BO_ACTION_TYPE_CD_OFFER_ORDER)){
				List<OoRole> thisOoRoleList = getBusiOrder().getData().getOoRoles();
				if(SoRuleUtil.in(getBusiOrder().getBusiObj().getState(), SoRuleUtil.newArrayList(MDA.STATE_ADD,MDA.STATE_DEL))
						&& SoRuleUtil.equals(getBusiOrder().getBusiObj().getState(),MDA.STATE_ADD)){
					for(OoRole ooRole : SoRuleUtil.nvlArry(thisOoRoleList)){
						if(SoRuleUtil.equals(ooRole.getObjType(),MDA.OBJ_TYPE_PROD_SPEC) 
								&&OrderListUtil.isValidateAoStatus(ooRole.getStatusCd())){
							//判断当前购物车中有无预开户激活
							for (BusiOrder bo : prodOrderList) {
								if (OrderListUtil.isValidateBoStatus(bo)
									&& SoRuleUtil.equals(bo.getBoActionType().getBoActionTypeCd(),MDA.BO_ACTION_TYPE_CD_YKHJH)
									&& SoRuleUtil.equals(bo.getBusiObj().getInstId(),ooRole.getObjInstId())
									&& bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_PRODUCT
									&& OrderListUtil.isValidateAoStatus(bo.getBusiObj().getStatusCd())
									){
									ifExistsBusi =true ;
									break ;
								}
							}
							if(!ifExistsBusi){
								prodId = ooRole.getObjInstId();
								break ;
							}
						}
					}
				}
			}
			
			if (prodId == null) return 'N';
			//获取实例用户的状态集
			List<OfferProdStatus> prodStateList= instDataSMO.getProdInstStateByProdInstId(prodId);
			if (prodStateList.size()== 0)  return 'N';
			for (OfferProdStatus offerProdStatus : SoRuleUtil.nvlArry(prodStateList)) {
				if(SoRuleUtil.equals(offerProdStatus.getProdStatusCd(),MDA.PROD_STATUS_WAIT_ACTIVE)){
					this.setLimitRuleMsg("当前号码["+instDataSMO.getOfferProd(getOlId(), prodId).getAccessNumber()+"]为[预开户待激活]状态,不能受理订购附属或资料维护业务!");
					return 'Y'; 
				}
			}
		}
		return 'N';
	}
	
	public char condeLTEAskTdCheck() throws Exception{
		char retVal = 'N';
		int flagUim = 0;//4g卡类型
		List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
		flagBre :
			for(BusiOrder bo : listBusiOrders){
				if(OrderListUtil.isValidateBoStatus(bo) &&
						SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT)){
					BusiObj prodOrder = bo.getBusiObj();
					if(SoRuleUtil.equals(prodOrder.getInstId(), getProdId())){
						List<BoProd2Td> listBoProd2Tds = bo.getData().getBoProd2Tds();
						for(BoProd2Td lii : listBoProd2Tds){
							if(SoRuleUtil.in(lii.getStatusCd(), SoRuleUtil.newArrayList(MDA.BO_ACTION_STATUS_P,MDA.BO_ACTION_STATUS_S))){
								if(specDataSMO.getTermianlDevItemTo4GById(lii.getTerminalDevId()) > 0){
									flagUim++;
									break flagBre;
								}
							}
						}
					}
				}
			}
		if(flagUim == 0){
			flagUim = instDataSMO.getTerminalDevItem4GCountByProdId(getProdId());
			if(flagUim == 0){
				retVal = 'Y';
				setLimitRuleMsg("号码【" + getAccessNumber() + "】开通4G功能，需要更换为4G卡");
				return retVal;
			}
		}
		return retVal;
	} 
	
	public char condCtoG4saoplimit() throws Exception {
		char retVal = 'N';
		String staffId = getBaseInfo().getStaffId().toString();
		if(!staffId.equals(MDA.CHANNEL_PROV_CENTER.toString())){
			//排除掉非省中心渠道受理
			return retVal;
		}
		Long prodId = null;
		List<OoRole> ooRoles = getBusiOrder().getData().getOoRoles();
		for(OoRole role : ooRoles){
			Integer servSpecId = Integer.valueOf(role.getObjId().toString());
			if(OrderListUtil.isValidateAddAo(role.getStatusCd(), role.getState())
					&& MDA.OBJ_TYPE_SERV_SPEC.equals(role.getObjType())
					&& (MDA.SERV_SPEC_619.equals(servSpecId) || MDA.SSID_GLOBAL_MY.equals(servSpecId)) ){
				prodId = role.getProdId();
				break;
			}
		}
		if(prodId == null){
			return retVal;
		}
		//判断是否校验了双模卡
		boolean isExistDualMode = false;
		boolean isExistDelDualMode = false;
		for(BusiOrder busiOrder : OrderListUtil.getBusiOrders(getOrderList())){
			if(OrderListUtil.isValidateBoStatus(busiOrder)){
				List<BoProd2Td> prod2Tds = busiOrder.getData().getBoProd2Tds();
				for(BoProd2Td prod2Td : prod2Tds){
					if(OrderListUtil.isValidateAoStatus(prod2Td.getStatusCd()) 
							&& "10302057".equals(prod2Td.getTerminalDevSpecId().toString())
							&& (MDA.DEVICE_MODEL_WDFGJK.equals(prod2Td.getDeviceModelId()) || MDA.DEVICE_MODEL_GJSMYJTK.equals(prod2Td.getDeviceModelId())) ){
						if(MDA.STATE_ADD.equals(prod2Td.getState())){
							isExistDualMode = true;
						}else if (MDA.STATE_DEL.equals(prod2Td.getState())){
							isExistDelDualMode = true;
						}
					}
				}
			}
		}
		List<OfferProd2Td> prod2Tds = instDataSMO.getOfferProd2TdListByProdId(getOlId(), prodId);
		for(OfferProd2Td prod2Td : prod2Tds) {
			if(InstDataUtil.ifValidateInstStatus(prod2Td.getStatusCd()) && "10302057".equals(prod2Td.getTerminalDevSpecId().toString())
					&& (MDA.DEVICE_MODEL_WDFGJK.equals(prod2Td.getDeviceModelId()) || MDA.DEVICE_MODEL_GJSMYJTK.equals(prod2Td.getDeviceModelId())) 
					&& !isExistDelDualMode){
				//实例表中有终端记录，且当前购物车无删除该记录的业务动作
				isExistDualMode = true;
			}
		}
		if(!isExistDualMode){ //不是双模卡
			retVal = 'Y';
			setLimitRuleMsg("当前号码开通了CtoG国际漫游，但用户手机卡不支持,请到营业厅免费更换天翼UIM卡!");
		}
		return retVal;
	}
	
	public char condoffernot4ocslimit() throws Exception {
		char retVal = 'N';
		String staffId = getBaseInfo().getStaffId().toString();
		if(!staffId.equals(MDA.CHANNEL_PROV_CENTER.toString())){
			//排除掉非省中心渠道受理
			return retVal;
		}
		Long prodId = null;
		String offerSpecName = "";
		List<OoRole> ooRoles = getBusiOrder().getData().getOoRoles();
		//获取需要开通服务的产品ID和对应销售品规格
		for(OoRole role : ooRoles){
			Integer servSpecId = Integer.valueOf(role.getObjId().toString());
			if(OrderListUtil.isValidateAoStatus(role.getStatusCd()) && MDA.STATE_ADD.equals(role.getState()) 
					&& MDA.OBJ_TYPE_SERV_SPEC.equals(role.getObjType())
					&& (servSpecId.equals(MDA.SERV_SPEC_380000007)||servSpecId.equals(MDA.SERV_SPEC_619)||servSpecId.equals(MDA.SERV_SPEC_660))){
					//“380000007--关闭语音”,“619CtoG--国际漫游”,“660--无线宽带国际漫游”
				BusiObj offerOrder = getBusiOrder().getBusiObj();
				OfferSpec offerSpec = specDataSMO.getOfferSpecById(offerOrder.getObjId());
				prodId = role.getProdId();
				offerSpecName = offerSpec.getName();
				break;
			} 
		}
		if(prodId == null || offerSpecName.equals("")){
			return retVal;
		}
		boolean isExistAddOCSOrder = false;
		for(BusiOrder busiOrder : OrderListUtil.getBusiOrders(getOrderList())){
			if(OrderListUtil.isValidateBoStatus(busiOrder) && busiOrder.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_PRODUCT 
					&& busiOrder.getBusiObj().getInstId().equals(prodId)){
				List<BoProdItem> boProdItems = busiOrder.getData().getBoProdItems();
				for(BoProdItem prodItem : boProdItems){
					if(MDA.ITEM_SPEC_8700000.equals(prodItem.getItemSpecId()) && MDA.ITEM_SPEC_VALUE_1.equals(prodItem.getValue()) 
							&& OrderListUtil.isValidateAoStatus(prodItem.getStatusCd())){
						if(MDA.STATE_DEL.equals(prodItem.getState())){
							return retVal;//如果有删除OCS产品属性的业务动作就不作限制
						}else if(MDA.STATE_ADD.equals(prodItem.getState())){
							isExistAddOCSOrder = true;
						}
					}
				}
			}
		}
		//购物车中有新装OCS产品属性的业务动作,看实例表中该产品是否有OCS产品属性
		if(!isExistAddOCSOrder){
			List<OfferProdItem> offerProdItems = instDataSMO.getOfferProdItemList(getOlId(), prodId);
			for(OfferProdItem prodItem : offerProdItems){
				if(MDA.ITEM_SPEC_8700000.equals(prodItem.getItemSpecId()) && MDA.ITEM_SPEC_VALUE_1.equals(prodItem.getValue()) 
						&& InstDataUtil.ifValidateInstStatus(prodItem.getStatusCd())){
					retVal = 'Y';
					setLimitRuleMsg("当前号码是OCS用户,不能订购"+offerSpecName);
				}
			}
		}
		return retVal;
	}

	public char condc2gbbberryrela4saoplimit() throws Exception {
		char retVal = 'N';
		String staffId = getBaseInfo().getStaffId().toString();
		if(!staffId.equals(MDA.CHANNEL_PROV_CENTER.toString())){
			//排除掉非省中心渠道受理
			return retVal;
		}
		Long prodId = null;
		if(getBusiOrder().getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_OFFER){
			BusiObj offerOrder = getBusiOrder().getBusiObj();
			if(MDA.STATE_ADD.equals(offerOrder.getState()) && MDA.OFFER_SEPC_ID_109910000654.equals(offerOrder.getObjId())){
				//当前购物车有订购gprs国际漫游
				List<OoRole> ooRoles = getBusiOrder().getData().getOoRoles();
				for(OoRole role : ooRoles){
					Integer servSpecId = Integer.valueOf(role.getObjId().toString());
					if(OrderListUtil.isValidateAddAo(role.getStatusCd(), role.getState()) 
							&& MDA.OBJ_TYPE_SERV_SPEC.equals(role.getObjType())
							&& MDA.SSID_GPRS.equals(servSpecId)){
						prodId = role.getProdId();
						break;
					}
				}
			}
		}
		if(prodId == null){
			//有取消c2g服务
			List<OoRole> ooRoles = getBusiOrder().getData().getOoRoles();
			for(OoRole role : ooRoles){
				if(OrderListUtil.isValidateAoStatus(role.getStatusCd()) && MDA.STATE_DEL.equals(role.getState())
						&& MDA.OBJ_TYPE_SERV_SPEC.equals(role.getObjType())
						&& MDA.SSID_CTOG.equals(Integer.valueOf(role.getObjId().toString()))){
					prodId = role.getProdId();
					break;
				}
			}
			if(prodId == null){
				return retVal;
			}
			String offerSpecName = "";
			Long offerId = null;
			List<OfferMember> offerMembers = instDataSMO.getOfferMemberList(getOlId(), prodId, MDA.OBJ_TYPE_PROD_SPEC);
			for(OfferMember member : SoRuleUtil.nvlArry(offerMembers)){
				if(InstDataUtil.ifValidateInstStatus(member.getStatusCd())){
					Offer offer = instDataSMO.getOffer(getOlId(), member.getOfferId());
					if(offer!= null && InstDataUtil.ifValidateInstStatus(offer.getStatusCd()) 
							&& MDA.OFFER_SEPC_ID_109910000654.equals(offer.getOfferSpecId())){
						offerId = offer.getOfferId();
						OfferSpec offerSpec = specDataSMO.getOfferSpecById(offer.getOfferSpecId());
						offerSpecName = offerSpec.getName();
					}
				}
			}
			//当前购物车是否有退订该销售品的动作
			boolean isExistDelOfferOrder = false;
			for(BusiOrder busiOrder : OrderListUtil.getBusiOrders(getOrderList())){
				if(OrderListUtil.isValidateBoStatus(busiOrder) && busiOrder.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_OFFER){
					BusiObj offerOrder = busiOrder.getBusiObj();
					if(MDA.STATE_DEL.equals(offerOrder.getState()) && OrderListUtil.isValidateAoStatus(offerOrder.getStatusCd())
							&& offerId.equals(offerOrder.getInstId())){
						isExistDelOfferOrder = true;
					}
				}
			}
			if(!isExistDelOfferOrder){
				setLimitRuleMsg("当前实例取消了[CtoG国际漫游]服务,其上的["+ offerSpecName +"]服务需同时取消,请检查!");
				return retVal = 'Y';
			}
		}else{
			//同时选了CtoG
			boolean isExistCtoG = false;
			for(BusiOrder busiOrder : OrderListUtil.getBusiOrders(getOrderList())){
				if(OrderListUtil.isValidateBoStatus(busiOrder)){
					List<OoRole> ooRoles = busiOrder.getData().getOoRoles();				
					for(OoRole role : ooRoles){
						if(OrderListUtil.isValidateAddAo(role.getStatusCd(), role.getState()) && MDA.OBJ_TYPE_SERV_SPEC.equals(role.getObjType())
								&& MDA.SSID_CTOG.equals(Integer.valueOf(role.getObjId().toString()))){
							BusiObj offerOrder = busiOrder.getBusiObj();
							if(MDA.STATE_ADD.equals(offerOrder.getState()) && MDA.OFFER_SEPC_ID_109910000619.equals(offerOrder.getObjId())){
								isExistCtoG = true;
							}
						}
					}
				}
			}
			//用一个List来存放当前购物车所有的退订销售品iD
			List<Long> offerDelList = new ArrayList<Long>();
			for(BusiOrder busiOrder : OrderListUtil.getBusiOrders(getOrderList())){
				if(OrderListUtil.isValidateBoStatus(busiOrder) && busiOrder.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_OFFER){
					BusiObj offerOrder = busiOrder.getBusiObj();
					if(MDA.STATE_DEL.equals(offerOrder.getState())){
						offerDelList.add(offerOrder.getInstId());
					}
				}
			}
			List<OfferMember> offerMembers = instDataSMO.getOfferMemberList(getOlId(), prodId, MDA.OBJ_TYPE_PROD_SPEC);
			for(OfferMember member : SoRuleUtil.nvlArry(offerMembers)){
				if(InstDataUtil.ifValidateInstStatus(member.getStatusCd())){
					Offer offer = instDataSMO.getOffer(getOlId(), member.getOfferId());
					if(InstDataUtil.ifValidateInstStatus(offer.getStatusCd()) && MDA.OFFER_SEPC_ID_109910000654.equals(offer.getOfferSpecId())
							&& offerDelList.indexOf(offer.getOfferId())==-1){
						//实例中有销售品且当前购物车中没有退订
						isExistCtoG = true;
						break;
					}
				}
			}
			if(!isExistCtoG){
				retVal = 'Y';
				setLimitRuleMsg("当前实例没有订购[CtoG国际漫游]服务,不能订购[gprs国际漫游]服务,请检查!");
			}
		}
		return retVal;
	}


	public char condofferreorderlimit() throws Exception {
		char retVal = 'N';
		String staffId = getBaseInfo().getStaffId().toString();
		if(!staffId.equals(MDA.CHANNEL_PROV_CENTER.toString())){
			//排除掉非省中心渠道受理
			return retVal;
		}
		Long offerSpecId = null;
		Long offerId = null;
		Long prodId = null;
		if(getBusiOrder().getBoActionType().getActionClassCd() ==  MDA.ACTION_CLASS_OFFER){
			BusiObj offerOrder = getBusiOrder().getBusiObj();
			if(MDA.STATE_ADD.equals(offerOrder.getState())){
				List<OoRole> ooRoles = getBusiOrder().getData().getOoRoles();
				for(OoRole role : ooRoles){
					if(OrderListUtil.isValidateAddAo(role.getStatusCd(), role.getState()) && MDA.OBJ_TYPE_SERV_SPEC.equals(role.getObjType())){
						prodId = role.getProdId();
						offerId = offerOrder.getInstId();
						offerSpecId = offerOrder.getObjId();
						break;
					}
				}
			}
		}
		if(offerSpecId==null || offerId == null || prodId == null){
			return retVal;
		}
		OfferSpec offerSpec = specDataSMO.getOfferSpecById(offerSpecId);
		if(offerSpec == null){
			return retVal;
		}
		String offerSpecName = offerSpec.getName();
		//在当前购物车中查看是否有同种销售品的订购动作
		boolean isExistDelOfferOrder = false;
		mark:
		for(BusiOrder busiOrder : OrderListUtil.getBusiOrders(getOrderList())){
			if(OrderListUtil.isValidateBoStatus(busiOrder) && busiOrder.getBoActionType().getActionClassCd() ==  MDA.ACTION_CLASS_OFFER){
				BusiObj offerOrder = busiOrder.getBusiObj();
				if(MDA.STATE_ADD.equals(offerOrder.getState())){
					List<OoRole> ooRoles = busiOrder.getData().getOoRoles();
					for(OoRole role : ooRoles){
						if(OrderListUtil.isValidateAoStatus(role.getStatusCd()) && MDA.OBJ_TYPE_SERV_SPEC.equals(role.getObjType())
								&& role.getProdId().equals(prodId)
								&& offerOrder.getObjId().equals(offerSpecId)
								&& !offerOrder.getInstId().equals(offerId)){
							if(MDA.STATE_ADD.equals(role.getState())){
								setLimitRuleMsg("号码["+ getAccessNumber() +"]在当前购物车产生了对["+ offerSpecName +"]销售品的重复订购,请检查!");
								return retVal = 'Y';
							}else if (MDA.STATE_DEL.equals(role.getState())){
								isExistDelOfferOrder = true;
								break mark;
							}
						}
					}
				}
			}
		}
		List<OfferMember> offerMembers = instDataSMO.getOfferMemberList(getOlId(), prodId, MDA.OBJ_TYPE_PROD_SPEC);
		for(OfferMember member : offerMembers){
			if(InstDataUtil.ifValidateInstStatus(member.getStatusCd())){
				Offer offer = instDataSMO.getOffer(getOlId(), member.getOfferId());
				if(InstDataUtil.ifValidateInstStatus(offer.getStatusCd()) 
						&& offerSpecId.equals(offer.getOfferSpecId())
						&& !offerId.equals(offer.getOfferId())
						&& !isExistDelOfferOrder ){
					retVal = 'Y';
					setLimitRuleMsg("号码["+ getAccessNumber() +"]在当前购物车产生了对["+ offerSpecName +"]销售品的重复订购,请检查!");
				}
			}
		}
		return retVal;
	}


	
	public char condeHxtRule() throws Exception {
		char retVal = 'N';
		String boActionTypeCodes = "'1', '3', '66', '280104', '1220'"; //和信通用户(100020001034)销售品只能要新装、换卡时订购，在拆机、换卡时退订
		boolean isNotExistRelaOrder = true;
		for(BusiOrder busiOrder : OrderListUtil.getBusiOrders(getOrderList())){
			String actionTypeCode = busiOrder.getBoActionType().getBoActionTypeCd();
			if(OrderListUtil.isValidateBoStatus(busiOrder) && boActionTypeCodes.contains(actionTypeCode)){
				isNotExistRelaOrder = false;
			}
		}
		if(isNotExistRelaOrder){//如果没有相关的动作，则限制
			setLimitRuleMsg("只能在新装、拆机、补卡时才能订购、退订[和信通用户]销售品");
			return retVal = 'Y';
		}
		//订购和信通用户(100020001034)销售品的用户终端必须是和信通终端
		String hxtMarkValue = null; //取和信通标识ID
		if(MDA.BO_ACTION_TYPE_CD_OFFER_ORDER.equals(getBoActionTypeCd())){
			for(BusiOrder busiOrder : OrderListUtil.getBusiOrders(getOrderList())){
				if(OrderListUtil.isValidateBoStatus(busiOrder)){
					List<BoProd2Td> boProd2Tds = busiOrder.getData().getBoProd2Tds();
					for (BoProd2Td boProd2Td : boProd2Tds) {
						if(OrderListUtil.isValidateAddAo(boProd2Td.getStatusCd(), boProd2Td.getState())){
							hxtMarkValue = specDataSMO.getTerminalDevItemValue(boProd2Td.getTerminalDevId(), MDA.ITEM_SPEC_30470);
						}
					}
				}
			}
		}
		if(hxtMarkValue == null){ //过程中没有的话，就到实例表中去查
			List<OoRole> ooRoles = getBusiOrder().getData().getOoRoles();
			for (OoRole ooRole : ooRoles) {
				if(OrderListUtil.isValidateAoStatus(ooRole.getStatusCd())){
					List<OfferProd2Td> offerProd2Tds = instDataSMO.getOfferProd2TdListByProdId(getOlId(), getProdId());
					for (OfferProd2Td offerProd2Td : offerProd2Tds) {
						if(InstDataUtil.ifValidateInstStatus(offerProd2Td.getStatusCd())){
							hxtMarkValue = specDataSMO.getTerminalDevItemValue(offerProd2Td.getTerminalDevId(), MDA.ITEM_SPEC_30470);
						}
					}
				}
			}
		}
		if(hxtMarkValue == null || !MDA.Y_STR.equals(hxtMarkValue)){
			retVal = 'Y';
			setLimitRuleMsg("订购[和信通用户]销售品的手机卡必须是和信通卡");
		}
		return retVal;
	}
	

	public char ifPersonOfferOrder() throws Exception{
		char retVal = 'N';
		List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
		int flag = 0;
		flagBre :
			for(BusiOrder bo : listBusiOrders){
				if(OrderListUtil.isValidateAoStatus(bo.getBusiOrderInfo().getStatusCd())){
					List<BusiOrderAttr> listBusiOrderAttrs = bo.getData().getBusiOrderAttrs();
					for(BusiOrderAttr boa : listBusiOrderAttrs){
						if(SoRuleUtil.equals(boa.getItemSpecId(), MDA.ITEM_SPEC_111111118) &&
								boa.getValue().indexOf("单位客户持个人证件办理") >= 0){
							flag++;
							break flagBre;
						}
					}
				}
			}
		if(flag == 0){
			return retVal;
		}
		/*3）限制政企特殊保底的受理、取消、更改等
		  4）限制政企交叉补贴的受理、取消、修改
		  5）限制政企大账户分小账户的受理、取消、修改
		  6）限制信息化行业应用套餐及功能费受理、取消、修改
		  限制V网类 、功能费变更等  */
		if(SoRuleUtil.in(getBoActionTypeCd(), 
				SoRuleUtil.newArrayList(MDA.BO_ACTION_TYPE_CD_OFFER_ORDER,MDA.BO_ACTION_TYPE_CD_OFFER_BREAK,
						MDA.BO_ACTION_TYPE_CD_OFFER_ROLE,MDA.BO_ACTION_TYPE_CD_OFFER_PARAM))){
			BusiOrder busiOrder = getBusiOrder();
			if(SoRuleUtil.in(busiOrder.getBoActionType().getBoActionTypeCd(), 
					SoRuleUtil.newArrayList(MDA.BO_ACTION_TYPE_CD_OFFER_ORDER,MDA.BO_ACTION_TYPE_CD_OFFER_BREAK,MDA.BO_ACTION_TYPE_CD_OFFER_PARAM)) &&
					SoRuleUtil.equals(MDA.ACTION_CLASS_OFFER, busiOrder.getBoActionType().getActionClassCd())){//s1 s2 s4
				BusiObj offerOrder = busiOrder.getBusiObj();
				if(SoRuleUtil.in(offerOrder.getState(), SoRuleUtil.newArrayList(MDA.STATE_DEL,MDA.STATE_ADD,MDA.STATE_KIP))){
					String offerSpecName = specDataSMO.getOfferSpecNameByMapId(offerOrder.getObjId(),MDA.CATAGORY_NODE_ID_1032856);
					if(offerSpecName != null){
						retVal = 'Y';
						setLimitRuleMsg("单位客户下的产品凭个人证件办理业务时，不允许办理"+offerSpecName+"的"+busiOrder.getBoActionType().getName()+"业务！");
						return retVal;
					}
				}
			}
			//上述没有满足条件 no data found
			if(SoRuleUtil.equals(busiOrder.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_OFFER_ROLE) &&
					SoRuleUtil.equals(MDA.ACTION_CLASS_OFFER, busiOrder.getBoActionType().getActionClassCd())){
				BusiObj offerOrder = busiOrder.getBusiObj(); 
				if(SoRuleUtil.equals(offerOrder.getState(), MDA.STATE_KIP)){
					List<OoRole> listOoRoles = busiOrder.getData().getOoRoles();
					for(OoRole or : listOoRoles){
						if(SoRuleUtil.equals(or.getState(), MDA.STATE_DEL)){
							String offerSpecName = specDataSMO.getOfferSpecNameWitInfoByMapId(offerOrder.getObjId(),MDA.CATAGORY_NODE_ID_1032856);
							if(offerSpecName != null){
								retVal = 'Y';
								setLimitRuleMsg("单位客户下的产品凭个人证件办理业务时，不允许办理"+offerSpecName+"的"+busiOrder.getBoActionType().getName()+"(即成员退出该融合销售品)业务！");
								return retVal;
							}
						}
					}
				}
			}
		}
		//kkkk1 限制改名、过户、主动停、拆机
		if(SoRuleUtil.in(getBoActionTypeCd(), 
				SoRuleUtil.newArrayList(MDA.BO_ACTION_TYPE_CD_PROD_BREAK,MDA.BO_ACTION_TYPE_CD_PROD_CUST,MDA.BO_ACTION_TYPE_CD_TJBHZT))){
			for(BusiOrder bo : listBusiOrders){
				if(SoRuleUtil.in(bo.getBoActionType().getBoActionTypeCd(), 
						SoRuleUtil.newArrayList(MDA.BO_ACTION_TYPE_CD_PROD_BREAK,MDA.BO_ACTION_TYPE_CD_PROD_CUST,MDA.BO_ACTION_TYPE_CD_TJBHZT)) &&
						OrderListUtil.isValidateBoStatus(bo)){
					retVal = 'Y';
					setLimitRuleMsg("单位客户下的产品凭个人证件办理业务时，不允许办理过户,主动停机,拆机等业务！");
					return retVal;
				}
			}
		}
		//kkkk2国际漫游数据业务    109910000619   offerspecid
		if(SoRuleUtil.equals(getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_OFFER_ORDER)){
			if(SoRuleUtil.equals(MDA.ACTION_CLASS_OFFER, getBusiOrder().getBoActionType().getActionClassCd())){
				BusiObj offerOrder = getBusiOrder().getBusiObj();
				if(OrderListUtil.isValidateAddAo(offerOrder.getStatusCd(), offerOrder.getState()) &&
						SoRuleUtil.in(offerOrder.getObjId(), SoRuleUtil.newArrayList(MDA.OFFER_SEPC_ID_109910000502,
								MDA.OFFER_SEPC_ID_109910000622,MDA.OFFER_SEPC_ID_109910000654,MDA.OFFER_SEPC_ID_109910000660))){
					List<OoRole> listOoRoles = getBusiOrder().getData().getOoRoles();
					for(OoRole or : listOoRoles){
						if(SoRuleUtil.equals(or.getObjType(), MDA.OBJ_TYPE_SERV_SPEC)){
                            retVal = 'Y';
           					setLimitRuleMsg("单位客户下的产品凭个人证件办理业务时【"+soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), or.getProdId(), listBusiOrders)+"】不允许订购【国际漫游】！");
           					return retVal;
						}
					}
				}
			}
		}
		//kkk3限制V网类操作：包含V网的加入、退出、小号设置  --54
		if(SoRuleUtil.in(getBoActionTypeCd(), 
				SoRuleUtil.newArrayList(MDA.BO_ACTION_TYPE_CD_OFFER_ORDER,MDA.BO_ACTION_TYPE_CD_OFFER_BREAK,
						MDA.BO_ACTION_TYPE_CD_OFFER_ROLE,MDA.BO_ACTION_TYPE_CD_SHORT_NUM))){
			for(BusiOrder bo : listBusiOrders){
				if(SoRuleUtil.equals(MDA.ACTION_CLASS_OFFER, bo.getBoActionType().getActionClassCd())){
					BusiObj offerOrder = getBusiOrder().getBusiObj();
					if(SoRuleUtil.in(offerOrder.getState(), SoRuleUtil.newArrayList(MDA.STATE_DEL,MDA.STATE_KIP))){
						if(specDataSMO.getOfferSpec2CategoryNodeCountById(offerOrder.getObjId(), MDA.CATAGORY_NODE_ID_1032857) > 0){
							List<OoRole> listOoRoles = getBusiOrder().getData().getOoRoles();
							for(OoRole or : listOoRoles){
								if(SoRuleUtil.in(or.getState(), SoRuleUtil.newArrayList(MDA.STATE_ADD,MDA.STATE_DEL)) &&
										SoRuleUtil.equals(or.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)){
									retVal = 'Y';
		           					setLimitRuleMsg("单位客户下的产品凭个人证件办理业务时,IVPN中的号码【"+soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), or.getObjInstId(), listBusiOrders)+"】不允许纳入,退出或修改短号！");
		           					return retVal;
								}
							}
						}
					}
				}
			}
			for(BusiOrder bo : listBusiOrders){
				if(OrderListUtil.isValidateBoStatus(bo) &&
						SoRuleUtil.equals(bo.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_SHORT_NUM) &&
						SoRuleUtil.equals(MDA.ACTION_CLASS_PRODUCT, bo.getBoActionType().getActionClassCd())){
					BusiObj prodOrder = getBusiOrder().getBusiObj();
					if(instDataSMO.getOfferCategoryAndOmRelaCountByMapId( prodOrder.getInstId(), MDA.CATAGORY_NODE_ID_1032857,  MDA.OBJ_TYPE_PROD_SPEC).intValue() > 0){
						retVal = 'Y';
       					setLimitRuleMsg("单位客户下的产品凭个人证件办理业务时,IVPN中的号码【"+soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodOrder.getInstId(), listBusiOrders)+"】不允许纳入,退出或修改短号！");
       					return retVal;
					}
				}
			}
		}
		//kkkk4限制集团彩铃的撤销
		if(SoRuleUtil.equals(getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_OFFER_BREAK)){
			if(SoRuleUtil.equals(MDA.ACTION_CLASS_OFFER, getBusiOrder().getBoActionType().getActionClassCd())){
				BusiObj offerOrder = getBusiOrder().getBusiObj();
				if(SoRuleUtil.in(offerOrder.getStatusCd(), SoRuleUtil.newArrayList(MDA.STATE_DEL,MDA.STATE_KIP)) &&
						SoRuleUtil.equals(offerOrder.getObjId(), MDA.OFFER_SEPC_ID_109910000183)){
					List<OoRole> listOoRoles = getBusiOrder().getData().getOoRoles();
					for(OoRole or : listOoRoles){
						if(SoRuleUtil.in(or.getStatusCd(), SoRuleUtil.newArrayList(MDA.BO_ACTION_STATUS_P,MDA.BO_ACTION_STATUS_S)) &&
								SoRuleUtil.equals(or.getState(), MDA.STATE_DEL) &&
								SoRuleUtil.equals(or.getObjType(), MDA.OBJ_TYPE_SERV_SPEC)){
							retVal = 'Y';
           					setLimitRuleMsg("单位客户下的产品凭个人证件办理业务时,IVPN中的号码【"+soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), or.getProdId(), listBusiOrders)+"】不允许退订[集团彩铃]！");
           					return retVal;
						}
					}
				}
			}
		}
		return retVal;
	}
	
	/**
	 * 本地规则：号码等级销售品修改日志 
	 * 规则编码：CRMSCL2992027
	 * bo_action_type_2_rule  S1  入口修改为 offer_spec_action_2_rule BASE_MIN_OFFER_RELA配置的销售品  S1
	 * @return
	 * @throws Exception
	 * 7012
	 */
	public char  condpnlevelchangeloglimit() throws Exception {
		Long staffId = getBaseInfo().getStaffId();
		List<BusiOrder> busiOrders = OrderListUtil.getBusiOrders(getOrderList());
		Map<String, Object> baseOfferRealInfo = null;//预存附属
		Map<String, Object> minOfferRealInfo = null;//保底附属
		Long pDepOffer = null ;//最初预存
		Long pMinpayOffer = null ;//最初保底
		Long depOffer = null ;//当前预存
		Long minpayOffer = null ;//当前预存	
		Long baseAtomActionId = null;
		Long mimAtomActionId = null;
		List<OoRole> ooRoleList = null ;
		Long prodId = null ;
		
		String staffNumber = specDataSMO.getStaffNumber(staffId);
		if(staffNumber == null) staffNumber ="当前工号";
		
		ooRoleList = getBusiOrder().getData().getOoRoles();
		if (!SoRuleUtil.isEmptyList(ooRoleList) && ooRoleList.size() >0){
			prodId =  MDA.OBJ_TYPE_PROD_SPEC.equals(ooRoleList.get(0).getObjType()) ? ooRoleList.get(0).getObjInstId(): ooRoleList.get(0).getProdId();
		}
		for(BusiOrder bo : busiOrders){
			    if(SoRuleUtil.in(bo.getBusiOrderInfo().getStatusCd(), SoRuleUtil.newArrayList(MDA.BO_STATU_P,MDA.BO_STATU_S,MDA.BO_STATU_D))
			    		&& bo.getBoActionType().getActionClassCd()== MDA.ACTION_CLASS_OFFER
			    		&& bo.getBusiObj().getState().equals(MDA.STATE_ADD)){
			    	if (!SoRuleUtil.isEmptyList(bo.getData().getOoRoles()) && bo.getData().getOoRoles().size() >0) {		
						for (OoRole ooRole:bo.getData().getOoRoles()){
							if(SoRuleUtil.equals(ooRole.getObjInstId(),prodId) //和当前业务动作的prodId相同
								&& SoRuleUtil.equals(ooRole.getObjType(),MDA.OBJ_TYPE_PROD_SPEC)){
								//获取最初预存
								baseOfferRealInfo =specDataSMO.getBaseMinOfferRealInfo(bo.getBusiObj().getObjId(),null);
								//获取最初保底
						    	minOfferRealInfo = specDataSMO.getBaseMinOfferRealInfo(null,bo.getBusiObj().getObjId());
						    	if(SoRuleUtil.isEmptyMap(baseOfferRealInfo) && SoRuleUtil.isEmptyMap(minOfferRealInfo)) continue ;
								
						    	if (baseOfferRealInfo != null &&  baseOfferRealInfo.get("baseOfferSpecId") != null){
						    		if (baseAtomActionId == null){//第一次循环原子动作
						    			baseAtomActionId = bo.getBusiObj().getAtomActionId();
						    			pDepOffer = Long.valueOf(baseOfferRealInfo.get("baseOfferSpecId").toString());//baseOfferSpecId
						    		}
						    		if(baseAtomActionId != null && baseAtomActionId.longValue() > bo.getBusiObj().getAtomActionId().longValue()){
						    			// 如果当前原子动作小于原有原子动作,则将该值赋给最小原子动作变量
						    			baseAtomActionId = bo.getBusiObj().getAtomActionId();
						    			pDepOffer = Long.valueOf(baseOfferRealInfo.get("baseOfferSpecId").toString());//baseOfferSpecId
						    		}
						    	}
						    	
						    	if (minOfferRealInfo != null &&  minOfferRealInfo.get("minOfferSpecId") != null){
						    		if (mimAtomActionId == null){//第一次循环原子动作
						    			mimAtomActionId = bo.getBusiObj().getAtomActionId();
						    			pMinpayOffer = Long.valueOf(minOfferRealInfo.get("minOfferSpecId").toString());//minOfferSpecId
						    		}
						    		if(mimAtomActionId != null && mimAtomActionId.longValue() >bo.getBusiObj().getAtomActionId().longValue()){
						    			// 如果当前原子动作小于原有原子动作,则将该值赋给最小原子动作变量
						    			mimAtomActionId = bo.getBusiObj().getAtomActionId();
						    			pMinpayOffer = Long.valueOf(minOfferRealInfo.get("minOfferSpecId").toString());//minOfferSpecId
						    		}
						    	}
						    	
							}
						}
			    	}
			    	
			    }
		 }
		if (pMinpayOffer != null && pDepOffer != null){
			baseAtomActionId = null;
			mimAtomActionId = null;
			for(BusiOrder bo : busiOrders){
			    if(OrderListUtil.isValidateBoStatus(bo)
			    	&& bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_OFFER
			    	&& OrderListUtil.isValidateAddAo(bo.getBusiObj().getStatusCd(),bo.getBusiObj().getState())){
			    	if (!SoRuleUtil.isEmptyList(bo.getData().getOoRoles()) && bo.getData().getOoRoles().size() >0) {		
						for (OoRole ooRole:bo.getData().getOoRoles()){
							if(SoRuleUtil.equals(ooRole.getObjInstId(),prodId) //和当前业务动作的prodId相同
								&& ooRole.getState().equals(MDA.STATE_ADD)
								&& SoRuleUtil.equals(ooRole.getObjType(),MDA.OBJ_TYPE_PROD_SPEC)){
								//获取最终订购的预存
								baseOfferRealInfo =specDataSMO.getBaseMinOfferRealInfo(bo.getBusiObj().getObjId(),null);
								//获取最终订购的保底
						    	minOfferRealInfo = specDataSMO.getBaseMinOfferRealInfo(null,bo.getBusiObj().getObjId());						    	
								if(SoRuleUtil.isEmptyMap(baseOfferRealInfo) && SoRuleUtil.isEmptyMap(minOfferRealInfo)) continue ;

						    	if (baseOfferRealInfo != null &&  baseOfferRealInfo.get("baseOfferSpecId") != null){
						    		if (baseAtomActionId == null){//第一次循环原子动作
						    			baseAtomActionId = bo.getBusiObj().getAtomActionId();
						    			depOffer = Long.valueOf(baseOfferRealInfo.get("baseOfferSpecId").toString());//baseOfferSpecId
						    		}
						    		if(baseAtomActionId != null && baseAtomActionId.longValue() < bo.getBusiObj().getAtomActionId().longValue()){
						    			// 如果当前原子动作小于原有原子动作,则将该值赋给最小原子动作变量
						    			baseAtomActionId = bo.getBusiObj().getAtomActionId();
						    			depOffer = Long.valueOf(baseOfferRealInfo.get("baseOfferSpecId").toString());//baseOfferSpecId
						    		}
						    	}
						    	
						    	if (minOfferRealInfo != null &&  minOfferRealInfo.get("minOfferSpecId") != null){
						    		if (mimAtomActionId == null){//第一次循环原子动作
						    			mimAtomActionId = bo.getBusiObj().getAtomActionId();
						    			minpayOffer = Long.valueOf(minOfferRealInfo.get("minOfferSpecId").toString());//minOfferSpecId
						    		}
						    		if(mimAtomActionId != null && mimAtomActionId.longValue()  < bo.getBusiObj().getAtomActionId().longValue()){
						    			// 如果当前原子动作小于原有原子动作,则将该值赋给最小原子动作变量
						    			mimAtomActionId = bo.getBusiObj().getAtomActionId();
						    			minpayOffer = Long.valueOf(minOfferRealInfo.get("minOfferSpecId").toString());//minOfferSpecId
						    		}
						    	}
								
								
							}
						}
			    	}
			    }
			}
		}
		
		if (depOffer == null) depOffer = 0L ;//最终没有剩下有效的预存销售品赋值0默认
		if (minpayOffer == null) minpayOffer = 0L ;//最终没有剩下有效的保底销售品赋值0默认
		if (!SoRuleUtil.equals(depOffer, pDepOffer)&& !SoRuleUtil.equals(minpayOffer,pMinpayOffer) && pDepOffer !=null && pMinpayOffer != null){
			String  olNbr = getOrderList().getOrderListInfo().getOlNbr();
		//记录销售品预存、保底变更日志  先删除再记录srule.Pn_Level_Change_Log
			instDataSMO.deletePnLevelChangeLog(olNbr);
			Map<String, Object> param = new HashMap<String, Object>();
			param.put("olId", olNbr);
			param.put("staffNumber", staffNumber);
			param.put("depOffer", depOffer);
			param.put("pDepOffer", pDepOffer);
			param.put("minpayOffer", minpayOffer);
			param.put("pMinpayOffer", pMinpayOffer);
			instDataSMO.insertPnLevelChangeLog(param);
		}
		return 'N';
	}
	/**
	 * 本地规则：新装、补卡手机卡类型为"云卡虚拟"（device_model_id=2841），必须订购"云卡快销"附属销售品；
	 * 卡类型不为"云卡虚拟"（device_model_id=2841）时，不能订购"云卡快销"附属销售品
	 * 旧规则编码：CRMSC99196
	 * 新规则编码：CRMSC2895018
	 * bo_action_type_2_rule  S1  入口修改为 offer_spec_action_2_rule BASE_MIN_OFFER_RELA配置的销售品  S1
	 * @return
	 * @throws Exception
	 * @author zhengyx 2014-6-27
	 * 7000
	 */
	public char condCardTypeAskYkOfferCheck() throws Exception{
		char retVal = 'N';
		Long prodId = null;
		List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
		for (BusiOrder busiOrder :listBusiOrders){
			List<OoRole> listOoRoles = busiOrder.getData().getOoRoles();
			for(OoRole or : listOoRoles){
				if(OrderListUtil.isValidateAoStatus(or.getStatusCd()) && 
						SoRuleUtil.equals(or.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)){
					prodId = or.getObjInstId();
					break;
				} 
			}
		}
		if (MDA.BO_ACTION_TYPE_CD_ADD_CARD.equals(getBusiOrder().getBoActionType().getBoActionTypeCd())||
				MDA.BO_ACTION_TYPE_CD_ADD_WCARD.equals(getBusiOrder().getBoActionType().getBoActionTypeCd())) {
			prodId=getBusiOrder().getBusiObj().getInstId();
		}
		if(prodId != null){
			//当前购物车删除的卡
			List<Long> terminalDevIdListTemps = SoRuleUtil.newArrayList();
			for(BusiOrder bo : listBusiOrders){
				if(OrderListUtil.isValidateAoStatus(bo.getBusiOrderInfo().getStatusCd()) &&
						SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
						SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
					List<BoProd2Td> listBoProd2Tds = bo.getData().getBoProd2Tds();
					for(BoProd2Td bp2t : listBoProd2Tds){
						if(OrderListUtil.isValidateAoStatus(bp2t.getStatusCd()) &&
								SoRuleUtil.equals(bp2t.getState(), MDA.STATE_DEL)){
							terminalDevIdListTemps.add(bp2t.getTerminalDevId());
						}
					}
				}
			}
			List<Long> terminalDevIdList = instDataSMO.getInstOfferProdDevId(prodId, MDA.TERMINAL_DEVICE_MODEL_TYPE_2841);
			int flag = 0;//云卡虚拟资源数
			for(Long terminaDevId : terminalDevIdList){
				if(!SoRuleUtil.in(terminaDevId, terminalDevIdListTemps)){
					flag++;
					break;
				}
			}
			if(flag == 0){
				flagBre :
					for(BusiOrder bo : listBusiOrders){
						if(OrderListUtil.isValidateBoStatus(bo) &&
								SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
								SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
							List<BoProd2Td> listBoProd2Tds = bo.getData().getBoProd2Tds();
							for(BoProd2Td bp2t : listBoProd2Tds){
								if(OrderListUtil.isValidateAoStatus(bp2t.getStatusCd()) &&
										SoRuleUtil.in(bp2t.getState(), SoRuleUtil.newArrayList(MDA.STATE_ADD,MDA.STATE_NEW)) &&
										SoRuleUtil.equals(bp2t.getDeviceModelId(), MDA.TERMINAL_DEVICE_MODEL_TYPE_2841)){
									flag++;
									break flagBre;
								}
							}
						}
					}
			}
		int offerNum =0;//订购了“云卡快销”附属销售品
		List<OfferMemberInstDto> offerMemberList = null;
		//查询产品实例中是否已经订购了“云卡快销”附属销售品
		offerMemberList = instDataSMO.getOfferMemberDtoList(getOlId(),prodId,MDA.OBJ_TYPE_PROD_SPEC);
		// 查询购物车中订购/退订的“云卡快销”附属销售品
		List<Long> ooRoleListTemps = SoRuleUtil.newArrayList();
		List<BusiOrder> S2offerOrders = OrderListUtil.getBusiOrdersByBoActionTypeCd(getOrderList(), MDA.BO_ACTION_TYPE_CD_OFFER_BREAK);
		for(BusiOrder busiOrder : S2offerOrders){
			if(MDA.OFFER_SPEC_100020003476.equals(busiOrder.getBusiObj().getObjId())){
				ooRoleListTemps.add(busiOrder.getBusiObj().getInstId());
			}
		}
		//判断购物车中是否有已订购实例的退订
		for (OfferMemberInstDto offerMember : SoRuleUtil.nvlArry(offerMemberList)) {
			if (!InstDataUtil.ifValidateInstStatus(offerMember.getOmStatusCd())) {
				continue;
			}
			if(offerMember.getOfferSpecId().equals(MDA.OFFER_SPEC_100020003476)){
				if(!SoRuleUtil.in(offerMember.getOfferId(), ooRoleListTemps)){
					offerNum++;
					break;
				}
			}																    		
		}
		if(offerNum==0){
			//获取购物车中S1的业务动作
			List<BusiOrder> offerOrders = OrderListUtil.getBusiOrdersByBoActionTypeCd(getOrderList(), MDA.BO_ACTION_TYPE_CD_OFFER_ORDER);
			for(BusiOrder busiOrder : offerOrders){
				if(MDA.OFFER_SPEC_100020003476.equals(busiOrder.getBusiObj().getObjId())){
					offerNum++;
				}
			}
		}
		
		if(flag>0&&offerNum==0){
			setLimitRuleMsg("号码【"+ soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId, listBusiOrders) + "】手机卡类型为【云卡虚拟】必须订购【云卡快销】附属销售品!");
				return 'Y';
		}else if(flag==0&&offerNum>0){
			setLimitRuleMsg("号码【"+soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId, listBusiOrders) + "】订购了【云卡快销】附属销售品，手机卡类型必须为【云卡虚拟】");
				return 'Y';
		}
		}
		return retVal;
	}
	
	public char condCardTypeAskYkOfferCheckUp() throws Exception{
		char retVal = 'N';
		Long prodId = null;
		List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
		for (BusiOrder busiOrder :listBusiOrders){
			List<OoRole> listOoRoles = busiOrder.getData().getOoRoles();
			for(OoRole or : listOoRoles){
				if(OrderListUtil.isValidateAoStatus(or.getStatusCd()) && 
						SoRuleUtil.equals(or.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)){
					prodId = or.getObjInstId();
					break;
				} 
			}
		}
		if (MDA.BO_ACTION_TYPE_CD_ADD_CARD.equals(getBusiOrder().getBoActionType().getBoActionTypeCd())||
				MDA.BO_ACTION_TYPE_CD_ADD_WCARD.equals(getBusiOrder().getBoActionType().getBoActionTypeCd())) {
			prodId=getBusiOrder().getBusiObj().getInstId();
		}
		if(prodId != null){
			//当前购物车删除的卡
			List<Long> terminalDevIdListTemps = SoRuleUtil.newArrayList();
			for(BusiOrder bo : listBusiOrders){
				if(OrderListUtil.isValidateAoStatus(bo.getBusiOrderInfo().getStatusCd()) &&
						SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
						SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
					List<BoProd2Td> listBoProd2Tds = bo.getData().getBoProd2Tds();
					for(BoProd2Td bp2t : listBoProd2Tds){
						if(OrderListUtil.isValidateAoStatus(bp2t.getStatusCd()) &&
								SoRuleUtil.equals(bp2t.getState(), MDA.STATE_DEL)){
							terminalDevIdListTemps.add(bp2t.getTerminalDevId());
						}
					}
				}
			}
			List<Long> terminalDevIdList = instDataSMO.getInstOfferProdDevId(prodId, MDA.TERMINAL_DEVICE_MODEL_TYPE_2841);
			int flag = 0;//云卡虚拟资源数
			for(Long terminaDevId : terminalDevIdList){
				if(!SoRuleUtil.in(terminaDevId, terminalDevIdListTemps)){
					flag++;
					break;
				}
			}
			if(flag == 0){
				flagBre :
					for(BusiOrder bo : listBusiOrders){
						if(OrderListUtil.isValidateBoStatus(bo) &&
								SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
								SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
							List<BoProd2Td> listBoProd2Tds = bo.getData().getBoProd2Tds();
							for(BoProd2Td bp2t : listBoProd2Tds){
								if(OrderListUtil.isValidateAoStatus(bp2t.getStatusCd()) &&
										SoRuleUtil.in(bp2t.getState(), SoRuleUtil.newArrayList(MDA.STATE_ADD,MDA.STATE_NEW)) &&
										SoRuleUtil.equals(bp2t.getDeviceModelId(), MDA.TERMINAL_DEVICE_MODEL_TYPE_2841)){
									flag++;
									break flagBre;
								}
							}
						}
					}
			}
		int offerNum =0;//订购了“云卡快销”或HB_快销附属销售品
		List<OfferMemberInstDto> offerMemberList = null;
		//查询产品实例中是否已经订购了“云卡快销”附属销售品
		offerMemberList = instDataSMO.getOfferMemberDtoList(getOlId(),prodId,MDA.OBJ_TYPE_PROD_SPEC);
		// 查询购物车中订购/退订的“云卡快销”附属销售品
		List<Long> ooRoleListTemps = SoRuleUtil.newArrayList();
		List<BusiOrder> S2offerOrders = OrderListUtil.getBusiOrdersByBoActionTypeCd(getOrderList(), MDA.BO_ACTION_TYPE_CD_OFFER_BREAK);
		for(BusiOrder busiOrder : S2offerOrders){
			if(MDA.OFFER_SPEC_100020003476.equals(busiOrder.getBusiObj().getObjId())
					|| SoRuleUtil.equals(busiOrder.getBusiObj().getObjId(), MDA.OFFER_SPEC_100010004646)){
				ooRoleListTemps.add(busiOrder.getBusiObj().getInstId());
			}
		}
		//判断购物车中是否有已订购实例的退订
		for (OfferMemberInstDto offerMember : SoRuleUtil.nvlArry(offerMemberList)) {
			if (!InstDataUtil.ifValidateInstStatus(offerMember.getOmStatusCd())) {
				continue;
			}
			if(offerMember.getOfferSpecId().equals(MDA.OFFER_SPEC_100020003476) ||
					SoRuleUtil.equals(offerMember.getOfferSpecId(), MDA.OFFER_SPEC_100010004646)){
				if(!SoRuleUtil.in(offerMember.getOfferId(), ooRoleListTemps)){
					offerNum++;
					break;
				}
			}																    		
		}
		if(offerNum==0){
			//获取购物车中S1的业务动作
			List<BusiOrder> offerOrders = OrderListUtil.getBusiOrdersByBoActionTypeCd(getOrderList(), MDA.BO_ACTION_TYPE_CD_OFFER_ORDER);
			for(BusiOrder busiOrder : offerOrders){
				if(MDA.OFFER_SPEC_100020003476.equals(busiOrder.getBusiObj().getObjId()) ||
						SoRuleUtil.equals(busiOrder.getBusiObj().getObjId(), MDA.OFFER_SPEC_100010004646)){
					offerNum++;
				}
			}
		}
		
		if(flag>0&&offerNum==0){
			setLimitRuleMsg("号码【"+ soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId, listBusiOrders) + "】手机卡类型为【云卡虚拟】必须订购【OCS_快销或HB_快销】附属销售品!");
				return 'Y';
		}else if(flag==0&&offerNum>0){
			setLimitRuleMsg("号码【"+soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId, listBusiOrders) + "】订购了【OCS_快销或HB_快销】附属销售品，手机卡类型必须为【云卡虚拟】");
				return 'Y';
		}
		}
		return retVal;
	}
	
	public char  condYkOfferAskCardTypeCheck() throws Exception{
		char retVal = 'N';
		List<OoRole> listOoRoles = getBusiOrder().getData().getOoRoles();
		Long prodId = null;
		boolean ifYkhState = false ;
		int m = 0 ;
		for(OoRole or : listOoRoles){
			if(OrderListUtil.isValidateAoStatus(or.getStatusCd()) && 
					SoRuleUtil.equals(or.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)){
				prodId = or.getObjInstId();
				break;
			} 
		}
		if(prodId != null){
			List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
			List<Long> terminalDevIdListTemps = SoRuleUtil.newArrayList();//当前购物车删除的卡
			for(BusiOrder bo : listBusiOrders){
				if(OrderListUtil.isValidateAoStatus(bo.getBusiOrderInfo().getStatusCd()) &&
						SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
						SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
					List<BoProd2Td> listBoProd2Tds = bo.getData().getBoProd2Tds();
					for(BoProd2Td bp2t : listBoProd2Tds){
						if(OrderListUtil.isValidateAoStatus(bp2t.getStatusCd()) &&
								SoRuleUtil.equals(bp2t.getState(), MDA.STATE_DEL)){
							terminalDevIdListTemps.add(bp2t.getTerminalDevId());
						}
					}
				}
			}
			List<Long> terminalDevIdList = instDataSMO.getInstOfferProdDevId(prodId, MDA.DEVICE_MODE_2841);
			int flag = 0;
			for(Long terminaDevId : terminalDevIdList){
				if(!SoRuleUtil.in(terminaDevId, terminalDevIdListTemps)){
					flag++;
					break;
				}
			}
			if(flag == 0){
				flagBre :
					for(BusiOrder bo : listBusiOrders){
						if(OrderListUtil.isValidateBoStatus(bo) &&
								SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
								SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
							List<BoProd2Td> listBoProd2Tds = bo.getData().getBoProd2Tds();
							for(BoProd2Td bp2t : listBoProd2Tds){
								if(OrderListUtil.isValidateAoStatus(bp2t.getStatusCd()) &&
										SoRuleUtil.in(bp2t.getState(), SoRuleUtil.newArrayList(MDA.STATE_ADD,MDA.STATE_NEW)) &&
										SoRuleUtil.equals(bp2t.getDeviceModelId(), MDA.DEVICE_MODE_2841)){
									flag++;
									break flagBre;
								}
							}
						}
					}
			}
			
			List<OfferProdStatus> prodStateList= instDataSMO.getProdInstStateByProdInstId(prodId);
			for (OfferProdStatus offerProdStatus : SoRuleUtil.nvlArry(prodStateList)) {
				if(SoRuleUtil.equals(offerProdStatus.getProdStatusCd(),MDA.PROD_STATUS_WAIT_ACTIVE)){
					ifYkhState = true ;
					break ;
				}
			}
			for(BusiOrder bo : listBusiOrders){
				if(OrderListUtil.isValidateBoStatus(bo) &&
						SoRuleUtil.equals(bo.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_ADD_CARD) &&
						SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
					m ++ ;
				}
			}
			
			if(flag == 0 && SoRuleUtil.equals(MDA.BO_ACTION_TYPE_CD_OFFER_ORDER, getBoActionTypeCd())){
				retVal  = 'Y';
				setLimitRuleMsg("号码【"+soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId, listBusiOrders)+"】的手机卡类型不为【云卡虚拟】不能订购【云卡快销】附属销售品");
				return retVal;
			}else if(flag > 0 && SoRuleUtil.equals(MDA.BO_ACTION_TYPE_CD_OFFER_BREAK, getBoActionTypeCd())){
				retVal  = 'Y';
				setLimitRuleMsg("号码【"+soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId, listBusiOrders)+"】的手机卡类型为【云卡虚拟】不能退订【云卡快销】附属销售品");
				return retVal;
			}else if(flag == 0 && SoRuleUtil.equals(MDA.BO_ACTION_TYPE_CD_OFFER_BREAK, getBoActionTypeCd())
					&& m >0 && ifYkhState){//预开户状态下不能进行补卡
				retVal  = 'Y';
				setLimitRuleMsg("号码【"+soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId, listBusiOrders)+"】用户状态为【预开户】状态，不允许虚卡补实卡!");
				return retVal;
			}
		}
		return retVal;
	}
	
	public char  condYkOfferAskCardTypeCheckUp() throws Exception{
		char retVal = 'N';
		List<OoRole> listOoRoles = getBusiOrder().getData().getOoRoles();
		Long prodId = null;
		boolean ifYkhState = false ;
		int m = 0 ;
		for(OoRole or : listOoRoles){
			if(OrderListUtil.isValidateAoStatus(or.getStatusCd()) && 
					SoRuleUtil.equals(or.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)){
				prodId = or.getObjInstId();
				break;
			} 
		}
		if(prodId != null){
			List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
			List<Long> terminalDevIdListTemps = SoRuleUtil.newArrayList();//当前购物车删除的卡
			for(BusiOrder bo : listBusiOrders){
				if(OrderListUtil.isValidateAoStatus(bo.getBusiOrderInfo().getStatusCd()) &&
						SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
						SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
					List<BoProd2Td> listBoProd2Tds = bo.getData().getBoProd2Tds();
					for(BoProd2Td bp2t : listBoProd2Tds){
						if(OrderListUtil.isValidateAoStatus(bp2t.getStatusCd()) &&
								SoRuleUtil.equals(bp2t.getState(), MDA.STATE_DEL)){
							terminalDevIdListTemps.add(bp2t.getTerminalDevId());
						}
					}
				}
			}
			List<Long> terminalDevIdList = instDataSMO.getInstOfferProdDevId(prodId, MDA.DEVICE_MODE_2841);
			int flag = 0;
			for(Long terminaDevId : terminalDevIdList){
				if(!SoRuleUtil.in(terminaDevId, terminalDevIdListTemps)){
					flag++;
					break;
				}
			}
			if(flag == 0){
				flagBre :
					for(BusiOrder bo : listBusiOrders){
						if(OrderListUtil.isValidateBoStatus(bo) &&
								SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
								SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
							List<BoProd2Td> listBoProd2Tds = bo.getData().getBoProd2Tds();
							for(BoProd2Td bp2t : listBoProd2Tds){
								if(OrderListUtil.isValidateAoStatus(bp2t.getStatusCd()) &&
										SoRuleUtil.in(bp2t.getState(), SoRuleUtil.newArrayList(MDA.STATE_ADD,MDA.STATE_NEW)) &&
										SoRuleUtil.equals(bp2t.getDeviceModelId(), MDA.DEVICE_MODE_2841)){
									flag++;
									break flagBre;
								}
							}
						}
					}
			}
			
			List<OfferProdStatus> prodStateList= instDataSMO.getProdInstStateByProdInstId(prodId);
			for (OfferProdStatus offerProdStatus : SoRuleUtil.nvlArry(prodStateList)) {
				if(SoRuleUtil.equals(offerProdStatus.getProdStatusCd(),MDA.PROD_STATUS_WAIT_ACTIVE)){
					ifYkhState = true ;
					break ;
				}
			}
			for(BusiOrder bo : listBusiOrders){
				if(OrderListUtil.isValidateBoStatus(bo) &&
						SoRuleUtil.equals(bo.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_ADD_CARD) &&
						SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
					m ++ ;
				}
			}
			
			if(flag == 0 && SoRuleUtil.equals(MDA.BO_ACTION_TYPE_CD_OFFER_ORDER, getBoActionTypeCd())){
				retVal  = 'Y';
				setLimitRuleMsg("号码【"+soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId, listBusiOrders)+"】的手机卡类型不为【云卡虚拟】不能订购【OCS_快销或HB_快销】附属销售品");
				return retVal;
			}else if(flag > 0 && SoRuleUtil.equals(MDA.BO_ACTION_TYPE_CD_OFFER_BREAK, getBoActionTypeCd())){
				//判断是否当前购物车是否有重新订购销售品
				for(BusiOrder bo : listBusiOrders){
					if(OrderListUtil.isValidateBoStatus(bo) && SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_OFFER)
							&& SoRuleUtil.equals(bo.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_OFFER_ORDER) &&
							SoRuleUtil.in(bo.getBusiObj().getObjId(), SoRuleUtil.newArrayList(MDA.OFFER_SPEC_100020003476,MDA.OFFER_SPEC_100010004646))){
						List<OoRole> listRoles = bo.getData().getOoRoles();
						for(OoRole oor : listRoles){
							if(OrderListUtil.isValidateAoStatus(oor.getStatusCd()) && SoRuleUtil.equals(oor.getObjInstId(), prodId)){
								return retVal;
							}
						}
					}
				}
				retVal  = 'Y';
				setLimitRuleMsg("号码【"+soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId, listBusiOrders)+"】的手机卡类型为【云卡虚拟】不能退订【OCS_快销或HB_快销】附属销售品");
				return retVal;
			}else if(flag == 0 && SoRuleUtil.equals(MDA.BO_ACTION_TYPE_CD_OFFER_BREAK, getBoActionTypeCd())
					&& m >0 && ifYkhState){//预开户状态下不能进行补卡
				retVal  = 'Y';
				setLimitRuleMsg("号码【"+soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId, listBusiOrders)+"】用户状态为【预开户】状态，不允许虚卡补实卡!");
				return retVal;
			}
		}
		return retVal;
	}

	public char condeIsmpbServUpdate() throws Exception{
		char retVal = 'N';
		if(SoRuleUtil.equals(getProdSpecId(), MDA.PROD_SEPC_ISMPB)){
			List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
			for(BusiOrder bo : listBusiOrders){
				if(OrderListUtil.isValidateBoStatus(bo) &&
						SoRuleUtil.equals(bo.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_NEW_INSTALL)){
					return retVal;
				}
			}
			retVal = 'Y';
			setLimitRuleMsg("开通商务领航ISMP-B的业务只能通过新装进行，不能通过服务信息变动等方式受理,如需变更请先对老业务做拆机再新装。");
		}
		return retVal;
	}
	/**
	 * 本地化规则：[四川]翼支付缴费助手规则
	 * 规则编码：CRMSCL2992086
	 * 规则入口: serv_spec_action_2_rule(13409240,ADD) prod_spec_action_2_rule.bo_action_2_rule
	 */
    public char condWingPayHelperLimit() throws Exception{
    	Long prodId = getProdId();
    	int num  = 0;
		Long acctId = null;
		OfferServObj offerServObj = null;
		List<BoPaymentAccount> boPaymentAccountList = null;
		List<OfferProdAccount> offerProdAccountList = null;
    	List<BusiOrder> busiOrderList = OrderListUtil.getBusiOrders(getOrderList());
    	if(SoRuleUtil.equals(getBusiOrder().getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_CHANGE_SERV)){
			offerProdAccountList = instDataSMO.getOfferProdAccountListByProdId(getOlId(), prodId);
			if (!SoRuleUtil.isEmptyList(offerProdAccountList)){
				acctId = offerProdAccountList.get(0).getAcctId();
			}else{//如果实例表找不到就看过程表
				List<BoAccountRela> boAccountRelaList = null;
				mark:for(BusiOrder boa : busiOrderList){
					if(SoRuleUtil.equals(boa.getBusiObj().getInstId(), prodId)){
						boAccountRelaList = boa.getData().getBoAccountRelas();
						for (BoAccountRela boAccountRela : SoRuleUtil.nvlArry(boAccountRelaList)) {
							if(OrderListUtil.isValidateAddAo(boAccountRela.getStatusCd(), boAccountRela.getState())){
								acctId = boAccountRela.getAcctId();
								break mark;
							}
						}
					}
				}
			}
			if(acctId != null){
				//限制银行托收账户订购“翼支付交费助手（服务）”
				num = instDataSMO.getBankAccountIdByAcctId(acctId,MDA.PAYMENT_ACCT_TYPE_CD_3);
				if(num >0){
					setLimitRuleMsg("手机账户已办理银行托收，如需订购翼支付交费助手请新建账户或将该账户取消银行托收!");
					return  'Y';
				}else{
					for(BusiOrder bo : busiOrderList){
						if(bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_ACCT
								&& !SoRuleUtil.equals(bo.getBusiObj().getState(), MDA.STATE_DEL)
								&& SoRuleUtil.equals(bo.getBusiObj().getInstId(),acctId)){
							boPaymentAccountList = bo.getData().getBoPaymentAccounts();
							for (BoPaymentAccount bpa : SoRuleUtil.nvlArry(boPaymentAccountList)) {
								if(OrderListUtil.isValidateAoStatus(bpa.getStatusCd())
										&& SoRuleUtil.equals(bpa.getPaymentAcctTypeCd(), MDA.PAYMENT_ACCT_TYPE_CD_3)){
									setLimitRuleMsg("手机账户已办理银行托收，如需订购翼支付交费助手请新建账户或将该账户取消银行托收!");
									return  'Y';
								}
							}
						}
					}
				}
			}
    	}else if(SoRuleUtil.in(getBusiOrder().getBoActionType().getBoActionTypeCd(),SoRuleUtil.newArrayList(MDA.BO_ACTION_TYPE_CD_FEE_TYPE,MDA.BO_ACTION_TYPE_CD_CHANGEOCS))){
    		//限制订购了“翼支付交费助手（服务）”销售品的用户，办理预后互改（bo_action_type_cd = 1244）和过户（bo_action_type_cd = 11）动作
    		offerServObj = instDataSMO.getOfferServObj(getBaseInfo().getOlId(), MDA.SSID_EPAY_HELP, getProdId());
    		if(offerServObj != null && SoRuleUtil.in(offerServObj.getStatusCd(), SoRuleUtil.newArrayList(MDA.INST_STATUS_UNEFFECT,
					MDA.INST_STATUS_EFFECTING,MDA.INST_STATUS_EFFECTED))){
    			setLimitRuleMsg("订购翼支付交费助手的号码["+ soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(),prodId,OrderListUtil.getBusiOrders(getOrderList()))+"]不允许办理预后互改业务和改OCS属性!");
				return  'Y';
    		}
    	}else if (SoRuleUtil.equals(getBusiOrder().getBoActionType().getBoActionTypeCd(),MDA.BO_ACTION_TYPE_CD_PROD_CUST)){
    		//如果订购了交费助手的用户也不允许过户到银行托收用户下
    		offerServObj = instDataSMO.getOfferServObj(getBaseInfo().getOlId(), MDA.SSID_EPAY_HELP, getProdId());
    		if(offerServObj != null && SoRuleUtil.in(offerServObj.getStatusCd(), SoRuleUtil.newArrayList(MDA.INST_STATUS_UNEFFECT,
					MDA.INST_STATUS_EFFECTING,MDA.INST_STATUS_EFFECTED))){
    			//用户过户时需要判断有无同时修改其合同号,直接判断过程数据
				List<BoAccountRela> boAccountRelaList = null;
				mark:for(BusiOrder boa : busiOrderList){
					if(SoRuleUtil.equals(boa.getBusiObj().getInstId(), getProdId())){
						boAccountRelaList = boa.getData().getBoAccountRelas();
						for (BoAccountRela boAccountRela : SoRuleUtil.nvlArry(boAccountRelaList)) {
							if(OrderListUtil.isValidateAddAo(boAccountRela.getStatusCd(), boAccountRela.getState())){
								acctId = boAccountRela.getAcctId();
								break mark;
							}
						}
					}
				}
    			if(acctId != null){
    				num = instDataSMO.getBankAccountIdByAcctId(acctId,MDA.PAYMENT_ACCT_TYPE_CD_3);
    				if(num >0){
    					setLimitRuleMsg("翼支付交费助手号码["+ soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(),prodId,OrderListUtil.getBusiOrders(getOrderList()))+"]不允过户到银行托收用户下!");
    					return  'Y';
    				}else{
    					for(BusiOrder bo : busiOrderList){
    						if(bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_ACCT
    								&& !SoRuleUtil.equals(bo.getBusiObj().getState(), MDA.STATE_DEL)
    								&& SoRuleUtil.equals(bo.getBusiObj().getInstId(),acctId)){
    							boPaymentAccountList = bo.getData().getBoPaymentAccounts();
    							for (BoPaymentAccount bpa : SoRuleUtil.nvlArry(boPaymentAccountList)) {
    								if(OrderListUtil.isValidateAoStatus(bpa.getStatusCd())
    										&& SoRuleUtil.equals(bpa.getPaymentAcctTypeCd(), MDA.PAYMENT_ACCT_TYPE_CD_3)){
    									setLimitRuleMsg("翼支付交费助手号码["+ soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(),prodId,OrderListUtil.getBusiOrders(getOrderList()))+"]不允过户到银行托收用户下!");
    			    					return  'Y';
    								}
    							}
    						}
    					}
    				}
    			}
    		}
    		
    	}else if (SoRuleUtil.in(getBusiOrder().getBoActionType().getBoActionTypeCd(),SoRuleUtil.newArrayList(MDA.BO_ACTION_TYPE_CD_ADD_ACCT,MDA.BO_ACTION_TYPE_CD_MODIFY_ACCT))){
    		List<BoAccountInfo> boAccountInfoList = null ;
    		for(BusiOrder bo : busiOrderList){
				if(bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_ACCT){
					boAccountInfoList = bo.getData().getBoAccountInfos();
					for (BoAccountInfo boAccountInfo : ListUtil.nvlList(boAccountInfoList)) {
						if(OrderListUtil.isValidateAddAo(boAccountInfo.getStatusCd(), boAccountInfo.getState())){
							boPaymentAccountList = bo.getData().getBoPaymentAccounts();
							for (BoPaymentAccount bpa : SoRuleUtil.nvlArry(boPaymentAccountList)) {
								if(OrderListUtil.isValidateAddAo(bpa.getStatusCd(), bpa.getState())
										&& SoRuleUtil.equals(bpa.getPaymentAcctTypeCd(), MDA.PAYMENT_ACCT_TYPE_CD_3)
										&& instDataSMO.getAccountIdByAcctIdAndServSpecId(null, bo.getBusiObj().getInstId()) > 0){
									
										setLimitRuleMsg("该账户下的手机成员订购翼支付交费助手，不允许进行银行托收!");
										return  'Y';
									
								}
							}
						}
					}
				}
			}
    	}else {
    		List<BoAccountRela> boAccountRelaList = getBusiOrder().getData().getBoAccountRelas();
			for (BoAccountRela boAccountRela : SoRuleUtil.nvlArry(boAccountRelaList)) {
				if(OrderListUtil.isValidateAddAo(boAccountRela.getStatusCd(), boAccountRela.getState())
						&& boAccountRela.getAcctProdId()!= null
						&& instDataSMO.getAccountIdByAcctIdAndServSpecId(boAccountRela.getAcctProdId(),null) > 0){
					acctId = boAccountRela.getAcctId();
					break ;
				}
			}
			if(acctId != null){
				num = instDataSMO.getBankAccountIdByAcctId(acctId,MDA.PAYMENT_ACCT_TYPE_CD_3);
				if(num >0){
					setLimitRuleMsg("该账户下的手机成员订购翼支付交费助手，不允许进行银行托收!");
					return  'Y';
				}
			}
    	}
    	return 'N';
    }
    
    /**
	 *本地化规则：IPTV互动影视账号及资费规则
	 * 规则编码：CRMSCL2992048
	 * 规则入口: offer_spec_action_2_rule   S1
	 * @return
	 * @throws Exception
	 */
	public char hdysAccountAndCostLimit() throws Exception{
		List<BusiOrder> busiOrders = OrderListUtil.getBusiOrders(getOrderList());
		List<BoRela> boRelaList = null;
		BusiOrderObj relaBusiOrder= null;
		Set<String> allNum = new HashSet<String>();
		Set<String> needDelNum = new HashSet<String>();
		Set<String> defParamNum = new HashSet<String>();
		Set<String> sourceNum = new HashSet<String>();
		for(BusiOrder bo : busiOrders){
			if(bo.getBoActionType().getActionClassCd() ==MDA.ACTION_CLASS_OFFER){
				List<OfferSpecParam> offerSpecParamList = specDataSMO.getOfferSpecParamsByOfferSpecId(bo.getBusiObj().getObjId());
				if (SoRuleUtil.isEmptyList(offerSpecParamList)){
					continue ;
				}
				//判断订购数量
				for(OfferSpecParam param : offerSpecParamList){
					if( OrderListUtil.isValidateBoStatus(bo) && OrderListUtil.isValidateAddAo(bo.getBusiObj().getStatusCd(), bo.getBusiObj().getState())
							&& SoRuleUtil.equals(param.getItemSpecId(),MDA.ITEM_SPEC_BASE_IPTV)
							&& SoRuleUtil.equals(param.getDefaultValue(),MDA.Y_STR)){
						allNum.add(param.getDefaultValue());
						boRelaList = bo.getBoRelas();
						if(!SoRuleUtil.isEmptyList(boRelaList)){
							for (BoRela boRela : boRelaList) {
								relaBusiOrder = soDataSMO.queryBusiOrderOfDB(getBaseInfo().getOlId(), boRela.getRelaBoId());
								if (relaBusiOrder!=null && !relaBusiOrder.getStatusCd().equals(MDA.BO_STATU_D)
										&& SoRuleUtil.equals(relaBusiOrder.getBoActionTypeCd(),MDA.BO_ACTION_TYPE_CD_REPEAL)){
									needDelNum.add(param.getDefaultValue());
								}
							}
						}
					}
					//判断清晰度是否一致
					if(SoRuleUtil.equals(param.getItemSpecId(),MDA.ITEM_SPEC_663105) && OrderListUtil.isValidateAddAo(bo.getBusiObj().getStatusCd(), bo.getBusiObj().getState())){
						defParamNum.add(param.getDefaultValue());
					}
					//判断片源
					if(SoRuleUtil.equals(param.getItemSpecId(),MDA.ITEM_SPEC_SOURCE) && OrderListUtil.isValidateAddAo(bo.getBusiObj().getStatusCd(), bo.getBusiObj().getState())){
						sourceNum.add(param.getDefaultValue());
					}
				}
			}
		}
		
		if(allNum.size() - needDelNum.size() >1){
			this.setLimitRuleMsg("您选择了多个IPTV基础包，请重新受理!");
			return 'Y';
		}
		if(defParamNum.size() >1){
			this.setLimitRuleMsg("您选择的IPTV包，清晰度不一致，请重新受理!");
			return 'Y';
		}
		
		if(sourceNum.size()>1){
			this.setLimitRuleMsg("您选择的IPTV包，片源不一致，请重新受理!");
			return 'Y';
		}
		return 'N';
	}
	
	/**
	 * 规则编码:CRMSCL2997037
	 * 规则名称：宜宾乐山的集团彩铃服务只有ivr平台能够受理
	 * 时间：2012-02-27
	 * 入口:offer_spec_action_2_rule  109910000183集团彩铃  S1 S2   
	 * 地区:四川
	 * @return
	 * @throws Exception
	 * @Author TQ
	 */
	public char condcllimitlimit() throws Exception{
		this.setLimitRuleMsg("注意,宜宾,乐山前台不能订购或退订[集团彩铃]附属销售品!");
		return 'Y';
	}

	public char condservchannellimit() throws Exception{
		char retVal = 'N';
		Long offerSpecId  = getOfferSpecId();
		Integer channelId = getOrderList().getOrderListInfo().getChannelId();
		if(!channelCanServSpec2(offerSpecId,channelId)){
			retVal = 'Y';
			setLimitRuleMsg("当前受理渠道暂不能订购【"+soCommonSMO.getOfferSpecNameById(offerSpecId)+"】附属销售品!");
			return retVal;
		}
		return retVal;
	}
	
	private boolean channelCanServSpec2(Long offerSpecId,Integer channelId){
		int count = 0;
		//此渠道不能开通
		count = howChannel2ServSpec2(offerSpecId, channelId, 1);
		if(count > 0){
			return false;
		}
		//仅此渠道才能开通
		count = howChannel2ServSpec2(offerSpecId, null, 2);
		if(count > 0){
			count = howChannel2ServSpec2(offerSpecId, channelId, 2);
			if(count == 0){
				return false;
			}
		}
		//此渠道只能开通
		count = howChannel2ServSpec2(null, channelId, 3);
		if(count > 0){
			count = howChannel2ServSpec2(offerSpecId, channelId, 3);
			if(count == 0){
				return false;
			}
		}
		return true;
	}
	
	private int howChannel2ServSpec2(Long offerSpecId,Integer channelId,Integer flag){
		int flagCount = 0;
		int servSpecId = -9;
		try {
			if(offerSpecId != null){
				servSpecId = instDataSMO.getChannel2ServSpecIdByOffSpeId(offerSpecId);
			}
		} catch (Exception e) {
			servSpecId = -9;
		}
		flagCount = instDataSMO.getChannel2ServSpecCount(servSpecId, channelId, flag);
		return flagCount;
	}

	public char condeTDPhonePstnRule() throws Exception{
		char retVal = 'N';
		//加入“无线通”的固话必须是新装,加入“无线通”的村村通必须是老用户。
		List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
		if(SoRuleUtil.equals(getProdSpecId(), MDA.PSID_PHONE)){//是固话
			int flag = 0;
			flagBre :
				for(BusiOrder bo : listBusiOrders){
					if(SoRuleUtil.in(bo.getBusiOrderInfo().getStatusCd(), 
							SoRuleUtil.newArrayList(MDA.BO_ACTION_STATUS_P,MDA.BO_ACTION_STATUS_S,MDA.BO_ACTION_STATUS_N))){
						List<BoProdRela> listBoProdRelas = bo.getData().getBoProdRelas();
						for(BoProdRela bpr : listBoProdRelas){
							if(OrderListUtil.isValidateAoStatus(bpr.getStatusCd()) && 
									SoRuleUtil.equals(bpr.getReasonCd(), MDA.PROD_REASON_CD_SHARE) &&
									SoRuleUtil.equals(bpr.getRelatedProdId(), getProdId())){
								flag++;
								break flagBre;
							}
						}
					}
				}
			if(flag == 0){
				flag = instDataSMO.getOffPro2ProAndOffProByProdId(getProdId(), MDA.PROD_REASON_CD_SHARE).intValue();
			}
			if(flag > 0){
				retVal = 'Y';
				setLimitRuleMsg("纳入【无线通】的固话产品不能绑定ADSL！");
				return retVal;
			}
		}
		if(SoRuleUtil.equals(getProdSpecId(), MDA.PSID_388)){//是村村通
			for(BusiOrder bo : listBusiOrders){
				if(OrderListUtil.isValidateBoStatus(bo) && 
						SoRuleUtil.equals(MDA.ACTION_CLASS_PRODUCT, bo.getBoActionType().getActionClassCd())){
					BusiObj prodOrder = bo.getBusiObj();
					if(OrderListUtil.isValidateAddAo(prodOrder.getStatusCd(), prodOrder.getState()) &&
							SoRuleUtil.equals(prodOrder.getInstId(), getProdId())){
						retVal = 'Y';
						setLimitRuleMsg("纳入【无线通】的村村通产品必须是已存在的老用户！");
						return retVal;
					}
				}
			}
		}
		//纳入无线通多产品销售品的固话成员只能开无线通允许开通服务目录中的服务
		for(BusiOrder bo : listBusiOrders){
			if(OrderListUtil.isValidateBoStatus(bo) && 
					SoRuleUtil.equals(MDA.ACTION_CLASS_PRODUCT, bo.getBoActionType().getActionClassCd())){
				BusiObj prodOrder = bo.getBusiObj();
				if(SoRuleUtil.equals(prodOrder.getInstId(), getProdId())){
					List<BoServ> listBoServs = bo.getData().getBoServs();
					for(BoServ bs : listBoServs){
						if(OrderListUtil.isValidateAoStatus(bs.getStatusCd()) &&
								SoRuleUtil.equals(bs.getState(), MDA.STATE_ADD)){
							List<BoServOrder> listBoServOrders = bo.getData().getBoServOrders();
							for(BoServOrder bso : listBoServOrders){
								ServSpec servSpec = specDataSMO.getServSpecsById(bso.getServSpecId());
								if(servSpec != null && servSpec.getName() != null &&
										specDataSMO.getServSpec2CategoryNodeCountById(bso.getServSpecId().longValue(), MDA.CATAGORY_NODE_ID_1034000) == 0){
									retVal = 'Y';
									setLimitRuleMsg("纳入无线通多产品销售品的固话成员不能开通【" + servSpec.getName() + "】");
									return retVal;
								}
							}
						}
					}
				}
			}
		}
		// --已有“无线通”多产品销售品不能通过成员变更操作进行固话成员更换
		for(BusiOrder bo : listBusiOrders){
			if(OrderListUtil.isValidateAoStatus(bo.getBusiOrderInfo().getStatusCd()) &&
					SoRuleUtil.equals(bo.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_OFFER_ROLE)){
				List<OoRole> listOoRoles = bo.getData().getOoRoles();
				for(OoRole or : listOoRoles){
					if(SoRuleUtil.in(or.getStatusCd(), SoRuleUtil.newArrayList(MDA.BO_ACTION_STATUS_P,MDA.BO_ACTION_STATUS_S)) &&
							SoRuleUtil.equals(or.getState(), MDA.STATE_DEL)){
						if(instDataSMO.getOffMemAndOffSpeParByInst(or.getOfferMemberId(), MDA.ITEM_SPEC_109041003, SoRuleUtil.newArrayList(MDA.PSID_PHONE,MDA.PSID_388)).intValue() > 0){
							retVal = 'Y';
							setLimitRuleMsg("已有【无线通】多产品销售品不能通过成员变更操作进行固话成员更换！");
							return retVal;
						}
					}
				}
			}
		}
		return retVal;
	}
	
	/**本地规则：IPTV互动影视账号必须有一个主账号，如果有子账号必须满足子账号等于主账号后加1-9数字
	 * 规则编码：CRMSCL2992050
	 * Prod_Spec_Action_2_Rule 
	 * @return
	 * @throws Exception
	 * 7012
	 */
	public char hdysAccountlimit() throws Exception {
		
		Set<String> allNumberSet = new HashSet<String>();
		Set<String> mainNumberSet = new HashSet<String>();
		List<BoProdRela> listBoProdRelas = null;
		List<OfferProd2AccessNumber> offerProd2AccessNumberList = null ;
		List<BoProd2An> boProd2Ans = null;
		List<OoParam> ooParams = null;
		List<OoRole> ooRoles = null;
		List<BusiOrder> busiOrders = OrderListUtil.getBusiOrders(getOrderList());
		List<BusiOrder> prodOrders = null ;
		for(BusiOrder bo : busiOrders){
			boProd2Ans = OrderListUtil.getBoProd2AnList(bo, null);
			if (SoRuleUtil.isEmptyList(boProd2Ans)) {
				continue ;
			}
			for (BoProd2An bp2an : boProd2Ans) {
				if(OrderListUtil.isValidateAoStatus(bp2an.getStatusCd())
					&& bp2an.getAccessNumber().contains("@ITV")){
					if(!bp2an.getState().equals(MDA.STATE_DEL)){//当前购车中非删除状态
						allNumberSet.add(bp2an.getAccessNumber().substring(0,bp2an.getAccessNumber().indexOf("@ITV")));//新订购的
					}
					listBoProdRelas = bo.getData().getBoProdRelas();
					for(BoProdRela bpr : listBoProdRelas){
						if(OrderListUtil.isValidateAoStatus(bpr.getStatusCd())){
							offerProd2AccessNumberList = instDataSMO.getAccessNumberByRelatedProdId(bpr.getRelatedProdId());
							if (!SoRuleUtil.isEmptyList(offerProd2AccessNumberList)) {
								for (OfferProd2AccessNumber offerProd2AccessNumber : offerProd2AccessNumberList) {
									if(offerProd2AccessNumber.getAccessNumber().contains("@ITV")
											&& SoRuleUtil.in(offerProd2AccessNumber.getStatusCd(), SoRuleUtil.newArrayList(MDA.INST_STATUS_EFFECTED,MDA.INST_STATUS_INEFFECT,MDA.INST_STATUS_INEFFECTING))){
										allNumberSet.add(offerProd2AccessNumber.getAccessNumber().substring(0,offerProd2AccessNumber.getAccessNumber().indexOf("@ITV")));//没有退订的账号
									}
								}
							}
						}
					}
				}
			}
		}
		if(allNumberSet.size() > 1){
			setLimitRuleMsg("所有账号@符号前得字符串应该相同!");
			return 'Y';
		}
		for(BusiOrder bo : busiOrders){
			boProd2Ans = OrderListUtil.getBoProd2AnList(bo, null);
			if (SoRuleUtil.isEmptyList(boProd2Ans)) {
				continue ;
			}
			for (BoProd2An bp2an : boProd2Ans) {
				if(OrderListUtil.isValidateAoStatus(bp2an.getStatusCd())){
					if(bp2an.getAccessNumber().endsWith("@ITV") && !bp2an.getState().equals(MDA.STATE_DEL)){//当前购车中非删除状态
						mainNumberSet.add(bp2an.getAccessNumber());//新订购的
					}
					listBoProdRelas = bo.getData().getBoProdRelas();
					for(BoProdRela bpr : listBoProdRelas){
						if(OrderListUtil.isValidateAoStatus(bpr.getStatusCd())){
							offerProd2AccessNumberList = instDataSMO.getAccessNumberByRelatedProdId(bpr.getRelatedProdId());
							if (!SoRuleUtil.isEmptyList(offerProd2AccessNumberList)) {
								for (OfferProd2AccessNumber offerProd2AccessNumber : offerProd2AccessNumberList) {
									if(offerProd2AccessNumber.getAccessNumber().endsWith("@ITV")
											&& SoRuleUtil.in(offerProd2AccessNumber.getStatusCd(), SoRuleUtil.newArrayList(MDA.INST_STATUS_EFFECTED,MDA.INST_STATUS_INEFFECT,MDA.INST_STATUS_INEFFECTING))){
										mainNumberSet.add(offerProd2AccessNumber.getAccessNumber());//没有退订的账号
									}
								}
							}
						}
					}
				}
			}
		}
		if(mainNumberSet.size() == 0){
			setLimitRuleMsg("所有账号必须有一个主账号，如xxxxxxxx@ITV!");
			return 'Y';
		}

		for(BusiOrder bo : busiOrders){
			if(bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_OFFER){
				ooParams = bo.getData().getOoParams();
				for(OoParam param : SoRuleUtil.nvlArry(ooParams)){
					OfferSpecParam offerSpecParam = specDataSMO.getOfferSpecParam(param.getOfferSpecParamId());
					if(SoRuleUtil.equals(offerSpecParam.getItemSpecId(),MDA.ITEM_SPEC_BASE_IPTV)){
						if(OrderListUtil.isValidateAoStatus(param.getStatusCd())){
							ooRoles = bo.getData().getOoRoles();
							for (OoRole ooRole : SoRuleUtil.nvlArry(ooRoles)) {
								if(OrderListUtil.isValidateAddAo(ooRole.getStatusCd(), ooRole.getState())){	
									//查询出所有该用户所有的产品动作
									prodOrders = OrderListUtil.getProdOrderBoList(getOrderList(), ooRole.getObjInstId(), null);
									for(BusiOrder po : prodOrders){
										boProd2Ans = OrderListUtil.getBoProd2AnList(po, MDA.STATE_ADD);
										for (BoProd2An an : boProd2Ans) {
											if(SoRuleUtil.equals(param.getValue(),MDA.N_STR)){
												Pattern p= Pattern.compile("ITV[2-9]");
												//Matcher m = p.matcher(an.getAccessNumber().substring(an.getAccessNumber().indexOf("@")+1)); 
												Matcher m = p.matcher(an.getAccessNumber().substring(an.getAccessNumber().lastIndexOf("@")+1)); 
												boolean b = m.matches();
												if(!b){
													setLimitRuleMsg("可选包IPTV账号后缀需要加2-9的任意数字，如:xxxxxxxx@ITV2!");
													return 'Y';
												}
											}else if(SoRuleUtil.equals(param.getValue(),MDA.Y_STR)
													&& !an.getAccessNumber().endsWith("@ITV")){
												setLimitRuleMsg("基础IPTV账号后缀不需要加数字，如:xxxxxxxx@ITV!");
												return 'Y';
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		return 'N';
	}
	
	public char condWingPayFeetypeLimit() throws Exception{
		Long prodId = getBusiOrder().getBusiObj().getInstId();
		List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());

		List<OfferProdItem> offerProdItemList = instDataSMO.getOfferProdItemList(getOlId(), prodId, MDA.ITEM_SPEC_8700000);
		for(OfferProdItem offerProdItem : offerProdItemList){
			if("1".equals(offerProdItem.getValue())){
				setLimitRuleMsg("OCS号码[" + soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId, listBusiOrders) + "]不允许订购翼支付交费助手！");
				return 'Y';
			}
		}
		
		Integer feeType = soCommonSMO.getProdFeeType(getOlId(), prodId, listBusiOrders);
		if(MDA.FEE_TYPE_PRE.equals(feeType)){
            setLimitRuleMsg("预付费号码[" + soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId, listBusiOrders)
            		+"]不允许订购翼支付交费助手！");
            return 'Y';
		}
		return 'N';
	}

	public char condCheckServLimit() throws Exception{
		char retVal = 'N';
		List<OoRole> listOoRoles = getBusiOrder().getData().getOoRoles();
		Long prodId = null;
		for(OoRole or : listOoRoles){
			if(OrderListUtil.isValidateAddAo(or.getStatusCd(), or.getState()) &&
					SoRuleUtil.equals(or.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)){
				prodId = or.getObjInstId();
				break;
			}
		}
		if(prodId != null){
			List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
			List<Long> offerSpecIds = SoRuleUtil.newArrayList(289000000655l, 289000000800l, 289000000953l, 289000001148l,
		             289000001213l, 289000001215l, 289000001344l, 289000001567l,
		             289000001688l, 289000001689l, 289000002075l, 289000002855l,
		             289000002880l, 289000003045l, 289000003046l, 289000003292l,
		             289000003456l);
			int flag = 0;
			flagBre :
				for(BusiOrder bo : listBusiOrders){
					if(SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_OFFER)){
						BusiObj offerOrder = bo.getBusiObj();
						if(SoRuleUtil.equals(offerOrder.getState(), MDA.STATE_ADD) && SoRuleUtil.in(offerOrder.getObjId(), offerSpecIds)){
							List<OoRole> listOoRoleTemps = bo.getData().getOoRoles();
							for(OoRole or : listOoRoleTemps){
								if(SoRuleUtil.equals(or.getObjId().intValue(), MDA.PROD_SEPC_280000219) &&
										OrderListUtil.isValidateAoStatus(or.getStatusCd()) &&
										SoRuleUtil.equals(or.getObjInstId(), prodId)){
									flag++;
									break flagBre;
								}
							}
						}
					}
				}
			if(flag > 0 && !soCommonSMO.isHaveServOn(SoRuleUtil.newArrayList(MDA.SERV_SPEC_280000056), prodId, getOlId(), listBusiOrders)){
				setLimitRuleMsg("必须选择公众网服务!");
				retVal = 'Y';
				return retVal;
			}
		}
		return retVal;
	}
	public char checkBussinessWifi() throws Exception{
		char retVal = 'N';
		List<OoRole> listOoRoles = getBusiOrder().getData().getOoRoles();
		List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
		Long prodId = null;
		for(OoRole or : listOoRoles){
			if(OrderListUtil.isValidateAddAo(or.getStatusCd(), or.getState())){
				prodId = or.getObjInstId();
			}
		}
		if(prodId != null){
			if(!soCommonSMO.isHaveServOn(SoRuleUtil.newArrayList(MDA.SERV_SPEC_383), prodId, getOlId(), listBusiOrders)){
				setLimitRuleMsg("选择有[成都_wifi10元限30小时超时停机]、[成都_wifi10元限30小时超时1元/小时]、[成都_wifi20元限80小时超时停机]、[成都_wifi20元限80小时超时1元/小时]、[成都_wifi0.05元/3分钟]这些资费时必须选择[WiFi服务]!");
				retVal = 'Y';
				return retVal;
			}
			//getServItemValueByProdId 这个方法返回null
			if(!soCommonSMO.getServItemValueByProdId(prodId, MDA.SERV_SPEC_383, MDA.ITEM_SPEC_304528, getOlId(), listBusiOrders).equals("2")){
				setLimitRuleMsg("选择有[成都_wifi10元限30小时超时停机]、[成都_wifi10元限30小时超时1元/小时]、[成都_wifi20元限80小时超时停机]、[成都_wifi20元限80小时超时1元/小时]、[成都_wifi0.05元/3分钟]这些资费时必须选择[WiFi服务],且其属性[WIFI区域]应为[校园]!");
				retVal = 'Y';
				return retVal;
			}
		}
		return retVal;
	}
	
	/**
	 * 本地规则： 开国际漫游，未订购500元预存，非三卡客户，直接弹出提示
     * “请到销赃查询用户余额，如不满500元，请补齐500元再继续受理开国际漫游业务”。
	 * 规则编码：CRMSCL2992028
	 * bo_action_type_2_rule  S1 
	 * @return
	 * @throws Exception
	 * 7012
	 */
	
	public char condabord500limit() throws Exception {
		Long partyId = null;
		Long prodId = null;
		String offerSpecName = null ;
		Integer channelId = getOrderList().getOrderListInfo().getChannelId();
		List<BusiOrder> busiOrders = OrderListUtil.getBusiOrders(getOrderList());
		List<OfferMemberInstDto> offerMemberList = null;
		int n = 0;
		boolean ifVipUser = false;//是否是金银钻客户
		boolean ifTyCust = false ;//是否是天翼客户
		boolean ifBankCust = false ;//是否是银行托收客户
		boolean ifEnjoy3G = false ;//是否是乐享3G套餐
		boolean ifBlackPack = false ;//是否是政企黑莓套餐
		boolean ifNeedCheck =false ;//是否需要校验余额
		OfferSpecObj offerSpecObj = null;
		if(SoRuleUtil.equals(channelId, MDA.CHANNEL_ID_ECHANNELID) || channelId == null){
			return 'N' ;
		}
		mark : for(BusiOrder bo : busiOrders){
		    if(OrderListUtil.isValidateBoStatus(bo) 
		      && OrderListUtil.isValidateAoStatus(bo.getBusiObj().getStatusCd())
		      && bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_OFFER
		      && SoRuleUtil.in(bo.getBusiObj().getObjId(), MDA.OFFER_SEPC_INTERNATION)){
		    	if (!SoRuleUtil.isEmptyList(bo.getData().getOoRoles()) && bo.getData().getOoRoles().size() >0) {		
					for (OoRole ooRole:bo.getData().getOoRoles()){
						if(ooRole.getState().equals(MDA.STATE_ADD) 
						  && OrderListUtil.isValidateAoStatus(ooRole.getStatusCd())
						  && SoRuleUtil.equals(ooRole.getObjType(),MDA.OBJ_TYPE_SERV_SPEC)){
							partyId = getOrderList().getOrderListInfo().getPartyId() ;
							prodId = ooRole.getProdId() ;
							offerSpecName = specDataSMO.getOfferSpecObj(bo.getBusiObj().getObjId()).getName();
							if(partyId !=null && prodId != null && offerSpecName != null) break mark;
						}
					}
		    	}
		    }
		}
		
		if(partyId ==null || prodId == null ||offerSpecName == null) return 'N';
			
		//增加对实例订购了特定目录的e家销售品的规则判断，订购了直接跳过规则。
		offerMemberList = instDataSMO.getOfferMemberDtoList(getOlId(),prodId,MDA.OBJ_TYPE_PROD_SPEC);
		for (OfferMemberInstDto offerMember : SoRuleUtil.nvlArry(offerMemberList)) {
			if (!InstDataUtil.ifValidateInstStatus(offerMember.getOmStatusCd())) {
				continue;
			}
			//判断当前购物车是否订购了“e家”目录下的销售品,且当前购物车没有退订
			if (specDataSMO.getOfferSpec2CategoryNodeCountById(offerMember.getOfferSpecId(), MDA.OFFER_SPEC_CATEGORY_EHOME9.intValue()) >0){
				n ++ ;
				for(BusiOrder bo : busiOrders){
					if(OrderListUtil.isValidateBoStatus(bo)
				    		&& OrderListUtil.isValidateAoStatus(bo.getBusiObj().getStatusCd())
				    		&& SoRuleUtil.equals(offerMember.getOfferId(),bo.getBusiObj().getInstId())
				    		&& bo.getBusiObj().getState().equals(MDA.STATE_DEL)){						
							n--;
					}
				}
			}
		}

		
		if (n >0) return 'N';
		
		if (instDataSMO.getServGradeInstCountByProdId(prodId) >0){
			//是否是金银钻客户
			ifVipUser = true ;
		}
		// 是否天翼E家客,天翼领航客户
		List<PartySegmentMemberList> segmentList = instDataSMO.getPartySegmentMemberListByPartyId(partyId);
		for(PartySegmentMemberList segment : segmentList){
			if(SoRuleUtil.in(segment.getSegmentId().intValue(), MDA.CUST_SEGMENT_TY)){
				ifTyCust = true ;
			}
		}
		
		List<ChangePaymentAccountDto > prodAcctInfos = instDataSMO.getProdAcctInfoByProdId(prodId);
		ifBankCustInstFlag:for (ChangePaymentAccountDto prodAcctInfo:prodAcctInfos){
			if ( SoRuleUtil.equals(prodAcctInfo.getPaymentAcctTypeCd(), MDA.PAYMENT_ACCT_TYPE_CD_3)){//有银行托收账户,再判断有无删除该账户
				//获取该用户的账户动作信息
				List<BoAccountRela> boAccountRelaList = OrderListUtil.getBoAccountRelaListByProdId(busiOrders, prodId, MDA.STATE_DEL);
				if (SoRuleUtil.isEmptyList(boAccountRelaList)){
					ifBankCust = true ;
				}else{
					for (BoAccountRela boAccountRela : ListUtil.nvlList(boAccountRelaList)) {
						if (OrderListUtil.isValidateAoStatus(boAccountRela.getStatusCd())) continue;
						if(SoRuleUtil.equals(boAccountRela.getAcctId(),prodAcctInfo.getAcctId())){
							ifBankCust =false ; 
							break ifBankCustInstFlag;
						}
					}
				}
				
			}
		}
		//如果根据当前用户实例中没有查询到银行托收账户，再查询当前购物车中的有无新增银行托收账户
		if(!ifBankCust){
			ifBankCustFlag:for(BusiOrder bo : busiOrders){
				if(OrderListUtil.isValidateBoStatus(bo)
			    	&& OrderListUtil.isValidateAoStatus(bo.getBusiObj().getStatusCd())){
					List<BoAccountInfo> boAccountInfoList = bo.getData().getBoAccountInfos();
					for (BoAccountInfo boAccountInfo : ListUtil.nvlList(boAccountInfoList)) {
						if(OrderListUtil.isValidateAddAo(boAccountInfo.getStatusCd(), boAccountInfo.getState())){
							
							List<BoPaymentAccount> boPaymentAccountList = bo.getData().getBoPaymentAccounts();
							for (BoPaymentAccount boPaymentAccount : ListUtil.nvlList(boPaymentAccountList)) {
								if (OrderListUtil.isValidateAoStatus(boPaymentAccount.getStatusCd()) 
									&& SoRuleUtil.equals(boPaymentAccount.getBoId(),boPaymentAccount.getBoId())
									&& SoRuleUtil.equals(boPaymentAccount.getPaymentAcctTypeCd(),MDA.PAYMENT_ACCT_TYPE_CD_3)) {
									ifBankCust = true ;
									break ifBankCustFlag;
								}
							}
							
						}
					}
				}
			}
		}
		

		List<OfferServ> offerServList = instDataSMO.getOfferServListByProdId(getOlId(),prodId);
		List<BoServ> boServs = null ;
		ifBlackPackFlag:for (OfferServ offerServ : offerServList) {
			if (!InstDataUtil.ifValidateInstStatus(offerServ.getStatusCd())) {
				continue;
			}
			if (SoRuleUtil.in(offerServ.getServSpecId(),MDA.SSID_ID_EMAILSERV)){//判断609、610,611 服务有无退订
				for(BusiOrder bo : busiOrders){
					if(OrderListUtil.isValidateBoStatus(bo)
				    	&& OrderListUtil.isValidateAoStatus(bo.getBusiObj().getStatusCd())){
						boServs = bo.getData().getBoServs();
						if (!SoRuleUtil.isEmptyList(boServs)) {
							for (BoServ boServ : SoRuleUtil.nvlArry(boServs)) {
								if (OrderListUtil.isValidateAoStatus(boServ.getStatusCd())
									&& SoRuleUtil.equals(boServ.getServId(),offerServ.getServId())
									&& !boServ.getState().equals(MDA.STATE_DEL)) {
									ifBlackPack = true ;
									break ifBlackPackFlag;
								}
							}
						}
					}
				}
			}
		}
		
		List<OfferMemberInstDto>  offerMemberList2 = instDataSMO.getOfferMemberDtoList(getOlId(),prodId,MDA.OBJ_TYPE_PROD_SPEC);
		ifEnjoy3GFlag:for (OfferMemberInstDto offerMember : SoRuleUtil.nvlArry(offerMemberList2)) {
			offerSpecObj = specDataSMO.getOfferSpecObj(offerMember.getOfferSpecId());
			if(null != offerSpecObj && offerSpecObj.getStatusCd() == 2){
				if(offerSpecObj.getName().contains("乐享") 
				   && SoRuleUtil.equals(offerSpecObj.getOfferTypeCd(),MDA.OFFER_TYPE_CD_MAIN)
				   && !offerSpecObj.getCode().equals("800000000")
				   && !offerSpecObj.getName().contains("送") ){
					for(BusiOrder bo : busiOrders){
						if(OrderListUtil.isValidateBoStatus(bo)
					      && OrderListUtil.isValidateAoStatus(bo.getBusiObj().getStatusCd())
					      && SoRuleUtil.equals( bo.getBusiObj().getInstId(),offerMember.getOfferId())
					      && !bo.getBusiObj().getState().equals(MDA.STATE_DEL)){							
							ifEnjoy3G = true;
							break ifEnjoy3GFlag;
							
						}
					}
				}
			}
		}
		int stopNot6Month = 0;//有未满6个月的停机记录数
		int validePreOpen = 0;//有效的预开户记录数
		int invalidePreOpen = 0 ;//有失效的预开户状态,并且结束时间小于6个月
		int inUserNotMonth = 0;//有在用记录,但未超过6个月
		if(ifBlackPack || ifEnjoy3G){//判断
			Calendar instStartDt = Calendar.getInstance();
			
			//当前系统时间
			Calendar sysDt = Calendar.getInstance();
			List<OfferProdStatus> offerProdStatus = instDataSMO.getAllOfferProdStatusByProdId(prodId);
			for(OfferProdStatus offerProdStatusInfo : offerProdStatus){
				instStartDt.setTime(offerProdStatusInfo.getStartDt());
				//获取有未满6个月的停机记录数
				//SoRuleUtil.addMonth(date, month);
				if ( (offerProdStatusInfo.getProdStatusCd().equals(MDA.PROD_STATUS_USER_STOP)
						|| offerProdStatusInfo.getProdStatusCd().equals(MDA.PROD_STATUS_SINGLE_STOP)
						|| offerProdStatusInfo.getProdStatusCd().equals(MDA.PROD_STATUS_DOUBLE_STOP))
						&& ((sysDt.get(Calendar.MONTH) - instStartDt.get(Calendar.MONTH)
						+ (sysDt.get(Calendar.YEAR) - instStartDt.get(Calendar.YEAR)) * 12) <= 6)){
					stopNot6Month ++ ;
				}
				//有效的预开户记录数
				if (InstDataUtil.ifValidateInstStatus(offerProdStatusInfo.getStatusCd())
					&& offerProdStatusInfo.getProdStatusCd().equals(MDA.PROD_STATUS_WAIT_ACTIVE)) {
					validePreOpen ++ ;
				}
				//有失效的预开户状态,并且结束时间小于6个月
				if (!InstDataUtil.ifValidateInstStatus(offerProdStatusInfo.getStatusCd())
						&& offerProdStatusInfo.getProdStatusCd().equals(MDA.PROD_STATUS_WAIT_ACTIVE)
						&& ((sysDt.get(Calendar.MONTH) - instStartDt.get(Calendar.MONTH)
								+ (sysDt.get(Calendar.YEAR) - instStartDt.get(Calendar.YEAR)) * 12) <= 6)) {
					invalidePreOpen ++ ;
				}
				//有在用记录,但未超过6个月
				if (InstDataUtil.ifValidateInstStatus(offerProdStatusInfo.getStatusCd())
						&& offerProdStatusInfo.getProdStatusCd().equals(MDA.PROD_STATUS_USING)
						&& ((sysDt.get(Calendar.MONTH) - instStartDt.get(Calendar.MONTH)
								+ (sysDt.get(Calendar.YEAR) - instStartDt.get(Calendar.YEAR)) * 12) <= 6)) {
					inUserNotMonth ++ ;
				}
				
			}
		}
		if (!ifVipUser && !ifTyCust && !ifBankCust){
			ifNeedCheck = true ;
		}
		if((!ifEnjoy3G && !ifBlackPack && ifNeedCheck) 
			|| ((ifEnjoy3G||ifBlackPack) && ifNeedCheck && (stopNot6Month+validePreOpen+invalidePreOpen+invalidePreOpen>0))){
			offerSpecName =getOfferSpecName();
			if(offerSpecName == null) offerSpecName = "未知銷售品";
			String accessNumber = soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId,busiOrders);
			OfferProd offerProd = instDataSMO.getOfferProd(getOlId(), prodId);
			Integer prodSpecId = null;
			Long prodAreaId  = null;
			List<BoProdSpec> boProdSpecs = null;
			if(offerProd != null){
				 prodSpecId  = offerProd.getProdSpecId();
				 prodAreaId = offerProd.getAreaId();
			}else{
				markSpec:for(BusiOrder bo : busiOrders){
					if(OrderListUtil.isValidateBoStatus(bo) 
							&& bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_PRODUCT
							&& SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)
							&& SoRuleUtil.in(bo.getBusiObj().getState(), SoRuleUtil.newArrayList(MDA.STATE_ADD,MDA.STATE_KIP))){
						boProdSpecs = bo.getData().getBoProdSpecs();
						for(BoProdSpec ps :SoRuleUtil.nvlArry(boProdSpecs)){
							if(OrderListUtil.isValidateAddAo(ps.getStatusCd(), ps.getState())){
								prodSpecId = ps.getProdSpecId();
								prodAreaId = getBaseInfo().getAreaId();
								break markSpec;
							}
						}
					}
				}
			}

			String zoneNumber = null ;
			Map<String, Object> result = null ;
			if(accessNumber == null && prodSpecId ==null) return 'N' ;

			if(SoRuleUtil.equals(prodSpecId, MDA.PSID_CDMA)){
				//调用计费接口查询余额 待完善
				result = ruleOtherSysService.getBalance("", accessNumber,"");
			}else{
				if(prodAreaId.toString().substring(0, 3).equals("120")){
					zoneNumber = "028M";
				}else if (prodAreaId.toString().substring(0, 3).equals("121")){
					zoneNumber = "028Z";
				}else {
					zoneNumber = specDataSMO.getArea(prodAreaId).getZoneNumber();
				}
				//调用计费接口查询余额待完善
				result = ruleOtherSysService.getBalance(zoneNumber, accessNumber,"");
			}
			String resultCode = result.get("resultCode").toString();
			if (resultCode.equals("0")) {
				String balance = result.get("balance").toString();
				BigDecimal acctBalance = new BigDecimal(balance);
				BigDecimal standardBalance = new BigDecimal(500); ;
				//acctBalance  = new BigDecimal(30000); 
				if(acctBalance.compareTo(standardBalance)< 0){
					this.setLimitRuleMsg("开通【"+offerSpecName+"】要求用户有500元预存款，请补足500元后再继续办理!");
					return 'Y';
				}
			} else {
				String failReason = result.get("resultMsg").toString();
				this.setLimitRuleMsg("开通【"+offerSpecName+"】要求用户有500元预存款，连接销账查询余额出错\"["+ failReason+"\"请到销帐系统中查询用户余额，如不足500元，请补足500元后再继续办理!");
				return 'Y';
			}
			
		}
		return 'N' ;
	}
	
    public char CondForbidDeskModNbrlimit() throws Exception{
    	
    	List<BoServ>  boServs = getBusiOrder().getData().getBoServs();
    	List<BoServItem> boServItems = getBusiOrder().getData().getBoServItems();
    	for (BoServItem boServItem : boServItems) {
			if(OrderListUtil.isValidateAoStatus(boServItem.getStatusCd()) 
					&& MDA.STATE_DEL.equals(boServItem.getState()) 
					&& MDA.ITEM_SPEC_TZHM.equals(boServItem.getItemSpecId())){
				//判断是否退订同振服务
				for (BoServ boServ : boServs){
					if(boServItem.getServId().equals(boServ.getServId()) && MDA.STATE_DEL.equals(boServ.getState())){
						return 'N';
					}
				}
				setLimitRuleMsg("产品["+ getAccessNumber() +"]的服务[电话同振/一呼双振]不允许修改同振号码！");
				return 'Y';
			}
		}
    	return 'N';
    }
    
    public char CondOfferCategoryforNewimit() throws Exception{
    	//判断销售品是否在新装可选资费目录下
    	Long offerSpec = getBusiOrder().getBusiObj().getObjId();
    	List<Long> offerSpecList = specDataSMO.getofferSpecListByCategoryNodeId(MDA.CATEGORY_NODE_ID_1030007);
    	if(!ListUtil.in(offerSpec,offerSpecList)){
    		return 'N';
    	}
    	
    	List<OoRole> ooRoleList = getBusiOrder().getData().getOoRoles();
    	for(OoRole ooRole : ooRoleList){
        	Long prodId = null;
    		
			if(SoRuleUtil.equals(ooRole.getState(),MDA.STATE_ADD)
					&& SoRuleUtil.equals(ooRole.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)){
				prodId = ooRole.getProdId();
			}
    		
    		//产品是否为当前购物车新装
    		Boolean ifNewProd = actionChainCommonSMO.ifNewProd(getOrderList(), prodId);
    		if(!ifNewProd){
    			this.setLimitRuleMsg("新装用户才可订购销售品【" + getOfferSpecName()+ "】");
    			return 'Y';
    		}
    	}
    	return 'N';
    }
    
    public char CondOfferCategoryForOldimit() throws Exception{
    	//判断销售品是否在老用户可选资费目录下
    	Long offerSpec = getBusiOrder().getBusiObj().getObjId();
    	List<Long> offerSpecList = specDataSMO.getofferSpecListByCategoryNodeId(MDA.CATEGORY_NODE_ID_1030008);
    	
    	if(!ListUtil.in(offerSpec,offerSpecList)){
    		return 'N';
    	}
    	
    	List<OoRole> ooRoleList = getBusiOrder().getData().getOoRoles();
    	for(OoRole ooRole : ooRoleList){
    		Long prodId = null;
    		
			if(SoRuleUtil.equals(ooRole.getState(),MDA.STATE_ADD)
					&& SoRuleUtil.equals(ooRole.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)){
				prodId = ooRole.getProdId();
			}
    		
    		//产品是否为当前购物车新装
    		Boolean ifNewProd = actionChainCommonSMO.ifNewProd(getOrderList(), prodId);
    		if(ifNewProd){
    			this.setLimitRuleMsg("老用户才可订购销售品【" + getOfferSpecName()+ "】");
    			return 'Y';
    		}
    	}    	
    	return 'N';
    }
    
    /**本地规则：销售品于机型关系的校验
	 * 规则编码：CRMSCL2992052
	 * bo_action_type_2_rule S1,S2,1187
	 * @return
	 * @throws Exception
	 * 7012
	 */
	public char condofferspeccouponrelalimit() throws Exception {
		List<Map<String, Object>> couponOfferReal = null;
		Map<String, Object> coupon = null ;
		List<OoRole> ooRoles =  null;
		List<OfferMemberInstDto> offerMemberList = null;
		List<OfferCoupon> offerCoupons  = null ;
		OfferSpecObj offerSpecObj = null ;
		Long offerSpecId =null;
		Long prodId =null ;
		Long couponId = null;
		String couponInstanceNum = null;
		String couponName = null ;
		
		Long prodId2 =null ;
		Long couponId2 = null;
		String couponInstanceNum2 = null;
		String couponName2 = null ;
		int allMem = 0;
		List<BusiOrder> busiOrders = OrderListUtil.getBusiOrders(getOrderList());
		Long staffId =  getOrderList().getOrderListInfo().getStaffId();
		if(staffId == null ||SoRuleUtil.in(staffId, SoRuleUtil.newArrayList(MDA.STAFF_PROV_SYS_BUSI,MDA.STAFF_PROV_SYS_10000))){
			return 'N';
		}
		//手机依赖销售品
		List<Bo2Coupon> bo2Coupons = getBusiOrder().getData().getBo2Coupons();
		if(!SoRuleUtil.isEmptyList(bo2Coupons)){
			 for(Bo2Coupon bo2Coupon : bo2Coupons){
				if(OrderListUtil.isValidateAoStatus(bo2Coupon.getStatusCd())
					&& (bo2Coupon.getState().equals(MDA.STATE_ADD) || bo2Coupon.getState().equals("")|| bo2Coupon.getState() ==null)
					&& bo2Coupon.getInOutTypeId() == 1){
					coupon = specDataSMO.getCouponNameByCouponId(bo2Coupon.getCouponId());
					if(coupon!= null){
						couponOfferReal = specDataSMO.getCouponAndOfferSpecRealByCouponId(bo2Coupon.getCouponId(),null,"1,3");
						if(!SoRuleUtil.isEmptyList(couponOfferReal)){
							prodId = getProdId() ;
							couponId = bo2Coupon.getCouponId() ;
							couponName = coupon.get("couponName").toString();
							couponInstanceNum = bo2Coupon.getCouponInstanceNumber();
							break;
						}
					}
				}
			}
		}
		if (!(prodId == null && couponId == null && couponName == null && couponInstanceNum == null)){

			offerMemberList = instDataSMO.getOfferMemberDtoList(getOlId(),prodId,MDA.OBJ_TYPE_PROD_SPEC);
			for (OfferMemberInstDto offerMember : SoRuleUtil.nvlArry(offerMemberList)) {
				couponOfferReal = specDataSMO.getCouponAndOfferSpecRealByCouponId(couponId,offerMember.getOfferSpecId(),"1,3");
				if(!SoRuleUtil.isEmptyList(couponOfferReal)){
					for (Map<String, Object> map : couponOfferReal) {
						if(SoRuleUtil.in(Integer.valueOf(map.get("relaType").toString()), SoRuleUtil.newArrayList(MDA.OFFER_SPEC_COUPON_RELA_TYPE_1,MDA.OFFER_SPEC_COUPON_RELA_TYPE_3))){
							allMem ++ ;
							//在当前购物车中有无销售品动作
							for(BusiOrder bo : busiOrders){
								if(OrderListUtil.isValidateBoStatus(bo) && OrderListUtil.isValidateAoStatus(bo.getBusiObj().getStatusCd())
									&& bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_OFFER
									&& SoRuleUtil.equals(bo.getBusiObj().getInstId(),offerMember.getOfferId())){
									allMem -- ;
								}
							}
						}
					}
				}
			}
			for(BusiOrder bo : busiOrders){
				if(OrderListUtil.isValidateBoStatus(bo) 
					&& OrderListUtil.isValidateAddAo(bo.getBusiObj().getStatusCd(),bo.getBusiObj().getState())
					&& bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_OFFER){
					ooRoles = getBusiOrder().getData().getOoRoles();
					for (OoRole ooRole : ooRoles) {
						if(SoRuleUtil.equals(ooRole.getState(),MDA.STATE_ADD)
							&& SoRuleUtil.equals(ooRole.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)
							&& SoRuleUtil.equals(ooRole.getObjInstId(),prodId)){
							couponOfferReal = specDataSMO.getCouponAndOfferSpecRealByCouponId(couponId,bo.getBusiObj().getObjId(),"1,3");
							if(!SoRuleUtil.isEmptyList(couponOfferReal)){
								allMem ++ ;
							}
						}
					}
				}
			}
			
			if(allMem <1){
				couponOfferReal = specDataSMO.getCouponAndOfferSpecRealByCouponId(couponId,null,"1,3");
				if(!SoRuleUtil.isEmptyList(couponOfferReal)){
					offerSpecObj = specDataSMO.getOfferSpecObj(Long.valueOf(couponOfferReal.get(0).get("offerSpecId").toString())) ;
					if(offerSpecObj !=null){;
						setLimitRuleMsg("当前绑定的串号["+couponInstanceNum+"]是["+ couponName +"]机型,配置依赖于["+ offerSpecObj.getName() +"等销售品,请检查!");
						return 'Y';
					}
				}
			}
		}
		
		if(!SoRuleUtil.isEmptyList(bo2Coupons)){
			 for(Bo2Coupon bo2Coupon : bo2Coupons){
				if(OrderListUtil.isValidateAoStatus(bo2Coupon.getStatusCd())
					&& (bo2Coupon.getState().equals(MDA.STATE_ADD) || bo2Coupon.getState().equals("")|| bo2Coupon.getState() ==null)
					&& bo2Coupon.getInOutTypeId() == 1){
					coupon = specDataSMO.getCouponNameByCouponId(bo2Coupon.getCouponId());
					if(coupon!= null){
						couponOfferReal = specDataSMO.getCouponAndOfferSpecRealByCouponId(bo2Coupon.getCouponId(),null,"4");
						if(!SoRuleUtil.isEmptyList(couponOfferReal)){
							prodId2 =  getProdId() ;
							couponId2 = bo2Coupon.getCouponId() ;
							couponName2 = coupon.get("couponName").toString();
							couponInstanceNum2 = bo2Coupon.getCouponInstanceNumber();
							break;
						}
					}
				}
			}
		}
		if (!(prodId2 == null && couponId2 == null && couponName2 == null && couponInstanceNum2 == null)){
			//手机依赖销售品，一种机型依赖超过1种销售品

			couponOfferReal = specDataSMO.getCouponAndOfferSpecRealByCouponId(couponId2,null,"4");
			if(!SoRuleUtil.isEmptyList(couponOfferReal)){
				for (Map<String, Object> map : couponOfferReal) {
					allMem = 0;
					//用销售依赖的销售品 当前和实例用循环 ，得到订购数量
					for(BusiOrder bo : busiOrders){
						if(OrderListUtil.isValidateBoStatus(bo) 
							&& OrderListUtil.isValidateAddAo(bo.getBusiObj().getStatusCd(),bo.getBusiObj().getState())
							&& bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_OFFER
							&& SoRuleUtil.equals(bo.getBusiObj().getObjId(), Long.valueOf(map.get("offerSpecId").toString()))){
							ooRoles = getBusiOrder().getData().getOoRoles();
							for (OoRole ooRole : ooRoles) {
								if(SoRuleUtil.equals(ooRole.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)
									&& SoRuleUtil.equals(ooRole.getObjInstId(),prodId2)){
									allMem ++ ;
								}
							}
						}
					}
					offerMemberList = instDataSMO.getOfferMemberDtoList(getOlId(),prodId2,MDA.OBJ_TYPE_PROD_SPEC);
					for (OfferMemberInstDto offerMember : SoRuleUtil.nvlArry(offerMemberList)) {
						if(SoRuleUtil.equals(offerMember.getOfferSpecId(), Long.valueOf(map.get("offerSpecId").toString()))){
							allMem ++ ;
						}
					}
					if (allMem <1){
						offerSpecObj = specDataSMO.getOfferSpecObj(Long.valueOf(map.get("offerSpecId").toString())) ;
						setLimitRuleMsg("当前购物车绑定的["+couponName2+"]机型依赖多个销售品,目前绑定该串号的实例上还缺少["+ offerSpecObj.getName() +"]销售品,请检查!");
						return 'Y';
					}
				}
			}
		}
		
		if (SoRuleUtil.equals(getBusiOrder().getBoActionType().getBoActionTypeCd(),MDA.BO_ACTION_TYPE_CD_OFFER_ORDER)){
			allMem = 0;
			if(OrderListUtil.isValidateBoStatus(getBusiOrder()) && MDA.STATE_ADD.equals(getBusiOrder().getBusiObj().getState())){
				ooRoles = getBusiOrder().getData().getOoRoles();
				order:for (OoRole ooRole : ooRoles) {
					if(SoRuleUtil.equals(ooRole.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)){
						couponOfferReal = specDataSMO.getCouponAndOfferSpecRealByCouponId(null,getBusiOrder().getBusiObj().getObjId(),"2,3");
						if(!SoRuleUtil.isEmptyList(couponOfferReal)){
							for(int n =0; n <couponOfferReal.size() ; n++){
								coupon = specDataSMO.getCouponNameByCouponId(Long.valueOf(couponOfferReal.get(n).get("couponId").toString()));
								if(coupon != null){
									prodId2 =ooRole.getObjInstId();
									couponId2 = Long.valueOf(couponOfferReal.get(n).get("couponId").toString()) ;
									couponName2 = coupon.get("couponName").toString();
									break order;
								}
							}
						}
					}
				}
			}
			
			if (!(prodId2 == null || couponId2 == null || couponName2 == null)){
				offerCoupons = instDataSMO.getOfferCouponListByProdId(prodId2);
				if(!offerCoupons.isEmpty()){
					for(OfferCoupon coupon2 : offerCoupons){
						if(SoRuleUtil.equals(coupon2.getProdId(), prodId2) &&
								specDataSMO.getCouponAndOfferSpecRealByCouponId(coupon2.getCouponId(),getBusiOrder().getBusiObj().getObjId(),"2,3").size() > 0){
							allMem ++;
							break;
						}
					}
				}
				if(allMem < 1){
					flagBre :
					for(BusiOrder bo : busiOrders){//当前购物车有订购机型的动作
						if(!SoRuleUtil.equals(bo.getBusiOrderInfo().getStatusCd(), MDA.BO_ACTION_STATUS_D)){
							bo2Coupons = bo.getData().getBo2Coupons();
							if(!SoRuleUtil.isEmptyList(bo2Coupons)){
								 for(Bo2Coupon bo2Coupon : bo2Coupons){
									if(OrderListUtil.isValidateAoStatus(bo2Coupon.getStatusCd())
										&& SoRuleUtil.equals(bo2Coupon.getProdId(), prodId2)
										&& (bo2Coupon.getState().equals(MDA.STATE_ADD) || bo2Coupon.getState().equals("")|| bo2Coupon.getState() ==null)
										&& bo2Coupon.getInOutTypeId() == 1){
										if(specDataSMO.getCouponAndOfferSpecRealByCouponId(bo2Coupon.getCouponId(),getBusiOrder().getBusiObj().getObjId(),"2,3").size() > 0){
											allMem ++;
											break flagBre;
										} 
									}
								}
							}
						}
					}
				}
				if(allMem <1){

					setLimitRuleMsg("当前购物车订购的["+specDataSMO.getOfferSpecObj(getOfferSpecId()).getName()+"]需要绑定["+ couponName2 +"]等手机,请检查!");

					return 'Y';
				}
			}
			
		}
		
		if (SoRuleUtil.equals(getBusiOrder().getBoActionType().getBoActionTypeCd(),MDA.BO_ACTION_TYPE_CD_OFFER_BREAK)){
			Offer offer = null;
			if(OrderListUtil.isValidateBoStatus(getBusiOrder()) 
					&& OrderListUtil.isValidateAoStatus(getBusiOrder().getBusiObj().getStatusCd())
					&& SoRuleUtil.equals(getBusiOrder().getBusiObj().getState(), MDA.STATE_DEL)
					&& getBusiOrder().getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_OFFER ){
				ooRoles = getBusiOrder().getData().getOoRoles();
				delOrder:for (OoRole ooRole : ooRoles) {
					if(SoRuleUtil.equals(ooRole.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)){
						couponOfferReal = specDataSMO.getCouponAndOfferSpecRealByCouponId(null,getBusiOrder().getBusiObj().getObjId(),"2,3");
						for (Map<String, Object> map : SoRuleUtil.nvlArry(couponOfferReal)) {
							if(specDataSMO.getOfferSpec2CategoryNodeCountById(getBusiOrder().getBusiObj().getObjId(), MDA.CATAGORY_NODE_ID_10056.intValue()) < 1){//增加阿里智能ITV退订时不要求解绑终端
								offer = instDataSMO.getOffer(getBaseInfo().getOlId(), getBusiOrder().getBusiObj().getInstId());
								//[XQ2014032544856]“合约计划续约”需求
								if(offer != null && !offer.getEndDt().after(soCommonSMO.getSysdateFromDB())//and o.end_dt>sysdate
										&& !SoRuleUtil.addMonth(offer.getStartDt(), 12).after(soCommonSMO.getSysdateFromDB())//months_between(sysdate,o.start_dt) >= 12
										&& specDataSMO.getOfferSpec2CategoryNodeCountById(offer.getOfferSpecId(), MDA.CATEGORY_NODE_ID_1030014.intValue()) >0) {
									return 'N';//新加
								}
								coupon = specDataSMO.getCouponNameByCouponId(Long.valueOf(map.get("couponId").toString()));
								if(coupon != null){
									prodId2 =ooRole.getObjInstId();
									couponId2 = Long.valueOf(map.get("couponId").toString()) ;
									couponName2 = coupon.get("couponName").toString();
									offerSpecId = getOfferSpecId();
									break delOrder;
								}
							}
						}
					}
				}
			}
			if (!(prodId2 == null && couponId2 == null && couponName2 == null)){
				offerCoupons = instDataSMO.getCouponInstNumberByProdIdAnOfferSpecId(prodId2,offerSpecId);
				if(!SoRuleUtil.isEmptyList(offerCoupons) && !SoRuleUtil.isEmptyStr(offerCoupons.get(0).getCouponInsNumber())){
					setLimitRuleMsg("当前购物车退订的["+specDataSMO.getOfferSpecObj(offerSpecId).getName()+"]需要先到[物品发送]模块解绑同实例上串号为["+ offerCoupons.get(0).getCouponInsNumber() +"]的手机,请检查!");
					return 'Y';
				}
			}
		}
		
		return 'N';
		
	}
	
	 /**
	  *规则编码:CRMSCL2997110 
	  *规则名称：[成都]固话纳入固话子机时不许开同振服务（后台会自行开通
	    #固话（prod_spec=2）纳入（order_type=998）固话子机（prod_spec=280000158）时不许开同振服务/挂机短信(serv_spec=42,555710011)（后台会自行开通!）
	  *时间：2011-05-01
	  *入口:开同振服务/挂机短信(serv_spec=42,555710011)对应销售品订购 109910000042,109915557122
	  *配置表： 无
	  *地区:成都
	  * @return
	  * @throws Exception
	  * @Author TQ
	  */
	 public char condhghzjrelaservlimit() throws Exception{
	  BusiOrder busiOrder = getBusiOrder();
	  OrderList orderList = getOrderList();
	  List<BusiOrder> busiOrderList = OrderListUtil.getBusiOrders(orderList);
	  Long prodId = null;
	  Long offerId = null;
	  int m=0;
	  List<OoRole> ooRoleList = busiOrder.getData().getOoRoles();
	  for (OoRole ooRole : ooRoleList) {
	   if (!OrderListUtil.isValidateAddAo(ooRole.getStatusCd(), ooRole.getState())) {
	    continue;
	   }
	   prodId = ooRole.getProdId();
	  }
	  
	  //实例表中查询是否加入固话子机套餐
	  List<Map<String, Object>> offerIdByProdIdList = instDataSMO.getOfferIdByProdIdandOSI(prodId, MDA.OFFER_SPEC_289000002317);
	  List<Map<String, Object>> destofferIdByProdIdList = SoRuleUtil.newArrayList();
	  if (!SoRuleUtil.isEmptyList(offerIdByProdIdList)) {
	   for (Map<String, Object> map : offerIdByProdIdList) {
	    offerId = SoRuleUtil.getLong(map.get("offerId"));
	    for (BusiOrder busiOrder1 : busiOrderList) {
	     if (!OrderListUtil.isValidateBoStatus(busiOrder1)) {
	      continue;
	     }
	     // 固话子机套餐退订
	     if (MDA.BO_ACTION_TYPE_CD_OFFER_BREAK.equals(busiOrder1.getBoActionType().getBoActionTypeCd())
	       && offerId.equals(busiOrder1.getBusiObj().getInstId()) && MDA.STATE_DEL.equals(busiOrder1.getBusiObj().getState())) {
	      destofferIdByProdIdList.add(map);
	     }
	     if (MDA.BO_ACTION_TYPE_CD_OFFER_ROLE.equals(busiOrder1.getBoActionType().getBoActionTypeCd())) {
	      // 成员退出固话子机
	      List<OoRole> ooRoleList1 = busiOrder1.getData().getOoRoles();
	      for (OoRole ooRole : SoRuleUtil.nvlArry(ooRoleList1)) {
	       if (!OrderListUtil.isValidateAoStatus(ooRole.getStatusCd())) {
	        continue;
	       }
	       if (MDA.STATE_DEL.equals(ooRole.getState()) && prodId.equals(ooRole.getObjInstId())
	         && offerId.equals(busiOrder1.getBusiObj().getInstId())) {
	        destofferIdByProdIdList.add(map);
	       }
	      }
	     }
	    }
	   }
	   offerIdByProdIdList.removeAll(destofferIdByProdIdList);
	  }
	  //过程表中查询是否加入固话子机套餐
	  for (BusiOrder busiOrder1 : busiOrderList) {
	   if (!OrderListUtil.isValidateBoStatus(busiOrder1)) {
	    continue;
	   }
	   if(busiOrder1.getBoActionType().getActionClassCd()==MDA.ACTION_CLASS_OFFER&&MDA.OFFER_SPEC_289000002317.equals(busiOrder1.getBusiObj().getObjId())){
	    List<OoRole> ooRoleList1 = busiOrder1.getData().getOoRoles();
	    for (OoRole ooRole : SoRuleUtil.nvlArry(ooRoleList1)) {
	     if (!OrderListUtil.isValidateAddAo(ooRole.getStatusCd(), ooRole.getState())) {
	      continue;
	     }
	     if(prodId.equals(ooRole.getObjInstId())){
	      m++;
	     }
	    }
	   }
	  }
	  //普通电话是否已有	 
	  if((!SoRuleUtil.isEmptyList(offerIdByProdIdList)||m>0) &&!instDataSMO.isNewProdByProdId(prodId)){
	   this.setLimitRuleMsg("CRMSCL2997110规则限制：固话子机的普通电话不能开同振服务/挂机短信,请确认!");
	   return 'Y';
	  }
	  return 'N';
	 }
	 /**本地规则:短期提速销售品订购和退订时时间限制的规则
		 * 规则编码:CRMSCL92055  
		 * 入口:spec.offer_spec_action_2_rule
		 * * @throws Exception
		 * 7012
		*/
		public char conddqtsLimit() throws Exception {
			char retVal = 'N';
			BusiOrder bo = getBusiOrder();
			if (bo.getBoActionType().getBoActionTypeCd().equals(MDA.BO_ACTION_TYPE_CD_OFFER_ORDER)
					&& OrderListUtil.isValidateAoStatus(bo.getBusiOrderInfo().getStatusCd()) &&
					SoRuleUtil.equals(bo.getBusiObj().getState(), MDA.STATE_ADD)) {
				// 判断订购相关业务规则
				//取销售品参数对象
				List<OoParam> ooParams = bo.getData().getOoParams();
				for (OoParam ooParam : ooParams) {
					if (OrderListUtil.isValidateAddAo(ooParam.getStatusCd(), ooParam.getState())) {
						// 取销售品参数规格对象
						OfferSpecParam offerSpecParam = null;
						OfferSpecParam osp = null;
						offerSpecParam = instDataSMO.getOfferSpecParamWithCataByOffSpPaId(ooParam.getOfferSpecParamId());
						// 检查前台是否填入了销售品参数：生效时间、失效时间，如果填入则规则限制提交。
						if (SoRuleUtil.in(offerSpecParam.getItemSpecId(), SoRuleUtil.newArrayList(MDA.ITEM_SPEC_999999205,MDA.ITEM_SPEC_999999206))
								&& ooParam.getValue() != null && !SoRuleUtil.equals(ooParam.getValue(), "")) {
							setLimitRuleMsg("注意,订购了短期提速销售品,使用天数范围不允许使用[生效时间]和[失效时间]或其他方式指定,请选择[生效方式]为[立即生效]并在[有效天数]属性中填入需要使用的天数!");
							return 'Y';
						} else if(SoRuleUtil.equals(offerSpecParam.getItemSpecId(), MDA.ITEM_SPEC_999999207) &&
								SoRuleUtil.equals(ooParam.getValue(), "1")) {
							// 检查前台填入的有效时长是否为3-90
							int flagDay = 0;
							for (OoParam op : ooParams) {
								// 取销售品参数规格对象
								if(OrderListUtil.isValidateAddAo(ooParam.getStatusCd(), ooParam.getState())){
									osp = instDataSMO.getOfferSpecParamWithCataByOffSpPaId(op.getOfferSpecParamId());
									if(SoRuleUtil.equals(osp.getItemSpecId(), MDA.ITEM_SPEC_999999208)){
										flagDay++;
										if((Integer.parseInt(op.getValue()) < 3) || (Integer.parseInt(op.getValue()) > 90)) {
											setLimitRuleMsg("注意,订购了短期提速销售品并选择[生效方式]为[立即生效].其[有效天数]属性中填入的天数需要在3天到90天之间!");
											return 'Y';
										}
									}
								}
							}
							if(flagDay == 0){
								setLimitRuleMsg("注意,订购了短期提速销售品并选择[生效方式]为[立即生效].其[有效天数]属性中填入的天数需要在3天到90天之间!");
								return 'Y';
							}
						}
					}
				}
			}else if(SoRuleUtil.equals(bo.getBoActionType().getBoActionTypeCd(),MDA.BO_ACTION_TYPE_CD_OFFER_BREAK)
					&& (OrderListUtil.isValidateAoStatus(bo.getBusiOrderInfo().getStatusCd())) &&
					SoRuleUtil.equals(bo.getBusiObj().getState(), MDA.STATE_DEL)) {
				if (instDataSMO.getOfferBssStByOfferID(bo.getBusiObj().getInstId(),bo.getBusiObj().getObjId()) > 0) {
					setLimitRuleMsg("注意,退订[短期提速销售品]需要在至少使用4天后,请检查!");
					return 'Y';
				}
			}
			return retVal;
		}
		
		
		/**本地规则：提速销售品业务动作规则
		 * 规则编码：CRMSCL2992054
		 * bo_action_type_2_rule S1
		 * @return
		 * @throws Exception
		 * 此销售品只能在宽带新装或者移机的时候并且是FTTH接入才能选择，根据地址属性判断是否是FTTH接入
		 */
		public char condftthnetruleslimit() throws Exception {
			Integer areaId = getOrderList().getOrderListInfo().getAreaId();
			List<OoRole>  ooRoles = null;
			Long prodId =null ;
			String offerSpecName = getOfferSpecName();
			String accessType = null;
			if(OrderListUtil.isValidateAddAo(getBusiOrder().getBusiObj().getStatusCd(),getBusiOrder().getBusiObj().getState())
					&& specDataSMO.getOfferSpec2CategoryNodeCountById(getBusiOrder().getBusiObj().getObjId(), MDA.OFFER_SPEC_CATEGORY_TS.intValue()) >0 ){
				ooRoles = getBusiOrder().getData().getOoRoles();
				for (OoRole ooRole : ooRoles) {
					if(SoRuleUtil.equals(ooRole.getObjId().intValue(), MDA.PSID_ADSL) && SoRuleUtil.equals(ooRole.getObjType(),MDA.OBJ_TYPE_PROD_SPEC)){
							prodId = ooRole.getObjInstId();
							break ;			
					}
				
				}
			}
			if(prodId == null ) return 'N' ;
			
			int m = instDataSMO.getAccessTypeByOlidAndProdIdCnt(getOlId(), prodId);
			
			if(m > 0){
				accessType = instDataSMO.getAccessTypeByOlidAndProdId(getOlId(), prodId);

				if(SoRuleUtil.isEmptyStr(accessType)){
					setLimitRuleMsg("当前订购["+ offerSpecName +"]销售品,但产品地址类型为空,请检查!");
					return 'Y' ;
				}else if(!accessType.contains(MDA.LINK_TYPE_FTTH)){
					List<BusiOrder> busiOrders = OrderListUtil.getBusiOrders(getOrderList());
					List<BoProdRela> boProdRelas = OrderListUtil.getBoProdRelaListByProdId(busiOrders,prodId,MDA.STATE_ADD,MDA.PROD_REASON_CD_SHARE);
					for (BoProdRela boProdRela : SoRuleUtil.nvlArry(boProdRelas)) {
						accessType = instDataSMO.getAccessTypeByOlidAndProdId(getOlId(), boProdRela.getRelatedProdId());
						if(accessType != null && !SoRuleUtil.isEmptyStr(accessType)){
							break ;
						}
					}
					if(accessType!= null && !SoRuleUtil.equals(accessType, MDA.LINK_TYPE_FTTH)){
						setLimitRuleMsg("当前订购["+ offerSpecName +"]销售品的实例不是选择的[FTTH]地址,请检查!");
						return 'Y' ;
					}
				}
			}else{
				accessType = instDataSMO.getAccessTypeByProdIdAndOLID(getOlId(), prodId);
				if(accessType == null || SoRuleUtil.isEmptyStr(accessType)){
					//如果实例中没有查询到地址类型，则需要调用接口查询
					Map<String,Object> paramMap = new HashMap<String, Object>();
					paramMap.put("areaId", areaId);
					paramMap.put("prodId", prodId);
					ruleOtherSysService.ifftth(paramMap);
					int flag = SoRuleUtil.getInt(paramMap.get("resultNum"));
					if(flag==0){
						setLimitRuleMsg("当前订购["+ offerSpecName +"]销售品的实例不是选择的[FTTH]地址,请检查!");
						return 'Y' ;
					}
				}else{
					if(accessType!= null && !accessType.contains(MDA.LINK_TYPE_FTTH)){
						setLimitRuleMsg("当前订购["+ offerSpecName +"]销售品的实例不是选择的[FTTH]地址,请检查!");
						return 'Y' ;
					}
				}
			}
			return 'N' ;
		}
		
		
		public char condMustAssignTimeLimit() throws Exception {
			char retVal = 'N';
			String value = null;
			List<OoParam> ooParams = getBusiOrder().getData().getOoParams();
			for(OoParam param : ooParams){
				if(OrderListUtil.isValidateAoStatus(param.getStatusCd())){
					OfferSpecParam offerSpecParam = specDataSMO.getOfferSpecParam(param.getOfferSpecParamId());
					if(!SoRuleUtil.isExistEmptyObj(offerSpecParam) && MDA.ISID_EFFECT_METHOD.equals(offerSpecParam.getItemSpecId())){//生效方式
						value = param.getValue();
					}
				}
			}
			String startDate = null;//生效时间
			String endDate = null;//失效时间
			if ("4".equals(value)){
				for(OoParam param : ooParams){
					if(OrderListUtil.isValidateAoStatus(param.getStatusCd())){
						OfferSpecParam offerSpecParam = specDataSMO.getOfferSpecParam(param.getOfferSpecParamId());
						if(!SoRuleUtil.isExistEmptyObj(offerSpecParam) && MDA.ISID_EFFECT_DATE.equals(offerSpecParam.getItemSpecId())){
							startDate = param.getValue();
						}else if(!SoRuleUtil.isExistEmptyObj(offerSpecParam) && MDA.ISID_UNEFFECT_DATE.equals(offerSpecParam.getItemSpecId())){
							endDate = param.getValue();
						}
					}
				}
				if((startDate == null || "".equals(startDate))||(endDate == null || "".equals(endDate))){
					retVal = 'Y';
					setLimitRuleMsg("销售品参数生效方式为【指定时间】时，【生效时间】和【失效时间】均必填！");
				}
			}
			return retVal;
		}
		
		public char condCheckIdentityLimit() throws Exception {
			char retVal = 'N';
			String staffId = getBaseInfo().getStaffId().toString();
			if(!staffId.equals(MDA.CHANNEL_PROV_CENTER.toString())){
				//排除掉非省中心渠道受理
				return retVal;
			}
			Long offerSpecId = null;
			String offerSpecName = null;
			String name = null;
			String identityNumber = null;
			//取销售品规格
			BusiObj offerOrder = getBusiOrder().getBusiObj();
			if(OrderListUtil.isValidateAddAo(offerOrder.getStatusCd(), offerOrder.getState())){
				offerSpecId = offerOrder.getObjId();
				OfferSpec offerSpec = specDataSMO.getOfferSpecById(offerOrder.getObjId());
				offerSpecName = offerSpec.getName();
			}
			//取客户信息
			PartyObj partyObj = instDataSMO.getPartyObj(getOlId(), getBaseInfo().getPartyId());
			if(partyObj != null){
				List<PartyIdentity> partyIdentities = instDataSMO.getPartyIdentityByPartyId(partyObj.getPartyId());
				for (PartyIdentity partyIdentity : partyIdentities) {
					if(MDA.IDENTIFY_TYPE_1 == partyIdentity.getIdentidiesTypeCd().intValue()){
						name = partyObj.getPartyName();
						identityNumber = partyIdentity.getIdentityNum();
					}
				}
			}
			if(offerSpecId == null || offerSpecName == null || name == null || identityNumber == null){
				return retVal;
			}
			 //是否已经校验过，已校验则不重新校验
			int checkLogCount = instDataSMO.getIdentityCheckLogCount(name, identityNumber);
			if(checkLogCount == 0){
				try{
					Map<String, Object> result = ruleOtherSysService.checkIdentityInfo(getOlId(), identityNumber, name);
					if (result != null) {
						String resultCode = (String) result.get("resultCode");
						String[] resultArr = {"01", "02", "03", "04"};
						if(SoRuleUtil.in(resultCode, resultArr)){
							setLimitRuleMsg("客户身份证联网校验未通过，不能办理"+offerSpecName);
							return retVal = 'Y';
						}
					}
				}catch (Exception e) {
					setLimitRuleMsg("客户身份证联网校验异常");
					return retVal = 'Y';
				}
			}
			return retVal;
		}
		
		
		/*
		 * (non-Javadoc)
		 * @see com.linkage.bss.crm.sorule.ruleset.ISoCommitRule#condCheckOfferRela(java.lang.String)
		 */
		public char condCheckOfferRela() throws Exception {
			Date sysDate;
			Boolean ifEmptyGrp;
			Boolean isProdInOffer = false;
			List<OfferSpecRela> offerSpecRelaList = null; //当前销售品所依赖的销售品组
			List<Object> areaIdList = new ArrayList<Object>();
			
			String accessNumber = getAccessNumber();
			Long prodId = null;
			if(accessNumber == null){
				List<OoRole> ooRoles = getBusiOrder().getData().getOoRoles();
				for (OoRole ooRole : ooRoles) {
					if(OrderListUtil.isValidateAoStatus(ooRole.getStatusCd())){
						prodId = MDA.OBJ_TYPE_PROD_SPEC.equals(ooRole.getObjType()) ? ooRole.getObjInstId() : ooRole.getProdId();
						break;
					}
				}
				List<BusiOrder> busiOrders = OrderListUtil.getBusiOrders(getOrderList());
				accessNumber = soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId, busiOrders);
			}
			
			OrderList orderList = getOrderList();
			BusiOrder busiOrder = getBusiOrder();
			//取当前订购的销售品信息
			Integer offerTypeCd = busiOrder.getBusiObj().getOfferTypeCd();
			//
			List<Area> areaList = specDataSMO.getAreasUp(busiOrder.getAreaId().longValue());
			for (Area area : areaList) {
				areaIdList.add(area.getAreaId());
			}

			// 1:订购的是主销售品
			if (1 == offerTypeCd) {
				// 1.1:如果是单产品主销售品，取得产品v_prodId,v_prodSpecId
				OfferSpecInfo offerSpecInfo = specDataSMO.getOfferSpecObj(getOfferSpecId()).getOfferSpecInfo();
				if (null == offerSpecInfo)
					return 'N';

				String ifCompOffer = offerSpecInfo.getCompOffer();
				if ("N".equals(ifCompOffer)) {
					List<OoRole> ooRoleList = OrderListUtil.getOoRoleList(busiOrder, MDA.OBJ_TYPE_PROD_SPEC, null,
							MDA.STATE_ADD);
					//modified by LiuJia 20140527
					Long prodSpecId = null;
					for (OoRole ooRole : SoRuleUtil.nvlArry(ooRoleList)) {
						prodSpecId = ooRole.getObjId();
						break;
					}
					if(prodSpecId == null) return 'N';
					// 获取当前销售品所依赖的销售品组
					List<Map<String, Object>> recList1 = new ArrayList<Map<String, Object>>();
					offerSpecRelaList = specDataSMO.getOfferSpecRelasByOfferSpecId(getOfferSpecId(), MDA.RELA_TYPE_DEPEND);
					for (OfferSpecRela offerSpecRela : SoRuleUtil.nvlArry(offerSpecRelaList)) {
						sysDate = specDataSMO.getSysdateFromDB();
						if (null == offerSpecRela.getRelaOfferSpecId()
								&& null != offerSpecRela.getRelaGrpId()
								&& (null == offerSpecRela.getObjId() || prodSpecId.equals(offerSpecRela.getObjId()))
								&& (null == offerSpecRela.getObjType() || MDA.OBJ_TYPE_PROD_SPEC.equals(offerSpecRela.getObjType())) 
								&& sysDate.after(offerSpecRela.getStartDt())
								&& sysDate.before(offerSpecRela.getEndDt())) {
							Map<String, Object> tempMap = new HashMap<String, Object>();
							tempMap.put("relaGrpId", offerSpecRela.getRelaGrpId());
							tempMap.put("roleCd", offerSpecRela.getRoleCd());
							tempMap.put("objType", offerSpecRela.getObjType());
							tempMap.put("objId", offerSpecRela.getObjId());
							tempMap.put("isAlone", offerSpecRela.getIsAlone());
							tempMap.put("relaRoleCd", offerSpecRela.getRelaRoleCd());
							tempMap.put("relaObjType", offerSpecRela.getRelaObjType());
							tempMap.put("relaObjId", offerSpecRela.getRelaObjId());
							recList1.add(tempMap);
						}
					}

					if (recList1.size() > 0) {
						for (int i = 0; i < recList1.size(); i++) {
							Map<String, Object> recItem1 = (Map<String, Object>) recList1.get(i);
							if ("Y".equals((String) recItem1.get("isAlone"))) {
								// 组内成员独立，依赖其中任何一个即可
								// 遍历组内的销售品
								ifEmptyGrp = true;
								sysDate = specDataSMO.getSysdateFromDB();
								OfferSpecGrp offerSpecGrp = specDataSMO
										.getOfferSpecGrp((Integer) recItem1.get("relaGrpId"));
								if (null != offerSpecGrp && sysDate.compareTo(offerSpecGrp.getStartDt()) >= 0
										&& sysDate.compareTo(offerSpecGrp.getEndDt()) <= 0) {
									List<OfferSpecGrpRela> offerSpecGrpRelas2 = specDataSMO.getOfferSpecGrpRelaList(null, offerSpecGrp.getOfferSpecGrpId());
									if (null != offerSpecGrpRelas2 && offerSpecGrpRelas2.size() > 0) {
										for (int j = 0; j < offerSpecGrpRelas2.size(); j++) {
											OfferSpecGrpRela offerSpecGrpRela = offerSpecGrpRelas2.get(j);
											if (sysDate.compareTo(offerSpecGrpRela.getStartDt()) >= 0
													&& sysDate.compareTo(offerSpecGrpRela.getEndDt()) <= 0) {
												OfferSpecObj offerSpecObj2 = specDataSMO.getOfferSpecObj(offerSpecGrpRela
														.getSubOfferSpecId());

												if (null != offerSpecObj2
														&& SoRuleUtil.in(offerSpecObj2.getAreaId(), areaIdList)) {
													ifEmptyGrp = false;
													isProdInOffer = soCommonSMO.isMemberByOfferSpec( prodId,
															null == recItem1.get("relaRoleCd") ? offerSpecGrpRela
																	.getRoleCd() : (Integer) recItem1.get("relaRoleCd"),
															offerSpecGrpRela.getOfferRoleId(), null == recItem1
																	.get("relaObjType") ? offerSpecGrpRela.getObjType()
																	: (Integer) recItem1.get("relaObjType"),
															offerSpecGrpRela.getSubOfferSpecId(), orderList);

													if (isProdInOffer) {
														break;
													}
												}
											}
										}
										if (isProdInOffer) {
											continue;
										}
									}
								}
								if (ifEmptyGrp == false) {
									String grpName = offerSpecGrp.getName();
									if (null == grpName || "".equals(grpName)) {
										grpName = "未知销售品组";
									}
									String msg = soCommonSMO.getOfferNameInOfferGrp((Integer) recItem1.get("relaGrpId"), 5);
									this.setLimitRuleMsg("产品[" + accessNumber + "]必须订购销售品组（"
											+ (Integer) recItem1.get("relaGrpId") + "：" + grpName + "）" + msg
											+ "内的任意一个销售品！");
									return 'Y';
								}
							} else if ("N".equals((String) recItem1.get("isAlone"))) {
								// 组内成员不独立，需要依赖组中的所有成员
								// 遍历组内的销售品
								sysDate = specDataSMO.getSysdateFromDB();
								OfferSpecGrp offerSpecGrp = specDataSMO
										.getOfferSpecGrp((Integer) recItem1.get("relaGrpId"));
								if (null != offerSpecGrp && sysDate.compareTo(offerSpecGrp.getStartDt()) >= 0
										&& sysDate.compareTo(offerSpecGrp.getEndDt()) <= 0) {
									List<OfferSpecGrpRela> offerSpecGrpRelas3 = specDataSMO.getOfferSpecGrpRelaList(null,
											offerSpecGrp.getOfferSpecGrpId());
									if (null != offerSpecGrpRelas3 && offerSpecGrpRelas3.size() > 0) {
										for (int j = 0; j < offerSpecGrpRelas3.size(); j++) {
											OfferSpecGrpRela offerSpecGrpRela = offerSpecGrpRelas3.get(j);
											if (sysDate.compareTo(offerSpecGrpRela.getStartDt()) >= 0
													&& sysDate.compareTo(offerSpecGrpRela.getEndDt()) <= 0) {
												OfferSpecObj offerSpecObj3 = specDataSMO.getOfferSpecObj(offerSpecGrpRela
														.getSubOfferSpecId());
												if (null != offerSpecObj3
														&& SoRuleUtil.in(offerSpecObj3.getAreaId(), areaIdList)
														&& MDA.SPEC_STATUS_INUSE == offerSpecObj3.getStatusCd()
														&& sysDate.compareTo(offerSpecObj3.getStartDt()) >= 0
														&& sysDate.compareTo(offerSpecObj3.getEndDt()) <= 0) {
													isProdInOffer = soCommonSMO.isMemberByOfferSpec( prodId,
															null == recItem1.get("relaRoleCd") ? offerSpecGrpRela
																	.getRoleCd() : (Integer) recItem1.get("relaRoleCd"),
															offerSpecGrpRela.getOfferRoleId(), null == recItem1
																	.get("relaObjType") ? offerSpecGrpRela.getObjType()
																	: (Integer) recItem1.get("relaObjType"),
															offerSpecGrpRela.getSubOfferSpecId(), orderList);

													if (isProdInOffer == false) {
														String grpName = offerSpecGrp.getName();
														if (null == grpName || "".equals(grpName)) {
															grpName = "未知销售品组";
														}
														String msg = soCommonSMO.getOfferNameInOfferGrp((Integer) recItem1
																.get("relaGrpId"), 5);
														this.setLimitRuleMsg("产品[" + accessNumber + "]必须订购销售品组（"
																+ (Integer) recItem1.get("relaGrpId") + "：" + grpName + "）"
																+ msg + "内的所有销售品！");
														return 'Y';
													}
												}
											}
										}
									}
								}
							}
						}
					}
				} else if ("Y".equals(ifCompOffer)) {
					// @1.2:多成员主销售品
					// 该v_offerSpecId上是否有配置了要依赖成员上必须选的销售品组
					List<Map<String, Object>> recList2 = new ArrayList<Map<String, Object>>();
					List<OfferSpecRela> offerSpecRelas = specDataSMO.getOfferSpecRelasByOfferSpecId(getOfferSpecId(),
							MDA.RELA_TYPE_DEPEND);
					if (null != offerSpecRelas && offerSpecRelas.size() > 0) {
						for (int i = 0; i < offerSpecRelas.size(); i++) {
							sysDate = specDataSMO.getSysdateFromDB();
							OfferSpecRela offerSpecRela = offerSpecRelas.get(i);
							if (null == offerSpecRela.getRelaOfferSpecId() && null != offerSpecRela.getRelaGrpId()
									&& null != offerSpecRela.getRoleCd()
									&& sysDate.compareTo(offerSpecRela.getStartDt()) >= 0
									&& sysDate.compareTo(offerSpecRela.getEndDt()) <= 0) {
								MemberRole memberRole = specDataSMO.getMemberRole(offerSpecRela.getRoleCd());
								if (null != memberRole) {
									List<OfferRoles> offerRolesList = soCommonSMO.getOfferRolesList(offerSpecRela
											.getOfferSpecId());
									if (null != offerRolesList && offerRolesList.size() > 0) {
										for (int j = 0; j < offerRolesList.size(); j++) {
											OfferRoles offerRoles = offerRolesList.get(j);
											if (offerSpecRela.getRoleCd().equals(offerRoles.getRoleCd())) {
												Map<String, Object> tempMap = new HashMap<String, Object>();
												tempMap.put("relaGrpId", offerSpecRela.getRelaGrpId());
												tempMap.put("roleCd", offerSpecRela.getRoleCd());
												tempMap.put("objType", offerSpecRela.getObjType());
												tempMap.put("objId", offerSpecRela.getObjId());
												tempMap.put("name", memberRole.getName());
												tempMap.put("offerRoleId", offerRoles.getOfferRoleId());
												tempMap.put("isAlone", offerSpecRela.getIsAlone());
												tempMap.put("relaRoleCd", offerSpecRela.getRelaRoleCd());
												tempMap.put("relaObjType", offerSpecRela.getRelaObjType());
												tempMap.put("relaObjId", offerSpecRela.getRelaObjId());
												recList2.add(tempMap);
											}
										}
									}
								}
							}
						}
					}

					// 取得所加入成员的信息
					if (recList2 != null && recList2.size() > 0) {
						for (int i = 0; i < recList2.size(); i++) {
							Map<String, Object> recItem2 = (Map<String, Object>) recList2.get(i);
							List<BusiOrder> busiOrders = orderList.getCustOrderList().get(0).getBusiOrder();
							if (null != busiOrders && busiOrders.size() > 0) {
								for (int j = 0; j < busiOrders.size(); j++) {
									BusiOrder busiOrderOfOl = busiOrders.get(j);
									if ((MDA.BO_ACTION_STATUS_P.equals(busiOrderOfOl.getBusiOrderInfo().getStatusCd()) || MDA.BO_ACTION_STATUS_S
											.equals(busiOrderOfOl.getBusiOrderInfo().getStatusCd()))
											&& getOfferId().equals(busiOrderOfOl.getBusiObj().getInstId())) {
										List<OoRole> ooRoles = busiOrderOfOl.getData().getOoRoles();
										if (null != ooRoles && ooRoles.size() > 0) {
											for (int k = 0; k < ooRoles.size(); k++) {
												OoRole ooRole = ooRoles.get(k);
												if (!MDA.BO_ACTION_STATUS_D.equals(ooRole.getStatusCd())
														&& MDA.STATE_ADD.equals(ooRole.getState())
														&& ((Long) recItem2.get("offerRoleId")).equals(ooRole
																.getOfferRoleId())
														&& (null == recItem2.get("objId") || ((Long) recItem2.get("objId"))
																.equals(ooRole.getObjId()))
														&& (null == recItem2.get("objType") || ((Integer) recItem2
																.get("objType")).equals(ooRole.getObjType()))) {
													accessNumber = soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), ooRole.getObjInstId(), busiOrders);
													if ("Y".equals((String) recItem2.get("isAlone"))) {
														// 组内成员独立，依赖其中任何一个即可
														// 遍历组内的销售品
														ifEmptyGrp = true;
														sysDate = specDataSMO.getSysdateFromDB();
														OfferSpecGrp offerSpecGrp = specDataSMO
																.getOfferSpecGrp((Integer) recItem2.get("relaGrpId"));
														if (null != offerSpecGrp
																&& sysDate.compareTo(offerSpecGrp.getStartDt()) >= 0
																&& sysDate.compareTo(offerSpecGrp.getEndDt()) <= 0) {
															List<OfferSpecGrpRela> offerSpecGrpRelas2 = specDataSMO
																	.getOfferSpecGrpRelaList(null, offerSpecGrp
																			.getOfferSpecGrpId());
															if (null != offerSpecGrpRelas2 && offerSpecGrpRelas2.size() > 0) {
																boolean isExist = false;
																for (int l = 0; l < offerSpecGrpRelas2.size(); l++) {
																	OfferSpecGrpRela offerSpecGrpRela = offerSpecGrpRelas2
																			.get(l);
																	if (sysDate.compareTo(offerSpecGrpRela.getStartDt()) >= 0
																			&& sysDate.compareTo(offerSpecGrpRela
																					.getEndDt()) <= 0) {
																		OfferSpecObj offerSpecObj2 = specDataSMO
																				.getOfferSpecObj(offerSpecGrpRela
																						.getSubOfferSpecId());

																		if (null != offerSpecObj2
																				&& areaIdList.contains(offerSpecObj2
																						.getAreaId())) {
																			ifEmptyGrp = false;
																			isProdInOffer = soCommonSMO
																					.isMemberByOfferSpec(
																							ooRole.getObjInstId(),
																							null == recItem2
																									.get("relaRoleCd") ? offerSpecGrpRela
																									.getRoleCd()
																									: (Integer) recItem2
																											.get("relaRoleCd"),
																							offerSpecGrpRela
																									.getOfferRoleId(),
																							null == recItem2
																									.get("relaObjType") ? offerSpecGrpRela
																									.getObjType()
																									: (Integer) recItem2
																											.get("relaObjType"),
																							offerSpecGrpRela
																									.getSubOfferSpecId(),
																							orderList);
																			if (isProdInOffer) {
																				isExist = true;
																				break;
																			}
																		}
																	}
																}
																if (isExist) {
																	continue;
																}
															}
														}
														if (ifEmptyGrp == false) {
															String grpName = offerSpecGrp.getName();
															if (null == grpName || "".equals(grpName)) {
																grpName = "未知销售品组";
															}
															String msg = soCommonSMO.getOfferNameInOfferGrp(
																	(Integer) recItem2.get("relaGrpId"), 5);
															this.setLimitRuleMsg("产品[" + accessNumber + "]必须订购销售品组（"
																	+ (Integer) recItem2.get("relaGrpId") + "：" + grpName
																	+ "）" + msg + "内的任意一个销售品！");
															return 'Y';
														}
													} else if ("N".equals((String) recItem2.get("isAlone"))) {
														// 组内成员不独立，需要依赖组中的所有成员
														// 遍历组内的销售品
														sysDate = specDataSMO.getSysdateFromDB();
														OfferSpecGrp offerSpecGrp = specDataSMO
																.getOfferSpecGrp((Integer) recItem2.get("relaGrpId"));
														if (null != offerSpecGrp
																&& sysDate.compareTo(offerSpecGrp.getStartDt()) >= 0
																&& sysDate.compareTo(offerSpecGrp.getEndDt()) <= 0) {
															List<OfferSpecGrpRela> offerSpecGrpRelas3 = specDataSMO
																	.getOfferSpecGrpRelaList(null, offerSpecGrp
																			.getOfferSpecGrpId());
															if (null != offerSpecGrpRelas3 && offerSpecGrpRelas3.size() > 0) {
																for (int l = 0; l < offerSpecGrpRelas3.size(); l++) {
																	OfferSpecGrpRela offerSpecGrpRela = offerSpecGrpRelas3
																			.get(l);
																	if (sysDate.compareTo(offerSpecGrpRela.getStartDt()) >= 0
																			&& sysDate.compareTo(offerSpecGrpRela
																					.getEndDt()) <= 0) {
																		OfferSpecObj offerSpecObj3 = specDataSMO
																				.getOfferSpecObj(offerSpecGrpRela
																						.getSubOfferSpecId());

																		if (null != offerSpecObj3
																				&& areaIdList.contains(offerSpecObj3
																						.getAreaId())
																				&& MDA.SPEC_STATUS_INUSE.intValue() == offerSpecObj3
																						.getStatusCd().intValue()
																				&& sysDate.compareTo(offerSpecObj3
																						.getStartDt()) >= 0
																				&& sysDate.compareTo(offerSpecObj3
																						.getEndDt()) <= 0) {
																			isProdInOffer = soCommonSMO
																					.isMemberByOfferSpec(
																							ooRole.getObjInstId(),
																							null == recItem2
																									.get("relaRoleCd") ? offerSpecGrpRela
																									.getRoleCd()
																									: (Integer) recItem2
																											.get("relaRoleCd"),
																							offerSpecGrpRela
																									.getOfferRoleId(),
																							null == recItem2
																									.get("relaObjType") ? offerSpecGrpRela
																									.getObjType()
																									: (Integer) recItem2
																											.get("relaObjType"),
																							offerSpecGrpRela
																									.getSubOfferSpecId(),
																							orderList);

																			if (isProdInOffer == false) {
																				String grpName = offerSpecGrp.getName();
																				if (null == grpName || "".equals(grpName)) {
																					grpName = "未知销售品组";
																				}
																				String msg = soCommonSMO
																						.getOfferNameInOfferGrp(
																								(Integer) recItem2
																										.get("relaGrpId"),
																								5);
																				this.setLimitRuleMsg("产品["
																						+ accessNumber
																						+ "]必须订购销售品组（"
																						+ (Integer) recItem2
																								.get("relaGrpId") + "："
																						+ grpName + "）" + msg + "内的所有销售品！");
																				return 'Y';
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
			// 2:订购的是附属销售品
			else if (2 == offerTypeCd) {
				Integer tmpObjType = 0;
				Long tmpObjId = 0L;
				Long tmpObjInstId = 0L;
				List<BusiOrder> busiOrders = orderList.getCustOrderList().get(0).getBusiOrder();
				if (null != busiOrders && busiOrders.size() > 0) {
					for (int j = 0; j < busiOrders.size(); j++) {
						BusiOrder busiOrderOfOl = busiOrders.get(j);
						if ((MDA.BO_ACTION_STATUS_P.equals(busiOrderOfOl.getBusiOrderInfo().getStatusCd()) || MDA.BO_ACTION_STATUS_S
								.equals(busiOrderOfOl.getBusiOrderInfo().getStatusCd()))
								&& getOfferId().equals(busiOrderOfOl.getBusiObj().getInstId())) {
							List<OoRole> ooRoles = busiOrderOfOl.getData().getOoRoles();
							if (null != ooRoles && ooRoles.size() > 0) {
								for (int k = 0; k < ooRoles.size(); k++) {
									OoRole ooRole = ooRoles.get(k);
									if (!MDA.BO_ACTION_STATUS_D.equals(ooRole.getStatusCd())
											&& MDA.STATE_ADD.equals(ooRole.getState())
											&& (MDA.OBJ_TYPE_PROD_SPEC.equals(ooRole.getObjType()) || MDA.OBJ_TYPE_SERV_SPEC
													.equals(ooRole.getObjType()))) {
										tmpObjType = ooRole.getObjType();
										tmpObjId = ooRole.getObjId();
										tmpObjInstId = ooRole.getObjInstId();
										setProdId(ooRole.getProdId());
									}
									if (null != tmpObjType && 0 != tmpObjType.intValue() && null != tmpObjId
											&& 0 != tmpObjId.longValue() && null != tmpObjInstId
											&& 0 != tmpObjInstId.longValue()) {
										break;
									}
								}
							}
						}
					}
				}
				if (null == tmpObjType || 0 == tmpObjType.intValue() || null == tmpObjId || 0 == tmpObjId.longValue()
						|| null == tmpObjInstId || 0 == tmpObjInstId.longValue()) {
					return 'N';
				}
				// 获取产品实例ID
				if (null == getProdId() || 0 == getProdId().longValue()) {
					if (MDA.OBJ_TYPE_SERV_SPEC.equals(tmpObjType)) {
						setProdId(soCommonSMO.getProdIdByServId(tmpObjInstId, orderList));
					} else {
						setProdId(tmpObjInstId);
					}
				}
				if (null == getProdId() || 0 == getProdId().longValue()) {
					return 'N';
				}
				// 获取所依赖的销售品组
				List<Map<String, Object>> recList3 = new ArrayList<Map<String, Object>>();
				List<OfferSpecRela> offerSpecRelas = specDataSMO.getOfferSpecRelasByOfferSpecId(getOfferSpecId(),
						MDA.RELA_TYPE_DEPEND);
				if (null != offerSpecRelas && offerSpecRelas.size() > 0) {
					for (int i = 0; i < offerSpecRelas.size(); i++) {
						sysDate = specDataSMO.getSysdateFromDB();
						OfferSpecRela offerSpecRela = offerSpecRelas.get(i);
						if (null == offerSpecRela.getRelaOfferSpecId() && null != offerSpecRela.getRelaGrpId()
								&& (null == offerSpecRela.getObjId() || tmpObjId.equals(offerSpecRela.getObjId()))
								&& (null == offerSpecRela.getObjType() || tmpObjType.equals(offerSpecRela.getObjType()))
								&& sysDate.compareTo(offerSpecRela.getStartDt()) >= 0
								&& sysDate.compareTo(offerSpecRela.getEndDt()) <= 0) {
							Map<String, Object> tempMap = new HashMap<String, Object>();
							tempMap.put("relaGrpId", offerSpecRela.getRelaGrpId());
							tempMap.put("isAlone", offerSpecRela.getIsAlone());
							tempMap.put("relaRoleCd", offerSpecRela.getRelaRoleCd());
							tempMap.put("relaObjType", offerSpecRela.getRelaObjType());
							tempMap.put("relaObjId", offerSpecRela.getRelaObjId());
							recList3.add(tempMap);
						}
					}
				}

				if (recList3.size() > 0) {

					for (int i = 0; i < recList3.size(); i++) {
						Map<String, Object> recItem3 = (Map<String, Object>) recList3.get(i);
						if ("Y".equals((String) recItem3.get("isAlone"))) {
							// 组内成员独立，依赖其中任何一个即可
							// 遍历组内的销售品
							ifEmptyGrp = true;
							sysDate = specDataSMO.getSysdateFromDB();
							OfferSpecGrp offerSpecGrp = specDataSMO.getOfferSpecGrp((Integer) recItem3.get("relaGrpId"));
							if (null != offerSpecGrp && sysDate.compareTo(offerSpecGrp.getStartDt()) >= 0
									&& sysDate.compareTo(offerSpecGrp.getEndDt()) <= 0) {
								List<OfferSpecGrpRela> offerSpecGrpRelas2 = specDataSMO.getOfferSpecGrpRelaList(null,
										offerSpecGrp.getOfferSpecGrpId());
								if (null != offerSpecGrpRelas2 && offerSpecGrpRelas2.size() > 0) {
									for (int j = 0; j < offerSpecGrpRelas2.size(); j++) {
										OfferSpecGrpRela offerSpecGrpRela = offerSpecGrpRelas2.get(j);
										if (sysDate.compareTo(offerSpecGrpRela.getStartDt()) >= 0
												&& sysDate.compareTo(offerSpecGrpRela.getEndDt()) <= 0) {
											OfferSpecObj offerSpecObj2 = specDataSMO.getOfferSpecObj(offerSpecGrpRela
													.getSubOfferSpecId());

											if (null != offerSpecObj2 && areaIdList.contains(offerSpecObj2.getAreaId())) {
												ifEmptyGrp = false;
												isProdInOffer = soCommonSMO.isMemberByOfferSpec( getProdId(), null == recItem3
														.get("relaRoleCd") ? offerSpecGrpRela.getRoleCd()
														: (Integer) recItem3.get("relaRoleCd"), offerSpecGrpRela
														.getOfferRoleId(),
														null == recItem3.get("relaObjType") ? offerSpecGrpRela.getObjType()
																: (Integer) recItem3.get("relaObjType"), offerSpecGrpRela
																.getSubOfferSpecId(), orderList);

												if (isProdInOffer) {
													break;
												}
											}

										}
									}
									if (isProdInOffer) {
										continue;
									}
								}
							}
							if (ifEmptyGrp == false) {
								String grpName = offerSpecGrp.getName();
								if (null == grpName || "".equals(grpName)) {
									grpName = "未知销售品组";
								}
								String msg = soCommonSMO.getOfferNameInOfferGrp((Integer) recItem3.get("relaGrpId"), 5);
								this.setLimitRuleMsg("产品[" + accessNumber + "]必须成为销售品组（"
										+ (Integer) recItem3.get("relaGrpId") + "：" + grpName + "）" + msg
										+ "内的任意一个销售品的任意成员或特定成员，才可以订购[" + getOfferSpecName() + "]");
								return 'Y';
							}
						} else if ("N".equals((String) recItem3.get("isAlone"))) {
							// 组内成员不独立，需要依赖组中的所有成员
							// 遍历组内的销售品
							sysDate = specDataSMO.getSysdateFromDB();
							OfferSpecGrp offerSpecGrp = specDataSMO.getOfferSpecGrp((Integer) recItem3.get("relaGrpId"));
							if (null != offerSpecGrp && sysDate.compareTo(offerSpecGrp.getStartDt()) >= 0
									&& sysDate.compareTo(offerSpecGrp.getEndDt()) <= 0) {
								List<OfferSpecGrpRela> offerSpecGrpRelas3 = specDataSMO.getOfferSpecGrpRelaList(null,
										offerSpecGrp.getOfferSpecGrpId());
								if (null != offerSpecGrpRelas3 && offerSpecGrpRelas3.size() > 0) {
									for (int j = 0; j < offerSpecGrpRelas3.size(); j++) {
										OfferSpecGrpRela offerSpecGrpRela = offerSpecGrpRelas3.get(j);
										if (sysDate.compareTo(offerSpecGrpRela.getStartDt()) >= 0
												&& sysDate.compareTo(offerSpecGrpRela.getEndDt()) <= 0) {
											OfferSpecObj offerSpecObj3 = specDataSMO.getOfferSpecObj(offerSpecGrpRela
													.getSubOfferSpecId());

											if (null != offerSpecObj3
													&& areaIdList.contains(offerSpecObj3.getAreaId())
													&& MDA.SPEC_STATUS_INUSE.intValue() == offerSpecObj3.getStatusCd()
															.intValue()
													&& sysDate.compareTo(offerSpecObj3.getStartDt()) >= 0
													&& sysDate.compareTo(offerSpecObj3.getEndDt()) <= 0) {
												isProdInOffer = soCommonSMO.isMemberByOfferSpec( getProdId(), null == recItem3
														.get("relaRoleCd") ? offerSpecGrpRela.getRoleCd()
														: (Integer) recItem3.get("relaRoleCd"), offerSpecGrpRela
														.getOfferRoleId(),
														null == recItem3.get("relaObjType") ? offerSpecGrpRela.getObjType()
																: (Integer) recItem3.get("relaObjType"), offerSpecGrpRela
																.getSubOfferSpecId(), orderList);

												if (isProdInOffer == false) {
													String grpName = offerSpecGrp.getName();
													if (null == grpName || "".equals(grpName)) {
														grpName = "未知销售品组";
													}
													String msg = soCommonSMO.getOfferNameInOfferGrp((Integer) recItem3
															.get("relaGrpId"), 5);
													this.setLimitRuleMsg("产品[" + accessNumber + "]必须成为销售品组（"
															+ (Integer) recItem3.get("relaGrpId") + "：" + grpName + "）"
															+ msg + "内的所有销售品的任意成员或特定成员，才可以订购[[" + getOfferSpecName() + "]");
													return 'Y';
												}
											}
										}
									}
								}
							}
						}
					}

				}
			}

			return 'N';
		}
		
		
	    public char CondPstnReInstalllimit() throws Exception{
			OrderList orderList = getOrderList();
	    	List<BusiOrder> busiOrderList = OrderListUtil.getBusiOrders(orderList);
	    	List<OoRole> ooRoles = getBusiOrder().getData().getOoRoles();
	    	Long phoneNumberId =null;
			String phoneNumber = null;
			Long addressId =  null;
	    	for(OoRole ooRole : ooRoles){
	    		if(SoRuleUtil.in(ooRole.getStatusCd(), SoRuleUtil.newArrayList(MDA.BO_STATU_P,MDA.BO_STATU_S))){
	    			//实例中取
	        		Map<String,Object> resultMap = instDataSMO.getAccesNumAndAddrIdByProdId(ooRole.getProdId());
	        		if(!SoRuleUtil.isEmptyMap(resultMap)){
	            		phoneNumberId = SoRuleUtil.getLong(resultMap.get("PHONENUMBERID"));
	            		phoneNumber = SoRuleUtil.getString(resultMap.get("PHONENUMBER"));
	            		addressId =  SoRuleUtil.getLong(resultMap.get("ADDRESSID"));
	        		}else{
	        			//当前购物车
	        			for(BusiOrder busiOrder : busiOrderList){
	            			if(SoRuleUtil.equals(busiOrder.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT)&& busiOrder.getBusiObj().getInstId().equals(ooRole.getProdId())){
	            				List<BoProdAn> boPordAns = busiOrder.getData().getBoProdAns();
	                    		for(BoProdAn boProdAn : SoRuleUtil.nvlArry(boPordAns)){
	                    			if(SoRuleUtil.in(boProdAn.getStatusCd(), SoRuleUtil.newArrayList(MDA.BO_STATU_P,MDA.BO_STATU_S))){
	                    				phoneNumberId = boProdAn.getAnId();
	                    				phoneNumber = boProdAn.getAccessNumber();
	                    				break;
	                    			}
	                    		}
	                    		
	                    		List<BoProdAddress> boPordAdresses = busiOrder.getData().getBoProdAddresses();
	                    		for(BoProdAddress boProdAddress : SoRuleUtil.nvlArry(boPordAdresses)){
	                    			if(SoRuleUtil.in(boProdAddress.getStatusCd(), SoRuleUtil.newArrayList(MDA.BO_STATU_P,MDA.BO_STATU_S))){
	                    				addressId = boProdAddress.getAddrId();
	                    				break;
	                    			}
	                    		}
	            			}       			
	            		}
	        		}
	        		
	        		Map<String, Object> map = ruleOtherSysService.reinstallment(phoneNumberId, phoneNumber, addressId);
	        		if(!("0").equals(SoRuleUtil.getInt(map.get("outCode")))){
	    				setLimitRuleMsg(" 请注意，该产品【" + phoneNumber + "】拆机复装失败，原因：" + map.get("outMsg"));
	    				return 'Y';
	        		}
	        	}
	    	}   		
	    	return 'N';
	    }	
	    public char CondeTDPhoneCdmaRule() throws Exception {
			Long prodId = getProdId();
			OrderList orderList = getOrderList();
			//如果是撤单，直接返回
			List<BoRela> boRelas = getBusiOrder().getBoRelas();
			for (BoRela boRela : SoRuleUtil.nvlArry(boRelas)) {
				if(MDA.RELA_TYPE_REPEAL.equals(boRela.getRelaTypeCd())){
					return 'N';
				}
			}
			Integer servSpecId = null;
		    List<BoServOrder> boServOrders2 = getBusiOrder().getData().getBoServOrders();
			if(boServOrders2 != null && boServOrders2.size() > 0){
				servSpecId = boServOrders2.get(0).getServSpecId();
			}
			//预开户判断方式有待验证，这里沿用2.0的处理方式
			boolean isProdActive = false;
			if(servSpecId == null && MDA.BO_ACTION_TYPE_CD_CHANGE_SERV.equals(getBoActionTypeCd())){
				isProdActive = true;
			}
			boolean ifNewProd = soCommonSMO.ifNewProd(orderList, prodId);
			if (!ifNewProd && !isProdActive) {
				this.setLimitRuleMsg("纳入无线通多产品销售品的无线通成员必须是新装或者预开户纳入！");
				return 'Y';
			}
			List<Long> delServItemIds = new ArrayList<Long>();
			List<BusiOrder> busiOrderList =  OrderListUtil.getBusiOrders(getOrderList()); 
			for (BusiOrder busiOrder : busiOrderList) {
				if(!OrderListUtil.isValidateBoStatus(busiOrder)){
					continue;
				}
				List<BoServItem> boServItems = busiOrder.getData().getBoServItems();
				for (BoServItem boServItem : SoRuleUtil.nvlArry(boServItems)) {
					if(!MDA.STATE_DEL.equals(boServItem.getState())){
						continue;
					}
					if(OrderListUtil.isValidateAoStatus(boServItem.getStatusCd()) && "1".equals(boServItem.getValue())){
						delServItemIds.add(boServItem.getServId());
					}
				}
			}
			Integer[] ServSpecArr = {MDA.SSID_INTERNEL_ROAMING, MDA.SSID_MAIN_NUMBER, MDA.SSID_VIRTUAL_NUMBER};
			if (SoRuleUtil.in(servSpecId, ServSpecArr)){
				boolean flag = false;
				//当前购物车是否有订购新版无线通。
				breFalg :
					for(BusiOrder bo : busiOrderList){
						if(!OrderListUtil.isValidateBoStatus(bo) || !SoRuleUtil.equals(bo.getBusiObj().getInstId(), getProdId())){
							continue;
						}
						List<BoServOrder> listBoServOrders = bo.getData().getBoServOrders();
						for(BoServOrder bso : SoRuleUtil.nvlArry(listBoServOrders)){
							if(SoRuleUtil.equals(bso.getServSpecId(), MDA.SSID_WP)){
								List<BoServ> lisBoServs = bo.getData().getBoServs();
								for(BoServ bs : SoRuleUtil.nvlArry(lisBoServs)){
									if(OrderListUtil.isValidateAddAo(bs.getStatusCd(), bs.getState())){
										List<BoServItem> boServItems = bo.getData().getBoServItems();
										for (BoServItem boServItem : SoRuleUtil.nvlArry(boServItems)) {
											if(OrderListUtil.isValidateAddAo(bs.getStatusCd(), bs.getState()) &&
													SoRuleUtil.equals(MDA.ITEM_SPEC_109040076, boServItem.getItemSpecId()) 
													&& "1".equals(boServItem.getValue())){
												flag = true;
												break breFalg;
											}
										}
									}
								}
							}
						}
					}
				if(flag){
					ServSpec servSpec = specDataSMO.getServSpecsById(servSpecId);
					setLimitRuleMsg("纳入新无线通多产品销售品的无线通成员不能开通【" + servSpec.getName() + "】服务");
					return 'Y';
				}
				//查看实例是否有新版无线通
				List<OfferServ> offerServList = instDataSMO.getOfferServListByProdId(getOlId(), getProdId());
				for (OfferServ offerServ : SoRuleUtil.nvlArry(offerServList)) {
					if (!MDA.SSID_WP.equals(offerServ.getServSpecId())){
						continue;
					}
					List<OfferServItem> offerServItemList = instDataSMO.getOfferServItemList(getOlId(), offerServ.getServId(), MDA.ITEM_SPEC_109040076);
					for (OfferServItem offerServItem : SoRuleUtil.nvlArry(offerServItemList)) {
						if ("1".equals(offerServItem.getValue()) && !delServItemIds.contains(offerServItem.getServId())){
							ServSpec servSpec = specDataSMO.getServSpecsById(servSpecId);
							setLimitRuleMsg("纳入新无线通多产品销售品的无线通成员不能开通【" + servSpec.getName() + "】服务");
							return 'Y';
						}
					}
				}
			}
			
			List<BoProdItem> boProdItemList = OrderListUtil.getBoProdItemListByProdId(busiOrderList, prodId, MDA.ITEM_SPEC_8700000);
			if (boProdItemList != null && boProdItemList.size() > 0) {
				for (BoProdItem boProdItem : boProdItemList) {
					if ("1".equals(boProdItem.getValue())) {
						this.setLimitRuleMsg("纳入无线通多产品销售品的无线通成员不能选择ocs预付费！");
						return 'Y';
					}
				}
			}
			
			for (BusiOrder busiOrder : busiOrderList) {
				if (!OrderListUtil.isValidateBoStatus(busiOrder)) {
					continue;
				}
				if (!busiOrder.getBusiObj().getInstId().equals(prodId)) {
					continue;
				}
				List<BoProd2Td> boProd2TdList = busiOrder.getData().getBoProd2Tds();
				for (BoProd2Td boProd2Td : boProd2TdList) {
					if (!OrderListUtil.isValidateAoStatus(boProd2Td.getStatusCd())) {
						continue;
					}
					if (!MDA.STATE_ADD.equals(boProd2Td.getState())) {
						continue;
					}
					Map<String,Object> params = new HashMap<String,Object>();
					params.put("terminalDevId", boProd2Td.getTerminalDevId());
					params.put("itemSpecId", MDA.ITEM_SPEC_76000019);
					List<Map<String,Object>> terminalDevItemList = specDataSMO.getTerminalDevItem(params);
					if (terminalDevItemList.size() == 0 || !"Y".equals(terminalDevItemList.get(0).get("value"))) {
						this.setLimitRuleMsg("纳入无线通的CDMA必须选择新村通卡！");
						return 'Y';
					}
				}
			}
			//测试人员确认2.0可以订购
			if (orderList.getOrderListInfo().getOlTypeCd().intValue() != 6) {
				String retMsg = "纳入无线通多产品销售品的无线通成员不能开通";
				int flagCount = 0;
				for (BusiOrder busiOrder : busiOrderList) {
					if (!OrderListUtil.isValidateBoStatus(busiOrder)) {
						continue;
					}

					if (!busiOrder.getBusiObj().getInstId().equals(prodId)) {
						continue;
					}

					List<BoServOrder> boServOrders = busiOrder.getData().getBoServOrders();
					if (SoRuleUtil.isEmptyList(boServOrders)) {
						continue;
					}
					//判断是否有boServs
					List<BoServ> boServs = busiOrder.getData().getBoServs();
					if (!SoRuleUtil.isEmptyList(boServs)) {
						for (BoServ boServ : boServs){
							if (boServ == null || !OrderListUtil.isValidateAoStatus(boServ.getStatusCd())) {
								continue;
							}
							if (!MDA.STATE_ADD.equals(boServ.getState())) {
								continue;
							}
							Integer servSpecId2 = boServOrders.get(0).getServSpecId();
							Integer cnt = specDataSMO.getServSpec2CategoryNodeCountById(Long.valueOf(servSpecId2), MDA.CATAGORY_NODE_ID_1034000);
							if (cnt == 0) {
								retMsg += "【"+specDataSMO.getServSpecsById(servSpecId2).getName()+"】";
								flagCount++;
							}
						}
					}
				}
				if(flagCount > 0){
					this.setLimitRuleMsg(retMsg);
					return 'Y';
				}
				//List<BoServDataDto> boServDataList = OrderListUtil.getBoServDataListByInstId(busiOrderList, prodId);
				String[] targetArr = {"ADD", "KIP"};
				boolean isNewWirelessCom = false;
				List<BoServItem> boServItems = getBusiOrder().getData().getBoServItems();
				for (BoServItem boServItem : SoRuleUtil.nvlArry(boServItems)) {
					if(OrderListUtil.isValidateAoStatus(boServItem.getStatusCd()) && SoRuleUtil.in(boServItem.getState(), targetArr)
							&& MDA.ITEM_SPEC_109040076.equals(boServItem.getItemSpecId())
							&& "1".equals(boServItem.getValue())){
						isNewWirelessCom = true;
					}
				}
				//新无线通规则限制
				if(isNewWirelessCom){
					//新无线通的手机上的无线座机（手机）服务修改参数为“新版无线通”时，需要校验手机有没有加入ivpn组合。
					List<OfferProdComp> offerProdComps = instDataSMO.getOfferProdCompByProdId(getOlId(), prodId);
					for (OfferProdComp offerProdComp : SoRuleUtil.nvlArry(offerProdComps)) {
						if(!InstDataUtil.ifValidateInstStatus(offerProdComp.getStatusCd())){
							continue;
						}
						if(MDA.PSID_880000009.equals(offerProdComp.getProdSpecId()) || MDA.PSID_880000010.equals(offerProdComp.getProdSpecId())){
							setLimitRuleMsg("新无线通手机不能加入ivpn组合！");
							return 'Y';
						}
					}
					
					Long compOfferId = null;
					List<BusiOrder> busiOrders = OrderListUtil.getBusiOrders(getOrderList());
					for (BusiOrder busiOrder : busiOrders) {
						if(!OrderListUtil.isValidateBoStatus(busiOrder) || busiOrder.getBoActionType().getActionClassCd() != MDA.ACTION_CLASS_OFFER){
							continue;
						}
						List<OoRole> ooRoles = busiOrder.getData().getOoRoles();
						for (OoRole ooRole : ooRoles) {
							if(OrderListUtil.isValidateAoStatus(ooRole.getStatusCd()) && 
									SoRuleUtil.in(ooRole.getState(), targetArr) && ooRole.getObjInstId().equals(getProdId())){
								BusiObj offerOrder = busiOrder.getBusiObj();
								List<OfferSpecParam> offerSpecParamsByOfferSpecId = specDataSMO.getOfferSpecParamsByOfferSpecId(offerOrder.getObjId());
								for (OfferSpecParam offerSpecParam : offerSpecParamsByOfferSpecId) {
									if(MDA.ITEM_SPEC_109041003.equals(offerSpecParam.getItemSpecId())){
										compOfferId = offerOrder.getInstId();
									}
								}
							}
						}
					}
					if(compOfferId == null){
						List<OfferMember> offerMemberList = instDataSMO.getOfferMemberList(getBaseInfo().getOlId(), getProdId(), MDA.OBJ_TYPE_PROD_SPEC);
						for (OfferMember offerMember : SoRuleUtil.nvlArry(offerMemberList)) {
							Offer offer = instDataSMO.getOffer(getBaseInfo().getOlId(), offerMember.getOfferId());
							if(offer!= null && InstDataUtil.ifValidateInstStatus(offer.getStatusCd())){
								List<OfferSpecParam> offerSpecParamsByOfferSpecId = specDataSMO.getOfferSpecParamsByOfferSpecId(offer.getOfferSpecId());
								for (OfferSpecParam offerSpecParam : offerSpecParamsByOfferSpecId) {
									if(MDA.ITEM_SPEC_109041003.equals(offerSpecParam.getItemSpecId())){
										compOfferId = offer.getOfferId();
									}
								}
							}
						}
					}
					if(compOfferId == null){
						setLimitRuleMsg("新无线通必须要求加入无线通多产品销售品");
						return 'Y';
					}
				}
			}
			return 'N';
		}
	    
	    public char CondeTDPhoneCdmaRuleUp() throws Exception {
			Long prodId = getProdId();
			OrderList orderList = getOrderList();
			//如果是撤单，直接返回
			List<BoRela> boRelas = getBusiOrder().getBoRelas();
			for (BoRela boRela : SoRuleUtil.nvlArry(boRelas)) {
				if(MDA.RELA_TYPE_REPEAL.equals(boRela.getRelaTypeCd())){
					return 'N';
				}
			}
			Integer servSpecId = null;
		    List<BoServOrder> boServOrders2 = getBusiOrder().getData().getBoServOrders();
			if(boServOrders2 != null && boServOrders2.size() > 0){
				servSpecId = boServOrders2.get(0).getServSpecId();
			}
			Integer[] ServSpecArr = {MDA.SSID_INTERNEL_ROAMING, MDA.SSID_MAIN_NUMBER, MDA.SSID_VIRTUAL_NUMBER};
			if(servSpecId != null && !SoRuleUtil.in(servSpecId, ServSpecArr) && !SoRuleUtil.equals(servSpecId, MDA.SSID_WP)){
				return 'N';
			}
			//产品动作进来就不会有servSpecId
			boolean isProdActive = false;
			if(servSpecId == null && MDA.BO_ACTION_TYPE_CD_CHANGE_SERV.equals(getBoActionTypeCd())){
				isProdActive = true;
			}
			List<BusiOrder> busiOrderList =  OrderListUtil.getBusiOrders(getOrderList()); 
			//订购了国漫，一卡双号就来的用户
			if(servSpecId != null && SoRuleUtil.in(servSpecId, ServSpecArr)){
				boolean flag = false;
				//当前购物车是否有订购新版无线通
				breFalg :
					for(BusiOrder bo : busiOrderList){
						if(!OrderListUtil.isValidateBoStatus(bo) || !SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
							continue;
						}
						List<BoServOrder> listBoServOrders = bo.getData().getBoServOrders();
						for(BoServOrder bso : SoRuleUtil.nvlArry(listBoServOrders)){
							if(SoRuleUtil.equals(bso.getServSpecId(), MDA.SSID_WP)){
								List<BoServ> lisBoServs = bo.getData().getBoServs();
								for(BoServ bs : SoRuleUtil.nvlArry(lisBoServs)){
									if(OrderListUtil.isValidateAddAo(bs.getStatusCd(), bs.getState())){
										List<BoServItem> boServItems = bo.getData().getBoServItems();
										for (BoServItem boServItem : SoRuleUtil.nvlArry(boServItems)) {
											if(OrderListUtil.isValidateAddAo(bs.getStatusCd(), bs.getState()) &&
													SoRuleUtil.equals(MDA.ITEM_SPEC_109040076, boServItem.getItemSpecId()) 
													&& "1".equals(boServItem.getValue())){
												flag = true;
												break breFalg;
											}
										}
									}
								}
							}
						}
					}
				if(flag){
					ServSpec servSpec = specDataSMO.getServSpecsById(servSpecId);
					setLimitRuleMsg("纳入新无线通多产品销售品的无线通成员不能开通【" + servSpec.getName() + "】服务");
					return 'Y';
				}else{
					//当前购物车是否有退订新版无线通
					List<Long> delServItemIds = new ArrayList<Long>();
					for (BusiOrder busiOrder : busiOrderList) {
						if(!OrderListUtil.isValidateBoStatus(busiOrder) || !SoRuleUtil.equals(busiOrder.getBusiObj().getInstId(), prodId)){
							continue;
						}
						List<BoServItem> boServItems = busiOrder.getData().getBoServItems();
						for (BoServItem boServItem : SoRuleUtil.nvlArry(boServItems)) {
							if(!MDA.STATE_DEL.equals(boServItem.getState())){
								continue;
							}
							if(OrderListUtil.isValidateAoStatus(boServItem.getStatusCd()) && 
									"1".equals(boServItem.getValue()) &&
									SoRuleUtil.equals(MDA.ITEM_SPEC_109040076, boServItem.getItemSpecId())){
								delServItemIds.add(boServItem.getServId());
							}
						}
					}
					//查看实例是否有新版无线通
					List<OfferServ> offerServList = instDataSMO.getOfferServListByProdId(getOlId(), getProdId());
					for (OfferServ offerServ : SoRuleUtil.nvlArry(offerServList)) {
						if (!MDA.SSID_WP.equals(offerServ.getServSpecId())){
							continue;
						}
						List<OfferServItem> offerServItemList = instDataSMO.getOfferServItemList(getOlId(), offerServ.getServId(), MDA.ITEM_SPEC_109040076);
						for (OfferServItem offerServItem : SoRuleUtil.nvlArry(offerServItemList)) {
							if ("1".equals(offerServItem.getValue()) && !delServItemIds.contains(offerServItem.getServId())){
								ServSpec servSpec = specDataSMO.getServSpecsById(servSpecId);
								setLimitRuleMsg("纳入新无线通多产品销售品的无线通成员不能开通【" + servSpec.getName() + "】服务");
								return 'Y';
							}
						}
					}
				}
				//如果是国漫，一卡双号服务进来，且可以订购，那么就不在判断下面
				return 'N';
			}
			if(!isProdActive){//新老无线通变化的时候不进来判断
				boolean ifNewProd = soCommonSMO.ifNewProd(orderList, prodId);
				if (!ifNewProd) {
					this.setLimitRuleMsg("纳入无线通多产品销售品的无线通成员必须是新装或者预开户纳入！");
					return 'Y';
				}
				
				List<BoProdItem> boProdItemList = OrderListUtil.getBoProdItemListByProdId(busiOrderList, prodId, MDA.ITEM_SPEC_8700000);
				if (boProdItemList != null && boProdItemList.size() > 0) {
					for (BoProdItem boProdItem : boProdItemList) {
						if ("1".equals(boProdItem.getValue())) {
							this.setLimitRuleMsg("纳入无线通多产品销售品的无线通成员不能选择ocs预付费！");
							return 'Y';
						}
					}
				}
				
				for (BusiOrder busiOrder : busiOrderList) {
					if (!OrderListUtil.isValidateBoStatus(busiOrder)) {
						continue;
					}
					if (!busiOrder.getBusiObj().getInstId().equals(prodId)) {
						continue;
					}
					List<BoProd2Td> boProd2TdList = busiOrder.getData().getBoProd2Tds();
					for (BoProd2Td boProd2Td : boProd2TdList) {
						if (!OrderListUtil.isValidateAoStatus(boProd2Td.getStatusCd())) {
							continue;
						}
						if (!MDA.STATE_ADD.equals(boProd2Td.getState())) {
							continue;
						}
						Map<String,Object> params = new HashMap<String,Object>();
						params.put("terminalDevId", boProd2Td.getTerminalDevId());
						params.put("itemSpecId", MDA.ITEM_SPEC_76000019);
						List<Map<String,Object>> terminalDevItemList = specDataSMO.getTerminalDevItem(params);
						if (terminalDevItemList.size() == 0 || !"Y".equals(terminalDevItemList.get(0).get("value"))) {
							this.setLimitRuleMsg("纳入无线通的CDMA必须选择新村通卡！");
							return 'Y';
						}
					}
				}
			}
			
			if(orderList.getOrderListInfo().getOlTypeCd().intValue() != 6) {
				String retMsg = "纳入无线通多产品销售品的无线通成员不能开通";
				int flagCount = 0;
				for (BusiOrder busiOrder : busiOrderList) {
					if (!OrderListUtil.isValidateBoStatus(busiOrder)) {
						continue;
					}

					if (!busiOrder.getBusiObj().getInstId().equals(prodId)) {
						continue;
					}

					List<BoServOrder> boServOrders = busiOrder.getData().getBoServOrders();
					if (SoRuleUtil.isEmptyList(boServOrders)) {
						continue;
					}
					//判断是否有boServs
					List<BoServ> boServs = busiOrder.getData().getBoServs();
					if (!SoRuleUtil.isEmptyList(boServs)) {
						for (BoServ boServ : boServs){
							if (boServ == null || !OrderListUtil.isValidateAoStatus(boServ.getStatusCd())) {
								continue;
							}
							if (!MDA.STATE_ADD.equals(boServ.getState())) {
								continue;
							}
							Integer servSpecId2 = boServOrders.get(0).getServSpecId();
							
							// add qiaol 2015-05-06  订购了无线通POS销售品的成员可以开通3G、2G上网功能
							if (servSpecId2.equals(MDA.SERV_SPEC_EVDO)||servSpecId2.equals(MDA.SERV_SPEC_1X)){
								Long offerSpecId = null;
								char ifPos = 'N';
								flagBre: 
									for (BusiOrder bo : OrderListUtil.getBusiOrders(getOrderList())) {
										if (OrderListUtil.isValidateBoStatus(bo)
												&& SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(),MDA.ACTION_CLASS_OFFER)) {
											List<OoRole> listOoRoles = bo.getData().getOoRoles();
											for (OoRole oor : listOoRoles) {
												if (OrderListUtil.isValidateAddAo(oor.getStatusCd(), oor.getState())
														&& SoRuleUtil.equals(oor.getObjType(),MDA.OBJ_TYPE_PROD_SPEC)
														&& SoRuleUtil.equals(oor.getProdId(),getProdId())) {
													  offerSpecId = bo.getBusiObj().getObjId();
													if (specDataSMO.getOfferSpec2CategoryNodeCountById(offerSpecId,MDA.CATEGORY_NODE_ID_106001)>0) {
														ifPos = 'Y';
														break flagBre;
													}
												}
											}
										}
								}
								if (ifPos =='Y'){
									continue;
								}
							}
							
							Integer cnt = specDataSMO.getServSpec2CategoryNodeCountById(Long.valueOf(servSpecId2), MDA.CATAGORY_NODE_ID_1034000);
							if (cnt == 0) {
								retMsg += "【"+specDataSMO.getServSpecsById(servSpecId2).getName()+"】";
								flagCount++;
							}
						}
					}
				}
				if(flagCount > 0){
					this.setLimitRuleMsg(retMsg);
					return 'Y';
				}
			}

			String[] targetArr = {"ADD", "KIP"};
			boolean isNewWirelessCom = false;
			List<BoServItem> boServItems = getBusiOrder().getData().getBoServItems();
			for (BoServItem boServItem : SoRuleUtil.nvlArry(boServItems)) {
				if(OrderListUtil.isValidateAoStatus(boServItem.getStatusCd()) && SoRuleUtil.in(boServItem.getState(), targetArr)
						&& MDA.ITEM_SPEC_109040076.equals(boServItem.getItemSpecId())
						&& "1".equals(boServItem.getValue())){
					isNewWirelessCom = true;
				}
			}
			//新无线通规则限制
			if(isNewWirelessCom){
				//不能订购国内漫游
				//当前购物车是否有订购国内漫游
				if(orderList.getOrderListInfo().getOlTypeCd().intValue() != 6){
					for(BusiOrder bo : busiOrderList){
						if(!OrderListUtil.isValidateBoStatus(bo) || !SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
							continue;
						}
						List<BoServOrder> listBoServOrders = bo.getData().getBoServOrders();
						for(BoServOrder bso : SoRuleUtil.nvlArry(listBoServOrders)){
							if(SoRuleUtil.equals(bso.getServSpecId(), MDA.SSID_INTERNEL_ROAMING)){
								List<BoServ> lisBoServs = bo.getData().getBoServs();
								for(BoServ bs : SoRuleUtil.nvlArry(lisBoServs)){
									if(OrderListUtil.isValidateAddAo(bs.getStatusCd(), bs.getState())){
										this.setLimitRuleMsg("纳入新无线通多产品销售品的无线通成员不能开通【国内漫游】服务");
										return 'Y';
									}
								}
							}
						}
					}
				}
				//实例数据是否有国内漫游
				List<Long> delServs = SoRuleUtil.newArrayList();
				for (BusiOrder busiOrder : busiOrderList) {
					if(!OrderListUtil.isValidateBoStatus(busiOrder) || !SoRuleUtil.equals(busiOrder.getBusiObj().getInstId(), prodId)){
						continue;
					}
					List<BoServItem> listBoServItems = busiOrder.getData().getBoServItems();
					for (BoServItem boServItem : SoRuleUtil.nvlArry(listBoServItems)) {
						if(!MDA.STATE_DEL.equals(boServItem.getState())){
							continue;
						}
						delServs.add(boServItem.getServId());
					}
				}
				List<OfferServ> offerServList = instDataSMO.getOfferServListByProdId(getOlId(), prodId);
				for (OfferServ offerServ : SoRuleUtil.nvlArry(offerServList)) {
					if (MDA.SSID_INTERNEL_ROAMING.equals(offerServ.getServSpecId()) &&
							!SoRuleUtil.in(offerServ.getServId(), delServs)){
						this.setLimitRuleMsg("纳入新无线通多产品销售品的无线通成员不能开通【国内漫游】服务");
						return 'Y';
					}
				}
				
				//新无线通的手机上的无线座机（手机）服务修改参数为“新版无线通”时，需要校验手机有没有加入ivpn组合。
				List<OfferProdComp> offerProdComps = instDataSMO.getOfferProdCompByProdId(getOlId(), prodId);
				for (OfferProdComp offerProdComp : SoRuleUtil.nvlArry(offerProdComps)) {
					if(!InstDataUtil.ifValidateInstStatus(offerProdComp.getStatusCd())){
						continue;
					}
					if(MDA.PSID_880000009.equals(offerProdComp.getProdSpecId()) || MDA.PSID_880000010.equals(offerProdComp.getProdSpecId())){
						setLimitRuleMsg("新无线通手机不能加入ivpn组合！");
						return 'Y';
					}
				}
				
				Long compOfferId = null;
				List<BusiOrder> busiOrders = OrderListUtil.getBusiOrders(getOrderList());
				for (BusiOrder busiOrder : busiOrders) {
					if(!OrderListUtil.isValidateBoStatus(busiOrder) || busiOrder.getBoActionType().getActionClassCd() != MDA.ACTION_CLASS_OFFER){
						continue;
					}
					List<OoRole> ooRoles = busiOrder.getData().getOoRoles();
					for (OoRole ooRole : ooRoles) {
						if(OrderListUtil.isValidateAoStatus(ooRole.getStatusCd()) && 
								SoRuleUtil.in(ooRole.getState(), targetArr) && ooRole.getObjInstId().equals(getProdId())){
							BusiObj offerOrder = busiOrder.getBusiObj();
							List<OfferSpecParam> offerSpecParamsByOfferSpecId = specDataSMO.getOfferSpecParamsByOfferSpecId(offerOrder.getObjId());
							for (OfferSpecParam offerSpecParam : offerSpecParamsByOfferSpecId) {
								if(MDA.ITEM_SPEC_109041003.equals(offerSpecParam.getItemSpecId())){
									compOfferId = offerOrder.getInstId();
								}
							}
						}
					}
				}
				if(compOfferId == null){
					List<OfferMember> offerMemberList = instDataSMO.getOfferMemberList(getBaseInfo().getOlId(), getProdId(), MDA.OBJ_TYPE_PROD_SPEC);
					for (OfferMember offerMember : SoRuleUtil.nvlArry(offerMemberList)) {
						Offer offer = instDataSMO.getOffer(getBaseInfo().getOlId(), offerMember.getOfferId());
						if(offer!= null && InstDataUtil.ifValidateInstStatus(offer.getStatusCd())){
							List<OfferSpecParam> offerSpecParamsByOfferSpecId = specDataSMO.getOfferSpecParamsByOfferSpecId(offer.getOfferSpecId());
							for (OfferSpecParam offerSpecParam : offerSpecParamsByOfferSpecId) {
								if(MDA.ITEM_SPEC_109041003.equals(offerSpecParam.getItemSpecId())){
									compOfferId = offer.getOfferId();
								}
							}
						}
					}
				}
				if(compOfferId == null){
					setLimitRuleMsg("新无线通必须要求加入无线通多产品销售品");
					return 'Y';
				}
				//新无线通必须要有固话
				boolean isHaveTel = false;
				flagBre :
					for (BusiOrder bo : busiOrders){
						if(OrderListUtil.isValidateBoStatus(bo) &&
								SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_OFFER) &&
								SoRuleUtil.equals(bo.getBusiObj().getInstId(), compOfferId)){
							List<OoRole> ooRoles = bo.getData().getOoRoles();
							for (OoRole oor : ooRoles){
								if(OrderListUtil.isValidateAoStatus(oor.getStatusCd()) &&
										!SoRuleUtil.equals(oor.getState(), MDA.STATE_DEL) &&
										SoRuleUtil.in(oor.getObjId().intValue(), SoRuleUtil.newArrayList(MDA.PROD_SPEC_PSTN,MDA.PROD_SPEC_ETS450CDMA))){
									isHaveTel = true;
									break flagBre;
								}
							}
						}
					}
				if(!isHaveTel){
					Map<String, Object> param = new HashMap<String, Object>();
					param.put("offerId", compOfferId);
					param.put("offerRoleId", MDA.OFFER_ROLE_ID_109040100096);
					List<OfferMemberInstDto> listOfferMember = instDataSMO.getOfferMemberDtoList(param);
					if(SoRuleUtil.isEmptyList(listOfferMember)){
						setLimitRuleMsg("新无线通必须要求纳入固话成员");
						return 'Y';
					}
				}
			}
			return 'N';
		}
	    
	    /**本地规则：C2G服务与黑莓服务间的关系
		 * 规则编码：CRMSCL2992100
		 * bo_action_type_2_rule 7 
		 * @return
		 * @throws Exception
		 * 7012
		 */
		public char condc2gbbberryrelalimit() throws Exception{
			Long prodId = null;
			List<BoServ> boServs  = null;
			List<BoServOrder> boServOrders = null;
			OfferServObj offerServObj = null;
			boolean ifOrderCtoG =false ;
			boolean ifHaveCtoGInst =false ;
			int m =0 ;
			boServs  = getBusiOrder().getData().getBoServs();
			boServOrders = getBusiOrder().getData().getBoServOrders();
			List<BusiOrder> busiOrderList = OrderListUtil.getBusiOrders(getOrderList());
			//当前业务动作对否订购"gprs"
			mark1 : for (BoServOrder boServOrder : SoRuleUtil.nvlArry(boServOrders)) {
				if(SoRuleUtil.equals(boServOrder.getServSpecId(), MDA.SSID_GPRS)){
					for (BoServ boServ : SoRuleUtil.nvlArry(boServs)) {
						if (OrderListUtil.isValidateAddAo(boServ.getStatusCd(), boServ.getState())) {
							prodId = getBusiOrder().getBusiObj().getInstId();
							break mark1;
						}
					}
				}
			}
			
			if(prodId != null) {
				//判断当前购物车是否订购“CtoG国际漫游” 
	    		mark2:for(BusiOrder bo : busiOrderList){
	    			if(OrderListUtil.isValidateBoStatus(bo) && SoRuleUtil.equals(bo.getBusiObj().getInstId(),prodId)){
	    				boServs  = bo.getData().getBoServs();
	        			boServOrders = bo.getData().getBoServOrders();
	        			for (BoServOrder boServOrder : SoRuleUtil.nvlArry(boServOrders)) {
	        				if(SoRuleUtil.equals(boServOrder.getServSpecId(), MDA.SSID_CTOG)){
	        					for (BoServ boServ : SoRuleUtil.nvlArry(boServs)) {
	        						if (OrderListUtil.isValidateAddAo(boServ.getStatusCd(), boServ.getState())) {
	        							ifOrderCtoG =true ;
	        							break  mark2;
	        						}
	        					}
	        				}
	        			}
	    			}
	    		}
				//实例中是否订购CTOG
				offerServObj = instDataSMO.getOfferServObj(getBaseInfo().getOlId(), MDA.SSID_CTOG, prodId);
				if(!SoRuleUtil.isExistEmptyObj(offerServObj)){
					ifHaveCtoGInst  = true ;
					//判断当前购物车有无退订
					mark3:for(BusiOrder bo : busiOrderList){
		    			if(OrderListUtil.isValidateBoStatus(bo) && SoRuleUtil.equals(bo.getBusiObj().getInstId(),prodId)){
		    				boServs  = bo.getData().getBoServs();
		        			boServOrders = bo.getData().getBoServOrders();
		        			for (BoServOrder boServOrder : boServOrders) {
        						if(SoRuleUtil.equals(boServOrder.getServSpecId(), MDA.SSID_CTOG) 
        								&& SoRuleUtil.equals(boServOrder.getServId(), offerServObj.getServId())){
        							for (BoServ boServ : boServs) {
        		        				if (OrderListUtil.isValidateAoStatus(boServ.getStatusCd()) 
        		        						&& SoRuleUtil.equals(boServ.getState(), MDA.STATE_DEL)) {
        		        					ifHaveCtoGInst  = false ;
        		        					break mark3;
        		        				}
        							}
        						}
        					}
		    			}
		    		}
				}
				
				if(!ifHaveCtoGInst && !ifOrderCtoG){
					this.setLimitRuleMsg("当前实例没有开通[CtoG国际漫游]服务,不能选择[gprs国际漫游]服务,请检查!");
					return 'Y';
				}
			}
			//当前购物车是否取消c2g服务
			mark4 : for (BoServOrder boServOrder : SoRuleUtil.nvlArry(boServOrders)) {
				if(SoRuleUtil.equals(boServOrder.getServSpecId(), MDA.SSID_CTOG)){
					for (BoServ boServ : SoRuleUtil.nvlArry(boServs)) {
        				if (OrderListUtil.isValidateAoStatus(boServ.getStatusCd()) 
        						&& SoRuleUtil.equals(boServ.getState(), MDA.STATE_DEL)) {
        					prodId = getBusiOrder().getBusiObj().getInstId();
							break mark4;
        				}
					}
				}
			}
			
			if (prodId == null) return 'N' ;
			//如果当前购物车退订c2g服务 则需要判断其实例上还有无[gprs国际漫游]服务
			//实例中是否订购gprs
			offerServObj = instDataSMO.getOfferServObj(getBaseInfo().getOlId(), MDA.SSID_GPRS, prodId);
			if(!SoRuleUtil.isExistEmptyObj(offerServObj)){
				//实例中gprs是否退订
				for(BusiOrder bo : busiOrderList){
	    			if(OrderListUtil.isValidateBoStatus(bo) && SoRuleUtil.equals(bo.getBusiObj().getInstId(),prodId)){
	    				boServs  = bo.getData().getBoServs();
						for (BoServ boServ : boServs) {
	        				if (OrderListUtil.isValidateAoStatus(boServ.getStatusCd()) 
	        						&& SoRuleUtil.equals(boServ.getState(), MDA.STATE_DEL)
	        						&& SoRuleUtil.equals(boServ.getServId(), offerServObj.getServId())) {
	        					m ++ ;
	        				}
						}
	    			}
	    		}
				
				if(m <1){
					this.setLimitRuleMsg("当前实例取消了[CtoG国际漫游]服务,其上的["+specDataSMO.getServSpecsById(offerServObj.getServSpecId()).getName()+"]服务需同时取消,请检查!");
					return 'Y';
				}
				
			}
			return 'N' ;
		}
		/**
		 * 规则编码:CRMSCL2997019
		 * 规则名称：融合新话补相关规则
		 * 时间：2010-05-26
		 * 入口:offer_spec_action_2_rule  融合新话补109050000010   S1
		 * 地区:四川
		 * 选择了融合新话补销售品,必须纳入E9,并且E9必须选择[融合话补的组合套餐资费目录]的销售品category_node_id  =-1031846且必须新绑定串号
		 * @return
		 * @throws Exception
		 * @Author TQ
		 */
		public char conderhxhbrelalimit() throws Exception{
			BusiOrder busiOrder = getBusiOrder();
			OrderList orderList = getOrderList();
			Long prodId = null;
			Long olId = getOlId();
			Long e9OfferId=null;
			List<Bo2Coupon> bo2CouponList  = null;
			List<BusiOrder> busiOrderList = OrderListUtil.getBusiOrders(orderList);
			boolean isExistE9busi=false;
			String bcdCode="";
			int i=0 , m =0;
			
			List<OoRole> ooRoleList =  busiOrder.getData().getOoRoles();
			for(OoRole ooRole:ooRoleList){
				if (!OrderListUtil.isValidateAddAo(ooRole.getStatusCd(),ooRole.getState())) {
					continue;
				}
				prodId = ooRole.getProdId()==null ? ooRole.getObjInstId():ooRole.getProdId();
			}
			if(prodId==null){
				return 'N';
			}
			String accessNum = soCommonSMO.getProdAccessNumberByOlIdProdId(olId,prodId, busiOrderList);
			//实例表中查询，判断此用户是否加入e9且为某目录下
			List<Map<String, Object>> e9OfferIdList = instDataSMO.getE9OfferIdByProdId(prodId);
			List<Map<String, Object>>  deste9OfferIdList = SoRuleUtil.newArrayList();			
			if (!SoRuleUtil.isEmptyList(e9OfferIdList)) {
				for (Map<String, Object> map : e9OfferIdList) {
					 e9OfferId = SoRuleUtil.getLong(map.get("offerId"));
					if(e9OfferId==null){
						continue;
					}
					//当前购物车是否退订
					for(BusiOrder busiOrder1:busiOrderList){
						if (!OrderListUtil.isValidateBoStatus(busiOrder1)) {
							continue;
						}
						if(MDA.BO_ACTION_TYPE_CD_OFFER_BREAK.equals(busiOrder1.getBoActionType().getBoActionTypeCd())&&busiOrder1.getBusiObj().getInstId().equals(e9OfferId)){
							deste9OfferIdList.add(map);
							continue;
						} 
					}	
				}
				e9OfferIdList.removeAll(deste9OfferIdList);	
			}
			//购物车中查询是否订购e9
			for(BusiOrder busiOrder1:busiOrderList){
				if (!OrderListUtil.isValidateBoStatus(busiOrder1)) {
					continue;
				}
			    //当前购物车中是否有订购了此e9，还需判断S3动作。
				if(MDA.BO_ACTION_TYPE_CD_OFFER_ORDER.equals(busiOrder1.getBoActionType().getBoActionTypeCd()) ||
						MDA.BO_ACTION_TYPE_CD_OFFER_ROLE.equals(busiOrder1.getBoActionType().getBoActionTypeCd())){
					List<OoRole> ooRoleList1 =  busiOrder1.getData().getOoRoles();
					for(OoRole ooRole1:ooRoleList1){
						if (!OrderListUtil.isValidateAddAo(ooRole1.getStatusCd(),ooRole1.getState())) {
							continue;
						}
						if(ooRole1.getObjInstId().equals(prodId)){
							//当前销售品规格是否在e9目录下
							if(specDataSMO.isExistsByOsIdCId(busiOrder1.getBusiObj().getObjId(),MDA.OFFER_SPEC_CATEGORY_ID_E9)){
								isExistE9busi=true;
								break;
							}
						}
					}
				}
			}	
			
			if(e9OfferIdList.size()==0&&!isExistE9busi){
				this.setLimitRuleMsg("CRMSCL2997019规则限制：号码["+accessNum+"]未加入E9,不能订购融合新话补！");
				return 'Y';
			}
			//实例上是否已经绑定了终端且在当前购物整没有退订
			List<OfferCoupon> offerCoupons = instDataSMO.getOfferCouponListByProdId(prodId);
			if (!SoRuleUtil.isEmptyList(offerCoupons)) {
				for(OfferCoupon coupon : offerCoupons){
					bcdCode=coupon.getCouponInsNumber();
					if(!SoRuleUtil.isEmptyStr(bcdCode)){
						m ++ ;
						for(BusiOrder bo:busiOrderList){
							if (!OrderListUtil.isValidateBoStatus(bo)) {
								continue;
							}
							bo2CouponList = bo.getData().getBo2Coupons();
							for(Bo2Coupon bo2Coupon : SoRuleUtil.nvlArry(bo2CouponList)){
								if (SoRuleUtil.equals(bo2Coupon.getState(), MDA.STATE_DEL)
									 && OrderListUtil.isValidateAoStatus(bo2Coupon.getStatusCd())
									 && SoRuleUtil.equals(coupon.getCouponInsNumber(),bo2Coupon.getCouponInstanceNumber()) 
									 && SoRuleUtil.equals(bo2Coupon.getProdId(), prodId)) {
									m -- ;
								}
							}
						}
					}
				}
			}
			if (m >0){
				this.setLimitRuleMsg("CRMSCL2997019规则限制：号码["+accessNum+"]已经绑定了终端,其串号为["+bcdCode+"],请先解绑,重新绑定新串号,才能订购融合新话补！");
				return 'Y';
			}
			//订购融合话补业务动作上是否绑定终端
			bo2CouponList = getBusiOrder().getData().getBo2Coupons();
			for(Bo2Coupon bo2Coupon :SoRuleUtil.nvlArry(bo2CouponList)){
				if (!OrderListUtil.isValidateAddAo(bo2Coupon.getStatusCd(),bo2Coupon.getState())) {
					continue;
				}
				i ++ ;
			}
			
			if(i==0){ //订购融合话补，必须将终端绑定在融合话补销售品上
				this.setLimitRuleMsg("CRMSCL2997019规则限制：号码["+accessNum+"],须绑定新串号,才能订购融合新话补！");
				return 'Y';
			}
			
			//2当前购物车是否绑定新串号
			i = 0 ; //置为0
			for(BusiOrder busiOrder2:busiOrderList){
				if (!OrderListUtil.isValidateBoStatus(busiOrder2)) {
					continue;
				}
				bo2CouponList = busiOrder2.getData().getBo2Coupons();
				for(Bo2Coupon bo2Coupon : SoRuleUtil.nvlArry(bo2CouponList)){
					if (!OrderListUtil.isValidateAddAo(bo2Coupon.getStatusCd(),bo2Coupon.getState())) {
						continue;
					}
					if(bo2Coupon.getProdId().equals(prodId)){
						i++;
					}
				}
			}
			if(i>2){
				this.setLimitRuleMsg("CRMSCL2997019规则限制：号码["+accessNum+"],只能绑定一次串号！");
				return 'Y';
			}
			return 'N';
		}
		
		public char internationalRoamingUimLimit() throws Exception{
			char retVal = 'N';
			String boActionTypeCd = getBusiOrder().getBoActionType().getBoActionTypeCd();
			Long prodId = null;
			List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
			String UimStr = null;
			if(SoRuleUtil.equals(MDA.BO_ACTION_TYPE_CD_OFFER_ORDER, boActionTypeCd)){
				List<OoRole> listOoRoles = getBusiOrder().getData().getOoRoles();
				for(OoRole oor : listOoRoles){
					if(SoRuleUtil.in(oor.getStatusCd(), SoRuleUtil.newArrayList(MDA.BO_ACTION_STATUS_P,MDA.BO_ACTION_STATUS_S)) &&
							!SoRuleUtil.equals(oor.getState(), MDA.STATE_DEL)){
						prodId = oor.getProdId();
						break;
					}
				}
				if(prodId == null){
					return retVal;
				}
				//从缓存或实例去uim卡号
				flagBre :
					for(BusiOrder bo : listBusiOrders){
						if(OrderListUtil.isValidateBoStatus(bo) &&
								SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
								SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
							List<BoProd2Td> listBoProd2Tds = bo.getData().getBoProd2Tds();
							for(BoProd2Td bp2t : listBoProd2Tds){
								if(OrderListUtil.isValidateAddAo(bp2t.getStatusCd(), bp2t.getState())){
									UimStr = bp2t.getTerminalCode();
									break flagBre;
								}
							}
						}
					}
				if(UimStr == null){
					List<OfferProd2Td> listOfferProd2Tds = instDataSMO.getOfferProd2TdListByProdId(getOlId(),prodId);
					if(listOfferProd2Tds != null && listOfferProd2Tds.size() > 0){
						UimStr = listOfferProd2Tds.get(0).getTerminalCode();
					}
				}
				if(UimStr == null){
					return retVal;
				}
			}else if(SoRuleUtil.equals(MDA.BO_ACTION_TYPE_CD_ADD_CARD, boActionTypeCd)){
				prodId = getProdId();
				//判断是否订购CtoG国际漫游
				Integer flag = instDataSMO.getOfferAndOfferServCountById(MDA.OFFER_SEPC_ID_109910000619, prodId, null);
				if(flag == null || flag == 0){
					return retVal;
				}
				flagBre :
					for(BusiOrder bo : listBusiOrders){
						if(OrderListUtil.isValidateBoStatus(bo) &&
								SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
								SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
							List<BoProd2Td> listBoProd2Tds = bo.getData().getBoProd2Tds();
							for(BoProd2Td bp2t : listBoProd2Tds){
								if(OrderListUtil.isValidateAddAo(bp2t.getStatusCd(), bp2t.getState())){
									UimStr = bp2t.getTerminalCode();
									break flagBre;
								}
							}
						}
					}
				if(UimStr == null){
					return retVal;
				}
			}
			if(UimStr != null){
				if(instDataSMO.getUimCountByConde(UimStr).intValue() > 0){
					if(MDA.DB_FLAG_B.equals(AreaMapToDbRegion.getABRegionByAreaId(getOrderList().getOrderListInfo().getAreaId()))){
						this.setLimitRuleMsg("UIM卡号【"+UimStr+"】不能订购【CtoG国际漫游】,请更换为集团4G卡进行补卡!");
						return 'Y';
					}else{
						this.setLimitRuleMsg("UIM卡号【"+UimStr+"】不能订购【CtoG国际漫游】,请更换为集团4G卡进行补卡!");
						return 'Y';
					}
					
				}
			}
			
			return retVal;
		}

		public char PersonHandPhoneJoinGrpLimit() throws Exception{
			char retVal = 'N';
			String state = null;
			Long prodId = null;
			Long offerSpecId = null;
			List<OoRole> listOoRoles = getBusiOrder().getData().getOoRoles();
			List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
			if(SoRuleUtil.equals(getOfferSpecId(), MDA.OFFER_SPEC_100010003989)){
				for(OoRole oor : listOoRoles){
					if(SoRuleUtil.in(oor.getStatusCd(), SoRuleUtil.newArrayList(MDA.BO_ACTION_STATUS_P,MDA.BO_ACTION_STATUS_S)) &&
							SoRuleUtil.equals(oor.getObjType(), MDA.OBJ_TYPE_PROD_SPEC) &&
							SoRuleUtil.equals(oor.getObjId(), MDA.PSID_CDMA.longValue()) &&
							SoRuleUtil.equals(oor.getState(), MDA.STATE_ADD)){
						OfferProd op = instDataSMO.getOfferProd(getOlId(), oor.getObjInstId());
						if(op != null && !SoRuleUtil.equals(op.getStatusCd(), MDA.INST_STATUS_CD_YSHIX)){
							setLimitRuleMsg("手机加入小灵通组合销售品必须新装！");
							retVal = 'Y';
							return retVal;
						}
					}
				}
			}
			//获取成员的规格是否为小灵通
			//是小灵通则v_state有值，且能往下走，否则进入exception，返回
			for(OoRole oor : listOoRoles){
				if(SoRuleUtil.in(oor.getStatusCd(), SoRuleUtil.newArrayList(MDA.BO_ACTION_STATUS_P,MDA.BO_ACTION_STATUS_S)) &&
						SoRuleUtil.equals(oor.getObjType(), MDA.OBJ_TYPE_PROD_SPEC) &&
						SoRuleUtil.equals(oor.getObjId(), MDA.PSID_PHS.longValue())){
					state = oor.getState();
					prodId = oor.getObjInstId();
					break;
				}
			}
			if(state == null || prodId == null){
				return retVal;
			}
			//判断是否为多产品销售品，是则继续，不是则返回
			OfferSpecInfo offerSpecInfo = specDataSMO.selectOfferSpecInfo(getBusiOrder().getBusiObj().getObjId());
			if(offerSpecInfo != null && "Y".equals(offerSpecInfo.getCompOffer())){
				offerSpecId = offerSpecInfo.getOfferSpecId();
			}
			if(offerSpecId == null){
				return retVal;
			}
			if(SoRuleUtil.equals(state, MDA.STATE_ADD)){
				if(!SoRuleUtil.equals(offerSpecId, MDA.OFFER_SPEC_100010003989)){
					setLimitRuleMsg("小灵通不能加入其他多产品销售品，【小灵通升级组合销售品】除外!");
					retVal = 'Y';
					return retVal;
				}
			}else if(SoRuleUtil.equals(state, MDA.STATE_DEL) && SoRuleUtil.equals(offerSpecId, MDA.OFFER_SPEC_100010003989)){
				for(BusiOrder bo : listBusiOrders){
					if(OrderListUtil.isValidateBoStatus(bo) && 
							SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
							SoRuleUtil.equals(bo.getBusiObj().getState(), MDA.STATE_DEL) &&
							SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId) &&
							SoRuleUtil.in(bo.getBoActionType().getBoActionTypeCd(), 
									SoRuleUtil.newArrayList(MDA.BO_ACTION_TYPE_CD_PROD_BREAK,MDA.BO_ACTION_TYPE_CD_QFCJ))){
						return retVal;
					}
				}
				setLimitRuleMsg("小灵通不能退出该销售品，除非该小灵通拆机!");
				retVal = 'Y';
				return retVal;
			}
			return retVal;
			
			
		}
		
		
		 public char condCateNodePricePlan() throws Exception {
				char retVal = 'N';
				List<OrderListAttr> attrs = getOrderList().getOrderListAttrs();
				for(OrderListAttr attr : SoRuleUtil.nvlArry(attrs)){
					if(MDA.ISID_HYPERMARKET_ACCEPTED.equals(attr.getItemSpecId()) && MDA.Y_STR.equals(attr.getValue())){
						return retVal; //大卖场受理
					}
				}
				List<OoRole> roles = getBusiOrder().getData().getOoRoles();
				Long prodId = null;
				Long offerId = null;
				String offerSpecName = null;
				int actionClassCode = getBusiOrder().getBoActionType().getActionClassCd();
				for(OoRole role : SoRuleUtil.nvlArry(roles)){
					if(OrderListUtil.isValidateAddAo(role.getStatusCd(), role.getState()) && actionClassCode == MDA.ACTION_CLASS_OFFER ){
						BusiObj offerOrder = getBusiOrder().getBusiObj();
						prodId = MDA.OBJ_TYPE_PROD_SPEC.equals(role.getObjType()) ? role.getObjInstId() : role.getProdId();
						offerId = offerOrder.getInstId();
						offerSpecName = soCommonSMO.getOfferSpecNameById(offerOrder.getObjId());
						break;
					}
				}
				if(prodId == null || offerId == null || offerSpecName == null){
					return retVal;
				}
				//查看当前购物车是否已经捆绑串号
				for(BusiOrder busiOrder : OrderListUtil.getBusiOrders(getOrderList())){
					List<Bo2Coupon> coupons = busiOrder.getData().getBo2Coupons();
					for(Bo2Coupon coupon : SoRuleUtil.nvlArry(coupons)){
						if(prodId.equals(coupon.getProdId())){
							return retVal;
						}
					}
				}
				retVal = 'Y';
				setLimitRuleMsg("所选["+ offerSpecName +"]要求必须绑定手机串号或一体机MAC地址!");
				return retVal;
			}
	public char offerSpecTerminalDeviceLimit() throws Exception{
		char retVal = 'N';
		Long prodId = null;
		Integer flag  = 0;
		List<OoRole> listOoRoles = getBusiOrder().getData().getOoRoles();
		for(OoRole oor : listOoRoles){
			if(OrderListUtil.isValidateAddAo(oor.getStatusCd(), oor.getState())){
				prodId = oor.getObjInstId();
				break;
			}
		}
		if(prodId == null){
			return retVal;
		}
		List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
		for(BusiOrder bo : listBusiOrders){
			if(OrderListUtil.isValidateBoStatus(bo) &&
					SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
					SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
				List<BoProd2Td> listBoProd2Tds = bo.getData().getBoProd2Tds();
				for(BoProd2Td bp2t : listBoProd2Tds){
					if(OrderListUtil.isValidateAddAo(bp2t.getStatusCd(), bp2t.getState())){
						flag++;
					}
				}
				break;
			}
		}
		List<OfferProd2Td> listOfferProd2Tds = instDataSMO.getOfferProd2TdListByStatusCd(getOlId(), prodId);
		List<String> listTerminalCodes = SoRuleUtil.newArrayList(); 
		if(listOfferProd2Tds != null && listOfferProd2Tds.size() != 0){
			for(BusiOrder bo : listBusiOrders){
				if(OrderListUtil.isValidateBoStatus(bo) &&
						SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
						SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
					List<BoProd2Td> listBoProd2Tds = bo.getData().getBoProd2Tds();
					for(BoProd2Td bp2t : listBoProd2Tds){
						if(SoRuleUtil.in(bp2t.getStatusCd(), SoRuleUtil.newArrayList(MDA.BO_ACTION_STATUS_P,MDA.BO_ACTION_STATUS_S)) &&
								SoRuleUtil.equals(bp2t.getState(), MDA.STATE_DEL)){
							listTerminalCodes.add(bp2t.getTerminalCode());
						}
					}
					break;
				}
			}
			if(listTerminalCodes.size() != 0){
				List<OfferProd2Td> listTemp = SoRuleUtil.newArrayList();
				for(OfferProd2Td op2t : listOfferProd2Tds){
					if(SoRuleUtil.equals(op2t.getTerminalCode(), listTerminalCodes.get(0).toString())){
						listTemp.add(op2t);
						break;
					}
				}
				listOfferProd2Tds.remove(listTemp);
			}
			flag += listOfferProd2Tds.size();
		}
		if(flag != 1){
			retVal = 'Y';
			setLimitRuleMsg("订购翼支付添益宝0元赠机保底目录销售品，有且只能绑定一个终端，请检查！");
		}
		return retVal;
	}
	public char condAddrRuleGrpLimit() throws Exception{
		char retVal = 'N';
		String boActionTypeCd = getBoActionTypeCd();
		int flag = 0;
		Long newAddrId = null;//新的地址id,表rm.addr_loc geography_loc_id ,用来判断地址是否一致
		Long newAddrNameId = null;//真正的addrId，用来显示提示信息
		Long oldAddrId = null;//新的地址id
		Long oldAddrNameId = null;
		List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
		//移机
		if(SoRuleUtil.equals(boActionTypeCd, MDA.BO_ACTION_TYPE_CD_PROD_MOVE)){
			//获取产品是否地址组件
			if(specDataSMO.getProdSpecCompById(getBusiOrder().getBusiObj().getObjId()).intValue() == 0){
				return retVal;
			}
			//获取移机产品所在销售品是否配置同址
			List<OfferMemberInstDto> listOfferMemberInstDtos = instDataSMO.getOfferMemberDtoList(getOlId(), getProdId(), MDA.OBJ_TYPE_PROD_SPEC);
			flagBre :
				for(OfferMemberInstDto om : SoRuleUtil.nvlArry(listOfferMemberInstDtos)){
					List<OfferRoleRuleGrp> listOfferRoleRuleGrps = specDataSMO.selectOfferRoleRuleGrpsByOfferSpecId(om.getOfferSpecId());
					for(OfferRoleRuleGrp orr : SoRuleUtil.nvlArry(listOfferRoleRuleGrps)){
						if(SoRuleUtil.equals(orr.getRuleGrpTypeCd(), MDA.RULE_GRP_TYPE_SAME_ADDRESS)){
							flag++;
							break flagBre;
						}
					}
				}
			if(flag == 0){
				return retVal;
			}
			List<BoProdAddress> listBoProdAddresses = getBusiOrder().getData().getBoProdAddresses();
			for(BoProdAddress bpa : listBoProdAddresses){
				if(OrderListUtil.isValidateAddAo(bpa.getStatusCd(), bpa.getState())){
					newAddrId = instDataSMO.getGeogrophyLocIdByAddrId(bpa.getAddrId());
					newAddrNameId = bpa.getAddrId();
					break;
				}
			}
			if(newAddrId == null){
				return retVal;
			}
			//新地址是否和销售品下配置角色相同
		    //销售品下的其他成员，先判断过程数据里是否一致
			List<OfferMemberInstDto> listAllOfferMemberInstDtos = instDataSMO.getAllOtherMemberInOfferByProdId(getProdId());
			List<OfferMemberInstDto> listAllInstOfferMemberInstDtos = SoRuleUtil.newArrayList();//实例数据销售品成员，不在二次查询。
			for(OfferMemberInstDto om : SoRuleUtil.nvlArry(listAllOfferMemberInstDtos)){
				List<OfferRoleRuleGrp> listOfferRoleRuleGrps = specDataSMO.selectOfferRoleRuleGrpsByOfferSpecId(om.getOfferSpecId());
				flagBre1 :
					for(OfferRoleRuleGrp orr : SoRuleUtil.nvlArry(listOfferRoleRuleGrps)){
						if(SoRuleUtil.equals(orr.getRuleGrpTypeCd(), MDA.RULE_GRP_TYPE_SAME_ADDRESS)){
							listAllInstOfferMemberInstDtos.add(om);//加入符合条件，方便查询实例数据。
							for(BusiOrder bo : listBusiOrders){
								if(OrderListUtil.isValidateBoStatus(bo) &&
										SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
										SoRuleUtil.equals(bo.getBusiObj().getInstId(), om.getMemberId())){
									List<BoProdAddress> listBoProdAddressesTemp = bo.getData().getBoProdAddresses();
									for(BoProdAddress bpa : listBoProdAddressesTemp){
										if(OrderListUtil.isValidateAddAo(bpa.getStatusCd(), bpa.getState())){
											oldAddrId = instDataSMO.getGeogrophyLocIdByAddrId(bpa.getAddrId());
											oldAddrNameId = bpa.getAddrId();
											break flagBre1;
										}
									}
								}
							}
						}
					}
				if(oldAddrId != null && !SoRuleUtil.equals(newAddrId, oldAddrId)){
					OfferSpec os = specDataSMO.getOfferSpecById(om.getOfferSpecId());
					if(os != null){
						retVal = 'Y';
						setLimitRuleMsg("销售品【"+os.getName()+"】要求其下成员地址必须相同,请检查！有多个地址【"+instDataSMO.getGeogrophyLocNameByAddrId(oldAddrNameId)+"】" +
								"【"+oldAddrNameId+"】【"+instDataSMO.getGeogrophyLocNameByAddrId(newAddrNameId)+"】【"+newAddrNameId+"】");
						return retVal;
					}
				}
			}
			
			//实例表查询
			flagCon2:
				for(OfferMemberInstDto om : SoRuleUtil.nvlArry(listAllInstOfferMemberInstDtos)){
					for(BusiOrder bo : listBusiOrders){
						if(OrderListUtil.isValidateBoStatus(bo) &&
								SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
											SoRuleUtil.equals(bo.getBusiObj().getInstId(), om.getMemberId()) &&
											SoRuleUtil.equals(bo.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_PROD_MOVE)){
							continue flagCon2;
						}
					}
					List<OfferProd2Addr> listOfferProd2Addrs = instDataSMO.getOfferProd2AddrList(getOlId(), om.getMemberId());
					for(OfferProd2Addr op2a : SoRuleUtil.nvlArry(listOfferProd2Addrs)){
						oldAddrId = instDataSMO.getGeogrophyLocIdByAddrId(op2a.getAddressId());
						oldAddrNameId = op2a.getAddressId();
						break;
					}
					if(oldAddrId != null && !SoRuleUtil.equals(newAddrId, oldAddrId)){
						OfferSpec os = specDataSMO.getOfferSpecById(om.getOfferSpecId());
						if(os != null){
							retVal = 'Y';
							setLimitRuleMsg("销售品【"+os.getName()+"】要求其下成员地址必须相同,请检查！有多个地址【"+instDataSMO.getGeogrophyLocNameByAddrId(oldAddrNameId)+"】" +
									"【"+oldAddrNameId+"】【"+instDataSMO.getGeogrophyLocNameByAddrId(newAddrNameId)+"】【"+newAddrNameId+"】");
							return retVal;
						}
					}
				}
		}else if(SoRuleUtil.equals(boActionTypeCd, MDA.BO_ACTION_TYPE_CD_OFFER_ORDER) ||
				SoRuleUtil.equals(boActionTypeCd, MDA.BO_ACTION_TYPE_CD_OFFER_ROLE)){
			//销售品是否配置同址
			List<OfferRoleRuleGrp> listOfferRoleRuleGrps = specDataSMO.selectOfferRoleRuleGrpsByOfferSpecId(getOfferSpecId());
			for(OfferRoleRuleGrp orr : SoRuleUtil.nvlArry(listOfferRoleRuleGrps)){
				if(SoRuleUtil.equals(orr.getRuleGrpTypeCd(), MDA.RULE_GRP_TYPE_SAME_ADDRESS)){
					flag++;
					break;
				}
			}
			if(flag == 0){
				return retVal;
			}
			//订购的新装成员地址是否一致
			/*for(BusiOrder bo : listBusiOrders){
				if(OrderListUtil.isValidateBoStatus(bo) &&
						SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_OFFER) &&
						SoRuleUtil.equals(bo.getBusiObj().getObjId(), getOfferSpecId())){}
			}*/

			List<OoRole> listOoRoles = getBusiOrder().getData().getOoRoles();
			for(OoRole oor : listOoRoles){
				if(OrderListUtil.isValidateAddAo(oor.getStatusCd(), oor.getState()) &&
						SoRuleUtil.equals(oor.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)){
					flagBre2 : 
						for(BusiOrder bot : listBusiOrders){
							if(OrderListUtil.isValidateBoStatus(bot) &&
									SoRuleUtil.equals(bot.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
									SoRuleUtil.equals(bot.getBusiObj().getInstId(), oor.getObjInstId())){
								List<BoProdAddress> listBoProdAddresses = bot.getData().getBoProdAddresses();
								for(BoProdAddress bpa : listBoProdAddresses){
									if(OrderListUtil.isValidateAddAo(bpa.getStatusCd(), bpa.getState())){
										newAddrId = instDataSMO.getGeogrophyLocIdByAddrId(bpa.getAddrId());
										newAddrNameId = bpa.getAddrId();
										break flagBre2;
									}
								}
							}
						}
					//第一次才把old赋值为new
					if(oldAddrId == null && newAddrId != null){
						oldAddrId = newAddrId;
						oldAddrNameId = newAddrNameId;
					}
					if(oldAddrId != null && !SoRuleUtil.equals(newAddrId, oldAddrId)){
						OfferSpec os = specDataSMO.getOfferSpecById(getOfferSpecId());
						if(os != null){
							retVal = 'Y';
							setLimitRuleMsg("销售品【"+os.getName()+"】要求其下成员地址必须相同,请检查！有多个地址【"+instDataSMO.getGeogrophyLocNameByAddrId(oldAddrNameId)+"】" +
									"【"+oldAddrNameId+"】【"+instDataSMO.getGeogrophyLocNameByAddrId(newAddrNameId)+"】【"+newAddrNameId+"】");
							return retVal;
						}
					}
				}
			}
		
			if(SoRuleUtil.equals(boActionTypeCd, MDA.BO_ACTION_TYPE_CD_OFFER_ROLE)){
				 //判断加入成员和其他实例成员地址是否一致
		         //只需要取一个该销售品的其他成员来比较。
				//List<OoRole> listOoRoles = getBusiOrder().getData().getOoRoles();
				for(OoRole oor : listOoRoles){
					if(OrderListUtil.isValidateAddAo(oor.getStatusCd(), oor.getState()) &&
							SoRuleUtil.equals(oor.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)){
						List<OfferProd2Addr> listOfferProd2Addrs = instDataSMO.getOfferProd2AddrList(getOlId(), oor.getObjInstId());
						for(OfferProd2Addr op2a : SoRuleUtil.nvlArry(listOfferProd2Addrs)){
							newAddrId = instDataSMO.getGeogrophyLocIdByAddrId(op2a.getAddressId());
							newAddrNameId = op2a.getAddressId();
							break;
						}
					}
					if(oldAddrId == null && newAddrId != null){
						oldAddrId = newAddrId;
						oldAddrNameId = newAddrNameId;
					}
					if(oldAddrId != null && !SoRuleUtil.equals(newAddrId, oldAddrId)){
						OfferSpec os = specDataSMO.getOfferSpecById(getOfferSpecId());
						if(os != null){
							retVal = 'Y';
							setLimitRuleMsg("销售品【"+os.getName()+"】要求其下成员地址必须相同,请检查！有多个地址【"+instDataSMO.getGeogrophyLocNameByAddrId(oldAddrNameId)+"】" +
									"【"+oldAddrNameId+"】【"+instDataSMO.getGeogrophyLocNameByAddrId(newAddrNameId)+"】【"+newAddrNameId+"】");
							return retVal;
						}
					}
				}
				List<OfferMember> listOfferMembers = instDataSMO.getOfferMemberListByOfferId(getOlId(), getOfferId());
				flagCon :
					for(OfferMember om : listOfferMembers){
						if(SoRuleUtil.equals(om.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)){
							for(BusiOrder bot : listBusiOrders){
								if(OrderListUtil.isValidateBoStatus(bot) &&
										SoRuleUtil.equals(bot.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_OFFER)){
									List<OoRole> listOoRoleTemps = bot.getData().getOoRoles();
									for(OoRole oor : listOoRoleTemps){
										if(SoRuleUtil.in(oor.getStatusCd(), SoRuleUtil.newArrayList(MDA.BO_ACTION_STATUS_P,MDA.BO_ACTION_STATUS_S)) &&
												SoRuleUtil.equals(oor.getState(), MDA.STATE_DEL) &&
												SoRuleUtil.equals(oor.getObjType(), MDA.OBJ_TYPE_PROD_SPEC) &&
												SoRuleUtil.equals(oor.getObjInstId(), om.getMemberId())){
											continue flagCon;
										}
									}
								}
							}
							List<OfferProd2Addr> listOfferProd2Addrs = instDataSMO.getOfferProd2AddrList(getOlId(), om.getMemberId());
							for(OfferProd2Addr op2a : SoRuleUtil.nvlArry(listOfferProd2Addrs)){
								newAddrId = instDataSMO.getGeogrophyLocIdByAddrId(op2a.getAddressId());
								newAddrNameId = op2a.getAddressId();
								break;
							}
						}
					}
				if(oldAddrId != null && !SoRuleUtil.equals(newAddrId, oldAddrId)){
					OfferSpec os = specDataSMO.getOfferSpecById(getOfferSpecId());
					if(os != null){
						retVal = 'Y';
						setLimitRuleMsg("销售品【"+os.getName()+"】要求其下成员地址必须相同,请检查！有多个地址【"+instDataSMO.getGeogrophyLocNameByAddrId(oldAddrNameId)+"】" +
								"【"+oldAddrNameId+"】【"+instDataSMO.getGeogrophyLocNameByAddrId(newAddrNameId)+"】【"+newAddrNameId+"】");
						return retVal;
					}
				}
			}
		}
		return retVal;
	}
	
	public char tianYiPackageXSaleLimit() throws Exception{
		char retVal = 'N';
		//--1、获取客户是否为单位
		//  --2、获取是否订购预存款
		Long prodId = null;
		Long acctId = null;
		int flag = 0;
		List<OoRole> listOoRoles = getBusiOrder().getData().getOoRoles();
		for(OoRole oor : listOoRoles){
			if(SoRuleUtil.in(oor.getStatusCd(), SoRuleUtil.newArrayList(MDA.BO_ACTION_STATUS_P,MDA.BO_ACTION_STATUS_S)) &&
					SoRuleUtil.equals(oor.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)){
				prodId = oor.getObjInstId();
				break;
			}
		}
		if(prodId == null){
			return retVal;
		}
		List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
		flagBre :
			for(BusiOrder bo : listBusiOrders){
				if(OrderListUtil.isValidateBoStatus(bo)){
					BusiObj prodOrder = bo.getBusiObj();
					if(SoRuleUtil.equals(prodOrder.getInstId(), prodId) &&
							!SoRuleUtil.equals(prodOrder.getState(), MDA.STATE_DEL)){
						List<BoAccountRela> listBoAccountRelas = bo.getData().getBoAccountRelas();
						for(BoAccountRela bar : listBoAccountRelas){
							if(SoRuleUtil.in(bar.getStatusCd(), 
									SoRuleUtil.newArrayList(MDA.BO_ACTION_STATUS_P,MDA.BO_ACTION_STATUS_S)) &&
									!SoRuleUtil.equals(bar.getState(), MDA.STATE_DEL)){
								acctId = bar.getAcctId();
								break flagBre;
							}
						}
					}
				}
			}
		if(acctId == null){
			//查询实例用户支付账户
			List<OfferProdAccount> listOfferProdAccounts = instDataSMO.getOfferProdAccountListByProdId(getOlId(), prodId);
			for(OfferProdAccount opa : listOfferProdAccounts){
				acctId = opa.getAcctId();
				break;
			}
			if(acctId == null){
				return retVal;
			}
		}
		flag = instDataSMO.getPartyTypeByAcctId(acctId).intValue();
		if(flag != 0){
			return retVal;
		}
		for(BusiOrder bo : listBusiOrders){
			if(OrderListUtil.isValidateBoStatus(bo) &&
					SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_OFFER) &&
					SoRuleUtil.equals(bo.getBusiObj().getState(), MDA.STATE_ADD)){
				if(specDataSMO.isExistsByOsIdCId(bo.getBusiObj().getObjId(), MDA.CATEGORY_NODE_ID_1033362)){
					return retVal;
				}
			}
		}
		retVal = 'Y';
		setLimitRuleMsg("订购天翼套餐费X折优惠销售品，用户支付账户所在客户应是单位类型或者订购相应预存款销售品！");
		return retVal;
	}
	
	public char condCdmaOcsPhoneLevelLimit() throws Exception{
		char retVal = 'N';
		String accessNum = getAccessNumber();
		List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
		if(SoRuleUtil.isEmptyStr(accessNum)){
			accessNum = soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), getProdId(), listBusiOrders);
			if(SoRuleUtil.isEmptyStr(accessNum)){
				return retVal;
			}
		}
		Integer phLevel = instDataSMO.getPhoneNumberLevelByNum(accessNum);
		if(SoRuleUtil.in(phLevel, SoRuleUtil.newArrayList(MDA.PHONE_LEVEL_ONE_2_NINE))){
			for(BusiOrder bo : listBusiOrders){
				if(OrderListUtil.isValidateBoStatus(bo) &&
						SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_OFFER) &&
						SoRuleUtil.equals(bo.getBusiObj().getState(), MDA.STATE_ADD)){
					List<OoRole> listOoRoles = bo.getData().getOoRoles();
					for(OoRole oor : listOoRoles){
						if(OrderListUtil.isValidateAddAo(oor.getStatusCd(), oor.getState()) &&
								SoRuleUtil.equals(oor.getObjType(), MDA.OBJ_TYPE_PROD_SPEC) &&
								SoRuleUtil.equals(oor.getObjInstId(), getProdId())){
							if(specDataSMO.isExistsByOsIdCId(bo.getBusiObj().getObjId(), MDA.CATEGORY_NODE_ID_1030044)){
								retVal = 'Y';
								setLimitRuleMsg("特级号码【"+accessNum+"】不能订购ocs目录销售品【"+specDataSMO.getOfferSpecById(bo.getBusiObj().getObjId()).getName()+"】");
								return retVal;
							}
						}
					}
				}
			}
		}
		return retVal;
	}
	
    /**
	    规则名称:新网龄提速规则   入口:销售品订购 offer_spec_action_2_RULE
	1、判断用户是否为FTTH用户  
	2、判断用户是是否在网2年 
	3、判断用户是是否为单宽带或是融合套餐   
	4、判断是否是公众客户
	5、若是融合则可以订购提速10M(也只能订购10M) ,若是单宽带套餐则可以也只能订购提速5M（融合套餐和单宽带套餐配置组会给两个目录出来）
	6、订购后，动作链自动带出改速率业务动作（dr_offer_order.Actionraisespeedoffer），且提交后，归档自动算总速率（王福斌）；退订反之
	*/
	public char condAgeTimeUpdateNetSpeedLimit() throws Exception{
		OfferProd offerProd = null;
		Long prodId = null;
		String accessType = null;
		Integer custType = null;
		List<OfferProd2Prod>  op2ps= null ;
		List<OfferMemberInstDto> offerMemberList = null;
		List<BusiOrder> busiOrders = OrderListUtil.getBusiOrders(getOrderList());
		Integer areaId = getOrderList().getOrderListInfo().getAreaId();
		int n =0 ;
		Long offerSpecId = getBusiOrder().getBusiObj().getObjId();
		String offerSpecName =  specDataSMO.getOfferSpecObj(getBusiOrder().getBusiObj().getObjId()).getName();
		if (SoRuleUtil.equals(getBusiOrder().getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_OFFER_ORDER)
				&& OrderListUtil.isValidateBoStatus(getBusiOrder())){
			//1:判断用户是是否在网2年 
			for (OoRole ooRole : SoRuleUtil.nvlArry(getBusiOrder().getData().getOoRoles())) {
				if(OrderListUtil.isValidateAddAo(ooRole.getStatusCd(), ooRole.getState())
					&& MDA.OBJ_TYPE_PROD_SPEC.equals(ooRole.getObjType())){
					prodId = ooRole.getObjInstId();
					offerProd = instDataSMO.getOfferProd(getOlId(), ooRole.getObjInstId());
					if(offerProd != null && InstDataUtil.ifValidateInstStatus(offerProd.getStatusCd())){
						if(offerProd.getStartDt()==null){
							setLimitRuleMsg("产品开通时间数据异常，请检查！");
							return 'Y';
						}
						if(!soCommonSMO.getSysdateFromDB().after(SoRuleUtil.addMonth(offerProd.getStartDt(), 24))){
							setLimitRuleMsg("订购["+ offerSpecName+"]销售品,要求用户在网时长必须大于二年，请检查!");
							return 'Y';
						}
					}else{
						setLimitRuleMsg("订购["+ offerSpecName+"]销售品,需要用户在网时长,请检查!");
						return 'Y';
					}
				}
			}
			//2:判断用户是否为FTTH用户  
			int m = instDataSMO.getAccessTypeByOlidAndProdIdCnt(getOlId(), prodId);
			if(m > 0){
				accessType = instDataSMO.getAccessTypeByOlidAndProdId(getOlId(), prodId);

				if(SoRuleUtil.isEmptyStr(accessType)){
					setLimitRuleMsg("当前订购["+ offerSpecName +"]销售品,但产品地址类型为空,请检查!");
					return 'Y' ;
				}else if(!accessType.contains(MDA.LINK_TYPE_FTTH)){
					List<BoProdRela> boProdRelas = OrderListUtil.getBoProdRelaListByProdId(busiOrders,prodId,MDA.STATE_ADD,MDA.PROD_REASON_CD_SHARE);
					for (BoProdRela boProdRela : SoRuleUtil.nvlArry(boProdRelas)) {
						accessType = instDataSMO.getAccessTypeByOlidAndProdId(getOlId(), boProdRela.getRelatedProdId());
						if(accessType != null && !SoRuleUtil.isEmptyStr(accessType)){
							break ;
						}
					}
					if(accessType!= null && !SoRuleUtil.equals(accessType, MDA.LINK_TYPE_FTTH)){
						setLimitRuleMsg("当前订购["+ offerSpecName +"]销售品的实例不是选择的[FTTH]地址,请检查!");
						return 'Y' ;
					}
				}
			}else{
				accessType = instDataSMO.getAccessTypeByProdIdAndOLID(getOlId(), prodId);
				if(accessType == null || SoRuleUtil.isEmptyStr(accessType)){
					//如果实例中没有查询到地址类型，则需要调用接口查询
					Map<String,Object> paramMap = new HashMap<String, Object>();
					paramMap.put("areaId", areaId);
					paramMap.put("prodId", prodId);
					ruleOtherSysService.ifftth(paramMap);
					int flag = SoRuleUtil.getInt(paramMap.get("resultNum"));
					if(flag==0){
						op2ps = instDataSMO.getOfferProd2ProdsWithReasonCd(null,prodId,MDA.REASON_SHARE_LINE);
						if (!SoRuleUtil.isEmptyList(op2ps)){
							paramMap.put("prodId", op2ps.get(0).getRelatedProdId());
							ruleOtherSysService.ifftth(paramMap);
							flag = SoRuleUtil.getInt(paramMap.get("resultNum"));
						}
						if(flag==0){
							setLimitRuleMsg("当前订购["+ offerSpecName +"]销售品的实例不是选择的[FTTH]地址,请检查!");
							return 'Y' ;
						}
					}
				}else{
					if(accessType!= null && !accessType.contains(MDA.LINK_TYPE_FTTH)){
						setLimitRuleMsg("当前订购["+ offerSpecName +"]销售品的实例不是选择的[FTTH]地址,请检查!");
						return 'Y' ;
					}
				}
			}
			
			//3:判断是不是公众客户
			custType = instDataSMO.getCustTypeByProdId(prodId);
			if(SoRuleUtil.equals(custType, MDA.CUST_TYPE_PUBLIC)){
				setLimitRuleMsg("非公众客户不能订购["+ offerSpecName +"]销售品,请检查!");
				return 'Y' ;
			}
			
			//4:判断是不是融合宽带，融合宽带只能订购10M提速包，单宽带只能订购5M提速包
			//增加对实例订购了特定目录的e家销售品的规则判断，订购了直接跳过规则。
			offerMemberList = instDataSMO.getOfferMemberDtoList(getOlId(),prodId,MDA.OBJ_TYPE_PROD_SPEC);
			for (OfferMemberInstDto offerMember : SoRuleUtil.nvlArry(offerMemberList)) {	
				//判断当前购物车是否订购了“e家”目录下的销售品,且当前购物车没有退订
				if (specDataSMO.getOfferSpec2CategoryNodeCountById(offerMember.getOfferSpecId(), MDA.OFFER_SPEC_CATEGORY_NEWPUBLIC) >0){
					n ++ ;
					for(BusiOrder bo : busiOrders){//在当前购物车没有退订
						if(OrderListUtil.isValidateBoStatus(bo)
					    		&& OrderListUtil.isValidateAoStatus(bo.getBusiObj().getStatusCd())
					    		&& SoRuleUtil.equals(offerMember.getOfferId(),bo.getBusiObj().getInstId())
					    		&& bo.getBusiObj().getState().equals(MDA.STATE_DEL)){						
								n--;
						}
					}
				}
			}
			if(n == 0){
				for(BusiOrder bo : busiOrders){//判断在当前购物车中，用户有无加入“-1034004”目录下的融合销售品中
					if(OrderListUtil.isValidateBoStatus(bo) 
							&& OrderListUtil.isValidateAddAo(bo.getBusiObj().getStatusCd(), bo.getBusiObj().getState())
							&& specDataSMO.getOfferSpec2CategoryNodeCountById(bo.getBusiObj().getObjId(), MDA.OFFER_SPEC_CATEGORY_NEWPUBLIC) >0){
						for (OoRole ooRole : SoRuleUtil.nvlArry(bo.getData().getOoRoles())) {
							if(SoRuleUtil.equals(ooRole.getObjType(), MDA.OBJ_TYPE_PROD_SPEC)
									&& SoRuleUtil.equals(ooRole.getObjInstId(), prodId)){
								n ++;
							}
						}
					}
				}
			}

			if(n >0 && !SoRuleUtil.equals(MDA.OFFER_SPEC_SPEED10M, offerSpecId)){
				setLimitRuleMsg("融合宽带不能订购["+ offerSpecName +"]销售品,请检查!");
				return 'Y' ;
			}
			if(n == 0 && !SoRuleUtil.equals(MDA.OFFER_SPEC_SPEED5M, offerSpecId)){
				setLimitRuleMsg("单宽宽带不能订购["+ offerSpecName +"]销售品,请检查!");
				return 'Y' ;
			}
			
		}
		return 'N';
	}
	
	
	public char condOfferOrderFor4G() throws Exception {
		char retVal = 'N';
		Long prodId = getProdId();
		Long offerSpecId = getOfferSpecId();
		if(offerSpecId == null || offerSpecId < 0 || offerSpecId.toString().equals("")){
			BusiObj offerOrder = getBusiOrder().getBusiObj();
			Offer offer = instDataSMO.getOffer(getOlId(), offerOrder.getInstId());
			if(offer != null){
				offerSpecId = offer.getOfferSpecId();
			}else{
				offerSpecId = offerOrder.getObjId();
			}
		}
		int nodeCount = specDataSMO.getOfferSpec2CategoryNodeCountById(offerSpecId, MDA.CATEGORY_NODE_ID_1034002);
		//当前销售品规格是4G销售品
		if(nodeCount > 0){
			boolean isGroupOrder = instDataSMO.isGroupAcceptedOrder(getOlId());
			//当前购物车欠拆的产品ID
			List<Long> removeProdIds = new ArrayList<Long>();
			for(BusiOrder busiOrder : OrderListUtil.getBusiOrders(getOrderList())){
				if(!(OrderListUtil.isValidateBoStatus(busiOrder) && MDA.ACTION_CLASS_PRODUCT == busiOrder.getBoActionType().getActionClassCd())){
					continue;
				}
				BusiObj prodOrder = busiOrder.getBusiObj();
				if(MDA.STATE_DEL.equals(prodOrder.getState()) 
						&& MDA.BO_ACTION_TYPE_CD_QFCJ.equals(busiOrder.getBoActionType().getBoActionTypeCd())){
					removeProdIds.add(prodOrder.getInstId());
				}
			}
			if(!isGroupOrder){
				 if(prodId == null || prodId < 0){
					 List<OoRole> ooRoles = getBusiOrder().getData().getOoRoles();
					 for (OoRole ooRole : ooRoles) {
						if(OrderListUtil.isValidateAoStatus(ooRole.getStatusCd()) && MDA.OBJ_TYPE_PROD_SPEC.equals(ooRole.getObjType())){
							prodId = ooRole.getObjInstId();
						}
					}
				 }
				 //如果是省内受理，且号码没有在当前购物车中欠费拆机，限制
				 if(!removeProdIds.contains(prodId)){
					 setLimitRuleMsg("4G销售品不能通过省内系统受理订购、退订、变更等业务，请通过集团系统受理！OFFERSPECID:"+offerSpecId);
					 return retVal = 'Y';
				 }
			}
		}
		return retVal;
	}


	public char condProdOrderFor4G() throws Exception {
		char retVal = 'N';
		Long prodId = getProdId();
		if(prodId == null || prodId < 0){
			return retVal;
		}
		
		//当前用户是否用订购4G销售品
		boolean isExists4GOffer = false;
		//1.过程数据
		mark:
		for(BusiOrder busiOrder : OrderListUtil.getBusiOrders(getOrderList())){
			if(!(OrderListUtil.isValidateBoStatus(busiOrder) 
					&& MDA.ACTION_CLASS_OFFER == busiOrder.getBoActionType().getActionClassCd())){
				continue;
			}
			//是不是当前用户的销售品订购动作
			 List<OoRole> ooRoles = getBusiOrder().getData().getOoRoles();
			 for (OoRole ooRole : ooRoles) {
				if(OrderListUtil.isValidateAddAo(ooRole.getStatusCd(), ooRole.getState()) 
						&& MDA.OBJ_TYPE_PROD_SPEC.equals(ooRole.getObjType())){
					prodId = ooRole.getObjInstId();
				}
			}
			BusiObj offerOrder = busiOrder.getBusiObj();
			List<Integer> CategoryNodeIds = specDataSMO.getOfferSpec2CategoryNodeId(offerOrder.getObjId());
			for (Integer CategoryNodeId : CategoryNodeIds) {
				if(MDA.CATEGORY_NODE_ID_1034002.equals(CategoryNodeId)){
					isExists4GOffer = true;
					break mark;
				}
			}
		}
		//2.过程中没有订购4G销售品的信息就到实例中去找
		if(!isExists4GOffer){
			List<Offer> specific4GOffers = instDataSMO.getOfferCategoryAndOmRelaByProdId(prodId, MDA.CATEGORY_NODE_ID_1034002);
			if(specific4GOffers != null && specific4GOffers.size() > 0){
				isExists4GOffer = true;
			}
		}
		boolean isGroupOrder = instDataSMO.isGroupAcceptedOrder(getOlId());
		if(isExists4GOffer && !isGroupOrder){
			//当前购物车欠拆的产品ID
			List<Long> removeProdIds = new ArrayList<Long>();
			for(BusiOrder busiOrder : OrderListUtil.getBusiOrders(getOrderList())){
				if(!(OrderListUtil.isValidateBoStatus(busiOrder) && MDA.ACTION_CLASS_PRODUCT == busiOrder.getBoActionType().getActionClassCd())){
					continue;
				}
				BusiObj prodOrder = busiOrder.getBusiObj();
				if(MDA.STATE_DEL.equals(prodOrder.getState()) 
						&& MDA.BO_ACTION_TYPE_CD_QFCJ.equals(busiOrder.getBoActionType().getBoActionTypeCd())){
					removeProdIds.add(prodOrder.getInstId());
				}
			}
			//省内受理的4G
	    	//这里要分情况处理 对于服务信息变动 只管4G服务
	    	//因为其他的服务省内是允许处理的  特别是预开户待补录服务 涉及实名制 必须开放
			if(MDA.BO_ACTION_TYPE_CD_CHANGE_SERV.equals(getBoActionTypeCd())){
				Long servId = null;
				List<BoServOrder> boServOrders = getBusiOrder().getData().getBoServOrders();
				for (BoServOrder boServOrder : boServOrders) {
					if(MDA.SERV_SPEC_641.equals(boServOrder.getServSpecId())){
						servId = boServOrder.getServId();
					}
				}
				List<BoServ> boServs = getBusiOrder().getData().getBoServs();
				for (BoServ boServ : boServs) {
					//当前动作有4G服务的服务信息变更，且用户没有在当前购物车欠拆
					if(OrderListUtil.isValidateAoStatus(boServ.getStatusCd()) && boServ.getServId().equals(servId)
							&& !removeProdIds.contains(prodId)){
						setLimitRuleMsg("包含4G销售品的用户不能通过省内系统受理4G服务的开关业务！");
						return retVal = 'Y';
					}
				}
			}else if(!removeProdIds.contains(prodId)){
				setLimitRuleMsg("包含4G销售品的用户不能通过省内系统受理新装、拆机、补卡、停机保号、挂失解挂等业务，请通过集团系统受理！");
				return retVal = 'Y';
			}
		}
		return retVal;
	}
	
	/**
	 *本地化规则：  1.只有10000号的工号才能受理设呼叫转移号码（即新增、删除服务属性10219）。
                  2.针对呼叫转移号码只能新增、删除，不能进行修改。”
	 *规则编码:CRMSCL92062
     *规则入口:spec.bo_action_type_2_rule
     *serv_spec_id in(13,625)
	 * @return
	 * @throws Exception
	*/
	public char condHjzyLimit()throws Exception
    {
		char retVal = 'N';
		int  count = 0;
		BusiOrder busiOrder = getBusiOrder();
		List<BoServOrder> boServOrders = busiOrder.getData().getBoServOrders();
		for(BoServOrder boServOrder : boServOrders){
			if(!(MDA.SERV_SPEC_13.equals(boServOrder.getServSpecId())||MDA.SERV_SPEC_625.equals(boServOrder.getServSpecId()))){
				return 'N';
			}
		}
		
		for (BoServItem boServItem : busiOrder.getData().getBoServItems()) {
			if (!boServItem.getStatusCd().equals("D")
					&& (boServItem.getState().equals(MDA.STATE_ADD) || boServItem.getState().equals(MDA.STATE_DEL))
					&& boServItem.getItemSpecId().equals(MDA.ITEM_SPEC_10219)) {
				count++;
			}
		}
		if (count >1)
		{
			retVal = 'Y';
			setLimitRuleMsg("[无条件呼叫转移]或[无应答前转]附属销售品的[呼转号码]只能进行增加或删除,不允许进行修改操作(即增加和删除在同一购物车操作)!");
		}
		else if (count == 1)
		{
			int isHaveAuth = specDataSMO.getAuthByOperationSpec(getBaseInfo().getStaffId(),MDA.SM_MANAGE_CD_HJZY);
			if (isHaveAuth == 0)
			{
				retVal = 'Y';
				setLimitRuleMsg("当前受理使用的工号不具备[呼叫转移]受理权限,不允许对[无条件呼叫转移]或[无应答前转]附属销售品的呼转号码进行操作!");
			}
		}		
		return retVal;
	}
	
	
	
	/**
	    规则名称:集团速通卡卡号唯一性校验   入口:销售品订购  offer_spec_action_2_RULE S1/S4
	   规则编码：CRMSCL2992104
	*/
	public char condGroupCardSingleLimit() throws Exception{
		OfferSpecParam offerSpecParam = null;
		List<OoParam> ooParams = getBusiOrder().getData().getOoParams();
		for(OoParam op : SoRuleUtil.nvlArry(ooParams)){
			if(OrderListUtil.isValidateAddAo(op.getStatusCd(), op.getState())){
				offerSpecParam = specDataSMO.getOfferSpecParam(op.getOfferSpecParamId());
				if (offerSpecParam != null && SoRuleUtil.equals(offerSpecParam.getItemSpecId(), MDA.ITEM_SPEC_109040080)) {
					if(specDataSMO.getGroupCardCnt(op.getValue())== 0){
						setLimitRuleMsg("您输入的速通卡卡号["+op.getValue()+"]已使用或者不存在,请输入正确的卡号!");
						return  'Y';
					}
				}
			}
		}
		return 'N';
	}
	
	/**
	 * 规则名称:企业翼应用服务参数：功能费,SI名称 对应关系校验  入口:销售品订购 offer_spec_action_2_RULE
	      订购（S1）/参数变更（S4） 企业翼应用服务（serv_spec_id = 68060）对其服务参数进行限制：
	      要求服务参数 SI名称（item_spec_id = 680141） 值等于2时，服务参数 功能费（item_spec_id = 680142） 值等于10
                要求服务参数 功能费（item_spec_id = 680142） 值等于10时，服务参数 SI名称（item_spec_id = 680141） 值等于2
	       规则编码：CRMSCL2992105
	*/
	public char condWingNetServParamLimit() throws Exception{
		Long prodId =null;
		Map<String, Object> param = new HashMap<String, Object>();
		List<OfferMemberInstDto> offerMemberInstList = null;
		String boActionTypeCd = getBusiOrder().getBoActionType().getBoActionTypeCd() ;
		List<OoRole> ooRoles = getBusiOrder().getData().getOoRoles();
		List<BusiOrder> busiOrders = OrderListUtil.getBusiOrders(getOrderList());
		List<BoServItem> boServItemList = null ;
		List<OfferServItem> offerServItemList =null ;
		String value1 = null;
		String value2 = null;
		for (OoRole ooRole : ooRoles) {
			if(OrderListUtil.isValidateAddAo(ooRole.getStatusCd(), ooRole.getState()) 
					&& MDA.OBJ_TYPE_SERV_SPEC.equals(ooRole.getObjType())){
				prodId = ooRole.getObjInstId();
			}
		}
		if (prodId == null){//S4动过没有oo_role ,所以关联实例表查询
			param.put("objType", MDA.OBJ_TYPE_SERV_SPEC);
			param.put("offerId", getBusiOrder().getBusiObj().getInstId());
			//根据offerId查询其下所有成员
			offerMemberInstList  = instDataSMO.getOfferMemberDtoList(param);
			if(!SoRuleUtil.isEmptyList(offerMemberInstList)){
				prodId = offerMemberInstList.get(0).getMemberId() ;
			}
		}
		if (prodId == null)  return 'N';
		
		if (boActionTypeCd.equals(MDA.BO_ACTION_TYPE_CD_OFFER_ORDER)){
			mark1:for(BusiOrder bo :busiOrders){
				boServItemList = bo.getData().getBoServItems();
				for(BoServItem bsm :SoRuleUtil.nvlArry(boServItemList)){
					if(OrderListUtil.isValidateAddAo(bsm.getStatusCd(), bsm.getState())
							&& SoRuleUtil.equals(prodId, bsm.getServId())
							&& SoRuleUtil.equals(bsm.getItemSpecId(), MDA.ITEM_SPEC_680141)){
						value1 = bsm.getValue() ;
						break mark1;
					}
				}
			}
			mark2:for(BusiOrder bo :busiOrders){
				boServItemList = bo.getData().getBoServItems();
				for(BoServItem bsm :SoRuleUtil.nvlArry(boServItemList)){
					if(OrderListUtil.isValidateAddAo(bsm.getStatusCd(), bsm.getState())
							&& SoRuleUtil.equals(prodId, bsm.getServId())
							&& SoRuleUtil.equals(bsm.getItemSpecId(), MDA.ITEM_SPEC_680142)){
						value2 = bsm.getValue() ;
						break mark2;
					}
				}
			}
			if(value1.equals("2") && !value2.equals("10")){
				setLimitRuleMsg("企业翼应用服务参数:SI名称选择为[企业翼应用-军翼网]时,功能费必须选择为[军翼网3元/月],请确认!");
				return  'Y';
			}
			if(!value1.equals("2") && value2.equals("10")){
				setLimitRuleMsg("企业翼应用服务参数:功能费必须选择为[军翼网3元/月]时,SI名称必须选择为[企业翼应用-军翼网],请确认!");
				return  'Y';
			}
		}else if(boActionTypeCd.equals(MDA.BO_ACTION_TYPE_CD_OFFER_PARAM)){
			mark1:for(BusiOrder bo :busiOrders){
				boServItemList = bo.getData().getBoServItems();
				for(BoServItem bsm :SoRuleUtil.nvlArry(boServItemList)){
					if(OrderListUtil.isValidateAddAo(bsm.getStatusCd(), bsm.getState())
							&& SoRuleUtil.equals(prodId, bsm.getServId())
							&& SoRuleUtil.equals(bsm.getItemSpecId(), MDA.ITEM_SPEC_680141)){
						value1 = bsm.getValue() ;
						break mark1;
					}
				}
			}
			if (value1 == null){
				offerServItemList = instDataSMO.getOfferServItemList(OrderListUtil.getOlId(getOrderList()), prodId, MDA.ITEM_SPEC_680141);
				if(!SoRuleUtil.isEmptyList(offerServItemList)){
					value1 = offerServItemList.get(0).getValue();
				}
			}
			mark2:for(BusiOrder bo :busiOrders){
				boServItemList = bo.getData().getBoServItems();
				for(BoServItem bsm :SoRuleUtil.nvlArry(boServItemList)){
					if(OrderListUtil.isValidateAddAo(bsm.getStatusCd(), bsm.getState())
							&& SoRuleUtil.equals(prodId, bsm.getServId())
							&& SoRuleUtil.equals(bsm.getItemSpecId(), MDA.ITEM_SPEC_680142)){
						value2 = bsm.getValue() ;
						break mark2;
					}
				}
			}
			if (value2 == null){
				offerServItemList = instDataSMO.getOfferServItemList(OrderListUtil.getOlId(getOrderList()), prodId, MDA.ITEM_SPEC_680142);
				if(!SoRuleUtil.isEmptyList(offerServItemList)){
					value2 = offerServItemList.get(0).getValue();
				}
			}
			if(value1.equals("2") && !value2.equals("10")){
				setLimitRuleMsg("企业翼应用服务参数:SI名称选择为[企业翼应用-军翼网]时,功能费必须选择为[军翼网3元/月],请确认!");
				return  'Y';
			}
			if(!value1.equals("2") && value2.equals("10")){
				setLimitRuleMsg("企业翼应用服务参数:功能费必须选择为[军翼网3元/月]时,SI名称必须选择为[企业翼应用-军翼网],请确认!");
				return  'Y';
			}
		}
		
		return 'N';
	}
	
	public char couponChannelLimit() throws Exception{
		char retVal = 'N';
		if(getOrderList().getOrderListInfo().getChannelId() != null){
			if(specDataSMO.getChannelCountByIdAndAttr(MDA.CHANNEL_ATTR_990000030,getOrderList().getOrderListInfo().getChannelId().longValue()) == 0){
				//不是集中处理中心渠道
				List<Bo2Coupon> listBo2Coupons = getBusiOrder().getData().getBo2Coupons();
				for(Bo2Coupon b2c : listBo2Coupons){
					Long prodId = b2c.getProdId();
					Map<String, Object> prodSpecMap = soCommonSMO.getProdSpecByOlIdProdId(getOlId(), prodId, OrderListUtil.getBusiOrders(getOrderList()));
					if(prodSpecMap == null){
						continue;
					}
					String prodSpecId = prodSpecMap.get("prodSpecId").toString();
					if(!MDA.PROD_SPEC_CDMA.toString().equals(prodSpecId)){
						continue;
					}
					if(OrderListUtil.isValidateAddAo(b2c.getStatusCd(), b2c.getState())){
						if(!SoRuleUtil.equals(b2c.getStoreId(), getOrderList().getOrderListInfo().getChannelId()) &&
								!specDataSMO.isOneAgentByChannelId(b2c.getStoreId().longValue(),getOrderList().getOrderListInfo().getChannelId().longValue())){
							setLimitRuleMsg("此串码【"+b2c.getCouponInstanceNumber()+"】与入库渠道不一致，请入库至正确渠道后再次受理!");
							retVal = 'Y';
							return retVal;
						}
						break;
					}
				}
			}
		}
		return retVal;
	}
	
	public char couponChannelUpLimit() throws Exception{
		char retVal = 'N';
		if(getOrderList().getOrderListInfo().getChannelId() != null){
			if(specDataSMO.getChannelCountByIdAndAttr(MDA.CHANNEL_ATTR_990000030,getOrderList().getOrderListInfo().getChannelId().longValue()) == 0){
				//不是集中处理中心渠道
				List<Bo2Coupon> listBo2Coupons = getBusiOrder().getData().getBo2Coupons();
				boolean flag = false;
				for(Bo2Coupon b2c : listBo2Coupons){
					if(OrderListUtil.isValidateAddAo(b2c.getStatusCd(), b2c.getState())){
						//判断是否开渠串码
						flag = specDataSMO.isOpenChannelBybcdCode(b2c.getCouponInstanceNumber());
						if(flag){//开放渠道串码则判断是否入库渠道和受理渠道一致
							if(!SoRuleUtil.equals(b2c.getStoreId(), getOrderList().getOrderListInfo().getChannelId()) &&
									!specDataSMO.isOneAgentByChannelId(b2c.getStoreId().longValue(),getOrderList().getOrderListInfo().getChannelId().longValue())){
								setLimitRuleMsg("此串码【"+b2c.getCouponInstanceNumber()+"】与入库渠道不一致，请入库至正确渠道后再次受理!");
								retVal = 'Y';
								return retVal;
							}
						}
						break;
					}
				}
			}
		}
		return retVal;
	}
	
	public char orderContractAcctLimit() throws Exception{
		char retVal = 'N';
		//订购销售品是否属于合约
		if(specDataSMO.isExistsByOsIdCId(getOfferSpecId(), MDA.CATEGORY_NODE_ID_10002) ||
				specDataSMO.isExistsByOsIdCId(getOfferSpecId(), MDA.CATEGORY_NODE_ID_10003)){
			List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
			List<OoRole> listOoRoles = getBusiOrder().getData().getOoRoles();
			for(OoRole oor : listOoRoles){
				if(SoRuleUtil.in(oor.getStatusCd(), SoRuleUtil.newArrayList(MDA.BO_ACTION_STATUS_P,MDA.BO_ACTION_STATUS_S)) &&
						!SoRuleUtil.equals(oor.getState(), MDA.STATE_DEL)){
					//成员是否有老合同号
					OfferProd op = instDataSMO.getOfferProd(getOlId(),oor.getObjInstId());
					if(op != null){
						break;
					}
					flagBre :
						for(BusiOrder bo : listBusiOrders){//当前购物车是否有老合同号
							if(OrderListUtil.isValidateBoStatus(bo) && 
									SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT) &&
									SoRuleUtil.equals(bo.getBusiObj().getInstId(), oor.getObjInstId())){
								List<BoAccountRela> listBoAccountRelas = bo.getData().getBoAccountRelas();
								for(BoAccountRela bar : listBoAccountRelas){
									if(OrderListUtil.isValidateAddAo(bar.getStatusCd(), bar.getState())){
										Account ac = instDataSMO.getAccount(getOlId(), bar.getAcctId());
										if(ac != null){
											this.setLimitRuleMsg("新装合约必须新建合同号。");
											retVal = 'Y';
											return retVal;
										}
										break flagBre;
									}
								}
							}
						}
				}
			}
		}
		return retVal;
	}
	/**
     * 规则编码：CRMSCL2992106
     * 规则名称：同一个销售品上不能绑定多个终端
     * 2.9新增规则
     */
    public char condIfHaveMoreCoupon() throws Exception{
    	List<BusiOrder> busiOrders = OrderListUtil.getBusiOrders(getOrderList());
    	List<Bo2Coupon> bo2Coupons = null ;
    	Set<Long> offerIdset = new HashSet<Long>();
    	Long offerId = null;
    	int m = 0 ,n =0;
    	for(BusiOrder bo : busiOrders){
    		//if(!SoRuleUtil.equals(bo.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_REPEAL)){
    		if(SoRuleUtil.in(bo.getBusiOrderInfo().getStatusCd(), 
    				SoRuleUtil.newArrayList(MDA.BO_ACTION_STATUS_P,MDA.BO_ACTION_STATUS_S,MDA.BO_ACTION_STATUS_T))){
    			bo2Coupons =bo.getData().getBo2Coupons();
        		for(Bo2Coupon b2c : SoRuleUtil.nvlArry(bo2Coupons)){
        			if(OrderListUtil.isValidateAddAo(b2c.getStatusCd(), b2c.getState())){
        				offerIdset.add(b2c.getOfferId());
        				m ++;
        			}
        			//改单时原单被撤单
        			if(OrderListUtil.isValidateAoStatus(b2c.getStatusCd()) 
        					&& SoRuleUtil.equals(b2c.getState(), MDA.STATE_DEL)){
        				if(offerIdset.size() >0){
        					offerIdset.remove(b2c.getOfferId());
        				}
        				m -- ;
        			}
        		}
    		}
    	}
		if(m>1 && offerIdset.size() == 1){
			offerId = offerIdset.iterator().next();
			if (offerId == null || "".equals(offerId)){
				return 'N';
			}

			if(OrderListUtil.ifNewOffer(getOrderList(),offerId)){ //在当前购物车中是新订购
				BusiOrder offerOrderBo = OrderListUtil.getOfferOrderBo(getOrderList(), offerId);
				if(!SoRuleUtil.isExistEmptyObj(offerOrderBo)){
					setLimitRuleMsg("当前购物车中销售品【"+specDataSMO.getOfferSpecObj(offerOrderBo.getBusiObj().getObjId()).getName()+"】上,绑定了多个终端,请重新选择【终端绑定套餐】!");
					return  'Y';
				}
				
			}else{
				setLimitRuleMsg("当前购物车中销售品【"+specDataSMO.getOfferSpecObj(getInstDataSMO().getOffer(getOlId(), offerId).getOfferSpecId()).getName()+"】上,绑定了多个终端,请重新选择【终端绑定套餐】!");
				return  'Y';
			}	
			
		}else if(m == 1 && offerIdset.size() == 1){
			offerId = offerIdset.iterator().next();
			if (offerId == null || "".equals(offerId)){
				return 'N';
			}
			//查询实例中该销售品实例中是否绑定终端且在当前购物中没有取消绑定终端
			List<OfferCoupon> offerCoupons = instDataSMO.getOfferCouponListByOfferId(offerId);
			if (!SoRuleUtil.isEmptyList(offerCoupons)) {
				for(OfferCoupon coupon : offerCoupons){
					//判断在当前购物车中有无取消终端绑定
					for(BusiOrder bo2 : busiOrders){
						bo2Coupons =bo2.getData().getBo2Coupons();
			    		for(Bo2Coupon b2c : SoRuleUtil.nvlArry(bo2Coupons)){
			    			if(OrderListUtil.isValidateAoStatus(b2c.getStatusCd()) 
			    					&& SoRuleUtil.equals(b2c.getState(), MDA.STATE_DEL)
			    					&& SoRuleUtil.equals(coupon.getCouponInsNumber(), b2c.getCouponInstanceNumber())){
			    				n ++ ;
			    			}
			    		}
					}
				}
			}
			if(m + offerCoupons.size()- n>1){
				setLimitRuleMsg("销售品【"+specDataSMO.getOfferSpecObj(getInstDataSMO().getOffer(getOlId(), offerId).getOfferSpecId()).getName()+"】上,实例和当前购物中绑定了多个终端,请重新选择【终端绑定套餐】!");
				return  'Y';
			}
		}
    	return 'N';
    }
    
	/**本地规则： ITV只能绑定MAC地址串号
	 * 1、coupon_type_cd = '3000060'的串号能仅能绑定到itv帐号这个产品规格上面；
	 * 2、itv上面仅能绑定coupon_type_cd = '3000060'的串号
	 * 规则编码：CRMSCL2992040
	 * bo_action_type_2_rule  801002,1187,3,1,S1
	 * @return
	 * @throws Exception
	 * 7012
	 */
	public char conditvmaclimit() throws Exception {
		int num = 0;
		String bcdCode = null;
		Long prodId =null;
		boolean ifItvSpec = false ;
		int addNum = 0 ;//订购数量
		List<BusiOrder> busiOrders = OrderListUtil.getBusiOrders(getOrderList());
		List<Bo2Coupon> bo2CouponList = null;
		bo2CouponFlag:for(BusiOrder bo : busiOrders){
			if(OrderListUtil.isValidateBoStatus(bo) ){
				bo2CouponList = bo.getData().getBo2Coupons();
				if (bo2CouponList != null) {
					for (Bo2Coupon bo2Coupon : bo2CouponList) {
						if (OrderListUtil.isValidateAddAo(bo2Coupon.getStatusCd(), bo2Coupon.getState())) {
							num  = instDataSMO.getCouponCntByBcdcodeAndCouponType(bo2Coupon.getCouponInstanceNumber(),MDA.COUPON_TYPE_ITV);
							if(num >0){
								bcdCode = bo2Coupon.getCouponInstanceNumber();
								prodId = bo2Coupon.getProdId() ;
								break bo2CouponFlag;
							}
						}
					}
				}
			}
		}
		if(prodId!=null){
			List<OfferProdSpec> opsList = instDataSMO.getOfferProdSpec(getBaseInfo().getOlId(), prodId);
			if (!SoRuleUtil.isEmptyList(opsList)) {
				for (OfferProdSpec opsObj : opsList) {
					if (null != opsObj && SoRuleUtil.equals(opsObj.getProdSpecId(),MDA.PSID_ITVAC)) {
						ifItvSpec = true ;
						break ;
					}
				}
			}
			for(BusiOrder bo : busiOrders){
				if(OrderListUtil.isValidateBoStatus(bo) 
					&& bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_PRODUCT
					&& SoRuleUtil.equals(bo.getBusiObj().getInstId(),prodId)
					&& SoRuleUtil.in(bo.getBusiObj().getState(),SoRuleUtil.newArrayList(MDA.STATE_ADD,MDA.STATE_KIP))){
					List<BoProdSpec> boProdSpecs = bo.getData().getBoProdSpecs();
					if (boProdSpecs != null && boProdSpecs.size() > 0) {
						for (BoProdSpec boProdSpec : boProdSpecs) {
							if (boProdSpec.getState().equals(MDA.STATE_ADD) 
								&& SoRuleUtil.equals(boProdSpec.getProdSpecId(),MDA.PSID_ITVAC)
								&& OrderListUtil.isValidateAoStatus(boProdSpec.getStatusCd())) {
								addNum ++;
							}
						}
					}
				}
			}
			
			if(!ifItvSpec && addNum <1){
				this.setLimitRuleMsg("当前购物车的ITV串号(MAC地址)["+bcdCode+"]没有绑定在ITV产品实例上，请检查!");
				return 'Y';
			}
		}else{//如果没有查询到prodId则进行如下逻辑校验
			bo2CouponList = getBusiOrder().getData().getBo2Coupons();//从当前业务动作中获取
			if (!SoRuleUtil.isEmptyList(bo2CouponList)) {
				for (Bo2Coupon bo2Coupon : bo2CouponList) {
					if(OrderListUtil.isValidateAddAo(bo2Coupon.getStatusCd(), bo2Coupon.getState())){
						bcdCode = bo2Coupon.getCouponInstanceNumber();
						prodId = bo2Coupon.getProdId() ;
						break ;
					}
				}
			}
			
			if(prodId != null){
				List<OfferProdSpec> opsList = instDataSMO.getOfferProdSpec(getBaseInfo().getOlId(), prodId);
				if (!SoRuleUtil.isEmptyList(opsList)) {
					for (OfferProdSpec opsObj : opsList) {
						if (null != opsObj && SoRuleUtil.equals(opsObj.getProdSpecId(),MDA.PSID_ITVAC)) {
							ifItvSpec = true ;
							break ;
						}
					}
				}
				for(BusiOrder bo : busiOrders){
					if(OrderListUtil.isValidateBoStatus(bo) 
						&& bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_PRODUCT
						&& SoRuleUtil.equals(bo.getBusiObj().getInstId(),prodId)
						&& SoRuleUtil.in(bo.getBusiObj().getState(),SoRuleUtil.newArrayList(MDA.STATE_ADD,MDA.STATE_KIP))){
						List<BoProdSpec> boProdSpecs = bo.getData().getBoProdSpecs();
						if (boProdSpecs != null && boProdSpecs.size() > 0) {
							for (BoProdSpec boProdSpec : boProdSpecs) {
								if (boProdSpec.getState().equals(MDA.STATE_ADD) 
									&& SoRuleUtil.equals(boProdSpec.getProdSpecId(),MDA.PSID_ITVAC)
									&& OrderListUtil.isValidateAoStatus(boProdSpec.getStatusCd())) {
									addNum ++;
								}
							}
						}
					}
				}
				
				if(ifItvSpec || addNum > 0){
					num  = instDataSMO.getCouponCntByBcdcodeAndCouponType(bcdCode,MDA.COUPON_TYPE_ITV);
					if(num <1){
						this.setLimitRuleMsg("当前购物车ITV实例上绑定的串号["+bcdCode+"]不是ITV串号(MAC地址)，请检查!");
						return 'Y';
					}
				}
			}
			
		}
		return 'N';
	}
	
	
	public char condCheckAccessNumberRepeal() throws Exception {
		char retVal = 'N';
		boolean isDeletingAccessNumber = false;
		for(BusiOrder busiOrder : OrderListUtil.getBusiOrders(getOrderList())){
			String[] statusArr = {MDA.BO_STATU_P, MDA.BO_STATU_S, MDA.BO_STATU_T}; 
			String boStatus = busiOrder.getBusiOrderInfo().getStatusCd();
			int actionClass = busiOrder.getBoActionType().getActionClassCd();
			OfferProd offerProd = null;
			if(SoRuleUtil.in(boStatus, statusArr) && MDA.ACTION_CLASS_PRODUCT == actionClass){
				BusiObj prodOrder = busiOrder.getBusiObj();
				offerProd = instDataSMO.getOfferProd(getOlId(), prodOrder.getInstId());
			}
			List<BoProdAn> boProdAns = busiOrder.getData().getBoProdAns();
			for (BoProdAn boProdAn : SoRuleUtil.nvlArry(boProdAns)) {
				if(offerProd != null && OrderListUtil.isValidateAoStatus(boProdAn.getStatusCd()) && MDA.STATE_DEL.equals(boProdAn.getState()) 
						&& offerProd.getAccessNumber().equals(boProdAn.getAccessNumber())){
					isDeletingAccessNumber = true;
				}
			}
		}
		//实例数据
		String areaCode = null;
		OfferProd offerProd = instDataSMO.getOfferProd(getOlId(), getProdId());
		if(offerProd != null && soCommonSMO.ifValidateInstStatus(offerProd.getStatusCd()) && !isDeletingAccessNumber){
			Area area = specDataSMO.getArea(offerProd.getAreaId());
			areaCode = area.getZoneNumber();
		}
		if(areaCode == null){
			//当前购物车中新增
			mark:
			for(BusiOrder busiOrder : OrderListUtil.getBusiOrders(getOrderList())){
				if(OrderListUtil.isValidateBoStatus(busiOrder) && getProdId().equals(busiOrder.getBusiObj().getInstId())){
					List<BoProdAn> boProdAns = busiOrder.getData().getBoProdAns();
					for (BoProdAn boProdAn : boProdAns) {
						if(OrderListUtil.isValidateAddAo(boProdAn.getStatusCd(), boProdAn.getState())){
							Area area = specDataSMO.getArea(busiOrder.getAreaId().longValue());
							areaCode = area.getZoneNumber();
							break mark;
						}
					}
				}
			}
		}
		if(areaCode == null){
			return retVal;
		}
		String accessNumber = null;
		Long prodId = null;
		List<BoProdAn> boProdAns = getBusiOrder().getData().getBoProdAns();
		mark:
		for (BoProdAn boProdAn : boProdAns) {
			if(OrderListUtil.isValidateAddAo(boProdAn.getStatusCd(), boProdAn.getState())){
				List<OfferProdNumber> offerProdNumbers = instDataSMO.getOfferProdNumberByAccNbrAndAnTypeCode(boProdAn.getAccessNumber(),
						boProdAn.getAnTypeCd());
				for (OfferProdNumber offerProdNumber : SoRuleUtil.nvlArry(offerProdNumbers)) {
					if(!getProdId().equals(offerProdNumber.getProdId()) && soCommonSMO.ifValidateInstStatus(offerProdNumber.getStatusCd())){
						OfferProd existedOfferProd = instDataSMO.getOfferProd(getOlId(), offerProdNumber.getProdId());
						if(existedOfferProd != null && soCommonSMO.ifValidateInstStatus(existedOfferProd.getStatusCd())){
							Area area = specDataSMO.getArea(existedOfferProd.getAreaId());
							if(areaCode.equals(area.getZoneNumber())){
								accessNumber = offerProdNumber.getAccessNumber();
								prodId = offerProdNumber.getProdId();
								break mark;
							}
						}
					}
				}
			}
		}
		if(accessNumber != null && prodId != null){
			if("-1".equals(accessNumber)){
				return retVal;
			}else{
				setLimitRuleMsg("您所选择的号码["+ areaCode + " "+ accessNumber +"已被产品实例ID["+prodId+"]占用，请重新选号！");
				return retVal = 'Y';
			}
		}
		return retVal;
	}
	/**
	 * 本地化规则：[四川]翼支付缴费助手规则
	 * 规则编码：CRMSCL2992086
	 * 规则入口: serv_spec_action_2_rule(13409240,ADD) prod_spec_action_2_rule.bo_action_2_rule
	 * Dr_Sc_Limit_Rule_Commit_CYQ.condWingPayHelperLimit
	 */
    public char condWingPayHelperLimitNew() throws Exception{
    	Long prodId = getProdId();
    	int num  = 0;
		Long acctId = null;
		OfferServObj offerServObj = null;
		List<BoPaymentAccount> boPaymentAccountList = null;
		List<BoServItem> boServItems = null ;
		List<BoServOrder> boServOrders = null; 
    	List<BusiOrder> busiOrderList = OrderListUtil.getBusiOrders(getOrderList());
    	Set<Long> prodIdset = new HashSet<Long>();
    	List<OfferProdAccount> offerProdAccountlList = null ;
    	if(SoRuleUtil.equals(getBusiOrder().getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_CHANGE_SERV)){
    		List<BoAccountRela> boAccountRelaList = null;
			mark:for(BusiOrder boa : busiOrderList){
				if(SoRuleUtil.equals(boa.getBusiObj().getInstId(), prodId)){
					boAccountRelaList = boa.getData().getBoAccountRelas();
					for (BoAccountRela boAccountRela : SoRuleUtil.nvlArry(boAccountRelaList)) {
						if(OrderListUtil.isValidateAddAo(boAccountRela.getStatusCd(), boAccountRela.getState())){
							acctId = boAccountRela.getAcctId();
							break mark;
						}
					}
				}
			}
    		if (acctId == null ){
    			offerProdAccountlList = instDataSMO.getOfferProdAccountListByProdId(getOlId(), prodId);
    			if (!SoRuleUtil.isEmptyList(offerProdAccountlList)){
    				acctId = offerProdAccountlList.get(0).getAcctId();
    			}
    		}
			if(acctId != null){
				for (BusiOrder bo : OrderListUtil.getBusiOrders(getOrderList())) {
					if(OrderListUtil.isValidateBoStatus(bo)){ //如果修改了代扣参数
						boServItems = bo.getData().getBoServItems();
						boServOrders = bo.getData().getBoServOrders() ;
						if(!SoRuleUtil.isEmptyList(boServOrders) && SoRuleUtil.equals(boServOrders.get(0).getServSpecId(), MDA.SSID_EPAY_HELP)){
							for(BoServItem bsi : SoRuleUtil.nvlArry(boServItems)){
								if(SoRuleUtil.equals(bsi.getItemSpecId(), MDA.ITEM_SPEC_WINGNET_SERV_PARAM)
									&& OrderListUtil.isValidateAddAo(bsi.getStatusCd(), bsi.getState())
									&& SoRuleUtil.equals(bsi.getValue(),MDA.ITEM_SPEC_WINGNET_SERV_PARAM_YES.toString())){
									//判断当前购物中是否添加在同一账户张
									for (BusiOrder bo2 : OrderListUtil.getBusiOrders(getOrderList())) {
										if(OrderListUtil.isValidateBoStatus(bo2) && SoRuleUtil.equals(bo.getBusiObj().getInstId(), bo2.getBusiObj().getInstId())) {
											boAccountRelaList = bo2.getData().getBoAccountRelas();
											for (BoAccountRela boAccountRela : SoRuleUtil.nvlArry(boAccountRelaList)) {
												if(OrderListUtil.isValidateAddAo(boAccountRela.getStatusCd(), boAccountRela.getState())
														&& SoRuleUtil.equals(boAccountRela.getAcctId(), acctId)){
													prodIdset.add(bo.getBusiObj().getInstId());
												}
											}
										}
									}
									//判断已有实例上是否在同一账户实例上
									for (BusiOrder bo3 : OrderListUtil.getBusiOrders(getOrderList())) {
										if(OrderListUtil.isValidateBoStatus(bo3) && SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_PRODUCT)) {
											offerProdAccountlList = instDataSMO.getOfferProdAccountListByProdId(getOlId(), bo3.getBusiObj().getInstId());
											for (OfferProdAccount opa : SoRuleUtil.nvlArry(offerProdAccountlList)){
												if(SoRuleUtil.equals(opa.getAcctId(), acctId)){
													
													prodIdset.add(opa.getProdId()) ;
													//判断当前购物车中账户关系是否删除
													for (BusiOrder bo4 : OrderListUtil.getBusiOrders(getOrderList())) {
														if(OrderListUtil.isValidateBoStatus(bo4) && SoRuleUtil.equals(opa.getProdId(), bo4.getBusiObj().getInstId())) {
															boAccountRelaList = bo4.getData().getBoAccountRelas();
															for (BoAccountRela boAccountRela : SoRuleUtil.nvlArry(boAccountRelaList)) {
																if(OrderListUtil.isValidateAoStatus(boAccountRela.getStatusCd())
																		&& SoRuleUtil.equals(boAccountRela.getState(), MDA.STATE_DEL)
																		&& SoRuleUtil.equals(boAccountRela.getAcctId(), acctId)){
																	prodIdset.remove(bo.getBusiObj().getInstId());
																}
															}
														}
													}
													
												}
											}
										}
									}
								}
							}
						}
					}
				}
				if( prodIdset.size() >1){
					setLimitRuleMsg("账户acctId【"+acctId+"】只能有一个用户作为翼支付交费助手的缴费号码!");
					return  'Y';
				}
				
				List<Map<String,Object>> prodMap = instDataSMO.getWingPayHelperLimitCntByCond(prodId,acctId);
				prodMark :for(Map<String,Object> prod : SoRuleUtil.nvlArry(prodMap)){
					for (BusiOrder bo : OrderListUtil.getBusiOrders(getOrderList())) {
						if(OrderListUtil.isValidateBoStatus(bo) 
								&& SoRuleUtil.equals(bo.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_PROD_BREAK)
								&& SoRuleUtil.equals(bo.getBusiObj().getInstId(), Long.valueOf(prod.get("prodId").toString()))){ //如果当前拆机
							 break prodMark;
						}
					}
					for (BusiOrder bo : OrderListUtil.getBusiOrders(getOrderList())) {
						if(OrderListUtil.isValidateBoStatus(bo) 
								&& SoRuleUtil.equals(bo.getBusiObj().getInstId(), Long.valueOf(prod.get("prodId").toString()))){ //如果修改了代扣参数
							boServItems = bo.getData().getBoServItems();
							boServOrders = bo.getData().getBoServOrders() ;
							if(!SoRuleUtil.isEmptyList(boServOrders) && SoRuleUtil.equals(boServOrders.get(0).getServSpecId(), MDA.SSID_EPAY_HELP)){
								for(BoServItem bsi : SoRuleUtil.nvlArry(boServItems)){
									if(SoRuleUtil.equals(bsi.getItemSpecId(), MDA.ITEM_SPEC_WINGNET_SERV_PARAM)
										&& OrderListUtil.isValidateAoStatus(bsi.getStatusCd())
										&& SoRuleUtil.equals(bsi.getState(), MDA.STATE_DEL)
										&& SoRuleUtil.equals(bsi.getValue(),MDA.ITEM_SPEC_WINGNET_SERV_PARAM_YES.toString())){
										break prodMark;
									}
								}
							}
						}
					}
					if(prodIdset.size() >0){
						setLimitRuleMsg("账户acctId【"+acctId+"】只能有一个用户作为翼支付交费助手的缴费号码!");
						return  'Y';
					}
				}
			}
			//新订购”翼支付交费助手“参数时，修改账户信息（选择了银行托收账户或者修改为银行托收方式）
			for (BusiOrder bo : OrderListUtil.getBusiOrders(getOrderList())) {
				if(OrderListUtil.isValidateBoStatus(bo) 
						&& SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){ //如果修改了代扣参数
					boServItems = bo.getData().getBoServItems();
					boServOrders = bo.getData().getBoServOrders() ;
					if(!SoRuleUtil.isEmptyList(boServOrders) && SoRuleUtil.equals(boServOrders.get(0).getServSpecId(), MDA.SSID_EPAY_HELP)){
						for(BoServItem bsi2 : SoRuleUtil.nvlArry(boServItems)){
							if(SoRuleUtil.equals(bsi2.getItemSpecId(), MDA.ITEM_SPEC_WINGNET_SERV_PARAM)
								&& OrderListUtil.isValidateAoStatus(bsi2.getStatusCd())
								&& SoRuleUtil.equals(bsi2.getState(), MDA.STATE_DEL)
								&& SoRuleUtil.equals(bsi2.getValue(),MDA.ITEM_SPEC_WINGNET_SERV_PARAM_YES.toString())){
								
								for (BusiOrder bo2 : OrderListUtil.getBusiOrders(getOrderList())) {
									if(SoRuleUtil.equals(bo2.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_PROD_BREAK)
											&& SoRuleUtil.equals(bo2.getBusiObj().getInstId(), prodId)){ //如果当前拆机
										 return 'N' ;
									}
								}
								
								//如果翼支付交费助手”是否同意该号码作为缴费号码“参数修改”是“时，判断账户是否为”银行托收“账户
								//限制银行托收账户订购“翼支付交费助手（服务）”
								num = instDataSMO.getBankAccountIdByAcctId(acctId,MDA.PAYMENT_ACCT_TYPE_CD_3);
								if(num >0){
									setLimitRuleMsg("账户已办理银行托收，如果手机用户为翼支付交费助手的缴费号码时,请新建账户或将该账户取消银行托收!");
									return  'Y';
								}else{
									for(BusiOrder bo3 : busiOrderList){
										if(bo3.getBoActionType().getOldActionClassCd() == MDA.ACTION_CLASS_ACCT
												&& !SoRuleUtil.equals(bo3.getBusiObj().getState(), MDA.STATE_DEL)
												&& SoRuleUtil.equals(bo3.getBusiObj().getInstId(),acctId)){
											boPaymentAccountList = bo3.getData().getBoPaymentAccounts();
											for (BoPaymentAccount bpa : SoRuleUtil.nvlArry(boPaymentAccountList)) {
												if(OrderListUtil.isValidateAoStatus(bpa.getStatusCd())
														&& SoRuleUtil.equals(bpa.getPaymentAcctTypeCd(), MDA.PAYMENT_ACCT_TYPE_CD_3)){
													setLimitRuleMsg("手机账户已办理银行托收，如果手机用户为翼支付交费助手的缴费号码时,请新建账户或将该账户取消银行托收!");
													return  'Y';
												}
											}
										}
									}
									num = soDataSMO.ifHaveAccoutNum(acctId) ;//查询是否存在在途的修改账户为托收
									if (num >0){
										 setLimitRuleMsg("账户已办理银行托收,如果手机用户为翼支付交费助手的缴费号码,请新建账户或将该账户取消银行托收!");
										 return  'Y';
									}
								}
								
							}
						}
					}
				}
			}
    	}else if(SoRuleUtil.in(getBusiOrder().getBoActionType().getBoActionTypeCd(),SoRuleUtil.newArrayList(MDA.BO_ACTION_TYPE_CD_FEE_TYPE,MDA.BO_ACTION_TYPE_CD_CHANGEOCS))){
    		//限制订购了“翼支付交费助手（服务）”销售品的用户，办理预后互改（bo_action_type_cd = 1244）和过户（bo_action_type_cd = 11）动作
    		offerServObj = instDataSMO.getOfferServObj(getBaseInfo().getOlId(), MDA.SSID_EPAY_HELP, getProdId());
    		if(offerServObj != null && SoRuleUtil.in(offerServObj.getStatusCd(), SoRuleUtil.newArrayList(MDA.INST_STATUS_UNEFFECT,
					MDA.INST_STATUS_EFFECTING,MDA.INST_STATUS_EFFECTED))){
    			setLimitRuleMsg("订购翼支付交费助手的号码["+ soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(),prodId,OrderListUtil.getBusiOrders(getOrderList()))+"]不允许办理预后互改业务和改OCS属性!");
				return  'Y';
    		}
    	}else if (SoRuleUtil.equals(getBusiOrder().getBoActionType().getBoActionTypeCd(),MDA.BO_ACTION_TYPE_CD_PROD_CUST)){//过户
    		num  = 0 ;
			OfferServItemDto offerServItemMap = instDataSMO.getServiceItemValueForWingPay(prodId, MDA.SSID_EPAY_HELP, MDA.ITEM_SPEC_WINGNET_SERV_PARAM);
			//if(offerServItemMap != null && offerServItemMap.getValue() != null){
			if(offerServItemMap != null && (SoRuleUtil.equals(offerServItemMap.getValue(), MDA.ITEM_SPEC_WINGNET_SERV_PARAM_YES.toString())||offerServItemMap.getValue() == null)){
				num ++ ;
				for (BusiOrder bo : OrderListUtil.getBusiOrders(getOrderList())) {
					if(OrderListUtil.isValidateBoStatus(bo) 
							&& SoRuleUtil.equals(bo.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_PROD_BREAK)
							&& SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){ //如果当前拆机
						num -- ;
					}
				}
				
				for (BusiOrder bo : OrderListUtil.getBusiOrders(getOrderList())) {
					if(OrderListUtil.isValidateBoStatus(bo) 
							&& SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){ //如果修改了代扣参数
						boServItems = bo.getData().getBoServItems();
						boServOrders = bo.getData().getBoServOrders() ;
						if(!SoRuleUtil.isEmptyList(boServOrders) && SoRuleUtil.equals(boServOrders.get(0).getServSpecId(), MDA.SSID_EPAY_HELP)){
							for(BoServItem bsi : SoRuleUtil.nvlArry(boServItems)){
								if(SoRuleUtil.equals(bsi.getItemSpecId(), MDA.ITEM_SPEC_WINGNET_SERV_PARAM)
									&& OrderListUtil.isValidateAoStatus(bsi.getStatusCd())
									&& SoRuleUtil.equals(bsi.getState(), MDA.STATE_DEL)
									&& SoRuleUtil.equals(bsi.getValue(),MDA.ITEM_SPEC_WINGNET_SERV_PARAM_YES.toString())){
									num -- ;
								}
							}
						}
					}
				}
			}
			//}
			//判断过户的时候，有无修改参数
			for (BusiOrder bo : OrderListUtil.getBusiOrders(getOrderList())) {
				if(OrderListUtil.isValidateBoStatus(bo) 
						&& SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){ //如果修改了代扣参数
					boServItems = bo.getData().getBoServItems();
					boServOrders = bo.getData().getBoServOrders() ;
					if(!SoRuleUtil.isEmptyList(boServOrders) && SoRuleUtil.equals(boServOrders.get(0).getServSpecId(), MDA.SSID_EPAY_HELP)){
						for(BoServItem bsi : SoRuleUtil.nvlArry(boServItems)){
							if(SoRuleUtil.equals(bsi.getItemSpecId(), MDA.ITEM_SPEC_WINGNET_SERV_PARAM)
								&& OrderListUtil.isValidateAddAo(bsi.getStatusCd(),bsi.getState())
								&& SoRuleUtil.equals(bsi.getValue(),MDA.ITEM_SPEC_WINGNET_SERV_PARAM_YES.toString())){
								num ++ ;
							}
						}
					}
				}
			}
			if(num >0){
				setLimitRuleMsg("订购翼支付交费助手的号码["+ soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(),prodId,OrderListUtil.getBusiOrders(getOrderList()))+"]:作为翼支付交费助手的缴费号码,不允许办理过户!");
				return  'Y';
			}
			
    	}else if (SoRuleUtil.in(getBusiOrder().getBoActionType().getBoActionTypeCd(),SoRuleUtil.newArrayList(MDA.BO_ACTION_TYPE_CD_ADD_ACCT,MDA.BO_ACTION_TYPE_CD_MODIFY_ACCT))){
    		List<BoAccountInfo> boAccountInfoList = null ;
    		for(BusiOrder bo : busiOrderList){
				if( SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(),MDA.ACTION_CLASS_ACCT)
						&& SoRuleUtil.in(bo.getBusiObj().getState(), SoRuleUtil.newArrayList(MDA.STATE_ADD,MDA.STATE_KIP))){
					boAccountInfoList = bo.getData().getBoAccountInfos();
					if(SoRuleUtil.isEmptyList(boAccountInfoList)){//A2
						boPaymentAccountList = bo.getData().getBoPaymentAccounts();
						for (BoPaymentAccount bpa : SoRuleUtil.nvlArry(boPaymentAccountList)) {
							if(OrderListUtil.isValidateAddAo(bpa.getStatusCd(), bpa.getState())
									&& SoRuleUtil.equals(bpa.getPaymentAcctTypeCd(), MDA.PAYMENT_ACCT_TYPE_CD_3)
									&& bo.getBusiObj().getInstId()!= null){
								//查询账户下翼支付用户
								List<Map<String,Object>> prodMap2 = instDataSMO.getProdIdByAcctIdAndServSpecId(null,bo.getBusiObj().getInstId(),null);
								num = prodMap2.size() ;
								for(Map<String,Object> prod : SoRuleUtil.nvlArry(prodMap2)){	
									//是否拆机
									mark : for (BusiOrder bo2 : OrderListUtil.getBusiOrders(getOrderList())) {
										if(SoRuleUtil.equals(bo2.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_PROD_BREAK)
												&& SoRuleUtil.equals(bo2.getBusiObj().getInstId(),Long.valueOf(prod.get("prodId").toString()) )){ //如果当前拆机
											num  -- ;
											break mark ;
										}
									}
									//是否修改了参数
									for (BusiOrder bo3 : OrderListUtil.getBusiOrders(getOrderList())) {
										if(OrderListUtil.isValidateBoStatus(bo3) 
												&& SoRuleUtil.equals(bo3.getBusiObj().getInstId(), Long.valueOf(prod.get("prodId").toString()))){ //如果修改了代扣参数
											boServItems = bo3.getData().getBoServItems();
											boServOrders = bo3.getData().getBoServOrders() ;
											if(!SoRuleUtil.isEmptyList(boServOrders) && SoRuleUtil.equals(boServOrders.get(0).getServSpecId(), MDA.SSID_EPAY_HELP)){
												for(BoServItem bsi2 : SoRuleUtil.nvlArry(boServItems)){
													if(SoRuleUtil.equals(bsi2.getItemSpecId(), MDA.ITEM_SPEC_WINGNET_SERV_PARAM)
														&& OrderListUtil.isValidateAoStatus(bsi2.getStatusCd())
														&& SoRuleUtil.equals(bsi2.getState(), MDA.STATE_DEL)
														&& SoRuleUtil.equals(bsi2.getValue(),MDA.ITEM_SPEC_WINGNET_SERV_PARAM_YES.toString())){
														num  -- ;
													}
												}
											}
										}
									}
								}
								if(num >0){
									setLimitRuleMsg("该账户下的手机成员为翼支付交费助手的缴费号码时，不允许进行银行托收!");
									return  'Y';
								}
							}
						}
					}else {//A1
						for (BoAccountInfo boAccountInfo : ListUtil.nvlList(boAccountInfoList)) {
							if(OrderListUtil.isValidateAddAo(boAccountInfo.getStatusCd(), boAccountInfo.getState())){
								boPaymentAccountList = bo.getData().getBoPaymentAccounts();
								for (BoPaymentAccount bpa : SoRuleUtil.nvlArry(boPaymentAccountList)) {
									if(OrderListUtil.isValidateAddAo(bpa.getStatusCd(), bpa.getState())
											&& SoRuleUtil.equals(bpa.getPaymentAcctTypeCd(), MDA.PAYMENT_ACCT_TYPE_CD_3)
											&& bo.getBusiObj().getInstId()!= null){
										//查询账户下翼支付用户
										List<Map<String,Object>> prodMap2 = instDataSMO.getProdIdByAcctIdAndServSpecId(null,bo.getBusiObj().getInstId(),null);
										if(prodMap2.size() == 0 && boAccountInfo.getProdId() != null){
											prodMap2 = instDataSMO.getProdIdByAcctIdAndServSpecId(null,null,boAccountInfo.getProdId());
										}
										num = prodMap2.size() ;
										for(Map<String,Object> prod : SoRuleUtil.nvlArry(prodMap2)){	
											//是否拆机
											mark : for (BusiOrder bo2 : OrderListUtil.getBusiOrders(getOrderList())) {
												if(SoRuleUtil.equals(bo2.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_PROD_BREAK)
														&& SoRuleUtil.equals(bo2.getBusiObj().getInstId(),Long.valueOf(prod.get("prodId").toString()) )){ //如果当前拆机
													num  -- ;
													break mark ;
												}
											}
											//是否修改了参数
											for (BusiOrder bo3 : OrderListUtil.getBusiOrders(getOrderList())) {
												if(OrderListUtil.isValidateBoStatus(bo3) 
														&& SoRuleUtil.equals(bo3.getBusiObj().getInstId(), Long.valueOf(prod.get("prodId").toString()))){ //如果修改了代扣参数
													boServItems = bo3.getData().getBoServItems();
													boServOrders = bo3.getData().getBoServOrders() ;
													if(!SoRuleUtil.isEmptyList(boServOrders) && SoRuleUtil.equals(boServOrders.get(0).getServSpecId(), MDA.SSID_EPAY_HELP)){
														for(BoServItem bsi2 : SoRuleUtil.nvlArry(boServItems)){
															if(SoRuleUtil.equals(bsi2.getItemSpecId(), MDA.ITEM_SPEC_WINGNET_SERV_PARAM)
																&& OrderListUtil.isValidateAoStatus(bsi2.getStatusCd())
																&& SoRuleUtil.equals(bsi2.getState(), MDA.STATE_DEL)
																&& SoRuleUtil.equals(bsi2.getValue(),MDA.ITEM_SPEC_WINGNET_SERV_PARAM_YES.toString())){
																num  -- ;
															}
														}
													}
												}
											}
										}
										if(num >0){
											setLimitRuleMsg("该账户下的手机成员为翼支付交费助手的缴费号码时，不允许进行银行托收!");
											return  'Y';
										}
									}
								}
							}
						}
					}
				}
			}
    	}else {
    		List<BoAccountRela> boAccountRelaList = getBusiOrder().getData().getBoAccountRelas();
			markflag: for (BoAccountRela boAccountRela : SoRuleUtil.nvlArry(boAccountRelaList)) {
				if(OrderListUtil.isValidateAddAo(boAccountRela.getStatusCd(), boAccountRela.getState())
						&& boAccountRela.getAcctProdId()!= null){
					//查询账户下翼支付用户
					List<Map<String,Object>> prodMap2 = instDataSMO.getProdIdByAcctIdAndServSpecId(boAccountRela.getAcctProdId(),null,null);
					num = prodMap2.size() ;
					for(Map<String,Object> prod : SoRuleUtil.nvlArry(prodMap2)){	
						//是否拆机
						mark : for (BusiOrder bo2 : OrderListUtil.getBusiOrders(getOrderList())) {
							if(SoRuleUtil.equals(bo2.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_PROD_BREAK)
									&& SoRuleUtil.equals(bo2.getBusiObj().getInstId(),Long.valueOf(prod.get("prodId").toString()) )){ //如果当前拆机
								num  -- ;
								break mark ;
							}
						}
						//是否修改了参数
						for (BusiOrder bo3 : OrderListUtil.getBusiOrders(getOrderList())) {
							if(OrderListUtil.isValidateBoStatus(bo3) 
									&& SoRuleUtil.equals(bo3.getBusiObj().getInstId(), Long.valueOf(prod.get("prodId").toString()))){ //如果修改了代扣参数
								boServItems = bo3.getData().getBoServItems();
								boServOrders = bo3.getData().getBoServOrders() ;
								if(!SoRuleUtil.isEmptyList(boServOrders) && SoRuleUtil.equals(boServOrders.get(0).getServSpecId(), MDA.SSID_EPAY_HELP)){
									for(BoServItem bsi2 : SoRuleUtil.nvlArry(boServItems)){
										if(SoRuleUtil.equals(bsi2.getItemSpecId(), MDA.ITEM_SPEC_WINGNET_SERV_PARAM)
											&& OrderListUtil.isValidateAoStatus(bsi2.getStatusCd())
											&& SoRuleUtil.equals(bsi2.getState(), MDA.STATE_DEL)
											&& SoRuleUtil.equals(bsi2.getValue(),MDA.ITEM_SPEC_WINGNET_SERV_PARAM_YES.toString())){
											num  -- ;
										}
									}
								}
							}
						}
						
					}
					if (num >0 ){
						acctId = boAccountRela.getAcctId();
						break markflag;
					}
				}
			}
			if(acctId != null){
				num = instDataSMO.getBankAccountIdByAcctId(acctId,MDA.PAYMENT_ACCT_TYPE_CD_3);
				if(num >0){
					setLimitRuleMsg("该账户下的手机成员翼支付交费助手的缴费号码时，不允许进行银行托收!");
					return  'Y';
				}
			}
			if(SoRuleUtil.equals(getBusiOrder().getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_CHANGE_ZW)
					&& OrderListUtil.isValidateBoStatus(getBusiOrder())){
				for (BoAccountRela boAccountRela : SoRuleUtil.nvlArry(boAccountRelaList)) {
					if(OrderListUtil.isValidateAddAo(boAccountRela.getStatusCd(), boAccountRela.getState())){
						acctId = boAccountRela.getAcctId();
						break ;
					}
				}	
				if(acctId != null){
					OfferServItemDto offerServItemMap = instDataSMO.getServiceItemValueForWingPay(prodId, MDA.SSID_EPAY_HELP, MDA.ITEM_SPEC_WINGNET_SERV_PARAM);
					if (offerServItemMap != null && (SoRuleUtil.equals(offerServItemMap.getValue(), MDA.ITEM_SPEC_WINGNET_SERV_PARAM_YES.toString())||offerServItemMap.getValue() == null)){
						for (BusiOrder bo : OrderListUtil.getBusiOrders(getOrderList())) {
							if(OrderListUtil.isValidateBoStatus(bo) 
									&& SoRuleUtil.equals(bo.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_PROD_BREAK)
									&& SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){ //如果当前拆机
								 return 'N';
							}
						}
						
						for (BusiOrder bo : OrderListUtil.getBusiOrders(getOrderList())) {
							if(OrderListUtil.isValidateBoStatus(bo) 
									&& SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){ //如果修改了代扣参数
								boServItems = bo.getData().getBoServItems();
								boServOrders = bo.getData().getBoServOrders() ;
								if(!SoRuleUtil.isEmptyList(boServOrders) && SoRuleUtil.equals(boServOrders.get(0).getServSpecId(), MDA.SSID_EPAY_HELP)){
									for(BoServItem bsi : SoRuleUtil.nvlArry(boServItems)){
										if(SoRuleUtil.equals(bsi.getItemSpecId(), MDA.ITEM_SPEC_WINGNET_SERV_PARAM)
											&& OrderListUtil.isValidateAoStatus(bsi.getStatusCd())
											&& SoRuleUtil.equals(bsi.getState(), MDA.STATE_DEL)
											&& SoRuleUtil.equals(bsi.getValue(),MDA.ITEM_SPEC_WINGNET_SERV_PARAM_YES.toString())){
											return 'N';
										}
									}
								}
							}
						}
						
						//判断账户下是否已有翼支付账户，且代付参数为是
						List<Map<String,Object>> prodMap = instDataSMO.getWingPayHelperLimitCntByCond(prodId,acctId);
						prodMark :for(Map<String,Object> prod : SoRuleUtil.nvlArry(prodMap)){
							for (BusiOrder bo : OrderListUtil.getBusiOrders(getOrderList())) {
								if(OrderListUtil.isValidateBoStatus(bo) 
										&& SoRuleUtil.equals(bo.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_PROD_BREAK)
										&& SoRuleUtil.equals(bo.getBusiObj().getInstId(), Long.valueOf(prod.get("prodId").toString()))){ //如果当前拆机
									 break prodMark;
								}
							}
							for (BusiOrder bo : OrderListUtil.getBusiOrders(getOrderList())) {
								if(OrderListUtil.isValidateBoStatus(bo) 
										&& SoRuleUtil.equals(bo.getBusiObj().getInstId(), Long.valueOf(prod.get("prodId").toString()))){ //如果修改了代扣参数
									boServItems = bo.getData().getBoServItems();
									boServOrders = bo.getData().getBoServOrders() ;
									if(!SoRuleUtil.isEmptyList(boServOrders) && SoRuleUtil.equals(boServOrders.get(0).getServSpecId(), MDA.SSID_EPAY_HELP)){
										for(BoServItem bsi : SoRuleUtil.nvlArry(boServItems)){
											if(SoRuleUtil.equals(bsi.getItemSpecId(), MDA.ITEM_SPEC_WINGNET_SERV_PARAM)
												&& OrderListUtil.isValidateAoStatus(bsi.getStatusCd())
												&& SoRuleUtil.equals(bsi.getState(), MDA.STATE_DEL)
												&& SoRuleUtil.equals(bsi.getValue(),MDA.ITEM_SPEC_WINGNET_SERV_PARAM_YES.toString())){
												break prodMark;
											}
										}
									}
								}
							}
							setLimitRuleMsg("账户acctId【"+acctId+"】只能有一个号码作为翼支付交费助手的缴费号码,用户【"
									+soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(),prodId,OrderListUtil.getBusiOrders(getOrderList()))+"】不能把账户合同修改为【"+acctId+"】");
							return  'Y';
						}
					}
				}
			}
    	}
    	return 'N';
    }
    
    public char addOrUpdateAcctPayLimit() throws Exception{
    	char retVal = 'N';
    	String boActionTypeCd = getBoActionTypeCd();
    	//新增or修改账户时判断支付方式不能为公免、公免纳费、免费
    	if(SoRuleUtil.equals(boActionTypeCd, MDA.BO_ACTION_TYPE_CD_ADD_ACCT) ||
    			SoRuleUtil.equals(boActionTypeCd, MDA.BO_ACTION_TYPE_CD_MODIFY_ACCT)){
    		List<BoPaymentAccount> listBoPaymentAccounts = getBusiOrder().getData().getBoPaymentAccounts();
    		for(BoPaymentAccount bp : listBoPaymentAccounts){
    			if(OrderListUtil.isValidateAoStatus(bp.getStatusCd()) &&
    					SoRuleUtil.in(bp.getPaymentAcctTypeCd(), SoRuleUtil.newArrayList(MDA.PAYMENT_ACCT_TYPE_CD_88,
    							MDA.PAYMENT_ACCT_TYPE_CD_20,MDA.PAYMENT_ACCT_TYPE_CD_90))){
    				retVal = 'Y';
    				this.setLimitRuleMsg("新增或修改账户付费方式时，不能选择【公免、公免纳费、免费】");
    				return retVal;
    			}
    		}
    	}
    	return retVal;
    }
    
    public char OCSConverHBLimit() throws Exception{
    	char retVal = 'N';
    	//获取退订销售品成员;
    	Long offerSpecId = getOfferSpecId();//退订销售品
    	Long prodId = null;
    	List<OoRole> listOoRoles = getBusiOrder().getData().getOoRoles();
    	for(OoRole oor : listOoRoles){//正常情况下，应该只有一个del的成员。
    		if(OrderListUtil.isValidateAoStatus(oor.getStatusCd()) &&
    				SoRuleUtil.equals(oor.getState(), MDA.STATE_DEL)){
    			prodId = oor.getObjInstId();
    			break;
    		}
    	}
    	if(prodId == null){
    		return retVal;
    	}
    	
    	List<Long> orderIds = SoRuleUtil.newArrayList();//订购的销售品
    	List<Long> breakIds = SoRuleUtil.newArrayList();//退订的销售品
    	List<BusiOrder> listBusiOrders = OrderListUtil.getBusiOrders(getOrderList());
    	//获取当前购物车退订和订购的销售品
    	for(BusiOrder bo : listBusiOrders){
    		if(OrderListUtil.isValidateBoStatus(bo) &&
    				SoRuleUtil.equals(bo.getBoActionType().getActionClassCd(), MDA.ACTION_CLASS_OFFER)){
    			List<OoRole> listRoles = bo.getData().getOoRoles();
    			for(OoRole oor : listRoles){
    	    		if(OrderListUtil.isValidateAoStatus(oor.getStatusCd()) &&
    	    				SoRuleUtil.equals(oor.getObjInstId(), prodId)){
    	    			if(SoRuleUtil.equals(oor.getState(), MDA.STATE_ADD)){
    	    				orderIds.add(bo.getBusiObj().getObjId());
    	    			}
    	    			if(SoRuleUtil.equals(oor.getState(), MDA.STATE_DEL)){
    	    				breakIds.add(bo.getBusiObj().getObjId());
    	    			}
    	    			break;
    	    		}
    	    	}
    		}
    	}
    	//OCS--->HB
    	List<Long> OCSOfferSpecIds = specDataSMO.getOfferSpecIdByRelaId(MDA.OFFER_SPEC_100020003476);
    	List<Long> HBOfferSpecIds = specDataSMO.getOfferSpecIdByRelaId(MDA.OFFER_SPEC_100010004646);
    	
    	boolean orderFalg = false;//表示是否订购快销主销售品
    	boolean breakFalg = false;//表示是否退订快销主销售品
    	if(SoRuleUtil.equals(offerSpecId, MDA.OFFER_SPEC_100020003476)){//退订ocs快销
    		//退订的是否有OCSOfferSpecIds列表里，订购的是否有HBOfferSpecIds列表里。
    		for(Long osi : SoRuleUtil.nvlArry(breakIds)){
    			if(SoRuleUtil.in(osi, OCSOfferSpecIds)){
    				breakFalg = true;
    				break;
    			}
    		}
    		//退订了ocs主销售品
    		if(breakFalg){
    			for(Long osi : SoRuleUtil.nvlArry(orderIds)){
        			if(SoRuleUtil.in(osi, HBOfferSpecIds)){
        				orderFalg = true;
        				break;
        			}
        		}
    		}
    		//订购了HB主销售品，且没有订购HB_快销
    		if(orderFalg && !SoRuleUtil.in(MDA.OFFER_SPEC_100010004646, orderIds)){
    			retVal = 'Y';
				this.setLimitRuleMsg("OCS转HB用户时，需订购【HB_快销】附属销售品");
				return retVal;
    		}
    	}else if(SoRuleUtil.equals(offerSpecId, MDA.OFFER_SPEC_100010004646)){//HB---->OCS
    		for(Long osi : SoRuleUtil.nvlArry(breakIds)){
    			if(SoRuleUtil.in(osi, HBOfferSpecIds)){
    				breakFalg = true;
    				break;
    			}
    		}
    		//退订了ocs主销售品
    		if(breakFalg){
    			for(Long osi : SoRuleUtil.nvlArry(orderIds)){
        			if(SoRuleUtil.in(osi, OCSOfferSpecIds)){
        				orderFalg = true;
        				break;
        			}
        		}
    		}
    		//订购了HB主销售品，且没有订购HB_快销
    		if(orderFalg && !SoRuleUtil.in(MDA.OFFER_SPEC_100020003476, orderIds)){
    			retVal = 'Y';
				this.setLimitRuleMsg("HB转OCS用户时，需订购【OCS_快销】附属销售品");
				return retVal;
    		}
    	}
    	
    	return retVal;
    }
    
    
    public char condWingPayBonusLimit() throws Exception {
    	char retVal = 'N';
    	Long prodId = null;
    	List<OoRole> ooRoles = getBusiOrder().getData().getOoRoles();
    	for (OoRole ooRole : ooRoles) {
			if(OrderListUtil.isValidateAddAo(ooRole.getStatusCd(), ooRole.getState())){
				prodId = ooRole.getProdId();
			}
		}
    	if(prodId == null){
    		return retVal;
    	}
    	//是否开通4G上网服务
    	boolean has4GNetService = false;
    	List<BusiOrder> busiOrders = OrderListUtil.getBusiOrders(getOrderList());
    	List<ProdServInfoDto> allServSpecList = soCommonSMO.getAllServSpecList(getOlId(), busiOrders, prodId, false);
    	for (ProdServInfoDto prodServInfo : SoRuleUtil.nvlArry(allServSpecList)) {
			if (MDA.SSID_4G.equals(prodServInfo.getServSpecId())){
				has4GNetService = true;
			}
		}
    	if(!has4GNetService){
    		setLimitRuleMsg("订购【"+ getOfferSpecName() +"】不满足活动要求，需要开4G功能！");
    		return retVal = 'Y';
    	}
    	Calendar instance = Calendar.getInstance();
	    instance.setTime(new Date());
	    instance.set(Calendar.HOUR_OF_DAY, 0);
	    instance.set(Calendar.MINUTE, 0);
	    instance.set(Calendar.SECOND, 0);
	    Date thisDay = instance.getTime();
    	//获取终端绑定信息
    	boolean hasSpecificCoupon = false;
    	List<Long> allCouponList = new ArrayList<Long>();
    	for(BusiOrder busiOrder : busiOrders){
    		if(!OrderListUtil.isValidateBoStatus(busiOrder)){
				continue;
			}
    		List<Bo2Coupon> bo2Coupons = busiOrder.getData().getBo2Coupons();
    		for (Bo2Coupon bo2Coupon : SoRuleUtil.nvlArry(bo2Coupons)) {
				if(prodId.equals(bo2Coupon.getProdId())){
					allCouponList.add(bo2Coupon.getCouponId());
				}
			}
    	}
    	//查当天绑定的终端实例
    	List<OfferCoupon> offerCouponList = instDataSMO.getOfferCouponListByProdId(prodId);
    	for (OfferCoupon offerCoupon : SoRuleUtil.nvlArry(offerCouponList)) {
			if(offerCoupon.getCreateDt().after(thisDay)){
				allCouponList.add(offerCoupon.getCouponId());
			}
		}
    	for (Long couponId : SoRuleUtil.nvlArry(allCouponList)) {
    		//是否使用满足活动要求的终端
    		hasSpecificCoupon = specDataSMO.isWingPayBonusCoupon(couponId);
    		if(hasSpecificCoupon){
    			break;
    		}
		}
    	if(!hasSpecificCoupon){
    		setLimitRuleMsg("订购【"+ getOfferSpecName() +"】不满足活动要求，需要在当天绑定指定4G终端！");
    		return retVal = 'Y';
    	}
    	//是否缴费助手指定的缴费号码
    	boolean isPaymentNumber = false;
    	List<ProdServInfoDto> prodServInfoList = soCommonSMO.getAllServSpecList(getOlId(), busiOrders, prodId, true);
    	for (ProdServInfoDto prodServ : SoRuleUtil.nvlArry(prodServInfoList)) {
			if(MDA.SSID_EPAY_HELP.equals(prodServ.getServSpecId())){
				isPaymentNumber = true;
			}
		}
    	if(!isPaymentNumber){
    		setLimitRuleMsg("订购【"+ getOfferSpecName() +"】时没有订购【翼支付交费助手】,不满足活动要求！");
    		return retVal = 'Y';
    	}
    	//用于查询宽带成员的新装时间
    	Long eHomeOfferId = null;
    	boolean isOrdered4GeHomeToday = false;
    	boolean isOrderedTighteHomeToday = false;
    	boolean isOrderedEnjoy4GToday = false;
    	boolean isOrderedTighteHome = false;
		for(BusiOrder busiOrder : busiOrders){
			if(!OrderListUtil.isValidateBoStatus(busiOrder)){
				continue;
			}
			if(MDA.ACTION_CLASS_OFFER != busiOrder.getBoActionType().getActionClassCd()){
				continue;
			}
			boolean isCurrentProdOfferAction = false;
			List<OoRole> ooRoles2 = busiOrder.getData().getOoRoles();
			for (OoRole ooRole : ooRoles2) {
				if(prodId.equals(ooRole.getObjInstId())){
					isCurrentProdOfferAction = true;
				}
			}
			if(!isCurrentProdOfferAction){
				continue;
			}
			//成电老用户新签4G版169和299套餐，两档套餐ID为：4G版e9_169元套餐 100010004262，4G版e9_299元套餐 100010004261
			if(specDataSMO.getOfferSpec2CategoryNodeCountById(busiOrder.getBusiObj().getObjId(), MDA.CATAGORY_NODE_ID_1033364) > 0){
				eHomeOfferId = busiOrder.getBusiObj().getInstId();
				isOrdered4GeHomeToday = true;
			}
			//除成电外其他地市老用户新签紧密169及以上套餐
			if(specDataSMO.getOfferSpec2CategoryNodeCountById(busiOrder.getBusiObj().getObjId(), MDA.CATAGORY_NODE_ID_1033365) > 0){
				eHomeOfferId = busiOrder.getBusiObj().getInstId();
				isOrderedTighteHomeToday = true;
			}
			//老用户新签集团乐享4G套餐
			if(specDataSMO.getOfferSpec2CategoryNodeCountById(busiOrder.getBusiObj().getObjId(), MDA.CATAGORY_NODE_ID_1033366) > 0){
				isOrderedEnjoy4GToday = true;
			}
		}
		//实例，只查当天的订购信息
		List<OfferMember> offerMembers = instDataSMO.getOfferMemberList(getOlId(), prodId, MDA.OBJ_TYPE_PROD_SPEC);
		for (OfferMember offerMember : SoRuleUtil.nvlArry(offerMembers)) {
			Offer offer = instDataSMO.getOffer(getOlId(), offerMember.getOfferId());
			Date createDt = offer.getCreateDt();
			if(specDataSMO.getOfferSpec2CategoryNodeCountById(offer.getOfferSpecId(), MDA.CATAGORY_NODE_ID_1033364) > 0
					&& (createDt.equals(thisDay) || createDt.after(thisDay))){
				eHomeOfferId = offer.getOfferId();
				isOrdered4GeHomeToday = true;
			}
			if(specDataSMO.getOfferSpec2CategoryNodeCountById(offer.getOfferSpecId(), MDA.CATAGORY_NODE_ID_1033365) > 0){
				eHomeOfferId = offer.getOfferId();
				isOrderedTighteHome = true;
				if(createDt.equals(thisDay) || createDt.after(thisDay)){
					isOrderedTighteHomeToday = true;
				}
			}
			if(specDataSMO.getOfferSpec2CategoryNodeCountById(offer.getOfferSpecId(), MDA.CATAGORY_NODE_ID_1033366) > 0
					&& (createDt.equals(thisDay) || createDt.after(thisDay))){
				isOrderedEnjoy4GToday = true;
			}
		}
		String areaPrefix = "";
		OfferProd currProd = instDataSMO.getOfferProd(getOlId(), prodId);
		if(currProd != null){
			areaPrefix = currProd.getAreaId().toString().substring(0, 3);
		}
		if("101".equals(areaPrefix) || "280".equals(areaPrefix)){
			//成电地区的套餐订购限制
			if(MDA.OFFER_SPEC_ID_100030004777.equals(getOfferSpecId()) && !isOrdered4GeHomeToday){
				setLimitRuleMsg("订购【"+ getOfferSpecName() +"】，成电的老用户需要在当天新签4G版e9_169元套餐或4G版e9_299元套餐！");
				return retVal = 'Y';
			}else if ((MDA.OFFER_SPEC_ID_100030004776.equals(getOfferSpecId()) || MDA.OFFER_SPEC_ID_100030004775.equals(getOfferSpecId()))
					&& !isOrderedEnjoy4GToday){
				setLimitRuleMsg("订购【"+ getOfferSpecName() +"】，用户需要在当天新签集团乐享4G套餐！");
				return retVal = 'Y';
			}
		}else {
			//成电外的其他地市的套餐订购限制
			if(MDA.OFFER_SPEC_ID_100030004777.equals(getOfferSpecId()) && !isOrderedTighteHomeToday){
				setLimitRuleMsg("订购【"+ getOfferSpecName() +"】，成电外的其他地市老用户需要在当天新签紧密169及以上套餐！");
				return retVal = 'Y';
			}else if (MDA.OFFER_SPEC_ID_100030004776.equals(getOfferSpecId()) || MDA.OFFER_SPEC_ID_100030004775.equals(getOfferSpecId())){
				//既没有集团乐享4G，也没有紧密169
				if(!isOrderedEnjoy4GToday && !isOrderedTighteHome){
					setLimitRuleMsg("订购【"+ getOfferSpecName() +"】，成电外的其他地市老用户需要在当天新签集团乐享4G套餐或在已有紧密169的情况下" +
							"订购30元及以上档次流量包！");
					return retVal = 'Y';
				}
				//除成电外，已是紧密169及以上套餐用户，判断有30元及以上档次流量包，此场景关联送100元翼支付红包
				if(!isOrderedEnjoy4GToday && isOrderedTighteHome){
					List<OfferMemberDto> allOfferMemberList = soCommonSMO.getAllOfferMemberList(prodId, MDA.OBJ_TYPE_PROD_SPEC, getOrderList());
					boolean hasQualifiedPack = false;
					for (OfferMemberDto offerMemberDto : allOfferMemberList) {
						if(specDataSMO.getOfferSpec2CategoryNodeCountById(offerMemberDto.getOfferSpecId(), MDA.CATAGORY_NODE_ID_1033367) > 0){
							hasQualifiedPack =true;
							break;
						}
					}
					if(!hasQualifiedPack){
						setLimitRuleMsg("订购【"+ getOfferSpecName() +"】，该用户已有紧密169，但需要30元及以上档次流量包！");
						return retVal = 'Y';
					}
				}
			}
		}
		if(eHomeOfferId == null && !isOrderedEnjoy4GToday){
			setLimitRuleMsg("用户没有活动要求套餐，不能订购【"+ getOfferSpecName() +"】！");
			return retVal = 'Y';
		}
    	// 新老用户判断，默认2015年1月1日前新装的用户为老用户
		Date startDt = null;
		List<OfferProdStatus> offerProdStatusList = instDataSMO.getAllOfferProdStatusByProdId(prodId);
		for (OfferProdStatus offerProdStatus : SoRuleUtil.nvlArry(offerProdStatusList)) {
			if(MDA.PROD_STATUS_WAIT_ACTIVE.equals(offerProdStatus.getProdStatusCd())){
				//如果是在用状态说明还未激活
				if(OrderListUtil.isValidateStatusCd(offerProdStatus.getStatusCd())){
					setLimitRuleMsg("翼支付红包订购要求业务受理的手机在2015年1月1日前新装，或与之同在一个e家套餐的宽带成员在2015年1月1日前新装！");
					return retVal = 'Y';
				}
				startDt = offerProdStatus.getEndDt();
				break;
			}
		}
		OfferProd offerProd = instDataSMO.getOfferProd(getOlId(), prodId);
		if(startDt == null){
			//无实例信息，即新装
			if (offerProd == null){
				setLimitRuleMsg("翼支付红包订购要求业务受理的手机在2015年1月1日前新装，或与之同在一个e家套餐的宽带成员在2015年1月1日前新装！");
				return retVal = 'Y';
			}
			startDt = offerProd.getStartDt();
		}
    	if(startDt == null){
    		startDt = new Date();
    	}
    	Calendar cal = Calendar.getInstance();
    	cal.setTime(startDt);
    	int startYear = cal.get(Calendar.YEAR);
    	if(MDA.PROD_SPEC_CDMA.equals(offerProd.getProdSpecId()) && startYear < 2015){
    		return retVal;
    	}
    	Long adslProdId = null;
    	List<OfferMember> offerMemberList = instDataSMO.getOfferMemberListByOfferId(getOlId(), eHomeOfferId);
    	for (OfferMember offerMember : SoRuleUtil.nvlArry(offerMemberList)) {
    		OfferRoles offerRoles = specDataSMO.getOfferRoles(offerMember.getOfferRoleId());
    		if(MDA.MEMBER_ROLE_ADSL.equals(offerRoles.getRoleCd())){
    			adslProdId = offerMember.getMemberId();
    			break;
    		}
		}
    	if(adslProdId == null){
    		for(BusiOrder busiOrder : busiOrders){
    			if(!OrderListUtil.isValidateBoStatus(busiOrder)){
    				continue;
    			}
    			if(MDA.ACTION_CLASS_OFFER != busiOrder.getBoActionType().getActionClassCd()){
    				continue;
    			}
    			if(!busiOrder.getBusiObj().getInstId().equals(eHomeOfferId)){
    				continue;
    			}
    			List<OoRole> ooRoles2 = busiOrder.getData().getOoRoles();
    			for (OoRole ooRole : ooRoles2) {
    				OfferRoles offerRoles = specDataSMO.getOfferRoles(ooRole.getOfferRoleId());
    	    		if(MDA.MEMBER_ROLE_ADSL.equals(offerRoles.getRoleCd())){
    	    			adslProdId = ooRole.getObjInstId();
    	    			break;
    	    		}
				}
    		}
    	}
    	//如取不到E家宽带成员实例，限制订购
    	OfferProd adslProdInfo = instDataSMO.getOfferProd(getOlId(), adslProdId);
    	if(adslProdInfo == null){
    		setLimitRuleMsg("翼支付红包订购要求业务受理的手机在2015年1月1日前新装，或与之同在一个e家套餐的宽带成员在2015年1月1日前新装！");
    		return retVal = 'Y';
    	}
    	cal.setTime(adslProdInfo.getStartDt());
    	int adslStartYear = cal.get(Calendar.YEAR);
    	if(adslStartYear >= 2015){
    		setLimitRuleMsg("翼支付红包订购要求业务受理的手机在2015年1月1日前新装，或与之同在一个e家套餐的宽带成员在2015年1月1日前新装！");
    		return retVal = 'Y';
    	}
    	return retVal;
    }
    
    
    public char condCheckOrder4KOffer() throws Exception {
		char retVal = 'N';
		Long itvProdId = null;
		List<OoRole> ooRoles = getBusiOrder().getData().getOoRoles();
		for (OoRole ooRole : ooRoles) {
			if(!OrderListUtil.isValidateAddAo(ooRole.getStatusCd(), ooRole.getState())){
				continue;
			}
			itvProdId = MDA.OBJ_TYPE_PROD_SPEC.equals(ooRole.getObjType()) ? ooRole.getObjInstId() : ooRole.getProdId();
		}
		List<BusiOrder> busiOrders = OrderListUtil.getBusiOrders(getOrderList());
		Long adslProdId = soCommonSMO.getRelatedProdId(itvProdId, MDA.REASON_SHARE_LINE, getOlId(), busiOrders);
		//ITV捆绑的宽带不在这个订购对象组里面，限制订购
		boolean isInOrderGroup = specDataSMO.isADInOrderGroup(adslProdId);
		if(!isInOrderGroup){
			setLimitRuleMsg("用户不是本次活动的对象，不能订购销售品59元优价购机顶盒（第2部及以上）！");
			return retVal = 'Y';
		}
		//当前购物车是否重复订购
		for(BusiOrder busiOrder : busiOrders){
			if(!OrderListUtil.isValidateBoStatus(busiOrder)){
				continue;
			}
			//排除当前的订购动作
			if(busiOrder.equals(getBusiOrder())){
				continue;
			}
			if(MDA.ACTION_CLASS_OFFER != busiOrder.getBoActionType().getActionClassCd()){
				continue;
			}
			if(!MDA.OFFER_SPEC_ID_100010004869.equals(busiOrder.getBusiObj().getObjId())){
				continue;
			}
			List<OoRole> ooRoles2 = busiOrder.getData().getOoRoles();
			Long tempItvProdId = null;
			for (OoRole ooRole : ooRoles2) {
				if(!OrderListUtil.isValidateAddAo(ooRole.getStatusCd(), ooRole.getState())){
					continue;
				}
				tempItvProdId = MDA.OBJ_TYPE_PROD_SPEC.equals(ooRole.getObjType()) ? ooRole.getObjInstId() : ooRole.getProdId();
			}
			Long tempADProdId = soCommonSMO.getRelatedProdId(tempItvProdId, MDA.REASON_SHARE_LINE, getOlId(), busiOrders);
			if(adslProdId.equals(tempADProdId)){
				setLimitRuleMsg("销售品【59元优价购机顶盒（第2部及以上）】不允许重复订购，当前购物车存在多次订购，请检查！");
				return retVal = 'Y';
			}
		}
		//实例数据是否重复订购
		List<Map<String, Object>> relatesProdIds = instDataSMO.getRelatesProdIdByProdIdandreasonCd(adslProdId, MDA.REASON_SHARE_LINE, MDA.PSID_ITVAC);
		for (Map<String, Object> prodMap : SoRuleUtil.nvlArry(relatesProdIds)) {
			Long tempItvProdId = SoRuleUtil.getLong(prodMap.get("relatesProdId"));
			List<OfferMemberInstDto> offerMemberDtoList = instDataSMO.getOfferMemberDtoList(getOlId(), tempItvProdId, MDA.OBJ_TYPE_PROD_SPEC);
			for (OfferMemberInstDto offerMember : SoRuleUtil.nvlArry(offerMemberDtoList)) {
				if(MDA.OFFER_SPEC_ID_100010004869.equals(offerMember.getOfferSpecId())){
					String accNbr = soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), tempItvProdId, busiOrders);
					setLimitRuleMsg("销售品【59元优价购机顶盒（第2部及以上）】不允许重复订购，宽带捆绑的ITV【"+ accNbr +"】上已存在同规格实例，请检查！");
					return retVal = 'Y';
				}
			}
		}
		return retVal;
	}
    /**本地规则： SCXQ2015050669236 综治E通“十户联防”产品功能开发需求
	 * 1:普通固话订购了“虚拟号码”服务，选号时必须选择具备 “虚拟号码”属性的号码。
	 * 2:普通固话选号时选择了“虚拟号码”属性的号码，必须订购“虚拟号码”服务。
	 * 3:订购了 “虚拟号码”服务的普通固话，只能做新装、拆机、欠费拆机
     * prod_spec_action_2_rule  '2','1','3','66'
	 * CRMSCL2992110
	 * @return
	 * @throws Exception
	 */
    public char condTelVirtualNetLimit() throws Exception{
	    //是否订购了"虚拟号码服务 "
		boolean orderFlag =false;
		//号码资源是否具有"虚拟号码"属性
		boolean itemFlag= false;
		//是否有拆机动作或则欠费拆机动作
		boolean delFlag = false;
		//是否是新装动作
		boolean newFlag =false;
		Long phoneNumberId = null;
		Long prodId = getProdId();
		Long olId = getOlId();
		Integer areaId = getOrderList().getOrderListInfo().getAreaId();
		if(areaId == null){
			areaId = new Integer(99999);
		}
		List<BusiOrder> busiOrders = OrderListUtil.getBusiOrders(getOrderList());
		if(MDA.BO_ACTION_TYPE_CD_REPEAL.equals(getBusiOrder().getBoActionType().getBoActionTypeCd())){
			return 'N';
		}
		//是否存当前是否有【拆机或者欠费拆机】,新装动作
		for(BusiOrder bo : busiOrders){
			if(OrderListUtil.isValidateBoStatus(bo)
				&& bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_PRODUCT
				&& SoRuleUtil.in(bo.getBoActionType().getBoActionTypeCd(), 
				   SoRuleUtil.newArrayList(MDA.BO_ACTION_TYPE_CD_QFCJ,MDA.BO_ACTION_TYPE_CD_PROD_BREAK))){
				//购物车中是否有拆机或者欠费拆机动作   则不需要判断"虚拟号码服务"和"虚拟号码资源属性"的对应关系
				if(SoRuleUtil.equals(bo.getBusiObj().getState(), MDA.STATE_DEL) 
					&& OrderListUtil.isValidateAoStatus(bo.getBusiObj().getStatusCd())
					&& SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
					delFlag = true;
					break;
				}
			}
		}
		//是否有新装动作
		for (BusiOrder bo : busiOrders) {
			if (OrderListUtil.isValidateBoStatus(bo)
					&& bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_PRODUCT
					&& SoRuleUtil.equals(bo.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_NEW_INSTALL)){
				if(SoRuleUtil.equals(prodId, bo.getBusiObj().getInstId())
						&& SoRuleUtil.equals(bo.getBusiObj().getState(),MDA.STATE_ADD)){
					newFlag = true;
					break;
				}
			}
		}
		//购物车中是否有拆机或者欠费拆机动作   则不需要判断"虚拟号码服务"和"虚拟号码资源属性"的对应关系
		if(!delFlag || newFlag){
			//判断当前购物车是否订购了"虚拟号码服务"
			List<BoServDataDto> boServDataDtos = OrderListUtil.getBoServDataListByInstId(busiOrders, prodId);		
			if (!SoRuleUtil.isEmptyList(boServDataDtos)) {
				//取服务信息
				for (BoServDataDto boServDataDto : boServDataDtos) {
					BoServOrder boServOrder = boServDataDto.getBoServOrder();
					//判断状态是否为ADD
					BoServ boServ = boServDataDto.getBoServ();
					if (boServ == null) {
						continue;
					}
					if (MDA.STATE_ADD.equals(boServ.getState()) && boServOrder.getServSpecId().equals(MDA.SERV_SPEC_VIRTUALNET)) {
						orderFlag = true;
					}
				}
			}			
			if(!orderFlag){
				//判断实例上是否有"虚拟号码服务"
				OfferServObj offerServ = instDataSMO.getOfferServObj(getOlId(), MDA.SERV_SPEC_VIRTUALNET, prodId);
				if(offerServ !=null){
					orderFlag = true;
				}
			}
			//判断根据当前购物车判断号码资源是否有“虚拟号码”属性
			List<BoProdAn> boProdAns = OrderListUtil.getBoProdAnListByProdId(busiOrders, prodId);
			if(!SoRuleUtil.isEmptyList(boProdAns)){
				for (BoProdAn boProdAn : SoRuleUtil.nvlArry(boProdAns)) {
					if (!OrderListUtil.isValidateAoStatus(boProdAn.getStatusCd())|| !MDA.STATE_ADD.equals(boProdAn.getState())) {
						continue;
					}
					phoneNumberId = boProdAn.getAnId();
					break;
				}
				
				if(phoneNumberId != null){
					itemFlag =specDataSMO.ifHavePhoneNumberItem(phoneNumberId,MDA.ITEM_SPEC_VIRTUALNET);
				}
			}else {
			    //判断用户实例的号码资源是否具有"虚拟号码"属性
				List<OfferProdNumber> offerProdNumberList = instDataSMO.getOfferProdNumbersByProdId(olId, prodId);
				if (!SoRuleUtil.isEmptyList(offerProdNumberList) && offerProdNumberList.size() != 0) {
					OfferProdNumber offerProdNumber = offerProdNumberList.get(0);
					phoneNumberId = offerProdNumber.getAnId();
					if(phoneNumberId != null){
						itemFlag =specDataSMO.ifHavePhoneNumberItem(phoneNumberId,MDA.ITEM_SPEC_VIRTUALNET);
					}
				}
			}
			if(orderFlag && !itemFlag){
				//如果订购了"虚拟号码服务",则要判断其号码是否为虚拟号码
				setLimitRuleMsg("普通固话订购了[行业应用虚拟号码]服务，选号时必须选择具备[虚拟号码标识]属性的号码!");
				return 'Y';
			}else if(!orderFlag && itemFlag){
				setLimitRuleMsg("普通固话选号时选择了[虚拟号码标识]属性的号码，必须订购[行业应用虚拟号码]服务!");
				return 'Y';
			}
			if(orderFlag){
				//固话开通了“行业应用虚拟号码”服务(SERV_SPEC_ID =1090206),业务规则限制只能开通category_node_id = -1033368目录下的服务功能
				for (BusiOrder bo : busiOrders) {
					if (OrderListUtil.isValidateBoStatus(bo)
							&& bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_PRODUCT 
							&& SoRuleUtil.equals(bo.getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_CHANGE_SERV)
							&& SoRuleUtil.equals(bo.getBusiObj().getInstId(), prodId)){
						List<BoServ> listBoServs = bo.getData().getBoServs();
						List<BoServOrder> listBoServOrders = bo.getData().getBoServOrders();
						for(BoServ lii : listBoServs){
							if(OrderListUtil.isValidateAoStatus(lii.getStatusCd())){
								for(BoServOrder li : listBoServOrders){
									ServSpec servSpec = specDataSMO.getServSpecsById(li.getServSpecId());
									if(specDataSMO.getServSpec2CategoryNodeCountById(li.getServSpecId().longValue(), MDA.CATAGORY_NODE_ID_1033368) == 0
									  && servSpec != null && servSpec.getName() != null){
										setLimitRuleMsg("订购【行业应用虚拟号码】服务的固话成员不能开通【" + servSpec.getName() + "】");
										return 'Y';
									}
								}
							}
						}
					}
				}
							
				if(!SoRuleUtil.in(getBusiOrder().getBoActionType().getBoActionTypeCd(), 
						   SoRuleUtil.newArrayList(MDA.BO_ACTION_TYPE_CD_CHANGE_SERV,MDA.BO_ACTION_TYPE_CD_NEW_INSTALL))){
					setLimitRuleMsg("订购了[行业应用虚拟号码]服务的普通固话,只能做新装、拆机、欠费拆机!");
					return 'Y';
				}
			}
		}
    	return 'N';
    }

    /*
     * SCXQ2015062672330 关于订指定流量包和开通交费助手送翼支付红包的需求
     * 订指定流量包送20元翼支付红包 
     * 1:订购红包的销售品同时要判断用户开通了交费助手才能订购
     */
    
    public char condEpayHelper20RewardLimit() throws Exception{
    	List<BoServ> boServs  = null;
		List<BoServOrder> boServOrderList = null;
		OfferServObj offerServObj = null;
		boolean ifHaveEpayHelper = false ;
		boolean ifHaveFlowPack = false ;
		Long prodId = null;
    	List<BusiOrder> busiOrderList = OrderListUtil.getBusiOrders(getOrderList());
		List<OoRole> ooRoleList = getBusiOrder().getData().getOoRoles();
		if (!SoRuleUtil.isEmptyList(ooRoleList) 
			&& OrderListUtil.isValidateAddAo(getBusiOrder().getBusiObj().getStatusCd(), getBusiOrder().getBusiObj().getState())) {
			for(OoRole ooRole :ooRoleList){
				if(SoRuleUtil.equals(ooRole.getObjType(), MDA.OBJ_TYPE_PROD_SPEC) 
						&& OrderListUtil.isValidateAddAo(ooRole.getStatusCd(), ooRole.getState())){
						prodId = ooRole.getObjInstId();
						break ;
				}
			}
		}
		offerServObj = instDataSMO.getOfferServObj(getBaseInfo().getOlId(), MDA.SSID_EPAY_HELP, prodId);
		if (!SoRuleUtil.isExistEmptyObj(offerServObj) && SoRuleUtil.equals(offerServObj.getStatusCd(), MDA.INST_STATUS_CD_YSHENGX)){
			ifHaveEpayHelper = true ;
			for(BusiOrder bo : busiOrderList){
				if(SoRuleUtil.equals(bo.getBusiObj().getInstId(),prodId)){
					boServs  = bo.getData().getBoServs();
					boServOrderList = bo.getData().getBoServOrders();
	    			for (BoServ boServ : SoRuleUtil.nvlArry(boServs)) {
	    				if (OrderListUtil.isValidateAoStatus(boServ.getStatusCd())
	    						&& SoRuleUtil.equals(boServ.getState(), MDA.STATE_DEL)
	    						&& SoRuleUtil.equals(boServ.getServId(),offerServObj.getServId())) {
	    					for (BoServOrder boServOrder : SoRuleUtil.nvlArry(boServOrderList)) {
	    						if(SoRuleUtil.equals(boServOrder.getServSpecId(), MDA.SSID_EPAY_HELP)){
	    							ifHaveEpayHelper = false ;
	    						}
	    					}
	    				}
	    			}
				}
			}			
		}
		if(!ifHaveEpayHelper){
			this.setLimitRuleMsg("用户【"+ soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId, busiOrderList)+"】订购【" + getOfferSpecName()+ "】销售品,必须开通【翼支付交费助手】");
			return 'Y';	
		}

		Calendar instance = Calendar.getInstance();
	    instance.setTime(new Date());
	    instance.set(Calendar.HOUR_OF_DAY, 0);
	    instance.set(Calendar.MINUTE, 0);
	    instance.set(Calendar.SECOND, 0);
	    Date thisDay = instance.getTime();
	    Offer offer = null;
		List<Long> offerSpecIds = specDataSMO.getOfferSpecIdByRelaId(getBusiOrder().getBusiObj().getObjId());
		List<OfferMember> offerMemberList = instDataSMO.getOfferMemberList(getBaseInfo().getOlId(), prodId, MDA.OBJ_TYPE_PROD_SPEC);		
		if (!SoRuleUtil.isEmptyList(offerMemberList)) {
			for(OfferMember mem : offerMemberList){
				offer = instDataSMO.getOffer(getOlId(), mem.getOfferId());
				if(offer!= null &&  SoRuleUtil.in(offer.getOfferSpecId(), offerSpecIds)
					&& (offer.getStartDt().equals(thisDay) || offer.getStartDt().after(thisDay))
					&& SoRuleUtil.in(offer.getStatusCd(), SoRuleUtil.newArrayList(MDA.INST_STATUS_CD_YSHENGX,MDA.INST_STATUS_CD_JSHENGX))){
					ifHaveFlowPack = true ;
					for(BusiOrder bo : busiOrderList){
						if(SoRuleUtil.equals(bo.getBusiObj().getInstId(), offer.getOfferId())
								&& SoRuleUtil.equals(bo.getBusiObj().getState(), MDA.STATE_DEL)){
							ifHaveFlowPack = false ;
						}
					}
				}
			}
		}
		if(!ifHaveFlowPack){
			this.setLimitRuleMsg("用户【"+ soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId, busiOrderList)+"】续依赖当天已订购流量包才可订购【" + getOfferSpecName()+ "】销售品!");
			return 'Y';	
		}
		
    	return 'N' ;
    }
    
    /*
     * SCXQ2015062672330 关于订指定流量包和开通交费助手送翼支付红包的需求
     * 开通交费助手送2元翼支付红包 :必须是当天新开通交费助手的用户才可以订购“红包”销售品；
     */
    
    public char condEpayHelper2RewardLimit() throws Exception{
    	List<BoServ> boServs  = null;
		List<BoServOrder> boServOrderList = null;
		OfferServObj offerServObj = null;
		boolean ifHaveEpayHelper = false ;
		Long prodId = null;
    	List<BusiOrder> busiOrderList = OrderListUtil.getBusiOrders(getOrderList());
		List<OoRole> ooRoleList = getBusiOrder().getData().getOoRoles();
		if (!SoRuleUtil.isEmptyList(ooRoleList) 
			&& OrderListUtil.isValidateAddAo(getBusiOrder().getBusiObj().getStatusCd(), getBusiOrder().getBusiObj().getState())) {
			for(OoRole ooRole :ooRoleList){
				if(SoRuleUtil.equals(ooRole.getObjType(), MDA.OBJ_TYPE_PROD_SPEC) 
						&& OrderListUtil.isValidateAddAo(ooRole.getStatusCd(), ooRole.getState())){
						prodId = ooRole.getObjInstId();
						break ;
				}
			}
		}
		//判断当前购物车中有无开通交费助手
		for(BusiOrder bo : busiOrderList){
			if(OrderListUtil.isValidateBoStatus(bo)
				&& bo.getBoActionType().getActionClassCd() == MDA.ACTION_CLASS_PRODUCT 
				&& SoRuleUtil.equals(bo.getBusiObj().getInstId(),prodId)){
				boServs  = bo.getData().getBoServs();
    			boServOrderList = bo.getData().getBoServOrders();
    			for (BoServ boServ : boServs) {
    				if (OrderListUtil.isValidateAddAo(boServ.getStatusCd(), boServ.getState())) {
    					for (BoServOrder boServOrder : boServOrderList) {
    						if(SoRuleUtil.equals(boServOrder.getServSpecId(), MDA.SSID_EPAY_HELP)){
    							ifHaveEpayHelper  = true;
    						}
    					}
    				}
    			}
			}
		}
		if(!ifHaveEpayHelper){
			Calendar instance = Calendar.getInstance();
			instance.setTime(new Date());
			instance.set(Calendar.HOUR_OF_DAY, 0);
			instance.set(Calendar.MINUTE, 0);
			instance.set(Calendar.SECOND, 0);
			Date thisDay = instance.getTime();
			
			offerServObj = instDataSMO.getOfferServObj(getBaseInfo().getOlId(), MDA.SSID_EPAY_HELP, prodId);
			if (!SoRuleUtil.isExistEmptyObj(offerServObj) 
					&& SoRuleUtil.in(offerServObj.getStatusCd(), SoRuleUtil.newArrayList(MDA.INST_STATUS_CD_YSHENGX,MDA.INST_STATUS_CD_JSHENGX,MDA.INST_STATUS_CD_DSHENGX))
					&& (offerServObj.getStartDt().equals(thisDay) || offerServObj.getStartDt().after(thisDay))){
				ifHaveEpayHelper = true ;
				mark:for(BusiOrder bo : busiOrderList){
					if(SoRuleUtil.equals(bo.getBusiObj().getInstId(),prodId)){
						boServs  = bo.getData().getBoServs();
						boServOrderList = bo.getData().getBoServOrders();
						for (BoServ boServ : SoRuleUtil.nvlArry(boServs)) {
							if (OrderListUtil.isValidateAoStatus(boServ.getStatusCd())
									&& SoRuleUtil.equals(boServ.getState(), MDA.STATE_DEL)
									&& SoRuleUtil.equals(boServ.getServId(),offerServObj.getServId())) {
								for (BoServOrder boServOrder : SoRuleUtil.nvlArry(boServOrderList)) {
									if(SoRuleUtil.equals(boServOrder.getServSpecId(), MDA.SSID_EPAY_HELP)){
										ifHaveEpayHelper = false ;
										break mark;
									}
								}
							}
						}
					}
				}
			}
		}
		if(!ifHaveEpayHelper){
			this.setLimitRuleMsg("用户【"+ soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId, busiOrderList)+"】订购【" + getOfferSpecName()+ "】销售品,必须有当天开通【翼支付交费助手】实例");
			return 'Y';	
		}
    	return 'N' ;
    }
    
    /**
     * 1:订流量包送20元翼支付红包”订购成功后，不允许再退订，每个用户只能订购一个。
     * 2:“开通交费助手送2元翼支付红包”订购成功后，不允许再退订，每个用户只能订购一个。
     * @return
     * @throws Exception
     */
    public char condEpayHelperCommonLimit() throws Exception{
		Long prodId = null;
    	List<BusiOrder> busiOrderList = OrderListUtil.getBusiOrders(getOrderList());
		List<OoRole> ooRoleList = getBusiOrder().getData().getOoRoles();
		List<Map<String, Object>> hisBusiOrder = new ArrayList<Map<String, Object>>();
		Offer offer = null;
		if(SoRuleUtil.equals(getBusiOrder().getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_OFFER_ORDER)){
			if (!SoRuleUtil.isEmptyList(ooRoleList) 
				&& OrderListUtil.isValidateAddAo(getBusiOrder().getBusiObj().getStatusCd(), getBusiOrder().getBusiObj().getState())) {
				for(OoRole ooRole :ooRoleList){
					if(SoRuleUtil.equals(ooRole.getObjType(), MDA.OBJ_TYPE_PROD_SPEC) 
							&& OrderListUtil.isValidateAddAo(ooRole.getStatusCd(), ooRole.getState())){
							prodId = ooRole.getObjInstId();
							break ;
					}
				}
			}

			List<OfferMember> offerMembers = instDataSMO.getAllOfferMemberListByMemberId(getOlId(), prodId, MDA.OBJ_TYPE_PROD_SPEC);
			for(OfferMember member : SoRuleUtil.nvlArry(offerMembers)){
				offer = instDataSMO.getOffer(getOlId(), member.getOfferId());
				if(offer!= null && SoRuleUtil.equals(offer.getOfferSpecId(), getBusiOrder().getBusiObj().getObjId())){
					hisBusiOrder = soDataSMO.getHisOfferOrder(getBusiOrder().getBusiOrderInfo().getBoId(),member.getOfferId());
					for (int n = 0; n < hisBusiOrder.size(); n++) {
						if (SoRuleUtil.equals(hisBusiOrder.get(n).get("boStatusCd").toString(), MDA.BO_STATU_C)
							&& SoRuleUtil.equals(hisBusiOrder.get(n).get("boActionTypeCd").toString(), MDA.BO_ACTION_TYPE_CD_OFFER_ORDER)){
							this.setLimitRuleMsg("用户【"+ soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId, busiOrderList)+"】已订购过一次【" + getOfferSpecName()+ "】销售品,不能再次订购!");
							return 'Y';	
						}
					}
				}

			}
		}

		if(SoRuleUtil.equals(getBusiOrder().getBoActionType().getBoActionTypeCd(), MDA.BO_ACTION_TYPE_CD_OFFER_BREAK)){
			
			if (!SoRuleUtil.isEmptyList(ooRoleList) 
					&& OrderListUtil.isValidateAoStatus(getBusiOrder().getBusiObj().getStatusCd())) {
					for(OoRole ooRole :ooRoleList){
						if(SoRuleUtil.equals(ooRole.getObjType(), MDA.OBJ_TYPE_PROD_SPEC) 
								&& OrderListUtil.isValidateAoStatus(ooRole.getStatusCd())){
								prodId = ooRole.getObjInstId();
								break ;
						}
					}
				}
			
			List<OfferMember> offerMemberList = instDataSMO.getOfferMemberList(getBaseInfo().getOlId(), prodId, MDA.OBJ_TYPE_PROD_SPEC);		
			if (!SoRuleUtil.isEmptyList(offerMemberList)) {
				for(OfferMember mem : offerMemberList){
					offer = instDataSMO.getOffer(getOlId(), mem.getOfferId());
					if(offer!= null &&  SoRuleUtil.equals(offer.getOfferSpecId(), getBusiOrder().getBusiObj().getObjId())){
						for(BusiOrder bo : busiOrderList){
							if(SoRuleUtil.equals(bo.getBusiObj().getInstId(), mem.getOfferId())
									&& SoRuleUtil.equals(bo.getBusiObj().getState(), MDA.STATE_DEL)){
								this.setLimitRuleMsg("用户【"+ soCommonSMO.getProdAccessNumberByOlIdProdId(getOlId(), prodId, busiOrderList)+"】已成功订购【" + getOfferSpecName()+ "】销售品,不允许退订!");
								return 'Y';	
							}
						}
					}
				}
			}

		}
    	return 'N' ;
    }
}
