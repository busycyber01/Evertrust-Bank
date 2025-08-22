// Check if user is logged in and is admin
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) {
    window.location.href = 'login.html';
} else if (!user.isAdmin) {
    alert('Access denied. Admin privileges required.');
    window.location.href = 'dashboard.html';
}

// Set admin data
document.getElementById('adminName').textContent = user.name || 'Admin';
document.getElementById('topAdminName').textContent = user.name || 'Admin';
document.getElementById('adminInitials').textContent = user.name ? user.name.split(' ').map(n => n[0]).join('') : 'A';

// Mobile sidebar toggle
document.getElementById('menu-btn').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('active');
});

document.getElementById('close-sidebar').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.remove('active');
});

// Logout functionality
document.getElementById('adminLogoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});

// Refresh buttons
document.getElementById('refreshRequests').addEventListener('click', loadFundRequests);
document.getElementById('refreshUsers').addEventListener('click', loadUsers);
document.getElementById('refreshTransactions').addEventListener('click', loadTransactions);

// Add Funds Modal
document.getElementById('cancelAddFunds').addEventListener('click', function() {
    document.getElementById('addFundsModal').classList.add('hidden');
});

document.getElementById('addFundsForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const userId = document.getElementById('addFundsUserId').value;
    const amount = parseFloat(document.getElementById('addFundsAmount').value);
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    try {
        const response = await adminAPI.addFunds(userId, amount);
        alert('Funds added successfully!');
        document.getElementById('addFundsModal').classList.add('hidden');
        document.getElementById('addFundsForm').reset();
        loadUsers(); // Refresh users list
    } catch (error) {
        console.error('Error adding funds:', error);
        alert('Error adding funds. Please try again.');
    }
});

// Load admin data
async function loadAdminData() {
    try {
        await Promise.all([
            loadFundRequests(),
            loadUsers(),
            loadTransactions(),
            loadStats()
        ]);
    } catch (error) {
        console.error('Error loading admin data:', error);
    }
}

