export namespace ConstData {

    export enum STOCK_MARKET {
        // 上海证券交易所
        SH = 'sh',
        // 深圳证券交易所
        SZ = 'sz',
    }

    export enum TRADE_ACTION {
        BUY = 0,
        SOLD = 1,
    }

    export enum ORDER_STATE {
        // 待撮合
        READY = 0,
        // 撮合中
        TRADEING = 1,
        // 交易成功
        SUCCESS = 2,
        // 撮合失败
        FAIL = 3,
        // 撤回
        CANCEL = 4,
    }

    /**
     * 交易委托方式
     *
     * @export
     * @enum {number}
     */
    export enum TRADE_MODE {
        /**
         * 限价委托
         */
        LIMIT = 0,
        /**
         * 市价委托 TODO: 国家貌似已经废除
         */
        MARKET = 1,
    }

    export const TRADE_PERIODS = [
        {
            begin: '00:30',
            end: '11:30',
        },
        {
            begin: '12:00',
            end: '23:00',
        },
    ];

    export enum Boolean {
        TRUE = 1,
        FALSE = 0,
    }

}