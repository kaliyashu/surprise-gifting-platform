# Surprise Moments Platform API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.surprisemoments.com/api
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

Error responses:

```json
{
  "error": "Error Type",
  "message": "Human readable error message",
  "details": { ... } // Optional additional error details
}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}
```

**Response:**
```json
{
  "message": "User registered successfully. Please check your email to verify your account.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "isVerified": false
  },
  "token": "jwt-token"
}
```

### Login User
**POST** `/auth/login`

Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "isVerified": true
  },
  "token": "jwt-token"
}
```

### Verify Email
**GET** `/auth/verify/:token`

Verify user email address.

**Response:**
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "isVerified": true
  }
}
```

### Forgot Password
**POST** `/auth/forgot-password`

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account with this email exists, a password reset link has been sent"
}
```

### Reset Password
**POST** `/auth/reset-password`

Reset password using token.

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "NewSecurePassword123",
  "confirmPassword": "NewSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

### Get Current User
**GET** `/auth/me`

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLogin": "2024-01-01T12:00:00.000Z"
  }
}
```

---

## Surprises Endpoints

### Create Surprise
**POST** `/surprises`

Create a new surprise experience.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "title": "Happy Birthday!",
  "occasion": "birthday",
  "templateId": "template-uuid",
  "revelations": [
    {
      "type": "message",
      "content": "Happy Birthday! You're amazing!",
      "order": 1
    },
    {
      "type": "image",
      "content": "https://example.com/image.jpg",
      "order": 2
    },
    {
      "type": "video",
      "content": "https://example.com/video.mp4",
      "order": 3
    }
  ],
  "password": "optional-password",
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "isPublic": false
}
```

**Response:**
```json
{
  "message": "Surprise created successfully",
  "surprise": {
    "id": "uuid",
    "token": "unique-token",
    "title": "Happy Birthday!",
    "occasion": "birthday",
    "templateId": "template-uuid",
    "revelationsCount": 3,
    "hasPassword": true,
    "expiresAt": "2024-12-31T23:59:59.000Z",
    "isPublic": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "shareUrl": "http://localhost:3000/surprise/unique-token"
  }
}
```

### Get Surprise (Viewer)
**GET** `/surprises/:token`

Get surprise for viewing (public endpoint).

**Query Parameters:**
- `password` (optional): Password if surprise is protected

**Response:**
```json
{
  "surprise": {
    "id": "uuid",
    "title": "Happy Birthday!",
    "occasion": "birthday",
    "template": {
      "id": "template-uuid",
      "name": "Birthday Celebration",
      "config": { ... }
    },
    "revelations": [
      {
        "type": "message",
        "content": "Happy Birthday! You're amazing!",
        "order": 1
      }
    ],
    "hasPassword": true,
    "isPublic": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "viewCount": 5
  }
}
```

### Get User's Surprises
**GET** `/surprises/user/me`

Get all surprises created by the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "surprises": [
    {
      "id": "uuid",
      "title": "Happy Birthday!",
      "occasion": "birthday",
      "template": {
        "id": "template-uuid",
        "name": "Birthday Celebration"
      },
      "hasPassword": true,
      "isPublic": false,
      "viewCount": 5,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": "2024-12-31T23:59:59.000Z",
      "shareUrl": "http://localhost:3000/surprise/unique-token"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Update Surprise
**PUT** `/surprises/:id`

Update an existing surprise.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "title": "Updated Birthday Surprise",
  "occasion": "birthday",
  "templateId": "template-uuid",
  "revelations": [
    {
      "type": "message",
      "content": "Updated birthday message!",
      "order": 1
    }
  ],
  "password": "new-password",
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "isPublic": true
}
```

**Response:**
```json
{
  "message": "Surprise updated successfully",
  "surprise": {
    "id": "uuid",
    "title": "Updated Birthday Surprise",
    "occasion": "birthday",
    "templateId": "template-uuid",
    "revelationsCount": 1,
    "hasPassword": true,
    "expiresAt": "2024-12-31T23:59:59.000Z",
    "isPublic": true
  }
}
```

### Delete Surprise
**DELETE** `/surprises/:id`

