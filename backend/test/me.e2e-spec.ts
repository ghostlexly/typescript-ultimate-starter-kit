import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

describe('MeController (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // -- put the same configuration as main.ts file here
    app.setGlobalPrefix('api');

    await app.init();

    // -- perform login to get the bearer token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/customer/login')
      .send({
        email: 'cs@dispomenage.fr',
        password: 'Michiamo.7',
      })
      .expect(201);

    token = loginResponse.body.access_token;
  });

  it('/api/me (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/me')
      .set('Authorization', `Bearer ${token}`)
      .send()
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('email');
        expect(res.body).toHaveProperty('role');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
