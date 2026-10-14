/* 运行时验证：用 jsdom 加载页面，注入 mock db，断言渲染结果 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('C:/Users/10061/.workbuddy/binaries/node/workspace/node_modules/jsdom');

const FILE = path.join(__dirname, 'index.html');
const html = fs.readFileSync(FILE, 'utf8');

/* 读取本地私有 config.js（真实资料库 ID；已被 .gitignore 排除、不进公开仓库），
   注入页面 WORKMIN_CONFIG，使 mock db 能按真实 databaseId 匹配夹具数据。
   config.js 缺失则退出并提示按 config.example.js 创建。 */
let REAL_CFG = null;
try {
  const cfgText = fs.readFileSync(path.join(__dirname, 'config.js'), 'utf8');
  const _fakeWin = {};
  new Function('window', cfgText)(_fakeWin);
  REAL_CFG = _fakeWin.WORKMIN_CONFIG;
  if (!REAL_CFG || !REAL_CFG.TODO) throw new Error('config.js 未定义 window.WORKMIN_CONFIG');
} catch (e) {
  console.error('FAIL: 读取 workbench/config.js 失败，请先按 config.example.js 创建 config.js ->', e.message);
  process.exit(1);
}

/* ---- 夹具：与云端一致的真实样例数据 ---- */
const dealers = [
  {id:'d1', 经销商名称:'苏州恒隆食品商贸',负责人:'周敏',分级:'A类核心',本月订货金额:186000,当前库存件数:420,库存可售天数:12,待回款金额:46000,回款状态:'逾期',回款截止日:'2026-10-05',陈列是否达标:'达标',费用核销状态:'待核销',拜访记录:'10/07 到店',备注:''},
  {id:'d2', 经销商名称:'苏州常发百货',负责人:'陈立',分级:'B类重点',本月订货金额:92000,当前库存件数:180,库存可售天数:8,待回款金额:23000,回款状态:'待回款',回款截止日:'2026-10-15',陈列是否达标:'不达标',费用核销状态:'待提交',拜访记录:'',备注:''},
  {id:'d3', 经销商名称:'吴中区新源商贸',负责人:'李国强',分级:'A类核心',本月订货金额:243000,当前库存件数:680,库存可售天数:21,待回款金额:0,回款状态:'已对账',回款截止日:'2026-10-08',陈列是否达标:'达标',费用核销状态:'已核销',拜访记录:'',备注:''},
  {id:'d4', 经销商名称:'相城区益丰食品',负责人:'王芳',分级:'C类常规',本月订货金额:38000,当前库存件数:95,库存可售天数:26,待回款金额:12000,回款状态:'待回款',回款截止日:'2026-10-18',陈列是否达标:'达标',费用核销状态:'待提交',拜访记录:'',备注:''},
  {id:'d5', 经销商名称:'园区万达便民',负责人:'赵伟',分级:'C类常规',本月订货金额:21000,当前库存件数:60,库存可售天数:14,待回款金额:8000,回款状态:'逾期',回款截止日:'2026-10-03',陈列是否达标:'不达标',费用核销状态:'待核销',拜访记录:'',备注:''}
];
const todos = [
  {id:'t1', 事项:'跟进恒隆/万达两家逾期回款对账',所属工作线:'旺旺主业',类型:'待办',截止日期:'2026-10-07',优先级:'P0 紧急',完成:false,进度:0,总目标数:1,备注:''},
  {id:'t2', 事项:'提醒常发百货补货，陈列堆头复位',所属工作线:'旺旺主业',类型:'待办',截止日期:'2026-10-09',优先级:'P1 重要',完成:false,进度:0,总目标数:1,备注:''},
  {id:'t3', 事项:'提交 10 月渠道费用核销单',所属工作线:'旺旺主业',类型:'待办',截止日期:'2026-10-12',优先级:'P2 常规',完成:false,进度:0,总目标数:1,备注:''},
  {id:'t4', 事项:'整理肯尼亚 TikTok 本周 2 条短视频选题',所属工作线:'海外TikTok',类型:'待办',截止日期:'2026-10-09',优先级:'P1 重要',完成:false,进度:0,总目标数:2,备注:''},
  {id:'t5', 事项:'六爻账号：整理 3 条短视频选题',所属工作线:'六爻抖音',类型:'待办',截止日期:'2026-10-10',优先级:'P2 常规',完成:false,进度:0,总目标数:3,备注:''},
  {id:'t6', 事项:'孩子数学作业辅导',所属工作线:'孩子作业',类型:'待办',截止日期:'2026-10-09',优先级:'P1 重要',完成:false,进度:0,总目标数:1,备注:''},
  {id:'t7', 事项:'孩子作业：本周复盘与错题整理',所属工作线:'孩子作业',类型:'待办',截止日期:'2026-10-11',优先级:'P2 常规',完成:false,进度:0,总目标数:1,备注:''},
  {id:'t8', 事项:'AI 小游戏开发：核心玩法原型',所属工作线:'AI小游戏',类型:'项目里程碑',截止日期:'2026-11-30',优先级:'P1 重要',完成:false,进度:2,总目标数:6,备注:''},
  {id:'t9', 事项:'海外 TikTok 矩阵：账号搭建与内容测试',所属工作线:'海外TikTok',类型:'项目里程碑',截止日期:'2026-12-31',优先级:'P1 重要',完成:false,进度:45,总目标数:100,备注:''},
  {id:'t10',事项:'六爻抖音号：完成 30 条内容积累',所属工作线:'六爻抖音',类型:'项目里程碑',截止日期:'2026-12-15',优先级:'P2 常规',完成:false,进度:15,总目标数:100,备注:''},
  {id:'t11',事项:'孩子作业辅导：每日 20 分钟坚持',所属工作线:'孩子作业',类型:'项目里程碑',截止日期:'2026-12-31',优先级:'P1 重要',完成:false,进度:60,总目标数:100,备注:''}
];
const months = [];
[['2026-08',[158000,88000,215000,42000,26000]],['2026-09',[172000,95000,238000,35000,23000]],['2026-10',[186000,92000,243000,38000,21000]]].forEach(function(p){
  dealers.forEach(function(d,i){
    months.push({id:p[0]+i, 月份:p[0], 经销商名称:d.经销商名称, 分级:d.分级, 订货金额:p[1][i],
      期末库存件数:d.当前库存件数, 期末可售天数:d.库存可售天数, 当月回款金额:Math.round(p[1][i]*0.8),
      逾期天数:0, 陈列达标率:d.陈列是否达标==='达标'?100:50, 动销评价:'正常'});
  });
});


