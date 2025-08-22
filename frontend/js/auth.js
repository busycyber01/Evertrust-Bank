// Signup form handling
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Simple validation
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (password.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
    }
    
    try {
        const response = await authAPI.signup({
            name: `${firstName} ${lastName}`,
            email,
            password
        });
        
        alert('Account created successfully! Please login.');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error creating account:', error);
        alert(error.message || 'Error creating account. Please try again.');
    }
});

// Login form handling
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await authAPI.login({
            email,
            password
        });
        
        // Store the token and user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Redirect based on user role
        if (response.user.isAdmin) {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    } catch (error) {
        console.error('Error logging in:', error);
        alert(error.message || 'Error logging in. Please try again.');
    }
});