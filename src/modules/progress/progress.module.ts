import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserProjectProgress,
  UserProjectProgressSchema,
} from 'src/schemas/user-project-progress.schema';
import { Project, ProjectSchema } from 'src/schemas/project.schema';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { PurchasesModule } from '../purchases/purchases.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProjectProgress.name, schema: UserProjectProgressSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
    PurchasesModule,
  ],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
