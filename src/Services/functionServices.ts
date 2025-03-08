import { Polygon } from "./interfaces";

export const generateRandomColor = (): string => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const downloadPolygonsData = (
  polygons: Polygon[],
  annotatedCanvasImage: string | null,
  showToast
) => {
  try {
    if (polygons.length === 0) {
      showToast("error", "Error", "No polygons data to download.");
      return;
    }

    if (!annotatedCanvasImage) {
      showToast("error", "Error", "No annotated image to download.");
      return;
    }

    // Download JSON data
    // Convert polygons data to JSON string
    const jsonData = JSON.stringify(polygons, null, 2);

    // Create a Blob object with the JSON data
    const jsonBlob = new Blob([jsonData], { type: "application/json" });

    // Create a temporary anchor element for JSON
    const jsonAnchor = document.createElement("a");
    const jsonUrl = URL.createObjectURL(jsonBlob);

    // Set anchor's attributes for downloading JSON
    jsonAnchor.href = jsonUrl;
    jsonAnchor.download = "annotations_data.json";

    // Append anchor to the body and trigger click event
    document.body.appendChild(jsonAnchor);
    jsonAnchor.click();

    // Remove anchor and revoke URL
    document.body.removeChild(jsonAnchor);
    URL.revokeObjectURL(jsonUrl);

    // Download image
    // Create a temporary anchor element for image
    const imgAnchor = document.createElement("a");

    // For data URLs, we can use them directly
    imgAnchor.href = annotatedCanvasImage;
    imgAnchor.download = "annotated_image.png";

    // Append anchor to the body and trigger click event
    document.body.appendChild(imgAnchor);
    imgAnchor.click();

    // Remove anchor
    document.body.removeChild(imgAnchor);

    showToast(
      "success",
      "Success",
      "Polygons data and annotated image downloaded successfully."
    );
  } catch (error) {
    console.error("Error downloading annotation data:", error);
    showToast(
      "error",
      "Error",
      "Error downloading annotation data. Check console for more details"
    );
  }
};
