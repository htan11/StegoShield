// // database.js
// // ✅ CORRECT: This is the FRONTEND file. It talks to the API.
// export const appId = 'stego-live-v1';

// async function apiCall(method, collectionName, params = {}) {
//     let url = `/api/db`; 
//     try {
//         const options = {
//             method: method,
//             headers: { 'Content-Type': 'application/json' }
//         };
//         if (method === 'GET') {
//             const queryParams = new URLSearchParams({
//                 collectionName: collectionName,
//                 action: 'find',
//                 filter: JSON.stringify(params.where || {}),
//                 sort: JSON.stringify(params.sort || { _id: -1 })
//             });
//             url += `?${queryParams.toString()}`;
//         } else {
//             options.body = JSON.stringify({
//                 collectionName,
//                 action: params.action,
//                 payload: params.payload
//             });
//         }
//         const response = await fetch(url, options);
//         if (!response.ok) {
//             const err = await response.json();
//             throw new Error(err.error || "API Request Failed");
//         }
//         return await response.json();
//     } catch (error) {
//         console.error("API Error", error);
//         if (method === 'GET') return [];
//         throw error;
//     }
// }

// export const DB = {
//     async checkUsername(username) {
//         const users = await apiCall('GET', 'users', { where: { username } });
//         return users.length > 0;
//     },
//     async createUser(userData) {
//         return await apiCall('POST', 'users', { action: 'insert', payload: userData });
//     },
//     async login(username, password) {
//         const users = await apiCall('GET', 'users', { where: { username, password } });
//         return users[0] || null;
//     },
//     async getUnverifiedUsers() {
//         return await apiCall('GET', 'users', { where: { isVerified: false } });
//     },
//     async verifyUser(userId) {
//         return await apiCall('POST', 'users', { action: 'update', payload: { id: userId, updateData: { isVerified: true } } });
//     },
//     async getVerifiedUsers() {
//          return await apiCall('GET', 'users', { where: { isVerified: true } });
//     },
//     async sendMessage(msgData) {
//         return await apiCall('POST', 'private_messages', { action: 'insert', payload: msgData });
//     },
//     async getMessages(chatId) {
//         return await apiCall('GET', 'private_messages', { where: { chatId }, sort: { timestamp: 1 } });
//     },
//     async getGallery() {
//         return await apiCall('GET', 'gallery', { sort: { timestamp: -1 } });
//     },
//     async addToGallery(item) {
//         return await apiCall('POST', 'gallery', { action: 'insert', payload: item });
//     },
//     async getSettings() {
//         const s = await apiCall('GET', 'settings', {});
//         return s.length ? s[0] : null;
//     },
//     async updateSettings(id, newPass) {
//         return await apiCall('POST', 'settings', { action: 'update', payload: { id: id, updateData: { decodePassword: newPass } } });
//     }
// };






// database.js
// ✅ CORRECT: This is the FRONTEND file. It talks to the API.
export const appId = 'stego-live-v1';

async function apiCall(method, collectionName, params = {}) {
    let url = `/api/db`; 
    try {
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (method === 'GET') {
            const queryParams = new URLSearchParams({
                collectionName: collectionName,
                action: 'find',
                filter: JSON.stringify(params.where || {}),
                sort: JSON.stringify(params.sort || { _id: -1 })
            });
            url += `?${queryParams.toString()}`;
        } else {
            options.body = JSON.stringify({
                collectionName,
                action: params.action,
                payload: params.payload
            });
        }
        const response = await fetch(url, options);
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "API Request Failed");
        }
        return await response.json();
    } catch (error) {
        console.error("API Error", error);
        if (method === 'GET') return [];
        throw error;
    }
}

export const DB = {
    async checkUsername(username) {
        // Check both users and pending
        const users = await apiCall('GET', 'users', { where: { username } });
        if (users.length > 0) return true;
        const pending = await apiCall('GET', 'pending', { where: { username } });
        return pending.length > 0;
    },
    async createUser(userData) {
        // Add to pending, not users
        return await apiCall('POST', 'pending', { action: 'insert', payload: userData });
    },
    async login(username, password) {
        // Only allow login if user is in users and isVerified
        const users = await apiCall('GET', 'users', { where: { username, password, isVerified: true } });
        return users[0] || null;
    },
    async getPendingUsers() {
        return await apiCall('GET', 'pending', {});
    },
    async approveUser(userId) {
        // Move user from pending to users and set isVerified: true
        const pendingUsers = await apiCall('GET', 'pending', { where: { _id: userId } });
        if (!pendingUsers.length) throw new Error('User not found');
        const user = pendingUsers[0];
        await apiCall('POST', 'users', { action: 'insert', payload: { ...user, isVerified: true } });
        await apiCall('POST', 'pending', { action: 'delete', payload: { _id: userId } });
        return true;
    },
    async sendMessage(msgData) {
        return await apiCall('POST', 'private_messages', { action: 'insert', payload: msgData });
    },
    async getMessages(chatId) {
        return await apiCall('GET', 'private_messages', { where: { chatId }, sort: { timestamp: 1 } });
    },
    async getGallery() {
        return await apiCall('GET', 'gallery', { sort: { timestamp: -1 } });
    },
    async addToGallery(item) {
        return await apiCall('POST', 'gallery', { action: 'insert', payload: item });
    },
    async getSettings() {
        const s = await apiCall('GET', 'settings', {});
        return s.length ? s[0] : null;
    },
    async updateSettings(id, newPass) {
        return await apiCall('POST', 'settings', { action: 'update', payload: { id: id, updateData: { decodePassword: newPass } } });
    }
};
