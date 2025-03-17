# Contributing to Muse

Thank you for your interest in contributing to Muse! I'm excited to have you join this project. This document outlines how you can contribute effectively to make Muse even better.

## Project Overview

Muse is a web application that allows users to upload songs, create playlists, and share them with others. Unlike other music streaming services, Muse lets users download their own music through YouTube and Soundcloud links.

## Development Environment Setup

### Prerequisites

- [Docker](https://www.docker.com/)
- [Node.js 18.x.x or 20+](https://nodejs.org/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/get-started/) account (for storage)
- [MongoDB Compass](https://www.mongodb.com/try/download/compass) (optional, for database visualization)

### Getting Started

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/muse.git
   cd muse
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory with the variables listed in the main README.md.

3. **Install dependencies:**
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd app
   npm install

   # Install shared package dependencies
   cd ../shared
   npm install
   ```

4. **Start the development environment:**
   ```bash
   # Start MongoDB using Docker
   docker-compose up -d

   # Run the backend server
   npm run dev

   # In another terminal, run the frontend
   cd app
   npm run dev
   ```

## Project Structure

- `/app` - Frontend React application
- `/shared` - Shared TypeScript code between frontend and backend
- `/models` - MongoDB data models
- `/lib` - Utility functions and middleware
- `/scripts` - Helper scripts
- `/docs` - Documentation files
- `/routes` - API endpoints
- `/util` - Helper methods and types

## Code Standards

I maintain high standards for code quality in this project:

- Use TypeScript for type safety
- Follow ESLint configurations
- Write descriptive variable and function names
- Include appropriate comments for complex logic
- Maintain consistency with the existing codebase

## Pull Request Process

1. **Create a branch** with a descriptive name:
   ```bash
   git checkout -b github-alias/your-feature-name
   e.g., nyumat/downloads-page-view
   ```

2. **Make your changes** and commit them following the commit message guidelines.

3. **Test your changes** thoroughly.

4. **Push your branch** and create a pull request against the `main` branch.

5. **Address any feedback** I provide during the review process.

Pull requests should:
- Have a clear, descriptive title
- Include a detailed description of the changes
- Reference any related issues
- Pass all automated checks

## Commit Message Guidelines

I use conventional commit messages:

```
type(scope): brief description

[optional body]

[optional footer]
```

Types include:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

> [!NOTE]
> Scoope is optional, especially for sweeping changes.

## Issue Reporting

When reporting issues, please use the issue templates and include:

- A clear description of the problem
- Steps to reproduce
- Expected behavior vs. actual behavior
- Screenshots or error messages when applicable
- Environment details (browser, OS, etc.)

## Testing

I value quality and maintainability:

- Ensure all GitHub action workflow steps pass
- If you use AI to develop a new feature, explicitly call that out
- Test new features before making a PR for acceptance

## License

By contributing to Muse, you agree that your contributions will be licensed under the project's license.

## Questions?

If you have any questions about contributing, feel free to open an issue or reach out directly.

Thank you for helping make Muse better!