/* ---- 夹具：旺旺新增四表（与云端一致） ---- */
const D1='苏州恒隆食品商贸', D2='吴中区新源商贸', D3='苏州常发百货', D4='相城区益丰食品', D5='园区万达便民';
const orders = [
  {_id:'o1', 经销商名称:D1, 订货日期:'2026-10-08', SKU名称:'旺旺雪饼', 品类:'米果', '数量(箱)':120, '单价(元/箱)':68, 金额:8160, 渠道:'线下门店'},
  {_id:'o2', 经销商名称:D1, 订货日期:'2026-10-08', SKU名称:'旺仔牛奶', 品类:'乳饮', '数量(箱)':200, '单价(元/箱)':96, 金额:19200, 渠道:'线下门店'},
  {_id:'o3', 经销商名称:D1, 订货日期:'2026-10-06', SKU名称:'旺旺仙贝', 品类:'米果', '数量(箱)':80, '单价(元/箱)':72, 金额:5760, 渠道:'批发流通'},
  {_id:'o4', 经销商名称:D1, 订货日期:'2026-10-03', SKU名称:'浪味仙', 品类:'休闲食品', '数量(箱)':60, '单价(元/箱)':52, 金额:3120, 渠道:'线上电商'},
  {_id:'o5', 经销商名称:D1, 订货日期:'2026-09-25', SKU名称:'旺旺碎冰冰', 品类:'冰品', '数量(箱)':40, '单价(元/箱)':88, 金额:3520, 渠道:'社区团购'},
  {_id:'o6', 经销商名称:D2, 订货日期:'2026-10-09', SKU名称:'旺仔牛奶', 品类:'乳饮', '数量(箱)':320, '单价(元/箱)':96, 金额:30720, 渠道:'线下门店'},
  {_id:'o7', 经销商名称:D2, 订货日期:'2026-10-09', SKU名称:'旺旺雪饼', 品类:'米果', '数量(箱)':150, '单价(元/箱)':68, 金额:10200, 渠道:'批发流通'},
  {_id:'o8', 经销商名称:D2, 订货日期:'2026-10-05', SKU名称:'O泡果奶', 品类:'乳饮', '数量(箱)':110, '单价(元/箱)':58, 金额:6380, 渠道:'线下门店'},
  {_id:'o9', 经销商名称:D2, 订货日期:'2026-10-02', SKU名称:'旺仔牛奶糖', 品类:'糖果', '数量(箱)':70, '单价(元/箱)':62, 金额:4340, 渠道:'线上电商'},
  {_id:'o10',经销商名称:D2, 订货日期:'2026-09-28', SKU名称:'小小酥', 品类:'休闲食品', '数量(箱)':90, '单价(元/箱)':48, 金额:4320, 渠道:'社区团购'},
  {_id:'o11',经销商名称:D3, 订货日期:'2026-10-07', SKU名称:'旺旺仙贝', 品类:'米果', '数量(箱)':50, '单价(元/箱)':72, 金额:3600, 渠道:'线下门店'},
  {_id:'o12',经销商名称:D3, 订货日期:'2026-10-07', SKU名称:'旺仔牛奶', 品类:'乳饮', '数量(箱)':90, '单价(元/箱)':96, 金额:8640, 渠道:'线下门店'},
  {_id:'o13',经销商名称:D3, 订货日期:'2026-10-04', SKU名称:'浪味仙', 品类:'休闲食品', '数量(箱)':35, '单价(元/箱)':52, 金额:1820, 渠道:'线上电商'},
  {_id:'o14',经销商名称:D4, 订货日期:'2026-10-06', SKU名称:'旺旺雪饼', 品类:'米果', '数量(箱)':30, '单价(元/箱)':68, 金额:2040, 渠道:'线下门店'},
  {_id:'o15',经销商名称:D4, 订货日期:'2026-10-06', SKU名称:'O泡果奶', 品类:'乳饮', '数量(箱)':25, '单价(元/箱)':58, 金额:1450, 渠道:'线下门店'},
  {_id:'o16',经销商名称:D4, 订货日期:'2026-09-26', SKU名称:'旺仔牛奶糖', 品类:'糖果', '数量(箱)':20, '单价(元/箱)':62, 金额:1240, 渠道:'社区团购'},
  {_id:'o17',经销商名称:D5, 订货日期:'2026-10-05', SKU名称:'旺仔牛奶', 品类:'乳饮', '数量(箱)':40, '单价(元/箱)':96, 金额:3840, 渠道:'线下门店'},
  {_id:'o18',经销商名称:D5, 订货日期:'2026-10-05', SKU名称:'小小酥', 品类:'休闲食品', '数量(箱)':18, '单价(元/箱)':48, 金额:864, 渠道:'线下门店'},
  {_id:'o19',经销商名称:D5, 订货日期:'2026-09-24', SKU名称:'旺旺碎冰冰', 品类:'冰品', '数量(箱)':12, '单价(元/箱)':88, 金额:1056, 渠道:'线上电商'}
];
const skus = [];
[[D1,5],[D2,5],[D3,4],[D4,3],[D5,3]].forEach(function(pair){
  for(let i=0;i<pair[1];i++) skus.push({_id:pair[0]+i, 经销商名称:pair[0], SKU名称:'SKU'+(skus.length+1),
    规格:'84g×24包', 在售状态:(i===pair[1]-1&&pair[1]<5)?'待上架':'在卖', '月均动销(件)':100+skus.length*10, '货架排面(个)':3});
});
const kpis = [];
[['2026-10',[[ '销售额达成',30,96],['回款率',20,88.4],['新客开发',10,33.3],['陈列达标率',15,81.1],['库存录入及时率',15,100],['拜访完成率',10,92]]],
 ['2026-09',[['销售额达成',30,104],['回款率',20,95.8],['新客开发',10,100],['陈列达标率',15,95.6],['库存录入及时率',15,66.7],['拜访完成率',10,88]]]
].forEach(function(m){
  m[1].forEach(function(r){ kpis.push({_id:m[0]+r[0], 月份:m[0], 指标名称:r[0], 目标值:100, 实际值:90, '权重(%)':r[1], 得分:r[2]}); });
});
/* 销售额达成：门槛 / 同期 / 实际 三金额（10月门槛高，9月同期高且未达标） */
const ACH = {'2026-10':{门槛金额:600000, 同期金额:550000, 实际金额:580000},
             '2026-09':{门槛金额:500000, 同期金额:580000, 实际金额:540000}};
kpis.forEach(function(k){
  if(k.指标名称==='销售额达成' && ACH[k.月份]){
    k.门槛金额=ACH[k.月份].门槛金额; k.同期金额=ACH[k.月份].同期金额; k.实际金额=ACH[k.月份].实际金额;
  }
});
const checks = [
  {_id:'c1', 日期:'2026-10-09', '上班卡(8:30前)':true,'当日计划(企微)':true,'巡店卡(10-11点)':true,'巡店卡(13-14点)':false,'巡店卡(15-16点)':false,'晚会(17点)':false,'下班卡(17:30后)':false,库存录入:false},
  {_id:'c2', 日期:'2026-10-08', '上班卡(8:30前)':true,'当日计划(企微)':true,'巡店卡(10-11点)':true,'巡店卡(13-14点)':true,'巡店卡(15-16点)':true,'晚会(17点)':true,'下班卡(17:30后)':true,库存录入:false},
  {_id:'c3', 日期:'2026-10-07', '上班卡(8:30前)':true,'当日计划(企微)':true,'巡店卡(10-11点)':true,'巡店卡(13-14点)':true,'巡店卡(15-16点)':false,'晚会(17点)':true,'下班卡(17:30后)':true,库存录入:false},
  {_id:'c4', 日期:'2026-10-06', '上班卡(8:30前)':true,'当日计划(企微)':true,'巡店卡(10-11点)':true,'巡店卡(13-14点)':true,'巡店卡(15-16点)':true,'晚会(17点)':true,'下班卡(17:30后)':true,库存录入:true},
  {_id:'c5', 日期:'2026-10-05', '上班卡(8:30前)':true,'当日计划(企微)':false,'巡店卡(10-11点)':true,'巡店卡(13-14点)':true,'巡店卡(15-16点)':true,'晚会(17点)':true,'下班卡(17:30后)':true,库存录入:true}
];
/* 今日记录：云端日期是 ISO 带时区格式，验证 dayKey 归一化后能匹配上（不再每次都新建一条） */
const TODAY = (function () {
  const d = new Date(), m = String(d.getMonth() + 1), dd = String(d.getDate());
  return d.getFullYear() + '-' + (m.length < 2 ? '0' + m : m) + '-' + (dd.length < 2 ? '0' + dd : dd);
})();
checks.push({ _id: 'c0', 日期: TODAY + 'T00:00:00Z', '上班卡(8:30前)': true, '当日计划(企微)': true, 备注: '今天的记录' });


const hw = [
  {_id:'h1', 日期:'2026-10-09', 科目:'数学', 辅导内容:'两位数乘除法应用题审题训练', '时长(分钟)':25, 掌握情况:'一般', 备注:'应用题读题跳字'},
  {_id:'h2', 日期:'2026-10-09', 科目:'语文', 辅导内容:'课文背诵 + 生字默写', '时长(分钟)':15, 掌握情况:'掌握', 备注:''},
  {_id:'h3', 日期:'2026-10-08', 科目:'数学', 辅导内容:'周长计算专项', '时长(分钟)':20, 掌握情况:'掌握', 备注:''},
  {_id:'h4', 日期:'2026-10-08', 科目:'英语', 辅导内容:'Unit3 单词跟读', '时长(分钟)':12, 掌握情况:'一般', 备注:''},
  {_id:'h5', 日期:'2026-10-07', 科目:'数学', 辅导内容:'时分秒换算', '时长(分钟)':18, 掌握情况:'需加强', 备注:'进换算总错'},
  {_id:'h6', 日期:'2026-10-06', 科目:'语文', 辅导内容:'看图写话练习', '时长(分钟)':22, 掌握情况:'一般', 备注:''},
  {_id:'h7', 日期:'2026-10-05', 科目:'英语', 辅导内容:'句型问答', '时长(分钟)':15, 掌握情况:'掌握', 备注:''}
];
const wrong = [
  {_id:'w1', 日期:'2026-10-09', 科目:'数学', 错题摘要:'3盒笔每盒12支求总数，写成 3+12', 错误类型:'审题不清', 已订正:true,  重做结果:'一次通过'},
  {_id:'w2', 日期:'2026-10-09', 科目:'数学', 错题摘要:'36÷4 写成 8', 错误类型:'计算错误', 已订正:true,  重做结果:'一次通过'},
  {_id:'w3', 日期:'2026-10-08', 科目:'数学', 错题摘要:'长方形周长算成 长×宽', 错误类型:'概念不清', 已订正:false, 重做结果:'未重做'},
  {_id:'w4', 日期:'2026-10-08', 科目:'英语', 错题摘要:'this / these 混用', 错误类型:'概念不清', 已订正:true,  重做结果:'再次出错'},
  {_id:'w5', 日期:'2026-10-07', 科目:'数学', 错题摘要:'2时15分=( )分，答 215', 错误类型:'计算错误', 已订正:true,  重做结果:'一次通过'},
  {_id:'w6', 日期:'2026-10-07', 科目:'语文', 错题摘要:'「的地得」填空错3处', 错误类型:'概念不清', 已订正:false, 重做结果:'未重做'},
  {_id:'w7', 日期:'2026-10-06', 科目:'数学', 错题摘要:'竖式数位没对齐', 错误类型:'粗心', 已订正:true,  重做结果:'一次通过'},
  {_id:'w8', 日期:'2026-10-05', 科目:'英语', 错题摘要:'book 抄成 bool', 错误类型:'粗心', 已订正:true,  重做结果:'一次通过'}
];

