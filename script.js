document.addEventListener("DOMContentLoaded", () => {
  // Get references to the form, table body, search input, and API URL
  const form = document.getElementById("userForm");
  const tableBody = document
    .getElementById("userTable")
    .getElementsByTagName("tbody")[0];
  const searchInput = document.getElementById("search");
  const apiUrl = "https://jsonplaceholder.typicode.com/users";

  let users = []; // Array to hold user data

  fetchUsers(); // Fetch initial user data from the API

  // Event listeners for form submission, table actions, and search input
  form.addEventListener("submit", handleSubmit);
  tableBody.addEventListener("click", handleTableClick);
  searchInput.addEventListener("input", handleSearchInput);

  // Function to fetch users from the API
  async function fetchUsers() {
    try {
      users = await makeApiRequest(apiUrl); // Make API request to fetch users
      renderTable(users); // Render the fetched users in the table
    } catch (error) {
      console.error("Error fetching users:", error);
      displayError("Failed to fetch users. Please try again later.", "general");
    }
  }

  // Handle form submission to add or update a user
  function handleSubmit(event) {
    event.preventDefault(); // Prevent default form submission behavior

    // Get and sanitize user input values
    const firstName = escapeHtml(
      document.getElementById("firstName").value.trim()
    );
    const lastName = escapeHtml(
      document.getElementById("lastName").value.trim()
    );
    const email = escapeHtml(document.getElementById("email").value.trim());
    const department = escapeHtml(
      document.getElementById("department").value.trim()
    );

    // Validate the form inputs
    if (!validateForm(firstName, email, department)) return;

    // Create a new user object
    const newUser = {
      name: `${firstName} ${lastName}`,
      email,
      phone: "", // Placeholder for phone number
      website: department,
    };

    // Check if we are editing an existing user or adding a new one
    if (form.dataset.editIndex !== undefined) {
      const index = parseInt(form.dataset.editIndex);
      const userId = users[index].id; // Get the ID of the user to update
      updateUser(userId, index, newUser); // Update the user
    } else {
      addUser(newUser); // Add a new user
    }
  }

  // Validate form inputs before submission
  function validateForm(firstName, email, department) {
    let isValid = true; // Flag to track form validity

    // Check for required fields and validate email format
    if (!firstName) {
      displayError("First Name is required.", "firstName");
      isValid = false;
    }
    if (!email) {
      displayError("Email is required.", "email");
      isValid = false;
    } else if (!isValidEmail(email)) {
      displayError("Invalid email format.", "email");
      isValid = false;
    }
    if (firstName.length > 50 || department.length > 50) {
      displayError(
        "First Name and Department cannot exceed 50 characters.",
        "firstName"
      );
      isValid = false;
    }

    // Check for duplicate email addresses
    const isDuplicate =
      form.dataset.editIndex === undefined
        ? users.some((user) => user.email === email)
        : users.some(
            (user, i) =>
              i !== parseInt(form.dataset.editIndex) && user.email === email
          );

    if (isDuplicate) {
      displayError("A user with this email already exists.", "email");
      isValid = false;
    }

    return isValid; // Return the validity of the form
  }

  // Handle clicks on the table for editing or deleting users
  function handleTableClick(event) {
    const target = event.target;
    if (target.classList.contains("edit")) {
      const row = target.closest("tr");
      const index = row.rowIndex - 1; // Get the index of the user to edit
      const user = users[index];
      editUser(user, index); // Call edit function
    } else if (target.classList.contains("delete")) {
      const row = target.closest("tr");
      const index = row.rowIndex - 1; // Get the index of the user to delete
      const userId = users[index].id;
      deleteUser(userId, index); // Call delete function
    }
  }

  // Handle input in the search field to filter users
  function handleSearchInput() {
    filterUsers(searchInput.value); // Filter users based on search input
  }

  // Function to make API requests
  async function makeApiRequest(url, options = {}) {
    try {
      const response = await fetch(url, options); // Fetch data from the API
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      return await response.json(); // Return the JSON response
    } catch (error) {
      console.error("API request error:", error);
      displayError(
        "A network error occurred. Please try again later.",
        "general"
      );
      throw error; // Rethrow the error for further handling
    }
  }

  // Function to add a new user via API
  async function addUser(newUser) {
    try {
      const addedUser = await makeApiRequest(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser), // Send new user data as JSON
      });
      users.push(addedUser); // Add the new user to the users array
      renderTable(users); // Re-render the table with updated users
      form.reset(); // Reset the form fields
    } catch (error) {
      console.error("Error adding user:", error);
      displayError("Failed to add user. Please try again.", "general");
    }
  }

  // Function to update an existing user via API
  async function updateUser(userId, index, updatedUser) {
    try {
      const user = await makeApiRequest(`${apiUrl}/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser), // Send updated user data as JSON
      });
      users[index] = user; // Update the user in the users array
      renderTable(users); // Re-render the table with updated users
      form.reset(); // Reset the form fields
      delete form.dataset.editIndex; // Clear the edit index
      form.querySelector('button[type="submit"]').textContent = "Submit"; // Reset button text
    } catch (error) {
      console.error("Error updating user:", error);
      displayError("Failed to update user. Please try again.", "general");
    }
  }

  // Function to delete a user via API
  async function deleteUser(userId, index) {
    try {
      await makeApiRequest(`${apiUrl}/${userId}`, { method: "DELETE" }); // Send delete request
      users.splice(index, 1); // Remove the user from the users array
      renderTable(users); // Re-render the table with updated users
    } catch (error) {
      console.error("Error deleting user:", error);
      displayError("Failed to delete user. Please try again.", "general");
    }
  }

  // Function to filter users based on search term
  function filterUsers(searchTerm) {
    const filteredUsers = users.filter((user) =>
      Object.values(user).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    renderTable(filteredUsers); // Render the filtered users in the table
  }

  // Function to render the user table
  function renderTable(usersToRender) {
    tableBody.innerHTML = ""; // Clear existing table rows
    usersToRender.forEach((user) => {
      const row = tableBody.insertRow(); // Create a new row for each user
      const nameParts = user.name.split(" "); // Split name into parts
      const userData = [
        nameParts[0], // First name
        nameParts[1] || "", // Last name (if exists)
        user.email, // User email
        user.website, // User department (website)
      ];

      // Insert user data into the row
      userData.forEach((propertyValue) => {
        const cell = row.insertCell();
        cell.textContent = escapeHtml(propertyValue); // Escape HTML to prevent XSS
      });

      // Create action buttons for editing and deleting the user
      const actionsCell = row.insertCell();
      actionsCell.innerHTML = `
                  <button class="edit" data-user-id="${user.id}" aria-label="Edit ${user.name}">EDIT</button>
                  <button class="delete" data-user-id="${user.id}" aria-label="Delete ${user.name}">DELETE</button>
              `;
    });
  }

  // Function to populate the form with user data for editing
  function editUser(user, index) {
    const nameParts = user.name.split(" ");
    document.getElementById("firstName").value = nameParts[0]; // Set first name
    document.getElementById("lastName").value = nameParts[1] || ""; // Set last name
    document.getElementById("email").value = user.email; // Set email
    document.getElementById("department").value = user.website; // Set department

    form.dataset.editIndex = index; // Store the index of the user being edited
    form.dataset.userId = user.id; // Store the user ID
    form.querySelector('button[type="submit"]').textContent = "Update"; // Change button text to "Update"
  }

  // Function to validate email format using regex
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Simple regex for email validation
  }

  // Function to escape HTML special characters to prevent XSS
  function escapeHtml(unsafe) {
    return unsafe.replace(/[&<>"']/g, (m) => {
      switch (m) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#039;";
        default:
          return m;
      }
    });
  }

  // Function to display error messages
  function displayError(message, fieldId) {
    if (fieldId) {
      const errorSpan = document.getElementById(`${fieldId}Error`);
      if (errorSpan) {
        errorSpan.textContent = message; // Display error message next to the relevant field
      }
    } else {
      const errorArea = document.getElementById("errorArea");
      if (errorArea) {
        errorArea.textContent = message; // Display general error message
      } else {
        alert(message); // Fallback if no error area (for general errors)
      }
    }
  }
});
