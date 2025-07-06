import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// slug 생성 함수
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// 더미 데이터 생성 함수들
const generateDummyData = async () => {
  console.log('🚀 더미 데이터 생성 시작...');

  // 기존 데이터 확인
  const existingGames = await prisma.game.count();
  const existingDlcs = await prisma.dlc.count();
  const existingComposers = await prisma.composer.count();
  const existingTags = await prisma.tag.count();
  const existingSongs = await prisma.song.count();

  console.log(`📊 기존 데이터:`);
  console.log(`   - 게임: ${existingGames}개`);
  console.log(`   - DLC: ${existingDlcs}개`);
  console.log(`   - 작곡가: ${existingComposers}개`);
  console.log(`   - 태그: ${existingTags}개`);
  console.log(`   - 곡: ${existingSongs}개`);

  // 1. 게임 데이터 생성 (20개)
  const games: any[] = [];
  const gameNames = [
    'Beatmania IIDX',
    'Dance Dance Revolution',
    'GuitarFreaks',
    'DrumMania',
    "Pop'n Music",
    'Jubeat',
    'Reflec Beat',
    'Sound Voltex',
    'Beat Saber',
    'Osu!',
    'Project Diva',
    'Taiko no Tatsujin',
    'Pump It Up',
    'In The Groove',
    'Stepmania',
    'Clone Hero',
    'Friday Night Funkin',
    'Rhythm Doctor',
    'Crypt of the NecroDancer',
    'Thumper',
  ];

  for (let i = 0; i < gameNames.length; i++) {
    // 기존 게임이 있는지 확인
    const existingGame = await prisma.game.findFirst({
      where: { name: gameNames[i] },
    });

    if (existingGame) {
      games.push(existingGame);
      console.log(`✅ 기존 게임 사용: ${existingGame.name}`);
    } else {
      const game = await prisma.game.create({
        data: {
          id: uuidv4().replace(/-/g, '').substring(0, 32),
          name: gameNames[i],
          releaseDate: new Date(2000 + i, 0, 1),
          publisher: `Publisher ${i + 1}`,
        },
      });
      games.push(game);
      console.log(`✅ 게임 생성: ${game.name}`);
    }
  }

  // 2. DLC 데이터 생성 (각 게임당 2-3개씩)
  const dlcs: any[] = [];
  for (const game of games) {
    const dlcCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < dlcCount; i++) {
      const dlcName = `${game.name} DLC ${i + 1}`;

      // 기존 DLC가 있는지 확인
      const existingDlc = await prisma.dlc.findFirst({
        where: { dlcName, gameId: game.id },
      });

      if (existingDlc) {
        dlcs.push(existingDlc);
        console.log(`✅ 기존 DLC 사용: ${existingDlc.dlcName}`);
      } else {
        const dlc = await prisma.dlc.create({
          data: {
            id: uuidv4().replace(/-/g, '').substring(0, 32),
            gameId: game.id,
            dlcName,
            releaseDate: new Date(2020 + i, i % 12, 1),
          },
        });
        dlcs.push(dlc);
        console.log(`✅ DLC 생성: ${dlc.dlcName}`);
      }
    }
  }

  // 3. 작곡가 데이터 생성 (100개)
  const composers: any[] = [];
  const composerNames = [
    'DJ YOSHITAKA',
    'NAOKI',
    'TЁЯRA',
    'Sota Fujimori',
    'Ryu☆',
    'kors k',
    'DJ TOTTO',
    'P*Light',
    'DJ Genki',
    't+pazolite',
    'Cranky',
    'L.E.D.',
    'TaQ',
    'dj TAKA',
    'wac',
    'SLAKE',
    'dj nagureo',
    'Mutsuhiko Izumi',
    'Tatsh',
    'DJ Amuro',
    'Daisuke Kurosawa',
    'dj TAKAWO',
    'Takahiro Uchino',
    'DJ YOSHITAKA',
    'NAOKI',
    'TЁЯRA',
    'Sota Fujimori',
    'Ryu☆',
    'kors k',
    'DJ TOTTO',
    'P*Light',
    'DJ Genki',
    't+pazolite',
    'Cranky',
    'L.E.D.',
    'TaQ',
    'dj TAKA',
    'wac',
    'SLAKE',
    'dj nagureo',
    'Mutsuhiko Izumi',
    'Tatsh',
    'DJ Amuro',
    'Daisuke Kurosawa',
    'dj TAKAWO',
    'Takahiro Uchino',
    'DJ YOSHITAKA',
    'NAOKI',
    'TЁЯRA',
    'Sota Fujimori',
    'Ryu☆',
    'kors k',
    'DJ TOTTO',
    'P*Light',
    'DJ Genki',
    't+pazolite',
    'Cranky',
    'L.E.D.',
    'TaQ',
    'dj TAKA',
    'wac',
    'SLAKE',
    'dj nagureo',
    'Mutsuhiko Izumi',
  ];

  for (let i = 0; i < composerNames.length; i++) {
    // 기존 작곡가가 있는지 확인
    const existingComposer = await prisma.composer.findFirst({
      where: { name: composerNames[i] },
    });

    if (existingComposer) {
      composers.push(existingComposer);
      console.log(`✅ 기존 작곡가 사용: ${existingComposer.name}`);
    } else {
      const composer = await prisma.composer.create({
        data: {
          id: uuidv4().replace(/-/g, '').substring(0, 32),
          name: composerNames[i],
          companyName: `Company ${Math.floor(i / 10) + 1}`,
        },
      });
      composers.push(composer);
      console.log(`✅ 작곡가 생성: ${composer.name}`);
    }
  }

  // 4. 곡 태그 데이터 생성 (50개)
  const songTags: any[] = [];
  const tagNames = [
    'J-POP',
    'K-POP',
    'ROCK',
    'JAZZ',
    'CLASSICAL',
    'ELECTRONIC',
    'HIP-HOP',
    'R&B',
    'FOLK',
    'BLUES',
    'METAL',
    'PUNK',
    'REGGAE',
    'COUNTRY',
    'FUNK',
    'SOUL',
    'DISCO',
    'TECHNO',
    'HOUSE',
    'TRANCE',
    'DUBSTEP',
    'DRUM&BASS',
    'AMBIENT',
    'CHILLOUT',
    'LOUNGE',
    'VOCALOID',
    'UTAU',
    'ANIME',
    'GAME',
    'ORIGINAL',
    'REMIX',
    'COVER',
    'ARRANGE',
    'ORCHESTRA',
    'PIANO',
    'GUITAR',
    'DRUM',
    'BASS',
    'SYNTH',
    'STRINGS',
    'BRASS',
    'WOODWIND',
    'PERCUSSION',
    'ACOUSTIC',
    'ELECTRIC',
    'LIVE',
    'STUDIO',
    'DEMO',
    'BONUS',
    'HIDDEN',
  ];

  for (let i = 0; i < tagNames.length; i++) {
    // 기존 곡 태그가 있는지 확인
    const existingTag = await prisma.songTagItem.findFirst({
      where: { name: tagNames[i] },
    });

    if (existingTag) {
      songTags.push(existingTag);
      console.log(`✅ 기존 곡 태그 사용: ${existingTag.name}`);
    } else {
      const tag = await prisma.songTagItem.create({
        data: {
          id: uuidv4().replace(/-/g, '').substring(0, 32),
          name: tagNames[i],
        },
      });
      songTags.push(tag);
      console.log(`✅ 곡 태그 생성: ${tag.name}`);
    }
  }

  // 5. 곡 데이터 생성 (1000개)
  const songs: any[] = [];
  const songTitles = [
    'VANESSA',
    'MAX 300',
    'PARANOIA',
    'BUTTERFLY',
    'SPEED OVER BEETHOVEN',
    'HYPERSPACE',
    'DESTINY',
    'FREEDOM',
    'ETERNAL',
    'INFINITY',
    'COSMOS',
    'GALAXY',
    'UNIVERSE',
    'DIMENSION',
    'REALITY',
    'FANTASY',
    'DREAM',
    'NIGHTMARE',
    'ILLUSION',
    'MIRAGE',
    'PHANTOM',
    'GHOST',
    'SPIRIT',
    'SOUL',
    'HEART',
    'MIND',
    'BODY',
    'FLESH',
    'BLOOD',
    'BONE',
    'SKIN',
    'HAIR',
    'EYE',
    'EAR',
    'NOSE',
    'MOUTH',
    'TONGUE',
    'TOOTH',
    'NAIL',
    'FINGER',
    'TOE',
    'ARM',
    'LEG',
    'HEAD',
    'NECK',
    'SHOULDER',
    'CHEST',
    'BACK',
    'WAIST',
    'HIP',
    'KNEE',
    'ANKLE',
    'WRIST',
    'ELBOW',
    'THUMB',
    'INDEX',
    'MIDDLE',
    'RING',
    'PINKY',
    'BIG',
    'SECOND',
    'THIRD',
    'FOURTH',
    'FIFTH',
    'SIXTH',
    'SEVENTH',
    'EIGHTH',
    'NINTH',
    'TENTH',
    'ELEVENTH',
    'TWELFTH',
    'THIRTEENTH',
    'FOURTEENTH',
    'FIFTEENTH',
    'SIXTEENTH',
    'SEVENTEENTH',
    'EIGHTEENTH',
    'NINETEENTH',
    'TWENTIETH',
    'TWENTY_FIRST',
    'TWENTY_SECOND',
    'TWENTY_THIRD',
    'TWENTY_FOURTH',
    'TWENTY_FIFTH',
    'TWENTY_SIXTH',
    'TWENTY_SEVENTH',
    'TWENTY_EIGHTH',
    'TWENTY_NINTH',
    'THIRTIETH',
    'THIRTY_FIRST',
    'THIRTY_SECOND',
    'THIRTY_THIRD',
    'THIRTY_FOURTH',
    'THIRTY_FIFTH',
    'THIRTY_SIXTH',
    'THIRTY_SEVENTH',
    'THIRTY_EIGHTH',
    'THIRTY_NINTH',
    'FORTIETH',
    'FORTY_FIRST',
    'FORTY_SECOND',
    'FORTY_THIRD',
    'FORTY_FOURTH',
    'FORTY_FIFTH',
    'FORTY_SIXTH',
    'FORTY_SEVENTH',
    'FORTY_EIGHTH',
    'FORTY_NINTH',
    'FIFTIETH',
    'FIFTY_FIRST',
  ];

  for (let i = 0; i < 1000; i++) {
    const songTitle = `${songTitles[i % songTitles.length]} ${Math.floor(i / songTitles.length) + 1}`;
    const originalTitle = Math.random() > 0.7 ? `Original ${songTitle}` : null;

    // 기존 곡이 있는지 확인
    const existingSong = await prisma.song.findFirst({
      where: { title: songTitle },
    });

    if (existingSong) {
      songs.push(existingSong);
      if (i % 100 === 0) {
        console.log(`✅ 기존 곡 사용: ${existingSong.title} (${i + 1}/1000)`);
      }
    } else {
      const song = await prisma.song.create({
        data: {
          id: uuidv4().replace(/-/g, '').substring(0, 32),
          title: songTitle,
          originalTitle,
        },
      });
      songs.push(song);

      if (i % 100 === 0) {
        console.log(`✅ 곡 생성: ${song.title} (${i + 1}/1000)`);
      }
    }
  }

  // 6. 곡 정보 생성
  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];

    // 기존 곡 정보가 있는지 확인
    const existingSongInfo = await prisma.songInfo.findFirst({
      where: { songId: song.id },
    });

    if (!existingSongInfo) {
      await prisma.songInfo.create({
        data: {
          id: uuidv4().replace(/-/g, '').substring(0, 32),
          songId: song.id,
          bpm: Math.floor(Math.random() * 200) + 60,
          beat: `${Math.floor(Math.random() * 4) + 1}/4`,
          lengthSec: Math.floor(Math.random() * 300) + 60,
        },
      });
    }
  }

  // 7. 곡-작곡가 관계 생성
  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    const composerCount = Math.floor(Math.random() * 3) + 1;
    const selectedComposers = composers
      .sort(() => 0.5 - Math.random())
      .slice(0, composerCount);

    for (const composer of selectedComposers) {
      // 기존 관계가 있는지 확인
      const existingRelation = await prisma.songComposer.findFirst({
        where: { songId: song.id, composerId: composer.id },
      });

      if (!existingRelation) {
        await prisma.songComposer.create({
          data: {
            id: uuidv4().replace(/-/g, '').substring(0, 32),
            songId: song.id,
            composerId: composer.id,
          },
        });
      }
    }
  }

  // 8. 곡-게임 관계 생성
  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    const game = games[Math.floor(Math.random() * games.length)];
    const dlc =
      Math.random() > 0.7
        ? dlcs[Math.floor(Math.random() * dlcs.length)]
        : null;

    // 기존 관계가 있는지 확인
    const existingRelation = await prisma.songGameVersion.findFirst({
      where: { songId: song.id, gameId: game.id },
    });

    if (!existingRelation) {
      await prisma.songGameVersion.create({
        data: {
          id: uuidv4().replace(/-/g, '').substring(0, 32),
          songId: song.id,
          gameId: game.id,
          dlcId: dlc?.id || null,
          inGameTitle: Math.random() > 0.5 ? `In-Game ${song.title}` : null,
          bpmOverride:
            Math.random() > 0.8 ? Math.floor(Math.random() * 200) + 60 : null,
          lengthSec:
            Math.random() > 0.8 ? Math.floor(Math.random() * 300) + 60 : null,
          arrangement:
            Math.random() > 0.7
              ? ['Original', 'Remix', 'Arrange'][Math.floor(Math.random() * 3)]
              : null,
          firstVersion:
            Math.random() > 0.6
              ? `Version ${Math.floor(Math.random() * 10) + 1}`
              : null,
          firstDate: new Date(
            2000 + Math.floor(Math.random() * 24),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1,
          ),
        },
      });
    }
  }

  // 9. 곡-태그 관계 생성
  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    const tagCount = Math.floor(Math.random() * 5) + 1;
    const selectedTags = songTags
      .sort(() => 0.5 - Math.random())
      .slice(0, tagCount);

    for (const tag of selectedTags) {
      // 기존 관계가 있는지 확인
      const existingRelation = await prisma.songTag.findFirst({
        where: { songId: song.id, tagId: tag.id },
      });

      if (!existingRelation) {
        await prisma.songTag.create({
          data: {
            id: uuidv4().replace(/-/g, '').substring(0, 32),
            songId: song.id,
            tagId: tag.id,
          },
        });
      }
    }
  }

  // 10. 차트 데이터 생성
  const difficulties = [
    'BEGINNER',
    'NORMAL',
    'HYPER',
    'ANOTHER',
    'LEGGENDARIA',
  ];
  const chartTypes = ['SINGLE', 'DOUBLE', 'COUPLE', 'BATTLE'];

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    const songGameVersions = await prisma.songGameVersion.findMany({
      where: { songId: song.id },
    });

    for (const sgv of songGameVersions) {
      const chartCount = Math.floor(Math.random() * 3) + 1;
      const selectedDifficulties = difficulties
        .sort(() => 0.5 - Math.random())
        .slice(0, chartCount);

      for (const difficulty of selectedDifficulties) {
        // 기존 차트가 있는지 확인
        const existingChart = await prisma.chart.findFirst({
          where: { sgvId: sgv.id, difficultyName: difficulty },
        });

        if (!existingChart) {
          await prisma.chart.create({
            data: {
              id: uuidv4().replace(/-/g, '').substring(0, 32),
              sgvId: sgv.id,
              difficultyName: difficulty,
              level: Math.floor(Math.random() * 20) + 1,
              noteCount: Math.floor(Math.random() * 1000) + 100,
              chartType:
                chartTypes[Math.floor(Math.random() * chartTypes.length)],
            },
          });
        }
      }
    }
  }

  // 11. 코스 데이터 생성
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    const courseCount = Math.floor(Math.random() * 5) + 2;

    for (let j = 0; j < courseCount; j++) {
      const dlc =
        Math.random() > 0.7
          ? dlcs[Math.floor(Math.random() * dlcs.length)]
          : null;
      const courseName = `${game.name} Course ${j + 1}`;

      // 기존 코스가 있는지 확인
      const existingCourse = await prisma.course.findFirst({
        where: { courseName, gameId: game.id },
      });

      if (!existingCourse) {
        await prisma.course.create({
          data: {
            id: uuidv4().replace(/-/g, '').substring(0, 32),
            gameId: game.id,
            dlcId: dlc?.id || null,
            courseName,
            difficulty: ['BEGINNER', 'NORMAL', 'HYPER', 'ANOTHER'][
              Math.floor(Math.random() * 4)
            ],
          },
        });
      }
    }
  }

  // 12. 코스 엔트리 데이터 생성 (각 코스에 3~5개 차트 랜덤 배정)
  const allCourses = await prisma.course.findMany();
  const allCharts = await prisma.chart.findMany();

  for (const course of allCourses) {
    // 이미 엔트리가 있으면 건너뜀
    const existingEntries = await prisma.courseEntry.findMany({
      where: { courseId: course.id },
    });
    if (existingEntries.length > 0) continue;

    // 3~5개 차트 랜덤 선택 (중복 없이)
    const chartCount = Math.floor(Math.random() * 3) + 3;
    const selectedCharts = allCharts
      .sort(() => 0.5 - Math.random())
      .slice(0, chartCount);
    for (let i = 0; i < selectedCharts.length; i++) {
      await prisma.courseEntry.create({
        data: {
          id: uuidv4().replace(/-/g, '').substring(0, 32),
          courseId: course.id,
          chartId: selectedCharts[i].id,
          position: i + 1,
        },
      });
    }
    console.log(`✅ 코스 엔트리 생성: ${course.courseName} (${chartCount}개)`);
  }

  console.log('🎉 더미 데이터 생성 완료!');

  // 최종 데이터 통계
  const finalGames = await prisma.game.count();
  const finalDlcs = await prisma.dlc.count();
  const finalComposers = await prisma.composer.count();
  const finalTags = await prisma.tag.count();
  const finalSongs = await prisma.song.count();

  console.log(`📊 최종 데이터:`);
  console.log(`   - 게임: ${finalGames}개`);
  console.log(`   - DLC: ${finalDlcs}개`);
  console.log(`   - 작곡가: ${finalComposers}개`);
  console.log(`   - 태그: ${finalTags}개`);
  console.log(`   - 곡: ${finalSongs}개`);
};

// 스크립트 실행
generateDummyData()
  .catch((e) => {
    console.error('❌ 더미 데이터 생성 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
