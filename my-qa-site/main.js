import { createClient } from '@supabase/supabase-js';

// ==========================================
// 0. SUPABASE DATABASE INITIALIZATION
// ==========================================
const supabaseUrl = 'https://yafnijrnhpbuvtutatsd.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhZm5panJuaHBidXZ0dXRhdHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjk0NDEsImV4cCI6MjA5NzgwNTQ0MX0.bWCaxY9RMOVvAo2cZPSYhMnvUzH8hcvMliR0y3tgFJ4';
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// 1. UI NAVIGATION & AUTHENTICATION LOGIC
// ==========================================
const loginScreen = document.getElementById('login-form');
const regScreen = document.getElementById('registration-screen');
const dashboardScreen = document.getElementById('dashboard');

const messageDiv = document.getElementById('message');
const loginBtn = document.getElementById('login-btn');
const resetBtn = document.getElementById('reset-btn');

// Navigation Buttons
const signupNavBtn = document.getElementById('signup-nav-btn');
const cancelRegBtn = document.getElementById('cancel-reg-btn');
const authFieldsDiv = document.getElementById('auth-fields');

let currentPdfPath = null; // Track PDF path globally for login & deletion

function showMessage(text, isError = false) {
  messageDiv.textContent = text;
  messageDiv.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
  messageDiv.style.color = isError ? '#721c24' : '#155724';
  messageDiv.style.display = 'block';
}

function showScreen(screen) {
  loginScreen.style.display = 'none';
  regScreen.style.display = 'none';
  dashboardScreen.style.display = 'none';
  if (screen === 'login') loginScreen.style.display = 'block';
  if (screen === 'registration') regScreen.style.display = 'block';
  if (screen === 'dashboard') dashboardScreen.style.display = 'block';
}

function updateDashboardDisplay(profileData) {
  const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
  document.getElementById('display-name').textContent = fullName || 'Not set';
  document.getElementById('display-phone').textContent = profileData.phone || 'Not set';
  
  let location = `${profileData.city || ''}, ${profileData.state || ''} ${profileData.zip || ''}`.trim();
  if (location === ',' || location === '') location = 'Not set';
  document.getElementById('display-location').textContent = location;
}

// ------------------------------------------------
// NAVIGATION: Go to Registration (Create New User)
// ------------------------------------------------
signupNavBtn.addEventListener('click', () => {
  document.querySelectorAll('#registration-screen input').forEach(i => i.value = '');
  document.getElementById('reg-title').textContent = 'Create New Account';
  document.getElementById('reg-subtitle').textContent = 'Enter your email, password, and profile info.';
  document.getElementById('save-profile').textContent = 'Create Account & Enter Dashboard';
  
  authFieldsDiv.style.display = 'block';
  cancelRegBtn.style.display = 'block';
  messageDiv.style.display = 'none';
  showScreen('registration');
});

// NAVIGATION: Cancel Registration and go back to Login
cancelRegBtn.addEventListener('click', () => {
  showScreen('login');
});

// ------------------------------------------------
// ACTION: Log In an Existing User
// ------------------------------------------------
loginScreen.addEventListener('submit', async (e) => {
  e.preventDefault(); 
  loginBtn.textContent = 'Authenticating...';
  loginBtn.disabled = true;

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email, password
  });

  loginBtn.textContent = 'Log In';
  loginBtn.disabled = false;

  if (authError) {
    showMessage(`Login Failed: ${authError.message}`, true);
  } else {
    messageDiv.style.display = 'none';

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authData.user.id);

      if (profileData && profileData.length > 0) {
        document.getElementById('first-name').value = profileData[0].first_name || '';
        document.getElementById('last-name').value = profileData[0].last_name || '';
        document.getElementById('phone-number').value = profileData[0].phone || '';
        document.getElementById('city').value = profileData[0].city || '';
        document.getElementById('state').value = profileData[0].state || '';
        document.getElementById('zip').value = profileData[0].zip || '';
        
        updateDashboardDisplay(profileData[0]);

        // Load Avatar URL from database
        if (profileData[0].avatar_url) {
          const profilePreview = document.getElementById('profile-preview');
          profilePreview.src = profileData[0].avatar_url;
          profilePreview.style.display = 'block';
          document.getElementById('remove-picture-btn').style.display = 'block';
        } else {
          document.getElementById('remove-picture-btn').style.display = 'none';
        }

        // NEW: Load PDF URL directly from the database row!
        if (profileData[0].pdf_url) {
          currentPdfPath = `${authData.user.id}.pdf`; // Keep path stored for delete button
          
          document.getElementById('pdf-view-link').href = profileData[0].pdf_url + "?t=" + new Date().getTime();
          document.getElementById('pdf-link-container').style.display = 'block';
          document.getElementById('pdf-upload-status').textContent = 'Cloud document loaded.';
          document.getElementById('pdf-upload-status').style.color = '#3498db';
        } else {
          document.getElementById('pdf-link-container').style.display = 'none';
          document.getElementById('pdf-upload-status').textContent = '';
        }

        showScreen('dashboard');
      } else {
        document.getElementById('reg-title').textContent = 'Complete Your Profile';
        authFieldsDiv.style.display = 'none';
        cancelRegBtn.style.display = 'none';
        showScreen('registration');
      }
    } catch (err) {
      console.error("Profile load error:", err);
      showScreen('dashboard'); 
    }
  }
});

