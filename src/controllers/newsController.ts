import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import News from '../models/newsModel';
import { AppError } from '../middleware/errorMiddleware';

// @desc    Get all news
// @route   GET /api/news
// @access  Public
export const getNews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const type = req.query.type as string;

    // Build query
    const query: any = {};
    if (type) {
      query.type = type;
    }

    // Get total count for pagination
    const total = await News.countDocuments(query);

    // Get news with pagination and sorting
    const news = await News.find(query)
      .sort({ date: -1 })
      .limit(limit)
      .skip(startIndex);

    res.json({
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single news by ID
// @route   GET /api/news/:id
// @access  Public
export const getNewsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return next(new AppError('News not found', 404));
    }

    res.json(news);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new news
// @route   POST /api/news
// @access  Private/Admin
export const createNews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation error', 400, errors.array()));
    }

    const { title, description, date, type, readMoreLink, imageUrl, source } =
      req.body;

    const news = await News.create({
      title,
      description,
      date: date || new Date(),
      type,
      readMoreLink,
      imageUrl,
      source,
    });

    res.status(201).json(news);
  } catch (error) {
    next(error);
  }
};

// @desc    Update news
// @route   PUT /api/news/:id
// @access  Private/Admin
export const updateNews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation error', 400, errors.array()));
    }

    const news = await News.findById(req.params.id);

    if (!news) {
      return next(new AppError('News not found', 404));
    }

    const updatedNews = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedNews);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Private/Admin
export const deleteNews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return next(new AppError('News not found', 404));
    }

    await news.deleteOne();
    res.json({ message: 'News removed' });
  } catch (error) {
    next(error);
  }
};