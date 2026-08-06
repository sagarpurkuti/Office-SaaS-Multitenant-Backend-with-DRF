import secrets
import string

class PasswordService:
    @staticmethod
    def generate_strong_password(length=16):
        alphabet = string.ascii_letters + string.digits + string.punctuation
        while True:
            password = ''.join(secrets.choice(alphabet) for _ in range(length))
            # Ensure it has at least one uppercase, lowercase, digit, and symbol
            if (any(c.islower() for c in password) and
                any(c.isupper() for c in password) and
                any(c.isdigit() for c in password) and
                any(c in string.punctuation for c in password)):
                return password