const scores = [
  {_id:'sc1', '科目':'语文', '名称':'三上 第一单元测验', '成绩':92, '日期':'2026-09-19', '备注':''},
  {_id:'sc2', '科目':'语文', '名称':'三上 第二单元测验', '成绩':88, '日期':'2026-10-10', '备注':'作文扣 2 分'},
  {_id:'sc3', '科目':'数学', '名称':'三上 第一单元测验', '成绩':85, '日期':'2026-09-20', '备注':''},
  {_id:'sc4', '科目':'数学', '名称':'三上 第二单元测验', '成绩':96, '日期':'2026-10-11', '备注':'附加题全对'},
  {_id:'sc5', '科目':'英语', '名称':'Unit3 单词默写',   '成绩':78, '日期':'2026-10-08', '备注':'拼写错 2 个'}
];

const stocks = [
  {_id:'s1',  品项:'浪味仙', 开单可用量:450, '202608':14,  '202609':467, 在途已发未到:13, 数据状态:'正常',   抓取时间:'2026-10-09 20:48', 来源页签:'BI报表 › 库存 › 分公司库存'},
  {_id:'s2',  品项:'粟米条', 开单可用量:369, '202609':369, 数据状态:'正常',   抓取时间:'2026-10-09 20:48', 来源页签:'BI报表 › 库存 › 分公司库存'},
  {_id:'s3',  品项:'虾片',   开单可用量:177, '202609':177, 在途已发未到:11, 数据状态:'正常',   抓取时间:'2026-10-09 20:48', 来源页签:'BI报表 › 库存 › 分公司库存'},
  {_id:'s4',  品项:'米果卷', 开单可用量:81,  '202609':80,  数据状态:'正常',   抓取时间:'2026-10-09 20:48', 来源页签:'BI报表 › 库存 › 分公司库存'},
  {_id:'s5',  品项:'薯条',   开单可用量:49,  '202609':49,  数据状态:'正常',   抓取时间:'2026-10-09 20:48', 来源页签:'BI报表 › 库存 › 分公司库存'},
  {_id:'s6',  品项:'粟米球', 数据状态:'待核对', 抓取时间:'2026-10-09 20:48', 来源页签:'BI报表 › 库存 › 分公司库存'},
  {_id:'s7',  品项:'薯片',   数据状态:'待核对', 抓取时间:'2026-10-09 20:48', 来源页签:'BI报表 › 库存 › 分公司库存'},
  {_id:'s8',  品项:'膨化组合..．>', 数据状态:'存疑', 抓取时间:'2026-10-09 20:48', 来源页签:'BI报表 › 库存 › 分公司库存'},
  {_id:'s9',  品项:'',       开单可用量:33, '202609':55,  数据状态:'存疑',   抓取时间:'2026-10-09 20:48', 来源页签:'BI报表 › 库存 › 分公司库存'},
  {_id:'s10', 品项:'鱼丝',   数据状态:'待核对', 抓取时间:'2026-10-09 20:48', 来源页签:'BI报表 › 库存 › 分公司库存'},
  {_id:'s11', 品项:'鱼烧',   数据状态:'待核对', 抓取时间:'2026-10-09 20:48', 来源页签:'BI报表 › 库存 › 分公司库存'}
];

const notes = [
  {id:'n1', 内容:'恒隆门店浪味仙排面被竞品挤掉两格，已现场复位', 录入方式:'语音', 客户:'苏州恒隆食品商贸', 标签:'巡店记录', 时间:'2026-10-09 15:20', 已转待办:false},
  {id:'n2', 内容:'新源商贸要补 200 箱旺仔牛奶，要求周五前到货', 录入方式:'文字', 客户:'吴中区新源商贸', 标签:'客户诉求', 时间:'2026-10-09 11:05', 已转待办:true},
  {id:'n3', 内容:'想做个膨化组合堆头试点，先跟常发百货谈', 录入方式:'文字', 客户:'', 标签:'临时想法', 时间:'2026-10-08 19:40', 已转待办:false}
];

const biz = [
  {_id:'b1', 日期:'2026-10-09', 类型:'订货', 客户:'苏州恒隆食品商贸', 产品:'浪味仙', 数量:60, 金额:3120, 备注:'', 录入方式:'手填'},
  {_id:'b2', 日期:'2026-10-08', 类型:'回款', 客户:'吴中区新源商贸', 产品:'', 数量:0, 金额:50000, 备注:'对公转账', 录入方式:'手填'}
];

const custs = [
  {_id:'cu1', 客户名称:'苏州恒隆食品商贸', 渠道:'商超', 联系人:'周敏', 联系方式:'13800001111', 客户地址:'苏州市姑苏区恒润路12号', 备注:''},
  {_id:'cu2', 客户名称:'苏州侦儿食品', 渠道:'电商', 联系人:'侦儿', 联系方式:'13900002222', 客户地址:'苏州工业园区星湖街99号', 备注:'随手记识别新增'}
];

const logs = [
  {_id:'g1', 时间:'2026-10-12 19:30', 模块:'客户档案', 对象:'苏州恒隆食品商贸', 动作:'修改', 内容:'测试日志甲：更新联系方式'},
  {_id:'g2', 时间:'2026-10-12 18:05', 模块:'信息录入', 对象:'苏州侦儿食品', 动作:'新增', 内容:'测试日志乙：随手记识别新增客户'}
];

const DB = {
  '1gQHCbHHyZIFJDGIrzyWrJ': todos,
  'cHPTKdlZZXnjPrU1Y9C9FS': months,
  'JTZew6TvIp5hG4EKe71u5L': orders,
  'U3laEMDAkPXA2z8roktris': skus,
  'bLlwFhzcQklJq9WJJmyoKg': kpis,
  '2oiXI7NgV4T56mTqDJgaNu': checks,
  'asDeaPvz40oBo1xhdsaCHW': hw,
  'wMf3x6Z4PJFl30mAM0Ze4r': wrong,
  '9eyyzBBYlnr13sa5MUlC5p': stocks,
  'PouGOpqFGDOBIEayNHdayk': notes,
  'X0WZ2bOXpqAHT5HEZjhMNS': logs,
  '2bxBhhbZrbFGfZORlNNkE7': custs,
  'YoQVogNYLTo7jyDH5aULAv': scores
};

const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://localhost/' });
const win = dom.window;

/* 注入 mock db（页面启动时读取 window.db） */
const calls = { query: 0, add: 0, update: 0 };
win.WORKMIN_CONFIG = REAL_CFG;
win.__SMART_PAGE__ = { database: {
  query: function (a) {
    calls.query++;
    const rows = DB[a.databaseId] || [];
    return Promise.resolve({ results: rows, hasMore: false, nextCursor: null });
  },
  getSchema: function (a) { return Promise.resolve({ properties: [] }); },
  addRecord: function (a) {
    calls.add++; calls.lastAdd = a; (calls.adds = calls.adds || []).push(a);
    /* 模拟云端持久化：写回 mock 表，让保存后的 fetchData 能回查到（与真实云端一致） */
    var row = { _id: 'added_' + calls.add };
    var props = a.properties || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k];
      row[k] = (v && typeof v === 'object')
        ? (v.select !== undefined ? v.select
          : v.text !== undefined ? v.text
          : v.number !== undefined ? v.number
          : v.date !== undefined ? v.date
          : v.checkbox !== undefined ? v.checkbox
          : v.title !== undefined ? v.title : '')
        : v;
    });
    (DB[a.databaseId] = DB[a.databaseId] || []).push(row);
    return Promise.resolve({});
  },
  updateRecord: function (a) { calls.update++; return Promise.resolve({}); },
  deleteRecord: function (a) { return Promise.resolve({}); },
  onUpdated: function () {}
} };

/* 提取并执行页面脚本 */
const m = html.match(/<script>([\s\S]*)<\/script>/);
if (!m) { console.error('FAIL: 未找到脚本'); process.exit(1); }

const errs = [];
win.addEventListener('error', e => errs.push('window.error: ' + e.message));
const origErr = win.console.error;
win.console.error = function (...a) { errs.push('console.error: ' + a.map(String).join(' ')); origErr.apply(null, a); };

let fail = 0;
function ok(cond, label, extra) {
  console.log((cond ? '  PASS  ' : '  FAIL  ') + label + (extra !== undefined ? '  -> ' + extra : ''));
  if (!cond) fail++;
}

try {
  win.eval(m[1]);
} catch (e) {
  console.error('FAIL: 脚本执行抛错 -> ' + e.message);
  process.exit(1);
}

