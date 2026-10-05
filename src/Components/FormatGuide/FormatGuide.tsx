import React from "react";

import { Dialog } from "primereact/dialog";
import { TabPanel, TabView } from "primereact/tabview";

interface FormatGuideProps {
  visible: boolean;
  onHide: () => void;
}

const FormatGuide: React.FC<FormatGuideProps> = ({ visible, onHide }) => {
  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Data Format Guide"
      className="w-full md:w-3/4 lg:w-2/3 max-w-4xl"
    >
      <div className="pt-2 font-content text-stone-700 dark:text-stone-300">
        <p className="mb-4">
          Pineapple supports several formats for saving and importing your work. Below is a detailed guide on what each format looks like and how to use it.
        </p>

        <TabView className="format-tabs">
          <TabPanel header="App Backup">
            <div className="flex flex-col gap-3">
              <p>
                <strong>Extension:</strong> <code className="bg-white/50 dark:bg-black/20 px-1 rounded">pineapple-backup-*.json</code>
              </p>
              <p>
                <strong>Purpose:</strong> Full application snapshot. This file contains your active image, all annotations, and your settings. You can import this from the Settings page to completely restore your session.
              </p>
              <pre className="bg-stone-800 text-stone-200 p-3 rounded-lg overflow-x-auto text-sm">
                {`{
  "version": "1.0",
  "type": "pineapple_backup",
  "timestamp": "2026-09-02T12:00:00.000Z",
  "preferences": {
    "annotatorName": "Alice",
    "crosshairCursor": true
  },
  "session": {
    "imageMeta": {
      "title": "photo.jpg",
      "type": "image/jpeg"
    },
    "imageBlobDataUrl": "data:image/jpeg;base64,...",
    "polygons": [
      {
        "label": "Car",
        "color": "#ff0000",
        "points": [ { "x": 10, "y": 10 }, { "x": 20, "y": 20 }, ... ],
        "bbox": [10, 10, 20, 20]
      }
    ],
    "rectangles": []
  }
}`}
              </pre>
            </div>
          </TabPanel>

          <TabPanel header="Pineapple Annotations">
            <div className="flex flex-col gap-3">
              <p>
                <strong>Extension:</strong> <code className="bg-white/50 dark:bg-black/20 px-1 rounded">.json</code>
              </p>
              <p>
                <strong>Purpose:</strong> Standard annotation export. This only contains the shapes you've drawn, allowing you to load them into another image via the Draw page.
              </p>
              <pre className="bg-stone-800 text-stone-200 p-3 rounded-lg overflow-x-auto text-sm">
                {`{
  "polygons": [
    {
      "label": "Car",
      "color": "#ff0000",
      "points": [
        { "x": 150.5, "y": 200.0 },
        { "x": 160.0, "y": 210.5 },
        ...
      ],
      "bbox": [150.5, 200.0, 160.0, 210.5]
    }
  ],
  "rectangles": [
    {
      "label": "Pedestrian",
      "color": "#00ff00",
      "startX": 10,
      "startY": 20,
      "endX": 50,
      "endY": 100
    }
  ]
}`}
              </pre>
            </div>
          </TabPanel>

          <TabPanel header="COCO (JSON)">
            <div className="flex flex-col gap-3">
              <p>
                <strong>Extension:</strong> <code className="bg-white/50 dark:bg-black/20 px-1 rounded">.json</code>
              </p>
              <p>
                <strong>Purpose:</strong> Industry standard for machine learning (Object Detection / Segmentation).
              </p>
              <pre className="bg-stone-800 text-stone-200 p-3 rounded-lg overflow-x-auto text-sm">
                {`{
  "images": [
    {
      "id": 1,
      "file_name": "photo.jpg",
      "width": 1920,
      "height": 1080
    }
  ],
  "categories": [
    { "id": 1, "name": "Car" }
  ],
  "annotations": [
    {
      "id": 1,
      "image_id": 1,
      "category_id": 1,
      "segmentation": [[150.5, 200.0, 160.0, 210.5, ...]],
      "bbox": [150.5, 200.0, 9.5, 10.5]
    }
  ]
}`}
              </pre>
            </div>
          </TabPanel>

          <TabPanel header="YOLO (TXT) - Planned">
            <div className="flex flex-col gap-3">
              <p>
                <strong>Extension:</strong> <code className="bg-white/50 dark:bg-black/20 px-1 rounded">.txt</code>
              </p>
              <p>
                <strong>Purpose:</strong> Used widely for object detection. Each line represents one bounding box, with coordinates normalized between 0 and 1.
              </p>
              <pre className="bg-stone-800 text-stone-200 p-3 rounded-lg overflow-x-auto text-sm">
                {`0 0.45 0.55 0.1 0.2
1 0.10 0.10 0.05 0.05`}
              </pre>
              <p className="text-sm italic">
                Note: YOLO relies on a separate <code>classes.txt</code> file to map class IDs (0, 1) to names (Car, Pedestrian).
              </p>
            </div>
          </TabPanel>
        </TabView>
      </div>
    </Dialog>
  );
};

export default FormatGuide;
