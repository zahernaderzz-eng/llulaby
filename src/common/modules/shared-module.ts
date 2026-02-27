import { Global, Module } from '@nestjs/common';
import { SharedVariables } from '../shared-variables/shared-variables';
import { ReturnObject } from '../return-object/return-object';

@Global()
@Module({
    providers: [SharedVariables, ReturnObject],
    exports: [SharedVariables, ReturnObject],
})
export class SharedModule {}
