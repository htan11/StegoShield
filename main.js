import { DB } from './database.js';
import * as Backend from './backend.js';
import * as UI from './frontend.js';

let currentUserData = null;
let globalSettings = { decodePassword: "default" };
let activeTab = "chat"; 
let authTab = "user";
let loginMode = "login";
let selectedChatUser = null; 
let error = "";
let success = "";
let chatInterval = null; 

window.setAuthTab = (tab) => { authTab = tab; error=''; renderApp(); };
window.setLoginMode = (mode) => { loginMode = mode; error=''; success=''; renderApp(); };
window.setActiveTab = (tab) => { activeTab = tab; renderApp(); };
window.handleLogout = () => {
    if(chatInterval) clearInterval(chatInterval);
    currentUserData = null;
    activeTab = "chat"; authTab = "user"; loginMode = "login"; selectedChatUser = null;
    error = ""; success = "";
    renderApp();
};
window.selectUser = (username) => { selectedChatUser = username ? { username } : null; renderApp(); };

async function initApp() { renderApp(); }

async function handleAuth(type, username, password) {
    renderLoading();
    error = ""; success = "";
    try {
        if (authTab === 'admin') {
            if (username === 'admin' && password === 'admin123') {
                currentUserData = { username: 'Admin', role: 'admin', isVerified: true, id: 'admin_root' };
                activeTab = "admin";
                await fetchGlobalSettings();
            } else {
                throw new Error("Invalid Admin Credentials");
            }
        } else {
            if (type === 'signup') {
                const userExists = await DB.checkUsername(username);
                if(userExists) throw new Error("Username already taken");
                await DB.createUser({ username, password, role: 'user', isVerified: false });
                success = "Request sent to Admin. Please wait for approval.";
                loginMode = "login";
            } else {
                const user = await DB.login(username, password);
                if (!user) throw new Error("Invalid credentials or account not approved");
                currentUserData = user;
                activeTab = "chat";
                await fetchGlobalSettings();
            }
        }
    } catch (e) { 
        console.error(e);
        error = e.message; 
    }
    renderApp();
}

async function fetchGlobalSettings() {
    try { const s = await DB.getSettings(); if(s) globalSettings = s; } catch(e) { console.warn(e); }
}

function renderLoading() {
    document.getElementById('app-root').innerHTML = `<div class="flex-1 flex items-center justify-center flex-col gap-4 bg-slate-900"><div class="spinner"></div><p class="text-slate-400 font-mono text-sm">CONNECTING...</p></div>`;
}

function renderApp() {
    const appRoot = document.getElementById('app-root');
    if (!currentUserData) {
        appRoot.innerHTML = UI.AuthPage({ loginMode, authTab, error, success });
    } else {
        appRoot.innerHTML = UI.DashboardPage(currentUserData, activeTab);
        renderTabContent();
    }
    if(window.lucide) window.lucide.createIcons();
    const btn = document.getElementById('auth-action-btn');
    if (btn) btn.onclick = () => {
        const u = document.getElementById('u-in').value.trim();
        const p = document.getElementById('p-in').value.trim();
        if(!u || !p) { error="All fields required"; renderApp(); return; }
        handleAuth(loginMode === 'login' || authTab === 'admin' ? 'login' : 'signup', u, p);
    };
}

function renderTabContent() {
    const c = document.getElementById('tab-content'); c.innerHTML = '';
    if(activeTab === 'chat') renderPrivateChat(c);
    else if(activeTab === 'downloads') renderDownloads(c);
    else if(activeTab === 'classifier') renderClassifier(c);
    else if(activeTab === 'decode') renderDecoder(c);
    else if(activeTab === 'encode' && currentUserData.role === 'admin') renderEncode(c);
    else if(activeTab === 'admin' && currentUserData.role === 'admin') renderAdminControls(c);
    if(window.lucide) window.lucide.createIcons();
}

async function renderPrivateChat(container) {
    if(chatInterval) { clearInterval(chatInterval); chatInterval = null; }
    container.innerHTML = `<div class="flex h-full w-full pb-16 md:pb-0"><div class="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0"><div class="p-4 border-b border-slate-800"><h2 class="font-bold text-white text-lg">Contacts</h2></div><div id="users-list" class="flex-1 overflow-y-auto p-2"><div class="text-slate-500 text-sm p-4">Loading...</div></div></div><div class="flex-1 flex flex-col bg-slate-950">${selectedChatUser ? UI.renderChatTemplate(selectedChatUser, [], currentUserData) : '<div class="flex items-center justify-center h-full text-slate-500">Select a contact</div>'}</div></div>`;
    const list = document.getElementById('users-list');
    if(list) {
        try {
            const users = await DB.login ? [] : [];
            if(users.length === 0) {
                list.innerHTML = `<div class="p-4 text-slate-500 text-sm">No verified users</div>`;
            } else {
                list.innerHTML = users.map(u => `<div onclick="window.selectUser('${u.username}')" class="p-3 cursor-pointer hover:bg-slate-800 rounded">${u.username}</div>`).join('');
            }
        } catch(e) { list.innerHTML = `<div class="p-4 text-red-400 text-sm">${e.message}</div>`; }
    }
}

