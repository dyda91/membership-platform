# Proposal: Content Management

## Why

The platform now supports authentication, user management and subscription tiers.

The next step is allowing artists to create, manage and organize premium and public content.

This feature becomes the core of the platform because every future capability depends on posts and media.

## What Changes

- Create post management
- Create media management
- Support image and video uploads
- Integrate MinIO storage
- Associate tiers with posts
- Support drafts
- Support post editing
- Support post deletion

## Goals

- Artists can publish content.
- Artists can upload media.
- Posts can require a minimum subscription tier.
- Media is associated with posts.
- Content is ready for timeline integration.

## Non Goals

- Payments
- Public timeline
- Likes
- Comments
- Notifications

## Impact

Backend:
- New Post module
- New Media module
- Storage integration

Frontend:
- Post editor
- Media uploader
- Artist content management

Database:
- New Post model
- New Media model
