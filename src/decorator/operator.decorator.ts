import { createParamDecorator } from '@nestjs/common';

export const Operator = createParamDecorator((data, req) => {
    return req.user;
});