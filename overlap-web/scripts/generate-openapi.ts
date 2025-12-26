#!/usr/bin/env tsx
/**
 * OpenAPI 스키마 생성 스크립트
 * TypeScript 타입 정의를 기반으로 OpenAPI 3.0 스키마를 생성합니다.
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const openApiSchema = {
  openapi: '3.0.0',
  info: {
    title: 'Overlap API',
    version: '1.0.0',
    description: 'Overlap 모임 일정 조율 API 문서',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: '로컬 개발 서버',
    },
  ],
  paths: {
    '/api/moim': {
      post: {
        summary: '모임 생성',
        tags: ['Moim'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateMoimRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: '모임 생성 성공',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MoimResponse',
                },
              },
            },
          },
          '400': {
            description: '잘못된 요청',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      get: {
        summary: '모임 조회',
        tags: ['Moim'],
        parameters: [
          {
            name: 'id',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid',
            },
            description: '모임 ID',
          },
        ],
        responses: {
          '200': {
            description: '모임 조회 성공',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MoimResponse',
                },
              },
            },
          },
          '400': {
            description: '잘못된 요청',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: '모임을 찾을 수 없음',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/slot': {
      post: {
        summary: '시간 슬롯 생성',
        tags: ['Slot'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateSlotRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: '슬롯 생성 성공',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Slot',
                },
              },
            },
          },
          '400': {
            description: '잘못된 요청',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '500': {
            description: '서버 오류',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      get: {
        summary: '시간 슬롯 조회',
        tags: ['Slot'],
        parameters: [
          {
            name: 'moimId',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'buddyId',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'date',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date' },
          },
        ],
        responses: {
          '200': {
            description: '슬롯 조회 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    slots: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Slot' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        summary: '시간 슬롯 업데이트',
        tags: ['Slot'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateSlotRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: '슬롯 업데이트 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    slots: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Slot' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        summary: '시간 슬롯 삭제',
        tags: ['Slot'],
        parameters: [
          {
            name: 'moimId',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'buddyId',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'date',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date' },
          },
        ],
        responses: {
          '200': {
            description: '슬롯 삭제 성공',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/top-timeslots': {
      get: {
        summary: '추천 시간 슬롯 조회',
        tags: ['Top Timeslots'],
        parameters: [
          {
            name: 'moimId',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'year',
            in: 'query',
            required: true,
            schema: { type: 'integer' },
          },
          {
            name: 'month',
            in: 'query',
            required: true,
            schema: { type: 'integer', minimum: 1, maximum: 12 },
          },
        ],
        responses: {
          '200': {
            description: '추천 시간 슬롯 조회 성공',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TopTimeslotsResponse',
                },
              },
            },
          },
          '400': {
            description: '잘못된 요청',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/unavailable-slots': {
      get: {
        summary: '사용 불가능한 슬롯 조회',
        tags: ['Slot'],
        parameters: [
          {
            name: 'moimId',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'year',
            in: 'query',
            required: true,
            schema: { type: 'integer' },
          },
          {
            name: 'month',
            in: 'query',
            required: true,
            schema: { type: 'integer', minimum: 1, maximum: 12 },
          },
        ],
        responses: {
          '200': {
            description: '사용 불가능한 슬롯 조회 성공',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UnavailableSlotsResponse',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      CreateMoimRequest: {
        type: 'object',
        properties: {
          moim_name: {
            type: 'string',
            nullable: true,
            description: '모임 이름',
          },
        },
      },
      MoimResponse: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: '모임 ID',
          },
          moim_name: {
            type: 'string',
            nullable: true,
            description: '모임 이름',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: '생성일시',
          },
          buddies: {
            type: 'array',
            items: { $ref: '#/components/schemas/Buddy' },
            description: '참여자 목록',
          },
          slots: {
            type: 'array',
            items: { $ref: '#/components/schemas/Slot' },
            description: '시간 슬롯 목록',
          },
        },
      },
      Buddy: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: '참여자 ID' },
          moim: { type: 'string', description: '모임 ID' },
          name: { type: 'string', description: '참여자 이름' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Slot: {
        type: 'object',
        properties: {
          id: { type: 'integer', description: '슬롯 ID' },
          moim: { type: 'string', description: '모임 ID' },
          buddy: { type: 'integer', description: '참여자 ID' },
          date: { type: 'string', format: 'date', description: '날짜 (YYYY-MM-DD)' },
          begin: { type: 'string', nullable: true, description: '시작 시간' },
          end: { type: 'string', nullable: true, description: '종료 시간' },
          pick: { type: 'integer', description: '투표 값 (1: 가능, -1: 불가능)' },
          fix: { type: 'boolean', description: '고정 여부' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateSlotRequest: {
        type: 'object',
        required: ['moimId', 'buddyId', 'date'],
        properties: {
          moimId: { type: 'string', description: '모임 ID' },
          buddyId: { type: 'integer', description: '참여자 ID' },
          date: { type: 'string', format: 'date', description: '날짜 (YYYY-MM-DD)' },
          begin: { type: 'string', nullable: true, description: '시작 시간' },
          end: { type: 'string', nullable: true, description: '종료 시간' },
          pick: { type: 'integer', description: '투표 값 (1: 가능, -1: 불가능, 기본값: 1)' },
        },
      },
      UpdateSlotRequest: {
        type: 'object',
        required: ['moimId', 'date'],
        properties: {
          moimId: { type: 'string', description: '모임 ID' },
          date: { type: 'string', format: 'date', description: '날짜 (YYYY-MM-DD)' },
          buddyId: { type: 'integer', description: '참여자 ID (선택)' },
          fix: { type: 'boolean', description: '고정 여부 (선택)' },
          pick: { type: 'integer', description: '투표 값 (선택)' },
        },
      },
      TopTimeslotsResponse: {
        type: 'object',
        properties: {
          slots: {
            type: 'array',
            items: { $ref: '#/components/schemas/Slot' },
            description: '추천 시간 슬롯 목록',
          },
        },
      },
      UnavailableSlotsResponse: {
        type: 'object',
        properties: {
          dates: {
            type: 'array',
            items: { type: 'string' },
            description: '날짜 키 목록 (YYYY-M-D 형식)',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: '에러 메시지',
          },
        },
      },
    },
  },
};

const outputPath = join(process.cwd(), 'openapi.json');
writeFileSync(outputPath, JSON.stringify(openApiSchema, null, 2), 'utf-8');
console.log(`✅ OpenAPI 스키마가 생성되었습니다: ${outputPath}`);
