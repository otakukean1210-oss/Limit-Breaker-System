let level = 1;
let currentExp = 0;
let expToNextLevel = 100;

let stats = {
    strength: 10,
    endurance: 10,
    agility: 10,
    perception: 10
};

let statGainCounters = {
    strength: 0,
    endurance: 0,
    agility: 10,
    perception: 0
};

let completedTasks = {};
let currentWeekStart = 0; 

let metrics = {
    name: "Limit Breaker",
    height: "5'10\"",
    weight: "170 lbs"
};

const defaultWorkoutData = [
    { day: "Monday", focus: "LIFT: Workout A", class: "", tasks: [
        { name: "Squats/Goblet Squats (3 sets)", exp: 5, focus: "strength" },
        { name: "Dumbbell Floor Press (3 sets)", exp: 5, focus: "strength" },
        { name: "Bent-Over Barbell Rows (3 sets)", exp: 5, focus: "strength" },
        { name: "Standing Dumbbell Overhead Press (3 sets)", exp: 5, focus: "strength" },
        { name: "Dumbbell Bicep Curls (3 sets)", exp: 5, focus: "strength" }
    ]},
    { day: "Tuesday", focus: "ACTIVE RECOVERY", class: "recovery", tasks: [
        { name: "Jog: 40-60 minutes", exp: 10, focus: "endurance" },
        { name: "Flexibility: Taekwondo Stretching (15-20 min)", exp: 5, focus: "perception" }
    ]},
    { day: "Wednesday", focus: "LIFT: Workout B", class: "", tasks: [
        { name: "Barbell RDLs (3 sets)", exp: 5, focus: "strength" },
        { name: "Dumbbell Lunges (3 sets)", exp: 5, focus: "strength" },
        { name: "Push-ups (3x Failure)", exp: 5, focus: "strength" },
        { name: "Dumbbell Lateral Raises (3 sets)", exp: 5, focus: "strength" },
        { name: "Dumbbell Triceps Extensions (3 sets)", exp: 5, focus: "strength" },
        { name: "CORE FINISHER (2 Rounds)", exp: 5, focus: "strength" }
    ]},
    { day: "Thursday", focus: "ACTIVE RECOVERY", class: "recovery", tasks: [
        { name: "Jog: 40-60 minutes", exp: 10, focus: "endurance" },
        { name: "Kickboxing/Shadow Work (30 min)", exp: 5, focus: "agility" }
    ]},
    { day: "Friday", focus: "LIFT: Workout A or B", class: "", tasks: [
        { name: "Complete Full Workout A or B", exp: 25, focus: "strength" }
    ]},
    { day: "Saturday", focus: "ACTIVE RECOVERY", class: "recovery", tasks: [
        { name: "Jog or Long Walk", exp: 10, focus: "endurance" },
        { name: "Flexibility/Mobility", exp: 5, focus: "perception" }
    ]},
    { day: "Sunday", focus: "REST", class: "rest-day", tasks: [
        { name: "Complete rest, essential for growth!", exp: 5, focus: "endurance" }
    ]}
];

let workoutData = defaultWorkoutData; 
let myChart = null; 
let anatomyChart = null; 

function saveData() {
    localStorage.setItem('systemLevel', level);
    localStorage.setItem('systemCurrentExp', currentExp);
    localStorage.setItem('systemExpToNextLevel', expToNextLevel);
    localStorage.setItem('systemStats', JSON.stringify(stats));
    localStorage.setItem('systemMetrics', JSON.stringify(metrics));
    localStorage.setItem('statGainCounters', JSON.stringify(statGainCounters));
    localStorage.setItem('customWorkoutData', JSON.stringify(workoutData));
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    localStorage.setItem('currentWeekStart', currentWeekStart); 
}

