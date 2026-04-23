let allPoems = [];
let currentPage = 1;
let currentDynasty = '';
let currentQuiz = [];
let currentQuestionIndex = 0;
let score = 0;
let gameTimer = null;
let gameScore = 0;
let gameKeyword = '';
let totalAnswered = 0;
let dataLoaded = false;
let currentPoems = [];

async function loadData() {
    if (dataLoaded) return;
    try {
        const response = await fetch('./static/data/poems.min.json');
        allPoems = await response.json();
        dataLoaded = true;
        console.log(`Loaded ${allPoems.length} poems`);
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    
    document.querySelectorAll('.main-nav .nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.main-nav .nav-item[data-tab="${tabName}"]`)?.classList.add('active');
}

function searchFromHeader() {
    const keyword = document.getElementById('headerSearchInput').value.trim();
    if (keyword) {
        showTab('library');
        document.getElementById('searchInput').value = keyword;
        searchPoems();
    }
}

async function loadStats() {
    await loadData();
    const dynasties = [...new Set(allPoems.map(p => p.dynasty))];
    const authors = [...new Set(allPoems.map(p => p.author_name))];
    document.getElementById('totalPoems').textContent = allPoems.length.toLocaleString();
    document.getElementById('totalAuthors').textContent = authors.length.toLocaleString();
    document.getElementById('totalDynasties').textContent = dynasties.length;
}

async function loadFeaturedPoem() {
    await loadData();
    if (allPoems.length > 0) {
        const poem = allPoems[Math.floor(Math.random() * allPoems.length)];
        const content = poem.content || [];
        document.getElementById('featuredPoem').innerHTML = `
            <h3 class="poem-title">${poem.title}</h3>
            <p class="poem-author">[${poem.dynasty}] ${poem.author_name}</p>
            <div class="poem-content">
                ${content.slice(0, 4).map(line => `<p>${line}</p>`).join('')}
            </div>
        `;
    }
}

async function loadPoemList(page = 1, dynasty = '') {
    await loadData();
    currentPage = page;
    currentDynasty = dynasty;
    
    const list = document.getElementById('poemList');
    list.innerHTML = '<div class="loading">加载中</div>';
    
    let filtered = allPoems;
    if (dynasty) {
        filtered = filtered.filter(p => p.dynasty === dynasty);
    }
    
    const pageSize = 20;
    const start = (page - 1) * pageSize;
    const pageData = filtered.slice(start, start + pageSize);
    
    if (pageData.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#666;">暂无数据</p>';
        return;
    }
    
    list.innerHTML = pageData.map(poem => `
        <div class="poem-list-item" onclick='showPoemDetail(${JSON.stringify(poem).replace(/'/g, "&#39;")})'>
            <h3>${poem.title}</h3>
            <p>[${poem.dynasty}] ${poem.author_name || ''}</p>
            <div class="poem-content">
                ${(poem.content || []).slice(0, 4).map(line => `<p>${line}</p>`).join('')}
            </div>
        </div>
    `).join('');
    
    loadPagination(filtered.length, page);
}

function loadPagination(total, currentPage) {
    const totalPages = Math.ceil(total / 20);
    const pagination = document.getElementById('pagination');
    
    let html = `
        <button onclick="loadPoemList(${currentPage - 1}, '${currentDynasty}')" 
                ${currentPage === 1 ? 'disabled' : ''}>上一页</button>
        <span style="padding:8px;">第 ${currentPage}/${totalPages} 页</span>
        <button onclick="loadPoemList(${currentPage + 1}, '${currentDynasty}')" 
                ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>
    `;
    
    pagination.innerHTML = html;
}

function filterByDynasty(dynasty) {
    document.querySelectorAll('.filter-tag').forEach(tag => tag.classList.remove('active'));
    event.target.classList.add('active');
    loadPoemList(1, dynasty);
}

async function searchPoems() {
    await loadData();
    const keyword = document.getElementById('searchInput').value.trim();
    if (!keyword) {
        loadPoemList(1, currentDynasty);
        return;
    }
    
    const list = document.getElementById('poemList');
    list.innerHTML = '<div class="loading">搜索中</div>';
    
    const kw = keyword.toLowerCase();
    const results = allPoems.filter(p => 
        p.title.toLowerCase().includes(kw) ||
        p.author_name.toLowerCase().includes(kw) ||
        (p.content || []).some(line => line.toLowerCase().includes(kw))
    );
    
    if (results.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#666;">未找到相关诗词</p>';
        return;
    }
    
    const pageData = results.slice(0, 20);
    list.innerHTML = pageData.map(poem => `
        <div class="poem-list-item" onclick='showPoemDetail(${JSON.stringify(poem).replace(/'/g, "&#39;")})'>
            <h3>${poem.title}</h3>
            <p>[${poem.dynasty}] ${poem.author_name || ''}</p>
            <div class="poem-content">
                ${(poem.content || []).slice(0, 4).map(line => `<p>${line}</p>`).join('')}
            </div>
        </div>
    `).join('');
    
    loadPagination(results.length, 1);
}

function showPoemDetail(poemData) {
    const poem = typeof poemData === 'string' ? JSON.parse(poemData) : poemData;
    if (!poem) return;
    
    const content = poem.content || [];
    let html = `
        <h2 class="poem-title">${poem.title}</h2>
        <p class="poem-author">[${poem.dynasty}] ${poem.author_name || ''}</p>
        <div class="poem-content">
            ${content.map(line => `<p>${line}</p>`).join('')}
        </div>
    `;
    
    if (poem.fanyi) {
        html += `<h3 style="margin-top:20px;color:#8B4513;">译文</h3><p style="line-height:1.8;color:#666;">${poem.fanyi}</p>`;
    }
    
    if (poem.shangxi) {
        html += `<h3 style="margin-top:20px;color:#8B4513;">赏析</h3><p style="line-height:1.8;color:#666;">${poem.shangxi}</p>`;
    }
    
    document.getElementById('modalBody').innerHTML = html;
    document.getElementById('poemModal').classList.add('active');
}

function closeModal() {
    document.getElementById('poemModal').classList.remove('active');
}

document.getElementById('poemModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

function startQuiz(type) {
    document.getElementById('quizStart').classList.add('hidden');
    document.getElementById('quizQuestion').classList.remove('hidden');
    
    if (type === 'fill_blank') {
        generateFillBlankQuestion();
    } else if (type === 'sort') {
        generateSortQuestion();
    }
}

async function generateFillBlankQuestion() {
    await loadData();
    if (allPoems.length === 0) return;
    
    const poem = allPoems[Math.floor(Math.random() * allPoems.length)];
    const content = poem.content || [];
    
    const lineIndex = Math.floor(Math.random() * content.length);
    const line = content[lineIndex];
    const cleanLine = line.replace(/[，。！？、]/g, '');
    
    if (cleanLine.length > 3) {
        const blankIndex = Math.floor(Math.random() * cleanLine.length);
        const answer = cleanLine[blankIndex];
        
        const options = [answer];
        for (let i = 0; i < 3 && options.length < 4; i++) {
            const randomLine = content[Math.floor(Math.random() * content.length)];
            const randomChar = randomLine.replace(/[，。！？、]/g, '')[Math.floor(Math.random() * cleanLine.length)];
            if (randomChar && !options.includes(randomChar)) {
                options.push(randomChar);
            }
        }
        
        while (options.length < 4) {
            options.push('字');
        }
        
        options.sort(() => Math.random() - 0.5);
        
        const questionText = line.replace(cleanLine[blankIndex], '____');
        
        document.getElementById('questionText').textContent = `《${poem.title}》填空：${questionText}`;
        
        const optionsHtml = options.map(opt => `
            <div class="quiz-option" onclick="selectAnswer(this, '${opt}', '${answer}')">${opt}</div>
        `).join('');
        
        document.getElementById('questionOptions').innerHTML = optionsHtml;
        document.getElementById('quizResult').innerHTML = '';
        document.getElementById('nextBtn').style.display = 'none';
        
        currentQuiz = { type: 'fill_blank', answer, poem };
    }
}

async function generateSortQuestion() {
    await loadData();
    if (allPoems.length === 0) return;
    
    const poem = allPoems[Math.floor(Math.random() * allPoems.length)];
    const content = poem.content || [];
    
    if (content.length >= 4) {
        const shuffled = [...content].sort(() => Math.random() - 0.5);
        
        document.getElementById('questionText').textContent = `请将《${poem.title}》的诗句按正确顺序排列（点击选项）：`;
        
        const optionsHtml = shuffled.map((line, i) => `
            <div class="quiz-option" onclick="selectSortAnswer(this, ${i})" data-line="${line}">${line}</div>
        `).join('');
        
        document.getElementById('questionOptions').innerHTML = optionsHtml;
        document.getElementById('quizResult').innerHTML = '';
        document.getElementById('nextBtn').style.display = 'none';
        
        currentQuiz = { type: 'sort', correct: content, poem, selected: [] };
    }
}

function selectAnswer(element, selected, correct) {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => {
        opt.onclick = null;
        if (opt.textContent === correct) {
            opt.classList.add('correct');
        } else if (opt.textContent === selected && selected !== correct) {
            opt.classList.add('wrong');
        }
    });

    const isCorrect = selected === correct;
    if (isCorrect) score++;
    totalAnswered++;
    
    document.getElementById('quizResult').innerHTML = `
        <div class="result-message ${isCorrect ? 'success' : 'error'}">
            ${isCorrect ? '✓ 正确！' : '✗ 错误！正确答案是：' + correct}
        </div>
    `;
    document.getElementById('nextBtn').style.display = 'inline-block';
}

function selectSortAnswer(element, index) {
    if (!currentQuiz.selected) currentQuiz.selected = [];
    
    if (element.classList.contains('selected')) {
        element.classList.remove('selected');
        currentQuiz.selected = currentQuiz.selected.filter(i => i !== index);
    } else {
        element.classList.add('selected');
        currentQuiz.selected.push(index);
    }
    
    if (currentQuiz.selected.length === currentQuiz.correct.length) {
        const selectedLines = currentQuiz.selected.map(i => {
            const options = document.querySelectorAll('.quiz-option');
            return options[i].getAttribute('data-line');
        });
        
        const isCorrect = JSON.stringify(selectedLines) === JSON.stringify(currentQuiz.correct);
        totalAnswered++;
        if (isCorrect) score++;
        
        let resultHtml = '';
        if (isCorrect) {
            resultHtml = `<div class="result-message success">✓ 正确！</div>`;
        } else {
            resultHtml = `
                <div class="result-message error">✗ 顺序错误！</div>
                <div class="result-message success" style="margin-top:10px;">
                    <strong>正确答案：</strong><br>
                    ${currentQuiz.correct.map((line, i) => `${i + 1}. ${line}`).join('<br>')}
                </div>
            `;
        }
        
        document.getElementById('quizResult').innerHTML = resultHtml;
        document.getElementById('nextBtn').style.display = 'inline-block';
        
        document.querySelectorAll('.quiz-option').forEach(opt => opt.onclick = null);
    }
}

function nextQuestion() {
    if (currentQuiz.type === 'fill_blank') {
        generateFillBlankQuestion();
    } else {
        generateSortQuestion();
    }
}

function startGame(keyword) {
    gameKeyword = keyword;
    gameScore = 0;
    document.getElementById('gameStart').classList.add('hidden');
    document.getElementById('gamePlay').classList.remove('hidden');
    document.getElementById('gameKeyword').textContent = `"${keyword}"`;
    document.getElementById('gameScore').textContent = '0';
    document.getElementById('gameResult').innerHTML = '';
    
    let timeLeft = 30;
    document.getElementById('gameTimer').textContent = timeLeft;
    
    gameTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('gameTimer').textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(gameTimer);
            endGame();
        }
    }, 1000);
}

