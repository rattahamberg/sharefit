export default function EmptyState({ title, action }) {
    return (
        <div className="panel" style={{ textAlign: "center" }}>
            <div className="section-title">{title}</div>
            {action}
        </div>
    );
}
