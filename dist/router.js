"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storiesRouter = void 0;
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const storiesController_1 = require("./controller/storiesController");
const storiesRouter = (0, express_1.Router)();
exports.storiesRouter = storiesRouter;
// Routes for projects
storiesRouter.post('/new', (0, express_async_handler_1.default)((req, res) => (0, storiesController_1.createStory)(req, res)));
