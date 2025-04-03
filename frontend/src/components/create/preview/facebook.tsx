export const Facebook = ({ content }: { content: string }) => {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "12px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "8px",
          gap: "0.5rem",
        }}
      >
        <img
          src={`/channels/facebook.png`}
          alt=""
          className={`icon channelBorder`}
          style={{ height: "42px" }}
          key={"facebook-dummy"}
        />

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>Align & Shine</div>
          <div style={{ fontSize: "12px", color: "#888" }}>Just Now · 🌐</div>
        </div>

        <div style={{ fontSize: "20px", cursor: "pointer" }}>⋯</div>
      </div>

      <div style={{ marginBottom: "10px" }}>{content}</div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          borderTop: "1px solid #eee",
          paddingTop: "8px",
          fontSize: "14px",
          color: "#555",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
          }}
        >
          👍 <span>Like</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
          }}
        >
          💬 <span>Comment</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            cursor: "pointer",
          }}
        >
          ↪️ <span>Share</span>
        </div>
      </div>
    </div>
  );
};
