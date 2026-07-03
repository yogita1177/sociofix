# 🏢 SocioFix Backend

SocioFix is a Society Management System backend built using **FastAPI** and **MongoDB**. It provides secure authentication, complaint management, notice management, and dashboard analytics for residents and administrators.

---

# 🚀 Features

## 🔐 Authentication
- User Registration
- User Login
- JWT Authentication
- Password Hashing (bcrypt)
- Current User Profile (/me)

## 📝 Complaint Management
- Create Complaint
- View My Complaints
- View Complaint Details
- Update Complaint
- Delete Complaint
- Update Complaint Status (Admin Only)

## 📢 Notice Management
- Create Notice (Admin Only)
- View All Notices
- View Notice Details
- Update Notice (Admin Only)
- Delete Notice (Admin Only)

## 📊 Dashboard
- Total Complaints
- Pending Complaints
- In Progress Complaints
- Resolved Complaints
- Total Notices

## 🔒 Security
- JWT Authentication
- Role-Based Authorization
- Password Encryption using bcrypt

---

# 🛠 Tech Stack

- Python 3.12
- FastAPI
- MongoDB Atlas
- PyMongo
- Passlib (bcrypt)
- Python-JOSE (JWT)
- Pydantic
- Uvicorn

---

# 📂 Project Structure

```
backend/
│
├── app/
│   ├── auth/
│   ├── complaints/
│   ├── notices/
│   ├── dashboard/
│   ├── core/
│   ├── database/
│   ├── utils/
│   ├── uploads/
│   └── main.py
│
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone <repository-url>
cd backend
```

## Create Virtual Environment

Windows

```bash
python -m venv venv
venv\Scripts\activate
```

Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 🔑 Environment Variables

Create a `.env` file in the backend directory.

Example:

```env
MONGO_URI=your_mongodb_connection_string
DATABASE_NAME=sociofix
JWT_SECRET=your_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

# ▶️ Running the Server

```bash
uvicorn app.main:app --reload
```

Server will start at:

```
http://127.0.0.1:8000
```

Swagger Documentation:

```
http://127.0.0.1:8000/docs
```

---

# 📚 API Modules

## Authentication

| Method | Endpoint |
|----------|--------------------------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| GET | /api/auth/me |

---

## Complaints

| Method | Endpoint |
|----------|--------------------------------|
| POST | /api/complaints/ |
| GET | /api/complaints/my |
| GET | /api/complaints/{complaint_id} |
| PUT | /api/complaints/{complaint_id} |
| DELETE | /api/complaints/{complaint_id} |
| PATCH | /api/complaints/{complaint_id}/status |

---

## Notices

| Method | Endpoint |
|----------|--------------------------|
| GET | /api/notices/ |
| POST | /api/notices/ |
| GET | /api/notices/{notice_id} |
| PUT | /api/notices/{notice_id} |
| DELETE | /api/notices/{notice_id} |

---

## Dashboard

| Method | Endpoint |
|----------|-------------------|
| GET | /api/dashboard/ |

---

# 🔐 Authentication

The project uses **JWT Bearer Tokens**.

1. Register a user.
2. Login to obtain an access token.
3. Click **Authorize** in Swagger.
4. Enter:

```
Bearer <your_access_token>
```

5. Access protected APIs.

---

# 📊 Database Collections

- users
- complaints
- notices

---

# 🧪 Testing

The APIs can be tested using:

- Swagger UI
- Postman
- Thunder Client

---

# 👩‍💻 Developer

**Yogita Chauhan**

B.Tech Computer Science Engineering

Pranveer Singh Institute of Technology (PSIT), Kanpur

---

# 📄 License

This project is developed for academic and learning purposes.