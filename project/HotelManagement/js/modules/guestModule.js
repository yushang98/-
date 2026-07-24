/**
 * guestModule.js - 客人档案管理模块
 * 职责：客人档案管理、历史记录、增删改查
 */

(function() {
    'use strict';
    
    window.HotelApp = window.HotelApp || {};
    
    /**
     * 获取所有客人
     * @returns {object} {success: boolean, data: Array}
     */
    function getAll() {
        const guests = HotelApp.storage.get('guests') || [];
        return { success: true, data: guests };
    }
    
    /**
     * 根据ID获取客人详情
     * @param {string} id - 客人ID
     * @returns {object} {success: boolean, data: object|null}
     */
    function getById(id) {
        const guests = HotelApp.storage.get('guests') || [];
        const guest = guests.find(g => g.id === id);
        
        if (guest) {
            return { success: true, data: guest };
        }
        
        return { success: false, message: '客人不存在', data: null };
    }
    
    /**
     * 新增客人
     * @param {object} guest - 客人对象
     * @returns {object} {success: boolean, message: string, data: object}
     */
    function add(guest) {
        // 校验必填字段
        const nameValid = HotelApp.validator.validateRequired(guest.name, '姓名');
        if (!nameValid.valid) {
            return { success: false, message: nameValid.message };
        }
        
        // 校验身份证号
        if (guest.idCard) {
            const idCardValid = HotelApp.validator.validateIdCard(guest.idCard);
            if (!idCardValid.valid) {
                return { success: false, message: idCardValid.message };
            }
        }
        
        // 校验手机号
        if (guest.phone) {
            const phoneValid = HotelApp.validator.validatePhone(guest.phone);
            if (!phoneValid.valid) {
                return { success: false, message: phoneValid.message };
            }
        }
        
        // 添加客人
        const guests = HotelApp.storage.get('guests') || [];
        const newGuest = {
            id: HotelApp.formatter.generateGuestId(),
            name: guest.name,
            idCard: guest.idCard || '',
            phone: guest.phone || '',
            remark: guest.remark || '',
            createdAt: new Date().toISOString()
        };
        
        guests.push(newGuest);
        HotelApp.storage.set('guests', guests);
        
        return { success: true, message: '添加成功', data: newGuest };
    }
    
    /**
     * 更新客人信息
     * @param {string} id - 客人ID
     * @param {object} guest - 客人对象
     * @returns {object} {success: boolean, message: string}
     */
    function update(id, guest) {
        // 校验身份证号
        if (guest.idCard) {
            const idCardValid = HotelApp.validator.validateIdCard(guest.idCard);
            if (!idCardValid.valid) {
                return { success: false, message: idCardValid.message };
            }
        }
        
        // 校验手机号
        if (guest.phone) {
            const phoneValid = HotelApp.validator.validatePhone(guest.phone);
            if (!phoneValid.valid) {
                return { success: false, message: phoneValid.message };
            }
        }
        
        const guests = HotelApp.storage.get('guests') || [];
        const index = guests.findIndex(g => g.id === id);
        
        if (index === -1) {
            return { success: false, message: '客人不存在' };
        }
        
        // 更新客人信息
        guests[index] = {
            ...guests[index],
            name: guest.name,
            idCard: guest.idCard || '',
            phone: guest.phone || '',
            remark: guest.remark || ''
        };
        
        HotelApp.storage.set('guests', guests);
        
        return { success: true, message: '更新成功' };
    }
    
    /**
     * 删除客人
     * @param {string} id - 客人ID
     * @returns {object} {success: boolean, message: string}
     */
    function deleteGuest(id) {
        const guests = HotelApp.storage.get('guests') || [];
        const index = guests.findIndex(g => g.id === id);
        
        if (index === -1) {
            return { success: false, message: '客人不存在' };
        }
        
        guests.splice(index, 1);
        HotelApp.storage.set('guests', guests);
        
        return { success: true, message: '删除成功' };
    }
    
    /**
     * 搜索客人
     * @param {string} keyword - 关键词
     * @returns {object} {success: boolean, data: Array}
     */
    function search(keyword) {
        let guests = HotelApp.storage.get('guests') || [];
        
        if (keyword) {
            const kw = keyword.toLowerCase();
            guests = guests.filter(g => 
                g.name.toLowerCase().includes(kw) ||
                g.idCard.includes(kw) ||
                g.phone.includes(kw)
            );
        }
        
        return { success: true, data: guests };
    }
    
    /**
     * 获取客人的历史记录
     * @param {string} guestId - 客人ID
     * @returns {object} {success: boolean, data: object}
     */
    function getHistory(guestId) {
        const orders = HotelApp.storage.get('orders') || [];
        const settlements = HotelApp.storage.get('settlements') || [];
        
        // 筛选该客人的订单
        const guestOrders = orders.filter(o => o.guestId === guestId);
        
        // 筛选该客人的结算记录
        const guestSettlements = settlements.filter(s => s.guestId === guestId);
        
        return {
            success: true,
            data: {
                orders: guestOrders,
                settlements: guestSettlements
            }
        };
    }
    
    // 挂载到HotelApp命名空间
    HotelApp.guest = {
        getAll: getAll,
        getById: getById,
        add: add,
        update: update,
        delete: deleteGuest,
        search: search,
        getHistory: getHistory
    };
})();