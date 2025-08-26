export function adaptOutfit(doc) {
    if (!doc) return null;
    return {
        id: doc._id,
        title: doc.title,
        posterName: doc.posterUsername,
        posterAvatar: doc.posterAvatar || "",
        rating: doc.rating ?? 0,
        commentsCount: Array.isArray(doc.comments) ? doc.comments.length : 0,
        tags: doc.tags ?? [],
        image: doc.pictures?.[0] ?? ""
    };
}
