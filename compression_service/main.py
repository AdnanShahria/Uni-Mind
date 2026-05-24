from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import Response, JSONResponse
from PIL import Image
import io
import zlib
import base64

app = FastAPI(title="UniMind Compression Microservice")

@app.post("/compress/image")
async def compress_image(file: UploadFile = File(...)):
    """
    Compresses an image losslessly.
    Returns the compressed image binary.
    """
    try:
        content = await file.read()
        image = Image.open(io.BytesIO(content))
        
        output = io.BytesIO()
        
        # Determine format. If PNG, keep PNG but optimize. Otherwise use lossless WebP.
        format = image.format
        if format == 'PNG':
            image.save(output, format='PNG', optimize=True)
            content_type = "image/png"
        else:
            # Convert to RGB if it's RGBA and we want to save as JPEG, but WebP handles RGBA
            image.save(output, format='WEBP', lossless=True, quality=100)
            content_type = "image/webp"
            
        compressed_bytes = output.getvalue()
        
        return Response(content=compressed_bytes, media_type=content_type)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image compression failed: {str(e)}")

@app.post("/compress/document")
async def compress_document(file: UploadFile = File(...)):
    """
    Compresses a document (PDF, TXT, etc.) using zlib.
    """
    try:
        content = await file.read()
        # Zlib compress (level 9 is max compression)
        compressed_content = zlib.compress(content, level=9)
        return Response(content=compressed_content, media_type="application/octet-stream")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Document compression failed: {str(e)}")

@app.post("/compress/text")
async def compress_text(text: str = Form(...)):
    """
    Compresses raw text (e.g. posts, comments) using zlib.
    Returns a Base64 encoded string.
    """
    try:
        # Convert text to bytes
        text_bytes = text.encode('utf-8')
        # Compress
        compressed_bytes = zlib.compress(text_bytes, level=9)
        # Encode as Base64 string for database storage
        b64_encoded = base64.b64encode(compressed_bytes).decode('utf-8')
        
        return JSONResponse(content={"compressed": b64_encoded})
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Text compression failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
