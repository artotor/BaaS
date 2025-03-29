"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acmePlugin = void 0;
const postgraphile_1 = require("postgraphile");
exports.acmePlugin = (0, postgraphile_1.makeExtendSchemaPlugin)(() => ({
    typeDefs: (0, postgraphile_1.gql) `
    extend schema {
      description: String @description(text: "API de ACME - Tu Backend como Servicio")
    }
  `,
}));
//# sourceMappingURL=acme.plugin.js.map