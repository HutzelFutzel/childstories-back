import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { createStory } from './controller/storiesController';


const storiesRouter = Router();

// Routes for projects
storiesRouter.post('/new', asyncHandler((req, res) => createStory(req, res)));


export { storiesRouter };
