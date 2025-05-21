document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas');
    const result = document.getElementById('result');
    const computer_result = document.getElementById('computer-result');
    const button = document.getElementById('play-game');
    const ctx = canvas.getContext('2d');
    const r_t_10 = document.getElementById('10');
    const r_t_15 = document.getElementById('15');
    const r_t_20 = document.getElementById('20');
    const reset_btn = document.getElementById('reset');

    const computerScoreElement = document.getElementById('computer-score');
    const playerScoreElement = document.getElementById('player-score');

    
    let countdownEl = document.getElementById('countdown');
    let winningScore = 10;
    let intervalId = null;
    let isCountingDown = false;

    // Winning Score Setter
    function setWinningScore(button) {
        winningScore = parseInt(button.textContent);
        console.log("Winning Score Set To:", winningScore);
    }

    r_t_10.addEventListener('click', () => setWinningScore(r_t_10));
    r_t_15.addEventListener('click', () => setWinningScore(r_t_15));
    r_t_20.addEventListener('click', () => setWinningScore(r_t_20));

    // Initialize Camera
    function initCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                };
            })
            .catch(err => console.error("Camera error: ", err));
    }

    initCamera();
    
    // Get User Gesture(Rock, Paper, Scissors on Null)
    async function captureAndAnalyze() {
        ctx.setTransform(-1, 0, 0, 1, canvas.width, 0);
        ctx.drawImage(video, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const image_data = canvas.toDataURL('image/jpeg', 0.8);

        try {
            const response = await fetch('/rock_paper_scissors/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: image_data })
            });
            const data = await response.json();
            result.textContent = data.gesture;
            return data.gesture;
        } catch (error) // error handling
        {
            console.error('API error:', error);
            result.textContent = 'Error processing image';
            return null;
        }
    }
    // Get Computer Choice
    async function getComputerChoice() {
        try {
            const response = await fetch('/rock_paper_scissors/get_computer_choice');
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            computer_result.textContent = data.choice;
            return data.choice;
        } catch (error) //Error handlign
        {
            console.error('Error getting data:', error);
            return null;
        }
    }
    //Game Logic
    async function definingGame() {
        const [playerChoice, computerChoice] = await Promise.all([
            captureAndAnalyze(),
            getComputerChoice()
        ]);
       
        if (!computerChoice || !playerChoice) return;

        let computerScore = parseInt(computerScoreElement.textContent, 10);
        let playerScore = parseInt(playerScoreElement.textContent, 10);

        const winning_moves = {
            paper: 'rock',
            rock: 'scissors',
            scissors: 'paper'
        };

        if (playerChoice === computerChoice) {
            // draw
        } else if (winning_moves[computerChoice] === playerChoice) //Computer Wins
            {
            computerScore++;
            computerScoreElement.textContent = computerScore;
        } else if (winning_moves[playerChoice] === computerChoice) // Player Wins
            {
            playerScore++;
            playerScoreElement.textContent = playerScore;
        }

        if (computerScore === winningScore || playerScore === winningScore) 
            {
            const winner = computerScore === winningScore ? "Computer" : "User";
            if (winner === "User") //Spray Confetti if User Wins
            {
                confetti({
                particleCount: 1000,
                spread: 100,
                origin: { y: 0 }
                });
            }
            // Reset when there is a winner or loser
            setTimeout(() => {
                reset();
            }, 500);
        }
    }

    // Countdown function
    async function startCountdown() {
        if (isCountingDown) return;
        isCountingDown = true;
        const moves = ['Rock','Paper','Scissors','Shoot']
        for (let i = 0; i < moves.length; i++) {
            countdownEl.textContent = moves[i];
            countdownEl.style.opacity = '1';
            await new Promise(r => setTimeout(r, 500));
            countdownEl.style.opacity = '0';
            await new Promise(r => setTimeout(r, 100));
        }
        countdownEl.textContent = '';
        isCountingDown = false;
    }

    // Run countdown and then the game logic
    async function runRound() {
        await startCountdown();
        await definingGame();
    }

    // Reset Game
    function reset() {
        computerScoreElement.textContent = '0';
        playerScoreElement.textContent = '0';
        winningScore = 10;
        console.log(`Winning Score Reset to: ${winningScore}`);

        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    // Play Game Button Click
    button.addEventListener('click', () => {
        if (intervalId === null) {
            // Run the first round immediately, then set interval for subsequent rounds
            runRound();
            intervalId = setInterval(runRound, 3500);
        }
    });

    // Reset Button Click
    reset_btn.addEventListener('click', reset);
});
