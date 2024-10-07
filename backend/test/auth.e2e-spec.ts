import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

describe('CustomerAuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // -- put the same configuration as main.ts file here
    app.setGlobalPrefix('api');

    await app.init();
  });

  it('/api/auth/customer/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/customer/login')
      .send({
        email: 'cs@dispomenage.fr',
        password: 'Michiamo.7',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
