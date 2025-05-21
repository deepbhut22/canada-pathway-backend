import mongoose from "mongoose";

const TableData = new mongoose.Schema({
    headers: {
        type: [String],
        required: true
    },
    rows: {
        type: [[String]],
        required: true
    },
    caption: {
        type: String,
    }
});

const ImageData = new mongoose.Schema({
    src: {
        type: String,
        required: true
    },
    alt: {
        type: String,
        required: true
    },
    caption: {
        type: String,
    },
    position: {
        type: String,
        enum: ['left', 'center', 'right'],
        default: 'left'
    }
});

const VideoData = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['youtube', 'vimeo', 'mp4'],
        required: true
    },
    caption: {
        type: String,
    }
});

const blogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    author: {
        name: String,
        avatarUrl: String,
    },
    thumbnailUrl: {
        type: String,
        required: true
    },
    excerpt: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    categories: {
        type: [String],
        required: true
    },
    tags: {
        type: [String],
    },
    tableData: {
        type: [TableData],
    },
    imageData: {
        type: [ImageData],
    },
    videoData: {
        type: [VideoData],
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    readingTime: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    publishedAt: {
        type: Date,
    },
    seo: {
        type: Object,
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

export default BlogPost;
