// 应用逻辑
class CheckinApp {
    constructor() {
        this.currentSection = 'pomodoro';
        this.selectedTask = null;
        this.timerInterval = null;
        this.timerState = 'idle'; // idle, running, paused
        this.currentPhase = 'focus'; // focus, shortBreak, longBreak
        this.cycleCount = 0;
        this.timeLeft = 25 * 60; // 默认25分钟
        
        this.init();
    }

    // 初始化应用
    init() {
        this.setupNavigation();
        this.setupPomodoro();
        this.setupCheckin();
        this.setupPublish();
        this.setupModal();
        this.loadTasks();
        this.loadCheckinHistory();
        this.loadOthersCheckins();
    }

    // 设置导航栏
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.switchSection(section);
                
                // 更新导航栏状态
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    // 切换页面 section
    switchSection(section) {
        const sections = document.querySelectorAll('.section');
        sections.forEach(s => s.classList.remove('active'));
        document.getElementById(section).classList.add('active');
        this.currentSection = section;
    }

    // 设置番茄钟
    setupPomodoro() {
        // 开始按钮
        document.getElementById('start-timer').addEventListener('click', () => {
            this.startTimer();
        });

        // 暂停按钮
        document.getElementById('pause-timer').addEventListener('click', () => {
            this.pauseTimer();
        });

        // 重置按钮
        document.getElementById('reset-timer').addEventListener('click', () => {
            this.resetTimer();
        });

        // 时间设置变化时更新
        document.getElementById('focus-time').addEventListener('change', () => {
            if (this.timerState === 'idle') {
                this.resetTimer();
            }
        });

        document.getElementById('short-break').addEventListener('change', () => {
            if (this.timerState === 'idle') {
                this.resetTimer();
            }
        });

        document.getElementById('long-break').addEventListener('change', () => {
            if (this.timerState === 'idle') {
                this.resetTimer();
            }
        });

        document.getElementById('cycles').addEventListener('change', () => {
            if (this.timerState === 'idle') {
                this.resetTimer();
            }
        });
    }

    // 开始计时器
    startTimer() {
        if (this.timerState === 'paused') {
            this.timerState = 'running';
            this.updateTimerStatus();
        } else if (this.timerState === 'idle') {
            this.timerState = 'running';
            this.updateTimerStatus();
        }

        if (!this.timerInterval) {
            this.timerInterval = setInterval(() => {
                this.timeLeft--;
                this.updateTimerDisplay();

                if (this.timeLeft <= 0) {
                    this.completePhase();
                }
            }, 1000);
        }
    }

    // 暂停计时器
    pauseTimer() {
        if (this.timerState === 'running') {
            this.timerState = 'paused';
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.updateTimerStatus();
        }
    }

    // 重置计时器
    resetTimer() {
        this.pauseTimer();
        this.timerState = 'idle';
        this.currentPhase = 'focus';
        this.cycleCount = 0;
        this.timeLeft = parseInt(document.getElementById('focus-time').value) * 60;
        this.updateTimerDisplay();
        this.updateTimerStatus();
    }

    // 完成当前阶段
    completePhase() {
        this.pauseTimer();

        // 播放提示音（可选）
        // const audio = new Audio('alert.mp3');
        // audio.play();

        // 切换到下一个阶段
        if (this.currentPhase === 'focus') {
            this.cycleCount++;
            const cycles = parseInt(document.getElementById('cycles').value);
            
            if (this.cycleCount < cycles) {
                this.currentPhase = 'shortBreak';
                this.timeLeft = parseInt(document.getElementById('short-break').value) * 60;
            } else {
                this.currentPhase = 'longBreak';
                this.timeLeft = parseInt(document.getElementById('long-break').value) * 60;
                this.cycleCount = 0; // 重置循环计数
            }
        } else {
            this.currentPhase = 'focus';
            this.timeLeft = parseInt(document.getElementById('focus-time').value) * 60;
        }

        this.updateTimerDisplay();
        this.updateTimerStatus();
        this.startTimer(); // 自动开始下一个阶段
    }

