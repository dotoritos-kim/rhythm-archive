import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateChartDto,
  UpdateChartDto,
  ChartResponseDto,
} from '../dto/chart.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChartsService {
  constructor(private prisma: PrismaService) {}

  async create(createChartDto: CreateChartDto): Promise<ChartResponseDto> {
    try {
      const chart = await this.prisma.chart.create({
        data: {
          id: uuidv4().replace(/-/g, ''),
          sgvId: createChartDto.sgvId,
          difficultyName: createChartDto.difficultyName,
          level: createChartDto.level,
          noteCount: createChartDto.noteCount,
          chartType: createChartDto.chartType,
          extra: createChartDto.extra,
        },
      });

      return this.mapToResponseDto(chart);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Chart with this sgvId and difficultyName already exists',
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<ChartResponseDto[]> {
    const charts = await this.prisma.chart.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        level: 'asc',
      },
    });

    return charts.map((chart) => this.mapToResponseDto(chart));
  }

  async findOne(id: string): Promise<ChartResponseDto> {
    const chart = await this.prisma.chart.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!chart) {
      throw new NotFoundException(`Chart with ID ${id} not found`);
    }

    return this.mapToResponseDto(chart);
  }

  async findBySgvId(sgvId: string): Promise<ChartResponseDto[]> {
    const charts = await this.prisma.chart.findMany({
      where: {
        sgvId: sgvId,
        deletedAt: null,
      },
      orderBy: {
        level: 'asc',
      },
    });

    return charts.map((chart) => this.mapToResponseDto(chart));
  }

  async update(
    id: string,
    updateChartDto: UpdateChartDto,
  ): Promise<ChartResponseDto> {
    try {
      const chart = await this.prisma.chart.update({
        where: {
          id: id,
        },
        data: {
          sgvId: updateChartDto.sgvId,
          difficultyName: updateChartDto.difficultyName,
          level: updateChartDto.level,
          noteCount: updateChartDto.noteCount,
          chartType: updateChartDto.chartType,
          extra: updateChartDto.extra,
        },
      });

      return this.mapToResponseDto(chart);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Chart with ID ${id} not found`);
      }
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Chart with this sgvId and difficultyName already exists',
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.chart.update({
        where: {
          id: id,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Chart with ID ${id} not found`);
      }
      throw error;
    }
  }

  async search(query: string): Promise<ChartResponseDto[]> {
    const charts = await this.prisma.chart.findMany({
      where: {
        OR: [
          {
            difficultyName: {
              contains: query,
            },
          },
          {
            chartType: {
              contains: query,
            },
          },
        ],
        deletedAt: null,
      },
      orderBy: {
        level: 'asc',
      },
    });

    return charts.map((chart) => this.mapToResponseDto(chart));
  }

  private mapToResponseDto(chart: any): ChartResponseDto {
    return {
      id: chart.id,
      sgvId: chart.sgvId,
      difficultyName: chart.difficultyName,
      level: chart.level,
      noteCount: chart.noteCount,
      chartType: chart.chartType,
      extra: chart.extra,
      createdAt: chart.createdAt,
      updatedAt: chart.updatedAt,
      deletedAt: chart.deletedAt,
    };
  }
}
