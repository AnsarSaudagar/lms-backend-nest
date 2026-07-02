import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from 'src/schemas/payment.schema';
import {
  UserProject,
  UserProjectSchema,
} from 'src/schemas/user-project.schema';
import { Project, ProjectSchema } from 'src/schemas/project.schema';
import { PaymentsService } from './payments.service';
import { UserProjectService } from './user-project.service';
import { PurchasesController } from './purchases.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: UserProject.name, schema: UserProjectSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [PurchasesController],
  providers: [PaymentsService, UserProjectService],
  exports: [UserProjectService],
})
export class PurchasesModule {}