async function renderDownloads(c) {
    c.innerHTML = `<div class="p-8"><h2 class="text-2xl font-bold text-white mb-8">Public Gallery</h2><div id="gallery-grid" class="grid grid-cols-1 md:grid-cols-3 gap-6">Loading...</div></div>`;
    try {
        const items = await DB.getGallery();
        const g = document.getElementById('gallery-grid');
        if(g) g.innerHTML = items.length ? items.map(i => `<div class="bg-slate-800 rounded"><img src="${i.imageUrl}" class="w-full h-48 object-cover rounded"><div class="p-4"><div class="font-bold text-white">${i.title||'Artifact'}</div></div></div>`).join('') : '<div class="text-slate-500">No artifacts found</div>';
    } catch(e) { console.error(e); }
}

function renderClassifier(c) {
    c.innerHTML = `<div class="p-8 max-w-2xl mx-auto"><h2 class="text-2xl font-bold text-white mb-4">AI Steganalysis</h2><input type="file" id="cl-f" class="hidden" accept="image/*" /><label for="cl-f" class="cursor-pointer block p-8 border-2 border-dashed border-slate-600 rounded-xl text-center"><div class="text-slate-400">Click to upload image</div></label><div id="cl-r" class="hidden mt-6 text-center"></div></div>`;
    const f = document.getElementById('cl-f');
    if(f) f.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const img = new Image();
        img.src = URL.createObjectURL(file);
        const r = document.getElementById('cl-r');
        r.classList.remove('hidden');
        r.innerHTML = '<span class="text-blue-400">ANALYZING...</span>';
        img.onload = () => {
            const cv = document.createElement('canvas');
            cv.width = img.width; cv.height = img.height;
            const ctx = cv.getContext('2d'); ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, cv.width, cv.height);
            const { gray, width, height } = Backend.rgbaToGrayscale(imgData.data, cv.width, cv.height, 1);
            const sChi = Backend.chiSquareLSBScore(gray);
            const sRS = Backend.rsFlipScore(gray, width, height);
            const sCorr = Backend.correlationDropScore(gray, width, height);
            const prob = Backend.clamp01(0.45 * sChi + 0.35 * sRS + 0.20 * sCorr);
            const isStego = prob >= 0.5;
            r.innerHTML = `<div class="text-xl font-bold ${isStego ? 'text-red-400' : 'text-green-400'}">${isStego ? 'STEGO DETECTED' : 'CLEAN'} (${(prob * 100).toFixed(1)}%)</div>`;
        };
    };
}

function renderDecoder(c) {
    c.innerHTML = `<div class="p-8 max-w-xl mx-auto"><div class="bg-slate-800/50 p-6 rounded-xl"><h2 class="text-xl font-bold text-white mb-4">Decrypt</h2><input type="password" id="dec-pass" class="w-full p-2 bg-slate-900 border border-slate-600 rounded mb-4" placeholder="Key"><input type="file" id="dec-in" class="block w-full mb-4" accept="image/*"/><button id="dec-btn" class="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-bold">DECRYPT</button><div id="dec-out" class="mt-4 hidden p-4 rounded bg-slate-900 border border-slate-700 text-slate-300"></div></div></div>`;
    const btn = document.getElementById('dec-btn');
    if(btn) btn.onclick = async () => {
        const p = document.getElementById('dec-pass').value;
        const f = document.getElementById('dec-in').files[0];
        const o = document.getElementById('dec-out');
        if(!p||!f) return;
        await fetchGlobalSettings();
        if(p !== globalSettings.decodePassword) { o.innerHTML='INVALID KEY'; o.classList.remove('hidden'); return; }
        const i = new Image(); i.src = URL.createObjectURL(f);
        i.onload = () => {
            const cv = document.createElement('canvas'); cv.width = i.width; cv.height = i.height;
            const ctx = cv.getContext('2d'); ctx.drawImage(i,0,0);
            const d = ctx.getImageData(0,0,cv.width,cv.height).data;
            let b="", m=""; for(let j=0;j<d.length;j+=4)for(let k=0;k<3;k++)b+=(d[j+k]&1);
            for(let j=0;j<b.length;j+=8){const v=parseInt(b.substr(j,8),2); if(v===0)break; m+=String.fromCharCode(v);}
            const e = m.indexOf("###END###");
            o.innerHTML = e!==-1 ? m.substring(0,e) : 'NO DATA';
            o.classList.remove('hidden');
        };
    };
}

