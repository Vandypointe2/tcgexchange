async function loadProfile() {
  const me = await apiRequest('/auth/me');
  document.getElementById('currentUsername').textContent = me.username;
  document.getElementById('currentUserId').textContent = me.id;

  const avatar = me.avatarUrl || 'https://www.gravatar.com/avatar/?d=mp&f=y';
  document.getElementById('avatarPreview').src = avatar;

  document.getElementById('username').value = me.username || '';
  document.getElementById('avatarUrl').value = me.avatarUrl || '';
}

function wireProfileForm() {
  const form = document.getElementById('profileForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const username = document.getElementById('username').value.trim();
      const avatarUrl = document.getElementById('avatarUrl').value.trim();

      const updated = await apiRequest('/auth/me', 'PUT', { username, avatarUrl });
      showToast('Profile updated', 'success');

      document.getElementById('currentUsername').textContent = updated.username;
      document.getElementById('avatarPreview').src = updated.avatarUrl || 'https://www.gravatar.com/avatar/?d=mp&f=y';
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  });

  const avatarUrlInput = document.getElementById('avatarUrl');
  avatarUrlInput.addEventListener('input', () => {
    const v = avatarUrlInput.value.trim();
    document.getElementById('avatarPreview').src = v || 'https://www.gravatar.com/avatar/?d=mp&f=y';
  });
}

function wirePasswordForm() {
  const form = document.getElementById('passwordForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    try {
      const resp = await apiRequest('/auth/change-password', 'POST', { currentPassword, newPassword });
      if (resp?.token) {
        localStorage.setItem('token', resp.token);
      }
      showToast('Password updated', 'success');

      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
    } catch (err) {
      showToast(err.message || 'Failed to update password', 'error');
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadProfile();
    wireProfileForm();
    wirePasswordForm();
  } catch (err) {
    showToast(err.message || 'Failed to load profile', 'error');
  }
});
