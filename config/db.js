// config/db.js
// Cria a conexão com o MySQL que o resto da aplicação vai usar.
// Isso fica em um arquivo próprio pra existir UMA conexão só, reaproveitada
// por todos os services — em vez de cada arquivo abrir a sua.

import mysql from 'mysql2/promise'; // versão do mysql2 que trabalha com async/await
import 'dotenv/config';

// Um "pool" é um conjunto de conexões prontas, reaproveitadas entre
// requisições. É melhor que criar uma conexão nova a cada query: abrir
// conexão é uma operação relativamente lenta, e a API pode receber várias
// requisições ao mesmo tempo.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // opcional: se todas as conexões estiverem ocupadas, espera uma liberar
  connectionLimit: 10,      // opcional: no máximo 10 conexões abertas ao mesmo tempo
});

// Exportamos o pool pronto — quem importar esse arquivo já recebe a conexão
// configurada, sem precisar saber os detalhes de host/senha/etc.
export default pool;
