# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Uzbek couples and their families planning a wedding (nikoh, fotiha, unashtiruv, qiz bazmi). They find the business through Instagram, almost always on a phone, often inside Instagram's in-app browser. Wedding guests are the second audience: they receive a link in Telegram or WhatsApp and open it once, on their phone.

## Product Purpose

A showcase of example digital wedding invitations. The owner screen-records the examples for Instagram videos; when a couple asks, the owner builds their real invitation from the chosen template. Success is a viewer who watches the invitation open and wants one for their own wedding.

## Positioning

Each invitation opens like a physical luxury card in the guest's hand (ribbon or wax seal, folding paper, light), then becomes a full invitation page with the details guests actually need, written in natural Uzbek.

## Operating Context

- Examples are filmed on a phone screen, so the opening must read well in a 9:16 recording and finish its main moment within about 3–5 seconds.
- Invitation content follows Uzbek wedding custom: optional "Bismillahir Rohmanir Rohiym", the hosting families ("… oilasi"), the ceremony type, date with weekday, time, venue and address, program, RSVP.
- The showcase is published as a single self-contained page (claude.ai Artifact or any static host): no map embeds, assets inlined.

## Capabilities and Constraints

- Showcase only: no ordering, payment or admin in the shown surface. Real invitations are made per customer by the owner.
- Templates are built one at a time from reference videos the owner supplies; the target is 7 templates. "Oltin muhr" (wax-seal envelope) is the first; the six earlier templates were rejected by the owner and are removed from the showcase.
- Imagery is drawn in code (SVG/CSS). AI-generated paintings were declined, so scenes contain architecture, light and ornament, not people.
- Must run smoothly on Android and iPhone browsers including Instagram's in-app browser.
- Language: Uzbek, Latin script, with correct ‘ and ’ characters (o‘, g‘, ma’no).

## Brand Commitments

None fixed. The owner sells under their own Instagram account; the showcase carries no brand name.

## Evidence on Hand

- Reference videos supplied by the owner (wax-seal envelope opening into a gold arch scene).
- Two original background music tracks in `public/music` (nafis, sokin).
- No testimonials, customer counts or prices to show; do not invent any.

## Product Principles

1. The opening is the product: the first seconds must feel like a real object being opened.
2. Every invitation is complete and true to Uzbek custom; ornament never replaces the details guests need.
3. Filmable on a phone: legible, centred composition, no UI chrome after the card is opened.
4. One template at a time, each built to the owner's reference rather than to a generic look.
