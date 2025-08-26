export default function UserAvatar({ size = 40, src, alt = "user"}) {
    return (
        <div style={{width: size, height: size, borderRadius: "50%", overflow: "hidden", border: "1px solid var(--border)", background: "#151922"}}>
            {src ? <img src={src} alt={alt} style={{width: "100%", height: "100%", objectFit: "cover"}}/> : null}
        </div>
    )
}