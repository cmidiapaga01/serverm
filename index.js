const express = require('express');
const { google } = require('googleapis');
const analyticsData = google.analyticsdata('v1beta');
const cors = require('cors'); // Importe o cors
const app = express();

// Autenticação com Conta de Serviço
// const key = require('./service-account-key.json'); // Caminho para o arquivo de credenciais
// const scopes = 'https://www.googleapis.com/auth/analytics.readonly';

// Carrega as credenciais do JSON diretamente da variável de ambiente
const key = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
const scopes = 'https://www.googleapis.com/auth/analytics.readonly';
const jwt = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  scopes
);

// Usa a variável de ambiente GA_PROPERTY_ID para a propriedade do Google Analytics
const propertyId = process.env.GA_PROPERTY_ID;

app.use(cors());

app.get('/api/getAnalyticsData', async (req, res) => {
  try {
    console.log('Tentando autorizar JWT...');
    await jwt.authorize();
    console.log('Autorizado com sucesso.');

    const response = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`, // Substitui diretamente pelo ID da propriedade
      requestBody: {
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }],
        dimensions: [
          { name: 'city' },
          { name: 'deviceCategory' },
        ],
      },
      auth: jwt,
    });

    console.log('Dados recebidos da API:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar dados do Google Analytics:', error);
    res.status(500).json({ error: 'Falha ao buscar dados do Google Analytics' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT || 3000}`);
});
