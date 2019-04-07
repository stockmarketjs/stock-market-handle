import { IsDefined, IsString, IsNumber } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { ConstData } from '../../constant/data.const';

export class UserStockOrderUpdateBodyDto {

    @ApiModelProperty({ description: '订单状态', enum: ConstData.ORDER_STATE })
    @IsDefined() @IsNumber()
    state: ConstData.ORDER_STATE;

}

export class UserStockOrderCreateBodyDto {

    @ApiModelProperty({ description: '股票ID' })
    @IsDefined() @IsString()
    stockId: string;

    @ApiModelProperty({ description: '用户ID' })
    @IsDefined() @IsString()
    userId: string;

    @ApiModelProperty({ description: '订单状态', enum: ConstData.ORDER_STATE })
    @IsDefined() @IsNumber()
    state: ConstData.ORDER_STATE;

    @ApiModelProperty({ description: '订单类型', enum: ConstData.TRADE_ACTION })
    @IsDefined() @IsNumber()
    type: ConstData.TRADE_ACTION;

    @ApiModelProperty({ description: '订单模式', enum: ConstData.TRADE_MODE })
    @IsDefined() @IsNumber()
    mode: ConstData.TRADE_MODE;

    @ApiModelProperty({ description: '价格' })
    @IsDefined() @IsNumber()
    price: number;

    @ApiModelProperty({ description: '手数' })
    @IsDefined() @IsNumber()
    hand: number;

}