Delete a surprise.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Surprise deleted successfully"
}
```

### Get Surprise Analytics
**GET** `/surprises/:id/analytics`

Get analytics for a specific surprise.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "analytics": {
    "id": "uuid",
    "title": "Happy Birthday!",
    "totalViews": 15,
    "uniqueViews": 12,
    "lastViewed": "2024-01-01T12:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "shareUrl": "http://localhost:3000/surprise/unique-token"
  }
}
```

---

## Templates Endpoints

### Get All Templates
**GET** `/templates`

Get all available templates.

**Query Parameters:**
- `category` (optional): Filter by category
- `isActive` (optional): Filter by active status

**Response:**
```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Birthday Celebration",
      "description": "A festive birthday template with balloons and confetti",
      "category": "birthday",
      "config": {
        "backgroundColor": "#FF6B6B",
        "textColor": "#FFFFFF",
        "animation": "birthday-celebration",
        "duration": 5000,
        "effects": ["confetti", "balloons", "sparkles"]
      },
      "isActive": true,
      "isPremium": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Template by ID
**GET** `/templates/:id`

Get a specific template.

**Response:**
```json
{
  "template": {
    "id": "uuid",
    "name": "Birthday Celebration",
    "description": "A festive birthday template with balloons and confetti",
    "category": "birthday",
    "config": {
      "backgroundColor": "#FF6B6B",
      "textColor": "#FFFFFF",
      "animation": "birthday-celebration",
      "duration": 5000,
      "effects": ["confetti", "balloons", "sparkles"]
    },
    "isActive": true,
    "isPremium": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Media Endpoints

### Upload Media
**POST** `/media/upload`

Upload media files (images, videos, audio).

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Media file
- `type` (optional): File type (image, video, audio)

**Response:**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": "uuid",
    "filename": "uploaded-file.jpg",
    "originalName": "birthday-photo.jpg",
    "mimeType": "image/jpeg",
    "size": 1024000,
    "url": "http://localhost:5000/uploads/filename.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get User's Media
**GET** `/media/user`

Get all media files uploaded by the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `type` (optional): Filter by file type
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "files": [
    {
      "id": "uuid",
      "filename": "uploaded-file.jpg",
      "originalName": "birthday-photo.jpg",
      "mimeType": "image/jpeg",
      "size": 1024000,
      "url": "http://localhost:5000/uploads/filename.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

---

## Health Check

### API Health
**GET** `/health`

Check API health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

---

## Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Validation Error | Invalid request data |
| 401 | Authentication Error | Missing or invalid token |
| 403 | Authorization Error | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 413 | File Too Large | Uploaded file exceeds size limit |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 10 requests per 15 minutes
- **File upload endpoints**: 20 requests per 15 minutes

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## WebSocket Events (Real-time Features)

For real-time features like live collaboration and notifications:

**Connection:**
```
ws://localhost:5000/ws
```

**Events:**
- `surprise_viewed`: When someone views a surprise
- `surprise_updated`: When a surprise is updated
- `notification`: General notifications

**Example:**
```javascript
const ws = new WebSocket('ws://localhost:5000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'surprise_viewed':
      console.log('Surprise viewed:', data.surpriseId);
      break;
    case 'notification':
      console.log('Notification:', data.message);
      break;
  }
};
```

---

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install surprise-moments-sdk
```

```javascript
import { SurpriseMomentsAPI } from 'surprise-moments-sdk';

const api = new SurpriseMomentsAPI({
  baseURL: 'http://localhost:5000/api',
  token: 'your-jwt-token'
});

// Create a surprise
const surprise = await api.surprises.create({
  title: 'Happy Birthday!',
  occasion: 'birthday',
  // ... other fields
});
```

### Python
```bash
pip install surprise-moments-python
```

```python
from surprise_moments import SurpriseMomentsAPI

api = SurpriseMomentsAPI(
    base_url='http://localhost:5000/api',
    token='your-jwt-token'
)

# Create a surprise
surprise = api.surprises.create(
    title='Happy Birthday!',
    occasion='birthday',
    # ... other fields
)
```

---

## Support

For API support and questions:
- Email: api-support@surprisemoments.com
- Documentation: https://docs.surprisemoments.com
- GitHub Issues: https://github.com/surprisemoments/platform/issues
