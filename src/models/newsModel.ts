import mongoose, { Schema, Document } from 'mongoose';

export interface INews extends Document {
  title: string;
  description: string;
  date: Date;
  type: string;
  readMoreLink: string;
  imageUrl: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    date: {
      type: Date,
      required: [true, 'Please add a date'],
      default: Date.now,
    },
    type: {
      type: String,
      required: [true, 'Please add a news type'],
      enum: ['Immigration', 'Policy', 'Legal', 'General', 'Other'],
    },
    readMoreLink: {
      type: String,
      required: [true, 'Please add a read more link'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Please add an image URL'],
    },
    source: {
      type: String,
      required: [true, 'Please add a source'],
    },
  },
  {
    timestamps: true,
  }
);

// Add index for efficient querying by type and date
NewsSchema.index({ type: 1, date: -1 });

const News = mongoose.model<INews>('News', NewsSchema);

export default News;