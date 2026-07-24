/**
 * storage.js - localStorage读写封装、数据初始化、异常兜底
 * 职责：提供数据持久化接口，处理localStorage读写异常，初始化默认数据
 */

(function() {
    'use strict';
    
    // 初始化HotelApp命名空间
    window.HotelApp = window.HotelApp || {};
    
    // 存储键名前缀
    const PREFIX = 'hotel_';
    
    // 默认数据
    const DEFAULT_DATA = {
        rooms: [
            { roomNumber: '301', floor: 3, roomType: 'single', beds: 1, basePrice: 288, status: 'idle', remark: '' },
            { roomNumber: '302', floor: 3, roomType: 'double', beds: 2, basePrice: 388, status: 'idle', remark: '' },
            { roomNumber: '303', floor: 3, roomType: 'single', beds: 1, basePrice: 288, status: 'idle', remark: '' },
            { roomNumber: '304', floor: 3, roomType: 'deluxe', beds: 2, basePrice: 588, status: 'idle', remark: '' },
            { roomNumber: '305', floor: 3, roomType: 'suite', beds: 2, basePrice: 888, status: 'idle', remark: '' },
            { roomNumber: '306', floor: 3, roomType: 'double', beds: 2, basePrice: 388, status: 'idle', remark: '' },
            { roomNumber: '307', floor: 3, roomType: 'single', beds: 1, basePrice: 288, status: 'idle', remark: '' },
            { roomNumber: '308', floor: 3, roomType: 'deluxe', beds: 2, basePrice: 588, status: 'idle', remark: '' }
        ],
        guests: [],
        orders: [],
        settlements: [],
        priceRules: {
            basePrices: {
                single: 288,
                double: 388,
                deluxe: 588,
                suite: 888
            },
            weekendMultiplier: 1.2,
            longStayDiscounts: [
                { days: 3, discount: 0.95 },
                { days: 7, discount: 0.9 },
                { days: 15, discount: 0.85 }
            ],
            specialPrices: []
        }
    };
    
    /**
     * 从localStorage读取数据
     * @param {string} key - 数据键名
     * @returns {any} 解析后的数据，异常时返回null
     */
    function get(key) {
        try {
            const fullKey = PREFIX + key;
            const value = localStorage.getItem(fullKey);
            if (value === null) {
                return null;
            }
            return JSON.parse(value);
        } catch (error) {
            console.error('读取数据失败:', error);
            return null;
        }
    }
    
    /**
     * 向localStorage写入数据
     * @param {string} key - 数据键名
     * @param {any} value - 要写入的数据
     * @returns {boolean} 是否成功
     */
    function set(key, value) {
        try {
            const fullKey = PREFIX + key;
            const serialized = JSON.stringify(value);
            localStorage.setItem(fullKey, serialized);
            return true;
        } catch (error) {
            console.error('写入数据失败:', error);
            if (error.name === 'QuotaExceededError') {
                HotelApp.ui && HotelApp.ui.showToast('存储空间不足，请清理数据', 'error');
            }
            return false;
        }
    }
    
    /**
     * 删除指定键的数据
     * @param {string} key - 数据键名
     */
    function remove(key) {
        try {
            const fullKey = PREFIX + key;
            localStorage.removeItem(fullKey);
        } catch (error) {
            console.error('删除数据失败:', error);
        }
    }
    
    /**
     * 清空所有业务数据
     */
    function clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('清空数据失败:', error);
        }
    }
    
    /**
     * 初始化默认数据
     */
    function init() {
        try {
            // 检查是否已有数据
            const rooms = get('rooms');
            
            if (!rooms || rooms.length === 0) {
                // 初始化默认数据
                set('rooms', DEFAULT_DATA.rooms);
                set('guests', DEFAULT_DATA.guests);
                set('orders', DEFAULT_DATA.orders);
                set('settlements', DEFAULT_DATA.settlements);
                set('priceRules', DEFAULT_DATA.priceRules);
                
                HotelApp.ui && HotelApp.ui.showToast('系统初始化完成', 'success');
                console.log('系统初始化完成，已创建8间示例房间');
            }
        } catch (error) {
            console.error('初始化数据失败:', error);
            // 异常兜底：强制初始化
            set('rooms', DEFAULT_DATA.rooms);
            set('guests', DEFAULT_DATA.guests);
            set('orders', DEFAULT_DATA.orders);
            set('settlements', DEFAULT_DATA.settlements);
            set('priceRules', DEFAULT_DATA.priceRules);
        }
    }
    
    // 挂载到HotelApp命名空间
    HotelApp.storage = {
        get: get,
        set: set,
        remove: remove,
        clear: clear,
        init: init
    };
})();