export const TEAM_LIST = [
    {
        name: "小魔女抖瑞咪-大同女排",
        members: ["林怡辰", "李佳穎", "陳婕恩", "林恩伃", "周芙榛", "蘇子涵", "張育綺"],
        coach: "高麗婷",
    },
    {
        name: "魔人啾啾",
        members: ["王于綺", "王晴韻", "董偉蓉", "傅俐蓉", "曾慶宇", "劉慧筠", "李雅婷", "吳佩容", "謝秀蘭"],
    },
    {
        name: "OK炒意麵",
        members: ["傅思敏", "許庭瑜", "陳玉萍", "郭水月", "許倢瑈", "黃珍燕"],
    },
    { name: "屏大幼教", members: [], note: "資料待補" },
    { name: "屏東女中", members: [], note: "資料待補" },
    { name: "屏科休運", members: [], note: "資料待補" },
    {
        name: "兜不住喜",
        members: ["賴子程", "郭彥壽", "張駿宥", "吳軒辰", "施永峯", "施永敬", "唐飛"],
    },
    {
        name: "ㄨㄟㄦˇㄅㄤ",
        members: ["林子旭", "陳信縊", "李育豈", "李興彦", "林彥廷", "林立"],
    },
    {
        name: "AMA早午餐",
        members: ["李丞奕", "李庭文", "林旻鋒", "吳宇峻", "蘇峻豪", "徐立榮", "蘇育弘", "黃偉哲"],
    },
    {
        name: "哥布林東佑",
        members: ["古竣丞", "倪易得", "王冠弘", "呂文傑", "許智傑", "鄭晁霖", "林韋丞"],
    },
    {
        name: "靠臉吃飯",
        members: ["陳致瑋", "林蘶峰", "涂奇恩", "陳紹淞", "陳俊錡", "蔡家駿", "潘俊廷"],
        coach: "王暄閔",
    },
    {
        name: "我米蟲拉",
        members: ["蘇桓均", "王韋中", "王博毅", "侯天皓", "周辰諺", "陳恩", "陳冠儒", "陳智遠", "陳竣崴"],
    },
    {
        name: "第酒屆笑友",
        members: ["張仡迪", "李俊佑", "林俊光", "林俊曲", "林士瑋", "蕭佩綺"],
    },
];

export const MATCH_SCHEDULE = [
    { id: 1, time: "09:00", teamA: "小魔女抖瑞咪-大同女排", teamB: "OK炒意麵", referee: "屏東女中" },
    { id: 2, time: "10:00", teamA: "屏東女中", teamB: "魔人啾啾", referee: "屏科休運" },
    { id: 3, time: "11:00", teamA: "屏科休運", teamB: "OK炒意麵", referee: "屏大幼教" },
    { id: 4, time: "12:00", teamA: "魔人啾啾", teamB: "屏大幼教", referee: "OK炒意麵" },
    { id: 5, time: "13:00", teamA: "小魔女抖瑞咪-大同女排", teamB: "屏科休運", referee: "魔人啾啾" },
    { id: 6, time: "14:00", teamA: "屏東女中", teamB: "屏大幼教", referee: "小魔女抖瑞咪-大同女排" },
    { id: 7, time: "15:00", teamA: "B2", teamB: "A3", referee: "A1" },
    { id: 8, time: "16:00", teamA: "A2", teamB: "B3", referee: "B1" },
    { id: 9, time: "17:00", teamA: "A1", teamB: "7場勝", referee: "7場敗" },
    { id: 10, time: "18:00", teamA: "B1", teamB: "8場勝", referee: "8場敗" },
    { id: 11, time: "19:00", teamA: "9場敗", teamB: "10場敗", referee: "9場勝+10場勝" },
    { id: 12, time: "20:00", teamA: "9場勝", teamB: "10場勝", referee: "9場敗+10場敗" },
    // Day 2 or second group? The original list continued.
    { id: 13, time: "09:00", teamA: "兜不住喜", teamB: "AMA早午餐", referee: "ㄨㄟㄦˇㄅㄤ" },
    { id: 14, time: "10:00", teamA: "第酒屆笑友", teamB: "ㄨㄟㄦˇㄅㄤ", referee: "兜不住喜" },
    { id: 15, time: "11:00", teamA: "AMA早午餐", teamB: "我米蟲拉", referee: "哥布林東佑" },
    { id: 16, time: "12:00", teamA: "兜不住喜", teamB: "靠臉吃飯", referee: "AMA早午餐" },
    { id: 17, time: "13:00", teamA: "ㄨㄟㄦˇㄅㄤ", teamB: "哥布林東佑", referee: "我米蟲拉" },
    { id: 18, time: "14:00", teamA: "靠臉吃飯", teamB: "AMA早午餐", referee: "第酒屆笑友" },
    { id: 19, time: "15:00", teamA: "兜不住喜", teamB: "我米蟲拉", referee: "靠臉吃飯" },
    { id: 20, time: "16:00", teamA: "第酒屆笑友", teamB: "哥布林東佑", referee: "AMA早午餐" },
    { id: 21, time: "17:00", teamA: "我米蟲拉", teamB: "靠臉吃飯", referee: "兜不住喜" },
    { id: 22, time: "18:00", teamA: "A2", teamB: "B2", referee: "A1+B1" }, // Merged schedule?
    { id: 23, time: "19:00", teamA: "A1", teamB: "B1", referee: "A2+B2" },
];
