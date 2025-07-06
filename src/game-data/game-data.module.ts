import { Module } from '@nestjs/common';
import { GameDataController } from './game-data.controller';
import { GameDataService } from './game-data.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GameDataController],
  providers: [GameDataService],
  exports: [GameDataService],
})
export class GameDataModule {}
