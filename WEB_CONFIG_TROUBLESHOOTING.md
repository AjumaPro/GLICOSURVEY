# Web.config Troubleshooting Guide

## Common Web.config Errors and Solutions

### 1. **500.19 - Internal Server Error**
**Cause**: Invalid XML syntax or unsupported features
**Solution**: Use `web.config.minimal` for basic hosting

### 2. **404 - File Not Found**
**Cause**: Missing URL rewrite module or incorrect routing
**Solution**: Ensure URL Rewrite module is installed on IIS

### 3. **403 - Forbidden**
**Cause**: File permissions or security restrictions
**Solution**: Check file permissions and security settings

### 4. **CORS Errors**
**Cause**: Cross-origin requests blocked
**Solution**: Configure CORS in your backend API

## Web.config File Options

### **web.config.minimal** (Recommended for basic hosting)
- Basic URL rewriting
- Default document configuration
- Maximum compatibility
- No advanced features

### **web.config** (Standard version)
- URL rewriting with API exclusion
- MIME type configuration
- Security headers
- Error handling
- WebDAV removal

### **web.config.simple** (Alternative)
- Similar to standard but with fewer features
- Good for shared hosting

## Installation Instructions

1. **Choose the appropriate web.config file**:
   - For basic hosting: Use `web.config.minimal`
   - For advanced hosting: Use `web.config`
   - For troubleshooting: Start with `web.config.minimal`

2. **Rename the file**:
   ```bash
   # For minimal configuration
   cp client/public/web.config.minimal client/public/web.config
   
   # For standard configuration
   # (web.config is already the standard)
   
   # For simple configuration
   cp client/public/web.config.simple client/public/web.config
   ```

3. **Deploy to your server**:
   - Upload the `client/build/` folder to your web root
   - Ensure `web.config` is in the root of your build folder

## Server Requirements

### **IIS Requirements**:
- IIS 7.0 or higher
- URL Rewrite Module 2.0 or higher
- .NET Framework 4.0 or higher

### **URL Rewrite Module Installation**:
1. Download from Microsoft's website
2. Install on your IIS server
3. Restart IIS after installation

## Testing Your Configuration

1. **Local Testing**:
   ```bash
   npm run build
   # Test the build folder locally
   ```

2. **Server Testing**:
   - Upload to your server
   - Test all routes work correctly
   - Check for any error messages

## Common Issues and Fixes

### **Issue**: "Handler not found" error
**Fix**: Remove WebDAV module references if not needed

### **Issue**: MIME type errors
**Fix**: Ensure all required MIME types are defined

### **Issue**: Routing not working
**Fix**: Check URL Rewrite module installation

### **Issue**: Security headers causing problems
**Fix**: Remove or modify security headers in web.config

## Support

If you continue to experience issues:
1. Check your server's error logs
2. Try the minimal configuration first
3. Ensure all server requirements are met
4. Contact your hosting provider for IIS-specific issues 