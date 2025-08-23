# 📊 Data Persistence & Recovery Guide

## 🎯 Overview

The GLICO Survey application now implements **comprehensive data persistence** ensuring that all surveys, templates, and drafts are **permanently saved** unless explicitly deleted. This guide explains the new features and how they protect your data.

## 🔒 Key Features

### 1. **Soft Delete System**
- **Surveys, templates, and questions are never permanently deleted** by default
- **Soft delete** marks items as deleted but keeps them in the database
- **Recovery** is possible for accidentally deleted items
- **Audit trail** tracks who deleted what and when

### 2. **Version Control**
- **Every survey change creates a new version**
- **Complete history** of all survey modifications
- **Rollback capability** to any previous version
- **Change tracking** with timestamps and user information

### 3. **Template Persistence**
- **System templates** are permanently stored in the database
- **Custom templates** created by users are saved permanently
- **Template sharing** between users with proper permissions
- **Template versioning** for custom templates

### 4. **Enhanced Metadata**
- **Response tracking** with IP addresses and user agents
- **Geographic data** from respondent locations
- **Device information** (mobile/desktop, browser type)
- **Timing data** for response analysis

## 🗄️ Database Schema Changes

### New Tables Added:
- **`survey_versions`** - Stores all survey versions
- **`custom_templates`** - Stores user-created templates

### Enhanced Tables:
- **`surveys`** - Added soft delete columns
- **`questions`** - Added soft delete columns
- **`survey_templates`** - Added soft delete columns
- **`responses`** - Added enhanced metadata columns
- **`images`** - Added soft delete columns
- **`users`** - Added active status column

## 🔧 API Endpoints

### Survey Management

#### Get All Surveys (Excluding Deleted)
```http
GET /api/surveys
```
Returns only active surveys (not soft deleted)

#### Get Deleted Surveys
```http
GET /api/surveys/deleted
```
Returns only soft deleted surveys for recovery

#### Soft Delete Survey
```http
DELETE /api/surveys/:id
```
Marks survey as deleted but keeps data

#### Restore Deleted Survey
```http
POST /api/surveys/:id/restore
```
Restores a soft deleted survey

#### Permanently Delete Survey (Admin Only)
```http
DELETE /api/surveys/:id/permanent
```
Actually removes survey from database (admin only)

#### Get Survey Versions
```http
GET /api/surveys/:id/versions
```
Returns all versions of a survey

#### Restore Specific Version
```http
POST /api/surveys/:id/restore-version/:version
```
Restores survey to a specific version

### Template Management

#### Get All Templates
```http
GET /api/templates
```
Returns both system and custom templates

#### Get System Templates Only
```http
GET /api/templates/system
```
Returns only system-provided templates

#### Get Custom Templates Only
```http
GET /api/templates/custom
```
Returns only user-created templates

#### Get Deleted Templates
```http
GET /api/templates/deleted
```
Returns soft deleted custom templates

#### Create Custom Template
```http
POST /api/templates
```
Creates a new custom template

#### Update Custom Template
```http
PUT /api/templates/:id
```
Updates an existing custom template

#### Soft Delete Template
```http
DELETE /api/templates/:id
```
Marks custom template as deleted

#### Restore Deleted Template
```http
POST /api/templates/:id/restore
```
Restores a soft deleted template

#### Duplicate Template
```http
POST /api/templates/:id/duplicate
```
Creates a copy of any template as custom template

## 📋 Data Recovery Procedures

### 1. **Recovering Deleted Surveys**

```bash
# 1. List all deleted surveys
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/surveys/deleted

# 2. Restore a specific survey
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/surveys/SURVEY_ID/restore
```

### 2. **Recovering Deleted Templates**

```bash
# 1. List all deleted templates
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/templates/deleted

# 2. Restore a specific template
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/templates/TEMPLATE_ID/restore
```

### 3. **Rolling Back Survey Versions**

```bash
# 1. Get all versions of a survey
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/surveys/SURVEY_ID/versions

# 2. Restore to a specific version
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/surveys/SURVEY_ID/restore-version/VERSION_NUMBER
```

## 🛡️ Data Protection Features

### 1. **Automatic Versioning**
- Every survey edit creates a new version
- No data loss during editing
- Complete audit trail maintained

### 2. **Soft Delete Protection**
- Items marked as deleted but not removed
- Recovery possible at any time
- Audit trail of deletions

### 3. **Permission-Based Access**
- Users can only access their own data
- Admins have additional recovery capabilities
- Template sharing with proper permissions

### 4. **Database Constraints**
- Foreign key relationships prevent orphaned data
- Cascade deletes only for permanent deletions
- Data integrity maintained

## 📊 Monitoring and Maintenance

### 1. **Database Health Checks**

```sql
-- Check for orphaned data
SELECT COUNT(*) FROM surveys WHERE user_id NOT IN (SELECT id FROM users);

-- Check soft deleted items
SELECT COUNT(*) FROM surveys WHERE is_deleted = true;
SELECT COUNT(*) FROM custom_templates WHERE is_deleted = true;

-- Check version counts
SELECT survey_id, COUNT(*) as version_count 
FROM survey_versions 
GROUP BY survey_id 
ORDER BY version_count DESC;
```

### 2. **Cleanup Procedures**

```sql
-- Permanently delete old soft deleted items (after 30 days)
DELETE FROM surveys 
WHERE is_deleted = true 
AND deleted_at < NOW() - INTERVAL '30 days';

-- Clean up old versions (keep last 10 versions per survey)
DELETE FROM survey_versions 
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY survey_id ORDER BY version_number DESC) as rn
    FROM survey_versions
  ) t WHERE rn <= 10
);
```

### 3. **Backup Recommendations**

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U username -d surveyguy_db > backup_$DATE.sql
gzip backup_$DATE.sql
```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. **Survey Not Found After "Deletion"**
- Check if survey is soft deleted: `GET /api/surveys/deleted`
- Restore the survey: `POST /api/surveys/:id/restore`

#### 2. **Template Not Available**
- Check if template is soft deleted: `GET /api/templates/deleted`
- Restore the template: `POST /api/templates/:id/restore`

#### 3. **Version History Missing**
- Ensure survey_versions table exists
- Run database migration: `npm run migrate`

#### 4. **Performance Issues**
- Check database indexes are created
- Monitor version table size
- Implement cleanup procedures

## 📈 Best Practices

### 1. **Regular Backups**
- Schedule daily database backups
- Test backup restoration procedures
- Store backups in multiple locations

### 2. **Monitoring**
- Monitor soft deleted item counts
- Track version table growth
- Set up alerts for unusual activity

### 3. **User Training**
- Train users on soft delete vs permanent delete
- Explain version control features
- Document recovery procedures

### 4. **Maintenance**
- Regular cleanup of old soft deleted items
- Archive old survey versions
- Monitor database performance

## 🎉 Benefits

### 1. **Data Safety**
- No accidental data loss
- Complete recovery capabilities
- Audit trail for compliance

### 2. **User Experience**
- Undo functionality for all changes
- Version history for surveys
- Template sharing and collaboration

### 3. **Administrative Control**
- Granular permission system
- Recovery tools for administrators
- Comprehensive monitoring capabilities

### 4. **Compliance**
- Data retention policies
- Audit trails for regulatory requirements
- Secure data handling

---

## 🚀 Getting Started

1. **Run the migration**: `npm run migrate`
2. **Test the features**: Create, edit, and "delete" surveys
3. **Practice recovery**: Restore deleted items
4. **Explore versioning**: Check survey version history
5. **Set up monitoring**: Implement backup and cleanup procedures

**Your survey data is now permanently protected!** 🛡️ 