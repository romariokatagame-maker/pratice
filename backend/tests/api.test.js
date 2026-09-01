const request = require('supertest');
const createApp = require('../src/app');
const store = require('../src/data/store');

const fakeIo = { to: () => ({ emit: () => {} }) };
const app = createApp(fakeIo);

const warga = { name: 'Joni Warga', email: 'joni@timika.id', password: 'rahasia123', role: 'warga' };
const polisi = { name: 'Bripka Ana', email: 'ana@polri.id', password: 'rahasia123', role: 'polisi' };

const validReport = {
  crimeType: 'jambret',
  description: 'Tas merah dijambret di depan mall',
  latitude: -4.5427,
  longitude: 136.8867,
};

async function registerAndLogin(user) {
  const res = await request(app).post('/api/auth/register').send(user);
  return res.body.token;
}

beforeEach(() => {
  store.reset();
});

describe('auth', () => {
  it('menolak password pendek', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...warga, password: 'abc' });
    expect(res.status).toBe(400);
  });

  it('menolak email ganda', async () => {
    await request(app).post('/api/auth/register').send(warga);
    const res = await request(app).post('/api/auth/register').send(warga);
    expect(res.status).toBe(409);
  });

  it('login dengan kredensial benar', async () => {
    await request(app).post('/api/auth/register').send(warga);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: warga.email, password: warga.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});

describe('reports', () => {
  it('menolak laporan tanpa token', async () => {
    const res = await request(app).post('/api/reports').send(validReport);
    expect(res.status).toBe(401);
  });

  it('menolak tipe kejahatan tidak valid', async () => {
    const token = await registerAndLogin(warga);
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validReport, crimeType: 'ngebut' });
    expect(res.status).toBe(400);
  });

  it('membuat laporan dan hanya menampilkan milik sendiri untuk warga', async () => {
    const tokenA = await registerAndLogin(warga);
    const tokenB = await registerAndLogin({ ...warga, email: 'lain@timika.id' });

    const created = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${tokenA}`)
      .send(validReport);
    expect(created.status).toBe(201);

    const mine = await request(app).get('/api/reports').set('Authorization', `Bearer ${tokenA}`);
    expect(mine.body).toHaveLength(1);

    const others = await request(app).get('/api/reports').set('Authorization', `Bearer ${tokenB}`);
    expect(others.body).toHaveLength(0);
  });

  it('polisi melihat semua laporan dan bisa membalas', async () => {
    const tokenWarga = await registerAndLogin(warga);
    const tokenPolisi = await registerAndLogin(polisi);

    const created = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${tokenWarga}`)
      .send(validReport);

    const all = await request(app).get('/api/reports').set('Authorization', `Bearer ${tokenPolisi}`);
    expect(all.body).toHaveLength(1);

    const responded = await request(app)
      .put(`/api/reports/${created.body.reportId}/respond`)
      .set('Authorization', `Bearer ${tokenPolisi}`)
      .send({ message: 'Tim sedang menuju lokasi' });
    expect(responded.status).toBe(200);
    expect(responded.body.report.status).toBe('confirmed');
    expect(responded.body.report.policeReply.message).toBe('Tim sedang menuju lokasi');
  });

  it('warga tidak boleh membalas laporan', async () => {
    const tokenWarga = await registerAndLogin(warga);
    const created = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${tokenWarga}`)
      .send(validReport);

    const res = await request(app)
      .put(`/api/reports/${created.body.reportId}/respond`)
      .set('Authorization', `Bearer ${tokenWarga}`)
      .send({ message: 'Saya polisi kok' });
    expect(res.status).toBe(403);
  });
});
