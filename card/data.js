// 数据管理模块
const DataManager = {
    // 初始化数据
    init() {
        // 检查是否已有数据，若无则初始化
        if (!localStorage.getItem('checkinApp')) {
            const initialData = {
                tasks: [
                    {
                        id: '1',
                        title: '每日阅读',
                        description: '每天阅读30分钟',
                        deadline: new Date().toISOString(),
                        maxParticipants: 10,
                        createdAt: new Date().toISOString()
                    },
                    {
                        id: '2',
                        title: '运动打卡',
                        description: '每天运动1小时',
                        deadline: new Date().toISOString(),
                        maxParticipants: 15,
                        createdAt: new Date().toISOString()
                    }
                ],
                checkins: [],
                users: [
                    {
                        id: 'user1',
                        name: '我'
                    },
                    {
                        id: 'user2',
                        name: '朋友1'
                    },
                    {
                        id: 'user3',
                        name: '朋友2'
                    }
                ]
            };
            localStorage.setItem('checkinApp', JSON.stringify(initialData));
        }
    },

    // 获取所有数据
    getAllData() {
        return JSON.parse(localStorage.getItem('checkinApp'));
    },

    // 保存所有数据
    saveData(data) {
        localStorage.setItem('checkinApp', JSON.stringify(data));
    },

    // 获取所有打卡任务
    getTasks() {
        const data = this.getAllData();
        return data.tasks;
    },

    // 添加打卡任务
    addTask(task) {
        const data = this.getAllData();
        const newTask = {
            id: Date.now().toString(),
            ...task,
            createdAt: new Date().toISOString()
        };
        data.tasks.push(newTask);
        this.saveData(data);
        return newTask;
    },

    // 获取所有打卡记录
    getCheckins() {
        const data = this.getAllData();
        return data.checkins;
    },

    // 添加打卡记录
    addCheckin(checkin) {
        const data = this.getAllData();
        const newCheckin = {
            id: Date.now().toString(),
            ...checkin,
            createdAt: new Date().toISOString(),
            userId: 'user1' // 默认用户
        };
        data.checkins.push(newCheckin);
        this.saveData(data);
        return newCheckin;
    },

    // 获取用户的打卡记录
    getUserCheckins(userId = 'user1') {
        const checkins = this.getCheckins();
        return checkins.filter(checkin => checkin.userId === userId);
    },

    // 获取其他用户的打卡记录
    getOthersCheckins() {
        const checkins = this.getCheckins();
        return checkins.filter(checkin => checkin.userId !== 'user1');
    },

    // 模拟文件上传（实际项目中需要后端支持）
    uploadFile(file) {
        // 这里只是模拟，实际项目中需要发送到服务器
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: Date.now().toString(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    url: URL.createObjectURL(file) // 本地预览URL
                });
            }, 500);
        });
    }
};

// 初始化数据
DataManager.init();

// 导出数据管理模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
} else {
    window.DataManager = DataManager;
}
