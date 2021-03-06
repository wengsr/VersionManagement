﻿/**
 * Created by lijuanZhang on 2015/10/29.
 */
var versionConstant ={
    svnLocation:{
        CHANGATTARepository:1,
        //TESTRepository : "http://crmsvn.asiainfo.org:8001/svn/hxbss/testVersion/a/",
        //DevRepository :"http://crmsvn.asiainfo.org:8001/svn/hxbss/testVersion/a-branch/",
        //TESTRepository : "http://192.168.1.22:8000/svn/hxbss/NCRM/baseLine/Source/",
        TESTRepository: {
            "0": "http://192.168.1.22:8001/svn/hxbss/NCRM/baseLine/Source/trunk/",
            "4": "http://192.168.1.22:8001/svn/hxbss/CRM3.0/SOURCE/code/"
        },
        DevRepository: {
            "0": "http://192.168.1.22:8001/svn/hxbss/NCRM_BASELINE/Source/trunk/",
            "4": "http://192.168.1.22:8001/svn/hxbss/CRM3.0-release/SOURCE/code/"
        },
        //DevRepository :"http://192.168.1.22:8001/svn/hxbss/NCRM_BASELINE/Sourse"
    },
    paths :{
        //DevRepositoryPath:"./svn-branch/"
        // DevRepositoryPath:"D://testSvn-branch/",
        exportAttachmentsLocalPath :"./exportAttachmentsLocalPath/", //需要导出特定变跟单附件压缩包的路径
        DevRepositoryPath: {
            "4": "C:/app/crm3_release/SOURCE/code/",
            "0": "C:/app/NCRM_Baseline/NCRM_BASELINE/Source/trunk/"
        },
        //DevRepositoryPath:"C:/app/NCRM_Baseline/NCRM_BASELINE/Sourse",
        attachmentLocalPath :"./",//所有变更单存放的父级路径,
        renameFiles :"./attachment/newAndOld/rename.bat" //存放重命名文件
    },
    //项目类型，同步projectType表
    projectType: {
        "CRM": "0",//CRM2.9
        "CRM3": "4"  //CRM3.0--智慧BSS
    },
    states:{
        APPLYCOMPLETE  :  "申请完成",
        FILESEXTRACTED:"旧文件已提取",
        FILESUBMITED:"变更文件已提交",
        PLANCHECKED:"已安排走查",
        CHECK:"走查",
        CHECKUNPASS:"走查不通过",
        CHECKPASS:"走查通过",
        SUBMITTING:"上测试库",
        AUTOSUBMITTED:"已自动上测试库",
        SUBMITTED:"上测试库完成",
        TEST:"提交测试",
        TESTED:"测试通过",
        NOTEST:"没有测试",
        TESTUNPASS:"测试不通过",
        BUGCOMFIRMED:"BUG确认",
        REQUESTRETEST:"请求重测",
        SUBMITTODEV:"上发布库",
        AUTOSUBMITTODEV:"已自动上发布库",
        SUBMITTODEVFAIL:"上发布库失败",
        SUBMITTODEVCOMPLETE:"上发布库完成"
    },
    processStep:{
        APPLY:1,
        EXTRACTFILE:2,
        SUBMITFILE:3,
        PLANCHECK:4,
        CHECK:5,
        SUBMIT:6,
        SUBMTICOMPLETE:7,
        TEST:8,
        TESTCEOMPLET:9,
        COMFIRMING:10,
        CONFIRM:11,
        SUBMITTODEV:12,
        SUBMITTODEVCOMPLETE:13
    }
}
module.exports = versionConstant;
