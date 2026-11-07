# Momentum Lecture Page

A mobile-friendly, liquid-glass style web app (Google Apps Script) for Momentum teachers.

- **Lecture entry**: teacher, subject, batch name, lecture name, topic and date are sent straight to the Google Form, then a "Thank you" screen appears.
- **Videos to Arrange**: shared per-teacher counts saved in the Google Sheet `Teacher Counts`. Counts decrease when a lecture is submitted; manual changes are made directly in the sheet.

## Files
- `Code.gs` - server code (serves the page, stores and updates counts)
- `lecture-entry.html` - the page (design and form submission)

## Setup
### Run from VS Code
1. Open `lecture-entry.html` with Live Server.
2. The page uses the `APPS_SCRIPT_URL` in the HTML to read and update shared counts in the Google Sheet. The URL is configured for the current deployment.

### Apps Script setup
1. In the Apps Script project, replace `Code.gs` with this folder's `Code.gs`.
2. Add or replace the HTML file named `index` and paste in `lecture-entry.html` (Apps Script adds the `.html` extension itself).
3. Run `setupTeacherCounts()` once to create the count spreadsheet and its `Teacher Counts` tab. Existing initial counts for the original nine teachers are carried over; the other six start at zero.
4. Deploy a new version of the existing web app after code changes. Keep its `/exec` URL in `APPS_SCRIPT_URL`.

## Notes
- Keep the teacher names in `Code.gs` (`TEACHERS`, `DEFAULTS`) in sync with the HTML teacher dropdown and `BOARD` list.
- Anyone with the link can change the counts.
- Google Forms does not confirm back to the page, so check Responses after the first test entry.
## DEVELOPED BY RAHUL NISHAD
