/**
 * Created by lijuanZhang on 2015/10/29.
 */
var versionConstant ={
    svnLocation:{
        CHANGATTARepository:1,
        //TESTRepository : "http://192.168.1.22:8000/svn/hxbss/testVersion/a/",
        //DevRepository :"http://192.168.1.22:8000/svn/hxbss/testVersion/a-branch/"
        TESTRepository : "http://192.168.1.22:8000/svn/hxbss/NCRM/baseLine/Source/",
        DevRepository :"http://192.168.1.22:8000/svn/hxbss/NCRM_BASELINE/Sourse/trunk/"
    },
    paths :{
        //DevRepositoryPath:"./svn-branch/"
        //DevRepositoryPath:"D://testSvn"
        DevRepositoryPath:"C:/app/NCRM_Baseline/NCRM_BASELINE/Sourse/trunk/"
    },
    states:{
        APPLYCOMPLETE  :  "申请完成",
        FILESEXTRACTED:"旧文件已提取",
        FILESUBMITED:"变更文件已提交",
        PLANCHECKED:"已安排走查",
        CHECK:"走查",
        SUBMITTING:"正在上库",
        AUTOSUBMITTED:"已自动上库完成",
        SUBMITTED:"上库完成",
        TEST:"测试",
        TESTED:"测试完成",
        TESTUNPASS:"测试不通过",
        BUGCOMFIRMED:"BUG确认",
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