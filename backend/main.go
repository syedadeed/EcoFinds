package main

import(
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"encoding/json"
	"time"
	_ "github.com/lib/pq"
)

var db *sql.DB

type LoginRequest struct{
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SignupRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func connectDB() *sql.DB{
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)
	db, _ := sql.Open("postgres", dsn)
	return db
}



func initDB() {
	usersTable := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		email TEXT NOT NULL UNIQUE,
		password TEXT NOT NULL
	);
	`

	sessionsTable := `
	CREATE TABLE IF NOT EXISTS sessions (
		id INT PRIMARY KEY,
		session_token TEXT NOT NULL UNIQUE,
		FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
	);
	`
	userInfoTable := `
	CREATE TABLE IF NOT EXISTS user_info (
		id INT PRIMARY KEY,
		name TEXT NOT NULL,
		email TEXT NOT NULL UNIQUE,
		FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
	);
	`

	db.Exec(usersTable)
	db.Exec(sessionsTable)
	db.Exec(userInfoTable)
}

func login(w http.ResponseWriter, r *http.Request){
	var req LoginRequest;
	json.NewDecoder(r.Body).Decode(&req)
	var exists bool
	db.QueryRow(
		"SELECT EXISTS(SELECT 1 FROM users WHERE email=$1 AND password=$2)",
		req.Email, req.Password,
	).Scan(&exists)
	if !exists {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "error",
			"message": "invalid email or password",
		})
		return
	}
	var userID int
	db.QueryRow(
		"SELECT id FROM users WHERE email=$1 AND password=$2",
		req.Email, req.Password,
	).Scan(&userID)
	sessionToken := fmt.Sprintf("%d-%d", userID, time.Now().UnixNano())
	db.Exec(`
		INSERT INTO sessions (id, session_token)
		VALUES ($1, $2)
		ON CONFLICT (id) DO UPDATE SET session_token = EXCLUDED.session_token
	`, userID, sessionToken)
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    sessionToken,
		Path:     "/",
		HttpOnly: true,
	})
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "login successful",
	})
}

func signup(w http.ResponseWriter, r *http.Request) {
	var req SignupRequest
	json.NewDecoder(r.Body).Decode(&req)
	var exists bool
	db.QueryRow(
		"SELECT EXISTS(SELECT 1 FROM user_info WHERE email=$1)",
		req.Email,
	).Scan(&exists)
	if exists {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "error",
			"message": "email already exists",
		})
		return
	}
	var userID int
	db.QueryRow(
		"INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id",
		req.Email, req.Password,
	).Scan(&userID)
	db.Exec(
		"INSERT INTO user_info (id, name, email) VALUES ($1, $2, $3)",
		userID, req.Name, req.Email,
	)
	sessionToken := fmt.Sprintf("%d-%d", userID, time.Now().UnixNano())
	db.Exec(`
		INSERT INTO sessions (id, session_token)
		VALUES ($1, $2)
		ON CONFLICT (id) DO UPDATE SET session_token = EXCLUDED.session_token
	`, userID, sessionToken)
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    sessionToken,
		Path:     "/",
		HttpOnly: true,
	})
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "signup successful",
	})
}

func logout(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_token")
	if err != nil{
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "error",
			"message": "no session cookie provided",
		})
		return
	}
	db.Exec("DELETE FROM sessions WHERE session_token = $1", cookie.Value)
	http.SetCookie(w, &http.Cookie{
		Name:     "session_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
	})
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "logout successful",
	})
}

func main(){
	db = connectDB()
	initDB()
	http.HandleFunc("POST /login", login)
	http.HandleFunc("POST /signup", signup)
	http.HandleFunc("POST /logout", logout)
	port := os.Getenv("PORT")
	http.ListenAndServe(port, nil)
}
