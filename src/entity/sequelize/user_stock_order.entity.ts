import { Table, Column, Model, Unique, DataType } from 'sequelize-typescript';
import { ApiModelProperty } from '@nestjs/swagger';
import { ConstData } from '../../constant/data.const';

@Table({
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
        {
            unique: false,
            fields: ['stock_id', 'state'],
        },
    ],
})
export class UserStockOrder extends Model<UserStockOrder> {
    @ApiModelProperty({ description: 'ID' })
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false,
    })
    readonly id: string;

    @ApiModelProperty({ description: '股票ID' })
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'stock_id',
    })
    stockId: string;

    @ApiModelProperty({ description: '用户ID' })
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'user_id',
    })
    userId: string;

    @ApiModelProperty({ description: '订单状态', enum: ConstData.ORDER_STATE })
    @Column({
        type: DataType.TINYINT,
        allowNull: false,
    })
    state: ConstData.ORDER_STATE;

    @ApiModelProperty({ description: '订单类型', enum: ConstData.TRADE_ACTION })
    @Column({
        type: DataType.TINYINT,
        allowNull: false,
    })
    type: ConstData.TRADE_ACTION;

    @ApiModelProperty({ description: '订单模式', enum: ConstData.TRADE_MODE })
    @Column({
        type: DataType.TINYINT,
        allowNull: false,
    })
    mode: ConstData.TRADE_MODE;

    @ApiModelProperty({ description: '价格' })
    @Column({
        type: DataType.DECIMAL(20, 2),
        allowNull: false,
        get() {
            const val: string = this.getDataValue('price');
            return val !== undefined ? Number(val) : undefined;
        },
    })
    price: number;

    @ApiModelProperty({ description: '手数' })
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    hand: number;

    @ApiModelProperty({ description: '交易用手数' })
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    tradeHand: number;
}