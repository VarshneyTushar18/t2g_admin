export default function UploadProgressBar({ percent, label, visible }) {
  if (!visible) return null;

  const safe = Math.min(100, Math.max(0, percent ?? 0));

  return (
    <div
      style={{
        marginTop: "16px",
        padding: "14px",
        background: "#f0f7ff",
        border: "1px solid #c5ddf8",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
          fontSize: "13px",
          fontWeight: 600,
          color: "#1a4d8f",
        }}
      >
        <span>{label || "Uploading…"}</span>
        <span>{safe}%</span>
      </div>
      <div
        style={{
          height: "10px",
          background: "#dce8f5",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${safe}%`,
            background: "linear-gradient(90deg, #4f8ef7, #16a37f)",
            borderRadius: "999px",
            transition: "width 0.15s ease-out",
          }}
        />
      </div>
      <p
        style={{
          fontSize: "11px",
          color: "#666",
          marginTop: "8px",
          marginBottom: 0,
        }}
      >
        {safe < 92
          ? "Sending files to server…"
          : safe < 100
            ? "Compressing images and uploading to cloud — please wait…"
            : "Done!"}
      </p>
    </div>
  );
}
