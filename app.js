// =======================================================
// ## 應用程式全域變數 (Global Variables)
// =======================================================
let tripSettings = {
    destination: '',
    startDate: null,
    duration: 0
};
let expenses = []; // 儲存費用數據
let itineraryDetails = {}; // 儲存行程細節： { day_1: "...", day_2: "...", ... }

// =======================================================
// ## LocalStorage 數據管理 (Data Management)
// =======================================================

const TRIP_SETTINGS_KEY = 'tripSettings';
const ITINERARY_KEY = 'tripItineraryDetails';
const EXPENSES_KEY = 'tokyoExpenses'; // 沿用舊名

/** 載入/儲存旅程設定 */
function loadTripSettings() {
    const json = localStorage.getItem(TRIP_SETTINGS_KEY);
    // 使用 Object.assign 確保載入的資料能更新 tripSettings 的預設結構
    Object.assign(tripSettings, json ? JSON.parse(json) : {});
}

function saveTripSettings() {
    localStorage.setItem(TRIP_SETTINGS_KEY, JSON.stringify(tripSettings));
}

/** 載入/儲存行程細節 */
function loadItineraryDetails() {
    const json = localStorage.getItem(ITINERARY_KEY);
    itineraryDetails = json ? JSON.parse(json) : {};
}

function saveItineraryDetails() {
    localStorage.setItem(ITINERARY_KEY, JSON.stringify(itineraryDetails));
}

/** 載入/儲存費用數據 (從舊程式碼保留) */
function loadExpenses() {
    const json = localStorage.getItem(EXPENSES_KEY);
    return json ? JSON.parse(json) : [];
}

function saveExpenses(currentExpenses) {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(currentExpenses));
}


// =======================================================
// ## 頁面與導覽邏輯 (Page & Navigation Logic)
// =======================================================

function switchPage(targetPageId) {
    // 隱藏所有頁面
    document.querySelectorAll('.app-page').forEach(page => page.classList.add('hidden'));
    
    // 顯示目標頁面
    const targetPage = document.getElementById(targetPageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
    
    const bottomNav = document.getElementById('bottom-nav');

    if (targetPageId === 'setup-page') {
        bottomNav.classList.add('hidden');
    } else {
        bottomNav.classList.remove('hidden');
        
        // 更新導覽列的啟用狀態
        document.querySelectorAll('#bottom-nav .nav-item').forEach(nav => nav.classList.remove('active'));
        const activeNavButton = document.querySelector(`#bottom-nav button[data-page="${targetPageId}"]`);
        if (activeNavButton) {
            activeNavButton.classList.add('active');
        }
    }
}


// =======================================================
// ## 行程規劃功能 (Itinerary Feature)
// =======================================================

function renderItinerary() {
    loadItineraryDetails(); 
    const list = document.getElementById('itinerary-list');
    if (!list) return;

    list.innerHTML = '';
    
    // 檢查旅程設定是否完成
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
            // setDate(date.getDate() + i - 1) 確保日期正確推進
            date.setDate(date.getDate() + i - 1); 
            displayDate = ` (${date.getMonth() + 1}/${date.getDate()})`;
        }

        const card = document.createElement('div');
        card.className = 'card day-card';
        // 使用 contenteditable="true" 實現點擊即編輯的 UX
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
    
    // 綁定儲存事件：當用戶點擊外部區域 (blur) 時自動儲存內容
    document.querySelectorAll('.itinerary-editable').forEach(editor => {
        editor.removeEventListener('blur', saveItineraryOnBlur); // 避免重複綁定
        editor.addEventListener('blur', saveItineraryOnBlur);
    });
}

/** Blur 事件處理器：自動儲存行程內容 */
function saveItineraryOnBlur() {
    const dayKey = this.id;
    // 將編輯後的 HTML 內容存入數據結構
    itineraryDetails[dayKey] = this.innerHTML;
    saveItineraryDetails();
    console.log(`Day ${dayKey} 內容已儲存！`);
}


// =======================================================
// ## 記帳功能邏輯 (Expense Feature)
// =======================================================

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

// =======================================================
// ## 應用程式初始化與事件監聽 (Initialization & Event Listeners)
// =======================================================

// 處理起始設定表單
document.getElementById('setup-form').addEventListener('submit', function(e) {
    e.preventDefault();

    tripSettings.destination = document.getElementById('destination').value;
    tripSettings.startDate = document.getElementById('start-date').value;
    tripSettings.duration = parseInt(document.getElementById('duration').value);

    saveTripSettings(); // 新增：儲存設定

    // 更新行程頁標題
    document.getElementById('itinerary-title').textContent = `📝 ${tripSettings.destination} ${tripSettings.duration}天行程`;

    // 渲染行程列表
    renderItinerary();
    
    // 切換到行程頁面
    switchPage('itinerary-page');
});

// 處理記帳表單
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
    // 保留當前選擇的天數
    document.getElementById('expense-day').value = newExpense.day; 
});


// 導覽列切換事件
document.querySelectorAll('#bottom-nav .nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const targetPageId = item.getAttribute('data-page');
        if (targetPageId !== 'bonuses-page') {
            switchPage(targetPageId);
            if (targetPageId === 'expense-page') {
                // 預設顯示 Day 1 支出，並確保費用表單的天數選擇器也更新
                const initialDay = 1;
                document.getElementById('expense-day').value = initialDay;
                displayExpenses(initialDay); 
            }
        }
    });
});


// 應用程式啟動 (初始化)
window.onload = () => {
    loadTripSettings(); // 嘗試從 localStorage 載入上次的設定

    if (tripSettings.duration > 0) {
        // 如果有上次的設定，填充表單值並跳轉到行程頁
        document.getElementById('destination').value = tripSettings.destination;
        document.getElementById('start-date').value = tripSettings.startDate;
        document.getElementById('duration').value = tripSettings.duration;
        
        document.getElementById('itinerary-title').textContent = `📝 ${tripSettings.destination} ${tripSettings.duration}天行程`;
        renderItinerary();
        switchPage('itinerary-page');
    } else {
        // 否則顯示設定頁
        switchPage('setup-page');
    }
};
