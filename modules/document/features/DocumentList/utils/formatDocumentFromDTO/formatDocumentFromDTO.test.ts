import { describe, expect, it } from 'vitest';

import { DocumentStatus } from '#api/dto/document';
import { documentFaker } from '#api/fakers/document';

import { formatDocumentFromDTO } from './formatDocumentFromDTO';

describe('formatDocumentFromDTO', () => {
  it('Форматирует сумму из копеек в рубли', () => {
    const document = documentFaker.makeDocument({
      sum: 123456789,
    });

    const result = formatDocumentFromDTO(document);

    expect(result.sum.replace(/\s/g, ' ')).toBe('1 234 567,89 ₽');
  });

  it('Форматирует дату создания', () => {
    const localDate = new Date(2026, 10, 5, 12);
    const document = documentFaker.makeDocument({
      createdAt: localDate.toISOString(),
    });

    const result = formatDocumentFromDTO(document);

    expect(result.createdAt).toBe('05.11.2026');
  });

  it('Форматирует данные контрагента', () => {
    const document = documentFaker.makeDocument({
      counterparty: {
        id: '1',
        name: 'ООО Ромашка',
        inn: '1234567890',
      },
    });

    const result = formatDocumentFromDTO(document);

    expect(result.counterparty).toBe('ООО Ромашка (1234567890)');
  });

  it('Сохраняет номер и наименование документа', () => {
    const document = documentFaker.makeDocument({
      number: '123',
      name: 'Договор поставки',
    });

    const result = formatDocumentFromDTO(document);

    expect(result.number).toBe('123');
    expect(result.name).toBe('Договор поставки');
  });

  it('Подготавливает название и цвет статуса', () => {
    const document = documentFaker.makeDocument({
      status: DocumentStatus.Signed,
    });

    const result = formatDocumentFromDTO(document);

    expect(result.statusLabel).toBe('Подписан');
    expect(result.statusColor).toBe('success');
  });
});
