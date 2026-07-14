        let globalProfiles = [];
        let globalLogs = [];
        let userChartInstance = null;
        let currentEditingEmail = null;

        // Auto login check
        document.addEventListener('DOMContentLoaded', async () => {
            const currentUser = localStorage.getItem('currentUserEmail');
            if (currentUser) {
                try {
                    // Fetch to check admin status
                    const { data, error } = await supabase.from('profiles').select('limits').eq('email', currentUser.toLowerCase()).single();
                    
                    let isAdmin = false;
                    
                    // Always allow the failsafe email regardless of DB result
                    if (currentUser.toLowerCase() === 'chonprecha2006@gmail.com') {
                        isAdmin = true;
                    } else if (data && data.limits) {
                        try {
                            const parsed = typeof data.limits === 'string' ? JSON.parse(data.limits) : data.limits;
                            if (parsed.is_admin === true) {
                                isAdmin = true;
                            }
                        } catch(e) {
                            console.error("Error parsing limits", e);
                        }
                    }
                    
                    if (isAdmin) {
                        document.getElementById('admin-login').style.display = 'none';
                        document.getElementById('admin-content').style.display = 'block';
                        loadAdminData();
                        return;
                    }
                } catch (err) {
                    console.error("Error fetching profile for admin check:", err);
                }
            }
            
            const spinnerWrapper = document.querySelector('#admin-login .fa-circle-notch');
            if (spinnerWrapper && spinnerWrapper.parentElement) {
                spinnerWrapper.parentElement.style.display = 'none';
            }
            document.getElementById('debug-email').textContent = currentUser || '(ไม่ได้ล็อกอิน)';
            document.getElementById('login-error').style.display = 'block';
        });

        // Set Chart defaults for dark mode support
        Chart.defaults.color = 'var(--text-medium)';
        Chart.defaults.font.family = "'Prompt', sans-serif";

        async function loadAdminData() {
            try {
                // Fetch all profiles
                const { data: profiles, error: profileErr } = await supabase.from('profiles').select('*');
                if (profileErr) throw profileErr;
                
                // Fetch all daily logs
                const { data: logs, error: logErr } = await supabase.from('daily_logs').select('*');
                if (logErr) throw logErr;
                
                globalProfiles = profiles;
                globalLogs = logs;
                
                document.getElementById('total-users').textContent = profiles.length;
                
                const today = new Date();
                const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
                
                const todayLogs = logs.filter(log => log.date === todayStr);
                document.getElementById('today-logs').textContent = todayLogs.length;

                renderUserList(profiles);
                processChartData(profiles, logs);
                
            } catch (err) {
                console.error("Admin Load Error", err);
                alert("โหลดข้อมูลล้มเหลว");
            }
        }
        
        function renderUserList(profiles) {
            const container = document.getElementById('user-list-container');
            if(profiles.length === 0) {
                container.innerHTML = '<p style="text-align:center;">ไม่มีข้อมูลผู้ใช้</p>';
                return;
            }
            
            let html = '';
            profiles.forEach(p => {
                let isAdmin = false;
                if (p.limits) {
                    try {
                        const parsed = typeof p.limits === 'string' ? JSON.parse(p.limits) : p.limits;
                        if (parsed.is_admin === true) isAdmin = true;
                    } catch(e) {}
                }
                const adminBadge = isAdmin ? ' <span style="background: rgba(245,158,11,0.15); color: #F59E0B; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 4px; border: 1px solid rgba(245,158,11,0.3);">แอดมิน 👑</span>' : '';
                
                html += `
                    <div class="user-row" onclick="openUserModal('${p.email}')">
                        <div>
                            <strong>${p.name || 'ไม่ระบุชื่อ'}</strong>${adminBadge}
                            <div style="font-size: 12px; color: var(--text-medium);">${p.email}</div>
                        </div>
                        <div style="text-align: right; font-size: 13px; color: var(--text-medium);">
                            น้ำหนัก: ${p.weight || '?'} kg<br>
                            เพศ: ${p.gender === 'male' ? 'ชาย' : (p.gender === 'female' ? 'หญิง' : '-')}
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }
        
        function processChartData(profiles, logs) {
            // 1. Bar Chart: Average Protein & Sodium per user
            const userStats = {};
            profiles.forEach(p => {
                userStats[p.email] = { name: p.name || p.email.split('@')[0], protein: 0, sodium: 0, count: 0 };
            });
            
            logs.forEach(log => {
                if (userStats[log.email]) {
                    userStats[log.email].protein += (log.protein || 0);
                    userStats[log.email].sodium += (log.sodium || 0);
                    userStats[log.email].count += 1;
                }
            });
            
            const labels = [];
            const proteinData = [];
            const sodiumData = []; // Scaled down for visualization
            
            Object.values(userStats).forEach(stat => {
                if(stat.count > 0) {
                    labels.push(stat.name.substring(0, 10)); // Short name
                    proteinData.push(stat.protein / stat.count);
                    sodiumData.push((stat.sodium / stat.count) / 10); // scale down sodium by 10 for bar chart
                }
            });
            
            new Chart(document.getElementById('barChart'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'โปรตีน (g)',
                            backgroundColor: '#10B981',
                            data: proteinData
                        },
                        {
                            label: 'โซเดียม (100mg)',
                            backgroundColor: '#3B82F6',
                            data: sodiumData
                        }
                    ]
                },
                options: { responsive: true }
            });

            // 2. Line Chart: Average water intake over the last 7 days
            const last7Days = [];
            for(let i=6; i>=0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                last7Days.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
            }
            
            const waterTrends = last7Days.map(date => {
                const logsForDate = logs.filter(l => l.date === date);
                if(logsForDate.length === 0) return 0;
                const totalWater = logsForDate.reduce((sum, l) => sum + (l.water || 0), 0);
                return totalWater / logsForDate.length;
            });
            
            new Chart(document.getElementById('lineChart'), {
                type: 'line',
                data: {
                    labels: last7Days.map(d => d.substring(5)), // Show MM-DD
                    datasets: [{
                        label: 'น้ำดื่มเฉลี่ย (ml)',
                        borderColor: '#0EA5E9',
                        backgroundColor: 'rgba(14, 165, 233, 0.2)',
                        data: waterTrends,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: { responsive: true }
            });

            // 3. Pie Chart: Within Limits vs Exceeded
            let withinLimit = 0;
            let exceeded = 0;
            
            logs.forEach(log => {
                // Skip days where the user hasn't recorded any food (all zero)
                if ((log.protein || 0) === 0 && (log.sodium || 0) === 0 && (log.carb || 0) === 0) {
                    return; // Skip empty logs
                }
                
                // Find user profile to get specific limits
                const user = profiles.find(p => p.email === log.email);
                let limits = { sodium: 2000, protein: 40 }; // Defaults
                if (user && user.limits) {
                    try { 
                        const parsed = JSON.parse(user.limits);
                        if (parsed.sodium) limits.sodium = parsed.sodium;
                        if (parsed.protein) limits.protein = parsed.protein;
                    } catch(e) {}
                }
                
                // Check if they stayed within limits for both protein and sodium
                if ((log.sodium || 0) <= limits.sodium && (log.protein || 0) <= limits.protein) {
                    withinLimit++;
                } else {
                    exceeded++;
                }
            });
            
            if(withinLimit === 0 && exceeded === 0) { 
                // Fallback if no logs exist
                withinLimit = 1; 
                exceeded = 0; 
            }
            
            new Chart(document.getElementById('pieChart'), {
                type: 'doughnut',
                data: {
                    labels: ['คุมได้ดี', 'เกินเกณฑ์'],
                    datasets: [{
                        data: [withinLimit, exceeded],
                        backgroundColor: ['#10B981', '#EF4444'],
                        borderWidth: 0
                    }]
                },
                options: { responsive: true }
            });
        }

        function openUserModal(email) {
            const user = globalProfiles.find(p => p.email === email);
            if (!user) return;
            
            document.getElementById('modal-user-name').textContent = user.name || 'ไม่ระบุชื่อ';
            document.getElementById('modal-user-email').textContent = user.email;
            document.getElementById('modal-user-weight').textContent = user.weight || '?';
            document.getElementById('modal-user-height').textContent = user.height || '?';
            document.getElementById('modal-user-gender').textContent = user.gender === 'male' ? 'ชาย' : (user.gender === 'female' ? 'หญิง' : '-');
            
            let limits = {};
            try { limits = typeof user.limits === 'string' ? JSON.parse(user.limits || '{}') : (user.limits || {}); } catch(e){}
            
            const sodiumLimit = limits.sodium || 2000;
            const proteinLimit = limits.protein || 40;
            const isAdmin = limits.is_admin === true;
            
            const adminBtn = document.getElementById('toggle-admin-btn');
            if (isAdmin) {
                adminBtn.innerHTML = '❌ ถอดยศแอดมิน';
                adminBtn.style.color = '#EF4444';
                adminBtn.style.background = 'rgba(239, 68, 68, 0.1)';
                adminBtn.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            } else {
                adminBtn.innerHTML = '👑 เลื่อนขั้นเป็นแอดมิน';
                adminBtn.style.color = '#F59E0B';
                adminBtn.style.background = 'rgba(245, 158, 11, 0.1)';
                adminBtn.style.borderColor = 'rgba(245, 158, 11, 0.3)';
            }
            
            document.getElementById('modal-user-sodium-limit').textContent = sodiumLimit;
            document.getElementById('modal-user-protein-limit').textContent = proteinLimit;
            
            // Populate Edit Form
            currentEditingEmail = email;
            document.getElementById('edit-sodium').value = sodiumLimit;
            document.getElementById('edit-protein').value = proteinLimit;
            document.getElementById('edit-success-msg').style.display = 'none';
            
            // Filter logs for this user
            const userLogs = globalLogs.filter(l => l.email === email);
            
            // Render User Specific Chart
            const last7Days = [];
            for(let i=6; i>=0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                last7Days.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
            }
            
            const pData = [];
            const sData = [];
            last7Days.forEach(date => {
                const logForDate = userLogs.find(l => l.date === date);
                if (logForDate) {
                    pData.push(logForDate.protein || 0);
                    sData.push((logForDate.sodium || 0) / 10);
                } else {
                    pData.push(0);
                    sData.push(0);
                }
            });
            
            if (userChartInstance) userChartInstance.destroy();
            userChartInstance = new Chart(document.getElementById('userLineChart'), {
                type: 'line',
                data: {
                    labels: last7Days.map(d => d.substring(5)),
                    datasets: [
                        { label: 'โปรตีน (g)', data: pData, borderColor: '#10B981', tension: 0.3 },
                        { label: 'โซเดียม (100mg)', data: sData, borderColor: '#3B82F6', tension: 0.3 }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
            
            // Render recent meals (from latest log)
            // Sort userLogs descending by date
            const sortedLogs = [...userLogs].sort((a,b) => b.date.localeCompare(a.date));
            const logsContainer = document.getElementById('modal-user-logs');
            logsContainer.innerHTML = '';
            
            if (sortedLogs.length === 0) {
                logsContainer.innerHTML = '<p style="color: var(--text-medium); font-size: 14px;">ไม่มีประวัติการกิน</p>';
            } else {
                const latestLog = sortedLogs[0];
                let meals = [];
                try { meals = JSON.parse(latestLog.meals || '[]'); } catch(e){}
                
                let html = `<div style="font-size:13px; margin-bottom:8px; color:var(--text-medium);">บันทึกล่าสุด: ${latestLog.date}</div>`;
                if (meals.length === 0) {
                    html += '<p style="font-size:14px;">(ไม่พบรายการอาหารในวันนี้)</p>';
                }
                meals.forEach(m => {
                    html += `<div class="log-item">
                        <strong>${m.name}</strong> 
                        <div style="color:var(--text-medium); font-size: 12px; margin-top: 4px;">โปรตีน ${m.protein}g | โซเดียม ${m.sodium}mg</div>
                    </div>`;
                });
                logsContainer.innerHTML = html;
            }
            
            document.getElementById('user-modal').style.display = 'flex';
        }
        
        function closeUserModal() {
            document.getElementById('user-modal').style.display = 'none';
            currentEditingEmail = null;
        }

        async function saveUserLimits() {
            if (!currentEditingEmail) return;
            
            const newSodium = parseInt(document.getElementById('edit-sodium').value) || 2000;
            const newProtein = parseInt(document.getElementById('edit-protein').value) || 40;
            
            const user = globalProfiles.find(p => p.email === currentEditingEmail);
            if (!user) return;
            
            let currentLimits = {};
            try { currentLimits = JSON.parse(user.limits || '{}'); } catch(e){}
            
            currentLimits.sodium = newSodium;
            currentLimits.protein = newProtein;
            
            const limitsStr = JSON.stringify(currentLimits);
            
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({ limits: limitsStr })
                    .eq('email', currentEditingEmail);
                    
                if (error) throw error;
                
                // Update local data
                user.limits = limitsStr;
                
                // Update UI visually
                document.getElementById('modal-user-sodium-limit').textContent = newSodium;
                document.getElementById('modal-user-protein-limit').textContent = newProtein;
                
                const msg = document.getElementById('edit-success-msg');
                msg.style.display = 'block';
                setTimeout(() => { msg.style.display = 'none'; }, 3000);
                
                // Re-process charts if needed
                processChartData(globalProfiles, globalLogs);
                
            } catch (err) {
                console.error("Error updating limits:", err);
                alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            }
        async function toggleAdminStatus() {
            if (!currentEditingEmail) return;
            
            const user = globalProfiles.find(p => p.email === currentEditingEmail);
            if (!user) return;
            
            let currentLimits = {};
            try { currentLimits = typeof user.limits === 'string' ? JSON.parse(user.limits || '{}') : (user.limits || {}); } catch(e){}
            
            currentLimits.is_admin = !currentLimits.is_admin; // Toggle boolean
            
            // Cannot remove yourself if it's the last one? We won't strictly block it, but good to know
            if (currentEditingEmail.toLowerCase() === 'chonprecha2006@gmail.com' && !currentLimits.is_admin) {
                if (!confirm("คุณกำลังจะถอดยศตัวเอง แน่ใจหรือไม่? (คุณยังมีสิทธิ์ฉุกเฉินอยู่)")) {
                    return;
                }
            }
            
            const limitsStr = JSON.stringify(currentLimits);
            
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({ limits: limitsStr })
                    .eq('email', currentEditingEmail);
                    
                if (error) throw error;
                
                // Update local data
                user.limits = limitsStr;
                
                // Refresh Modal UI
                openUserModal(currentEditingEmail);
                
                // Refresh List UI
                renderUserList(globalProfiles);
                
                const msg = document.getElementById('edit-success-msg');
                msg.textContent = currentLimits.is_admin ? "เลื่อนขั้นเป็นแอดมินสำเร็จ!" : "ถอดยศแอดมินสำเร็จ!";
                msg.style.display = 'block';
                setTimeout(() => { msg.style.display = 'none'; }, 3000);
                
            } catch (err) {
                console.error("Error toggling admin:", err);
                alert("เกิดข้อผิดพลาดในการเปลี่ยนยศแอดมิน");
            }
        }
