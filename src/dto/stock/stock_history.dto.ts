import { IsDefined, IsString, IsInt, IsNumber } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { ConstData } from '../../constant/data.const';

export class StockHistoryCreateBodyDto {
    @ApiModelProperty({ description: '股票ID' })
    @IsDefined() @IsString()
    stockId: string;

    @ApiModelProperty({ description: '日期, 年月日' })
    @IsDefined() @IsString()
    date: string;

    @ApiModelProperty({ description: '证券所标识', enum: ConstData.STOCK_MARKET })
    @IsDefined() @IsString()
    market: ConstData.STOCK_MARKET;

    @ApiModelProperty({ description: '股票名称' })
    @IsDefined() @IsString()
    name: string;

    @ApiModelProperty({ description: '当前价' })
    @IsDefined() @IsNumber()
    currentPrice: number;

    @ApiModelProperty({ description: '换手' })
    @IsDefined() @IsNumber()
    change: number;

    @ApiModelProperty({ description: '总手' })
    @IsDefined() @IsNumber()
    totalHand: number;

    @ApiModelProperty({ description: '开盘价' })
    @IsDefined() @IsNumber()
    startPrice: number;

    @ApiModelProperty({ description: '收盘价' })
    @IsDefined() @IsNumber()
    endPrice: number;

    @ApiModelProperty({ description: '最高价' })
    @IsDefined() @IsNumber()
    highestPrice: number;

    @ApiModelProperty({ description: '最低价' })
    @IsDefined() @IsNumber()
    lowestPrice: number;
}