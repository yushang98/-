/**
 * formatter.js - 数据格式化工具
 * 职责：提供日期、金额、状态等格式化方法，生成唯一ID
 */

(function() {
    'use strict';
    
    // 初始化HotelApp命名空间
    window.HotelApp = window.HotelApp || {};
    
    /**
     * 格式化日期
     * @param {Date|string} date - 日期对象或字符串
     * @param {string} format - 格式模板，默认'YYYY-MM-DD'
     * @returns {string} 格式化后的日期字符串
     */
    function formatDate(date, format = 'YYYY-MM-DD') {
        if (!date) {
            return '';
        }
        
        const d = new Date(date);
        
        if (isNaN(d.getTime())) {
            return '';
        }
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    }
    
    /**
     * 格式化金额
     * @param {number} amount - 金额
     * @returns {string} 格式化后的金额字符串
     */
    function formatMoney(amount) {
        if (amount === null || amount === undefined || amount === '') {
            return '0.00';
        }
        
        const num = Number(amount);
        
        if (isNaN(num)) {
            return '0.00';
        }
        
        // 保留2位小数，添加千分位分隔符
        return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    /**
     * 格式化房间状态
     * @param {string} status - 状态代码
     * @returns {string} 中文显示文本
     */
    function formatRoomStatus(status) {
        const statusMap = {
            'idle': '空闲',
            'occupied': '已入住',
            'cleaning': '清洁中',
            'maintenance': '维修中'
        };
        
        return statusMap[status] || status;
    }
    
    /**
     * 格式化房型
     * @param {string} roomType - 房型代码
     * @returns {string} 中文显示文本
     */
    function formatRoomType(roomType) {
        const typeMap = {
            'single': '单人间',
            'double': '双人间',
            'deluxe': '豪华间',
            'suite': '套房'
        };
        
        return typeMap[roomType] || roomType;
    }
    
    /**
     * 格式化支付方式
     * @param {string} method - 支付方式代码
     * @returns {string} 中文显示文本
     */
    function formatPaymentMethod(method) {
        const methodMap = {
            'cash': '现金',
            'wechat': '微信',
            'alipay': '支付宝',
            'card': '银行卡'
        };
        
        return methodMap[method] || method;
    }
    
    /**
     * 生成订单编号
     * @returns {string} 订单编号，格式'ORD' + 时间戳
     */
    function generateOrderId() {
        return 'ORD' + Date.now();
    }
    
    /**
     * 生成结算编号
     * @returns {string} 结算编号，格式'SET' + 时间戳
     */
    function generateSettlementId() {
        return 'SET' + Date.now();
    }
    
    /**
     * 生成客人ID（UUID）
     * @returns {string} 客人ID
     */
    function generateGuestId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    /**
     * 获取状态标签样式类名
     * @param {string} status - 状态代码
     * @returns {string} CSS类名
     */
    function getStatusBadgeClass(status) {
        const classMap = {
            'idle': 'badge-idle',
            'occupied': 'badge-occupied',
            'cleaning': 'badge-cleaning',
            'maintenance': 'badge-maintenance'
        };
        
        return classMap[status] || 'badge-default';
    }
    
    /**
     * 格式化日期时间（友好显示）
     * @param {Date|string} date - 日期对象或字符串
     * @returns {string} 格式化后的日期时间字符串
     */
    function formatDateTimeFriendly(date) {
        if (!date) {
            return '';
        }
        
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        
        // 1分钟内
        if (diff < 60000) {
            return '刚刚';
        }
        
        // 1小时内
        if (diff < 3600000) {
            return Math.floor(diff / 60000) + '分钟前';
        }
        
        // 今天
        if (formatDate(d) === formatDate(now)) {
            return '今天 ' + formatDate(d, 'HH:mm');
        }
        
        // 昨天
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (formatDate(d) === formatDate(yesterday)) {
            return '昨天 ' + formatDate(d, 'HH:mm');
        }
        
        // 其他
        return formatDate(d, 'YYYY-MM-DD HH:mm');
    }
    
    // 挂载到HotelApp命名空间
    HotelApp.formatter = {
        formatDate: formatDate,
        formatMoney: formatMoney,
        formatRoomStatus: formatRoomStatus,
        formatRoomType: formatRoomType,
        formatPaymentMethod: formatPaymentMethod,
        generateOrderId: generateOrderId,
        generateSettlementId: generateSettlementId,
        generateGuestId: generateGuestId,
        getStatusBadgeClass: getStatusBadgeClass,
        formatDateTimeFriendly: formatDateTimeFriendly
    };
})();