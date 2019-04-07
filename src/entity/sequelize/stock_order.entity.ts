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
            fields: ['stock_id', 'date'],
        },
    ],
})
export class StockOrder extends Model<StockOrder> {
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

    @ApiModelProperty({ description: '成交小时分钟' })
    @Column({
        type: DataType.STRING(5),
        allowNull: false,
    })
    minute: string;

    @ApiModelProperty({ description: '成交日期' })
    @Column({
        type: DataType.STRING(10),
        allowNull: false,
    })
    date: string;

    @ApiModelProperty({ description: '成交价' })
    @Column({
        type: DataType.DECIMAL(20, 2),
        allowNull: false,
        get() {
            const val: string = this.getDataValue('price');
            return val !== undefined ? Number(val) : undefined;
        },
    })
    price: number;

    @ApiModelProperty({ description: '成交数' })
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    hand: number;

}