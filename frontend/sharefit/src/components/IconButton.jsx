export default function IconButton({ label, onClick, title, disabled }) {
    return (
        <button className="btn secondary" onClick={onClick} title={title} disabled={disabled} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {label}
        </button>
    );
}
