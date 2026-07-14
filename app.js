document.addEventListener('DOMContentLoaded', () => {
    // Basic interaction for Bottom Nav
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Prevent default for empty links
            if (item.getAttribute('href') === '#') {
                e.preventDefault();
            }
            
            // Ignore the add menu button for active state switching
            if (item.classList.contains('add-menu')) return;
            
            // Remove active from all
            navItems.forEach(nav => {
                if (!nav.classList.contains('add-menu')) {
                    nav.classList.remove('active');
                }
            });
            
            // Add active to clicked
            item.classList.add('active');
        });
    });

    // Add interactivity to the floating add button
    const addBtnTrigger = document.getElementById('add-btn-trigger');
    const bottomSheet = document.getElementById('add-menu-sheet');
    const cancelSheetBtn = document.getElementById('cancel-sheet-btn');

    if (addBtnTrigger && bottomSheet) {
        addBtnTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Animation effect for the inner button
            const innerBtn = addBtnTrigger.querySelector('.add-btn');
            if (innerBtn) {
                innerBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    innerBtn.style.transform = '';
                }, 100);
            }
            
            // Show bottom sheet
            bottomSheet.classList.add('active');
        });
    }
    
    // Close bottom sheet
    if (cancelSheetBtn && bottomSheet) {
        cancelSheetBtn.addEventListener('click', () => {
            bottomSheet.classList.remove('active');
        });
    }
    
    // Close on overlay click
    if (bottomSheet) {
        bottomSheet.addEventListener('click', (e) => {
            if (e.target === bottomSheet) {
                bottomSheet.classList.remove('active');
            }
        });
    }

    // Real-time Date and Clock Update
    const dateDisplay = document.getElementById('current-date');
    const timeDisplay = document.getElementById('current-time');
    
    function updateClock() {
        if (!dateDisplay || !timeDisplay) return;
        
        const now = new Date();
        
        // Date format: DD/MM/YYYY
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        dateDisplay.textContent = `${day}/${month}/${year}`;
        
        // Time format: HH:MM:SS
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    // Initial call and start interval
    updateClock();
    setInterval(updateClock, 1000);

    // --- Calendar Logic ---
    const prevWeekBtn = document.getElementById('prev-week-btn');
    const nextWeekBtn = document.getElementById('next-week-btn');
    const calendarMonth = document.getElementById('calendar-month');
    const calendarDaysContainer = document.getElementById('calendar-days-container');
    const nativeDatePicker = document.getElementById('native-date-picker');
    
    let selectedDate = new Date(); // Start with today
    let currentWeekStart = new Date(selectedDate);
    // Set to previous Sunday
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    
    function renderCalendar() {
        if (!calendarDaysContainer) return;
        
        const thMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
        const thDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
        
        calendarDaysContainer.innerHTML = '';
        
        let monthName = '';
        let yearNum = '';
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeekStart);
            date.setDate(date.getDate() + i);
            
            if (i === 0) { // Set month title based on Sunday
                monthName = thMonths[date.getMonth()];
                yearNum = date.getFullYear() + 543; // Display Buddhist Era (พ.ศ.)
                const calendarMonthText = document.getElementById('calendar-month-text');
                if (calendarMonthText) {
                    calendarMonthText.textContent = `${monthName} พ.ศ. ${yearNum}`;
                }
            }
            
            const dayItem = document.createElement('div');
            dayItem.className = 'day-item';
            dayItem.style.cursor = 'pointer';
            
            // Highlight Saturday/Sunday
            if (date.getDay() === 0 || date.getDay() === 6) {
                dayItem.classList.add('text-danger');
            }
            
            // Highlight selected date
            if (date.getDate() === selectedDate.getDate() && 
                date.getMonth() === selectedDate.getMonth() && 
                date.getFullYear() === selectedDate.getFullYear()) {
                dayItem.classList.add('active');
            }
            
            const dayNameStr = thDays[date.getDay()];
            const dayNum = date.getDate();
            
            dayItem.innerHTML = `
                <span class="day-name">${dayNameStr}</span>
                <span class="day-number">${dayNum}</span>
            `;
            
            dayItem.addEventListener('click', () => {
                selectedDate = new Date(date);
                renderCalendar();
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
            });
            
            calendarDaysContainer.appendChild(dayItem);
        }
    }
    
    if (prevWeekBtn) {
        prevWeekBtn.addEventListener('click', () => {
            currentWeekStart.setDate(currentWeekStart.getDate() - 7);
            renderCalendar();
        });
    }
    
    if (nextWeekBtn) {
        nextWeekBtn.addEventListener('click', () => {
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
            renderCalendar();
        });
    }
    
    // Custom Full Calendar Logic
    const fcModal = document.getElementById('fc-modal');
    const calendarMonthBtn = document.getElementById('calendar-month');
    
    // Modal Header elements
    const fcMonthSelect = document.getElementById('fc-month-select');
    const fcYearSelect = document.getElementById('fc-year-select');
    
    const fcGrid = document.getElementById('fc-grid');
    const fcCloseBtn = document.getElementById('fc-close-btn');
    
    let fcCurrentDate = new Date(selectedDate);
    
    if (calendarMonthBtn && fcModal) {
        
        // Generate Year Options
        if (fcYearSelect) {
            const currentY = new Date().getFullYear();
            fcYearSelect.innerHTML = '';
            for (let y = currentY - 5; y <= currentY + 5; y++) {
                const opt = document.createElement('option');
                opt.value = y;
                opt.textContent = 'พ.ศ. ' + (y + 543);
                fcYearSelect.appendChild(opt);
            }
        }
        
        function renderFullCalendar() {
            if (fcGrid) fcGrid.innerHTML = '';
            
            const year = fcCurrentDate.getFullYear();
            const month = fcCurrentDate.getMonth();
            
            if (fcMonthSelect) fcMonthSelect.value = month;
            if (fcYearSelect) fcYearSelect.value = year;
            
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            if (fcGrid) {
                // Empty slots before first day
                for (let i = 0; i < firstDay; i++) {
                    const empty = document.createElement('div');
                    empty.className = 'fc-day empty';
                    fcGrid.appendChild(empty);
                }
                
                // Days
                for (let d = 1; d <= daysInMonth; d++) {
                    const dayEl = document.createElement('div');
                    dayEl.className = 'fc-day';
                    dayEl.textContent = d;
                    
                    const currentDayOfWeek = new Date(year, month, d).getDay();
                    if (currentDayOfWeek === 0 || currentDayOfWeek === 6) {
                        dayEl.classList.add('text-danger');
                    }
                    
                    if (d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
                        dayEl.classList.add('active');
                    }
                    
                    dayEl.addEventListener('click', () => {
                        selectedDate = new Date(year, month, d);
                        currentWeekStart = new Date(selectedDate);
                        currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
                        renderCalendar();
                        if (typeof loadDashboardData === 'function') {
                            loadDashboardData();
                        }
                        fcModal.classList.remove('active');
                    });
                    
                    fcGrid.appendChild(dayEl);
                }
            }
        }
        
        if (fcMonthSelect) {
            fcMonthSelect.addEventListener('change', (e) => {
                fcCurrentDate.setMonth(parseInt(e.target.value));
                renderFullCalendar();
            });
        }
        
        if (fcYearSelect) {
            fcYearSelect.addEventListener('change', (e) => {
                fcCurrentDate.setFullYear(parseInt(e.target.value));
                renderFullCalendar();
            });
        }
        
        calendarMonthBtn.addEventListener('click', () => {
            fcCurrentDate = new Date(selectedDate);
            renderFullCalendar();
            fcModal.classList.add('active');
        });
        
        if (fcCloseBtn) {
            fcCloseBtn.addEventListener('click', () => {
                fcModal.classList.remove('active');
            });
        }
        
        
        const fcTodayBtn = document.getElementById('fc-today-btn');
        if (fcTodayBtn) {
            fcTodayBtn.addEventListener('click', () => {
                selectedDate = new Date();
                currentWeekStart = new Date(selectedDate);
                currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
                
                renderCalendar();
                if (typeof loadDashboardData === 'function') {
                    loadDashboardData();
                }
                
                fcCurrentDate = new Date(selectedDate);
                renderFullCalendar();
                fcModal.classList.remove('active');
            });
        }
        
        // Setup global edit toggle button for meals
        const toggleEditMealsBtn = document.getElementById('toggle-edit-meals-btn');
        const mealsContainer = document.getElementById('meals-container');
        if (toggleEditMealsBtn && mealsContainer) {
            toggleEditMealsBtn.addEventListener('click', () => {
                mealsContainer.classList.toggle('edit-mode');
                const isActive = mealsContainer.classList.contains('edit-mode');
                
                if (isActive) {
                    toggleEditMealsBtn.style.background = 'var(--error-base)';
                    toggleEditMealsBtn.style.color = 'white';
                } else {
                    toggleEditMealsBtn.style.background = 'var(--bg-surface)';
                    toggleEditMealsBtn.style.color = 'var(--error-base)';
                }
            });
        }
        
        fcModal.addEventListener('click', (e) => {
            if (e.target === fcModal) {
                fcModal.classList.remove('active');
            }
        });
    }
    
    renderCalendar();

    // --- Load Personalized Dashboard Data ---
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    const setupBanner = document.getElementById('setup-banner');
    
    function encodeEmail(email) {
        return email.toLowerCase().replace(/\./g, ',');
    }
    
    window.loadDashboardData = function(skipMealsRender = false) {
        if (!setupBanner || !currentUserEmail) return;
        
        // Custom Confirm Dialog
        function showCustomConfirm(title, message, onConfirm) {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s ease; backdrop-filter: blur(4px);';
            
            const modal = document.createElement('div');
            modal.style.cssText = 'background: var(--surface-color); width: 90%; max-width: 320px; border-radius: 24px; padding: 24px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.2); transform: scale(0.9); transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);';
            
            const iconWrapper = document.createElement('div');
            iconWrapper.style.cssText = 'width: 60px; height: 60px; border-radius: 50%; background: var(--error-light); color: var(--error-base); font-size: 28px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;';
            iconWrapper.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            
            const titleEl = document.createElement('h3');
            titleEl.textContent = title;
            titleEl.style.cssText = 'margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: var(--text-dark);';
            
            const msgEl = document.createElement('p');
            msgEl.textContent = message;
            msgEl.style.cssText = 'margin: 0 0 24px 0; font-size: 14px; color: var(--text-medium); line-height: 1.5;';
            
            const btnContainer = document.createElement('div');
            btnContainer.style.cssText = 'display: flex; gap: 12px;';
            
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'ยกเลิก';
            cancelBtn.style.cssText = 'flex: 1; padding: 12px; border-radius: 12px; border: none; background: var(--bg-surface); color: var(--text-medium); font-weight: 600; font-size: 15px; cursor: pointer; transition: background 0.2s;';
            
            const confirmBtn = document.createElement('button');
            confirmBtn.textContent = 'ลบรายการ';
            confirmBtn.style.cssText = 'flex: 1; padding: 12px; border-radius: 12px; border: none; background: var(--error-base); color: white; font-weight: 600; font-size: 15px; cursor: pointer; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); transition: transform 0.1s;';
            
            cancelBtn.onmousedown = () => cancelBtn.style.background = '#e2e8f0';
            cancelBtn.onmouseup = () => cancelBtn.style.background = 'var(--bg-surface)';
            confirmBtn.onmousedown = () => confirmBtn.style.transform = 'scale(0.95)';
            confirmBtn.onmouseup = () => confirmBtn.style.transform = 'scale(1)';
            
            btnContainer.appendChild(cancelBtn);
            btnContainer.appendChild(confirmBtn);
            
            modal.appendChild(iconWrapper);
            modal.appendChild(titleEl);
            modal.appendChild(msgEl);
            modal.appendChild(btnContainer);
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            // Animate in
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                modal.style.transform = 'scale(1)';
            });
            
            const closeDialog = () => {
                overlay.style.opacity = '0';
                modal.style.transform = 'scale(0.9)';
                setTimeout(() => overlay.remove(), 300);
            };
            
            cancelBtn.onclick = closeDialog;
            confirmBtn.onclick = () => {
                closeDialog();
                onConfirm();
            };
        }
        
        const userKey = encodeEmail(currentUserEmail);
        
        // Format selected date
        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        
        Promise.all([
            supabase.from('profiles').select('*').eq('email', currentUserEmail.toLowerCase()).single(),
            supabase.from('daily_logs').select('*').eq('email', currentUserEmail.toLowerCase()).eq('date', dateStr).maybeSingle()
        ])
        .then(([profileResult, logResult]) => {
            const profileData = profileResult.data;
            const logData = logResult.data;
            
            if (!profileData) {
                setupBanner.style.display = 'block';
                return;
            }
            
            const limits = profileData.limits;
            if (limits) {
                const updateEl = (id, val) => {
                    const el = document.getElementById(id);
                    if (el) el.textContent = (val || 0).toLocaleString();
                };
                
                updateEl('max-protein', limits.protein);
                updateEl('max-carb', limits.carb);
                updateEl('max-sodium', limits.sodium);
                updateEl('max-potassium', limits.potassium);
                updateEl('max-sugar', limits.sugar);
                
                // Current Nutrients
                const currentProtein = (logData && logData.protein) ? logData.protein : 0;
                const currentCarb = (logData && logData.carb) ? logData.carb : 0;
                const currentSodium = (logData && logData.sodium) ? logData.sodium : 0;
                const currentPotassium = (logData && logData.potassium) ? logData.potassium : 0;
                const currentSugar = (logData && logData.sugar) ? logData.sugar : 0;
                
                const updateCurrentEl = (id, val, unit) => {
                    const el = document.getElementById(id);
                    // Use Math.round to avoid long decimals
                    if (el) el.textContent = Math.round(val) + unit;
                };
                
                updateCurrentEl('current-protein', currentProtein, ' กรัม');
                updateCurrentEl('current-carb', currentCarb, ' กรัม');
                updateCurrentEl('current-sodium', currentSodium, ' มก.');
                updateCurrentEl('current-potassium', currentPotassium, ' มก.');
                updateCurrentEl('current-sugar', currentSugar, ' กรัม');
                
                // Nutrition Alerts Logic
                const checkNutrient = (name, current, limit) => {
                    if (!limit || limit <= 0) return { name, ratio: 0 };
                    return { name, ratio: current / limit, current, limit };
                };
                
                const nStats = [
                    checkNutrient('โปรตีน', currentProtein, limits.protein),
                    checkNutrient('คาร์โบไฮเดรต', currentCarb, limits.carb),
                    checkNutrient('โซเดียม', currentSodium, limits.sodium),
                    checkNutrient('โพแทสเซียม', currentPotassium, limits.potassium),
                    checkNutrient('น้ำตาล', currentSugar, limits.sugar)
                ];
                
                // Exceeded limits (Phase 3) > 100%
                const overLimit = nStats.filter(n => n.ratio > 1);
                // At limits (Phase 2) == 100%
                const atLimit = nStats.filter(n => n.ratio === 1);
                // Near limits (Phase 1) >= 75% and < 100%
                const nearLimit = nStats.filter(n => n.ratio >= 0.75 && n.ratio < 1);
                
                const alertBanner = document.getElementById('nutrition-alerts-banner');
                const alertIcon = document.getElementById('nutrition-alert-icon');
                const alertTitle = document.getElementById('nutrition-alert-title');
                const alertMsg = document.getElementById('nutrition-alert-message');
                
                if (alertBanner) {
                    if (overLimit.length > 0) {
                        alertBanner.style.display = 'block';
                        alertBanner.style.backgroundColor = 'var(--error-light)';
                        alertBanner.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                        alertBanner.style.color = 'var(--error-dark)';
                        alertIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: var(--error-base);"></i>';
                        alertTitle.textContent = 'ระวัง! สารอาหารเกินกำหนด';
                        alertTitle.style.color = 'var(--error-base)';
                        
                        const names = overLimit.map(n => n.name).join(' และ ');
                        alertMsg.textContent = `${names} เกินปริมาณที่กำหนดไว้แล้ว โปรดระมัดระวังหรือปรึกษาแพทย์เพื่อความปลอดภัย`;
                    } else if (atLimit.length > 0) {
                        alertBanner.style.display = 'block';
                        alertBanner.style.backgroundColor = 'var(--error-light)'; // Red box as requested
                        alertBanner.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                        alertBanner.style.color = 'var(--error-dark)';
                        alertIcon.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="color: var(--error-base);"></i>';
                        alertTitle.textContent = 'สารอาหารครบปริมาณที่กำหนด';
                        alertTitle.style.color = 'var(--error-base)';
                        
                        const names = atLimit.map(n => n.name).join(' และ ');
                        alertMsg.textContent = `${names} ครบปริมาณสูงสุดของวันนี้แล้ว กรุณางดรับประทานเพิ่ม`;
                    } else if (nearLimit.length > 0) {
                        alertBanner.style.display = 'block';
                        alertBanner.style.backgroundColor = 'var(--warning-light)'; // Yellow box as requested
                        alertBanner.style.borderColor = '#FDE68A';
                        alertBanner.style.color = 'var(--warning-dark)';
                        alertIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: var(--warning-dark);"></i>';
                        alertTitle.textContent = 'แจ้งเตือนสารอาหารใกล้ครบกำหนด';
                        alertTitle.style.color = 'var(--warning-dark)';
                        
                        const names = nearLimit.map(n => n.name).join(' และ ');
                        alertMsg.textContent = `${names} ใกล้ถึงปริมาณที่กำหนดแล้ว ควรระมัดระวังในการรับประทานมื้อต่อไป`;
                    } else {
                        alertBanner.style.display = 'none';
                    }
                }
                
                // Fluid Balance Logic
                const stage = profileData.stage || '1';
                const currentWater = (logData && logData.water_intake_ml) ? logData.water_intake_ml : 0;
                const currentUrine = (logData && logData.urine_output_ml) ? logData.urine_output_ml : 0;
                
                let maxWater = limits.water || 2000;
                
                if (stage === '4' || stage === '5' || stage === '5_dialysis') {
                    // For stage 4 & 5, max water is urine output + 500
                    maxWater = currentUrine + 500;
                }
                
                // Update Fluid UI
                const currentWaterEl = document.getElementById('current-water');
                const maxWaterEl = document.getElementById('max-water');
                const currentUrineEl = document.getElementById('current-urine');
                
                if (currentWaterEl) currentWaterEl.textContent = currentWater.toLocaleString() + 'มล.';
                if (maxWaterEl) maxWaterEl.textContent = maxWater.toLocaleString();
                if (currentUrineEl) currentUrineEl.textContent = currentUrine.toLocaleString() + 'มล.';
                
                // Fluid Balance Box
                const fluidWaterEl = document.getElementById('fluid-water');
                const fluidUrineEl = document.getElementById('fluid-urine');
                const fluidBalanceEl = document.getElementById('fluid-balance');
                
                const balance = currentWater - currentUrine;
                
                if (fluidWaterEl) fluidWaterEl.textContent = currentWater.toLocaleString() + ' มล.';
                if (fluidUrineEl) fluidUrineEl.textContent = currentUrine.toLocaleString() + ' มล.';
                if (fluidBalanceEl) {
                    if (balance > 0) {
                        fluidBalanceEl.textContent = '+' + balance.toLocaleString() + ' มล.';
                        fluidBalanceEl.className = 'total-value text-primary';
                        // Could update subtitle text to 'สมดุลน้ำเป็นบวก (สะสมน้ำ)'
                    } else if (balance < 0) {
                        fluidBalanceEl.textContent = balance.toLocaleString() + ' มล.';
                        fluidBalanceEl.className = 'total-value text-warning';
                    } else {
                        fluidBalanceEl.textContent = '0 มล.';
                        fluidBalanceEl.className = 'total-value text-success';
                    }
                }
                
                // Fluid Warning System
                const warningSection = document.getElementById('warning-section');
                const warningText = document.getElementById('warning-text');
                
                if (warningSection && warningText) {
                    const warningIcon = warningSection.querySelector('.warning-icon');
                    const warningTitle = warningSection.querySelector('h3');
                    
                    let showWarning = false;
                    let warningMsg = '';
                    let warningType = '';
                    
                    if (balance > maxWater) {
                        showWarning = true;
                        warningType = 'danger';
                        if (stage === '4' || stage === '5' || stage === '5_dialysis') {
                            warningMsg = `อันตราย! ร่างกายสะสมน้ำเกินกว่าปัสสาวะที่ขับออกเกิน 500 มล. แล้ว (สะสม ${balance} มล.) เสี่ยงต่อภาวะน้ำท่วมปอด โปรดงดดื่มน้ำและปรึกษาแพทย์!`;
                        } else {
                            warningMsg = `อันตราย! ร่างกายมีน้ำสะสมสุทธิเกิน ${maxWater} มล. (ดื่มน้ำมากกว่าปัสสาวะ) อาจส่งผลให้ร่างกายบวมน้ำได้ โปรดงดดื่มน้ำเพิ่ม`;
                        }
                    } else if (balance > 0 && balance >= maxWater * 0.8) {
                        showWarning = true;
                        warningType = 'warning';
                        warningMsg = 'ยอดน้ำสะสมในร่างกายใกล้ถึงขีดจำกัดแล้ว ควรเปลี่ยนจากการดื่มเต็มแก้วเป็นการจิบน้ำแต่น้อย';
                    }
                    
                    if (showWarning) {
                        warningSection.style.display = 'flex';
                        warningText.textContent = warningMsg;
                        
                        if (warningType === 'danger') {
                            warningSection.style.backgroundColor = 'var(--error-light)';
                            warningSection.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                            warningSection.style.color = 'var(--error-dark)';
                            if (warningIcon) warningIcon.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: var(--error-base);"></i>';
                            if (warningTitle) {
                                warningTitle.textContent = 'อันตราย! ภาวะน้ำเกิน';
                                warningTitle.style.color = 'var(--error-base)';
                            }
                        } else {
                            warningSection.style.backgroundColor = 'var(--warning-light)';
                            warningSection.style.borderColor = '#FDE68A';
                            warningSection.style.color = 'var(--warning-dark)';
                            if (warningIcon) warningIcon.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="color: var(--warning-dark);"></i>';
                            if (warningTitle) {
                                warningTitle.textContent = 'แจ้งเตือนน้ำดื่มใกล้ครบกำหนด';
                                warningTitle.style.color = 'var(--warning-dark)';
                            }
                        }
                    } else {
                        warningSection.style.display = 'none';
                    }
                }
                
                // Render Meals
                const mealsContainer = document.getElementById('meals-container');
                if (mealsContainer && skipMealsRender !== true) {
                    let rawMeals = (logData && logData.meals) ? logData.meals : [];
                    if (typeof rawMeals === 'string') {
                        try { rawMeals = JSON.parse(rawMeals); } catch(e) { rawMeals = []; }
                    }
                    if (!Array.isArray(rawMeals)) rawMeals = [];
                    
                    // Filter out invalid items (e.g. from string splitting bugs)
                    const meals = rawMeals.filter(m => m && typeof m === 'object' && m.name);
                    
                    if (meals.length === 0) {
                        mealsContainer.innerHTML = '<p style="text-align: center; color: var(--text-medium); padding: 20px;">ยังไม่มีรายการอาหาร</p>';
                    } else {
                        mealsContainer.innerHTML = '';
                        const mealsWithIndex = meals.map((m, idx) => ({...m, originalIndex: idx}));
                        
                        // Check if we have edit mode enabled globally
                        const isEditMode = mealsContainer.classList.contains('edit-mode');
                        
                        mealsWithIndex.slice().reverse().forEach(meal => {
                            const mealName = meal.name || '';
                            const isWater = mealName.includes('น้ำ') && !mealName.includes('ต้ม');
                            const isUrine = mealName.includes('ปัสสาวะ');
                            
                            let icon = 'fa-utensils';
                            if (isWater) icon = 'fa-glass-water';
                            if (isUrine) icon = 'fa-flask';
                            
                            const mealHtml = `
                                <div class="meal-swipe-container" style="margin-bottom: 12px; position: relative; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); background: var(--surface-color);">
                                    <!-- Delete Button Integrated (Static Underneath) -->
                                    <div class="meal-delete-btn" style="position: absolute; top: 0; right: 0; bottom: 0; width: 70px; display: flex; justify-content: center; align-items: center; color: white; background: var(--error-base); cursor: pointer; z-index: 1;">
                                        <i class="fa-solid fa-trash-can" style="font-size: 20px;"></i>
                                    </div>
                                    
                                    <!-- Main Content Wrapper (White Card) -->
                                    <div class="meal-content-wrapper meal-swipe-front" style="position: relative; z-index: 2; padding: 16px 20px; background: var(--surface-color); transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);">
                                        
                                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                                            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-dark); margin: 0; line-height: 1.4;">
                                                <i class="fa-solid ${icon}" style="color: var(--primary-color); margin-right: 6px;"></i> ${mealName}
                                            </h3>
                                            <span style="font-size: 13px; font-weight: 500; color: var(--text-medium); flex-shrink: 0; margin-left: 12px; margin-top: 2px;">${meal.time || ''}</span>
                                        </div>
                                        
                                        <div style="display: flex; flex-wrap: wrap; gap: 8px 16px;">
                                            ${meal.protein > 0 ? `<div style="font-size: 13px; font-weight: 500; color: var(--text-medium); display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-drumstick-bite" style="color: #10B981; width: 14px; text-align: center;"></i> <span>โปรตีน <b style="color: var(--text-dark);">${meal.protein}</b>g</span></div>` : ''}
                                            ${meal.carb > 0 ? `<div style="font-size: 13px; font-weight: 500; color: var(--text-medium); display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-bowl-rice" style="color: #F59E0B; width: 14px; text-align: center;"></i> <span>คาร์บ <b style="color: var(--text-dark);">${meal.carb}</b>g</span></div>` : ''}
                                            ${meal.sodium > 0 ? `<div style="font-size: 13px; font-weight: 500; color: var(--text-medium); display: flex; align-items: center; gap: 6px;"><span style="color: #3B82F6; width: 14px; text-align: center; font-weight: 800; font-family: sans-serif; font-size: 11px;">Na</span> <span>โซเดียม <b style="color: var(--text-dark);">${meal.sodium}</b>mg</span></div>` : ''}
                                            ${meal.potassium > 0 ? `<div style="font-size: 13px; font-weight: 500; color: var(--text-medium); display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-flask" style="color: #EF4444; width: 14px; text-align: center;"></i> <span>โพแทสเซียม <b style="color: var(--text-dark);">${meal.potassium}</b>mg</span></div>` : ''}
                                            ${meal.sugar > 0 ? `<div style="font-size: 13px; font-weight: 500; color: var(--text-medium); display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-cookie" style="color: #D97706; width: 14px; text-align: center;"></i> <span>น้ำตาล <b style="color: var(--text-dark);">${meal.sugar}</b>g</span></div>` : ''}
                                            ${meal.water > 0 ? `<div style="font-size: 13px; font-weight: 500; color: var(--text-medium); display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-glass-water" style="color: #0ea5e9; width: 14px; text-align: center;"></i> <span>น้ำ <b style="color: var(--text-dark);">${meal.water}</b>ml</span></div>` : ''}
                                        </div>
                                        
                                    </div>
                                </div>
                            `;
                            
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = mealHtml;
                            const containerEl = tempDiv.firstElementChild;
                            
                            const deleteBtn = containerEl.querySelector('.meal-delete-btn');
                            
                            deleteBtn.addEventListener('click', () => {
                                showCustomConfirm('ยืนยันการลบ', `คุณต้องการลบ "${mealName}" ออกจากรายการวันนี้ใช่หรือไม่?`, async () => {
                                    try {
                                        // Start the shrink-out animation immediately
                                        containerEl.classList.add('deleting');
                                        
                                        // Wait for the animation to mostly finish
                                        await new Promise(resolve => setTimeout(resolve, 350));
                                        
                                        // INSTANTLY REMOVE FROM DOM
                                        containerEl.remove();
                                        
                                        // Handle empty state manually
                                        if (mealsContainer.children.length === 0) {
                                            mealsContainer.innerHTML = '<p style="text-align: center; color: var(--text-medium); padding: 20px;">ยังไม่มีรายการอาหาร</p>';
                                            mealsContainer.classList.remove('edit-mode');
                                            const toggleBtn = document.getElementById('toggle-edit-meals-btn');
                                            if (toggleBtn) {
                                                toggleBtn.style.background = 'var(--bg-surface)';
                                                toggleBtn.style.color = 'var(--error-base)';
                                            }
                                        }
                                        
                                        const yyyy = selectedDate.getFullYear();
                                        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
                                        const dd = String(selectedDate.getDate()).padStart(2, '0');
                                        const dateStr = `${yyyy}-${mm}-${dd}`;
                                        
                                        const { data: logData, error: fetchErr } = await supabase
                                            .from('daily_logs')
                                            .select('*')
                                            .eq('email', currentUserEmail.toLowerCase())
                                            .eq('date', dateStr)
                                            .maybeSingle();
                                        
                                        let data = logData;
                                        if (data && data.meals) {
                                            // Deduct nutrients from daily totals
                                            data.protein = Math.max(0, (data.protein || 0) - (meal.protein || 0));
                                            data.carb = Math.max(0, (data.carb || 0) - (meal.carb || 0));
                                            data.sodium = Math.max(0, (data.sodium || 0) - (meal.sodium || 0));
                                            data.potassium = Math.max(0, (data.potassium || 0) - (meal.potassium || 0));
                                            data.sugar = Math.max(0, (data.sugar || 0) - (meal.sugar || 0));
                                            
                                            // Deduct fluids
                                            const isUrineForDelete = mealName.includes('ปัสสาวะ');
                                            
                                            if (isUrineForDelete) {
                                                data.urine_output_ml = Math.max(0, (data.urine_output_ml || 0) - (meal.water || 0));
                                            } else if (meal.water > 0) {
                                                data.water_intake_ml = Math.max(0, (data.water_intake_ml || 0) - (meal.water || 0));
                                            }
                                            
                                            // Remove the meal
                                            data.meals.splice(meal.originalIndex, 1);
                                            
                                            // Update via Supabase
                                            const { error: updateErr } = await supabase
                                                .from('daily_logs')
                                                .update({
                                                    protein: data.protein,
                                                    carb: data.carb,
                                                    sodium: data.sodium,
                                                    potassium: data.potassium,
                                                    sugar: data.sugar,
                                                    water_intake_ml: data.water_intake_ml,
                                                    urine_output_ml: data.urine_output_ml,
                                                    meals: data.meals
                                                })
                                                .eq('email', currentUserEmail.toLowerCase())
                                                .eq('date', dateStr);
                                            
                                            if (updateErr) throw updateErr;
                                            
                                            loadDashboardData(true); // Update numbers ONLY, skip meals re-render
                                        }
                                    } catch (err) {
                                        console.error('Delete error', err);
                                        alert('เกิดข้อผิดพลาดในการลบรายการ');
                                    }
                                });
                            });
                            
                            mealsContainer.appendChild(containerEl);
                        });
                    }
                }
            }
        })
        .catch(err => console.error('Error loading dashboard data:', err));
    };
    
    // Only run this part if we are on the dashboard
    if (setupBanner && currentUserEmail) {
        loadDashboardData();
    } else if (setupBanner) {
        setupBanner.style.display = 'block';
    }
    
    // Add Menu Links with Date Parameter
    const btnSearchFood = document.getElementById('btn-search-food');
    const btnAddWater = document.getElementById('btn-add-water');
    const btnAddUrine = document.getElementById('btn-add-urine');
    
    function navigateWithDate(e, baseUrl) {
        e.preventDefault();
        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;
        window.location.href = `${baseUrl}?date=${dateStr}`;
    }
    
    if (btnSearchFood) {
        btnSearchFood.addEventListener('click', (e) => navigateWithDate(e, 'search_food.html'));
    }
    
    if (btnAddWater) {
        btnAddWater.addEventListener('click', (e) => navigateWithDate(e, 'add_water.html'));
    }
    
    if (btnAddUrine) {
        btnAddUrine.addEventListener('click', (e) => navigateWithDate(e, 'add_urine.html'));
    }
});
