const questions = [
{q:"What is Cloud Computing?", o:["Local storage","Internet-based services","Hardware","None"], a:"Internet-based services"},
{q:"Which is cloud provider?", o:["AWS","Intel","AMD","Dell"], a:"AWS"},
{q:"IaaS stands for?", o:["Infra as Service","Internet Service","Internal Service","None"], a:"Infra as Service"},
{q:"SaaS example?", o:["Google Docs","CPU","RAM","Hard disk"], a:"Google Docs"},
{q:"PaaS means?", o:["Platform as Service","Program","Process","None"], a:"Platform as Service"},
{q:"Cloud is?", o:["Virtual","Physical","Manual","None"], a:"Virtual"},
{q:"Which is storage service?", o:["S3","EC2","Lambda","None"], a:"S3"},
{q:"Deployment model?", o:["Public","Private","Hybrid","All"], a:"All"},
{q:"Benefit?", o:["Scalable","Flexible","Cost saving","All"], a:"All"},
{q:"Risk?", o:["Security","Latency","Downtime","All"], a:"All"}
];

let index=0, score=0, time=60, userAnswers = [], startTime, warningShown = false, timerId, submitted = false;

function loadQ(){
    document.getElementById("q").innerText=questions[index].q;
    let html="";
    questions[index].o.forEach((opt, i)=>{
        html+=`<button class="option-btn" onclick="check('${opt}', ${i})">${opt}</button>`;
    });
    document.getElementById("opt").innerHTML=html;
    document.getElementById("next-btn").disabled = true;
}

function check(ans, optIndex){
    userAnswers[index] = ans;
    if(ans===questions[index].a) score++;
    // Highlight selected option
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    buttons[optIndex].classList.add('selected');
    // Enable next button
    document.getElementById("next-btn").disabled = false;

    // Update progress
    updateProgress();
}

function updateProgress() {
    const attempted = userAnswers.filter(answer => answer !== undefined).length;
    const pending = questions.length - attempted;
    const progressPercentage = (attempted / questions.length) * 100;

    // Update progress bar
    document.getElementById("progress-bar").style.width = progressPercentage + "%";

    // Update counters
    document.getElementById("attempted-count").textContent = attempted;
    document.getElementById("pending-count").textContent = pending;

    // Update labels
    document.getElementById("attempted-label").textContent = attempted + " Attempted";
    document.getElementById("pending-label").textContent = pending + " Pending";
}

function showTimeWarning(seconds) {
    document.getElementById("warning-time").textContent = seconds;
    const modal = new bootstrap.Modal(document.getElementById('timeWarningModal'));
    modal.show();
}

function updateWarningTime(seconds) {
    const warningElement = document.getElementById("warning-time");
    if(warningElement) {
        warningElement.textContent = seconds;
    }
}

function submitQuiz(){
    if (submitted) return;
    submitted = true;
    if (timerId) clearInterval(timerId);
    const endTime = Date.now();
    const timeTaken = Math.floor((endTime - startTime) / 1000); // in seconds
    const user = JSON.parse(localStorage.getItem("currentUser")) || { name: "Guest", email: "" };

    // Count attempted questions (non-undefined answers)
    const attemptedQuestions = userAnswers.filter(answer => answer !== undefined).length;

    const quizResult = {
        name: user.name,
        email: user.email,
        score: score,
        totalQuestions: questions.length,
        attemptedQuestions: attemptedQuestions,
        timeTaken: timeTaken,
        date: new Date().toLocaleString(),
        answers: userAnswers
    };

    // Store quiz result
    let quizHistory = JSON.parse(localStorage.getItem("quizHistory")) || [];
    quizHistory.push(quizResult);
    localStorage.setItem("quizHistory", JSON.stringify(quizHistory));

    localStorage.setItem("score",score);
    localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
    localStorage.setItem("questions", JSON.stringify(questions));
    localStorage.setItem("timeTaken", timeTaken);
    localStorage.setItem("attemptedQuestions", attemptedQuestions);
    window.location.href="result.html";
}

function next(){
    index++;
    if(index<questions.length) loadQ();
    else{
        submitQuiz();
    }
}

// TIMER
timerId = setInterval(()=>{
    time--;
    const timeElement = document.getElementById("time");
    timeElement.innerText = time;

    // Remove existing warning classes
    timeElement.classList.remove('timer-warning', 'timer-critical');

    // Add warning classes based on time remaining
    if(time <= 5) {
        timeElement.classList.add('timer-critical');
    } else if(time <= 10) {
        timeElement.classList.add('timer-warning');
    }

    // Show modal warning at 10 seconds
    if(time === 10 && !warningShown) {
        showTimeWarning(10);
        warningShown = true;
    }

    // Update modal time if it's still open
    if(time <= 10 && time > 0) {
        updateWarningTime(time);
    }

    if(time <= 0) {
        submitQuiz(); // Submit immediately when time runs out
    }
},1000);

window.onload = function() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }
    startTime = Date.now();
    loadQ();
};