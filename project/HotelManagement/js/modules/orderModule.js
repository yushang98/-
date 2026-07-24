/**
 * orderModule.js - 入住订单模块
 * 职责：入住登记、订单生成、状态联动
 */

(function() {
    'use strict';
    
    window.HotelApp = window.HotelApp || {};
    
    /**
     * 获取所有入住订单
     * @returns {object} {success: boolean, data: Array}
     */
    function getAll() {
        const orders = HotelApp.storage.get('orders') || [];
        return { success: true, data: orders };
    }
    
    /**
     * 根据订单编号获取订单详情
     * @param {string} orderId - 订单编号
     * @returns {object} {success: boolean, data: object|null}
     */
    function getById(orderId) {
        const orders = HotelApp.storage.get('orders') || [];
        const order = orders.find(o => o.orderId === orderId);
        
        if (order) {
            return { success: true, data: order };
        }
        
        return { success: false, message: '订单不存在', data: null };
    }
    
    /**
     * 获取指定房间的当前入住订单
     * @param {string} roomNumber - 房间号
     * @returns {object} {success: boolean, data: object|null}
     */
    function getByRoom(roomNumber) {
        const orders = HotelApp.storage.get('orders') || [];
        const order = orders.find(o => o.roomNumber === roomNumber);
        
        if (order) {
            return { success: true, data: order };
        }
        
        return { success: false, message: '该房间无入住订单', data: null };
    }
    
    /**
     * 创建入住订单
     * @param {object} order - 订单对象
     * @returns {object} {success: boolean, message: string}
     */
    function create(order) {
        // 校验必填字段
        const roomValid = HotelApp.validator.validateRequired(order.roomNumber, '房间号');
        if (!roomValid.valid) {
            return { success: false, message: roomValid.message };
        }
        
        const nameValid = HotelApp.validator.validateRequired(order.guestName, '客人姓名');
        if (!nameValid.valid) {
            return { success: false, message: nameValid.message };
        }
        
        // 校验日期
        const dateValid = HotelApp.validator.validateDateOrder(order.checkInDate, order.checkOutDate);
        if (!dateValid.valid) {
            return { success: false, message: dateValid.message };
        }
        
        // 校验入住人数
        const roomResult = HotelApp.room.getById(order.roomNumber);
        if (!roomResult.success) {
            return { success: false, message: roomResult.message };
        }
        
        if (order.guestCount > roomResult.data.beds) {
            return { success: false, message: '入住人数超过床位数' };
        }
        
        // 校验押金
        const depositValid = HotelApp.validator.validatePositiveNumber(order.deposit, '押金');
        if (!depositValid.valid) {
            return { success: false, message: depositValid.message };
        }
        
        // 创建订单
        const orders = HotelApp.storage.get('orders') || [];
        const newOrder = {
            orderId: HotelApp.formatter.generateOrderId(),
            roomNumber: order.roomNumber,
            guestId: order.guestId || '',
            guestName: order.guestName,
            guestIdCard: order.guestIdCard || '',
            guestPhone: order.guestPhone || '',
            guestCount: Number(order.guestCount) || 1,
            checkInDate: order.checkInDate,
            checkOutDate: order.checkOutDate,
            deposit: Number(order.deposit) || 0,
            remark: order.remark || '',
            createdAt: new Date().toISOString()
        };
        
        orders.push(newOrder);
        HotelApp.storage.set('orders', orders);
        
        return { success: true, message: '订单创建成功', data: newOrder };
    }
    
    /**
     * 删除入住订单
     * @param {string} orderId - 订单编号
     * @returns {object} {success: boolean, message: string}
     */
    function deleteOrder(orderId) {
        const orders = HotelApp.storage.get('orders') || [];
        const index = orders.findIndex(o => o.orderId === orderId);
        
        if (index === -1) {
            return { success: false, message: '订单不存在' };
        }
        
        orders.splice(index, 1);
        HotelApp.storage.set('orders', orders);
        
        return { success: true, message: '订单删除成功' };
    }
    
    /**
     * 办理入住
     * @param {object} params - 入住参数
     * @returns {object} {success: boolean, message: string}
     */
    function checkIn(params) {
        // 校验房间状态
        const roomResult = HotelApp.room.getById(params.roomNumber);
        if (!roomResult.success) {
            return { success: false, message: roomResult.message };
        }
        
        if (roomResult.data.status !== 'idle') {
            return { success: false, message: '该房间不是空闲状态，无法入住' };
        }
        
        // 创建订单
        const orderResult = create(params);
        if (!orderResult.success) {
            return { success: false, message: orderResult.message };
        }
        
        // 更新房间状态为已入住
        const statusResult = HotelApp.room.updateStatus(params.roomNumber, 'occupied');
        if (!statusResult.success) {
            // 回滚订单
            deleteOrder(orderResult.data.orderId);
            return { success: false, message: statusResult.message };
        }
        
        return { success: true, message: '入住成功', data: orderResult.data };
    }
    
    // 挂载到HotelApp命名空间
    HotelApp.order = {
        getAll: getAll,
        getById: getById,
        getByRoom: getByRoom,
        create: create,
        delete: deleteOrder,
        checkIn: checkIn
    };
})();