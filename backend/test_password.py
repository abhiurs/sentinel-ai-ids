from utils.password_helper import hash_password, verify_password

password = "Abhi@123"

hashed = hash_password(password)

print("Original Password :", password)
print("Hashed Password   :", hashed)

print("Correct Password :", verify_password("Abhi@123", hashed))
print("Wrong Password   :", verify_password("Hello123", hashed))