function loadData() {
    const savedLevel = localStorage.getItem('systemLevel');
    const savedExp = localStorage.getItem('systemCurrentExp');
    const savedMaxExp = localStorage.getItem('systemExpToNextLevel');
    
    if (savedLevel) level = parseInt(savedLevel);
    if (savedExp) currentExp = parseInt(savedExp);
    if (savedMaxExp) expToNextLevel = parseInt(savedMaxExp);

    const savedStats = localStorage.getItem('systemStats');
    if (savedStats) stats = JSON.parse(savedStats);

    const savedMetrics = localStorage.getItem('systemMetrics');
    if (savedMetrics) metrics = JSON.parse(savedMetrics);

    const savedCounters = localStorage.getItem('statGainCounters');
    if (savedCounters) statGainCounters = JSON.parse(savedCounters);
    
    const savedWorkout = localStorage.getItem('customWorkoutData');
    if (savedWorkout) {
        try {
            workoutData = JSON.parse(savedWorkout);
        } catch (e) {
            console.error("Invalid workout JSON loaded, using default.", e);
            workoutData = defaultWorkoutData;
        }
    }
    const savedWeekStart = localStorage.getItem('currentWeekStart');
    if (savedWeekStart) currentWeekStart = parseInt(savedWeekStart);
}

function findHighestStatFocus() {
    let highestStat = 'strength'; 
    let maxValue = -1; 

    for (const key in statGainCounters) {
        if (statGainCounters[key] > maxValue) {
            maxValue = statGainCounters[key];
            highestStat = key;
        }
    }
    return highestStat;
}

function levelUp() {
    level++;
    currentExp = 0;
    expToNextLevel += 50; 

    const strongestFocusStat = findHighestStatFocus();
    
    let statsRaised = []; 

    Object.keys(stats).forEach(key => {
        if (key === strongestFocusStat) {
            stats[key] = parseFloat(stats[key]) + 3; 
            statsRaised.push(`+3 ${key.toUpperCase()}`);
        } else {
            stats[key] = parseFloat(stats[key]) + 1; 
            statsRaised.push(`+1 ${key.toUpperCase()}`);
        }
        stats[key] = parseFloat(stats[key].toFixed(1)); 
    });

    statGainCounters = { strength: 0, endurance: 0, agility: 0, perception: 0 };

    alert(`[SYSTEM ALERT] Congratulations! You have Leveled Up! Your current Level is ${level}.\n\nStat Boosts:\n${statsRaised.join('\n')}\n\nYour primary focus was ${strongestFocusStat.toUpperCase()}, granting a larger bonus!`);

    updateStatsDisplay();
    saveData(); 
}

function gainExp(amount) {
    currentExp += amount;
    
    while (currentExp >= expToNextLevel) {
        levelUp();
    }
    
    if (currentExp < 0) currentExp = 0;

    updateExpBar();
    saveData(); 
}

function checkWeeklyReset() {
    const today = new Date();
    const todayDay = today.getDay();
    const weekDurationInMs = 604799000;
    
    currentWeekStart = parseInt(localStorage.getItem('currentWeekStart') || '0');
    const lastResetTime = new Date(currentWeekStart);

    if (currentWeekStart === 0) {
        currentWeekStart = today.getTime();
        saveData();
        return;
    }

    if (todayDay === 0 && (today.getTime() - lastResetTime.getTime() >= weekDurationInMs)) {
        
        completedTasks = {}; 
        currentWeekStart = today.getTime(); 
        saveData(); 
        
        console.log('[SYSTEM ALERT] New Week, New Quests! Progress reset.');
    }
}

let anatomyScene, anatomyCamera, anatomyRenderer, threeDModel; 

