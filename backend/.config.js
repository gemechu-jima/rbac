import { Client } from 'pg';
export const client = new Client({
   user: 'postgres',
   host: 'localhost',
   database: 'rbac_db',
   password: '1234',
   port: 5432, 
});
client.connect()
   .then(() => console.log('Connected to PostgreSQL'))
   .catch(err => console.error('Connection error', err.stack));