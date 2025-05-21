import { Request, Response } from 'express';
import BlogPost from '../models/blogModel';

export const createBlogPost = async (req: Request, res: Response) => {
    try {        
        const { title, content, tableData, imageData, videoData, status, readingTime, seo, isFeatured, slug, author, thumbnailUrl, excerpt, categories, tags } = req.body;
        
        const blogPost = new BlogPost({
            title,
            slug,
            author,
            thumbnailUrl,
            excerpt,
            content,
            categories,
            tags,
            tableData,
            imageData,
            videoData,
            status,
            readingTime,
            seo,
            isFeatured
        });
        
        await blogPost.save();
        
        res.status(201).json(blogPost);
    } catch (error) {   
        console.error('Error creating blog post:', error);
        res.status(500).json({ message: 'Failed to create blog post' });
    }
}

export const getBlogPosts = async (req: Request, res: Response) => {
    try {
        const blogPosts = await BlogPost.find({isFeatured: true, status: 'published'});
        res.status(200).json(blogPosts);
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({ message: 'Failed to fetch blog posts' });
    }
}

export const getAllBlogPosts = async (req: Request, res: Response) => {
    try {
        const blogPosts = await BlogPost.find();
        res.status(200).json(blogPosts);
    } catch (error) {
        console.error('Error fetching all blog posts:', error);
        res.status(500).json({ message: 'Failed to fetch all blog posts' });
    }   
}

export const getBlogPostBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const blogPost = await BlogPost.findOne({slug, isFeatured: true, status: 'published'});
        if (!blogPost) {
            return res.status(404).json({ message: 'Blog post not found' });
        }
        res.status(200).json(blogPost);
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).json({ message: 'Failed to fetch blog post' });
    }
}

export const updateBlogPost = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content, tableData, imageData, videoData, status, readingTime, seo, isFeatured, slug, author, thumbnailUrl, excerpt, categories, tags } = req.body;
        
        const blogPost = await BlogPost.findByIdAndUpdate(id, {
            title,
            slug,
            author,
            thumbnailUrl,
            excerpt,
            content,
            categories,
            tags,
            tableData,
            imageData,
            videoData,
            status,
            readingTime,
            seo,
            isFeatured
        }, { new: true });
        
        if (!blogPost) {
            return res.status(404).json({ message: 'Blog post not found' });
        }
        
        res.status(200).json(blogPost);
    } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({ message: 'Failed to update blog post' });
    }
}

export const getRelatedBlogPosts = async (req: Request, res: Response) => {
    try {
        const { category, slug } = req.params;
        const relatedBlogPosts = await BlogPost.find({ categories: { $in: [category] }, isFeatured: true, status: 'published', slug: { $ne: slug } });
        res.status(200).json(relatedBlogPosts.slice(0, 3));
    } catch (error) {
        console.error('Error fetching related blog posts:', error);
        res.status(500).json({ message: 'Failed to fetch related blog posts' });
    }
}
