#!/usr/bin/env python3
"""
FastAPI Integration for GLICO Survey System
This file provides a bridge between FastAPI and PHP backend
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import httpx
import json
import os
from datetime import datetime
import uvicorn

# Initialize FastAPI app
app = FastAPI(
    title="GLICO Survey API",
    description="FastAPI integration for GLICO Survey System with PHP backend",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Configuration
PHP_BACKEND_URL = os.getenv("PHP_BACKEND_URL", "http://localhost:8000")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")

# Pydantic models
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "user"

class SurveyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    is_public: bool = False
    questions: List[Dict[str, Any]] = []

class TemplateCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_public: bool = False
    questions: List[Dict[str, Any]] = []

class ResponseCreate(BaseModel):
    survey_id: int
    question_id: int
    response_data: Dict[str, Any]

# Helper functions
async def make_php_request(endpoint: str, method: str = "GET", data: Optional[Dict] = None, headers: Optional[Dict] = None) -> Dict[str, Any]:
    """Make HTTP request to PHP backend"""
    url = f"{PHP_BACKEND_URL}/api/{endpoint}"
    
    async with httpx.AsyncClient() as client:
        try:
            if method.upper() == "GET":
                response = await client.get(url, headers=headers)
            elif method.upper() == "POST":
                response = await client.post(url, json=data, headers=headers)
            elif method.upper() == "PUT":
                response = await client.put(url, json=data, headers=headers)
            elif method.upper() == "DELETE":
                response = await client.delete(url, headers=headers)
            else:
                raise HTTPException(status_code=400, detail="Invalid HTTP method")
            
            response.raise_for_status()
            return response.json()
            
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"PHP backend connection error: {str(e)}")

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Verify JWT token and return user info"""
    token = credentials.credentials
    
    # For now, we'll pass the token to PHP backend for verification
    # In production, you might want to verify JWT tokens in FastAPI
    try:
        user_info = await make_php_request("auth/me", "GET", headers={"Authorization": f"Bearer {token}"})
        return user_info.get("user", {})
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check PHP backend health
        php_health = await make_php_request("health")
        return {
            "status": "OK",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "environment": "development",
            "php_backend": "connected",
            "php_status": php_health
        }
    except Exception as e:
        return {
            "status": "WARNING",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "environment": "development",
            "php_backend": "disconnected",
            "error": str(e)
        }

# Authentication endpoints
@app.post("/api/auth/login")
async def login(user_data: UserLogin):
    """User login endpoint"""
    return await make_php_request("auth/login", "POST", data=user_data.dict())

@app.get("/api/auth/me")
async def get_profile(user: Dict = Depends(verify_token)):
    """Get current user profile"""
    return await make_php_request("auth/me", "GET", headers={"Authorization": f"Bearer {user.get('token')}"})

@app.put("/api/auth/profile")
async def update_profile(profile_data: Dict[str, Any], user: Dict = Depends(verify_token)):
    """Update user profile"""
    return await make_php_request("auth/profile", "PUT", data=profile_data, headers={"Authorization": f"Bearer {user.get('token')}"})

@app.post("/api/auth/change-password")
async def change_password(password_data: Dict[str, Any], user: Dict = Depends(verify_token)):
    """Change user password"""
    return await make_php_request("auth/change-password", "POST", data=password_data, headers={"Authorization": f"Bearer {user.get('token')}"})

# Survey endpoints
@app.get("/api/surveys")
async def get_surveys(user: Dict = Depends(verify_token)):
    """Get all surveys"""
    return await make_php_request("surveys", "GET", headers={"Authorization": f"Bearer {user.get('token')}"})

@app.get("/api/surveys/{survey_id}")
async def get_survey(survey_id: int, user: Dict = Depends(verify_token)):
    """Get specific survey"""
    return await make_php_request(f"surveys/{survey_id}", "GET", headers={"Authorization": f"Bearer {user.get('token')}"})

@app.post("/api/surveys")
async def create_survey(survey_data: SurveyCreate, user: Dict = Depends(verify_token)):
    """Create new survey"""
    return await make_php_request("surveys", "POST", data=survey_data.dict(), headers={"Authorization": f"Bearer {user.get('token')}"})

@app.put("/api/surveys/{survey_id}")
async def update_survey(survey_id: int, survey_data: SurveyCreate, user: Dict = Depends(verify_token)):
    """Update existing survey"""
    return await make_php_request(f"surveys/{survey_id}", "PUT", data=survey_data.dict(), headers={"Authorization": f"Bearer {user.get('token')}"})

@app.delete("/api/surveys/{survey_id}")
async def delete_survey(survey_id: int, user: Dict = Depends(verify_token)):
    """Delete survey"""
    return await make_php_request(f"surveys/{survey_id}", "DELETE", headers={"Authorization": f"Bearer {user.get('token')}"})

