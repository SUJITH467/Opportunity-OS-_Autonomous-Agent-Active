from typing import List
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.models.domain import StudentDocument, DocumentType
from app.repositories.database import repository
from app.services.storage_service import storage_service

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("", response_model=List[StudentDocument])
def list_documents():
    return list(repository.documents.values())

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    doc_type: DocumentType = Form(DocumentType.RESUME),
    name: str = Form(None)
):
    contents = await file.read()
    student_id = "stu_sujith_001"
    file_name = name or file.filename
    
    s3_key, s3_url = storage_service.upload_file(student_id, doc_type.value.lower(), file_name, contents)

    doc_id = f"doc_{int(repository.documents.__len__() + 1)}"
    new_doc = StudentDocument(
        document_id=doc_id,
        student_id=student_id,
        name=file_name,
        doc_type=doc_type,
        s3_key=s3_key,
        s3_url=s3_url,
        file_size_bytes=len(contents)
    )
    repository.documents[doc_id] = new_doc
    return new_doc

@router.delete("/{document_id}")
def delete_document(document_id: str):
    if document_id in repository.documents:
        del repository.documents[document_id]
        return {"status": "deleted", "document_id": document_id}
    raise HTTPException(status_code=404, detail="Document not found")
