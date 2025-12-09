// --- 應用程式全域變數 ---
let tripSettings = {
    destination: '',
    startDate: null,
    duration: 0
};
let expenses = []; // 儲存費用數據
let itineraryDetails = {}; // 儲存行程細節： { day_1: "早上NRT...", day_2: "全天AnimeJapan...", ... }


// --- localStorage 數據管理 ---

// 載入行程細節
function loadItineraryDetails() {
    const json = localStorage.getItem('tripItineraryDetails');
    itineraryDetails = json ? JSON.parse(json) : {};
}

// 儲存行程細節
function saveItineraryDetails() {
    localStorage.setItem('tripItineraryDetails', JSON.stringify(itineraryDetails));
}

// 載入費用數據 (從上次的步驟保留)
function loadExpenses() {
    const json = localStorage.getItem('tokyoExpenses');
    return json ? JSON.parse(json) : [];
}

// 儲存費用數據 (從上次的步驟保留)
function saveExpenses(currentExpenses) {
    localStorage.setItem('tokyoExpenses', JSON.stringify(currentExpenses));
}


// --- 頁面與導覽邏輯 (核心修正) ---

function switchPage(targetPageId) {
    document.querySelectorAll('.app-page').forEach(page => page.classList.add('hidden'));
    const targetPage = document.getElementById(targetPageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
    
    const bottomNav = document.getElementById('bottom-nav');

    if (targetPageId === 'setup-page') {
        bottomNav.classList.add('hidden');
    } else {
        bottomNav.classList.remove('hidden');
        document.querySelectorAll('#bottom-nav .nav-item').forEach(nav => nav.classList.remove('active'));
        const activeNavButton = document.querySelector(`#bottom-nav button[data-page="${targetPageId}"]`);
        if (activeNavButton) {
            activeNavButton.classList.add('active');
        }
    }
}


// --- 行程規劃紀錄功能實作 ---

function renderItinerary() {
    loadItineraryDetails(); // 載入儲存的行程細節
    const list = document.getElementById('itinerary-list');
    if (!list) return;

    list.innerHTML = '';
    
    // 檢查 tripSettings 是否已設定
    if (tripSettings.duration === 0) {
        list.innerHTML = `<p class="card" style="text-align:center;">請先在「旅程設定」頁面設定天數。</p>`;
        return;
    }
    
    for (let i = 1; i <= tripSettings.duration; i++) {
        const dayKey = `day_${i}`;
        const savedContent = itineraryDetails[dayKey] || 
                             `<div style="color:#888;">點擊此處開始規劃 Day ${i} 的行程細節...</div>`;
        
        let displayDate = '';
        if (tripSettings.startDate) {
            const date = new Date(tripSettings.startDate);
            date.setDate(date.getDate() + i - 1);
            displayDate = ` (${date.getMonth() + 1}/${date.getDate()})`;
        }

        const card = document.createElement('div');
        card.className = 'card day-card';
        card.innerHTML = `
            <h4 style="margin-bottom: 10px;">Day ${i}${displayDate}</h4>
            <div 
                id="${dayKey}" 
                class="itinerary-editable" 
                contenteditable="true"
            >${savedContent}</div>
        `;
        list.appendChild(card);
    }
    
    // 綁定儲存事件：當用戶停止編輯時儲存內容
    document.querySelectorAll('.itinerary-editable').forEach(editor => {
        editor.addEventListener('blur', function() {
            const dayKey = this.id;
            // 將編輯後的 HTML 內容存入數據結構
            itineraryDetails[dayKey] = this.innerHTML;
            saveItineraryDetails();
            console.log(`Day ${dayKey} 內容已儲存！`);
        });
    });
}


// --- 記帳功能邏輯 (從上次的步驟保留) ---

function displayExpenses(day) {
    expenses = loadExpenses();
    const dailyExpenses = expenses.filter(exp => exp.day === day);
    const list = document.getElementById('expense-list');
    const totalDisplay = document.getElementById('daily-total');
    
    list.innerHTML = '';
    let total = 0;

    dailyExpenses.forEach(exp => {
        total += exp.amount;
        const listItem = document.createElement('li');
        listItem.textContent = `[${exp.category}] ${exp.description}: ${exp.amount.toLocaleString()} 円`;
        list.appendChild(listItem);
    });

    totalDisplay.textContent = total.toLocaleString();
    document.getElementById('current-day-display').textContent = day;
}

document.getElementById('expense-form').addEventListener('submit', function(e) {
    e.preventDefault(); 
    let currentExpenses = loadExpenses(); 

    const newExpense = {
        id: Date.now(),
        day: parseInt(document.getElementById('expense-day').value),
        description: document.getElementById('item-desc').value,
        amount: parseFloat(document.getElementById('item-amount').value),
        category: document.getElementById('item-category').value,
    };

    currentExpenses.push(newExpense);
    saveExpenses(currentExpenses); 
    displayExpenses(newExpense.day);

    this.reset();
    document.getElementById('expense-day').value = newExpense.day; 
});


// --- 應用程式初始化與事件監聽 ---

// 處理起始設定表單
document.getElementById('setup-form').addEventListener('submit', function(e) {
    e.preventDefault();

    tripSettings.destination = document.getElementById('destination').value;
    tripSettings.startDate = document.getElementById('start-date').value;
    tripSettings.duration = parseInt(document.getElementById('duration').value);

    // 更新行程頁標題
    document.getElementById('itinerary-title').textContent = `📝 ${tripSettings.destination} ${tripSettings.duration}天行程`;

    // 渲染行程列表並綁定儲存事件
    renderItinerary();
    
    // 切換到行程頁面
    switchPage('itinerary-page');
});

// 導覽列切換
document.querySelectorAll('#bottom-nav .nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const targetPageId = item.getAttribute('data-page');
        if (targetPageId !== 'bonuses-page') {
            switchPage(targetPageId);
            if (targetPageId === 'expense-page') {
                // 預設顯示 Day 1 支出
                document.getElementById('expense-day').value = 1;
                displayExpenses(1); 
            }
        }
    });
});


// 應用程式啟動
window.onload = () => {
    // 嘗試從 localStorage 載入上次的設定
    const savedSettings = localStorage.getItem('tripSettings');
    if (savedSettings) {
        tripSettings = JSON.parse(savedSettings);
        // 如果有上次的設定，直接跳轉到行程頁
        document.getElementById('itinerary-title').textContent = `📝 ${tripSettings.destination} ${tripSettings.duration}天行程`;
        renderItinerary();
        switchPage('itinerary-page');
    } else {
        // 否則顯示設定頁
        switchPage('setup-page');
    }
};
