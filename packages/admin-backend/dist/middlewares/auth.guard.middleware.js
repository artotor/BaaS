"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuardMiddleware = void 0;
const common_1 = require("@nestjs/common");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
let AuthGuardMiddleware = class AuthGuardMiddleware {
    use(req, res, next) {
        var _a;
        const authHeader = req.headers.authorization;
        const token = (authHeader && authHeader.split(' ')[1]) || ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token);
        if (!token) {
            return res.redirect('/login');
        }
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            next();
        }
        catch (err) {
            return res.redirect('/login');
        }
    }
};
exports.AuthGuardMiddleware = AuthGuardMiddleware;
exports.AuthGuardMiddleware = AuthGuardMiddleware = __decorate([
    (0, common_1.Injectable)()
], AuthGuardMiddleware);
//# sourceMappingURL=auth.guard.middleware.js.map