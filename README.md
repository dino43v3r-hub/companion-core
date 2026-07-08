# Companion Core

Companion Core is an open-source Companion Builder that helps people create their own AI companion through natural conversation instead of questionnaires. Companion profiles belong to the person and can be used across AI platforms.

This first MVP is a simple onboarding experience. A visitor can begin a warm conversation, share a few natural responses, and receive a small Companion Profile v0.1 they can download.

This version is intentionally simple:

- No login
- No accounts
- No database
- No payments
- No dashboard
- No real AI connection yet

The current app uses a mock conversation in `app.js` so the experience can be tested on GitHub Pages.

## Run Locally

Open `index.html` in a browser.

## Publish With GitHub Pages

Use GitHub Pages with the source set to the repository root.

1. Push this repository to GitHub.
2. Open the repository settings on GitHub.
3. Go to **Pages**.
4. Set the source to the main branch and the root folder.
5. Save.

GitHub Pages will serve `index.html` from the root of the repository.

## Project Structure

```text
README.md
index.html
styles.css
app.js
docs/
  vision.md
  onboarding.md
  companion-profile.md
  roadmap.md
```

## MVP Goal

A person visits the site, clicks Begin, has a gentle onboarding conversation, and receives Companion Profile v0.1.
