/**
 * roomModule.js - 房间管理模块
 * 职责：房间增删改查、筛选、状态流转
 */

(function() {
    'use strict';
    
    window.HotelApp = window.HotelApp || {};
    
    /**
     * 获取所有房间
     * @returns {object} {success: boolean, data: Array}
     */
    function getAll() {
        const rooms = HotelApp.storage.get('rooms') || [];
        return { success: true, data: rooms };
    }
    
    /**
     * 根据房间号获取房间详情
     * @param {string} roomNumber - 房间号
     * @returns {object} {success: boolean, data: object|null}
     */
    function getById(roomNumber) {
        const rooms = HotelApp.storage.get('rooms') || [];
        const room = rooms.find(r => r.roomNumber === roomNumber);
        
        if (room) {
            return { success: true, data: room };
        }
        
        return { success: false, message: '房间不存在', data: null };
    }
    
    /**
     * 新增房间
     * @param {object} room - 房间对象
     * @returns {object} {success: boolean, message: string}
     */
    function add(room) {
        // 校验必填字段
        const required = HotelApp.validator.validateRequired(room.roomNumber, '房间号');
        if (!required.valid) {
            return { success: false, message: required.message };
        }
        
        // 校验房间号唯一性
        const unique = HotelApp.validator.validateRoomNumberUnique(room.roomNumber);
        if (!unique.valid) {
            return { success: false, message: unique.message };
        }
        
        // 校验数值字段
        const floorValid = HotelApp.validator.validatePositiveNumber(room.floor, '楼层');
        if (!floorValid.valid) {
            return { success: false, message: floorValid.message };
        }
        
        const bedsValid = HotelApp.validator.validatePositiveNumber(room.beds, '床位数');
        if (!bedsValid.valid) {
            return { success: false, message: bedsValid.message };
        }
        
        const priceValid = HotelApp.validator.validatePositiveNumber(room.basePrice, '基础房价');
        if (!priceValid.valid) {
            return { success: false, message: priceValid.message };
        }
        
        // 添加房间
        const rooms = HotelApp.storage.get('rooms') || [];
        const newRoom = {
            roomNumber: room.roomNumber,
            floor: Number(room.floor),
            roomType: room.roomType || 'single',
            beds: Number(room.beds),
            basePrice: Number(room.basePrice),
            status: room.status || 'idle',
            remark: room.remark || ''
        };
        
        rooms.push(newRoom);
        HotelApp.storage.set('rooms', rooms);
        
        return { success: true, message: '添加成功' };
    }
    
    /**
     * 更新房间信息
     * @param {string} roomNumber - 房间号
     * @param {object} room - 房间对象
     * @returns {object} {success: boolean, message: string}
     */
    function update(roomNumber, room) {
        // 校验房间号唯一性（排除自身）
        if (room.roomNumber !== roomNumber) {
            const unique = HotelApp.validator.validateRoomNumberUnique(room.roomNumber, roomNumber);
            if (!unique.valid) {
                return { success: false, message: unique.message };
            }
        }
        
        const rooms = HotelApp.storage.get('rooms') || [];
        const index = rooms.findIndex(r => r.roomNumber === roomNumber);
        
        if (index === -1) {
            return { success: false, message: '房间不存在' };
        }
        
        // 更新房间信息
        rooms[index] = {
            ...rooms[index],
            roomNumber: room.roomNumber,
            floor: Number(room.floor),
            roomType: room.roomType,
            beds: Number(room.beds),
            basePrice: Number(room.basePrice),
            remark: room.remark || ''
        };
        
        HotelApp.storage.set('rooms', rooms);
        
        return { success: true, message: '更新成功' };
    }
    
    /**
     * 删除房间
     * @param {string} roomNumber - 房间号
     * @returns {object} {success: boolean, message: string}
     */
    function deleteRoom(roomNumber) {
        const rooms = HotelApp.storage.get('rooms') || [];
        const room = rooms.find(r => r.roomNumber === roomNumber);
        
        if (!room) {
            return { success: false, message: '房间不存在' };
        }
        
        // 校验房间状态
        if (room.status === 'occupied') {
            return { success: false, message: '该房间已入住，无法删除' };
        }
        
        const index = rooms.findIndex(r => r.roomNumber === roomNumber);
        rooms.splice(index, 1);
        HotelApp.storage.set('rooms', rooms);
        
        return { success: true, message: '删除成功' };
    }
    
    /**
     * 更新房间状态
     * @param {string} roomNumber - 房间号
     * @param {string} status - 新状态
     * @returns {object} {success: boolean, message: string}
     */
    function updateStatus(roomNumber, status) {
        const rooms = HotelApp.storage.get('rooms') || [];
        const room = rooms.find(r => r.roomNumber === roomNumber);
        
        if (!room) {
            return { success: false, message: '房间不存在' };
        }
        
        // 状态流转校验
        const validTransitions = {
            'idle': ['occupied', 'maintenance'],
            'occupied': ['cleaning'],
            'cleaning': ['idle', 'maintenance'],
            'maintenance': ['idle']
        };
        
        if (!validTransitions[room.status].includes(status)) {
            return { success: false, message: `不能从"${HotelApp.formatter.formatRoomStatus(room.status)}"变为"${HotelApp.formatter.formatRoomStatus(status)}"` };
        }
        
        room.status = status;
        HotelApp.storage.set('rooms', rooms);
        
        return { success: true, message: '状态更新成功' };
    }
    
    /**
     * 筛选房间
     * @param {object} filters - 筛选条件
     * @returns {object} {success: boolean, data: Array}
     */
    function filter(filters) {
        let rooms = HotelApp.storage.get('rooms') || [];
        
        // 按房间号搜索
        if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase();
            rooms = rooms.filter(r => r.roomNumber.toLowerCase().includes(keyword));
        }
        
        // 按状态筛选
        if (filters.status) {
            rooms = rooms.filter(r => r.status === filters.status);
        }
        
        // 按房型筛选
        if (filters.roomType) {
            rooms = rooms.filter(r => r.roomType === filters.roomType);
        }
        
        // 按楼层筛选
        if (filters.floor) {
            rooms = rooms.filter(r => r.floor === Number(filters.floor));
        }
        
        return { success: true, data: rooms };
    }
    
    // 挂载到HotelApp命名空间
    HotelApp.room = {
        getAll: getAll,
        getById: getById,
        add: add,
        update: update,
        delete: deleteRoom,
        updateStatus: updateStatus,
        filter: filter
    };
})();