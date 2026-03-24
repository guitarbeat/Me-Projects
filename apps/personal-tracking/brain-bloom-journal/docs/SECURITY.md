# Security Policy

## Supported Versions

We take security seriously for the Tampana emotional wellness tracker. The following versions are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We appreciate the security community's efforts to improve the security of our project. If you believe you have found a security vulnerability in Tampana, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please send an email to [guitarbeat@users.noreply.github.com] with the following information:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### What to Expect

You can expect to receive:

1. **Initial Response**: Within 48 hours of your report
2. **Investigation**: We will investigate and validate the vulnerability
3. **Updates**: Regular updates on our progress every 72 hours
4. **Resolution**: A timeline for fixing the vulnerability
5. **Credit**: Recognition for your responsible disclosure (if desired)

### Security Update Process

When we receive a security vulnerability report, we will:

1. **Confirm** the problem and determine the affected versions
2. **Audit** code to find any similar problems
3. **Prepare** fixes for all supported versions
4. **Release** new versions as soon as possible
5. **Announce** the vulnerability in our security advisories

## Security Best Practices

### For Users

- Keep your Tampana installation up to date
- Use HTTPS when accessing your Tampana instance
- Regularly backup your emotional data
- Use strong, unique passwords for any related accounts
- Be cautious when configuring N8N integrations with external services

### For Developers

- Follow secure coding practices
- Run security scans regularly (`npm audit`)
- Use dependency scanning tools
- Validate all user inputs
- Implement proper authentication and authorization
- Use HTTPS for all external communications
- Regularly update dependencies

## Known Security Considerations

### Data Privacy

Tampana is designed with privacy in mind:

- **Local Storage**: All emotional data is stored locally in your browser by default
- **No Tracking**: We don't collect analytics or tracking data without explicit consent
- **N8N Integration**: When enabled, data is only sent to your configured N8N instance

### N8N Integration Security

When using N8N integration:

- Use HTTPS for your N8N instance
- Implement proper authentication (API keys, OAuth)
- Validate webhook endpoints
- Monitor webhook traffic
- Use secure network connections

### Browser Security

- Tampana runs in your browser and inherits browser security features
- Use modern, updated browsers
- Be aware of browser extension security implications
- Clear browser data when using shared computers

## Dependencies

We regularly monitor and update our dependencies for security vulnerabilities:

- Run `npm audit` regularly
- Use automated dependency scanning
- Keep development dependencies updated
- Monitor security advisories for our tech stack

## Security Updates

Security updates will be released as:

1. **Patch releases** for non-breaking security fixes
2. **Minor releases** for security improvements with new features
3. **Major releases** for significant security architecture changes

All security updates will be announced in:

- GitHub Security Advisories
- Release notes
- docs/CHANGELOG.md

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [React Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/React_Security_Cheat_Sheet.html)
- [Browser Security](https://web.dev/security/)

## Contact

For any security-related questions or concerns, please contact:

- Email: [guitarbeat@users.noreply.github.com]
- GitHub: [@guitarbeat](https://github.com/guitarbeat)

---

Thank you for helping keep Tampana and our users safe!