import { Polygon } from "../Interface/interfaces";

export const generateRandomColor = (): string => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const downloadPolygonsData = (polygons: Polygon[]) => {
  try {
    // Convert polygons data to JSON string
    const jsonData = JSON.stringify(polygons, null, 2);

    // Create a Blob object with the JSON data
    const blob = new Blob([jsonData], { type: "application/json" });

    // Create a temporary anchor element
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);

    // Set anchor's attributes for downloading
    a.href = url;
    a.download = "polygons_data.json";

    // Append anchor to the body and trigger click event
    document.body.appendChild(a);
    a.click();

    // Remove anchor and revoke URL
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading polygons data:", error);
  }
};
