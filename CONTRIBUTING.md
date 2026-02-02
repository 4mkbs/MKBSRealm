# Contributing to MKBS Realm

Thank you for considering contributing to MKBS Realm! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Add upstream remote: `git remote add upstream <original-repo-url>`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- Node.js v18 or higher
- MongoDB (local or Atlas)
- Git

### Installation

1. **Backend Setup**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Making Changes

### Branch Naming

- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Critical fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

Examples:

- `feature/group-chat`
- `bugfix/message-notification`
- `docs/api-documentation`

### Code Style

#### JavaScript/React

- Use ES6+ features
- Use functional components with hooks
- Follow React best practices
- Use meaningful variable names
- Add comments for complex logic

#### File Structure

- Components in `frontend/src/components/`
- Pages in `frontend/src/pages/`
- API calls in `frontend/src/services/`
- Controllers in `backend/controllers/`
- Models in `backend/models/`

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(messaging): add message reactions
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
refactor(api): optimize message query performance
```

## Pull Request Process

1. **Update your branch**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Ensure your code works**

   - Test all affected features
   - Check for console errors
   - Verify responsive design

3. **Create Pull Request**

   - Provide clear title and description
   - Reference any related issues
   - Include screenshots if UI changes
   - List breaking changes if any

4. **PR Description Template**

   ```markdown
   ## Description

   Brief description of changes

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing

   - Describe how you tested the changes

   ## Screenshots (if applicable)

   ## Checklist

   - [ ] Code follows project style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tests added/updated
   ```

5. **After Submission**
   - Respond to review comments
   - Make requested changes
   - Keep PR updated with main branch

## Testing

### Manual Testing Checklist

#### Authentication

- [ ] Register new user
- [ ] Login with credentials
- [ ] Logout functionality
- [ ] Profile view/edit

#### Posts

- [ ] Create post
- [ ] Like/unlike post
- [ ] Add comment
- [ ] Delete own post

#### Friends

- [ ] Send friend request
- [ ] Accept request
- [ ] Reject request
- [ ] Cancel sent request
- [ ] Unfriend user

#### Messaging

- [ ] Start conversation
- [ ] Send messages
- [ ] Real-time delivery
- [ ] Typing indicators
- [ ] Read receipts

#### Calls

- [ ] Audio call initiation
- [ ] Video call initiation
- [ ] Accept/reject calls
- [ ] Mute/unmute
- [ ] Camera toggle

### API Testing

```bash
# Example: Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"password123"}'
```

## Questions?

Feel free to open an issue for:

- Bug reports
- Feature requests
- Questions about contributing
- General discussions

## Recognition

Contributors will be acknowledged in:

- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to MKBS Realm! 🎉