async function renderAdminControls(c) {
    c.innerHTML = `<div class="p-6 grid md:grid-cols-2 gap-6"><div class="bg-slate-800/50 p-6 rounded"><h3 class="font-bold text-white mb-4">Pending Users</h3><div id="adm-list" class="space-y-2">Loading...</div></div><div class="bg-slate-800/50 p-6 rounded"><h3 class="font-bold text-white mb-4">Global Key</h3><input id="gk-in" class="w-full p-2 bg-slate-900 border border-slate-600 rounded mb-3" placeholder="New Key" value="${globalSettings.decodePassword || ''}"><button id="gk-save" class="w-full bg-blue-600 text-white py-2 rounded font-bold">SAVE</button></div></div>`;
    const refreshList = async () => {
        const l = document.getElementById('adm-list');
        if(!l) return;
        try {
            const pending = await DB.getPendingUsers();
            l.innerHTML = pending.length ? pending.map(x=>`<div class="flex justify-between items-center p-3 bg-slate-900 rounded border border-slate-700"><span class="font-mono text-slate-300">${x.username}</span><button onclick="window.verify('${x._id}')" class="text-[10px] font-bold bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded">APPROVE</button></div>`).join('') : '<p class="text-slate-500 text-sm">No pending requests</p>';
        } catch(e) { l.innerHTML = `<p class="text-red-400 text-sm">${e.message}</p>`; }
    };
    window.verify = async (id) => {
        try {
            await DB.approveUser(id);
            await refreshList();
        } catch(e) { console.error(e); }
    };
    const saveBtn = document.getElementById('gk-save');
    if(saveBtn) saveBtn.onclick = async () => {
        const v = document.getElementById('gk-in').value;
        if(v) {
            try {
                await DB.updateSettings(globalSettings._id || globalSettings.id, v);
                alert('Saved');
            } catch(e) { alert('Error: ' + e.message); }
        }
    };
    await refreshList();
}

function renderEncode(c) {
    c.innerHTML = `<div class="p-8 max-w-xl mx-auto"><div class="bg-slate-800/50 p-6 rounded"><h2 class="font-bold text-white mb-4">Encode & Publish</h2><input type="file" id="enc-f" class="block w-full mb-4" accept="image/*"><textarea id="enc-m" class="w-full bg-slate-900 border border-slate-600 rounded p-2 mb-4 text-white" rows="3" placeholder="Secret message..."></textarea><button id="enc-btn" class="w-full bg-blue-600 text-white py-2 rounded font-bold">ENCODE</button><div id="enc-stat" class="mt-4 text-center text-sm text-slate-400"></div></div></div>`;
    const btn = document.getElementById('enc-btn');
    if(btn) btn.onclick = () => {
        const f = document.getElementById('enc-f').files[0];
        const m = document.getElementById('enc-m').value;
        if(!f||!m) return;
        const img = new Image();
        img.src = URL.createObjectURL(f);
        img.onload = async () => {
            const cv = document.createElement('canvas');
            const w = img.width > 800 ? 800 : img.width;
            const h = img.width > 800 ? img.height * (800/img.width) : img.height;
            cv.width = w; cv.height = h;
            const ctx = cv.getContext('2d');
            ctx.drawImage(img,0,0,w,h);
            const d = ctx.getImageData(0,0,w,h).data;
            const bin = m.split('').map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join('') + "001000110010001100100011010001010100111001000100001000110010001100100011";
            let idx = 0;
            for(let i=0;i<d.length;i+=4)for(let j=0;j<3;j++){if(idx<bin.length)d[i+j]=(d[i+j]&0xFE)|parseInt(bin[idx++]);}
            ctx.putImageData(new ImageData(d,w,h),0,0);
            const url = cv.toDataURL('image/png');
            const item = {imageUrl:url, timestamp:Date.now(), title:"Artifact"};
            try {
                await DB.addToGallery(item);
                document.getElementById('enc-stat').innerHTML = "PUBLISHED";
                document.getElementById('enc-stat').className = "mt-4 text-center text-sm text-green-400";
            } catch(e) { console.error(e); }
        };
    };
}

function setupForm(handleSend) {
    const f = document.getElementById('chat-form');
    if(f) f.onsubmit = (e) => { 
        e.preventDefault();
        const t = document.getElementById('text-input').value.trim(); 
        if(t) { handleSend(t); document.getElementById('text-input').value=''; } 
    };
}

window.onload = initApp;
