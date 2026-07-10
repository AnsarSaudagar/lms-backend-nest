import { Injectable } from '@nestjs/common';
import { UserProjectService } from '../purchases/user-project.service';
import { ProgressService } from '../progress/progress.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly userProjectService: UserProjectService,
    private readonly progressService: ProgressService,
  ) {}

  async getSummary(userId: string) {
    const [projects, progress] = await Promise.all([
      this.userProjectService.listMyProjects(userId),
      this.progressService.getAllForUser(userId),
    ]);

    return {
      totalEnrolled: projects.length,
      completedProjects: progress.filter((p) => p.isCompleted).length,
      inProgressProjects: progress.filter(
        (p) => !p.isCompleted && p.completedSteps.length > 0,
      ).length,
      totalStepsCompleted: progress.reduce(
        (sum, p) => sum + p.completedSteps.length,
        0,
      ),
    };
  }
}
