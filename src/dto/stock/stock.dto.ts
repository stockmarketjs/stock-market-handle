import { IsDefined, IsString, IsInt, IsNumber } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { Stock } from '../../entity/sequelize/stock.entity';

export class StockUpdateDto {
    @ApiModelProperty({ description: '成交价' })
    @IsDefined() @IsNumber()
    readonly finalPrice: number;
    @ApiModelProperty({ description: '成交手数' })
    @IsDefined() @IsNumber()
    readonly finalHand: number;
}

export class StockBuyDto {
    @ApiModelProperty({ description: '价格' })
    @IsDefined() @IsNumber()
    readonly price: number;
    @ApiModelProperty({ description: '手数' })
    @IsDefined() @IsNumber()
    readonly hand: number;
}

export class StockSoldDto extends StockBuyDto {

}

export class StockFindAllDto extends Stock {
    @ApiModelProperty({ description: '换手率' })
    readonly turnoverPer: number;
    @ApiModelProperty({ description: '增幅' })
    readonly risePer: number;
}
