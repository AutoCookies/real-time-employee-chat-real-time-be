class Message {
    // Message belongs to a chat
    constructor({ chatId, from, to, content, timestamp }) {
        this.chatId = chatId;
        this.from = from;
        this.to = to;
        this.content = content;
        this.timestamp = timestamp;
    }

    toFirestore() {
        return {
            chatId: this.chatId,
            from: this.from,
            to: this.to,
            content: this.content,
            timestamp: this.timestamp
        };
    }

    static fromFirestore(doc) {
        if (!doc.exists) {
            return null;
        }
        const data = doc.data();
        return new Message({
            id: doc.id,
            ...data
        });
    }
}

export default Message;
