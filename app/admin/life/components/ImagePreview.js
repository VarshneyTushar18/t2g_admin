import { useEffect, useState } from "react";

export default function ImagePreview({ file, existingUrl }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (preview) return (
    <img src={preview} width="200"
      style={{ borderRadius: "8px", marginTop: "10px", display: "block" }} />
  );

  if (existingUrl) return (
    <img src={existingUrl} width="200"
      style={{ borderRadius: "8px", marginTop: "10px", display: "block", opacity: 0.6 }} />
  );

  return null;
}