function initAnatomy3D() {
    const container = document.getElementById('anatomy-graph-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    anatomyScene = new THREE.Scene();
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); 
    anatomyScene.add(ambientLight);

    anatomyCamera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    anatomyCamera.position.z = 3; 

    anatomyRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    anatomyRenderer.setSize(width, height);

    container.innerHTML = ''; 
    container.appendChild(anatomyRenderer.domElement);
    
    anatomyRenderer.setClearColor(0x000000, 0); 

    const loader = new THREE.GLTFLoader();
    
    const modelPath = 'assets/3d/scene.gltf'; 

    loader.load(modelPath, function(gltf) {
        threeDModel = gltf.scene;

        threeDModel.traverse(function(child) {
            if (child.isMesh) {
                child.material = new THREE.MeshBasicMaterial({
                    color: 0x445ef2,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.8
                });
            }
        });
        
        threeDModel.scale.set(0.6, 0.6, 0.6); 
        threeDModel.position.set(0, 0.0, 0); 
        
        anatomyScene.add(threeDModel);
        animateAnatomy();
        
    }, undefined, function(error) {
        console.error('An error occurred loading the 3D model:', error);
        container.innerHTML = '<h3>[SYSTEM ERROR] Model failed to load.</h3>';
    });
}

function animateAnatomy() {
    requestAnimationFrame(animateAnatomy);

    if (threeDModel) {
        threeDModel.rotation.y += 0.005; 
    }
    
    anatomyRenderer.render(anatomyScene, anatomyCamera);
}

function getAnatomyChartConfig() {
    initAnatomy3D();
}