// ACTION: Reset Password
resetBtn.addEventListener('click', () => {
  showMessage('Please contact an administrator for assistance with password recovery.', true);
});

// ==========================================
// 2. THE MASTER "SAVE PROFILE & SIGN UP" LOGIC
// ==========================================
const saveProfileBtn = document.getElementById('save-profile');

saveProfileBtn.addEventListener('click', async () => {
  const firstNameVal = document.getElementById('first-name').value.trim();
  const lastNameVal = document.getElementById('last-name').value.trim();
  
  if (!firstNameVal || !lastNameVal) {
    alert("First Name and Last Name are strictly required to continue.");
    return;
  }

  const isNewRegistration = authFieldsDiv.style.display !== 'none';
  let activeUser = null;

  saveProfileBtn.textContent = 'Processing...';
  saveProfileBtn.disabled = true;

  if (isNewRegistration) {
    const newEmail = document.getElementById('reg-email').value;
    const newPass = document.getElementById('reg-password').value;
    const confirmPass = document.getElementById('reg-confirm-password').value;

    if (!newEmail || !newPass) {
      alert("Email and Password are required to create an account.");
      saveProfileBtn.textContent = 'Create Account & Enter Dashboard';
      saveProfileBtn.disabled = false;
      return;
    }
    if (newPass !== confirmPass) {
      alert("Passwords do not match. Please try again.");
      saveProfileBtn.textContent = 'Create Account & Enter Dashboard';
      saveProfileBtn.disabled = false;
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: newEmail,
      password: newPass,
    });

    if (signUpError) {
      alert(`Sign Up Failed: ${signUpError.message}`);
      saveProfileBtn.textContent = 'Create Account & Enter Dashboard';
      saveProfileBtn.disabled = false;
      return;
    }
    
    activeUser = signUpData.user;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    activeUser = user;
  }

  if (!activeUser) {
    alert("Authentication error: User session not found.");
    saveProfileBtn.textContent = 'Save';
    saveProfileBtn.disabled = false;
    return;
  }

  // NOTE: This intentionally only updates demographic info, it won't overwrite avatar_url or pdf_url
  const payload = {
    first_name: firstNameVal,
    last_name: lastNameVal,
    phone: document.getElementById('phone-number').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    zip: document.getElementById('zip').value
  };

  let saveError = null;

  const { data: existing, error: checkError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', activeUser.id);

  if (checkError) saveError = checkError;
  else if (existing && existing.length > 0) {
    const { error } = await supabase.from('profiles').update(payload).eq('user_id', activeUser.id);
    saveError = error;
  } else {
    payload.user_id = activeUser.id;
    const { error } = await supabase.from('profiles').insert([payload]);
    saveError = error;
  }

  saveProfileBtn.textContent = 'Save';
  saveProfileBtn.disabled = false;

  if (saveError) {
    console.error('Supabase Error:', saveError);
    alert("SUPABASE ERROR: " + saveError.message);
  } else {
    updateDashboardDisplay(payload);
    showScreen('dashboard');
    showMessage('Profile successfully secured to your account!');
  }
});

// Edit Profile Button (From Dashboard)
document.getElementById('edit-profile').addEventListener('click', () => {
  document.getElementById('reg-title').textContent = 'Edit Profile Info';
  document.getElementById('reg-subtitle').textContent = 'Update your personal details below.';
  document.getElementById('save-profile').textContent = 'Update Profile & Return';
  
  authFieldsDiv.style.display = 'none'; 
  cancelRegBtn.style.display = 'none';
  
  showScreen('registration');
  messageDiv.style.display = 'none';
});

