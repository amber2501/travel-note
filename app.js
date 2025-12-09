<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>東京旅程規劃與記帳</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>✈️ 東京八天旅程</h1>

    <section id="itinerary-list">
        </section>

    <section id="expense-tracker">
        <h2>💰 每日記賬</h2>
        <form id="expense-form">
            <label for="expense-day">日期/Day:</label>
            <input type="number" id="expense-day" required min="1" max="8">
            
            <button type="submit">💾 記錄支出</button>
        </form>

        <hr>
        
        <h3>Day <span id="current-day-display">1</span> 總支出: <span id="daily-total">0 JPY</span></h3>
        <ul id="expense-list">
            </ul>
    </section>

    <script src="app.js"></script>
</body>
</html>
