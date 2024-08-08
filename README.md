Project Description
This project is a web application developed using Node.js for the backend and React.js for the frontend.The platform's goal is to connect professionals with clients and the application provides authentication, project management, and purchase management functionalities.

Project Structure
The backend is organized with Express to handle HTTP routes, MongoDB as the database, and various libraries to manage specific functionalities such as authentication, image handling, and user verification.

APIs Used
Authentication (auth)
The authentication API manages user registration, login, phone and email verification, and password reset.

POST /auth/register/client: Registers a new client.
POST /auth/register/freelancer: Registers a new freelancer.
POST /auth/login: Logs in a user.
POST /auth/request-password-reset: Sends an email to reset the password.
POST /auth/reset-password: Resets the password using a token.
POST /auth/send-phone-code: Sends a verification code via SMS.
POST /auth/verify-phone-code: Verifies the code sent via SMS.
POST /auth/send-email-code: Sends a verification code via email.
POST /auth/verify-email-code: Verifies the code sent via email.
Project Management (projects)
The project management API allows creating, viewing, updating, and deleting projects.

POST /projects: Creates a new project.
GET /projects: Retrieves the list of projects.
GET /projects/
: Retrieves details of a specific project.
PUT /projects/
: Updates a specific project.
DELETE /projects/
: Deletes a specific project.
Purchase Management (purchases)
The purchase management API handles purchase operations.


External Services Used:

Twilio
Twilio is used for sending verification SMS.

Sending verification SMS: Utilized in the route POST /auth/send-phone-code to send verification codes to the user's phone number.
SendGrid
SendGrid is used for sending verification and password reset emails.

Sending verification email: Utilized in the route POST /auth/send-email-code to send verification codes to the user's email.
Sending password reset email: Utilized in the route POST /auth/request-password-reset to send a password reset link to the user's email.

Multer
Multer is used for handling profile image uploads during user registration.

Axios
Axios is used for making external HTTP requests, such as NIF verification via an external service.

NIF Verification: Utilized in the route GET /auth/nif-validate to verify the validity of the NIF through an external service.
