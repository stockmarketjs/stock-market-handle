import { ApiModelProperty } from '@nestjs/swagger';

export class Status {
    constructor(message: string = 'OK', statusCode: number = 200) {
        this.message = message;
        this.statusCode = statusCode;
    }
    @ApiModelProperty({ description: 'message' })
    message: string;
    @ApiModelProperty({ description: 'statusCode' })
    statusCode: number;
}