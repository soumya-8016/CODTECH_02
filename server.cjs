const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3001;
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
let books = [
  {
    id: 1,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0-06-112008-4",
    genre: "Fiction",
    publishedYear: 1960,
    available: true,
    borrowedBy: null,
    borrowedDate: null
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    isbn: "978-0-452-28423-4",
    genre: "Dystopian Fiction",
    publishedYear: 1949,
    available: false,
    borrowedBy: 1,
    borrowedDate: "2024-01-15"
  },
  {
    id: 3,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0-7432-7356-5",
    genre: "Classic Literature",
    publishedYear: 1925,
    available: true,
    borrowedBy: null,
    borrowedDate: null
  }
];
let authors = [
  {
    id: 1,
    name: "Harper Lee",
    biography: "American novelist known for To Kill a Mockingbird",
    birthYear: 1926,
    nationality: "American"
  },
  {
    id: 2,
    name: "George Orwell",
    biography: "English novelist and journalist known for dystopian fiction",
    birthYear: 1903,
    nationality: "British"
  },
  {
    id: 3,
    name: "F. Scott Fitzgerald",
    biography: "American novelist of the Lost Generation",
    birthYear: 1896,
    nationality: "American"
  }
];
let borrowers = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    membershipDate: "2023-06-15",
    activeLoans: 1
  },
  {
    id: 2,
    name: "Jane Doe",
    email: "jane.doe@email.com",
    membershipDate: "2023-08-20",
    activeLoans: 0
  }
];
const findById = (array, id) => array.find(item => item.id === parseInt(id));
const findIndexById = (array, id) => array.findIndex(item => item.id === parseInt(id));
const getNextId = (array) => Math.max(...array.map(item => item.id), 0) + 1;
const asyncHandler = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
const validateBook = (book) => {
  const errors = [];
  if (!book.title) errors.push('Title is required');
  if (!book.author) errors.push('Author is required');
  if (!book.isbn) errors.push('ISBN is required');
  return errors;
};
const validateAuthor = (author) => {
  const errors = [];
  if (!author.name) errors.push('Name is required');
  return errors;
};
const validateBorrower = (borrower) => {
  const errors = [];
  if (!borrower.name) errors.push('Name is required');
  if (!borrower.email) errors.push('Email is required');
  return errors;
};
app.get('/api/books', asyncHandler(async (req, res) => {
  const { available, genre, author } = req.query;
  let filteredBooks = [...books];
  if (available !== undefined) {
    filteredBooks = filteredBooks.filter(book => book.available === (available === 'true'));
  }
  if (genre) {
    filteredBooks = filteredBooks.filter(book => 
      book.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }
  if (author) {
    filteredBooks = filteredBooks.filter(book => 
      book.author.toLowerCase().includes(author.toLowerCase())
    );
  }
  res.json({
    success: true,
    count: filteredBooks.length,
    data: filteredBooks
  });
}));
app.get('/api/books/:id', asyncHandler(async (req, res) => {
  const book = findById(books, req.params.id);
  
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }
  res.json({
    success: true,
    data: book
  });
}));
app.post('/api/books', asyncHandler(async (req, res) => {
  const errors = validateBook(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }
  const newBook = {
    id: getNextId(books),
    title: req.body.title,
    author: req.body.author,
    isbn: req.body.isbn,
    genre: req.body.genre || 'Unknown',
    publishedYear: req.body.publishedYear || null,
    available: req.body.available !== undefined ? req.body.available : true,
    borrowedBy: null,
    borrowedDate: null
  };
  books.push(newBook);
  res.status(201).json({
    success: true,
    message: 'Book created successfully',
    data: newBook
  });
}));
app.put('/api/books/:id', asyncHandler(async (req, res) => {
  const bookIndex = findIndexById(books, req.params.id);
  if (bookIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }
  const errors = validateBook(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }
  const updatedBook = {
    ...books[bookIndex],
    ...req.body,
    id: books[bookIndex].id 
  };
  books[bookIndex] = updatedBook;
  res.json({
    success: true,
    message: 'Book updated successfully',
    data: updatedBook
  });
}));
app.delete('/api/books/:id', asyncHandler(async (req, res) => {
  const bookIndex = findIndexById(books, req.params.id);
  
  if (bookIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }
  books.splice(bookIndex, 1);

  res.json({
    success: true,
    message: 'Book deleted successfully'
  });
}));
app.get('/api/authors', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    count: authors.length,
    data: authors
  });
}));
app.get('/api/authors/:id', asyncHandler(async (req, res) => {
  const author = findById(authors, req.params.id);
  if (!author) {
    return res.status(404).json({
      success: false,
      message: 'Author not found'
    });
  }
  const authorBooks = books.filter(book => 
    book.author.toLowerCase() === author.name.toLowerCase()
  );
  res.json({
    success: true,
    data: {
      ...author,
      books: authorBooks
    }
  });
}));
app.post('/api/authors', asyncHandler(async (req, res) => {
  const errors = validateAuthor(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }
  const newAuthor = {
    id: getNextId(authors),
    name: req.body.name,
    biography: req.body.biography || '',
    birthYear: req.body.birthYear || null,
    nationality: req.body.nationality || ''
  };
  authors.push(newAuthor);
  res.status(201).json({
    success: true,
    message: 'Author created successfully',
    data: newAuthor
  });
}));
app.put('/api/authors/:id', asyncHandler(async (req, res) => {
  const authorIndex = findIndexById(authors, req.params.id);
  if (authorIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Author not found'
    });
  }
  const errors = validateAuthor(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }
  const updatedAuthor = {
    ...authors[authorIndex],
    ...req.body,
    id: authors[authorIndex].id
  };
  authors[authorIndex] = updatedAuthor;
  res.json({
    success: true,
    message: 'Author updated successfully',
    data: updatedAuthor
  });
}));
app.delete('/api/authors/:id', asyncHandler(async (req, res) => {
  const authorIndex = findIndexById(authors, req.params.id);
  if (authorIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Author not found'
    });
  }
  authors.splice(authorIndex, 1);
  res.json({
    success: true,
    message: 'Author deleted successfully'
  });
}));
app.get('/api/borrowers', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    count: borrowers.length,
    data: borrowers
  });
}));
app.get('/api/borrowers/:id', asyncHandler(async (req, res) => {
  const borrower = findById(borrowers, req.params.id);
  if (!borrower) {
    return res.status(404).json({
      success: false,
      message: 'Borrower not found'
    });
  }
  const borrowedBooks = books.filter(book => book.borrowedBy === borrower.id);
  res.json({
    success: true,
    data: {
      ...borrower,
      borrowedBooks
    }
  });
}));
app.post('/api/borrowers', asyncHandler(async (req, res) => {
  const errors = validateBorrower(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }
  const newBorrower = {
    id: getNextId(borrowers),
    name: req.body.name,
    email: req.body.email,
    membershipDate: req.body.membershipDate || new Date().toISOString().split('T')[0],
    activeLoans: 0
  };
  borrowers.push(newBorrower);
  res.status(201).json({
    success: true,
    message: 'Borrower created successfully',
    data: newBorrower
  });
}));
app.put('/api/borrowers/:id', asyncHandler(async (req, res) => {
  const borrowerIndex = findIndexById(borrowers, req.params.id);
  if (borrowerIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Borrower not found'
    });
  }
  const errors = validateBorrower(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }
  const updatedBorrower = {
    ...borrowers[borrowerIndex],
    ...req.body,
    id: borrowers[borrowerIndex].id
  };
  borrowers[borrowerIndex] = updatedBorrower;
  res.json({
    success: true,
    message: 'Borrower updated successfully',
    data: updatedBorrower
  });
}));
app.delete('/api/borrowers/:id', asyncHandler(async (req, res) => {
  const borrowerIndex = findIndexById(borrowers, req.params.id);
  if (borrowerIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Borrower not found'
    });
  }
  const hasActiveLoans = books.some(book => book.borrowedBy === parseInt(req.params.id));
  if (hasActiveLoans) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete borrower with active loans'
    });
  }
  borrowers.splice(borrowerIndex, 1);
  res.json({
    success: true,
    message: 'Borrower deleted successfully'
  });
}));
app.post('/api/books/:id/borrow', asyncHandler(async (req, res) => {
  const book = findById(books, req.params.id);
  const borrowerId = req.body.borrowerId;

  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }
  if (!book.available) {
    return res.status(400).json({
      success: false,
      message: 'Book is already borrowed'
    });
  }
  const borrower = findById(borrowers, borrowerId);
  if (!borrower) {
    return res.status(404).json({
      success: false,
      message: 'Borrower not found'
    });
  }
  book.available = false;
  book.borrowedBy = borrowerId;
  book.borrowedDate = new Date().toISOString().split('T')[0];
  borrower.activeLoans += 1;
  res.json({
    success: true,
    message: 'Book borrowed successfully',
    data: {
      book,
      borrower: borrower.name
    }
  });
}));
app.post('/api/books/:id/return', asyncHandler(async (req, res) => {
  const book = findById(books, req.params.id);
  if (!book) {
    return res.status(404).json({
      success: false,
      message: 'Book not found'
    });
  }
  if (book.available) {
    return res.status(400).json({
      success: false,
      message: 'Book is not currently borrowed'
    });
  }
  const borrower = findById(borrowers, book.borrowedBy);
  if (borrower) {
    borrower.activeLoans = Math.max(0, borrower.activeLoans - 1);
  }
  book.available = true;
  book.borrowedBy = null;
  book.borrowedDate = null;
  res.json({
    success: true,
    message: 'Book returned successfully',
    data: book
  });
}));
app.get('/api/docs', (req, res) => {
  res.json({
    name: "Library Management API",
    version: "1.0.0",
    description: "RESTful API for managing library inventory, authors, and borrowers",
    endpoints: {
      books: {
        "GET /api/books": "Get all books (supports filtering by available, genre, author)",
        "GET /api/books/:id": "Get specific book",
        "POST /api/books": "Create new book",
        "PUT /api/books/:id": "Update book",
        "DELETE /api/books/:id": "Delete book",
        "POST /api/books/:id/borrow": "Borrow a book",
        "POST /api/books/:id/return": "Return a book"
      },
      authors: {
        "GET /api/authors": "Get all authors",
        "GET /api/authors/:id": "Get specific author with their books",
        "POST /api/authors": "Create new author",
        "PUT /api/authors/:id": "Update author",
        "DELETE /api/authors/:id": "Delete author"
      },
      borrowers: {
        "GET /api/borrowers": "Get all borrowers",
        "GET /api/borrowers/:id": "Get specific borrower with borrowed books",
        "POST /api/borrowers": "Create new borrower",
        "PUT /api/borrowers/:id": "Update borrower",
        "DELETE /api/borrowers/:id": "Delete borrower (if no active loans)"
      }
    }
  });
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});
app.listen(PORT, () => {
  console.log(`Library API Server running on http://localhost:${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api/docs`);
});