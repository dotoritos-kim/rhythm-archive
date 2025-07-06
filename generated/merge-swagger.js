// 병합 스크립트: 자동 생성본(generated/swagger-auto.json)과 커스텀본(generated/swagger.json)을 병합하여 최종 swagger.json을 만듭니다.
const fs = require('fs');
const path = require('path');

const autoPath = path.join(__dirname, 'swagger-auto.json');
const customPath = path.join(__dirname, 'swagger.json');
const outputPath = path.join(__dirname, 'swagger-merged.json');

const auto = JSON.parse(fs.readFileSync(autoPath, 'utf-8'));
const custom = JSON.parse(fs.readFileSync(customPath, 'utf-8'));

// info, servers 등은 커스텀 파일 우선
const merged = {
  ...auto,
  ...custom,
  info: { ...auto.info, ...custom.info },
  servers: custom.servers || auto.servers,
  paths: { ...auto.paths, ...custom.paths },
  components: { ...auto.components, ...custom.components },
};

fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
console.log('swagger-merged.json 파일이 생성되었습니다.');
