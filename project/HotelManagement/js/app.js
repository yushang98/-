/**
 * app.js - 项目主入口
 * 职责：导航路由、全局事件绑定、模块注册、Toast提示、弹窗管理
 */

(function() {
    'use strict';
    
    // 确保HotelApp命名空间存在
    window.HotelApp = window.HotelApp || {};
    
    // 当前页面
    let currentPage = 'dashboard';
    
    // 侧边栏是否折叠
    let sidebarCollapsed = false;
    
    /**
     * 初始化应用
     */
    function init() {
        // 初始化数据
        HotelApp.storage.init();
        
        // 渲染头部导航栏
        renderHeader();
        
        // 渲染侧边栏导航
        renderSidebar();
        
        // 绑定事件
        bindEvents();
        
        // 显示默认页面
        switchPage('dashboard');
        
        // 启动时钟
        startClock();
    }
    
    /**
     * 渲染头部导航栏
     */
    function renderHeader() {
        const headerTitle = document.querySelector('.header-title');
        if (headerTitle) {
            headerTitle.textContent = '酒店住宿管理系统';
        }
    }
    
    /**
     * 渲染侧边栏导航
     */
    function renderSidebar() {
        const sidebarNav = document.querySelector('.sidebar-nav');
        if (!sidebarNav) return;
        
        const navItems = [
            { id: 'dashboard', icon: '📊', text: '数据看板' },
            { id: 'rooms', icon: '🏠', text: '房间管理' },
            { id: 'guests', icon: '👤', text: '客人管理' },
            { id: 'checkin', icon: '📥', text: '快速入住' },
            { id: 'checkout', icon: '📤', text: '快速退房' },
            { id: 'pricing', icon: '💰', text: '价格管理' },
            { id: 'settlement', icon: '🧾', text: '房费结算' },
            { id: 'history', icon: '📋', text: '历史记录' },
            { id: 'settings', icon: '⚙️', text: '数据管理' }
        ];
        
        sidebarNav.innerHTML = navItems.map(item => `
            <div class="sidebar-item" data-page="${item.id}">
                <span class="sidebar-item-icon">${item.icon}</span>
                <span class="sidebar-item-text">${item.text}</span>
            </div>
        `).join('');
    }
    
    /**
     * 绑定事件
     */
    function bindEvents() {
        // 侧边栏导航点击事件
        document.querySelector('.sidebar-nav')?.addEventListener('click', (e) => {
            const item = e.target.closest('.sidebar-item');
            if (item) {
                const page = item.dataset.page;
                switchPage(page);
            }
        });
        
        // 侧边栏折叠按钮
        document.querySelector('.sidebar-toggle')?.addEventListener('click', () => {
            toggleSidebar();
        });
        
        // ESC键关闭弹窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });
    }
    
    /**
     * 切换页面
     * @param {string} pageName - 页面名称
     */
    function switchPage(pageName) {
        currentPage = pageName;
        
        // 更新侧边栏选中状态
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageName);
        });
        
        // 显示对应页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.toggle('active', page.id === `page-${pageName}`);
        });
        
        // 初始化页面内容
        initPageContent(pageName);
    }
    
    /**
     * 初始化页面内容
     * @param {string} pageName - 页面名称
     */
    function initPageContent(pageName) {
        switch (pageName) {
            case 'dashboard':
                initDashboardPage();
                break;
            case 'rooms':
                initRoomsPage();
                break;
            case 'guests':
                initGuestsPage();
                break;
            case 'checkin':
                initCheckinPage();
                break;
            case 'checkout':
                initCheckoutPage();
                break;
            case 'pricing':
                initPricingPage();
                break;
            case 'settlement':
                initSettlementPage();
                break;
            case 'history':
                initHistoryPage();
                break;
            case 'settings':
                initSettingsPage();
                break;
        }
    }
    
    /**
     * 折叠/展开侧边栏
     */
    function toggleSidebar() {
        sidebarCollapsed = !sidebarCollapsed;
        
        document.querySelector('.sidebar')?.classList.toggle('collapsed', sidebarCollapsed);
        document.querySelector('.main-content')?.classList.toggle('expanded', sidebarCollapsed);
    }
    
    /**
     * 启动时钟
     */
    function startClock() {
        function updateTime() {
            const now = new Date();
            const timeStr = HotelApp.formatter.formatDate(now, 'YYYY-MM-DD HH:mm:ss');
            const headerTime = document.querySelector('.header-time');
            if (headerTime) {
                headerTime.textContent = timeStr;
            }
        }
        
        updateTime();
        setInterval(updateTime, 1000);
    }
    
    /**
     * 显示Toast提示
     * @param {string} message - 提示消息
     * @param {string} type - 类型：success/error/warning/info
     */
    function showToast(message, type = 'info') {
        // 创建Toast容器
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 8px;
            `;
            document.body.appendChild(container);
        }
        
        // 创建Toast元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const colors = {
            success: '#00B42A',
            error: '#F53F3F',
            warning: '#FF7D00',
            info: '#165DFF'
        };
        
        toast.style.cssText = `
            padding: 12px 20px;
            background-color: #FFFFFF;
            border-left: 4px solid ${colors[type]};
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-size: 14px;
            color: #1D2129;
            animation: slideIn 0.3s ease;
        `;
        
        toast.textContent = message;
        container.appendChild(toast);
        
        // 3秒后自动消失
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
    
    /**
     * 显示确认弹窗
     * @param {string} message - 确认消息
     * @param {function} onConfirm - 确认回调
     */
    function showConfirm(message, onConfirm) {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop show';
        modal.innerHTML = `
            <div class="modal confirm-modal show" style="width: 400px;">
                <div class="modal-body">
                    <div class="confirm-icon confirm-icon-warning">⚠️</div>
                    <div class="confirm-message">${message}</div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="confirm-cancel">取消</button>
                    <button class="btn btn-primary" id="confirm-ok">确定</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 绑定事件
        modal.querySelector('#confirm-cancel').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#confirm-ok').addEventListener('click', () => {
            modal.remove();
            if (onConfirm) onConfirm();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    /**
     * 关闭所有弹窗
     */
    function closeAllModals() {
        document.querySelectorAll('.modal-backdrop').forEach(modal => {
            modal.remove();
        });
    }
    
    /**
     * 初始化数据看板页面
     */
    function initDashboardPage() {
        const stats = HotelApp.dashboard.getStatistics();
        const guests = HotelApp.dashboard.getTodayGuests();
        
        // 渲染统计卡片
        const statsContainer = document.querySelector('.dashboard-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-card-label">空闲房间</div>
                    <div class="stat-card-value">${stats.data.idleRooms}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-label">已入住</div>
                    <div class="stat-card-value">${stats.data.occupiedRooms}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-label">清洁中</div>
                    <div class="stat-card-value">${stats.data.cleaningRooms}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-label">维修中</div>
                    <div class="stat-card-value">${stats.data.maintenanceRooms}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-label">今日入住</div>
                    <div class="stat-card-value">${stats.data.todayCheckIns}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-label">在住客人</div>
                    <div class="stat-card-value">${stats.data.totalGuests}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-label">今日收入</div>
                    <div class="stat-card-value">¥${HotelApp.formatter.formatMoney(stats.data.todayIncome)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-label">本月收入</div>
                    <div class="stat-card-value">¥${HotelApp.formatter.formatMoney(stats.data.monthIncome)}</div>
                </div>
            `;
        }
        
        // 渲染今日在住列表
        const guestsTable = document.querySelector('.dashboard-today-table');
        if (guestsTable) {
            if (guests.data.length === 0) {
                guestsTable.innerHTML = '<div class="empty-state"><div class="empty-state-text">暂无在住客人</div></div>';
            } else {
                guestsTable.innerHTML = `
                    <table class="table">
                        <thead class="table-thead">
                            <tr class="table-tr">
                                <th class="table-th">房间号</th>
                                <th class="table-th">客人姓名</th>
                                <th class="table-th">入住日期</th>
                                <th class="table-th">预计退房</th>
                            </tr>
                        </thead>
                        <tbody class="table-tbody">
                            ${guests.data.map(g => `
                                <tr class="table-tr">
                                    <td class="table-td text-center">${g.roomNumber}</td>
                                    <td class="table-td">${g.guestName}</td>
                                    <td class="table-td text-center">${g.checkInDate}</td>
                                    <td class="table-td text-center">${g.checkOutDate}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        }
    }
    
    /**
     * 初始化房间管理页面
     */
    function initRoomsPage() {
        const result = HotelApp.room.getAll();
        renderRoomsTable(result.data);
    }
    
    /**
     * 渲染房间表格
     */
    function renderRoomsTable(rooms) {
        const tableBody = document.querySelector('.rooms-table-body');
        if (!tableBody) return;
        
        if (rooms.length === 0) {
            tableBody.innerHTML = '<tr class="table-tr"><td colspan="8" class="table-td"><div class="empty-state"><div class="empty-state-text">暂无房间数据</div></div></td></tr>';
            return;
        }
        
        tableBody.innerHTML = rooms.map(room => `
            <tr class="table-tr">
                <td class="table-td text-center">${room.roomNumber}</td>
                <td class="table-td text-center">${room.floor}</td>
                <td class="table-td">${HotelApp.formatter.formatRoomType(room.roomType)}</td>
                <td class="table-td text-center">${room.beds}</td>
                <td class="table-td text-right">¥${HotelApp.formatter.formatMoney(room.basePrice)}</td>
                <td class="table-td text-center"><span class="badge ${HotelApp.formatter.getStatusBadgeClass(room.status)}">${HotelApp.formatter.formatRoomStatus(room.status)}</span></td>
                <td class="table-td">${room.remark || '-'}</td>
                <td class="table-td text-center">
                    <button class="btn btn-sm btn-secondary" onclick="HotelApp.ui.editRoom('${room.roomNumber}')">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="HotelApp.ui.deleteRoom('${room.roomNumber}')">删除</button>
                </td>
            </tr>
        `).join('');
    }
    
    /**
     * 初始化客人管理页面
     */
    function initGuestsPage() {
        const result = HotelApp.guest.getAll();
        renderGuestsTable(result.data);
    }
    
    /**
     * 渲染客人表格
     */
    function renderGuestsTable(guests) {
        const tableBody = document.querySelector('.guests-table-body');
        if (!tableBody) return;
        
        if (guests.length === 0) {
            tableBody.innerHTML = '<tr class="table-tr"><td colspan="6" class="table-td"><div class="empty-state"><div class="empty-state-text">暂无客人数据</div></div></td></tr>';
            return;
        }
        
        tableBody.innerHTML = guests.map(guest => `
            <tr class="table-tr">
                <td class="table-td">${guest.name}</td>
                <td class="table-td text-center">${guest.idCard || '-'}</td>
                <td class="table-td text-center">${guest.phone || '-'}</td>
                <td class="table-td">${guest.remark || '-'}</td>
                <td class="table-td text-center">${HotelApp.formatter.formatDate(guest.createdAt)}</td>
                <td class="table-td text-center">
                    <button class="btn btn-sm btn-secondary" onclick="HotelApp.ui.editGuest('${guest.id}')">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="HotelApp.ui.deleteGuest('${guest.id}')">删除</button>
                </td>
            </tr>
        `).join('');
    }
    
    /**
     * 初始化快速入住页面
     */
    function initCheckinPage() {
        // 加载空闲房间
        const roomsResult = HotelApp.room.filter({ status: 'idle' });
        const roomSelect = document.querySelector('#checkin-room');
        if (roomSelect) {
            roomSelect.innerHTML = '<option value="">请选择房间</option>' + 
                roomsResult.data.map(r => `<option value="${r.roomNumber}">${r.roomNumber} - ${HotelApp.formatter.formatRoomType(r.roomType)} (¥${r.basePrice}/天)</option>`).join('');
        }
        
        // 加载客人列表
        const guestsResult = HotelApp.guest.getAll();
        const guestSelect = document.querySelector('#checkin-guest-select');
        if (guestSelect) {
            guestSelect.innerHTML = '<option value="">请选择客人</option>' + 
                guestsResult.data.map(g => `<option value="${g.id}" data-name="${g.name}" data-idcard="${g.idCard}" data-phone="${g.phone}">${g.name} - ${g.phone || '无手机号'}</option>`).join('');
        }
        
        // 设置默认日期
        const today = HotelApp.formatter.formatDate(new Date());
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = HotelApp.formatter.formatDate(tomorrow);
        
        const checkInDateInput = document.querySelector('#checkin-date');
        const checkOutDateInput = document.querySelector('#checkout-date');
        if (checkInDateInput) checkInDateInput.value = today;
        if (checkOutDateInput) checkOutDateInput.value = tomorrowStr;
    }
    
    /**
     * 初始化快速退房页面
     */
    function initCheckoutPage() {
        // 加载已入住房间
        const roomsResult = HotelApp.room.filter({ status: 'occupied' });
        const roomSelect = document.querySelector('#checkout-room');
        if (roomSelect) {
            roomSelect.innerHTML = '<option value="">请选择房间</option>' + 
                roomsResult.data.map(r => `<option value="${r.roomNumber}">${r.roomNumber}</option>`).join('');
        }
    }
    
    /**
     * 初始化价格管理页面
     */
    function initPricingPage() {
        const rules = HotelApp.price.getRules();
        
        // 填充基础房价
        Object.keys(rules.data.basePrices).forEach(type => {
            const input = document.querySelector(`#price-${type}`);
            if (input) input.value = rules.data.basePrices[type];
        });
        
        // 填充周末价格系数
        const weekendInput = document.querySelector('#weekend-multiplier');
        if (weekendInput) weekendInput.value = rules.data.weekendMultiplier;
    }
    
    /**
     * 初始化房费结算页面
     */
    function initSettlementPage() {
        const result = HotelApp.settlement.getAll();
        renderSettlementsTable(result.data);
    }
    
    /**
     * 渲染结算记录表格
     */
    function renderSettlementsTable(settlements) {
        const tableBody = document.querySelector('.settlements-table-body');
        if (!tableBody) return;
        
        if (settlements.length === 0) {
            tableBody.innerHTML = '<tr class="table-tr"><td colspan="6" class="table-td"><div class="empty-state"><div class="empty-state-text">暂无结算记录</div></div></td></tr>';
            return;
        }
        
        tableBody.innerHTML = settlements.map(s => `
            <tr class="table-tr">
                <td class="table-td text-center">${s.roomNumber}</td>
                <td class="table-td">${s.guestName}</td>
                <td class="table-td text-center">${HotelApp.formatter.formatDate(s.createdAt)}</td>
                <td class="table-td text-right">¥${HotelApp.formatter.formatMoney(s.totalAmount)}</td>
                <td class="table-td text-center">${HotelApp.formatter.formatPaymentMethod(s.paymentMethod)}</td>
                <td class="table-td text-center">
                    <button class="btn btn-sm btn-secondary" onclick="HotelApp.ui.viewSettlement('${s.settlementId}')">查看</button>
                </td>
            </tr>
        `).join('');
    }
    
    /**
     * 初始化历史记录页面
     */
    function initHistoryPage() {
        const orders = HotelApp.order.getAll();
        const settlements = HotelApp.settlement.getAll();
        
        // 渲染入住记录
        const ordersTable = document.querySelector('.history-orders-table-body');
        if (ordersTable) {
            if (orders.data.length === 0) {
                ordersTable.innerHTML = '<tr class="table-tr"><td colspan="6" class="table-td"><div class="empty-state"><div class="empty-state-text">暂无入住记录</div></div></td></tr>';
            } else {
                ordersTable.innerHTML = orders.data.map(o => `
                    <tr class="table-tr">
                        <td class="table-td text-center">${o.roomNumber}</td>
                        <td class="table-td">${o.guestName}</td>
                        <td class="table-td text-center">${o.checkInDate}</td>
                        <td class="table-td text-center">${o.checkOutDate}</td>
                        <td class="table-td text-right">¥${HotelApp.formatter.formatMoney(o.deposit)}</td>
                        <td class="table-td text-center">
                            <button class="btn btn-sm btn-secondary" onclick="HotelApp.ui.viewOrder('${o.orderId}')">查看</button>
                        </td>
                    </tr>
                `).join('');
            }
        }
        
        // 渲染结算记录
        const settlementsTable = document.querySelector('.history-settlements-table-body');
        if (settlementsTable) {
            if (settlements.data.length === 0) {
                settlementsTable.innerHTML = '<tr class="table-tr"><td colspan="6" class="table-td"><div class="empty-state"><div class="empty-state-text">暂无结算记录</div></div></td></tr>';
            } else {
                settlementsTable.innerHTML = settlements.data.map(s => `
                    <tr class="table-tr">
                        <td class="table-td text-center">${s.roomNumber}</td>
                        <td class="table-td">${s.guestName}</td>
                        <td class="table-td text-center">${HotelApp.formatter.formatDate(s.createdAt)}</td>
                        <td class="table-td text-right">¥${HotelApp.formatter.formatMoney(s.totalAmount)}</td>
                        <td class="table-td text-center">${HotelApp.formatter.formatPaymentMethod(s.paymentMethod)}</td>
                        <td class="table-td text-center">
                            <button class="btn btn-sm btn-secondary" onclick="HotelApp.ui.viewSettlement('${s.settlementId}')">查看</button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    }
    
    /**
     * 初始化数据管理页面
     */
    function initSettingsPage() {
        // 数据管理页面不需要特殊初始化
    }
    
    // 挂载到HotelApp命名空间
    HotelApp.ui = {
        init: init,
        switchPage: switchPage,
        showToast: showToast,
        showConfirm: showConfirm,
        initDashboardPage: initDashboardPage,
        initRoomsPage: initRoomsPage,
        initGuestsPage: initGuestsPage,
        initCheckinPage: initCheckinPage,
        initCheckoutPage: initCheckoutPage,
        initPricingPage: initPricingPage,
        initSettlementPage: initSettlementPage,
        initHistoryPage: initHistoryPage,
        initSettingsPage: initSettingsPage,
        renderRoomsTable: renderRoomsTable,
        renderGuestsTable: renderGuestsTable,
        renderSettlementsTable: renderSettlementsTable
    };
    
    // 页面加载完成后初始化
    document.addEventListener('DOMContentLoaded', function() {
        HotelApp.ui.init();
    });
})();