/* 等待 init 的 Promise 链完成 */
setTimeout(async function () {
  const $ = id => win.document.getElementById(id);
  const wait350 = () => new Promise(r => setTimeout(r, 350));

  console.log('\n=== 1. 初始渲染 ===');
  ok(calls.query >= 3, '三张表都被查询', calls.query + ' 次');
  const tabs = $('tabs').querySelectorAll('button');
  ok(tabs.length === 7, '标签数量 = 7（今日/总览/5项目）', tabs.length);
  ok($('todayHint').textContent.length > 0, '今日提示有文案', JSON.stringify($('todayHint').textContent));
  ok($('todoList').children.length > 0, '今日待办已渲染', $('todoList').children.length + ' 条');

  console.log('\n=== 2. 逐个切换标签 ===');
  const ids = ['today', 'projAll', 'w1', 'w2', 'w3', 'w4', 'w5'];
  ids.forEach(function (tid, i) {
    tabs[i].click();
    const visible = ['tabToday', 'tabProj', 'tabProject', 'tabDealer']
      .filter(id => $(id) && $(id).style.display !== 'none');
    const projLen = $('pjHead') ? $('pjHead').children.length : 0;
    console.log('  [' + tid + '] 可见面板=' + visible.join(',') + ' | 项目头部节点=' + projLen
      + ' | 统计卡=' + ($('pjStats') ? $('pjStats').children.length : 0));
  });

  console.log('\n=== 2b. 各项目待办数 + 主色 ===');
  /* 项目页列表只渲染「待办」，里程碑由顶部进度条承担 */
  const expect = { w1:3, w2:0, w3:1, w4:1, w5:2 };
  const colors = { w1:'#185FA5', w2:'#534AB7', w3:'#0F6E56', w4:'#854F0B', w5:'#3B6D11' };
  /* P2 数据回流：w1 进度里的实际业绩 = 「客户订货明细」当月实时汇总 */
  const liveAmt10 = orders.filter(o => String(o.订货日期).slice(0, 7) === '2026-10')
    .reduce((s, o) => s + (Number(o.金额) || 0), 0);
  const achScore = (gate, same, real) => {
    const base = Math.max(gate, same), rate = base ? real / base : 0;
    const sc = gate >= same ? (rate >= 0.8 ? 70 : 70 * rate / 0.8) : (rate >= 1 ? 70 : 0);
    return Math.round(sc * 10) / 10;
  };
  const pctW1Want = Math.round((achScore(600000, 550000, liveAmt10) * 30
    + 88.4 * 20 + 33.3 * 10 + 81.1 * 15 + 100 * 15 + 92 * 10) / 100);
  console.log('  [P2] 当月订货实时汇总 = ¥' + liveAmt10
    + ' → 销售额得分 ' + achScore(600000, 550000, liveAmt10) + ' → 期望头部进度 ' + pctW1Want + '%');
  ids.forEach(function (tid, i) {
    if (tid === 'today' || tid === 'projAll') return;
    tabs[i].click();
    const n = $('pjTodoList').children.length;
    const nmEl = $('pjHead').querySelector('.pjname');
    const c = nmEl ? (nmEl.style.color || '') : '';
    const want = expect[tid];
    const emptyMsg = $('pjTodoList').querySelector('.empty') !== null;
    const real = emptyMsg ? 0 : n;
    const pct = $('pjHead').textContent.match(/(\d+)%/);
    const pctWant = { w1:pctW1Want, w2:33, w3:45, w4:15 }[tid];  // w5 已取消项目进度头部，无进度%
    if (tid === 'w1') {
      ok(nmEl.textContent === '旺旺膨化-苏州所', 'w1 头部名称 = 旺旺膨化-苏州所', nmEl.textContent);
      const descEl = $('pjHead').querySelector('.pjdesc');
      ok(/^\d{4}年\d{1,2}月$/.test(descEl.textContent), 'w1 desc 为实时年月', descEl.textContent);
    }
    ok(real === want, tid + ' 待办数=' + want, '实得=' + real);
    if (tid === 'w5') {
      ok($('pjHead').querySelector('[data-score-cards]') !== null,
         'w5 头部只剩三块成绩卡（保留语数英成绩内容）', '有成绩卡');
      ok($('pjHead').querySelector('.pjname') === null,
         'w5 头部无「项目名称」进度头', '无 pjname');
      ok(pct === null, 'w5 头部无进度%', '实得无 %');
    } else {
      ok(pct && Number(pct[1]) === pctWant, tid + ' 里程碑进度=' + pctWant + '%', '实得=' + (pct ? pct[1] + '%' : '无'));
    }
  });


  console.log('\n=== 2c. 旺旺头部当月业绩实时回流（读订货明细，不读 KPI 表实际金额）===');
  tabs[2].click();
  const headTxt = $('pjHead').textContent.replace(/\s+/g, ' ');
  ok(headTxt.indexOf('当月订货') >= 0, '头部出现「当月订货」回流行', headTxt.slice(0, 200));
  ok(headTxt.indexOf('（订货明细实时汇总）') >= 0, '标注来源 = 订货明细实时汇总');
  const liveTxt = '¥' + liveAmt10.toLocaleString('zh-CN');
  ok(headTxt.indexOf(liveTxt) >= 0, '回流金额 = 10 月订货合计 ' + liveTxt, headTxt.slice(0, 200));
  ok(headTxt.indexOf('/ 目标 ¥600,000') >= 0, '目标取门槛/同期较高值 ¥600,000', headTxt.slice(0, 200));

  console.log('\n=== 3. 旺旺页三模块纵向铺开（信息录入 → 每日打卡 → 客户档案）===');
  tabs[2].click(); // w1
  ok($('wwBlocks') !== null && $('wwBlocks').style.display !== 'none', '三模块容器显示');
  const blockTitles = Array.from($('wwBlocks').querySelectorAll('h2')).map(h => h.textContent.trim());
  console.log('  板块顺序: ' + blockTitles.join(' → '));
  ok(blockTitles.length === 3, '三个板块', blockTitles.length);
  ok(blockTitles[0].indexOf('信息录入') === 0 && blockTitles[1].indexOf('每日打卡') === 0 && blockTitles[2].indexOf('客户档案') === 0,
     '顺序 = 信息录入 → 每日打卡 → 客户档案', blockTitles.join('|'));
  ok($('wwSub') === null, '子导航已移除');
  ok($('pjStats').querySelectorAll('.stat').length === 0, '指标卡已移除');
  ok($('dealerTb') === null, '经销商台账 DOM 已移除');
  ok($('pjTodoList').children.length > 0, '旺旺项目内待办已渲染', $('pjTodoList').children.length + ' 条');

  console.log('\n=== 3a. 信息录入块 ===');
  const ta = $('wwNoteBox').querySelector('textarea');
  ok(ta !== null, '录入框为 textarea');
  const noteRows = $('wwNoteBox').querySelectorAll('.ckrow');
  ok(noteRows.length === 3, '随手记 3 条', noteRows.length);
  ok($('wwNoteBox').textContent.indexOf('语音') >= 0, '含语音录入入口');
  ok($('wwNoteBox').textContent.indexOf('恒隆门店浪味仙排面') >= 0, '首条记录内容渲染');
  const noteAddBefore = calls.add;
  ta.value = '测试一条录入';
  const saveBtn = Array.from($('wwNoteBox').querySelectorAll('button')).filter(b => b.textContent === '保存')[0];
  ok(!!saveBtn, '保存按钮存在');
  saveBtn.click();
  console.log('\n=== 3a-2. 业务数据板块已取消 ===');
  ok(Array.from($('wwNoteBox').querySelectorAll('button')).filter(b => b.textContent === '业务数据').length === 0,
     '信息录入不再有「业务数据」模式按钮');
  ok($('bType') === null && $('bQty') === null, '业务数据表单已移除');
  ok($('wwNoteBox').querySelector('textarea') !== null, '随手记 textarea 常驻');
  console.log('\n=== 3a-3. 随手记意图识别（仅新增客户 + 查重）===');
  await wait350();          /* 排水：等之前保存触发的异步刷新落定 */
  tabs[2].click();

  const noteTA = () => $('wwNoteBox').querySelector('textarea');
  const confirmBtn = () => Array.from($('wwNoteBox').querySelectorAll('button')).filter(b => b.textContent === '确认写入')[0];

  /* 意图1：新增客户（新名称 → 写入客户档案表 + 一条修改日志） */
  noteTA().value = '新一个客户 苏州侦儿';
  noteTA().dispatchEvent(new win.Event('input'));
  await wait350();
  const intentCard1 = $('nIntent') ? $('nIntent').querySelector('input') : null;
  ok(intentCard1 !== null && intentCard1.value === '苏州侦儿', '识别「新增客户」并提取名称=苏州侦儿',
     intentCard1 ? intentCard1.value : '无卡片');
  const addBeforeCust = calls.add;
  const custOk = confirmBtn();
  ok(!!custOk, '新增客户确认卡出现');
  custOk.click();
  await wait350();
  ok(calls.add === addBeforeCust + 2, '确认写入触发两次写库（客户 + 日志）', 'add=' + calls.add);
  ok(calls.lastAdd.databaseId === 'X0WZ2bOXpqAHT5HEZjhMNS', '第二条写入 = 修改日志表', calls.lastAdd.databaseId);
  ok(calls.lastAdd.properties['动作'].select === '新增', '日志动作=新增');
  await wait350();

  /* 查重：已存在的客户再识别 → 拒绝写入 */
  noteTA().value = '新一个客户 苏州恒隆食品商贸';
  noteTA().dispatchEvent(new win.Event('input'));
  await wait350();
  const dupOk = confirmBtn();
  ok(!!dupOk, '重复客户也弹确认卡');
  const addBeforeDup = calls.add;
  dupOk.click();
  ok(calls.add === addBeforeDup, '重复客户被拒绝写入（查重生效）', 'add=' + calls.add);
  ok($('toast').textContent.indexOf('已存在') >= 0, '提示客户已存在', $('toast').textContent);
  await wait350();

  /* 订货/回款意图已取消：不再弹卡 */
  noteTA().value = '恒隆订货旺旺雪饼 30 箱 2040元';
  noteTA().dispatchEvent(new win.Event('input'));
  await wait350();
  ok(confirmBtn() === undefined, '订货文本不再识别（业务数据板块已取消）');

  /* 无意图文本不弹卡 */
  noteTA().value = '今天天气不错随便记一笔';
  noteTA().dispatchEvent(new win.Event('input'));
  await wait350();
  ok(confirmBtn() === undefined, '普通文本不弹确认卡');

  console.log('\n=== 3b. 每日打卡块 ===');


  const ckRows = $('wwCheckBox').querySelectorAll('.ckrow');
  ok(ckRows.length === 9, '打卡节点 9 个（含新增每日吃药）', ckRows.length);
  const ckTxt = $('wwCheckBox').textContent;
  ok(ckTxt.indexOf('8:30 前') >= 0 && ckTxt.indexOf('17:30 后') >= 0, '含首末时间节点');
  ok(ckTxt.indexOf('窗口期') >= 0, '库存录入标注窗口期');
  ok(/已完成 \d+ \/ 9/.test(ckTxt), '顶部「已完成 x / 9」', ckTxt.slice(0, 40));
  ok(/未完成 \d+ 项/.test(ckTxt), '顶部「未完成 n 项」', ckTxt.slice(0, 60));
  /* 每行都有明确的已完成 / 未完成状态 */
  const rowStateOk = Array.from(ckRows).every(r =>
    Array.from(r.querySelectorAll('.tag')).some(t => t.textContent === '已完成' || t.textContent === '未完成'));
  ok(rowStateOk, '每行都显示「已完成 / 未完成」状态');
  const recentRows = $('wwCheckBox').querySelectorAll('.rk');
  ok(recentRows.length === 5, '最近记录 5 天', recentRows.length);
  const before = calls.update + calls.add;
  ckRows[3].querySelector('button').click();
  ok(calls.update + calls.add === before + 1, '点击打卡触发一次写库',
     'update=' + calls.update + ' add=' + calls.add);
  /* 每日吃药：9:00 前，点击后有即时反馈（toast + 状态立刻变已完成） */
  await wait350();
  const dzEl = $('wwCheckBox').querySelector('[data-diag]');
  ok(!!dzEl, '存在环境自诊断行');
  ok(dzEl.textContent.indexOf('SDK 已连接') >= 0, '诊断行显示 SDK 已连接', dzEl.textContent);
  ok(dzEl.textContent.indexOf('今日记录：已存在') >= 0,
     '今日记录(ISO日期)被识别为已存在，不再重复新建', dzEl.textContent);
  const medRow = () => Array.from($('wwCheckBox').querySelectorAll('.ckrow'))
    .find(r => r.textContent.indexOf('每日吃药') >= 0);
  ok(!!medRow(), '存在「每日吃药」打卡项');
  ok(medRow().textContent.indexOf('9:00 前') >= 0, '吃药时间标注 = 9:00 前', medRow().textContent.slice(0, 30));
  ok(medRow().textContent.indexOf('未完成') >= 0, '未打卡时行内显示「未完成」');
  ok($('wwCheckBox').textContent.indexOf('今日还没有打卡记录') < 0,
     'ISO 日期（2026-10-12T00:00:00Z）的今日记录能被识别，不再每次新建一条');
  ok(/v\d+/.test($('wwCheckBox').textContent), '打卡区带版本戳（确认页面是新版）');
  const doneBefore = Number(($('wwCheckBox').textContent.match(/已完成 (\d+) \/ 9/) || [])[1] || -1);
  const medBefore = calls.update + calls.add;
  const upBefore2 = calls.update;
  medRow().querySelector('button').click();
  ok(calls.update === upBefore2 + 1, '今日有记录 → 走 updateRecord，不重复建记录',
     'update=' + calls.update + ' add=' + calls.add);
  ok(calls.update + calls.add === medBefore + 1, '点吃药触发一次写库',
     'update=' + calls.update + ' add=' + calls.add);
  ok($('toast').textContent.indexOf('已打卡：每日吃药') >= 0, '点击后有 toast 反馈', $('toast').textContent);
  ok(medRow().textContent.indexOf('已完成') >= 0, '乐观更新：行内立刻变「已完成」', medRow().textContent.slice(0, 40));
  ok(medRow().querySelector('button').className.indexOf('on') >= 0, '勾选框立刻点亮');
  const doneAfter = Number(($('wwCheckBox').textContent.match(/已完成 (\d+) \/ 9/) || [])[1] || -1);
  ok(doneAfter === doneBefore + 1, '顶部已完成计数 +1', doneBefore + ' → ' + doneAfter);
  await wait350();
  ok($('wwCheckBox').textContent.indexOf('已保存') >= 0, '保存成功后有常驻结果提示', $('wwCheckBox').textContent.slice(0, 60));
  /* 写库失败：必须有可见反馈 + 状态回滚 */
  const dbObj = win.__SMART_PAGE__.database;
  const origUpd = dbObj.updateRecord;
  dbObj.updateRecord = function () { return Promise.reject({ message: '模拟写库失败' }); };
  medRow().querySelector('button').click();
  await wait350();
  ok($('wwCheckBox').textContent.indexOf('没保存上') >= 0, '写库失败时打卡区出现可见反馈',
     $('wwCheckBox').textContent.slice(0, 120));
  ok($('wwCheckBox').textContent.indexOf('模拟写库失败') >= 0, '反馈里带真实错误信息（便于定位）');
  /* 这一下 next=false（乐观先变未完成），写库失败后必须回到点击前的「已完成」，不能停在乐观值 */
  ok(medRow().textContent.indexOf('已完成') >= 0, '写库失败后回滚到点击前状态（不停在乐观值）',
     medRow().textContent.slice(0, 40));
  dbObj.updateRecord = origUpd;
  /* 上面是故意模拟的写库失败，把它记的 console.error 从回归错误里剔除 */
  for (let i = errs.length - 1; i >= 0; i--) {
    if (errs[i].indexOf('[checkin] 写入失败') >= 0) errs.splice(i, 1);
  }
  await wait350();
  console.log('\n=== 3c. 客户档案明细块（按客户分组，十字段）===');
  const custTxt = $('wwCustBox').textContent;
  ok(custTxt.indexOf('订货明细') >= 0 || custTxt.indexOf('暂无订货记录') >= 0, '档案块含订货区');
  ok(custTxt.indexOf('渠道分布') >= 0, '渠道分布区块存在');
  ok(custTxt.indexOf('修改日志') >= 0, '修改日志区块存在');
  ok(custTxt.indexOf('测试日志甲') >= 0, '修改日志渲染历史记录');
  /* 客户档案明细 6 家（客户主表 2 家 + 订货/SKU 反推 5 家，取并集） */
  const profs = $('wwCustBox').querySelectorAll('.prof');
  ok(profs.length === 7, '档案明细块 7 家（6 家原始 + 随手记新增的苏州侦儿）', profs.length);
  /* 恒隆块：主数据 + 汇总 + 在售SKU + 订单小表 全字段 */
  const hlProf = Array.from(profs).find(p => p.textContent.indexOf('苏州恒隆食品商贸') >= 0);
  ok(!!hlProf, '恒隆档案块存在');
  const hlTxt = hlProf ? hlProf.textContent : '';
  ok(hlTxt.indexOf('商超') >= 0, '渠道=商超（主表读取）');
  ok(hlTxt.indexOf('周敏') >= 0, '联系人=周敏');
  ok(hlTxt.indexOf('13800001111') >= 0, '联系方式=13800001111');
  ok(hlTxt.indexOf('姑苏区恒润路12号') >= 0, '客户地址=姑苏区恒润路12号');
  ok(hlTxt.indexOf('订货笔数 5 笔') >= 0, '订货笔数=5（o1-o5）');
  ok(hlTxt.indexOf('订货数量 500 箱') >= 0, '订货数量=500 箱');
  ok(hlTxt.indexOf('订货金额') >= 0 && hlTxt.indexOf('39,760') >= 0, '订货金额=39,760');
  ok(hlTxt.indexOf('最近订货 2026-10-08') >= 0, '最近订货=2026-10-08');
  ok(hlTxt.indexOf('在售 5') >= 0, '在售SKU 5 个');
  ok(hlTxt.indexOf('旺旺雪饼') >= 0 && hlTxt.indexOf('浪味仙') >= 0, 'SKU名称 chips 含雪饼/浪味仙');
  ok(hlProf.querySelectorAll('tbody tr').length === 5, '恒隆订单明细 5 行', hlProf.querySelectorAll('tbody tr').length);
  const firstRow = hlProf.querySelector('tbody tr');
  ok(firstRow.children.length === 5, '订单小表五列（时间/SKU/数量/金额/渠道）', firstRow.children.length);
  /* 侦儿块：有主数据无订单 */
  const zeProf = Array.from(profs).find(p => p.textContent.indexOf('苏州侦儿食品') >= 0);
  ok(!!zeProf && zeProf.textContent.indexOf('暂无订货记录') >= 0, '侦儿块显示暂无订货记录');
  ok(zeProf.textContent.indexOf('星湖街99号') >= 0, '侦儿地址=星湖街99号');
  /* 常发块：无主数据 → 渠道未填兜底 */
  const cfProf = Array.from(profs).find(p => p.textContent.indexOf('苏州常发百货') >= 0);
  ok(cfProf.textContent.indexOf('渠道未填') >= 0, '无主数据客户显示渠道未填');
  ok(cfProf.textContent.indexOf('联系人：—') >= 0, '无主数据客户联系人显示 —');

  console.log('\n=== 3d. 客户档案行内编辑：产品联想 / +增行 / 重复校验 / 日志 ===');
  await wait350();
  tabs[2].click();
  /* SKU 联想 datalist */
  const dl = $('skuNameList');
  ok(dl !== null && Array.from(dl.options).length >= 10, 'SKU 联想数据源已生成', dl ? dl.options.length : 0);
  ok(Array.from(dl.options).some(o => o.value === '旺旺雪饼'), '联想含旺旺雪饼');
  /* 打开编辑面板 */
  const hlProf2 = Array.from($('wwCustBox').querySelectorAll('.prof')).find(p => p.textContent.indexOf('苏州恒隆食品商贸') >= 0);
  const editBtn = Array.from(hlProf2.querySelectorAll('button')).filter(b => b.textContent === '编辑')[0];
  ok(!!editBtn, '编辑按钮存在');
  editBtn.click();
  const freshProf = () => Array.from($('wwCustBox').querySelectorAll('.prof')).find(p => p.textContent.indexOf('苏州恒隆食品商贸') >= 0);
  const panel = freshProf();
  const mkInputs = Array.from(panel.querySelectorAll('[data-mk]'));
  ok(mkInputs.length === 4, '主数据 4 个可改字段（联系人/联系方式/地址/渠道）', mkInputs.length);
  const rowEls = Array.from(panel.querySelectorAll('[data-rk="sku"]'));
  ok(rowEls.length === 1, '订货录入默认 1 行', rowEls.length);
  /* + 增行 */
  const addRow = Array.from(panel.querySelectorAll('button')).filter(b => b.textContent === '+ 增加一行')[0];
  ok(!!addRow, '+ 增行按钮存在');
  addRow.click();
  const panel2 = freshProf();
  ok(panel2.querySelectorAll('[data-rk="sku"]').length === 2, '点 + 后变 2 行', panel2.querySelectorAll('[data-rk="sku"]').length);
  /* 填两行：第二行故意与历史 o4（浪味仙 60 箱 3120）重复 */
  const skuInputs = panel2.querySelectorAll('[data-rk="sku"]');
  const qtyInputs = panel2.querySelectorAll('[data-rk="qty"]');
  const amtInputs = panel2.querySelectorAll('[data-rk="amt"]');
  skuInputs[0].value = '旺旺雪饼'; qtyInputs[0].value = '30'; amtInputs[0].value = '2040';
  skuInputs[1].value = '浪味仙';   qtyInputs[1].value = '60'; amtInputs[1].value = '3120';
  const saveEdit = Array.from(panel2.querySelectorAll('button')).filter(b => b.textContent === '保存修改与订货')[0];
  ok(!!saveEdit, '保存按钮存在');
  const addBeforeEdit = calls.add;
  saveEdit.click();
  ok(calls.add === addBeforeEdit, '重复校验拦截：未写入', 'add=' + calls.add);
  ok($('toast').textContent.indexOf('重复') >= 0, '提示发现重复', $('toast').textContent);
  await wait350();
  /* 二次确认 → 强制保存：2 笔订货 + 1 条日志 */
  const panel3 = Array.from($('wwCustBox').querySelectorAll('.prof')).find(p => p.textContent.indexOf('苏州恒隆食品商贸') >= 0);
  const forceBtn = Array.from(panel3.querySelectorAll('button')).filter(b => b.textContent === '仍要保存')[0];
  ok(!!forceBtn, '出现「仍要保存」二次确认按钮');
  forceBtn.click();
  ok(calls.add === addBeforeEdit + 3, '强制保存写入 3 次（2 订货 + 1 日志）', 'add=' + calls.add);
  const orderWrite = calls.adds ? calls.adds[calls.adds.length - 3] : null;
  const logWrite = calls.lastAdd || {};
  ok(logWrite.databaseId === 'X0WZ2bOXpqAHT5HEZjhMNS', '末次写入 = 修改日志表', logWrite.databaseId);
  ok(logWrite.properties['内容'] && logWrite.properties['内容'].text.indexOf('录入订货 2 笔') >= 0, '日志内容=录入订货 2 笔', logWrite.properties['内容'].text);
  await wait350();
  /* 侦儿块：改主数据（无订单） → updateRecord + 日志 */
  const zeProf2 = Array.from($('wwCustBox').querySelectorAll('.prof')).find(p => p.textContent.indexOf('苏州侦儿食品') >= 0);
  Array.from(zeProf2.querySelectorAll('button')).filter(b => b.textContent === '编辑')[0].click();
  const zePanel = Array.from($('wwCustBox').querySelectorAll('.prof')).find(p => p.textContent.indexOf('苏州侦儿食品') >= 0);
  const updBefore = calls.update;
  const mkName = zePanel.querySelector('[data-mk="联系人"]');
  mkName.value = '侦儿老板';
  Array.from(zePanel.querySelectorAll('button')).filter(b => b.textContent === '保存修改与订货')[0].click();
  ok(calls.update === updBefore + 1, '主数据修改触发一次 updateRecord', 'update=' + calls.update);
  ok(calls.lastAdd.databaseId === 'X0WZ2bOXpqAHT5HEZjhMNS', '修改也写日志', calls.lastAdd.databaseId);
  await wait350();

  console.log('\n=== 3d-2. 录入体验：选产品自动带规格 / 参考价，金额 = 数量 × 参考价 ===');
  tabs[2].click();
  await wait350();
  const fire = (elm, type) => elm.dispatchEvent(new win.Event(type || 'input', { bubbles: true }));
  const profHl = () => Array.from($('wwCustBox').querySelectorAll('.prof'))
    .find(p => p.textContent.indexOf('苏州恒隆食品商贸') >= 0);
  Array.from(profHl().querySelectorAll('button')).filter(b => b.textContent === '编辑')[0].click();
  const p4 = profHl();
  const sk = p4.querySelector('[data-rk="sku"]');
  const qt = p4.querySelector('[data-rk="qty"]');
  const am = p4.querySelector('[data-rk="amt"]');
  const hintOf = () => {
    const h = Array.from(p4.querySelectorAll('.sub'))
      .filter(s => s.textContent.indexOf('规格') >= 0 || s.textContent.indexOf('参考价') >= 0)[0];
    return h ? h.textContent : '';
  };
  /* 1) 选有规格、无历史价的产品 → 只带规格 */
  sk.value = 'SKU1'; fire(sk);
  ok(hintOf().indexOf('规格 84g×24包') >= 0, '选产品带出规格（SKU1 → 84g×24包）', hintOf());
  /* 2) 选有历史价的产品 → 带参考价，金额随数量自动算 */
  sk.value = '旺旺雪饼'; fire(sk);
  ok(hintOf().indexOf('参考价 ¥68/箱') >= 0, '选产品带出参考价（旺旺雪饼 ¥68/箱）', hintOf());
  qt.value = '4'; fire(qt);
  ok(am.value === '272', '金额 = 4 箱 × ¥68 = 272（自动预填）', am.value);
  qt.value = '10'; fire(qt);
  ok(am.value === '680', '改数量后金额自动重算 = 680', am.value);
  /* 3) 手动改过金额 → 不再被覆盖 */
  am.value = '999'; fire(am);
  qt.value = '20'; fire(qt);
  ok(am.value === '999', '手动改过金额后不再自动覆盖', am.value);
  /* 4) 未知产品 → 不报错、无提示 */
  sk.value = '一个没卖过的产品'; fire(sk);
  ok(hintOf() === '', '未知产品不显示规格/参考价', JSON.stringify(hintOf()));

  console.log('\n=== 3d-3. 客户档案内嵌该客户修改历史 + 全局日志按客户过滤 ===');
  tabs[2].click();
  await wait350();
  const hlProf4 = profHl();
  const histTitle = Array.from(hlProf4.querySelectorAll('.sub')).filter(s => s.textContent.indexOf('修改历史') >= 0)[0];
  ok(!!histTitle, '恒隆块内出现「修改历史」小标题', histTitle ? histTitle.textContent : '无');
  ok(histTitle && histTitle.textContent.indexOf('修改历史 2 条') >= 0, '条数 = 2（夹具 1 条 + 3d 编辑写入 1 条）', histTitle && histTitle.textContent);
  ok(histTitle && histTitle.textContent.indexOf('展开全部') < 0, '≤3 条不显示展开按钮', histTitle && histTitle.textContent);
  ok(hlProf4.textContent.indexOf('测试日志甲') >= 0, '块内显示该客户日志内容');
  ok(hlProf4.textContent.indexOf('录入订货 2 笔') >= 0, '块内显示 3d 编辑写入的订货日志');
  ok(hlProf4.textContent.indexOf('测试日志乙') < 0, '块内不含其他客户（侦儿）的日志');
  /* 全局日志区随客户下拉过滤 */
  const custSel = $('wwCustBox').querySelector('select');
  custSel.value = '苏州侦儿食品'; fire(custSel, 'change');
  await wait350();
  const secTitles = Array.from($('wwCustBox').querySelectorAll('.sec')).map(s => s.textContent);
  const logSec = secTitles.filter(t => t.indexOf('修改日志') >= 0)[0] || '';
  ok(logSec.indexOf('苏州侦儿食品') >= 0, '全局日志标题带当前客户', logSec);
  ok($('wwCustBox').textContent.indexOf('测试日志甲') < 0, '过滤后不再显示恒隆日志');
  custSel.value = ''; fire(custSel, 'change');
  await wait350();

  console.log('\n=== 3e. 孩子作业（辅导记录 + 错题本）===');




  tabs[6].click();
  const w5Cards = $('pjStats').querySelectorAll('.stat');
  ok(w5Cards.length === 6, 'w5 指标卡 6 个', w5Cards.length);
  const w5Txt = Array.from(w5Cards).map(c => c.querySelector('.k').textContent + '=' + c.querySelector('.v').textContent).join(' | ');
  console.log('  指标: ' + w5Txt);
  ok(w5Txt.indexOf('7 次') >= 0, '辅导次数 = 7 次');
  ok(w5Txt.indexOf('127 分钟') >= 0, '累计时长 = 127 分钟（25+15+20+12+18+22+15）');
  ok(w5Txt.indexOf('8 道') >= 0, '错题总数 = 8 道');
  ok(w5Txt.indexOf('2 道') >= 0, '待订正 = 2 道');
  ok(w5Txt.indexOf('75%') >= 0, '订正率 = 75%（6/8）');
  ok(w5Txt.indexOf('1 次') >= 0, '需加强 = 1 次');
  const hwTxt = $('pjStatBox').textContent;
  ok(hwTxt.indexOf('最近辅导') >= 0 && hwTxt.indexOf('错题本') >= 0, '信息区含辅导与错题两块');
  ok(hwTxt.indexOf('科目分布') >= 0 && hwTxt.indexOf('错误类型分布') >= 0, '含两个分布图');
  const hwRows = $('pjStatBox').querySelectorAll('.ckrow');
  ok(hwRows.length === 14, '辅导 6 条 + 错题 8 条 = 14 行', hwRows.length);

  console.log('\n=== 3e-2. W5 头部三块科目成绩卡 ===');
  const scWrap = $('pjHead').querySelector('[data-score-cards]');
  ok(!!scWrap, 'W5 头部渲染成绩卡容器');
  const scCards = $('pjHead').querySelectorAll('.sc3 .sc');
  ok(scCards.length === 3, '成绩卡 3 块（语/数/英）', scCards.length);
  const scTxt = Array.from(scCards).map(c => c.textContent.replace(/\s+/g, ' ')).join(' || ');
  console.log('  成绩卡: ' + scTxt);
  ok(scTxt.indexOf('语文') >= 0 && scTxt.indexOf('数学') >= 0 && scTxt.indexOf('英语') >= 0, '三块分别标注科目');
  ok(scTxt.indexOf('88 分') >= 0 && scTxt.indexOf('三上 第二单元测验') >= 0, '语文卡默认显示最后一次录入（88 分）');
  ok(scTxt.indexOf('96 分') >= 0, '数学卡默认显示最后一次录入（96 分，10-11 最新）');
  ok(scTxt.indexOf('78 分') >= 0 && scTxt.indexOf('Unit3') >= 0, '英语卡显示 Unit3 78 分');
  ok(scTxt.indexOf('共 2 条') >= 0, '语文卡标注「共 2 条」');

  console.log('\n=== 3e-3. 成绩浮窗（历史 + 录入 + 关闭）===');
  const yuCard = Array.from(scCards).filter(c => c.getAttribute('data-sub') === '语文')[0];
  ok(!!yuCard, '语文卡可定位');
  yuCard.click();
  const mask = $('scoreMask');
  ok(mask.classList.contains('on'), '点击成绩卡 → 浮窗打开');
  const mdlTxt = $('scoreMdl').textContent;
  ok(mdlTxt.indexOf('语文 · 全部成绩') >= 0, '浮窗标题带科目');
  const srows = $('scoreMdl').querySelectorAll('.srow');
  ok(srows.length === 2, '浮窗历史列表 2 条（倒序）', srows.length);
  ok(srows[0].textContent.indexOf('88') >= 0 && srows[0].textContent.indexOf('三上 第二单元测验') >= 0,
     '列表第一条 = 最新（88 分）');
  ok(srows[1].textContent.indexOf('92') >= 0 && srows[1].textContent.indexOf('三上 第一单元测验') >= 0,
     '列表第二条 = 旧成绩（92 分）');
  ok(mdlTxt.indexOf('历史成绩') >= 0 && mdlTxt.indexOf('录入新成绩') >= 0, '浮窗含历史区与录入区');
  const scForm = $('scoreMdl').querySelector('[data-score-form]');
  ok(!!scForm, '浮窗含录入表单');
  ok(!!scForm.querySelector('#scName') && !!scForm.querySelector('#scVal') && !!scForm.querySelector('#scDate'),
     '表单含名称/成绩/日期');

  /* 录入新成绩 → 写库 + 浮窗保持打开 + 列表变 3 条 */
  const addBeforeSc = calls.add;
  scForm.querySelector('#scName').value = '三上 第三单元测验';
  scForm.querySelector('#scVal').value = '95';
  scForm.querySelector('#scMemo').value = '阅读理解进步';
  scForm.dispatchEvent(new win.Event('submit', { cancelable: true }));
  await wait350();
  ok(calls.add === addBeforeSc + 1, '保存成绩触发一次 addRecord', 'add=' + calls.add);
  ok(calls.lastAdd.databaseId === 'YoQVogNYLTo7jyDH5aULAv', '写入学科成绩表', calls.lastAdd.databaseId);
  ok(calls.lastAdd.properties['科目'].select === '语文', '科目字段 = select 语文');
  ok(calls.lastAdd.properties['名称'].text === '三上 第三单元测验', '名称字段正确');
  ok(calls.lastAdd.properties['成绩'].number === 95, '成绩字段 = number 95');
  ok(!!calls.lastAdd.properties['日期'].date, '日期字段有值', calls.lastAdd.properties['日期'].date);
  ok(calls.lastAdd.properties['备注'] && calls.lastAdd.properties['备注'].text === '阅读理解进步', '备注字段正确');
  ok(mask.classList.contains('on'), '保存后浮窗保持打开（可继续查看历史）');
  ok($('scoreMdl').querySelectorAll('.srow').length === 3, '保存后历史列表 3 条',
     $('scoreMdl').querySelectorAll('.srow').length);
  ok($('scoreMdl').textContent.indexOf('95') >= 0, '新成绩 95 出现在列表');

  /* 点遮罩空白 → 关闭 */
  mask.click();
  ok(!mask.classList.contains('on'), '点遮罩空白 → 浮窗关闭');

  /* ESC → 关闭（重新打开再测） */
  yuCard.click();
  ok(mask.classList.contains('on'), '再次打开浮窗');
  win.document.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape' }));
  ok(!mask.classList.contains('on'), '按 Escape → 浮窗关闭');

  tabs[2].click();

  console.log('\n=== 5. 空数据不崩 ===');
  DB['cHPTKdlZZXnjPrU1Y9C9FS'] = [];
  DB['1gQHCbHHyZIFJDGIrzyWrJ'] = [];
  DB['JTZew6TvIp5hG4EKe71u5L'] = [];
  DB['PouGOpqFGDOBIEayNHdayk'] = [];
  DB['2bxBhhbZrbFGfZORlNNkE7'] = [];
  DB['X0WZ2bOXpqAHT5HEZjhMNS'] = [];
  DB['YoQVogNYLTo7jyDH5aULAv'] = [];
  try {
    win.document.getElementById('tabs').querySelectorAll('button')[2].click();
    setTimeout(function () {
      ok(errs.length === 0, '空数据下无 console 错误', errs.join(' ;; ') || '无');
      offlineTest();
    }, 60);
  } catch (e) {
    ok(false, '空数据 refreshAll 抛错', e.message);
    console.log('\n1 项失败');
    process.exit(1);
  }
}, 120);

