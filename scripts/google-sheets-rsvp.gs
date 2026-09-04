/**
 * Paste into: Google Sheet → Extensions → Apps Script
 * Then Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the Web app URL into src/config.ts → rsvp.endpoint
 */

var SHEET_ID = '17R7wyl7sjhv0bTddNpk6Q8-j-d3v0sw0WjCMDQCDpRo'
var HEADERS = [
  'Submitted at',
  'Name',
  'Contact',
  'Guests',
  'Attending',
  'Events',
  'Song',
  'Message',
]

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) || '{}'
    var data = JSON.parse(raw)
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0]

    ensureHeaders_(sheet)

    sheet.appendRow([
      data.submittedAt || new Date().toISOString(),
      data.name || '',
      data.contact || '',
      data.guests || '',
      data.attending || '',
      Array.isArray(data.events) ? data.events.join(', ') : data.events || '',
      data.song || '',
      data.message || '',
    ])

    return json_({ ok: true })
  } catch (err) {
    return json_({ ok: false, error: String(err) })
  }
}

function doGet() {
  return json_({ ok: true, service: 'thamar-rsvp' })
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS)
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold')
    return
  }

  var first = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0]
  if (!first[0]) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold')
  }
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
