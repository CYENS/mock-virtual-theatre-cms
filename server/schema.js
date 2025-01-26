import { gql } from 'graphql-tag';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM-friendly equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.resolve(__dirname, 'schema.gql');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

export const typeDefs = gql`
    ${schemaContent}
`;