/* ===== 离线模式回归：无 SDK（本地预览）时确认写入不静默 ===== */
function offlineTest() {
  console.log('\n=== 6. 离线模式（无 SDK 预览环境）===');
  const dom2 = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://localhost/' });
  const win2 = dom2.window;
  /* 故意不注入 __SMART_PAGE__ */
  const errs2 = [];
  win2.addEventListener('error', e => errs2.push(e.message));
  const oe2 = win2.console.error;
  win2.console.error = (...a) => { errs2.push(a.map(String).join(' ')); oe2.apply(null, a); };
  const _b2 = Array.from(html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)).map(x => x[1]);
  win2.eval(_b2.filter(b => b.indexOf('var LINES') >= 0)[0]);
  setTimeout(function () {
    const $2 = id => win2.document.getElementById(id);
    const tabs2 = $2('tabs').querySelectorAll('button');
    tabs2[2].click();
    const ta2 = $2('wwNoteBox').querySelector('textarea');
    ok(!!ta2, '离线模式录入框渲染');
    ta2.value = '新一个客户 苏州侦儿';
    ta2.dispatchEvent(new win2.Event('input'));
    setTimeout(function () {
      const okBtn = Array.from($2('wwNoteBox').querySelectorAll('button')).filter(b => b.textContent === '确认写入')[0];
      ok(!!okBtn, '离线模式识别卡出现');
      if (okBtn) okBtn.click();
      setTimeout(function () {
        const toastTxt = $2('toast').textContent;
        ok(toastTxt.indexOf('离线') >= 0, '离线写入有明确提示', toastTxt);
        const saved = JSON.parse(win2.localStorage.getItem('ww_want_cust') || 'null') || [];
        const hit = saved.some(r => r['客户名称'] === '苏州侦儿');
        ok(hit, '离线数据落 localStorage（cust）', JSON.stringify(saved).slice(0, 80));
        /* ---- SDK 延迟注入：验证离线自愈，不用刷新页面 ---- */
        console.log('\n=== 6b. SDK 延迟注入自愈 ===');
        tabs2[2].click(); // 切到旺旺膨化页
        const dzEl2 = $2('wwCheckBox').querySelector('[data-diag]');
        ok(!!dzEl2, '离线：打卡区有自诊断行');
        ok(dzEl2.textContent.indexOf('__SMART_PAGE__ 不存在') >= 0,
           '离线诊断说清 SDK 未挂载（不是笼统的「离线」）', dzEl2 && dzEl2.textContent);
        const rb2 = Array.from($2('wwCheckBox').querySelectorAll('button'))
          .filter(b => b.textContent === '立即重连')[0];
        ok(!!rb2, '离线时出现「立即重连」按钮');
        const pb2 = Array.from($2('wwCheckBox').querySelectorAll('button'))
          .filter(b => b.textContent === '深度诊断')[0];
        ok(!!pb2, '离线时出现「深度诊断」按钮');
        pb2.click();
        const probe2 = $2('wwCheckBox').querySelector('[data-probe]');
        ok(!!probe2, '深度诊断结果常驻显示（不靠 toast 一闪而过）');
        ok(probe2.textContent.indexOf('容器：独立窗口') >= 0
           || probe2.textContent.indexOf('容器：内嵌') >= 0, '诊断能区分容器形态', probe2.textContent);
        ok(/^地址：/.test(probe2.textContent), '诊断第一项就是当前地址（定位打开方式）', probe2.textContent);
        ok(probe2.textContent.indexOf('协议：') >= 0, '诊断含协议（file: 说明是本地文件）', probe2.textContent);
        ok(probe2.textContent.indexOf('__SMART_PAGE__：未挂载') >= 0,
           '诊断明确 __SMART_PAGE__ 未挂载', probe2.textContent);
        /* 注入脚本在不在页面里，取决于被测文件：本地源文件无 inject.js 标签（页面里找不到），
           线上副本带平台注入的 inject.js 标签（已在页面中）——两种都要能正确区分。
           注意：页面自身探测代码里也含 'page_comm/inject.js' 字面量，
           必须匹配 <script src=...> 标签才算数，不能裸 indexOf。 */
        const hasInjectTag = /<script[^>]+src="[^"]*page_comm\/inject\.js"/.test(html);
        ok(hasInjectTag
             ? probe2.textContent.indexOf('注入脚本：已在页面中') >= 0
             : probe2.textContent.indexOf('页面里找不到') >= 0,
           '诊断能区分注入脚本在不在页面中（排除脚本加载失败）', probe2.textContent);
        /* 模拟平台 SDK 晚到：此刻才注入 */
        win2.__SMART_PAGE__ = { database: win.__SMART_PAGE__.database };
        win2.WORKMIN_CONFIG = REAL_CFG;
        rb2.click();
        setTimeout(function () {
          ok(/连上数据表/.test($2('toast').textContent),
             '重连后自动恢复并提示（无需刷新页面）', $2('toast').textContent);
          const dz3 = $2('wwCheckBox').querySelector('[data-diag]');
          ok(dz3 && dz3.textContent.indexOf('SDK 已连接') >= 0,
             '重连后诊断行转为 SDK 已连接', dz3 && dz3.textContent);
          ok(errs2.length === 0, '离线模式运行期零错误', errs2.join(' ;; ') || '无');
          fileBannerTest();
        }, 1200);
      }, 400);
    }, 400);
  }, 400);
}

