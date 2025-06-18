# Static File Serving with Chainlit - The CORRECT Way

## ❌ WRONG Approach (What NOT to do)

**DO NOT** try to access `cl.app` from within your Chainlit application:

```python
# ❌ THIS IS WRONG - DON'T DO THIS
import chainlit as cl
from fastapi.staticfiles import StaticFiles

def setup_file_serving():
    app = cl.app  # ❌ KeyError: 'app' 
    app.mount("/files", StaticFiles(directory="storage"), name="files")

setup_file_serving()  # ❌ This will fail
```

**Why this fails:**
- `cl.app` is not available during module initialization
- `context.session.app` doesn't exist (WebsocketSession has no 'app' attribute)
- You're trying to access Chainlit internals that aren't meant to be accessed this way

## ✅ CORRECT Approach (What TO do)

Create a **separate FastAPI app**, mount your static files on it, then mount Chainlit as a sub-application:

### 1. Create `main.py` (FastAPI wrapper)

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from chainlit.utils import mount_chainlit
import os

# Create the main FastAPI application
app = FastAPI(title="My App with Chainlit")

# Ensure storage directory exists
storage_path = "./storage"
os.makedirs(storage_path, exist_ok=True)

# Mount static files FIRST
app.mount("/files", StaticFiles(directory=storage_path), name="files")

# Add any other FastAPI endpoints you need
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Mount Chainlit as a sub-application
mount_chainlit(app=app, target="app.py", path="/")
```

### 2. Keep your Chainlit app clean (`app.py`)

```python
import chainlit as cl

@cl.on_chat_start
async def start():
    await cl.Message(content="Hello! Files can be accessed at /files/").send()

@cl.on_message
async def main(message: cl.Message):
    # Your Chainlit logic here
    await cl.Message(content=f"You said: {message.content}").send()
```

### 3. Run with uvicorn

```bash
# Run the FastAPI app (which includes Chainlit)
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🏗️ Project Structure

```
your-project/
├── main.py          # FastAPI wrapper with static files
├── app.py           # Pure Chainlit application
├── storage/         # Directory for static files
│   ├── file1.jpg
│   └── file2.pdf
└── requirements.txt
```

## 🚀 Running the Application

### Option 1: Direct uvicorn command
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Option 2: Using the provided script
```bash
python run_correct.py
```

### Option 3: Docker Compose
```bash
docker-compose up
```

## 🌐 Accessing Your Application

- **Chainlit Chat Interface**: http://localhost:8000/
- **Static Files**: http://localhost:8000/files/filename.ext
- **Health Check**: http://localhost:8000/health
- **FastAPI Docs**: http://localhost:8000/docs

## 🔍 Key Benefits of This Approach

1. **Clean Separation**: FastAPI handles routing, static files, and other HTTP concerns
2. **Proper Architecture**: Chainlit focuses purely on chat functionality
3. **Scalable**: Easy to add more FastAPI endpoints, middleware, etc.
4. **Standard**: Follows FastAPI and Chainlit best practices
5. **No Hacks**: No attempts to access internal Chainlit objects

## 🐛 Common Issues and Solutions

### Issue: "KeyError: 'app'"
**Solution**: Don't try to access `cl.app`. Use the FastAPI wrapper approach above.

### Issue: "'WebsocketSession' object has no attribute 'app'"
**Solution**: Don't try to access the app through `context.session.app`. Use the FastAPI wrapper.

### Issue: Static files not serving
**Solution**: Make sure you mount static files on the main FastAPI app, not inside Chainlit.

### Issue: Chainlit not accessible
**Solution**: Ensure you're mounting Chainlit correctly with `mount_chainlit()`.

## 📚 Additional Resources

- [FastAPI Static Files Documentation](https://fastapi.tiangolo.com/tutorial/static-files/)
- [Chainlit FastAPI Integration](https://docs.chainlit.io/integrations/fastapi)
- [FastAPI Sub Applications](https://fastapi.tiangolo.com/advanced/sub-applications/)

## 🎯 Summary

**Remember**: Create a FastAPI app, mount your static files on it, then mount Chainlit. Don't try to access Chainlit's internal FastAPI instance - that's not how it's designed to work. 