// ==========================================
// 3. CLOUD FILE UPLOAD & DELETION (AVATARS)
// ==========================================
const fileInput = document.getElementById('file-upload');
const uploadStatus = document.getElementById('upload-status');
const profilePreview = document.getElementById('profile-preview');
const customUploadBtn = document.getElementById('custom-upload-btn');
const removePicBtn = document.getElementById('remove-picture-btn');

customUploadBtn.addEventListener('click', () => fileInput.click());
profilePreview.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  uploadStatus.textContent = 'Uploading directly to Cloud Storage...';
  uploadStatus.style.color = '#e67e22';

  const filePath = `profile_pics/${user.id}`;
  
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    uploadStatus.textContent = `Upload failed: ${uploadError.message}`;
    uploadStatus.style.color = '#e74c3c';
    return;
  }

  const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
  const avatarUrl = publicUrlData.publicUrl;

  await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('user_id', user.id);

  uploadStatus.textContent = 'Cloud Upload Successful!';
  uploadStatus.style.color = '#27ae60'; 
  
  profilePreview.src = avatarUrl + "?t=" + new Date().getTime();
  profilePreview.style.display = 'block';
  removePicBtn.style.display = 'block';
});

removePicBtn.addEventListener('click', async () => {
  const isSure = window.confirm("Are you sure you want to permanently delete your profile picture?");
  if (!isSure) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  uploadStatus.textContent = 'Removing picture from cloud...';
  uploadStatus.style.color = '#e67e22';

  const filePath = `profile_pics/${user.id}`;
  await supabase.storage.from('avatars').remove([filePath]);

  const { error: dbError } = await supabase
    .from('profiles')
    .update({ avatar_url: null })
    .eq('user_id', user.id);

  if (dbError) {
    uploadStatus.textContent = `Error removing from database: ${dbError.message}`;
    uploadStatus.style.color = '#e74c3c';
    return;
  }

  profilePreview.src = '';
  profilePreview.style.display = 'none';
  removePicBtn.style.display = 'none';
  fileInput.value = ''; 
  
  uploadStatus.textContent = 'Picture permanently removed.';
  uploadStatus.style.color = '#7f8c8d';
});

// ==========================================
// 4. LOGOUT LOGIC
// ==========================================
const logoutBtn = document.getElementById('logout');

logoutBtn.addEventListener('click', async () => {
  const isSure = window.confirm("Are you sure you want to log out?");
  if (!isSure) return; 

  await supabase.auth.signOut();

  showScreen('login');
  
  // Wipe everything clean
  document.querySelectorAll('input').forEach(input => input.value = '');
  uploadStatus.textContent = '';
  profilePreview.style.display = 'none';
  profilePreview.src = '';
  removePicBtn.style.display = 'none';
  
  // Clear PDF fields on logout
  document.getElementById('pdf-upload').value = '';
  document.getElementById('pdf-file-name').textContent = '';
  document.getElementById('upload-pdf-btn').style.display = 'none';
  document.getElementById('pdf-upload-status').textContent = '';
  document.getElementById('pdf-link-container').style.display = 'none';
  currentPdfPath = null;
  
  document.getElementById('display-name').textContent = 'Not set';
  document.getElementById('display-phone').textContent = 'Not set';
  document.getElementById('display-location').textContent = 'Not set';
  
  showMessage('You have successfully securely logged out.');
});

