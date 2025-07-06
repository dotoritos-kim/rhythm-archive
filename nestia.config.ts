export default {
  input: {
    include: ['src/**/*.controller.ts'],
    exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
  },
  output: 'generated',
  swagger: {
    output: 'generated/swagger-auto.json',
    security: {
      bearer: {
        type: 'http',
        scheme: 'bearer',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '개발 서버',
      },
    ],
    info: {
      title: 'Rhythm Archive API',
      description: '리듬게임 아카이브 API 문서',
      version: '1.0.0',
      contact: {
        name: 'Rhythm Archive Team',
        email: 'support@rhythm-archive.com',
      },
    },
  },
  sdk: {
    output: 'generated/sdk',
    name: 'rhythm-archive-sdk',
    version: '1.0.0',
  },
};
