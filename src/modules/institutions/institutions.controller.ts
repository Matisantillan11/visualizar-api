import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InstitutionsService } from './institutions.service';
import { Institution, Prisma } from '@prisma/client';

@Controller('/api/institutions')
@ApiTags('Institutions')
export class InstitutionsController {
  constructor(private readonly institutionService: InstitutionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all institutions' })
  @ApiResponse({ status: 200, description: 'Get all institutions' })
  getInstitutions(): Promise<Institution[]> {
    return this.institutionService.getInstitutions();
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a institution by id' })
  @ApiResponse({ status: 200, description: 'Get a institution by id' })
  getUser(@Param('id') id: string): Promise<Institution | null> {
    return this.institutionService.getInstitution({ id });
  }

  @Post()
  @ApiOperation({ summary: 'Create a institution' })
  @ApiResponse({ status: 201, description: 'Create a institution' })
  createInstitution(
    @Body() institution: Prisma.InstitutionCreateInput,
  ): Promise<Institution> {
    return this.institutionService.createInstitution(institution);
  }

  @Put('/:id')
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
  @ApiOperation({ summary: 'Delete a institution' })
  @ApiResponse({ status: 200, description: 'Delete a institution' })
  deleteInstitution(@Param('id') id: string): Promise<Institution> {
    return this.institutionService.deleteInstitution({ id });
  }
}