// ==========================================
// 5. ACCOUNT DELETION LOGIC
// ==========================================
const deleteModal = document.getElementById('delete-modal');
const deleteAccountBtn = document.getElementById('delete-account-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

deleteAccountBtn.addEventListener('click', () => {
  deleteModal.style.display = 'flex';
});

cancelDeleteBtn.addEventListener('click', () => {
  deleteModal.style.display = 'none';
  document.getElementById('del-email').value = '';
  document.getElementById('del-pass').value = '';
});

confirmDeleteBtn.addEventListener('click', async () => {
  const email = document.getElementById('del-email').value;
  const password = document.getElementById('del-pass').value;

  if (!email || !password) {
    alert("Please enter both email and password to confirm deletion.");
    return;
  }

  confirmDeleteBtn.textContent = 'Verifying...';
  confirmDeleteBtn.disabled = true;

  const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({ email, password });
  
  if (authError || !user) {
    alert("Authentication failed. Check your email and password.");
    confirmDeleteBtn.textContent = 'Delete Permanently';
    confirmDeleteBtn.disabled = false;
    return;
  }

  confirmDeleteBtn.textContent = 'Deleting...';

  await supabase.from('profiles').delete().eq('user_id', user.id);
  const { error } = await supabase.rpc('delete_user');

  if (error) {
    alert("Error deleting user: " + error.message);
    confirmDeleteBtn.textContent = 'Delete Permanently';
    confirmDeleteBtn.disabled = false;
  } else {
    alert("Account permanently deleted.");
    window.location.reload();
  }
});

// ==========================================
// 6. PDF UPLOAD & DELETION LOGIC (DB DRIVEN)
// ==========================================
const pdfFileInput = document.getElementById('pdf-upload');
const customPdfBtn = document.getElementById('custom-pdf-btn');
const pdfFileName = document.getElementById('pdf-file-name');
const uploadPdfBtn = document.getElementById('upload-pdf-btn');
const pdfUploadStatus = document.getElementById('pdf-upload-status');
const pdfLinkContainer = document.getElementById('pdf-link-container');
const pdfViewLink = document.getElementById('pdf-view-link');
const removePdfBtn = document.getElementById('remove-pdf-btn');

let selectedPdfFile = null;

customPdfBtn.addEventListener('click', () => pdfFileInput.click());

pdfFileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== 'application/pdf') {
    alert('Please select a valid PDF file.');
    pdfFileInput.value = '';
    return;
  }

  selectedPdfFile = file;
  pdfFileName.textContent = `Selected: ${file.name}`;
  uploadPdfBtn.style.display = 'block';
  pdfUploadStatus.textContent = '';
  pdfLinkContainer.style.display = 'none';
});

uploadPdfBtn.addEventListener('click', async () => {
  if (!selectedPdfFile) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  pdfUploadStatus.textContent = 'Uploading PDF directly to Cloud Storage...';
  pdfUploadStatus.style.color = '#e67e22';
  uploadPdfBtn.disabled = true;

  const filePath = `${user.id}.pdf`;

  const { error: uploadError } = await supabase.storage
    .from('documents') 
    .upload(filePath, selectedPdfFile, { upsert: true });

  if (uploadError) {
    pdfUploadStatus.textContent = `Upload failed: ${uploadError.message}`;
    pdfUploadStatus.style.color = '#e74c3c';
    uploadPdfBtn.disabled = false;
    return;
  }

  currentPdfPath = filePath;

  const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(filePath);
  
  // Update the profiles table with the new PDF URL!
  await supabase.from('profiles').update({ pdf_url: publicUrlData.publicUrl }).eq('user_id', user.id);
  
  pdfUploadStatus.textContent = 'PDF Upload Successful!';
  pdfUploadStatus.style.color = '#27ae60';
  uploadPdfBtn.style.display = 'none';
  uploadPdfBtn.disabled = false;
  
  pdfViewLink.href = publicUrlData.publicUrl + "?t=" + new Date().getTime();
  pdfLinkContainer.style.display = 'block';
});

// Delete PDF Logic
removePdfBtn.addEventListener('click', async () => {
  const isSure = window.confirm("Are you sure you want to permanently delete this document?");
  if (!isSure) return;

  if (!currentPdfPath) return;
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  pdfUploadStatus.textContent = 'Removing document from cloud...';
  pdfUploadStatus.style.color = '#e67e22';

  const { error: removeError } = await supabase.storage
    .from('documents')
    .remove([currentPdfPath]);

  if (removeError) {
    pdfUploadStatus.textContent = `Error removing document: ${removeError.message}`;
    pdfUploadStatus.style.color = '#e74c3c';
    return;
  }

  // Clear the PDF URL from the database table!
  await supabase.from('profiles').update({ pdf_url: null }).eq('user_id', user.id);

  // Reset UI
  pdfLinkContainer.style.display = 'none';
  pdfFileInput.value = '';
  pdfFileName.textContent = '';
  selectedPdfFile = null;
  currentPdfPath = null;
  
  pdfUploadStatus.textContent = 'Document permanently removed.';
  pdfUploadStatus.style.color = '#7f8c8d';
});