    // 更新计时器显示
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timer-display').textContent = display;
    }

    // 更新计时器状态
    updateTimerStatus() {
        let status = '';
        
        if (this.timerState === 'idle') {
            status = '准备开始';
        } else if (this.timerState === 'paused') {
            status = '已暂停';
        } else {
            switch (this.currentPhase) {
                case 'focus':
                    status = '专注中...';
                    break;
                case 'shortBreak':
                    status = '短休中...';
                    break;
                case 'longBreak':
                    status = '长休中...';
                    break;
            }
        }
        
        document.getElementById('timer-status').textContent = status;
    }

    // 设置打卡功能
    setupCheckin() {
        // 提交打卡
        document.getElementById('submit-checkin').addEventListener('click', () => {
            this.submitCheckin();
        });
    }

    // 提交打卡
    async submitCheckin() {
        if (!this.selectedTask) {
            alert('请先选择一个打卡任务');
            return;
        }

        const fileInput = document.getElementById('file-upload');
        const files = fileInput.files;
        
        if (files.length === 0) {
            alert('请选择要上传的文件');
            return;
        }

        // 模拟上传文件
        const uploadedFiles = [];
        for (let i = 0; i < files.length; i++) {
            const fileInfo = await DataManager.uploadFile(files[i]);
            uploadedFiles.push(fileInfo);
        }

        // 创建打卡记录
        const checkin = {
            taskId: this.selectedTask.id,
            taskTitle: this.selectedTask.title,
            files: uploadedFiles,
            notes: ''
        };

        // 保存打卡记录
        DataManager.addCheckin(checkin);

        // 显示鼓励信息
        this.showEncouragement();

        // 重新加载历史记录
        this.loadCheckinHistory();

        // 重置表单
        fileInput.value = '';
        this.selectedTask = null;
        document.querySelectorAll('.task-item').forEach(item => {
            item.classList.remove('selected');
        });
    }

    // 显示鼓励信息
    showEncouragement() {
        const messages = [
            '太棒了！你完成了今天的打卡任务！',
            '坚持就是胜利，继续加油！',
            '你真的很厉害，每天都在进步！',
            '恭喜你完成打卡，保持这种状态！',
            '做得好！你的努力会有回报的！'
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        document.getElementById('encouragement-message').textContent = randomMessage;
        document.getElementById('encouragement-modal').classList.add('active');
    }

    // 设置发布任务功能
    setupPublish() {
        document.getElementById('publish-task').addEventListener('click', () => {
            this.publishTask();
        });
    }

    // 发布任务
    publishTask() {
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const deadline = document.getElementById('task-deadline').value;
        const participants = parseInt(document.getElementById('task-participants').value);

        if (!title) {
            alert('请输入任务标题');
            return;
        }

        if (!deadline) {
            alert('请设置截止时间');
            return;
        }

        // 创建任务
        const task = {
            title,
            description,
            deadline,
            maxParticipants: participants
        };

        // 保存任务
        DataManager.addTask(task);

        // 重新加载任务列表
        this.loadTasks();

        // 重置表单
        document.getElementById('task-title').value = '';
        document.getElementById('task-description').value = '';
        document.getElementById('task-deadline').value = '';
        document.getElementById('task-participants').value = 5;

        alert('任务发布成功！');
    }

    // 设置弹窗
    setupModal() {
        document.getElementById('close-modal').addEventListener('click', () => {
            document.getElementById('encouragement-modal').classList.remove('active');
        });
    }

    // 加载打卡任务
    loadTasks() {
        const tasks = DataManager.getTasks();
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';

        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            taskItem.innerHTML = `
                <h4>${task.title}</h4>
                <p>${task.description}</p>
                <small>截止时间: ${new Date(task.deadline).toLocaleString()}</small>
            `;
            
            taskItem.addEventListener('click', () => {
                // 移除其他任务的选中状态
                document.querySelectorAll('.task-item').forEach(item => {
                    item.classList.remove('selected');
                });
                // 添加当前任务的选中状态
                taskItem.classList.add('selected');
                this.selectedTask = task;
            });
            
            taskList.appendChild(taskItem);
        });
    }

    // 加载打卡历史
    loadCheckinHistory() {
        const checkins = DataManager.getUserCheckins();
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';

        if (checkins.length === 0) {
            historyList.innerHTML = '<p>暂无打卡记录</p>';
            return;
        }

        checkins.forEach(checkin => {
            const checkinItem = document.createElement('div');
            checkinItem.className = 'checkin-item';
            
            const filesHtml = checkin.files && checkin.files.length > 0 
                ? `<div class="checkin-files">
                    上传文件: ${checkin.files.map(f => f.name).join(', ')}
                  </div>`
                : '';
            
            checkinItem.innerHTML = `
                <div class="checkin-time">${new Date(checkin.createdAt).toLocaleString()}</div>
                <h4>${checkin.taskTitle}</h4>
                ${filesHtml}
            `;
            
            historyList.appendChild(checkinItem);
        });
    }

    // 加载他人的打卡
    loadOthersCheckins() {
        const checkins = DataManager.getOthersCheckins();
        const othersList = document.getElementById('others-list');
        othersList.innerHTML = '';

        if (checkins.length === 0) {
            othersList.innerHTML = '<p>暂无他人打卡记录</p>';
            return;
        }

        checkins.forEach(checkin => {
            const checkinItem = document.createElement('div');
            checkinItem.className = 'checkin-item';
            
            const filesHtml = checkin.files && checkin.files.length > 0 
                ? `<div class="checkin-files">
                    上传文件: ${checkin.files.map(f => f.name).join(', ')}
                  </div>`
                : '';
            
            // 随机分配用户
            const users = ['朋友1', '朋友2', '朋友3'];
            const randomUser = users[Math.floor(Math.random() * users.length)];
            
            checkinItem.innerHTML = `
                <div class="checkin-time">${new Date(checkin.createdAt).toLocaleString()} - ${randomUser}</div>
                <h4>${checkin.taskTitle}</h4>
                ${filesHtml}
            `;
            
            othersList.appendChild(checkinItem);
        });
    }
}

// 初始化应用
new CheckinApp();
