import smtplib
from email.message import EmailMessage


from app.core.config import settings


def send_email(to_email: str, subject: str, body: str):
    try:
        msg = EmailMessage()

        msg["Subject"] = subject
        msg["From"] = settings.EMAIL_FROM
        msg["To"] = to_email

        msg.set_content(body)

        with smtplib.SMTP(
            settings.SMTP_HOST,
            settings.SMTP_PORT,
        ) as smtp:

            smtp.starttls()

            smtp.login(
                settings.SMTP_USER,
                settings.SMTP_PASSWORD,
            )

            smtp.send_message(msg)

    except Exception as e:
        print("EMAIL ERROR:", e)