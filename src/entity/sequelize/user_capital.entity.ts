import { Table, Column, Model, Unique, DataType } from 'sequelize-typescript';
import { ApiModelProperty } from '@nestjs/swagger';

@Table({
    timestamps: true,
    paranoid: true,
    underscored: true,
})
export class UserCapital extends Model<UserCapital> {
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
        unique: true,
        allowNull: false,
        field: 'user_id',
    })
    userId: string;

    @ApiModelProperty({ description: '持有资金' })
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    cash: number;

    @ApiModelProperty({ description: '冻结持有资金' })
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
        defaultValue: 0,
        field: 'frozen_cash',
    })
    frozenCash: number;

}