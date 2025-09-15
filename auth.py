import sqlite3
import bcrypt

def verify_password(stored_password: str, provided_password: str) -> bool:
    return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password.encode('utf-8'))

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def get_auth_data() :
    conn = sqlite3.connect("auth.db")
    cursor = conn.cursor() 

    cursor.execute("SELECT * FROM login_auth")
    data = cursor.fetchall() 
    conn.close()

    auth_data = {}
    for row in data :
        auth_data[row[1]] = row[2]  # username: password
    
    return auth_data

def create_auth() :
    
    conn = sqlite3.connect("auth.db")
    cursor = conn.cursor() 

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS login_auth (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL
        )
    """)
    conn.commit()

    while True :
        auth_data = get_auth_data()
        username = input("Enter username (q for quit) (v to view data) (r to remove): ")
        if username.lower().strip() == 'q':
            break
        if username.lower().strip() == 'v':
            print("Current users in database : ")
            for user,passwd in auth_data.items() :
                print(f"Username : {user} | Password : {passwd}")
            continue

        if username.lower().strip() == 'r':
            del_user = input("Enter username to delete : ")
            if del_user in auth_data.keys() :
                cursor.execute("DELETE FROM login_auth WHERE username = ?", (del_user,))
                conn.commit()
                print(f"User {del_user} deleted.")
            else :
                print("Username not found.")
            continue

        if username in auth_data.keys() :
            print("Username already exists. Try a different one.")
            continue

        password = input("Enter password : ")
        confirm_password = input("Confirm password : ")


        if password == confirm_password:
            password = hash_password(password)
             # Store hashed password as string
            cursor.execute("INSERT INTO login_auth (username, password) VALUES (?, ?)", (username, password))
            conn.commit()
            print(f"User {username} added.")
        else:
            print("Passwords do not match.")


if __name__ == "__main__":
    create_auth() # TODO : add admin auth only , only admin can acccess

