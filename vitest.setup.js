import { beforeEach } from 'vitest';

import { faker } from './api/services/Faker';
import { randomInteger } from './shared/utils/randomInteger';

beforeEach((p) => {
  const fakerSeed = randomInteger(0, 10000);

  faker.seed(fakerSeed);

  p.onTestFailed(() => {
    console.log(
      `Logs for task: "${p.task.name}"`,
      `Данные были сгенерированы с помощью FakerSeed: ${fakerSeed}. FakerSeed позволит вам повторить сгенерированные данные для локального воспроизведения.`,
      'Инструкция: https://industrious-search-cdf.notion.site/1be275dd6c2147409ef399331f7269ba#1fb4efe027e84fad90ee485b6206e058',
    );
  });
});
