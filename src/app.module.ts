import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SongsModule } from './songs/songs.module';
import { GameDataModule } from './game-data/game-data.module';
import { ChartsModule } from './charts/charts.module';
import { CoursesModule } from './courses/courses.module';
import { GamesModule } from './games/games.module';
import { TagsModule } from './tags/tags.module';
import { SearchModule } from './search/search.module';
import { AuthModule } from './auth/auth.module';
import { CmsModule } from './cms/cms.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [
    PrismaModule,
    SongsModule,
    GameDataModule,
    ChartsModule,
    CoursesModule,
    GamesModule,
    TagsModule,
    SearchModule,
    AuthModule,
    CmsModule,
    FavoritesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