function submitGameAnswer() {
    const input = document.getElementById('gameInput').value.trim();
    if (!input) return;
    
    if (input.includes(gameKeyword)) {
        gameScore += 10;
        document.getElementById('gameScore').textContent = gameScore;
        document.getElementById('gameResult').innerHTML = `
            <div class="result-message success">✓ 正确！+10分</div>
        `;
        document.getElementById('gameInput').value = '';
    } else {
        document.getElementById('gameResult').innerHTML = `
            <div class="result-message error">✗ 诗句中需要包含"${gameKeyword}"字</div>
        `;
    }
}

function endGame() {
    document.getElementById('gamePlay').innerHTML = `
        <h3>游戏结束！</h3>
        <div class="game-score">最终得分: ${gameScore}</div>
        <button class="btn" onclick="location.reload()">再来一局</button>
    `;
}

function drawRadarChart() {
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 300;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;
    
    const labels = ['记忆力', '理解力', '鉴赏力', '创作力', '广度'];
    const values = [0.8, 0.7, 0.6, 0.5, 0.9];
    const angleStep = (Math.PI * 2) / labels.length;
    
    ctx.strokeStyle = '#D2B48C';
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        for (let j = 0; j < labels.length; j++) {
            const angle = j * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * (radius * i / 5);
            const y = centerY + Math.sin(angle) * (radius * i / 5);
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }
    
    ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let j = 0; j < labels.length; j++) {
        const angle = j * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius * values[j]);
        const y = centerY + Math.sin(angle) * (radius * values[j]);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#333';
    ctx.font = '14px PingFang SC';
    ctx.textAlign = 'center';
    for (let j = 0; j < labels.length; j++) {
        const angle = j * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius + 25);
        const y = centerY + Math.sin(angle) * (radius + 25);
        ctx.fillText(labels[j], x, y);
    }
}

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchPoems();
});

document.getElementById('gameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitGameAnswer();
});

window.onload = () => {
    loadStats();
    loadFeaturedPoem();
    loadPoemList();
    drawRadarChart();
};
