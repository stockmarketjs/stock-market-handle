import { ApiModelProperty } from '@nestjs/swagger';

export class StockOrderFindAllCoreShift {
    @ApiModelProperty({ description: '档号对应的总手数' })
    readonly hand: number;
    @ApiModelProperty({ description: '档号' })
    readonly shift: number;
    @ApiModelProperty({ description: '档号对应价格' })
    readonly price: number;
    @ApiModelProperty({ description: 'IDs' })
    readonly ids: string[];
}

export class StockOrderFindAllBuyShift {
    @ApiModelProperty({ description: '档号对应的总手数' })
    readonly hand: number;
    @ApiModelProperty({ description: '档号' })
    readonly shift: number;
    @ApiModelProperty({ description: '档号对应价格' })
    readonly price: number;
}

export class StockOrderFindAllSoldShift {
    @ApiModelProperty({ description: '档号对应的总手数' })
    readonly hand: number;
    @ApiModelProperty({ description: '档号' })
    readonly shift: number;
}