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
let currentUser = null;
let wrongQuestions = [];

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

let quizQuestionCount = 0;

function startQuiz(type) {
    quizQuestionCount = 0;
    document.getElementById('quizStart').classList.add('hidden');
    document.getElementById('quizQuestion').classList.remove('hidden');
    updateQuizProgress();
    
    if (type === 'fill_blank') {
        generateFillBlankQuestion();
    } else if (type === 'sort') {
        generateSortQuestion();
    }
}

function backToQuizStart() {
    document.getElementById('quizStart').classList.remove('hidden');
    document.getElementById('quizQuestion').classList.add('hidden');
    document.getElementById('quizResult').innerHTML = '';
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('questionOptions').innerHTML = '';
    document.getElementById('questionText').textContent = '';
    quizQuestionCount = 0;
    currentQuiz = null;
}

function updateQuizProgress() {
    quizQuestionCount++;
    document.getElementById('quizProgress').textContent = '第 ' + quizQuestionCount + ' 题';
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
    const options = document.querySelectorAll('#questionOptions .quiz-option');
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
    
    recordAnswer(isCorrect, {
        type: 'fill_blank',
        title: currentQuiz.poem.title,
        dynasty: currentQuiz.poem.dynasty,
        author: currentQuiz.poem.author_name,
        question: document.getElementById('questionText').textContent,
        answer: correct
    });
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
            const options = document.querySelectorAll('#questionOptions .quiz-option');
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
        
        document.querySelectorAll('#questionOptions .quiz-option').forEach(opt => opt.onclick = null);
        
        recordAnswer(isCorrect, {
            type: 'sort',
            title: currentQuiz.poem.title,
            dynasty: currentQuiz.poem.dynasty,
            author: currentQuiz.poem.author_name,
            correct: currentQuiz.correct
        });
    }
}

function nextQuestion() {
    updateQuizProgress();
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

// ========== 用户登录注册功能 ==========

function getUsers() {
    const users = localStorage.getItem('shiyunzhixue_users');
    return users ? JSON.parse(users) : {};
}

function saveUsers(users) {
    localStorage.setItem('shiyunzhixue_users', JSON.stringify(users));
}

function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
}

function showRegisterModal() {
    document.getElementById('registerModal').classList.add('active');
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerPassword2').value = '';
}

function closeRegisterModal() {
    document.getElementById('registerModal').classList.remove('active');
}

function switchToRegister() {
    closeLoginModal();
    setTimeout(() => showRegisterModal(), 200);
}

function switchToLogin() {
    closeRegisterModal();
    setTimeout(() => showLoginModal(), 200);
}

function register() {
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const password2 = document.getElementById('registerPassword2').value;
    
    if (!username || !password) {
        alert('请填写用户名和密码');
        return;
    }
    
    if (username.length < 3 || username.length > 20) {
        alert('用户名长度应为3-20位');
        return;
    }
    
    if (password.length < 6 || password.length > 20) {
        alert('密码长度应为6-20位');
        return;
    }
    
    if (password !== password2) {
        alert('两次输入的密码不一致');
        return;
    }
    
    const users = getUsers();
    if (users[username]) {
        alert('用户名已存在');
        return;
    }
    
    users[username] = {
        password: password,
        createdAt: new Date().toISOString(),
        stats: {
            totalAnswered: 0,
            correctCount: 0,
            wrongQuestions: []
        }
    };
    
    saveUsers(users);
    alert('注册成功！请登录');
    closeRegisterModal();
    setTimeout(() => showLoginModal(), 200);
}

function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        alert('请填写用户名和密码');
        return;
    }
    
    const users = getUsers();
    if (!users[username]) {
        alert('用户名不存在');
        return;
    }
    
    if (users[username].password !== password) {
        alert('密码错误');
        return;
    }
    
    currentUser = username;
    localStorage.setItem('shiyunzhixue_currentUser', username);
    wrongQuestions = [...(users[username].stats.wrongQuestions || [])];
    
    closeLoginModal();
    updateUIAfterLogin();
    alert('登录成功！欢迎 ' + username);
}

function logout() {
    console.log('logout function called');
    if (!confirm('确定要退出登录吗？')) return;
    
    currentUser = null;
    wrongQuestions = [];
    localStorage.removeItem('shiyunzhixue_currentUser');
    updateUIAfterLogout();
    alert('已退出登录');
}

function updateUIAfterLogin() {
    document.getElementById('userAuth').classList.add('hidden');
    document.getElementById('userInfo').classList.remove('hidden');
    document.getElementById('displayUsername').textContent = currentUser;
    document.getElementById('userNotLogin').classList.add('hidden');
    document.getElementById('userLoggedIn').classList.remove('hidden');
    updateUserStats();
    renderWrongQuestions();
}

function updateUIAfterLogout() {
    document.getElementById('userAuth').classList.remove('hidden');
    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('userNotLogin').classList.remove('hidden');
    document.getElementById('userLoggedIn').classList.add('hidden');
}

