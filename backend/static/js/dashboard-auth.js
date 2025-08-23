// Dashboard authentication and role verification
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
          apiKey: "AIzaSyAcHatpOAsLj8iGidjBMDPd-H9qlny2Tz4",
          authDomain: "kingkiller-tech.firebaseapp.com",
          databaseURL: "https://kingkiller-tech-default-rtdb.firebaseio.com",
          projectId: "kingkiller-tech",
          storageBucket: "kingkiller-tech.firebasestorage.app",
          messagingSenderId: "38628416482",
          appId: "1:38628416482:web:5623ae3f0f77977efcf7bb",
          measurementId: "G-C6SYEWD5TW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Role-based access control
const ROLE_ROUTES = {
    pharmacist: 'pharmacist-dashboard.html',
    doctor: 'doctor-dashboard.html',
    student: 'student-dashboard.html',
    patient: 'patient-dashboard.html'
};

// Get current page role requirement
function getCurrentPageRole() {
    const currentPage = window.location.pathname.split('/').pop();
    for (const [role, route] of Object.entries(ROLE_ROUTES)) {
        if (currentPage === route) {
            return role;
        }
    }
    return null;
}

// Verify user access to current page
async function verifyAccess(user) {
    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
            throw new Error('User profile not found');
        }

        const userData = userDoc.data();
        const userRole = userData.role;
        const requiredRole = getCurrentPageRole();

        if (requiredRole && userRole !== requiredRole) {
            // Redirect to correct dashboard
            const correctRoute = ROLE_ROUTES[userRole];
            if (correctRoute) {
                window.location.href = correctRoute;
            } else {
                window.location.href = 'sisu.html';
            }
            return false;
        }

        // Set user data in localStorage and UI
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('userData', JSON.stringify(userData));
        updateUserInterface(userData);
        
        return true;
    } catch (error) {
        console.error('Error verifying access:', error);
        window.location.href = 'sisu.html';
        return false;
    }
}

// Update user interface with user data
function updateUserInterface(userData) {
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = `${userData.firstName} ${userData.lastName}`;
    }

    // Update role-specific UI elements
    const roleElements = document.querySelectorAll('[data-role]');
    roleElements.forEach(element => {
        if (element.dataset.role === userData.role) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });
}

// Authentication state observer
onAuthStateChanged(auth, async (user) => {
    if (user && user.emailVerified) {
        await verifyAccess(user);
    } else {
        // Not authenticated or email not verified
        window.location.href = 'sisu.html';
    }
});

// Logout functionality
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                localStorage.clear();
                window.location.href = 'sisu.html';
            } catch (error) {
                console.error('Error signing out:', error);
            }
        });
    }
});

// Security: Clear sensitive data on page unload
window.addEventListener('beforeunload', () => {
    if (window.userData) {
        window.userData = null;
    }
});

// Export utilities for use in other scripts
window.DashboardAuth = {
    getCurrentUser: () => auth.currentUser,
    getUserData: () => JSON.parse(localStorage.getItem('userData') || '{}'),
    getUserRole: () => localStorage.getItem('userRole'),
    hasPermission: (permission) => {
        const role = localStorage.getItem('userRole');
        const permissions = {
            pharmacist: ['inventory', 'prescriptions', 'reports', 'patients'],
            doctor: ['prescriptions', 'patients', 'reports', 'consultations'],
            student: ['learning', 'resources', 'progress', 'assignments'],
            patient: ['profile', 'medications', 'history', 'appointments']
        };
        return permissions[role]?.includes(permission) || false;
    }
};
