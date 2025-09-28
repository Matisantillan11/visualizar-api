import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { type Institution, Prisma, Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { InstitutionsService } from './institutions.service';

@Controller('/api/institutions')
@ApiTags('Institutions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class InstitutionsController {
  constructor(private readonly institutionService: InstitutionsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.INSTITUTION)
  @ApiOperation({ summary: 'Get all institutions' })
  @ApiResponse({ status: 200, description: 'Get all institutions' })
  getInstitutions(): Promise<Institution[]> {
    return this.institutionService.getInstitutions();
  }

  @Get('/:id')
  @Roles(Role.ADMIN, Role.TEACHER, Role.INSTITUTION, Role.STUDENT)
  @ApiOperation({ summary: 'Get a institution by id' })
  @ApiResponse({ status: 200, description: 'Get a institution by id' })
  getUser(@Param('id') id: string): Promise<Institution | null> {
    return this.institutionService.getInstitution({ id });
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a institution' })
  @ApiResponse({ status: 201, description: 'Create a institution' })
  createInstitution(
    @Body() institution: Prisma.InstitutionCreateInput,
  ): Promise<Institution> {
    return this.institutionService.createInstitution(institution);
  }

  @Put('/:id')
  @Roles(Role.ADMIN, Role.INSTITUTION)
  @ApiOperation({ summary: 'Update a institution' })
  @ApiResponse({ status: 200, description: 'Update a institution' })
  updateInstitution(
    @Param('id') id: string,
    @Body() institution: Prisma.InstitutionUpdateInput,
  ): Promise<Institution> {
    return this.institutionService.updateInstitution({
      where: { id },
      data: institution,
    });
  }

  @Delete('/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a institution' })
  @ApiResponse({ status: 200, description: 'Delete a institution' })
  deleteInstitution(@Param('id') id: string): Promise<Institution> {
    return this.institutionService.deleteInstitution({ id });
  }
}
