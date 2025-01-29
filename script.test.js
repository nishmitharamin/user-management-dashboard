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

  // Event listener for form submission
  form.addEventListener("submit", (event) => {
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

    // Enhanced Validation
    if (!firstName || !email) {
      alert("First Name and Email are required fields."); // Alert if required fields are missing
      return;
    }

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address."); // Alert if email is invalid
      return;
    }

    if (
      firstName.length > 50 ||
      lastName.length > 50 ||
      department.length > 50
    ) {
      alert("Name and department fields cannot exceed 50 characters."); // Alert if fields exceed character limit
      return;
    }

    // Duplicate Check (using email as unique identifier)
    if (
      form.dataset.editIndex === undefined &&
      users.some((user) => user.email === email)
    ) {
      alert("A user with this email address already exists."); // Alert if email already exists
      return;
    }

    if (form.dataset.editIndex !== undefined) {
      const index = parseInt(form.dataset.editIndex);
      if (users.some((user, i) => i !== index && user.email === email)) {
        alert("A user with this email address already exists."); // Alert if email already exists for another user
        return;
      }
    }

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
  });

  // Event listener for clicks on the table
  tableBody.addEventListener("click", (event) => {
    if (event.target.classList.contains("edit")) {
      const row = event.target.closest("tr"); // Get the closest row to the clicked edit button
      const index = row.rowIndex - 1; // Get the index of the user to edit
      const userId = users[index].id; // Get the user ID
      editUser(userId, index); // Call edit function
    } else if (event.target.classList.contains("delete")) {
      const row = event.target.closest("tr"); // Get the closest row to the clicked delete button
      const index = row.rowIndex - 1; // Get the index of the user to delete
      const userId = users[index].id; // Get the user ID
      deleteUser(userId, index); // Call delete function
    }
  });

  // Event listener for search input
  searchInput.addEventListener("input", () => {
    filterUsers(searchInput.value); // Filter users based on search input
  });

  // Function to make API requests
  async function makeApiRequest(url, options = {}) {
    try {
      const response = await fetch(url, options); // Fetch data from the API
      if (!response.ok) {
        const errorText = await response.text(); // Get error text from response
        const errorMessage = `HTTP error! status: ${response.status}, message: ${errorText}`;
        console.error(errorMessage); // Log error message
        if (response.status === 400) {
          throw new Error("Bad Request. Please check your input."); // Handle bad request
        } else if (response.status === 500) {
          throw new Error("Internal Server Error. Please try again later."); // Handle server error
        } else {
          throw new Error("A problem occurred. Please try again later."); // Handle other errors
        }
      }
      return await response.json(); // Return the JSON response
    } catch (error) {
      console.error(`API Error: ${error}`); // Log API error
      alert(error.message); // Alert user of the error
      throw error; // Rethrow the error for further handling
    }
  }

  // Function to fetch users from the API
  async function fetchUsers() {
    try {
      users = await makeApiRequest(apiUrl); // Make API request to fetch users
      renderTable(users); // Render the fetched users in the table
    } catch (error) {
      console.error("Error in fetchUsers:", error); // Log error in fetching users
    }
  }

  // Function to add a new user via API
  async function addUser(newUser) {
    try {
      const addedUser = await makeApiRequest(apiUrl, {
        method: "POST", // HTTP method for adding a user
        headers: { "Content-Type": "application/json" }, // Set content type to JSON
        body: JSON.stringify(newUser), // Send new user data as JSON
      });
      users.push(addedUser); // Add the new user to the users array
      renderTable(users); // Re-render the table with updated users
      form.reset(); // Reset the form fields
    } catch (error) {
      console.error("Error in addUser :", error); // Log error in adding user
    }
  }

  // Function to update an existing user via API
  async function updateUser(userId, index, updatedUser) {
    try {
      const user = await makeApiRequest(`${apiUrl}/${userId}`, {
        method: "PUT", // HTTP method for updating a user
        headers: { "Content-Type": "application/json" }, // Set content type to JSON
        body: JSON.stringify(updatedUser), // Send updated user data as JSON
      });
      users[index] = user; // Update the user in the users array
      renderTable(users); // Re-render the table with updated users
      form.reset(); // Reset the form fields
      delete form.dataset.editIndex; // Clear the edit index
      form.querySelector('button[type="submit"]').textContent = "Submit"; // Reset button text
    } catch (error) {
      console.error("Error in updateUser :", error); // Log error in updating user
    }
  }

  // Function to delete a user via API
  async function deleteUser(userId, index) {
    try {
      await makeApiRequest(`${apiUrl}/${userId}`, { method: "DELETE" }); // Send delete request
      users.splice(index, 1); // Remove the user from the users array
      renderTable(users); // Re-render the table with updated users
    } catch (error) {
      console.error("Error in deleteUser :", error); // Log error in deleting user
    }
  }

  // Function to filter users based on search term
  function filterUsers(searchTerm) {
    const filteredUsers = users.filter((user) => {
      return Object.values(user).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    renderTable(filteredUsers); // Render the filtered users in the table
  }

  // Function to render the user table
  function renderTable(usersToRender) {
    tableBody.innerHTML = ""; // Clear existing table rows

    usersToRender.forEach((user, index) => {
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
        cell.textContent = propertyValue; // Set cell text content
      });

      // Create action buttons for editing and deleting the user
      const actionsCell = row.insertCell();
      actionsCell.innerHTML = `
                  <button class="edit" data-user-id="${user.id}">EDIT</button> 
                  <button class="delete" data-user-id="${user.id}">DELETE</button>
              `;
    });
  }

  // Function to populate the form with user data for editing
  function editUser(userId, index) {
    const user = users[index]; // Get the user to edit
    const nameParts = user.name.split(" "); // Split name into parts
    document.getElementById("firstName").value = nameParts[0]; // Set first name
    document.getElementById("lastName").value = nameParts[1] || ""; // Set last name
    document.getElementById("email").value = user.email; // Set email
    document.getElementById("department").value = user.website; // Set department

    form.dataset.editIndex = index; // Store the index of the user being edited
    form.dataset.userId = userId; // Store the user ID
    form.querySelector('button[type="submit"]').textContent = "Update"; // Change button text to "Update"
  }

  // Function to validate email format using regex
  function isValidEmail(email) {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
      email
    ); // Simple regex for email validation
  }

  // Function to escape HTML special characters to prevent XSS
  function escapeHtml(unsafe) {
    return unsafe.replace(/[&<>"']/g, function (m) {
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
});
