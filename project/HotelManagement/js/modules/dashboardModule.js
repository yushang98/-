/**
 * dashboardModule.js - 数据看板模块
 * 职责：数据看板统计、指标计算、渲染
 */

(function() {
    'use strict';
    
    window.HotelApp = window.HotelApp || {};
    
    /**
     * 计算并返回所有统计指标
     * @returns {object} {success: boolean, data: object}
     */
    function getStatistics() {
        const rooms = HotelApp.storage.get('rooms') || [];
        const orders = HotelApp.storage.get('orders') || [];
        const settlements = HotelApp.storage.get('settlements') || [];
        
        const today = HotelApp.formatter.formatDate(new Date());
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // 统计房间状态
        const idleRooms = rooms.filter(r => r.status === 'idle').length;
        const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
        const cleaningRooms = rooms.filter(r => r.status === 'cleaning').length;
        const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
        
        // 今日入住数
        const todayCheckIns = orders.filter(o => {
            const orderDate = HotelApp.formatter.formatDate(o.createdAt);
            return orderDate === today;
        }).length;
        
        // 在住客人总数
        const totalGuests = occupiedRooms;
        
        // 今日收入
        const todayIncome = settlements
            .filter(s => HotelApp.formatter.formatDate(s.createdAt) === today)
            .reduce((sum, s) => sum + s.totalAmount, 0);
        
        // 本月收入
        const monthIncome = settlements
            .filter(s => {
                const date = new Date(s.createdAt);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            })
            .reduce((sum, s) => sum + s.totalAmount, 0);
        
        return {
            success: true,
            data: {
                idleRooms: idleRooms,
                occupiedRooms: occupiedRooms,
                cleaningRooms: cleaningRooms,
                maintenanceRooms: maintenanceRooms,
                todayCheckIns: todayCheckIns,
                totalGuests: totalGuests,
                todayIncome: todayIncome,
                monthIncome: monthIncome
            }
        };
    }
    
    /**
     * 获取今日所有在住客人列表
     * @returns {object} {success: boolean, data: Array}
     */
    function getTodayGuests() {
        const orders = HotelApp.storage.get('orders') || [];
        
        return {
            success: true,
            data: orders.map(o => ({
                roomNumber: o.roomNumber,
                guestName: o.guestName,
                checkInDate: o.checkInDate,
                checkOutDate: o.checkOutDate,
                guestCount: o.guestCount
            }))
        };
    }
    
    /**
     * 计算今日退房结算收入
     * @returns {number} 今日收入
     */
    function getTodayIncome() {
        const settlements = HotelApp.storage.get('settlements') || [];
        const today = HotelApp.formatter.formatDate(new Date());
        
        return settlements
            .filter(s => HotelApp.formatter.formatDate(s.createdAt) === today)
            .reduce((sum, s) => sum + s.totalAmount, 0);
    }
    
    /**
     * 计算本月退房结算收入
     * @returns {number} 本月收入
     */
    function getMonthIncome() {
        const settlements = HotelApp.storage.get('settlements') || [];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        return settlements
            .filter(s => {
                const date = new Date(s.createdAt);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            })
            .reduce((sum, s) => sum + s.totalAmount, 0);
    }
    
    /**
     * 获取快捷操作数据
     * @returns {object} {success: boolean, data: object}
     */
    function getQuickActions() {
        const rooms = HotelApp.storage.get('rooms') || [];
        
        const idleRooms = rooms.filter(r => r.status === 'idle').length;
        const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
        
        return {
            success: true,
            data: {
                canCheckIn: idleRooms > 0,
                canCheckOut: occupiedRooms > 0,
                idleRooms: idleRooms,
                occupiedRooms: occupiedRooms
            }
        };
    }
    
    // 挂载到HotelApp命名空间
    HotelApp.dashboard = {
        getStatistics: getStatistics,
        getTodayGuests: getTodayGuests,
        getTodayIncome: getTodayIncome,
        getMonthIncome: getMonthIncome,
        getQuickActions: getQuickActions
    };
})();