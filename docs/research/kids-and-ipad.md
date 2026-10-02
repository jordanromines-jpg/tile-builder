# Designing for kids 3–10, and running as an iPad home-screen app

Research notes, 2 Oct 2026, found by web search. Each rule is followed by what the app does about it.

## Kids

| Finding | What we do |
|---|---|
| Design for at least three age groups: 3–5, 6–8 and 9–12 [1][2] | Every project and every kid profile has an age band: 3–5, 6–8 or 9–10 |
| Buttons for children should be about 2 × 2 cm, twice the adult size, with space between them [2] | Kid screens use touch targets of at least 80 CSS px for 3–5 and 64 px for 6–10, with at least 16 px between them |
| Children under 5 can't use drag-and-drop reliably: they lift their finger mid-drag and lose their place [2] | Nothing a young kid needs is behind a drag. The 3D build turns with big ◀ ▶ buttons and turns slowly by itself; dragging to turn is an extra for older kids |
| Tapping and swiping big targets are easy at every age [2] | Every kid action is a tap: Next step, Back, Hear it again, I built it! |
| Pre-readers rely on pictures and sound | Each step is read aloud on tap with the browser's built-in voice. Piece counts are shown as pictures of the tiles, not words |

## iPad home-screen app

| Fact | What we do |
|---|---|
| Safari deletes a site's stored data after 7 days of Safari use with no visit. A web app added to the Home Screen is exempt from that cap [3] | The parent is asked to add the app to the Home Screen before entering the inventory |
| A Home Screen web app's data is kept separate from Safari's [3] | Data typed into a Safari tab does not appear in the Home Screen app. The app detects when it is running in a Safari tab and shows a one-time "Add to Home Screen first" card |
| Safari 17 supports the Storage API. `navigator.storage.persist()` makes an origin's storage exempt from eviction. A Home Screen app can use up to about 60% of the disk [4][5] | The app calls `persist()` on first run and shows the result in the parent settings |
| Storage stays on one device | Parent settings offer "Save a backup" (a single file with the inventory, profiles and photos) and "Load a backup", to move to another iPad or recover |

## Privacy

Nothing leaves the device: there are no accounts, analytics, ads or network calls after the app loads. Photos stay in the
app's own storage on the iPad. The app does not collect children's personal information, which keeps it outside the US
COPPA rules on collecting it. A kid profile is a first name or a nickname and a picture chosen from the app's own set.

## Sources

1. [Children's UX: usability issues (NN/g)](https://www.nngroup.com/articles/childrens-websites-usability-issues/)
2. [Design for kids based on their stage of physical development (NN/g)](https://www.nngroup.com/articles/children-ux-physical-development/)
3. [Tracking Prevention in WebKit](https://webkit.org/tracking-prevention/)
4. [Updates to Storage Policy (WebKit blog)](https://webkit.org/blog/14403/updates-to-storage-policy/)
5. [Storage quotas and eviction criteria (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
