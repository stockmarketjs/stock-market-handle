import { Table, Column, Model, Unique, DataType } from 'sequelize-typescript';
import { ApiModelProperty } from '@nestjs/swagger';
import { ConstData } from '../../constant/data.const';

@Table({
    timestamps: true,
    paranoid: true,
    underscored: true,
})
export class StockCapital extends Model<StockCapital> {
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
        unique: true,
        allowNull: false,
        field: 'stock_id',
    })
    stockId: string;

    @ApiModelProperty({ description: '总股本' })
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
        field: 'general_capital',
    })
    generalCapital: number;

}