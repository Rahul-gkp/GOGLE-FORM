// ---- Momentum lecture page ----
// Shared "Videos to Arrange" counts are stored in a Google Sheet.

var COUNT_SHEET_NAME = 'Teacher Counts';
var COUNT_SPREADSHEET_ID_KEY = 'COUNT_SPREADSHEET_ID';

var TEACHERS = [
  'Vikas Sir', 'Sudhanshu Sir', 'Subodh Sir', 'Aditya Sir', 'Durgesh Sir',
  'Nitish Sir', 'Ashwani Sir', 'CP Sir', 'Pankaj Sir', 'Shivam sir',
  'Om Sir', 'Sandeep Sir', 'Alok Sir', "Aditi ma'm", "Nikita ma'm"
];

// Starting counts for the nine teachers already tracked by the old version.
// The additional teachers begin at zero.
var DEFAULTS = {
  'Vikas Sir': 0,
  'Sudhanshu Sir': 4,
  'Subodh Sir': 7,
  'Aditya Sir': 13,
  'Durgesh Sir': 3,
  'Nitish Sir': 6,
  'Ashwani Sir': 10,
  'CP Sir': 7,
  'Pankaj Sir': 11,
  'Shivam sir': 0,
  'Om Sir': 0,
  'Sandeep Sir': 0,
  'Alok Sir': 0,
  "Aditi ma'm": 0,
  "Nikita ma'm": 0
};

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'getCounts') {
    var result = JSON.stringify({ ok: true, data: getCounts() });
    var callback = e.parameter.callback || '';
    if (callback) {
      if (!/^[A-Za-z_$][0-9A-Za-z_$.]*$/.test(callback)) {
        return ContentService.createTextOutput('Invalid callback');
      }
      return ContentService.createTextOutput(callback + '(' + result + ');')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(result)
      .setMimeType(ContentService.MimeType.JSON);
  }

  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Momentum Lecture Entry')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Lets the local VS Code page send count changes to the same spreadsheet.
function doPost(e) {
  try {
    if (!e || !e.parameter || e.parameter.action !== 'changeCount') {
      throw new Error('Unknown action');
    }
    var updated = changeCount(e.parameter.teacher, e.parameter.delta);
    return ContentService.createTextOutput(JSON.stringify({ ok: true, count: updated }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Run this once from the Apps Script editor. It creates the spreadsheet and
// migrates existing Script Properties counts without overwriting saved values.
function setupTeacherCounts() {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var properties = PropertiesService.getScriptProperties();
    var spreadsheetId = properties.getProperty(COUNT_SPREADSHEET_ID_KEY);
    var isNewSpreadsheet = !spreadsheetId;
    var spreadsheet = spreadsheetId
      ? SpreadsheetApp.openById(spreadsheetId)
      : SpreadsheetApp.create('Momentum Teacher Video Counts');
    var sheet = spreadsheet.getSheetByName(COUNT_SHEET_NAME);
    if (!sheet) sheet = spreadsheet.insertSheet(COUNT_SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 2).setValues([['Teacher', 'Videos remaining']]);
      sheet.setFrozenRows(1);
    }

    var lastRow = sheet.getLastRow();
    var rows = lastRow > 1
      ? sheet.getRange(2, 1, lastRow - 1, 2).getValues()
      : [];
    var existing = {};
    rows.forEach(function (row, index) {
      var name = String(row[0]).trim();
      if (name) existing[name] = index + 2;
    });

    var legacy = properties.getProperties();
    var missingRows = [];
    TEACHERS.forEach(function (teacher) {
      if (existing[teacher]) return;
      var oldValue = legacy['count:' + teacher];
      var count = oldValue !== undefined
        ? Math.max(0, parseInt(oldValue, 10) || 0)
        : (DEFAULTS[teacher] || 0);
      missingRows.push([teacher, count]);
    });

    if (missingRows.length) {
      sheet.getRange(sheet.getLastRow() + 1, 1, missingRows.length, 2)
        .setValues(missingRows);
    }

    if (isNewSpreadsheet) {
      spreadsheet.getSheets().forEach(function (otherSheet) {
        if (otherSheet.getSheetId() !== sheet.getSheetId() && otherSheet.getLastRow() === 0) {
          spreadsheet.deleteSheet(otherSheet);
        }
      });
    }

    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, 2);
    properties.setProperty(COUNT_SPREADSHEET_ID_KEY, spreadsheet.getId());
    Logger.log('Teacher Counts spreadsheet: ' + spreadsheet.getUrl());
    return spreadsheet.getUrl();
  } finally {
    lock.releaseLock();
  }
}

function getCounts() {
  var sheet = getTeacherCountsSheet_();
  var rows = sheet.getDataRange().getValues();
  var counts = {};

  rows.slice(1).forEach(function (row) {
    var teacher = String(row[0]).trim();
    if (teacher) counts[teacher] = Math.max(0, parseInt(row[1], 10) || 0);
  });

  TEACHERS.forEach(function (teacher) {
    if (counts[teacher] === undefined) counts[teacher] = 0;
  });
  return counts;
}

// Adds a change (negative or positive) to one teacher and returns the new count.
function changeCount(teacher, delta) {
  if (TEACHERS.indexOf(teacher) < 0) throw new Error('Unknown teacher');
  delta = Math.max(-100, Math.min(100, parseInt(delta, 10) || 0));

  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var sheet = getTeacherCountsSheet_();
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).trim() === teacher) {
        var current = Math.max(0, parseInt(rows[i][1], 10) || 0);
        var updated = Math.max(0, current + delta);
        sheet.getRange(i + 1, 2).setValue(updated);
        return updated;
      }
    }

    // Recover if a teacher's row was deleted from the spreadsheet.
    var newCount = Math.max(0, delta);
    sheet.appendRow([teacher, newCount]);
    return newCount;
  } finally {
    lock.releaseLock();
  }
}

function getTeacherCountsSheet_() {
  var spreadsheetId = PropertiesService.getScriptProperties()
    .getProperty(COUNT_SPREADSHEET_ID_KEY);
  if (!spreadsheetId) {
    throw new Error('Run setupTeacherCounts() once to create the count sheet.');
  }

  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(COUNT_SHEET_NAME);
  if (!sheet) throw new Error('Teacher Counts sheet not found.');
  return sheet;
}