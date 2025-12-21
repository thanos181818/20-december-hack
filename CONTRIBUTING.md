# Contributing to ApparelDesk

First off, thank you for considering contributing to ApparelDesk! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to providing a welcoming and inclusive experience for everyone. Please be respectful and constructive in all interactions.

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, browser, Python version, etc.)

### 💡 Suggesting Features

Feature suggestions are welcome! Please:

- Check if the feature has already been suggested
- Provide a clear description of the feature
- Explain why this feature would be useful
- Consider how it fits with existing functionality

### 🔧 Pull Requests

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes
4. Write/update tests as needed
5. Update documentation
6. Submit a pull request

## Development Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 15+
- Git

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your settings
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Pull Request Process

1. **Update the README.md** with details of changes if applicable
2. **Update documentation** for any changed functionality
3. **Add tests** for new features
4. **Ensure all tests pass** before submitting
5. **Request review** from maintainers

### PR Title Format

```
type(scope): description

Examples:
feat(auth): add password reset functionality
fix(orders): correct total calculation
docs(readme): update deployment instructions
style(ui): improve button hover states
```

## Style Guidelines

### Python (Backend)

- Follow **PEP 8** style guide
- Use **type hints** for function parameters and returns
- Write **docstrings** for functions and classes
- Keep functions focused and small

```python
async def get_product(
    product_id: int,
    session: AsyncSession = Depends(get_session)
) -> Product:
    """
    Retrieve a product by ID.
    
    Args:
        product_id: The unique identifier of the product
        session: Database session
        
    Returns:
        Product object if found
        
    Raises:
        HTTPException: If product not found
    """
    product = await session.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
```

### TypeScript/React (Frontend)

- Use **TypeScript** for all new code
- Follow **ESLint** configuration
- Use **functional components** with hooks
- Keep components small and focused

```tsx
interface ProductCardProps {
  product: Product;
  onAddToCart: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart 
}) => {
  return (
    <div className="rounded-lg border p-4">
      <h3>{product.name}</h3>
      <Button onClick={() => onAddToCart(product.id)}>
        Add to Cart
      </Button>
    </div>
  );
};
```

### Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and PRs when applicable

## 🎯 Areas for Contribution

- **Documentation** - Improve README, add tutorials
- **Testing** - Add unit and integration tests
- **UI/UX** - Improve user interface and experience
- **Performance** - Optimize database queries, frontend rendering
- **Accessibility** - Improve a11y compliance
- **Internationalization** - Add multi-language support

## ❓ Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

---

Thank you for contributing! 🙏
