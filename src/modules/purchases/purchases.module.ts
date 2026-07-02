import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from 'src/modules/purchases/schemas/payment.schema';
import {
  UserProject,
  UserProjectSchema,
} from 'src/modules/purchases/schemas/user-project.schema';
import { PaymentsService } from './payments.service';
import { UserProjectService } from './user-project.service';
import { PurchasesController } from './purchases.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: UserProject.name, schema: UserProjectSchema },
    ]),
    ProjectsModule,
  ],
  controllers: [PurchasesController],
  providers: [PaymentsService, UserProjectService],
  exports: [UserProjectService],
})
export class PurchasesModule {}
