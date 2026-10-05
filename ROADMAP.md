# Pineapple — Roadmap & Checklist

Development is organized by feature categories.

---

## Foundation & Architecture
- [x] Base project setup with React + TypeScript + Vite
- [x] Configure Tailwind CSS v4 and PrimeReact UI components
- [x] Set up Zustand for global state management
- [x] Integrate React Router DOM for routing
- [x] Implement initial Upload Data and Capture Image flows

## Labels & Presets
- [x] Build `LabelInputDialog` for shape naming
- [x] Wire dialog to "Complete Polygon" action
- [x] Persist label presets to `localStorage`
- [x] Reset color index upon clearing polygons on success page

## Canvas Gestures & Stability
- [x] Fix image drift by unifying `toScreen()` and image draw coordinate model
- [x] Implement robust wheel pan, pinch zoom, and touch gesture disambiguation
- [x] Enlarge point/close-polygon hit radius to touch-target size (22px)
- [x] Add persistent zoom indicator
- [x] Rework toolbar (consolidated row, persistent icon-only toggle)

## Drawing Tools
- [x] Add segmented Polygon/Rectangle control in the toolbar
- [x] Implement Rectangle drawing gesture (pointerdown anchor, pointermove preview, pointerup commit)
- [x] Keep `Rectangle` interface distinct from `Polygon` for export compatibility
- [x] Update label dialog flow to support `pendingRectangleRef`
- [x] Branch `toScreen()` render loop to support both shape types seamlessly
- [x] Update mini-crop sidebar to show unified "Shapes" list with kind badges
- [x] Polish: Replace all PrimeIcons with Lucide React icons
- [x] Polish: Add mode-aware hint text for first-time users

## Import System
- [x] Add "Load annotations" option on upload page (accepts JSON export schema)
- [x] Validate JSON and load polygons/rectangles into store
- [x] Navigate to `/draw` upon successful load
- [x] Support COCO JSON import and auto-detect formats
- [x] Full session state backup export and import

## Export Formats
- [x] Implement COCO JSON format export
- [x] Implement YOLO `.txt` format export
- [x] Ensure rectangles map cleanly to COCO/YOLO bounding boxes

## Canvas-Side Point Editing
- [ ] Hover/select/drag existing polygon points (drag-point gesture tier)
- [ ] Rectangle corner/edge dragging for axis-aligned resizing
- [ ] Whole-shape drag (move shape without resizing)
- [ ] Handle selection state and gesture disambiguation (pan vs. draw vs. drag-point)
- [ ] Define Escape key semantics (undo point vs. cancel drag)

## Backlog / Ideas
- [ ] Multiple images per session, ZIP export
- [ ] Export format options for Pascal VOC
- [x] Crosshair cursor toggle in Settings
- [ ] Annotation statistics panel on the Preview page
