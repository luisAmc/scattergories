export function generateGameCode() {
    // Base 36 = [0-9A-Z]
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}