# Template endpoints
@app.get("/api/templates")
async def get_templates(user: Dict = Depends(verify_token)):
    """Get all templates"""
    return await make_php_request("templates", "GET", headers={"Authorization": f"Bearer {user.get('token')}"})

@app.get("/api/templates/{template_id}")
async def get_template(template_id: int, user: Dict = Depends(verify_token)):
    """Get specific template"""
    return await make_php_request(f"templates/{template_id}", "GET", headers={"Authorization": f"Bearer {user.get('token')}"})

@app.post("/api/templates")
async def create_template(template_data: TemplateCreate, user: Dict = Depends(verify_token)):
    """Create new template"""
    return await make_php_request("templates", "POST", data=template_data.dict(), headers={"Authorization": f"Bearer {user.get('token')}"})

@app.put("/api/templates/{template_id}")
async def update_template(template_id: int, template_data: TemplateCreate, user: Dict = Depends(verify_token)):
    """Update existing template"""
    return await make_php_request(f"templates/{template_id}", "PUT", data=template_data.dict(), headers={"Authorization": f"Bearer {user.get('token')}"})

@app.delete("/api/templates/{template_id}")
async def delete_template(template_id: int, user: Dict = Depends(verify_token)):
    """Delete template"""
    return await make_php_request(f"templates/{template_id}", "DELETE", headers={"Authorization": f"Bearer {user.get('token')}"})

# Admin endpoints
@app.get("/api/admin/users")
async def get_users(user: Dict = Depends(verify_token)):
    """Get all users (admin only)"""
    return await make_php_request("admin/users", "GET", headers={"Authorization": f"Bearer {user.get('token')}"})

@app.post("/api/admin/users")
async def create_user(user_data: UserCreate, user: Dict = Depends(verify_token)):
    """Create new user (admin only)"""
    return await make_php_request("admin/users", "POST", data=user_data.dict(), headers={"Authorization": f"Bearer {user.get('token')}"})

@app.put("/api/admin/users/{user_id}")
async def update_user(user_id: int, user_data: Dict[str, Any], user: Dict = Depends(verify_token)):
    """Update user (admin only)"""
    return await make_php_request(f"admin/users/{user_id}", "PUT", data=user_data, headers={"Authorization": f"Bearer {user.get('token')}"})

@app.delete("/api/admin/users/{user_id}")
async def delete_user(user_id: int, user: Dict = Depends(verify_token)):
    """Delete user (admin only)"""
    return await make_php_request(f"admin/users/{user_id}", "DELETE", headers={"Authorization": f"Bearer {user.get('token')}"})

# Analytics endpoints
@app.get("/api/analytics")
async def get_analytics(user: Dict = Depends(verify_token)):
    """Get basic analytics"""
    return await make_php_request("analytics", "GET", headers={"Authorization": f"Bearer {user.get('token')}"})

@app.get("/api/analytics/dashboard")
async def get_dashboard(user: Dict = Depends(verify_token)):
    """Get analytics dashboard"""
    return await make_php_request("analytics/dashboard", "GET", headers={"Authorization": f"Bearer {user.get('token')}"})

@app.get("/api/analytics/{survey_id}")
async def get_survey_analytics(survey_id: int, user: Dict = Depends(verify_token)):
    """Get survey-specific analytics"""
    return await make_php_request(f"analytics/{survey_id}", "GET", headers={"Authorization": f"Bearer {user.get('token')}"})

# Upload endpoints
@app.post("/api/upload")
async def upload_file(file: Any, user: Dict = Depends(verify_token)):
    """Upload file"""
    # Note: File upload handling would need to be implemented differently
    # This is a placeholder for the concept
    return await make_php_request("upload", "POST", headers={"Authorization": f"Bearer {user.get('token')}"})

# Responses endpoints
@app.get("/api/responses")
async def get_responses(user: Dict = Depends(verify_token)):
    """Get all responses"""
    return await make_php_request("responses", "GET", headers={"Authorization": f"Bearer {user.get('token')}"})

@app.get("/api/responses/{response_id}")
async def get_response(response_id: int, user: Dict = Depends(verify_token)):
    """Get specific response"""
    return await make_php_request(f"responses/{response_id}", "GET", headers={"Authorization": f"Bearer {user.get('token')}"})

@app.post("/api/responses")
async def create_response(response_data: ResponseCreate, user: Dict = Depends(verify_token)):
    """Create new response"""
    return await make_php_request("responses", "POST", data=response_data.dict(), headers={"Authorization": f"Bearer {user.get('token')}"})

@app.delete("/api/responses/{response_id}")
async def delete_response(response_id: int, user: Dict = Depends(verify_token)):
    """Delete response"""
    return await make_php_request(f"responses/{response_id}", "DELETE", headers={"Authorization": f"Bearer {user.get('token')}"})

# Questions endpoints
@app.get("/api/questions")
async def get_questions(user: Dict = Depends(verify_token)):
    """Get all questions"""
    return await make_php_request("questions", "GET", headers={"Authorization": f"Bearer {user.get('token')}"})

