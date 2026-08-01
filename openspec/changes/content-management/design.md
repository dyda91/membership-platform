# Design: Content Management

## Overview

The content management module is responsible for allowing the artist to create,
edit, organize and delete posts with images and videos.

This module will become the central feature of the platform and will integrate
with authentication, user management, tier management and future timeline
features.

Only authenticated users with the ARTIST role can create and manage content.

---

# Architecture

The implementation follows the existing NestJS modular architecture.

New backend modules:

- PostModule
- MediaModule

Existing modules used:

- AuthModule
- UserModule
- TierModule

---

# Database Design

## Post

Stores the main content.

Fields:

- id
- title
- content
- visibility (PUBLIC | PREMIUM)
- status (DRAFT | PUBLISHED)
- authorId
- tierId (nullable)
- createdAt
- updatedAt

Relationships:

Post
 ├── belongsTo User (author)
 ├── belongsTo Tier (optional)
 └── hasMany Media

---

## Media

Stores uploaded files.

Fields:

- id
- filename
- originalName
- mimeType
- size
- storageKey
- type (IMAGE | VIDEO)
- postId
- createdAt

Relationship:

Media
 └── belongsTo Post

---

# Storage

Media files will not be stored inside PostgreSQL.

Files will be uploaded to MinIO.

The database stores only metadata:

- storageKey
- filename
- mimeType
- size

The application retrieves files from MinIO when requested.

---

# Authorization

Roles:

SUPER_ADMIN
ARTIST
SUBSCRIBER

Permissions:

SUPER_ADMIN

- Full access
- Hidden from user list
- Can manage everything

ARTIST

- Create posts
- Edit own posts
- Delete own posts
- Upload media
- Manage users
- Manage tiers
- Edit own profile

SUBSCRIBER

- View content
- Access premium content according to tier

---

# Tier Integration

A post may optionally require a subscription tier.

Example:

Public Post

tierId = null

Premium Post

tierId = GOLD

Future timeline implementation will validate user tier before displaying
premium media.

---

# Backend API

Post endpoints:

GET /posts

GET /posts/:id

POST /posts

PATCH /posts/:id

DELETE /posts/:id


Media endpoints:

POST /media/upload

DELETE /media/:id

GET /media/:id

---

# Frontend

New pages:

Artist Dashboard

- Posts
- New Post
- Edit Post

New Components:

- PostForm
- MediaUploader
- MediaPreview
- TierSelector
- PostCard

---

# Validation

The backend must validate:

- authenticated user
- artist permission
- uploaded file type
- maximum upload size
- existing tier before publishing premium content

---

# Future Integration

This module is designed to integrate with:

- Timeline Feed
- Premium Content Access
- Subscription System
- Notifications
- Analytics
