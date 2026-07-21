/* global Chart */

// theme.js
function initTheme() {
    let currentTheme = localStorage.getItem('theme');
    
    // Auto mode based on time if user hasn't set a preference
    if (!currentTheme) {
        const hour = new Date().getHours();
        // 6 AM to 5:59 PM is light, 6 PM to 5:59 AM is dark
        if (hour >= 6 && hour < 18) {
            currentTheme = 'light';
        } else {
            currentTheme = 'dark';
        }
    }
    
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}
initTheme();

// Helper function to handle toggle in any page
window.setupThemeToggle = function(toggleBtnId, iconId) {
    const themeToggleBtn = document.getElementById(toggleBtnId);
    const themeIcon = document.getElementById(iconId);
    if (!themeToggleBtn || !themeIcon) return;
    
    function updateToggleUI() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            themeIcon.className = 'fa-solid fa-sun';
            themeIcon.style.color = '#FBBF24'; // Amber
        } else {
            themeIcon.className = 'fa-solid fa-moon';
            themeIcon.style.color = 'var(--text-low)';
        }
    }
    
    updateToggleUI();
    
    themeToggleBtn.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent form submission or link following
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (!isDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
        updateToggleUI();
    });
};
