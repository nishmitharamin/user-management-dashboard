# user-management-dashboard


user-management-dashboard/
├── index.html
├── style.css
└── script.js
└── README.md  

Features:
View Users:Displays a list of users in a table format, including their first name, last name, email, and department.
Add User:Alows users to add new user information through a form.
Update User:Enables users to edit existing user information.
Delete User:Provides a way to delete user entries.
Search Users:Implements a search functionality to filter users based on various criteria.
Error Handling:Displays user-friendly error messages for form validation and API issues.
Data Persistence:Persists user data across sessions.

Technologies Used:
HTML
CSS
JavaScript (Vanilla)
JSONPlaceholder API (for mock user data)

 
 Installation:
1.  Clone the repository: `git clone https://github.com/YOUR_USERNAME/user-management-dashboard.git` (replace with your repo URL)
2.  Open the `index.html` file in your web browser.

   Deployement Link:https://nishmitha-amin-user-management.netlify.app/
   Please do refresh once after you copy paste this link


How to Use:
1. Adding a User: Fill in the "Add User" form with the user's details and click "SUBMIT".
2. Updating a User:Click the "EDIT" button in the user table row. The user's data will populate the form. Modify the data and click "SUBMIT" to update.
3. Deleting a User:Click the "DELETE" button in the user table row to remove the user.
4. Searching Users:Type your search term in the search bar to filter the user table.


Assumptions:
The JSONPlaceholder API is used for mock data. In a real application, you would replace this with your actual backend API.
Basic email validation is performed using a regular expression.  More robust validation might be required in a production environment. 
Input sanitization is done using `escapeHtml()` to prevent basic XSS attacks.  A more comprehensive security strategy should be implemented for real-world applications.

Future Improvements:
Implement server-side data persistence (e.g., using a database)
Improve the UI/UX with a more polished design.
Add unit tests.

