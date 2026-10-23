# Nikoh to‘yi taklifnomasi

A single-file wedding invitation site (`index.html`, no build step). Open it in a browser or upload it to any static host.

## Customising for a couple

- **Names, date, venues, programme, card number:** edit the text in `index.html`.
- **Countdown, calendar and music:** edit the `WEDDING` object at the top of the script.
  - `start` is the countdown target, in Tashkent time.
  - `year`, `month` (0-based) and `day` mark the calendar.
  - `music` is an optional mp3 URL. It starts when the envelope opens, and a music button appears.
- **Google Calendar button:** update the dates in the button's link in the *Sana* section.

## Personal links for guests

Add the guest's name to the link. The envelope and card then greet them by name, and the RSVP name field is pre-filled:

- `https://example.uz/?mehmon=Aziza%20opa`
- `https://example.uz/#m-Aziza-opa`

## Latin / Cyrillic

The Lotin/Кирилл switch transliterates the whole page automatically. Brand names are kept in Latin with `translate="no"`. A word can be given a fixed Cyrillic form with `data-lat` and `data-cyr`.

## RSVP

Answers are kept in the guest's browser. To collect them, set `rsvpEndpoint` to a URL that accepts a JSON POST, for example a small Telegram bot endpoint.
