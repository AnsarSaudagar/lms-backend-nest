import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserProjectProgress,
  UserProjectProgressSchema,
} from 'src/modules/progress/schemas/user-project-progress.schema';
import { ProgressService } from './progress.service';
import { ProgressController, MyProgressController } from './progress.controller';
import { PurchasesModule } from '../purchases/purchases.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProjectProgress.name, schema: UserProjectProgressSchema },
    ]),
    PurchasesModule,
  ],
  controllers: [ProgressController, MyProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
