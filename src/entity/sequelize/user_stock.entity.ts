import { Table, Column, Model, Unique, DataType } from 'sequelize-typescript';
import { ApiModelProperty } from '@nestjs/swagger';

@Table({
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['stock_id', 'user_id'],
        },
    ],
})
export class UserStock extends Model<UserStock> {
    @ApiModelProperty({ description: 'ID' })
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: DataType.UUIDV4,
        allowNull: false,
    })
    readonly id: string;

    @ApiModelProperty({ description: '员工ID' })
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'user_id',
    })
    userId: string;

    @ApiModelProperty({ description: '股票ID' })
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'stock_id',
    })
    stockId: string;

    @ApiModelProperty({ description: '成本均价' })
    @Column({
        type: DataType.DECIMAL(20, 2),
        allowNull: false,
        field: 'cost_price',
        get() {
            const val: string = this.getDataValue('costPrice');
            return val !== undefined ? Number(val) : undefined;
        },
    })
    costPrice: number;

    @ApiModelProperty({ description: '持仓数' })
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    amount: number;

    @ApiModelProperty({ description: '冻结持仓数' })
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
        defaultValue: 0,
        field: 'frozen_amount',
    })
    frozenAmount: number;

}