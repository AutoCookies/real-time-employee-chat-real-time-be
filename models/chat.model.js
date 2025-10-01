class Chat {
    constructor({ name, participants = [], createdAt, updatedAt }) {
        this.name = name
        this.participants = participants;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    toFirestore() {
        return {
            name: this.name,
            participants: this.participants,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromFirestore(doc) {
        if (!doc.exists) {
            return null;
        }
        const data = doc.data();
        return new Chat({
            id: doc.id,
            ...data
        });
    }
}

export default Chat;
