# The CookBook Club 🍔

An interactive map where CookBook Club members can browse, add, and manage food recommendations around NYC. This website is a redirected page from a separate landing website.

## Features

- **Interactive map** (Leaflet.js + CARTO light basemap) with emoji markers per category (restaurant, café, dessert, boba, bar)
- **Place detail panel** with recommender info, dishes, notes, tags, price, rating, and photos
- **Authenticated CRUD** — signed-in users can add, edit, and delete recommendations, with photo uploads to Supabase Storage
- **Google Places Autocomplete** for address entry when adding a place, with a geocoding fallback
- **Filtering** by category, price, rating, and tags
- **Account settings** — first name, last initial, role, and profile photo, stored on the Supabase auth user

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Single-page vanilla JS/HTML/CSS (no framework/build step) |
| Map | [Leaflet.js](https://leafletjs.com/) 1.9.4 |
| Backend / DB | [Supabase](https://supabase.com/) (Postgres + Auth + Storage) |
| Places autocomplete | Google Maps JavaScript API (`PlaceAutocompleteElement`) |
| Hosting | [Vercel](https://vercel.com/) |

## Data Model

**`places` table** (Postgres, via Supabase)
- Core fields: `name`, `category`, `cuisine`, `address`, `lat`, `lng`
- Recommender fields: `recommender_name`, `recommender_role`, `recommender_avatar` / `recommender_avatar_url`, `recommender_color`
- Content: `dishes[]`, `notes`, `tags[]`, `photos[]`, `price`, `rating`, `maps_url`

**Storage buckets**
- `place-photos` — photos attached to a recommendation
- `avatars` — user profile photos

## Setup

1. Create a Supabase project with a `places` table matching the schema above, plus `place-photos` and `avatars` storage buckets.
2. Set up Row Level Security (see **Security** below) — this app has no server, so RLS is the only thing standing between "signed in" and "can modify anyone's data."
3. Enable email/password auth in Supabase Auth.
4. In a Google Cloud project, enable the Maps JavaScript API + Places API and generate a browser API key.
5. Update the constants near the top of the inline `<script>` block in `index.html`:
   - `SUPABASE_URL`, `SUPABASE_KEY` (the publishable/anon key — safe to expose, *not* the service role key)
   - the Google Maps `key=` param in the `<script src="https://maps.googleapis.com/maps/api/js?...">` tag
6. Serve `index.html` as a static file (e.g. `vercel deploy`, or any static host).

## Security — read before you ship changes here

I flagged this in an earlier note and it's still worth restating plainly rather than softening it:

1. **The Google Maps API key is hardcoded and, as far as I can tell from the file, unrestricted.** Client-embedded keys are normal for Maps JS — that part's fine, it's designed to be public — but an unrestricted key can be copied out of your page source and used to rack up charges against your billing account. Go to Google Cloud Console → Credentials → this key → **restrict it by HTTP referrer** to your actual domain(s) (`cookbook-guide.vercel.app`, `localhost` for dev). This takes five minutes and closes off the most likely abuse vector.
2. **All write authorization is delegated to RLS, with zero client-side ownership checks.** `deletePlace()` and `deleteFromRecs()` just call `.delete().eq('id', id)` for any signed-in user — there's no check that the user owns that row before the request goes out. That's actually the *correct* pattern for a client-only app (never trust the client), **but it means the app is only as safe as your Supabase RLS policies.** If RLS on `places` isn't scoped so users can only update/delete rows where, say, `recommender_id = auth.uid()`, then any club member can delete anyone else's recommendation. Worth explicitly verifying (not assuming) this is locked down, since a broken or missing policy here fails open, not closed.
3. The Supabase key in the file (`sb_publishable_...`) is a publishable key, which is meant to be public — that one's not a leak, just flagging it so it's not confused with the "delegated to RLS" issue above.

If you haven't verified #2 against your actual Supabase policies, that's the first thing to check — it's a bigger risk than the API key.

## Notes for Future Work

- No pagination — `loadPlaces()` fetches the entire `places` table on load; fine for a club, won't scale to a large dataset
- No build step or dependency management (CDN script tags) — fine for a single-file app, but makes versioning implicit