function updateUserStats() {
    if (!currentUser) return;
    const users = getUsers();
    const stats = users[currentUser].stats;
    
    const wrongCount = (stats.wrongQuestions || []).length;
    const correct = stats.correctCount || 0;
    const total = correct + wrongCount;
    
    document.getElementById('totalAnswered').textContent = total;
    document.getElementById('wrongCount').textContent = wrongCount;
    
    const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
    document.getElementById('accuracyRate').textContent = rate + '%';
}

function saveWrongQuestion(question) {
    if (!currentUser) return;
    const users = getUsers();
    if (!users[currentUser].stats.wrongQuestions) {
        users[currentUser].stats.wrongQuestions = [];
    }
    
    users[currentUser].stats.wrongQuestions.push({
        ...question,
        wrongTime: new Date().toISOString(),
        id: Date.now() + Math.random()
    });
    
    saveUsers(users);
    wrongQuestions = [...users[currentUser].stats.wrongQuestions];
    updateUserStats();
    renderWrongQuestions();
}

function renderWrongQuestions() {
    const container = document.getElementById('wrongQuestionsList');
    if (!container) return;
    
    const users = getUsers();
    const questions = currentUser ? (users[currentUser].stats.wrongQuestions || []) : [];
    
    if (questions.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">暂无错题，继续加油！</p>';
        return;
    }
    
    let html = '';
    questions.forEach((q, index) => {
        if (q.type === 'fill_blank') {
            html += `
                <div class="wrong-question-item">
                    <div class="wrong-question-header">
                        <span class="wrong-question-type">填空题</span>
                        <span class="wrong-question-time">${new Date(q.wrongTime).toLocaleDateString()}</span>
                    </div>
                    <div class="wrong-question-content">
                        <p><strong>《${q.title}》</strong> [${q.dynasty}] ${q.author}</p>
                        <p style="color:#666;margin:10px 0;">题目：${q.question}</p>
                        <p style="color:#c41a1a;">正确答案：<strong>${q.answer}</strong></p>
                    </div>
                    <button class="btn-remove" onclick="removeWrongQuestion(${index})">移除</button>
                </div>
            `;
        } else if (q.type === 'sort') {
            html += `
                <div class="wrong-question-item">
                    <div class="wrong-question-header">
                        <span class="wrong-question-type">排序题</span>
                        <span class="wrong-question-time">${new Date(q.wrongTime).toLocaleDateString()}</span>
                    </div>
                    <div class="wrong-question-content">
                        <p><strong>《${q.title}》</strong> [${q.dynasty}] ${q.author}</p>
                        <p style="color:#666;margin:10px 0;">请将以下诗句按正确顺序排列：</p>
                        <div class="correct-order">
                            <p style="color:#c41a1a;font-weight:bold;">正确顺序：</p>
                            ${q.correct.map((line, i) => `<p>${i + 1}. ${line}</p>`).join('')}
                        </div>
                    </div>
                    <button class="btn-remove" onclick="removeWrongQuestion(${index})">移除</button>
                </div>
            `;
        }
    });
    
    container.innerHTML = html;
}

function removeWrongQuestion(index) {
    if (!currentUser) return;
    const users = getUsers();
    users[currentUser].stats.wrongQuestions.splice(index, 1);
    saveUsers(users);
    wrongQuestions = users[currentUser].stats.wrongQuestions;
    updateUserStats();
    renderWrongQuestions();
}

function clearWrongQuestions() {
    if (!currentUser) return;
    if (!confirm('确定要清空所有错题吗？')) return;
    
    const users = getUsers();
    users[currentUser].stats.wrongQuestions = [];
    saveUsers(users);
    wrongQuestions = [];
    updateUserStats();
    renderWrongQuestions();
}

function recordAnswer(isCorrect, questionData) {
    if (!currentUser) return;
    
    const users = getUsers();
    if (isCorrect) {
        users[currentUser].stats.correctCount = (users[currentUser].stats.correctCount || 0) + 1;
        saveUsers(users);
    } else {
        saveWrongQuestion(questionData);
        return;
    }
    updateUserStats();
}

// 点击模态框外部关闭
document.getElementById('loginModal').addEventListener('click', function(e) {
    if (e.target === this) closeLoginModal();
});

document.getElementById('registerModal').addEventListener('click', function(e) {
    if (e.target === this) closeRegisterModal();
});

// 回车键提交
document.getElementById('loginPassword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});

document.getElementById('registerPassword2').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') register();
});

window.onload = () => {
    loadStats();
    loadFeaturedPoem();
    loadPoemList();
    drawRadarChart();
    
    // 检查登录状态
    const savedUser = localStorage.getItem('shiyunzhixue_currentUser');
    if (savedUser) {
        const users = getUsers();
        if (users[savedUser]) {
            currentUser = savedUser;
            wrongQuestions = users[savedUser].stats.wrongQuestions || [];
            updateUIAfterLogin();
        }
    }
    
    // 绑定退出按钮
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            logout();
        });
    }
};
