export const TEAM_LIST = [
    {
        name: "哥布林東佑",
        members: ["古竣丞", "呂文傑", "王冠弘", "倪易得", "鄭晁霖", "林韋丞", "張文睿", "林東佑", "傅聖翔", "官祐丞", "官宜萱", "鄭皓宇", "黃瀞玄"]
    },
    {
        name: "ㄨㄟㄦˇㄅㄤ",
        members: ["林彥廷", "林子旭", "林良黛", "陳信縊", "李興彥", "李育豈", "謝佳宇"]
    },
    {
        name: "惡龍咆哮",
        members: ["賴子程", "張駿宥", "吳軒辰", "施永峯", "施永敬", "郭彥壽", "邱宇安", "洪長璟"]
    },
    {
        name: "也就這樣",
        members: ["陳永濬", "李浚劭", "潘廷瑋", "陳業勝", "吳冠宜", "徐裕凱"]
    },
    {
        name: "狗才打欄中",
        members: ["王韋中", "蘇桓均", "王博毅", "侯天皓", "張家苰", "周辰諺", "鄭睦融"]
    },
    {
        name: "AMA 早午餐",
        members: ["李丞奕", "李庭文", "蘇育弘", "林旻鋒", "王翔", "凃奇恩", "吳宇峻", "黃偉哲", "徐立榮", "蘇峻豪", "陳紹松"]
    },
    {
        name: "靠臉吃飯",
        members: ["陳致瑋", "林蘶峰", "洪維駿", "李雅婷", "董偉蓉", "王暄閔", "陳俊錡", "潘俊廷", "林欣儀"]
    }
];

export const MATCH_SCHEDULE = [
  // 10:00 預賽
  { id: 1, time: "10:00-10:50", court: "場A", type: "預賽 (A組)", teamA: "惡龍咆哮", teamB: "也就這樣", referee: "狗才打欄中" },
  { id: 2, time: "10:00-10:50", court: "場B", type: "預賽 (A組)", teamA: "靠臉吃飯", teamB: "AMA早午餐", referee: "哥布林東佑" },
  
  // 10:50 預賽 (原M4移走，此時段僅剩一場)
  { id: 3, time: "10:50-11:40", court: "場A", type: "預賽 (B組)", teamA: "哥布林東佑", teamB: "狗才打欄中", referee: "靠臉吃飯" },
  
  // 11:40 預賽 (編號往前遞補)
  { id: 4, time: "11:40-12:30", court: "場A", type: "預賽 (A組)", teamA: "惡龍咆哮", teamB: "AMA早午餐", referee: "ㄨㄟㄦˇㄅㄤ" },
  { id: 5, time: "11:40-12:30", court: "場B", type: "預賽 (A組)", teamA: "靠臉吃飯", teamB: "也就這樣", referee: "狗才打欄中" },
  
  // 12:30 預賽
  { id: 6, time: "12:30-13:20", court: "場A", type: "預賽 (B組)", teamA: "哥布林東佑", teamB: "ㄨㄟㄦˇㄅㄤ", referee: "靠臉吃飯" },
  { id: 7, time: "12:30-13:20", court: "場B", type: "預賽 (A組)", teamA: "AMA早午餐", teamB: "也就這樣", referee: "惡龍咆哮" },
  
  // 13:20 預賽 (包含剛移到下午的賽程)
  { id: 8, time: "13:20-14:10", court: "場A", type: "預賽 (A組)", teamA: "惡龍咆哮", teamB: "靠臉吃飯", referee: "AMA早午餐" },
  { id: 9, time: "13:20-14:10", court: "場B", type: "預賽 (B組)", teamA: "狗才打欄中", teamB: "ㄨㄟㄦˇㄅㄤ", referee: "AMA早午餐" }, // 這是原本的 M4
  
  // 14:10 複賽 (六強) - 以下維持不變
  { id: 10, time: "14:10-15:00", court: "場A", type: "六強賽", teamA: "B組第二", teamB: "A組第三", referee: "B組第一" },
  { id: 11, time: "14:10-15:00", court: "場B", type: "六強賽", teamA: "B組第三", teamB: "A組第二", referee: "A組第一" },
  
  // 15:00 四強賽
  { id: 12, time: "15:00-16:00", court: "場A", type: "四強賽", teamA: "A組第一", teamB: "第10場勝隊", referee: "第11場敗隊" },
  { id: 13, time: "15:00-16:00", court: "場B", type: "四強賽", teamA: "B組第一", teamB: "第11場勝隊", referee: "第10場敗隊" },
  
  // 16:00 決賽
  { id: 14, time: "16:00-17:00", court: "場A", type: "冠亞軍賽", teamA: "第12場勝隊", teamB: "第13場勝隊", referee: "第11場敗隊 (若主辦未晉級由主辦執法)" },
  { id: 15, time: "16:00-17:00", court: "場B", type: "季殿軍賽", teamA: "第12場敗隊", teamB: "第13場敗隊", referee: "第10場敗隊 (若主辦未晉級由主辦執法)" }
];

export const GROUPS = {
    A: ["惡龍咆哮", "也就這樣", "靠臉吃飯", "AMA早午餐"],
    B: ["哥布林東佑", "狗才打欄中", "ㄨㄟㄦˇㄅㄤ"]
};
