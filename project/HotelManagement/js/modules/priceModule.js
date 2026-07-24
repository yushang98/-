/**
 * priceModule.js - 价格规则模块
 * 职责：基础价格、特殊价格、优惠规则、房费核算
 */

(function() {
    'use strict';
    
    window.HotelApp = window.HotelApp || {};
    
    /**
     * 获取完整价格规则配置
     * @returns {object} {success: boolean, data: object}
     */
    function getRules() {
        const rules = HotelApp.storage.get('priceRules');
        
        if (!rules) {
            // 返回默认规则
            return {
                success: true,
                data: {
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
        }
        
        return { success: true, data: rules };
    }
    
    /**
     * 保存价格规则配置
     * @param {object} rules - 价格规则
     * @returns {object} {success: boolean, message: string}
     */
    function saveRules(rules) {
        // 校验周末价格系数
        if (rules.weekendMultiplier) {
            const multiplier = Number(rules.weekendMultiplier);
            if (isNaN(multiplier) || multiplier <= 0) {
                return { success: false, message: '周末价格系数必须大于0' };
            }
        }
        
        // 校验长住优惠规则
        if (rules.longStayDiscounts && rules.longStayDiscounts.length > 0) {
            for (const rule of rules.longStayDiscounts) {
                const daysValid = HotelApp.validator.validatePositiveNumber(rule.days, '连住天数');
                if (!daysValid.valid) {
                    return { success: false, message: daysValid.message };
                }
                
                const discountValid = HotelApp.validator.validateDiscount(rule.discount);
                if (!discountValid.valid) {
                    return { success: false, message: discountValid.message };
                }
            }
        }
        
        // 校验特殊日期价格
        if (rules.specialPrices && rules.specialPrices.length > 0) {
            for (const sp of rules.specialPrices) {
                const dateValid = HotelApp.validator.validateDateOrder(sp.startDate, sp.endDate);
                if (!dateValid.valid) {
                    return { success: false, message: '特殊日期区间：' + dateValid.message };
                }
                
                const multiplier = Number(sp.multiplier);
                if (isNaN(multiplier) || multiplier <= 0) {
                    return { success: false, message: '特殊日期价格倍数必须大于0' };
                }
            }
        }
        
        HotelApp.storage.set('priceRules', rules);
        
        return { success: true, message: '保存成功' };
    }
    
    /**
     * 获取指定房型的基础房价
     * @param {string} roomType - 房型
     * @returns {number} 基础房价
     */
    function getBasePrice(roomType) {
        const rules = getRules();
        return rules.data.basePrices[roomType] || 288;
    }
    
    /**
     * 获取周末价格系数
     * @returns {number} 周末价格系数
     */
    function getWeekendMultiplier() {
        const rules = getRules();
        return rules.data.weekendMultiplier || 1.0;
    }
    
    /**
     * 获取长住优惠规则列表
     * @returns {Array} 长住优惠规则数组
     */
    function getLongStayDiscountRules() {
        const rules = getRules();
        return rules.data.longStayDiscounts || [];
    }
    
    /**
     * 获取特殊日期价格列表
     * @returns {Array} 特殊日期价格数组
     */
    function getSpecialPrices() {
        const rules = getRules();
        return rules.data.specialPrices || [];
    }
    
    // 挂载到HotelApp命名空间
    HotelApp.price = {
        getRules: getRules,
        saveRules: saveRules,
        getBasePrice: getBasePrice,
        getWeekendMultiplier: getWeekendMultiplier,
        getLongStayDiscountRules: getLongStayDiscountRules,
        getSpecialPrices: getSpecialPrices
    };
})();