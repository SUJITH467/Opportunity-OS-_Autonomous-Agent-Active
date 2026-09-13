from fastapi import APIRouter
from app.models.domain import StudentProfile
from app.repositories.database import repository

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("", response_model=StudentProfile)
def get_profile():
    return repository.students.get("stu_sujith_001")

@router.put("", response_model=StudentProfile)
def update_profile(updated_profile: StudentProfile):
    repository.students[updated_profile.student_id] = updated_profile
    return updated_profile
