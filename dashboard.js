// Check if user is logged in
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) {
    window.location.href = 'login.html';
}

// Set user data
document.getElementById('userName').textContent = user.name || 'User';
document.getElementById('userEmail').textContent = user.email || '';
document.getElementById('topUserName').textContent = user.name || 'User';
document.getElementById('userInitials').textContent = user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U';

// Mobile sidebar toggle
document.getElementById('menu-btn').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('active');
});

document.getElementById('close-sidebar').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.remove('active');
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
});

// Request funds modal
document.getElementById('requestFundsBtn').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('requestModal').classList.remove('hidden');
});

document.getElementById('quickRequestBtn').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('requestModal').classList.remove('hidden');
});

document.getElementById('cancelRequest').addEventListener('click', function() {
    document.getElementById('requestModal').classList.add('hidden');
});

// Request funds form submission
document.getElementById('requestForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const amount = document.getElementById('amount').value;
    const reason = document.getElementById('reason').value;
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    try {
        await userAPI.requestFunds(parseFloat(amount), reason);
        alert('Fund request submitted successfully! Awaiting admin approval.');
        document.getElementById('requestModal').classList.add('hidden');
        document.getElementById('requestForm').reset();
        
        // Update pending requests count
        const pendingElement = document.getElementById('pendingRequests');
        pendingElement.textContent = parseInt(pendingElement.textContent) + 1;
        
        // Reload data
        loadUserData();
    } catch (error) {
        console.error('Error submitting request:', error);
        alert('Error submitting request. Please try again.');
    }
});

// Transfer functionality (you would add this to your dashboard)
async function handleTransfer(recipientEmail, amount, description) {
    try {
        await userAPI.transfer(recipientEmail, parseFloat(amount), description);
        alert('Transfer successful!');
        loadUserData();
    } catch (error) {
        console.error('Transfer error:', error);
        alert('Error processing transfer. Please try again.');
    }
}

// Withdraw functionality (you would add this to your dashboard)
async function handleWithdraw(amount, description) {
    try {
        await userAPI.withdraw(parseFloat(amount), description);
        alert('Withdrawal successful!');
        loadUserData();
    } catch (error) {
        console.error('Withdrawal error:', error);
        alert('Error processing withdrawal. Please try again.');
    }
}

// Load user data
async function loadUserData() {
    try {
        const [balanceData, transactionsData, requestsData] = await Promise.all([
            userAPI.getBalance(),
            userAPI.getTransactions(),
            userAPI.getFundRequests()
        ]);
        
        // Update balance
        document.getElementById('balanceAmount').textContent = `$${balanceData.balance.toFixed(2)}`;
        
        // Update transactions
        const transactionsTable = document.getElementById('transactionsTable');
        
        if (transactionsData.length > 0) {
            document.getElementById('transactionCount').textContent = transactionsData.length;
            
            transactionsTable.innerHTML = '';
            transactionsData.forEach(transaction => {
                const row = document.createElement('tr');
                row.className = 'border-b';
                
                const isPositive = transaction.type === 'deposit' || transaction.type === 'funding';
                const amountClass = isPositive ? 'text-success' : 'text-error';
                const iconClass = isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600';
                const icon = isPositive ? 'fa-arrow-down' : 'fa-arrow-up';
                
                row.innerHTML = `
                    <td class="py-4">
                        <div class="flex items-center">
                            <div class="${iconClass} p-2 rounded-full mr-3">
                                <i class="fas ${icon}"></i>
                            </div>
                            <div>
                                <p class="font-medium">${transaction.description}</p>
                                <p class="text-sm text-gray-600">${transaction.recipient_name || 'Evertrust Bank'}</p>
                            </div>
                        </div>
                    </td>
                    <td class="py-4">${new Date(transaction.created_at).toLocaleDateString()}</td>
                    <td class="py-4 ${amountClass} font-medium">${isPositive ? '+' : '-'}$${transaction.amount.toFixed(2)}</td>
                    <td class="py-4"><span class="px-2 py-1 ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} text-xs rounded-full">${transaction.status}</span></td>
                `;
                
                transactionsTable.appendChild(row);
            });
        }
        
        // Update pending requests count
        const pendingRequests = requestsData.filter(req => req.status === 'pending').length;
        document.getElementById('pendingRequests').textContent = pendingRequests;
        
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Initialize dashboard
loadUserData();