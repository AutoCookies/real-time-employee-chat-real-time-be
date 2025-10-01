// models/log.model.js
class Log {
  constructor({ id = null, action, timestamp = new Date() }) {
    this.id = id;
    this.action = action; 
    this.timestamp = timestamp;
  }

  toFirestore() {
    return {
      action: this.action,
      timestamp: this.timestamp,
    };
  }

  static fromFirestore(doc) {
    if (!doc.exists) return null;
    const data = doc.data();
    return new Log({
      id: doc.id,
      action: data.action,
      timestamp: data.timestamp.toDate ? data.timestamp.toDate() : data.timestamp,
    });
  }
}

export default Log;
