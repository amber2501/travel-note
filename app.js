// 全域變數來儲存設定
let tripSettings = {
    destination: '',
    startDate: null,
    duration: 0
};
// 儲存所有費用
let expenses = []; 

// --- 函式: 頁面切換邏輯 (重寫以處理 Setup Page) ---
function switchPage(targetPageId) {
    document.querySelectorAll('.app-page').forEach(page => page.classList.add('hidden'));
    document.getElementById(targetPageId).classList.remove('hidden');
    
    // 導覽列狀態更新 (如果目標頁面不是設定頁)
    if (targetPageId !== 'setup-page') {
        document.getElementById('bottom-nav').classList.remove('hidden');
        document.querySelectorAll('#bottom-nav .nav-item').forEach(nav => nav.classList.remove('active'));
        document.querySelector(`#bottom-nav button[data-page="${targetPageId}"]`).classList.add('active');
    } else {
        document.getElementById('bottom-nav').classList.add('hidden');
    }
}


// --- 事件監聽: 處理起始設定表單 ---
document.getElementById('setup-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // 1. 儲存設定
    tripSettings.destination = document.getElementById('destination').value;
    tripSettings.startDate = document.getElementById('start-date').value;
    tripSettings.duration = parseInt(document.getElementById('duration').value);

    // 2. 更新行程頁標題
    document.getElementById('itinerary-title').textContent = `${tripSettings.destination} ${tripSettings.duration}天行程`;

    // 3. 切換到行程頁面
    switchPage('itinerary-page');
    
    // 4. (呼叫函式) 根據新的天數重新渲染行程列表
    renderItinerary();
});

// --- 事件監聽: 導覽列切換 (保留與上次相同邏輯) ---
document.querySelectorAll('#bottom-nav .nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const targetPageId = item.getAttribute('data-page');
        if (targetPageId !== 'bonuses-page') {
            switchPage(targetPageId);
        }
    });
});


// --- 行程渲染函式 (需更新以使用新的 tripSettings) ---
function renderItinerary() {
    const list = document.getElementById('itinerary-list');
    list.innerHTML = '';
    
    // 假設行程數據已經定義在一個 JS 陣列中 (或從 localStorage/API載入)
    const itineraryData = [
        // 為了演示，我們使用一個簡單的循環
    ];
    
    for (let i = 1; i <= tripSettings.duration; i++) {
        const card = document.createElement('div');
        card.className = 'card day-card';
        card.innerHTML = `<h4>Day ${i}：探索 ${tripSettings.destination}</h4>
                          <p>（規劃內容待載入）</p>`;
        list.appendChild(card);
    }
}


// --- 應用程式初始化 ---
window.onload = () => {
    // 確保一開始顯示設定頁
    switchPage('setup-page');
    // ... 其他初始化，如載入 localStorage 數據
};

// ... (保留上次提供的 displayExpenses 和 expense form 邏輯) ...
