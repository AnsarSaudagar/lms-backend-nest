import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PurchasesModule } from '../purchases/purchases.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [PurchasesModule, ProgressModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
