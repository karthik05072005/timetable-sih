# Contributing to Timetable AI

Thank you for your interest in contributing to Timetable AI! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or MongoDB Atlas account
- Git installed
- Basic knowledge of Next.js, React, and JavaScript

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/timetable-ai.git
   cd timetable-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 📋 Contribution Guidelines

### Code Style
- Use ESLint and Prettier for code formatting
- Follow React and Next.js best practices
- Use TypeScript where applicable
- Write meaningful commit messages

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions or modifications
- `chore`: Build process or auxiliary tool changes

**Examples:**
```
feat(timetable): add PDF export functionality
fix(auth): resolve login validation issue
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests if applicable
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run test
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(scope): your meaningful commit message"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes

## 🐛 Bug Reports

When reporting bugs, please include:

- **Environment**: OS, Node.js version, browser
- **Steps to reproduce**: Clear, step-by-step instructions
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Error messages**: Full error logs

## 💡 Feature Requests

For new features:

- **Use case**: Describe the problem you're solving
- **Proposed solution**: How you envision the feature working
- **Alternatives**: Other solutions you've considered
- **Additional context**: Screenshots, mockups, or examples

## 🧪 Testing

- Write unit tests for new functionality
- Ensure all existing tests pass
- Test on multiple browsers and devices
- Test with different data sets

## 📚 Documentation

- Update README.md for new features
- Add inline code comments for complex logic
- Update API documentation
- Include examples in documentation

## 🏗️ Project Structure

```
timetable-ai/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Main page
├── components/            # React components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
├── .env.example          # Environment variables template
├── package.json          # Dependencies
└── README.md             # Project documentation
```

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Maintain a professional tone in all interactions

## 📞 Getting Help

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check the README and inline documentation

## 🏷️ Labels

When creating issues or PRs, use appropriate labels:

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements or additions to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `question`: Further information is requested

## 🎯 Priority Areas

Current areas where contributions are especially welcome:

- **UI/UX Improvements**: Better user experience
- **Performance Optimization**: Faster timetable generation
- **Testing**: More comprehensive test coverage
- **Documentation**: Better examples and tutorials
- **Accessibility**: Making the app more accessible
- **Mobile Responsiveness**: Better mobile experience

Thank you for contributing to Timetable AI! 🚀