import * as _ from 'lodash';

export class Calc {

    public static formatToPer(per: number) {
        return _.round(per, 2);
    }

    /**
     * 假设购买股票后, 计算剩余金额
     *
     * @static
     * @param {number} money
     * @param {number} price
     * @param {number} hand
     * @returns
     * @memberof Calc
     */
    public static calcStockBuyRemain(money: number, price: number, hand: number) {
        const handPerStock = 100;

        const amount = hand * handPerStock;
        return money - price * amount;
    }

    /**
     * 购买股票, 所需要花费的资金
     *
     * @static
     * @param {number} price
     * @param {number} hand
     * @returns
     * @memberof Calc
     */
    public static calcStockBuyCost(price: number, hand: number) {
        const handPerStock = 100;

        const amount = hand * handPerStock;
        return price * amount;
    }

    // 减法核心
    private static subCore(arg1: number, arg2: number): number {
        let r1: number;
        let r2: number;
        let m: number;
        let n: number;
        try {
            r1 = arg1.toString().split('.')[1].length;
        } catch (e) {
            r1 = 0;
        }
        try {
            r2 = arg2.toString().split('.')[1].length;
        } catch (e) {
            r2 = 0;
        }
        m = Math.pow(10, Math.max(r1, r2));
        n = r1 >= r2 ? r1 : r2;
        return Number(((arg1 * m - arg2 * m) / m).toFixed(n));
    }

    /**
     * 减法
     *
     * @static
     * @param {...number[]} numbs
     * @returns {number}
     * @memberof Calc
     */
    static sub(...numbs: number[]): number {
        let num = numbs.shift();
        if (num === undefined) throw new Error('减法异常');
        for (const numb of numbs) {
            num = this.subCore(num, numb);
        }
        return num;
    }

    // 加法
    static add(arg1, arg2) {
        let r1: number;
        let r2: number;
        let m: number;
        try {
            r1 = arg1.toString().split('.')[1].length;
        } catch (e) {
            r1 = 0;
        }
        try {
            r2 = arg2.toString().split('.')[1].length;
        } catch (e) {
            r2 = 0;
        }
        m = Math.pow(10, Math.max(r1, r2));
        return (Calc.mul(arg1, m) + Calc.mul(arg2, m)) / m;
    }

    // 除法
    static div(arg1: number, arg2: number) {
        let t1 = 0;
        let t2 = 0;
        let t = 0;
        let r1: number;
        let r2: number;
        try { t1 = arg1.toString().split('.')[1].length; } catch (e) { }
        try { t2 = arg2.toString().split('.')[1].length; } catch (e) { }
        r1 = Number(arg1);
        r2 = Number(arg2);
        t = t1 >= t2 ? t1 : t2;
        return (r1 * Math.pow(10, t)) / (r2 * Math.pow(10, t));
    }

    // 乘法
    static mul(arg1: number, arg2: number) {
        let t1 = 0;
        let t2 = 0;
        let t = 0;
        let r1: number;
        let r2: number;
        try { t1 = arg1.toString().split('.')[1].length; } catch (e) { }
        try { t2 = arg2.toString().split('.')[1].length; } catch (e) { }
        r1 = Number(arg1);
        r2 = Number(arg2);
        t = t1 >= t2 ? t1 : t2;
        return (r1 * Math.pow(10, t)) * (r2 * Math.pow(10, t)) / Math.pow(10, t) / Math.pow(10, t);
    }

}