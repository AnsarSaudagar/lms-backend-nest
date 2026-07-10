import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from 'src/modules/projects/schemas/project.schema';
import { UserProject, UserProjectSchema } from 'src/modules/purchases/schemas/user-project.schema';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { AdminProjectsController } from './admin-projects.controller';
import { StepsService } from './steps/steps.service';
import { StepsController } from './steps/steps.controller';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: UserProject.name, schema: UserProjectSchema },
    ]),
    forwardRef(() => ProgressModule),
  ],
  controllers: [ProjectsController, AdminProjectsController, StepsController],
  providers: [ProjectsService, StepsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
