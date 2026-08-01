## 1. Database

- [x] 1.1 Analyze existing Prisma schema and current User/Tier relationships
- [x] 1.2 Create Post model
- [x] 1.3 Create Media model
- [x] 1.4 Create relationships between Post, Media, User and Tier
- [x] 1.5 Add post status (Draft / Published)
- [x] 1.6 Generate Prisma migration
- [x] 1.7 Apply migration and validate schema

## 2. Storage Integration

- [x] 2.1 Configure MinIO integration
- [x] 2.2 Create storage service
- [x] 2.3 Implement image upload
- [x] 2.4 Implement video upload
- [x] 2.5 Store media metadata in database
- [x] 2.6 Validate upload size and MIME types

## 3. Backend - Post Module

- [x] 3.1 Create Post module
- [x] 3.2 Create Post controller
- [x] 3.3 Create Post service
- [x] 3.4 Create DTO validation
- [x] 3.5 Implement create post endpoint
- [x] 3.6 Implement list posts endpoint
- [x] 3.7 Implement get post endpoint
- [x] 3.8 Implement update post endpoint
- [x] 3.9 Implement delete post endpoint
- [x] 3.10 Implement draft and publish workflow

## 4. Backend - Media Module

- [x] 4.1 Create Media module
- [x] 4.2 Create upload endpoint
- [x] 4.3 Associate uploaded media with posts
- [x] 4.4 Remove media
- [x] 4.5 Retrieve media metadata

## 5. Authorization

- [x] 5.1 Reuse existing JWT authentication
- [x] 5.2 Restrict content management to ARTIST and SUPER_ADMIN
- [x] 5.3 Validate Tier existence before publishing premium content
- [x] 5.4 Ensure subscribers cannot manage posts

## 6. Frontend

- [x] 6.1 Create Posts page
- [x] 6.2 Create New Post page
- [x] 6.3 Create Edit Post page
- [x] 6.4 Create PostForm component
- [x] 6.5 Create MediaUploader component
- [x] 6.6 Create MediaPreview component
- [x] 6.7 Create TierSelector component
- [x] 6.8 Implement draft saving
- [x] 6.9 Connect frontend to backend API

## 7. Validation

- [x] 7.1 Test image upload
- [x] 7.2 Test video upload
- [x] 7.3 Test CRUD operations
- [x] 7.4 Test draft workflow
- [x] 7.5 Test premium tier association
- [x] 7.6 Run backend build
- [x] 7.7 Run frontend build
- [x] 7.8 Resolve all integration issues
