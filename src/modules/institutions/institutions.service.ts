import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma, type Institution } from '@prisma/client';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';

@Injectable()
export class InstitutionsService {
  constructor(private prisma: PrismaService) {}

  async getInstitution(
    institutionWhereUniqueInput: Prisma.InstitutionWhereUniqueInput,
  ): Promise<Institution | null> {
    return this.prisma.institution.findUnique({
      where: {
        ...institutionWhereUniqueInput,
        deletedAt: null,
      },
    });
  }

  async getInstitutions(): Promise<Institution[]> {
    return this.prisma.institution.findMany({
      where: {
        deletedAt: null,
      },
    });
  }

  async createInstitution(
    data: Prisma.InstitutionCreateInput,
  ): Promise<Institution> {
    return this.prisma.institution.create({
      data,
    });
  }

  async updateInstitution(params: {
    where: Prisma.InstitutionWhereUniqueInput;
    data: Prisma.InstitutionUpdateInput;
  }): Promise<Institution> {
    const { where, data } = params;
    return this.prisma.institution.update({
      data,
      where,
    });
  }

  async deleteInstitution(
    where: Prisma.InstitutionWhereUniqueInput,
  ): Promise<Institution> {
    const institutionId = where.id;

    const getCourseOfInstitution = await this.prisma.institutionCourse.findMany(
      {
        where: {
          institutionId,
        },
      },
    );

    if (getCourseOfInstitution.length > 0) {
      throw new InternalServerErrorException(
        'Institution has assigned courses',
      );
    }

    return this.prisma.institution.update({
      where,
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
