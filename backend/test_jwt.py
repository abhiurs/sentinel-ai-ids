from utils.jwt_helper import generate_token, verify_token

user = {
    "_id": "12345",
    "username": "Abhi",
    "email": "abhi@gmail.com",
    "role": "SOC Analyst"
}

token = generate_token(user)

print("Generated Token:\n")
print(token)

print("\nDecoded Payload:\n")
print(verify_token(token))