function renderQuestLog() {
    const tbody = document.getElementById('quest-log-body');
    tbody.innerHTML = ''; 

    let html = '';
    
    workoutData.forEach((dayData, dayIndex) => {
        let tasksHtml = '<div class="task-list">';
        dayData.tasks.forEach((task, taskIndex) => {
            tasksHtml += `
                <label>
                    <input 
                        type="checkbox" 
                        class="task-checkbox" 
                        data-exp="${task.exp}" 
                        data-stat-focus="${task.focus}"
                        data-day-index="${dayIndex}"
                        data-task-index="${taskIndex}"
                    > 
                    ${task.name}
                </label><br>
            `;
        });
        tasksHtml += '</div>';

        html += `
            <tr class="${dayData.class}">
                <td class="checkbox-column day-complete"><input type="checkbox" data-day="${dayData.day}" class="day-checkbox"></td>
                <td class="day-focus-column">
                    **${dayData.day}:** ${dayData.focus}
                </td>
                <td>
                    ${tasksHtml}
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
    attachListeners(); 
}

function openEditor() {
    const modal = document.getElementById('quest-editor-modal');
    const textarea = document.getElementById('editor-textarea');

    textarea.value = JSON.stringify(workoutData, null, 4); 
    modal.style.display = 'block';
}

function closeEditor() {
    document.getElementById('quest-editor-modal').style.display = 'none';
}

function saveEditorContent() {
    const textarea = document.getElementById('editor-textarea');
    try {
        const newWorkoutData = JSON.parse(textarea.value);

        if (!Array.isArray(newWorkoutData)) {
            alert("[SYSTEM ERROR] Failed to save. Input must be a valid JSON array (`[...]`).");
            return;
        }

        workoutData = newWorkoutData;
        renderQuestLog(); 
        saveData();  
        closeEditor();
        alert("[SYSTEM ALERT] Quest Log updated successfully!");

    } catch (e) {
        alert("[SYSTEM ERROR] Invalid JSON format. Please check for missing commas, brackets, or quotes.");
        console.error("JSON Parsing Error:", e);
    }
}

function getChartConfig() {
    const chartCtx = document.getElementById('stat-chart');
    if (!chartCtx) return; 

    return {
        type: 'radar',
        data: {
            labels: ['Strength', 'Endurance', 'Agility', 'Perception'],
            datasets: [{
                label: 'Current Status',
                data: [stats.strength, stats.endurance, stats.agility, stats.perception],
                backgroundColor: 'rgba(164, 128, 242, 0.3)', 
                borderColor: '#a480f2', 
                pointBackgroundColor: '#445ef2', 
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#a480f2'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            plugins: { legend: { display: false } },
            layout: {
                padding: {
                    top: 5,
                    bottom: 35,
                    left: 15,
                    right: 15
                }
            },

            scales: {
                r: {
                    angleLines: { color: 'rgba(242, 242, 242, 0.3)' },
                    grid: { color: 'rgba(242, 242, 242, 0.3)' },
                    pointLabels: { color: '#f2f2f2', font: { size: 14 } },
                    suggestedMin: 0, 
                    suggestedMax: 20 + (level * 2), 
                    ticks: { display: false },
                    backgroundColor: 'rgba(29, 19, 64, 0.5)' 
                }
            }
        }
    };
}

function updateStatsDisplay() {
    document.getElementById('name-input').value = metrics.name;
    document.getElementById('height-input').value = metrics.height;
    document.getElementById('weight-input').value = metrics.weight;

    document.getElementById('strength-stat').textContent = stats.strength.toFixed(1);
    document.getElementById('endurance-stat').textContent = stats.endurance.toFixed(1);
    document.getElementById('agility-stat').textContent = stats.agility.toFixed(1);
    document.getElementById('perception-stat').textContent = stats.perception.toFixed(1);

    if (myChart) {
        myChart.data.datasets[0].data = [
            stats.strength,
            stats.endurance,
            stats.agility,
            stats.perception
        ];
        myChart.options.scales.r.suggestedMax = 20 + (level * 2); 
        myChart.update();
    }
}

function updateExpBar() {
    const percentage = Math.min(100, (currentExp / expToNextLevel) * 100);
    document.getElementById('exp-bar').style.width = `${percentage}%`;
    document.getElementById('current-exp-display').textContent = currentExp;
    document.getElementById('max-exp-display').textContent = expToNextLevel;
    document.getElementById('level-stat').textContent = level;
}

function handleInputSave(event) {
    metrics.name = document.getElementById('name-input').value;
    metrics.height = document.getElementById('height-input').value;
    metrics.weight = document.getElementById('weight-input').value;
    updateStatsDisplay(); 
    saveData(); 
}

function handleCheckboxChange(event) {
    const checkbox = event.target;
    
    if (checkbox.classList.contains('task-checkbox')) {
        const expValue = parseInt(checkbox.dataset.exp);
        const statFocus = checkbox.dataset.statFocus;

        if (checkbox.checked) {
            gainExp(expValue);
            if (statFocus && statGainCounters[statFocus] !== undefined) {
                statGainCounters[statFocus]++;
            }
        } else {
            gainExp(-expValue);
            if (statFocus && statGainCounters[statFocus] !== undefined) {
                statGainCounters[statFocus]--;
            }
        }
    } 
    
    else if (checkbox.classList.contains('day-checkbox')) {
        const row = checkbox.closest('tr');
        if (checkbox.checked) {
            row.classList.add('completed');
        } else {
            row.classList.remove('completed');
        }
    }

    saveData(); 
}

function attachListeners() {
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.removeEventListener('change', handleCheckboxChange);
        checkbox.addEventListener('change', handleCheckboxChange);
    });
}

function init() {
    loadData();

    checkWeeklyReset(); 

    const chartConfig = getChartConfig();
    if (chartConfig) myChart = new Chart(document.getElementById('stat-chart'), chartConfig);

    getAnatomyChartConfig(); 

    renderQuestLog();
    attachListeners();

    updateStatsDisplay();
    updateExpBar();

    document.getElementById('name-input').addEventListener('change', handleInputSave);
    document.getElementById('height-input').addEventListener('change', handleInputSave);
    document.getElementById('weight-input').addEventListener('change', handleInputSave);

    document.getElementById('edit-quests-btn').addEventListener('click', openEditor);
    document.getElementById('save-editor-btn').addEventListener('click', saveEditorContent);
    document.getElementById('close-editor-btn').addEventListener('click', closeEditor);

    attachListeners();
}

init();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js') 
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}