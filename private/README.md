# Private Directory

This directory contains sensitive and user-uploaded content that should not be committed to the repository.

## Structure

```
private/
└── books/
    ├── uploads/   # Books uploaded via web interface
    ├── manual/    # Books added manually (e.g., via make add-book)
    └── api/       # Books received via API
```

## Usage

### Adding books manually

```bash
make add-book FILE=path/to/book.epub
```

This copies the book to `private/books/manual/`.

### Web uploads

Books uploaded via the admin web interface are stored in `private/books/uploads/`.

### API uploads

Books submitted via the API are stored in `private/books/api/`.

## Git Behavior

- The directory structure is tracked (via `.gitkeep` files)
- All book files (`*.epub`, `*.pdf`, etc.) are gitignored
- This README is tracked
