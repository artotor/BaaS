import { makeExtendSchemaPlugin, gql } from 'postgraphile';

export const acmePlugin = makeExtendSchemaPlugin(() => ({
  typeDefs: gql`
    extend schema {
      description: String @description(text: "API de ACME - Tu Backend como Servicio")
    }
  `,
}));
