# Support

Welcome to Tampana! We're here to help you get the most out of your emotional wellness tracking experience.

## 🆘 Getting Help

### Quick Start Issues

If you're having trouble getting started:

1. **Check the [README.md](../README.md)** for installation and setup instructions
2. **Review the [Contributing Guide](CONTRIBUTING.md)** for development setup
3. **Look at existing [GitHub Issues](https://github.com/guitarbeat/tampana/issues)** - your question might already be answered

### Common Issues

#### Installation Problems

**Node.js Version Issues**
- Ensure you're using Node.js v16 or higher (check with `node --version`)
- Use the version specified in `.nvmrc` for best compatibility
- Consider using `nvm` to manage Node.js versions

**Dependency Installation Failures**
```bash
# Clear npm cache and retry
npm cache clean --force
npm install

# If you're using different package managers
rm -rf node_modules package-lock.json
npm install
```

#### Build Issues

**TypeScript Compilation Errors**
```bash
# Run type checking to see specific errors
npm run typecheck

# Common fixes
npm run lint:fix  # Fix linting issues
npm run format    # Format code
```

**Vite Build Problems**
- Clear the Vite cache: `rm -rf node_modules/.vite`
- Check for port conflicts: default is `localhost:3000`

#### Runtime Issues

**Calendar Not Loading**
- Check browser console for JavaScript errors
- Ensure you have a stable internet connection for Vue Cal dependencies
- Try refreshing the page or clearing browser cache

**N8N Integration Issues**
- Verify your N8N instance is accessible
- Check webhook URLs and authentication settings
- Test connection using the N8N Demo page

#### Theme/UI Issues

**Dark Mode Not Working**
- Check if theme preference is saved in localStorage
- Try toggling theme manually using the sun/moon icon
- Clear browser data if persistent

### 📚 Documentation

- **[README.md](../README.md)** - Complete project overview and setup
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Development guidelines and workflow
- **[CHANGELOG.md](CHANGELOG.md)** - Recent changes and version history
- **[todo.md](TODO.md)** - Current development priorities and roadmap

### 💬 Community Support

#### GitHub Discussions
For general questions, feature requests, and community discussions:
- [Start a Discussion](https://github.com/guitarbeat/tampana/discussions)
- Browse existing discussions for similar topics
- Share your use cases and emotional wellness tips

#### GitHub Issues
For bug reports and specific technical issues:
- [Report a Bug](https://github.com/guitarbeat/tampana/issues/new?template=bug_report.md)
- [Request a Feature](https://github.com/guitarbeat/tampana/issues/new?template=feature_request.md)
- Search existing issues before creating new ones

### 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Environment Information:**
   - Operating System (Windows, macOS, Linux)
   - Browser and version
   - Node.js version
   - Tampana version

2. **Steps to Reproduce:**
   - Detailed steps to recreate the issue
   - Expected behavior
   - Actual behavior

3. **Additional Context:**
   - Error messages or console logs
   - Screenshots (if applicable)
   - Any workarounds you've tried

### 🚀 Feature Requests

We welcome feature suggestions! When requesting features:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** you're trying to solve
3. **Explain your proposed solution** in detail
4. **Consider the impact** on other users
5. **Provide use cases** and examples

### 🔧 Development Support

#### Setting Up Development Environment

```bash
# Clone and setup
git clone https://github.com/guitarbeat/tampana.git
cd tampana
npm install
npm run dev
```

#### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

#### Code Quality

```bash
# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check
```

### 🏗️ N8N Integration Support

#### Setup Help
- Check the N8N integration section in [README.md](README.md)
- Ensure your N8N instance is accessible and properly configured
- Test webhook endpoints using tools like `curl` or Postman

#### Common N8N Issues
- **Connection timeout**: Check firewall and network settings
- **Authentication failed**: Verify API keys and headers
- **Webhook not triggered**: Check N8N workflow configuration and activation

#### Example N8N Workflows
We're working on providing example workflows for:
- Daily mood summaries
- Pattern detection alerts
- Integration with health apps
- Custom wellness recommendations

### 📧 Direct Contact

For issues that require direct assistance:

- **Email**: [guitarbeat@users.noreply.github.com]
- **GitHub**: [@guitarbeat](https://github.com/guitarbeat)

### ⏱️ Response Times

We aim to respond to:
- **Security issues**: Within 24 hours
- **Bug reports**: Within 48-72 hours
- **Feature requests**: Within 1 week
- **General questions**: Within 1 week

*Note: Response times may vary based on complexity and current workload.*

### 🤝 Contributing Support

Interested in contributing? Great!

1. Read our [Contributing Guidelines](CONTRIBUTING.md)
2. Check the [TODO.md](TODO.md) for current priorities
3. Look for issues labeled `good first issue` or `help wanted`
4. Join our discussions to understand the project roadmap

### 📖 Additional Resources

#### Emotional Wellness
- [Mental Health Resources](https://www.mentalhealth.gov/get-help)
- [Mindfulness and Meditation](https://www.headspace.com/)
- [Emotional Intelligence](https://www.psychologytoday.com/us/basics/emotional-intelligence)

#### Technical Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vue Cal Documentation](https://antoniandre.github.io/vue-cal/)
- [N8N Documentation](https://docs.n8n.io/)

---

## 💡 Tips for Better Support

1. **Search first** - Check existing issues and documentation
2. **Be specific** - Provide detailed information about your problem
3. **Be patient** - We're a small team and community-driven
4. **Be respectful** - Follow our [Code of Conduct](CODE_OF_CONDUCT.md)
5. **Share knowledge** - Help others when you can

Thank you for using Tampana and being part of our emotional wellness community! 🎭💚