/* ===== 6c. 本地文件防呆横幅（file:// 打开时 SDK 永远不存在） ===== */
function fileBannerTest() {
  console.log('\n=== 6c. 本地文件打开（file://）防呆 ===');
  const dom3 = new JSDOM(html, {
    runScripts: 'outside-only', pretendToBeVisual: true,
    url: 'file:///C:/Users/10061/WorkBuddy/2026-10-09-18-10-10/workbench/index.html'
  });
  const win3 = dom3.window;
  const errs3 = [];
  win3.addEventListener('error', e => errs3.push(e.message));
  const _b3 = Array.from(html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)).map(x => x[1]);
  win3.eval(_b3.filter(b => b.indexOf('var LINES') >= 0)[0]);
  setTimeout(function () {
    const $3 = id => win3.document.getElementById(id);
    const banner = win3.document.querySelector('[data-file-banner]');
    ok(!!banner, 'file:// 打开时出现红色警示横幅');
    ok(banner && banner.textContent.indexOf('本地文件') >= 0
       && banner.textContent.indexOf('不会同步到云端') >= 0,
       '横幅文案点明「本地文件 + 不同步云端」', banner && banner.textContent);
    const goBtn = banner && Array.from(banner.querySelectorAll('button'))
      .filter(b => b.textContent === '打开在线版本')[0];
    ok(!!goBtn, '横幅带「打开在线版本」按钮');
    ok(win3.document.body.style.paddingTop === '52px', '横幅不遮挡内容（body 已下移）');
    ok(errs3.length === 0, '横幅场景运行期零错误', errs3.join(' ;; ') || '无');
    console.log('\n=== 7. 全程错误汇总 ===');
    ok(errs.length === 0 && errs3.length === 0,
       '运行期零错误', (errs.concat(errs3)).join(' ;; ') || '无');
    cssCoverageCheck();
  }, 400);
}

