/**
 * 科技感射擊模擬器 - 後端邏輯
 * 實作 CRUD 於 Google Sheets
 */

/**
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('未來科技：射擊訓練場')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// 用於匯入第二個獨立 HTML 檔案
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// 取得資料表 (自動檢查與建立)
function getDb() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Players');
  if (!sheet) {
    sheet = ss.insertSheet('Players');
    sheet.appendRow(['玩家名稱', '最高分數', '更新時間']);
    sheet.getRange(1,1,1,3).setBackground('#00f3ff').setFontWeight('bold');
  }
  return sheet;
}

// [C] Create: 註冊特工
function registerUser(username) {
  const name = username.trim();
  if (!name) return { success: false, msg: "代號無效" };
  const sheet = getDb();
  const data = sheet.getDataRange().getValues();
  
  // 檢查是否已存在 (Read)
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === name) return { success: true, user: name, msg: "歡迎回來，特工。" };
  }
  
  sheet.appendRow([name, 0, new Date()]);
  return { success: true, user: name, msg: "新特工授權成功。" };
}

// [R] Read: 讀取排行榜
function getLeaderboard() {
  const data = getDb().getDataRange().getValues();
  if (data.length <= 1) return [];
  const list = data.slice(1).map(row => ({
    name: row[0].toString(),
    score: parseInt(row[1]) || 0
  }));
  return list.sort((a, b) => b.score - a.score).slice(0, 10);
}

// [U] Update: 更新分數 (關鍵修正：確保精準比對)
function updateScore(username, newScore) {
  const name = username.trim();
  const sheet = getDb();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === name) {
      const oldScore = parseInt(data[i][1]) || 0;
      if (newScore > oldScore) {
        sheet.getRange(i + 1, 2).setValue(newScore);
        sheet.getRange(i + 1, 3).setValue(new Date());
        return "紀錄已超越！數據已同步至雲端。";
      }
      return "訓練結束。得分：" + newScore + " (未破紀錄)";
    }
  }
  return "錯誤：找不到玩家 [" + name + "] 的資料，請重新登入。";
}

// [D] Delete: 註銷帳號
function deleteAccount(username) {
  const name = username.trim();
  const sheet = getDb();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === name) {
      sheet.deleteRow(i + 1);
      return "帳號資料已永久抹除。";
    }
  }
  return "刪除失敗。";
}
*\
