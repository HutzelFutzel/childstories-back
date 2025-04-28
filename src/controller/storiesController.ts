import { Request, Response } from 'express';


export const createStory = async (req: Request, res: Response) => {
    try {
        res.status(200).json({ message: 'Story created' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: (error as Error).message });
    }
}