import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PaymentsService } from './payments.service';
import { UserProjectService } from './user-project.service';
import { ConfirmPaymentDto } from './dtos/confirm-payment.dto';

@ApiTags('Purchases')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller()
export class PurchasesController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly userProjectService: UserProjectService,
  ) {}

  @Post('projects/:projectId/purchase')
  @ApiOperation({ summary: 'Create a payment order for a paid project' })
  @ApiParam({ name: 'projectId', description: 'MongoDB ObjectId of the project' })
  @ApiResponse({ status: 201, description: 'Order created. Returns { orderId, amount, currency }.' })
  @ApiResponse({ status: 400, description: 'Project is free — use the enroll endpoint.' })
  @ApiResponse({ status: 409, description: 'You already own this project.' })
  purchase(
    @CurrentUser('userId') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.paymentsService.createOrder(userId, projectId);
  }

  @Post('payments/confirm')
  @ApiOperation({ summary: 'Confirm a payment and unlock the project' })
  @ApiResponse({ status: 201, description: 'Payment confirmed and access granted.' })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  confirm(
    @CurrentUser('userId') userId: string,
    @Body() dto: ConfirmPaymentDto,
  ) {
    return this.paymentsService.confirmPayment(userId, dto.orderId);
  }

  @Post('projects/:projectId/enroll')
  @ApiOperation({ summary: 'Enroll in a free project' })
  @ApiParam({ name: 'projectId', description: 'MongoDB ObjectId of the project' })
  @ApiResponse({ status: 201, description: 'Enrolled. Access granted immediately.' })
  @ApiResponse({ status: 400, description: 'Project is paid — purchase it instead.' })
  @ApiResponse({ status: 409, description: 'Already enrolled.' })
  enroll(
    @CurrentUser('userId') userId: string,
    @Param('projectId') projectId: string,
  ) {
    return this.userProjectService.enrollFree(userId, projectId);
  }

  @Get('me/projects')
  @ApiOperation({ summary: 'List projects the current user has access to' })
  @ApiResponse({ status: 200, description: 'Array of the user’s enrollments with project summaries.' })
  myProjects(@CurrentUser('userId') userId: string) {
    return this.userProjectService.listMyProjects(userId);
  }

  @Get('me/payments')
  @ApiOperation({ summary: 'List the current user’s payment history' })
  @ApiResponse({ status: 200, description: 'Array of payment records.' })
  myPayments(@CurrentUser('userId') userId: string) {
    return this.paymentsService.listMyPayments(userId);
  }
}
