/**
 * calculator.js - 价格计算引擎
 * 职责：计算入住天数、房费、匹配价格规则、应用优惠
 */

(function() {
    'use strict';
    
    // 初始化HotelApp命名空间
    window.HotelApp = window.HotelApp || {};
    
    /**
     * 计算两个日期之间的天数
     * @param {string} startDate - 开始日期
     * @param {string} endDate - 结束日期
     * @returns {number} 天数
     */
    function calculateDays(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diff = end - start;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    
    /**
     * 判断指定日期是否为周末
     * @param {string|Date} date - 日期
     * @returns {boolean} 是否为周末
     */
    function isWeekend(date) {
        const d = new Date(date);
        const day = d.getDay();
        return day === 0 || day === 6;
    }
    
    /**
     * 匹配特殊日期价格
     * @param {string} date - 日期
     * @param {Array} specialPrices - 特殊日期价格列表
     * @returns {number|null} 价格倍数，无匹配返回null
     */
    function matchSpecialPrice(date, specialPrices) {
        if (!specialPrices || specialPrices.length === 0) {
            return null;
        }
        
        const d = new Date(date);
        
        for (const sp of specialPrices) {
            const start = new Date(sp.startDate);
            const end = new Date(sp.endDate);
            
            if (d >= start && d <= end) {
                return sp.multiplier;
            }
        }
        
        return null;
    }
    
    /**
     * 应用长住优惠
     * @param {number} totalCharge - 总房费
     * @param {number} days - 入住天数
     * @param {Array} discountRules - 长住优惠规则
     * @returns {number} 折扣后金额
     */
    function applyLongStayDiscount(totalCharge, days, discountRules) {
        if (!discountRules || discountRules.length === 0) {
            return totalCharge;
        }
        
        // 找到天数最长且匹配的规则
        let matchedRule = null;
        
        for (const rule of discountRules) {
            if (days >= rule.days) {
                if (!matchedRule || rule.days > matchedRule.days) {
                    matchedRule = rule;
                }
            }
        }
        
        if (matchedRule) {
            return totalCharge * matchedRule.discount;
        }
        
        return totalCharge;
    }
    
    /**
     * 计算入住期间总房费
     * @param {object} params - 参数对象
     * @param {object} params.room - 房间对象
     * @param {string} params.checkInDate - 入住日期
     * @param {string} params.checkOutDate - 退房日期
     * @param {object} params.priceRules - 价格规则
     * @returns {object} {totalCharge: number, dailyCharges: Array}
     */
    function calculateRoomCharge(params) {
        const { room, checkInDate, checkOutDate, priceRules } = params;
        
        if (!room || !checkInDate || !checkOutDate || !priceRules) {
            return { totalCharge: 0, dailyCharges: [] };
        }
        
        const days = calculateDays(checkInDate, checkOutDate);
        const dailyCharges = [];
        let totalCharge = 0;
        
        // 获取基础房价
        const basePrice = priceRules.basePrices[room.roomType] || room.basePrice;
        const weekendMultiplier = priceRules.weekendMultiplier || 1.0;
        const specialPrices = priceRules.specialPrices || [];
        
        // 逐天计算房费
        for (let i = 0; i < days; i++) {
            const currentDate = new Date(checkInDate);
            currentDate.setDate(currentDate.getDate() + i);
            const dateStr = HotelApp.formatter.formatDate(currentDate);
            
            let dailyCharge = basePrice;
            
            // 优先级：特殊日期价格 > 周末价格 > 基础房价
            const specialMultiplier = matchSpecialPrice(dateStr, specialPrices);
            
            if (specialMultiplier) {
                dailyCharge = basePrice * specialMultiplier;
            } else if (isWeekend(currentDate)) {
                dailyCharge = basePrice * weekendMultiplier;
            }
            
            dailyCharges.push({
                date: dateStr,
                charge: dailyCharge,
                isWeekend: isWeekend(currentDate),
                isSpecial: !!specialMultiplier
            });
            
            totalCharge += dailyCharge;
        }
        
        // 应用长住优惠
        const discountRules = priceRules.longStayDiscounts || [];
        totalCharge = applyLongStayDiscount(totalCharge, days, discountRules);
        
        return {
            totalCharge: Math.round(totalCharge * 100) / 100,
            dailyCharges: dailyCharges
        };
    }
    
    /**
     * 计算半天房费
     * @param {number} dailyCharge - 日房费
     * @param {boolean} isHalfDay - 是否半天
     * @returns {number} 房费
     */
    function calculateHalfDayCharge(dailyCharge, isHalfDay) {
        if (isHalfDay) {
            return Math.round(dailyCharge * 0.5 * 100) / 100;
        }
        return dailyCharge;
    }
    
    /**
     * 计算账单总额
     * @param {object} params - 参数对象
     * @param {number} params.roomCharge - 房费总额
     * @param {Array} params.extraCharges - 额外消费列表
     * @param {number} params.deposit - 押金
     * @returns {object} {total: number, roomCharge: number, extraTotal: number, deposit: number}
     */
    function calculateBillTotal(params) {
        const { roomCharge, extraCharges, deposit } = params;
        
        let extraTotal = 0;
        
        if (extraCharges && extraCharges.length > 0) {
            extraTotal = extraCharges.reduce((sum, item) => sum + Number(item.amount), 0);
        }
        
        const total = roomCharge + extraTotal - (deposit || 0);
        
        return {
            total: Math.round(total * 100) / 100,
            roomCharge: roomCharge,
            extraTotal: Math.round(extraTotal * 100) / 100,
            deposit: deposit || 0
        };
    }
    
    // 挂载到HotelApp命名空间
    HotelApp.calculator = {
        calculateDays: calculateDays,
        isWeekend: isWeekend,
        matchSpecialPrice: matchSpecialPrice,
        applyLongStayDiscount: applyLongStayDiscount,
        calculateRoomCharge: calculateRoomCharge,
        calculateHalfDayCharge: calculateHalfDayCharge,
        calculateBillTotal: calculateBillTotal
    };
})();