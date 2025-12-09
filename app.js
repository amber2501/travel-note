// 全域變數來儲存設定和數據
let tripSettings = {
    destination: '',
    startDate: null,
    duration: 0
};
let expenses = []; // 儲存所有費用數據

// --- 函式: 頁面切換邏輯 (核心修正) ---
function switchPage(targetPageId) {
    // 1. 隱藏所有頁面
    document.querySelectorAll('.app-page').forEach(page => page.classList.add('hidden'));
    
    // 2. 顯示目標頁面
    const targetPage = document.getElementById(targetPageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
    
    const bottomNav = document.getElementById('bottom-nav');

    // 3. 處理導覽條的顯示和按鈕狀態
    if (targetPageId === 'setup-page') {
        // 如果回到設定頁，隱藏導覽條
        bottomNav.classList.add('hidden');
    } else {
        // 切換到行程或記帳頁時，顯示導覽條
        bottomNav.classList.remove('hidden');
        
        // 更新導覽條按鈕的 active 狀態
        document.querySelectorAll('#bottom-nav .nav-item').forEach(nav => nav.classList.remove('active'));
        const activeNavButton = document.querySelector(`#bottom-nav button[data-page="${targetPageId}"]`);
        if (activeNavButton) {
            activeNavButton.classList.add('active');
        }
    }
}


// --- 函式: 根據設定渲染行程列表 (確保有內容生成) ---
function renderItinerary() {
    const list = document.getElementById('itinerary-list');
    if (!list) return;

    list.innerHTML = '';
    
    // 檢查 tripSettings 是否已設定
    if (tripSettings.duration === 0) {
        list.innerHTML = `<p class="card" style="text-align:center;">請先在「旅程設定」頁面設定天數。</p>`;
        return;
    }

    // 根據天數生成卡片
    for (let i = 1; i <= tripSettings.duration; i++) {
        const card = document.createElement('div');
        card.className = 'card day-card';
        // 顯示當前日期 (如果設定了起始日期)
        let displayDate = '日期未定';
        if (tripSettings.startDate) {
            const date = new Date(tripSettings.startDate);
            date.setDate(date.getDate() + i - 1);
            displayDate = `${date.getMonth() + 1}月${date.getDate()}日`;
        }

        card.innerHTML = `
            <h4>Day ${i}：${displayDate}</h4>
            <p><strong>地點：</strong>請在此新增規劃</p>
            <p style="font-size:0.9em; color:#666;">點擊編輯或新增行程細節</p>
        `;
        list.appendChild(card);
    }
}


// --- 事件監聽: 處理起始設定表單 (解決跳轉問題的核心) ---
document.getElementById('setup-form').addEventListener('submit', function(e) {
    e.preventDefault(); // 阻止頁面刷新

    // 1. 儲存設定
    tripSettings.destination = document.getElementById('destination').value;
    tripSettings.startDate = document.getElementById('start-date').value;
    tripSettings.duration = parseInt(document.getElementById('duration').value);

    // 2. 更新行程頁標題
    document.getElementById('itinerary-title').textContent = `📝 ${tripSettings.destination} ${tripSettings.duration}天行程`;

    // 3. 渲染行程列表
    renderItinerary();
    
    // 4. 切換到行程頁面
    switchPage('itinerary-page');
});


// --- 事件監聽: 導覽列切換 ---
document.querySelectorAll('#bottom-nav .nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const targetPageId = item.getAttribute('data-page');
        // 假設 "bonuses-page" 頁面不存在，忽略點擊
        if (targetPageId !== 'bonuses-page') {
            switchPage(targetPageId);
            if (targetPageId === 'expense-page') {
                // 如果切換到記帳頁，刷新當前 Day 1 的支出列表
                displayExpenses(1); 
            }
        }
    });
});


// --- 應用程式初始化 ---
window.onload = () => {
    // 確保一開始顯示設定頁
    switchPage('setup-page');
    
    // 初始化記帳相關邏輯 (如果需要從 localStorage 載入)
    // loadExpenses(); 
};

// --- (保留上次提供的 displayExpenses 和 expense form 邏輯) ---
// 為了完整性，建議將以下函式也貼入您的 app.js
/*
function displayExpenses(day) { ... }
document.getElementById('expense-form').addEventListener('submit', function(e) { ... });
*/