@app.get("/api/questions/{question_id}")
async def get_question(question_id: int, user: Dict = Depends(verify_token)):
    """Get specific question"""
    return await make_php_request(f"questions/{question_id}", "GET", headers={"Authorization": f"Bearer {user.get('token')}"})

@app.post("/api/questions")
async def create_question(question_data: Dict[str, Any], user: Dict = Depends(verify_token)):
    """Create new question"""
    return await make_php_request("questions", "POST", data=question_data, headers={"Authorization": f"Bearer {user.get('token')}"})

@app.put("/api/questions/{question_id}")
async def update_question(question_id: int, question_data: Dict[str, Any], user: Dict = Depends(verify_token)):
    """Update existing question"""
    return await make_php_request(f"questions/{question_id}", "PUT", data=question_data, headers={"Authorization": f"Bearer {user.get('token')}"})

@app.delete("/api/questions/{question_id}")
async def delete_question(question_id: int, user: Dict = Depends(verify_token)):
    """Delete question"""
    return await make_php_request(f"questions/{question_id}", "DELETE", headers={"Authorization": f"Bearer {user.get('token')}"})

# Tasks endpoints
@app.get("/api/tasks")
async def get_tasks(user: Dict = Depends(verify_token)):
    """Get all tasks"""
    return await make_php_request("tasks", "GET", headers={"Authorization": f"Bearer {user.get('token')}"})

@app.get("/api/tasks/{task_id}")
async def get_task(task_id: int, user: Dict = Depends(verify_token)):
    """Get specific task"""
    return await make_php_request(f"tasks/{task_id}", "GET", headers={"Authorization": f"Bearer {user.get('token')}"})

@app.post("/api/tasks")
async def create_task(task_data: Dict[str, Any], user: Dict = Depends(verify_token)):
    """Create new task"""
    return await make_php_request("tasks", "POST", data=task_data, headers={"Authorization": f"Bearer {user.get('token')}"})

@app.put("/api/tasks/{task_id}")
async def update_task(task_id: int, task_data: Dict[str, Any], user: Dict = Depends(verify_token)):
    """Update existing task"""
    return await make_php_request(f"tasks/{task_id}", "PUT", data=task_data, headers={"Authorization": f"Bearer {user.get('token')}"})

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: int, user: Dict = Depends(verify_token)):
    """Delete task"""
    return await make_php_request(f"tasks/{task_id}", "DELETE", headers={"Authorization": f"Bearer {user.get('token')}"})

# Users endpoints
@app.get("/api/users")
async def get_users(user: Dict = Depends(verify_token)):
    """Get all users"""
    return await make_php_request("users", "GET", headers={"Authorization": f"Bearer {user.get('token')}"})

@app.get("/api/users/{user_id}")
async def get_user(user_id: int, user: Dict = Depends(verify_token)):
    """Get specific user"""
    return await make_php_request(f"users/{user_id}", "GET", headers={"Authorization": f"Bearer {user.get('token')}"})

@app.put("/api/users/{user_id}")
async def update_user(user_id: int, user_data: Dict[str, Any], user: Dict = Depends(verify_token)):
    """Update existing user"""
    return await make_php_request(f"users/{user_id}", "PUT", data=user_data, headers={"Authorization": f"Bearer {user.get('token')}"})

@app.delete("/api/users/{user_id}")
async def delete_user(user_id: int, user: Dict = Depends(verify_token)):
    """Delete user"""
    return await make_php_request(f"users/{user_id}", "DELETE", headers={"Authorization": f"Bearer {user.get('token')}"})

# Public endpoints (no authentication required)
@app.get("/api/public/surveys")
async def get_public_surveys():
    """Get all public surveys"""
    return await make_php_request("public/surveys", "GET")

@app.get("/api/public/surveys/{survey_id}")
async def get_public_survey(survey_id: int):
    """Get specific public survey"""
    return await make_php_request(f"public/surveys/{survey_id}", "GET")

@app.post("/api/public/surveys/{survey_id}/submit")
async def submit_public_survey(survey_id: int, response_data: Dict[str, Any]):
    """Submit public survey responses"""
    return await make_php_request(f"public/surveys/{survey_id}/submit", "POST", data=response_data)

@app.get("/api/upload/{filename}")
async def download_file(filename: str, user: Dict = Depends(verify_token)):
    """Download file"""
    return await make_php_request(f"upload/{filename}", "GET", headers={"Authorization": f"Bearer {user.get('token')}"})

@app.delete("/api/upload/{filename}")
async def delete_file(filename: str, user: Dict = Depends(verify_token)):
    """Delete file"""
    return await make_php_request(f"upload/{filename}", "DELETE", headers={"Authorization": f"Bearer {user.get('token')}"})

# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return {
        "error": "Internal server error",
        "detail": str(exc),
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(
        "fastapi_integration:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