/* ===== CSS 覆盖自检：脚本里 el() 用的每个字面量 class，style 块里必须有对应规则 =====
   防「补丁只同步主脚本、style 块掉队」——v26 上线后发现线上缺 .sc3/.mask/.prof 三类样式的根因防护。 */
function cssCoverageCheck() {
  console.log('\n=== 8. CSS 覆盖自检（脚本 class vs style 块）===');
  const script = (html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [])
    .map(b => b.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, ''))
    .filter(b => b.indexOf('var LINES') >= 0)[0] || '';
  const styleM = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  ok(!!styleM, '页面存在 <style> 块');
  if (!styleM) { console.log('\n' + (fail === 0 ? 'ALL PASS' : fail + ' 项失败')); process.exit(fail === 0 ? 0 : 1); }
  const style = styleM[1];
  const classes = new Set();
  const re1 = /el\(\s*'[a-zA-Z0-9]+'\s*,\s*'([^']+)'/g;
  let m;
  while ((m = re1.exec(script))) m[1].split(/\s+/).forEach(c => c && classes.add(c));
  const re2 = /setAttribute\('class'\s*,\s*'([^']+)'\)/g;
  while ((m = re2.exec(script))) m[1].split(/\s+/).forEach(c => c && classes.add(c));
  /* 已知动态前缀（'b-'+序号 之类），非完整 class 名 */
  const dynamic = ['b-'];
  const missing = Array.from(classes).filter(c => dynamic.indexOf(c) < 0
    && !new RegExp('\\.' + c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])').test(style));
  ok(classes.size >= 40, '提取到足量字面量 class（' + classes.size + ' 个）', classes.size);
  ok(missing.length === 0, '所有字面量 class 在 style 块中都有规则',
     missing.length ? '缺失: ' + missing.join(',') : '无缺失');
  /* 关键样式类必须存在（防整体掉队） */
  ['sc3', 'mask', 'mdl', 'srow', 'mform', 'prof', 'toast', 'ckrow', 'stat'].forEach(function (c) {
    ok(style.indexOf('.' + c) >= 0, 'style 块含关键类 .' + c);
  });
  console.log('\n' + (fail === 0 ? 'ALL PASS' : fail + ' 项失败'));
  process.exit(fail === 0 ? 0 : 1);
}
