# Momentum Lecture Page

A mobile-friendly, liquid-glass style web app (Google Apps Script) for Momentum teachers.

- **Lecture entry**: teacher, subject, lecture name, topic and date are sent straight to the Google Form, then a "Thank you" screen appears.
- **Videos to Arrange**: shared per-teacher counters with +/- buttons, saved in Script Properties. Each submitted lecture subtracts one from that teacher.

## Files
- `Code.gs` - server code (serves the page, stores and updates counts)
- `Index.html` - the page (design and form submission)

## Setup
1. Go to https://script.google.com and create a new project.
2. Paste `Code.gs` into the default `Code.gs` file.
3. Add an HTML file named `Index` and paste `Index.html` into it.
4. In `Index.html`, set `FORM_URL` (ending in `/formResponse`) and the five `entry.` IDs in `FIELD` for your own Google Form.
5. Choose **Deploy > New deployment > Web app**, set **Execute as: Me** and **Who has access: Anyone with the link**, then deploy.

## Notes
- Edit the teacher list in both `Code.gs` (`TEACHERS`, `DEFAULTS`) and `Index.html` (`BOARD` and the teacher dropdown).
- Anyone with the link can change the counts.
- Google Forms does not confirm back to the page, so check Responses after the first test entry.
