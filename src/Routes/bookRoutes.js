import express from 'express';
import cloudinary from "../lib/cloudinary.js"; // Assuming you have a cloudinary setup file
import Book from "../models/book.js"; // Assuming you have a Book model defined
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
    try {
        const { title, caption, image, rating, user } = req.body;
        if (!title || !caption || !image || !rating || !user) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }

        //upload image to cloudinary or any other service here
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;

        //save book to db

        const newBook = new Book ({
            title,
            caption,
            image: imageUrl,
            rating,
            user: req.user._id // Use the authenticated user's ID
        });

        await newBook.save();
        return res.status(201).json(newBook);

    } catch (error) {
        console.log("Error creating book:", error);
        return res.status(500).json({ error: error.message });
    }
});

//pagination => infinite loading
router.get("/", protectRoute, async (req, res) => {
    //example call from react native -frontend
    // const response = await fetch(`http://your-api-url/books?page=${page}&limit=${limit}`);

    try {
        const page = req.query.page || 1; // Get page number from query, default to 1
        const limit = req.query.limit || 5; // Number of items per page
        const skip = (page - 1) * limit; // Calculate the number of items to skip

        const books = await Book.find()
            .sort({ createdAt: -1 }) // descending order by creation date
            .skip(skip) // skip the first 'skip' number of documents
            .limit(limit) // Limit the number of documents returned
            .populate('user', 'username profileImage'); // Populate user details

            const totalBooks = await Book.countDocuments(); // Get total number of books

        return res.send({
            books,
            totalBooks,
            currentPage: page,
            totalPages: Math.ceil(totalBooks / limit) // Calculate total pages
        });
    
    } catch (error) {
        console.log("Error in getting all books routes:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.find({user: req.user._id}).sort({createdAt: -1});
        res.json({ Book : book });

    
    } catch (error) {
        console.log(" Error in getting book by id:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
    
    // check if user is the creator of the book
    if (book.user.toString() !== req.user.id.toString) {
        return res.status(403).json({ message: "You are not authorized to delete this book" });
    }

    //https://res.cloudinary.com/demo/image/upload/v1611234567/sample.jpg

    // delete image from cloudinary
        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split('/').pop().split('.')[0]; // Extract public ID from URL
                await cloudinary.uploader.destroy(publicId);

            } catch (deleteError) {
                console.log("Error deleting image from cloudinary:", deleteError);
                return res.status(500).json({ message: "Error deleting image" });   
            }
        } 

    await Book.deleteOne();
        res.json({ message: "Book deleted successfully" });

    } catch (error) {
        console.log("Error deleting book:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;