// Load fund requests
async function loadFundRequests() {
    try {
        const requests = await adminAPI.getFundRequests();
        const requestsTable = document.getElementById('fundRequestsTable');
        const pendingRequests = requests.filter(req => req.status === 'pending');
        
        document.getElementById('pendingRequests').textContent = pendingRequests.length;
        document.getElementById('notificationCount').textContent = pendingRequests.length;
        
        if (requests.length === 0) {
            requestsTable.innerHTML = `
                <tr>
                    <td colspan="6" class="py-8 text-center text-gray-500">
                        <i class="fas fa-money-check text-3xl mb-3 text-gray-300"></i>
                        <p>No fund requests found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        requestsTable.innerHTML = '';
        requests.forEach(request => {
            const row = document.createElement('tr');
            row.className = 'border-b';
            
            const statusClass = request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              request.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800';
            
            row.innerHTML = `
                <td class="py-4">
                    <div>
                        <p class="font-medium">${request.user_name}</p>
                        <p class="text-sm text-gray-600">${request.email}</p>
                    </div>
                </td>
                <td class="py-4">$${parseFloat(request.amount).toFixed(2)}</td>
                <td class="py-4">${request.reason || 'No reason provided'}</td>
                <td class="py-4">${new Date(request.created_at).toLocaleDateString()}</td>
                <td class="py-4"><span class="px-2 py-1 ${statusClass} text-xs rounded-full">${request.status}</span></td>
                <td class="py-4">
                    ${request.status === 'pending' ? `
                    <div class="flex space-x-2">
                        <button class="approve-btn px-2 py-1 bg-success text-white rounded text-xs hover:bg-green-700 transition" data-id="${request.id}">Approve</button>
                        <button class="reject-btn px-2 py-1 bg-error text-white rounded text-xs hover:bg-red-700 transition" data-id="${request.id}">Reject</button>
                    </div>
                    ` : '—'}
                </td>
            `;
            
            requestsTable.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.approve-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const requestId = this.getAttribute('data-id');
                approveRequest(requestId);
            });
        });
        
        document.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const requestId = this.getAttribute('data-id');
                rejectRequest(requestId);
            });
        });
        
    } catch (error) {
        console.error('Error loading fund requests:', error);
    }
}

// Load users
async function loadUsers() {
    try {
        const users = await adminAPI.getUsers();
        const usersTable = document.getElementById('usersTable');
        
        document.getElementById('totalUsers').textContent = users.length;
        
        if (users.length === 0) {
            usersTable.innerHTML = `
                <tr>
                    <td colspan="5" class="py-8 text-center text-gray-500">
                        <i class="fas fa-users text-3xl mb-3 text-gray-300"></i>
                        <p>No users found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        usersTable.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.className = 'border-b';
            
            row.innerHTML = `
                <td class="py-4">
                    <div>
                        <p class="font-medium">${user.name}</p>
                        <p class="text-sm text-gray-600">${user.is_admin ? 'Admin' : 'User'}</p>
                    </div>
                </td>
                <td class="py-4">${user.email}</td>
                <td class="py-4">$${parseFloat(user.balance).toFixed(2)}</td>
                <td class="py-4">${new Date(user.created_at).toLocaleDateString()}</td>
                <td class="py-4">
                    <button class="add-funds-btn px-2 py-1 bg-primary text-white rounded text-xs hover:bg-primary-dark transition" data-id="${user.id}" data-name="${user.name}">Add Funds</button>
                </td>
            `;
            
            usersTable.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.add-funds-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                const userName = this.getAttribute('data-name');
                openAddFundsModal(userId, userName);
            });
        });
        
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Load transactions
async function loadTransactions() {
    try {
        const transactions = await adminAPI.getTransactions();
        const transactionsTable = document.getElementById('transactionsTable');
        
        document.getElementById('totalTransactions').textContent = transactions.length;
        
        if (transactions.length === 0) {
            transactionsTable.innerHTML = `
                <tr>
                    <td colspan="6" class="py-8 text-center text-gray-500">
                        <i class="fas fa-exchange-alt text-3xl mb-3 text-gray-300"></i>
                        <p>No transactions found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        transactionsTable.innerHTML = '';
        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.className = 'border-b';
            
            const amountClass = transaction.type === 'deposit' || transaction.type === 'funding' ? 'text-success' : 'text-error';
            const sign = transaction.type === 'deposit' || transaction.type === 'funding' ? '+' : '-';
            
            row.innerHTML = `
                <td class="py-4">
                    <div>
                        <p class="font-medium">${transaction.user_name}</p>
                        <p class="text-sm text-gray-600">${transaction.user_email}</p>
                    </div>
                </td>
                <td class="py-4 capitalize">${transaction.type}</td>
                <td class="py-4 ${amountClass} font-medium">${sign}$${parseFloat(transaction.amount).toFixed(2)}</td>
                <td class="py-4">${transaction.description || '—'}</td>
                <td class="py-4">${new Date(transaction.created_at).toLocaleDateString()}</td>
                <td class="py-4"><span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">${transaction.status}</span></td>
            `;
            
            transactionsTable.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// Load stats
async function loadStats() {
    try {
        const users = await adminAPI.getUsers();
        let totalBalance = 0;
        
        users.forEach(user => {
            totalBalance += parseFloat(user.balance);
        });
        
        document.getElementById('totalBalance').textContent = `$${totalBalance.toFixed(2)}`;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Approve fund request
async function approveRequest(requestId) {
    try {
        const response = await adminAPI.approveRequest(requestId);
        alert('Fund request approved successfully!');
        loadFundRequests();
        loadStats();
    } catch (error) {
        console.error('Error approving request:', error);
        alert('Error approving request. Please try again.');
    }
}

// Reject fund request
async function rejectRequest(requestId) {
    try {
        const response = await adminAPI.rejectRequest(requestId);
        alert('Fund request rejected!');
        loadFundRequests();
    } catch (error) {
        console.error('Error rejecting request:', error);
        alert('Error rejecting request. Please try again.');
    }
}

// Open add funds modal
function openAddFundsModal(userId, userName) {
    document.getElementById('addFundsUserId').value = userId;
    document.getElementById('addFundsUserName').textContent = userName;
    document.getElementById('addFundsModal').classList.remove('hidden');
}

// Initialize admin panel
loadAdminData();