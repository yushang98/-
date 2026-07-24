/**
 * validator.js - 表单格式校验工具
 * 职责：提供身份证、手机号、金额、日期等格式校验方法
 */

(function() {
    'use strict';
    
    // 初始化HotelApp命名空间
    window.HotelApp = window.HotelApp || {};
    
    /**
     * 校验身份证号格式
     * @param {string} idCard - 身份证号
     * @returns {object} {valid: boolean, message: string}
     */
    function validateIdCard(idCard) {
        if (!idCard) {
            return { valid: false, message: '身份证号不能为空' };
        }
        
        // 18位身份证号校验
        const reg = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
        
        if (!reg.test(idCard)) {
            return { valid: false, message: '身份证号格式不正确' };
        }
        
        return { valid: true, message: '' };
    }
    
    /**
     * 校验手机号格式
     * @param {string} phone - 手机号
     * @returns {object} {valid: boolean, message: string}
     */
    function validatePhone(phone) {
        if (!phone) {
            return { valid: false, message: '手机号不能为空' };
        }
        
        // 11位手机号校验
        const reg = /^1[3-9]\d{9}$/;
        
        if (!reg.test(phone)) {
            return { valid: false, message: '手机号格式不正确' };
        }
        
        return { valid: true, message: '' };
    }
    
    /**
     * 校验字段非空
     * @param {any} value - 字段值
     * @param {string} fieldName - 字段名称
     * @returns {object} {valid: boolean, message: string}
     */
    function validateRequired(value, fieldName) {
        if (value === null || value === undefined || value === '') {
            return { valid: false, message: `${fieldName}不能为空` };
        }
        
        if (Array.isArray(value) && value.length === 0) {
            return { valid: false, message: `${fieldName}不能为空` };
        }
        
        return { valid: true, message: '' };
    }
    
    /**
     * 校验数值为非负数
     * @param {number} value - 数值
     * @param {string} fieldName - 字段名称
     * @returns {object} {valid: boolean, message: string}
     */
    function validatePositiveNumber(value, fieldName) {
        if (value === null || value === undefined || value === '') {
            return { valid: false, message: `${fieldName}不能为空` };
        }
        
        const num = Number(value);
        
        if (isNaN(num)) {
            return { valid: false, message: `${fieldName}必须为数字` };
        }
        
        if (num < 0) {
            return { valid: false, message: `${fieldName}不能为负数` };
        }
        
        return { valid: true, message: '' };
    }
    
    /**
     * 校验开始日期早于结束日期
     * @param {string} startDate - 开始日期
     * @param {string} endDate - 结束日期
     * @returns {object} {valid: boolean, message: string}
     */
    function validateDateOrder(startDate, endDate) {
        if (!startDate || !endDate) {
            return { valid: false, message: '日期不能为空' };
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start >= end) {
            return { valid: false, message: '入住日期必须早于退房日期' };
        }
        
        return { valid: true, message: '' };
    }
    
    /**
     * 校验房间号全局唯一性
     * @param {string} roomNumber - 房间号
     * @param {string} excludeRoomNumber - 排除的房间号（编辑时使用）
     * @returns {object} {valid: boolean, message: string}
     */
    function validateRoomNumberUnique(roomNumber, excludeRoomNumber) {
        if (!roomNumber) {
            return { valid: false, message: '房间号不能为空' };
        }
        
        const rooms = HotelApp.storage.get('rooms') || [];
        const exists = rooms.find(room => room.roomNumber === roomNumber && room.roomNumber !== excludeRoomNumber);
        
        if (exists) {
            return { valid: false, message: '房间号已存在' };
        }
        
        return { valid: true, message: '' };
    }
    
    /**
     * 校验折扣比例
     * @param {number} discount - 折扣比例
     * @returns {object} {valid: boolean, message: string}
     */
    function validateDiscount(discount) {
        if (discount === null || discount === undefined || discount === '') {
            return { valid: false, message: '折扣比例不能为空' };
        }
        
        const num = Number(discount);
        
        if (isNaN(num)) {
            return { valid: false, message: '折扣比例必须为数字' };
        }
        
        if (num <= 0 || num > 1) {
            return { valid: false, message: '折扣比例必须在0-1之间' };
        }
        
        return { valid: true, message: '' };
    }
    
    // 挂载到HotelApp命名空间
    HotelApp.validator = {
        validateIdCard: validateIdCard,
        validatePhone: validatePhone,
        validateRequired: validateRequired,
        validatePositiveNumber: validatePositiveNumber,
        validateDateOrder: validateDateOrder,
        validateRoomNumberUnique: validateRoomNumberUnique,
        validateDiscount: validateDiscount
    };
})();