# Pineapple

A client-side image annotation tool for uploading images, drawing polygons and bounding boxes, labeling them, and exporting the data. Built with a focus on robust touch and gesture controls for precise drawing.

## Features

- **Upload & Capture** — Load images from disk or capture directly from the device camera
- **Drawing Modes** — Trace arbitrary shapes with Polygons or draw bounding boxes with the Rectangle tool
- **Advanced Gestures** — Full support for pan, zoom, pinch-to-zoom, and touch gestures for precise canvas control
- **Custom Labels** — Label shapes with custom names and save label presets for quick access
- **Export Data** — Download your shapes and annotations as a JSON file
- **Local-First** — 100% client-side data processing, nothing leaves your browser

## Tech Stack

| Concern                   | Choice                                                             |
| ------------------------- | ------------------------------------------------------------------ |
| Framework                 | React 18 + TypeScript + Vite                                       |
| Routing                   | React Router DOM                                                   |
| State                     | Zustand                                                            |
| Styling                   | Tailwind CSS (v4)                                                  |
| UI Components             | PrimeReact + Lucide React                                          |
| Linting                   | ESLint                                                             |

## Getting Started

1. **Install dependencies**
   Ensure you have Node.js version 24.18.0 or higher.
   ```bash
   npm install
   ```

2. **Run the dev server**
   ```bash
   npm run dev
   ```
   To run on the local network (host mode):
   ```bash
   npm run host
   ```

## Project Structure

```
src/
  Components/    # Shared UI elements (Dialogs, Loaders, Navbar, Sidebar)
  Pages/         # Top-level route components (UploadData, DrawPolygon, etc.)
  Routes/        # React Router configuration
  Services/      # Zustand store and global hooks/logic
  assets/        # Static assets
  hooks/         # Custom React hooks
```

## Data Ownership

Pineapple processes all images and annotations locally in the browser. There is no backend or cloud storage. **Ensure you export your annotations before clearing browser data.**

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the detailed development roadmap, including upcoming features like existing annotation import and COCO/YOLO export formats.
