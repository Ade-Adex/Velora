  // /app/models/Category.ts
  import { Schema, model, models } from 'mongoose'

  const CategorySchema = new Schema(
    {
      name: { type: String, required: true, unique: true },
      slug: { type: String, required: true, unique: true },
      description: { type: String },
      image: { type: String },
      isFeatured: { type: Boolean, default: false },
    },
    { timestamps: true },
  )

  export const Category = models.Category || model('Category', CategorySchema)
