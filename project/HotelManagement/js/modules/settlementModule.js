/**
 * settlementModule.js - 结算模块
 * 职责：结算记录、账单详情、打印
 */

(function() {
    'use strict';
    
    window.HotelApp = window.HotelApp || {};
    
    /**
     * 获取所有结算记录
     * @returns {object} {success: boolean, data: Array}
     */
    function getAll() {
        const settlements = HotelApp.storage.get('settlements') || [];
        return { success: true, data: settlements };
    }
    
    /**
     * 根据结算编号获取结算详情
     * @param {string} settlementId - 结算编号
     * @returns {object} {success: boolean, data: object|null}
     */
    function getById(settlementId) {
        const settlements = HotelApp.storage.get('settlements') || [];
        const settlement = settlements.find(s => s.settlementId === settlementId);
        
        if (settlement) {
            return { success: true, data: settlement };
        }
        
        return { success: false, message: '结算记录不存在', data: null };
    }
    
    /**
     * 创建结算记录
     * @param {object} settlement - 结算对象
     * @returns {object} {success: boolean, message: string}
     */
    function create(settlement) {
        const settlements = HotelApp.storage.get('settlements') || [];
        
        const newSettlement = {
            settlementId: HotelApp.formatter.generateSettlementId(),
            orderId: settlement.orderId,
            roomNumber: settlement.roomNumber,
            guestId: settlement.guestId,
            guestName: settlement.guestName,
            checkInDate: settlement.checkInDate,
            checkOutDate: settlement.checkOutDate,
            roomCharge: settlement.roomCharge,
            dailyCharges: settlement.dailyCharges,
            extraCharges: settlement.extraCharges || [],
            deposit: settlement.deposit,
            totalAmount: settlement.totalAmount,
            paymentMethod: settlement.paymentMethod,
            remark: settlement.remark || '',
            createdAt: new Date().toISOString()
        };
        
        settlements.push(newSettlement);
        HotelApp.storage.set('settlements', settlements);
        
        return { success: true, message: '结算记录创建成功', data: newSettlement };
    }
    
    /**
     * 办理退房
     * @param {object} params - 退房参数
     * @returns {object} {success: boolean, message: string}
     */
    function checkOut(params) {
        // 获取入住订单
        const orderResult = HotelApp.order.getByRoom(params.roomNumber);
        if (!orderResult.success) {
            return { success: false, message: orderResult.message };
        }
        
        const order = orderResult.data;
        
        // 创建结算记录
        const settlementResult = create({
            orderId: order.orderId,
            roomNumber: params.roomNumber,
            guestId: order.guestId,
            guestName: order.guestName,
            checkInDate: order.checkInDate,
            checkOutDate: params.actualCheckOutDate || order.checkOutDate,
            roomCharge: params.roomCharge,
            dailyCharges: params.dailyCharges,
            extraCharges: params.extraCharges,
            deposit: order.deposit,
            totalAmount: params.totalAmount,
            paymentMethod: params.paymentMethod,
            remark: params.remark
        });
        
        if (!settlementResult.success) {
            return { success: false, message: settlementResult.message };
        }
        
        // 删除入住订单
        HotelApp.order.delete(order.orderId);
        
        // 更新房间状态为清洁中
        HotelApp.room.updateStatus(params.roomNumber, 'cleaning');
        
        return { success: true, message: '退房成功', data: settlementResult.data };
    }
    
    /**
     * 按日期区间筛选结算记录
     * @param {string} startDate - 开始日期
     * @param {string} endDate - 结束日期
     * @returns {object} {success: boolean, data: Array}
     */
    function filterByDate(startDate, endDate) {
        let settlements = HotelApp.storage.get('settlements') || [];
        
        if (startDate) {
            const start = new Date(startDate);
            settlements = settlements.filter(s => new Date(s.createdAt) >= start);
        }
        
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            settlements = settlements.filter(s => new Date(s.createdAt) <= end);
        }
        
        return { success: true, data: settlements };
    }
    
    /**
     * 计算账单明细
     * @param {object} params - 参数对象
     * @returns {object} {success: boolean, data: object}
     */
    function calculateBill(params) {
        const { room, checkInDate, checkOutDate, extraCharges, deposit, isHalfDay } = params;
        
        // 获取价格规则
        const priceRulesResult = HotelApp.price.getRules();
        const priceRules = priceRulesResult.data;
        
        // 计算房费
        const chargeResult = HotelApp.calculator.calculateRoomCharge({
            room: room,
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            priceRules: priceRules
        });
        
        let roomCharge = chargeResult.totalCharge;
        const dailyCharges = chargeResult.dailyCharges;
        
        // 应用半天房费
        if (isHalfDay && dailyCharges.length > 0) {
            const lastDay = dailyCharges[dailyCharges.length - 1];
            lastDay.charge = HotelApp.calculator.calculateHalfDayCharge(lastDay.charge, true);
            roomCharge = dailyCharges.reduce((sum, d) => sum + d.charge, 0);
        }
        
        // 计算账单总额
        const billResult = HotelApp.calculator.calculateBillTotal({
            roomCharge: roomCharge,
            extraCharges: extraCharges,
            deposit: deposit
        });
        
        return {
            success: true,
            data: {
                roomCharge: billResult.roomCharge,
                dailyCharges: dailyCharges,
                extraTotal: billResult.extraTotal,
                deposit: billResult.deposit,
                totalAmount: billResult.total
            }
        };
    }
    
    // 挂载到HotelApp命名空间
    HotelApp.settlement = {
        getAll: getAll,
        getById: getById,
        create: create,
        checkOut: checkOut,
        filterByDate: filterByDate,
        calculateBill: calculateBill
    };
})();