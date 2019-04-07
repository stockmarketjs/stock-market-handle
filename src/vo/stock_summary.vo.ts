import { ApiModelProperty } from '@nestjs/swagger';

export class StockSummaryCountVo {
    @ApiModelProperty({ description: '名称' })
    name: string;
    @ApiModelProperty({ description: '数值' })
    value: number;
}