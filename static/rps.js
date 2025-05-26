document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas');
    const play_button = document.getElementById('play-game');
    const pause_button = document.getElementById('pause-game');
    const ctx = canvas.getContext('2d');
    const r_t_10 = document.getElementById('10');
    const r_t_15 = document.getElementById('15');
    const r_t_20 = document.getElementById('20');
    const reset_btn = document.getElementById('reset');
    const user_image = document.getElementById('user-image');
    const computer_image = document.getElementById('computer-image');
    const computerScoreElement = document.getElementById('computer-score');
    const playerScoreElement = document.getElementById('player-score');
    const countdownEl = document.getElementById('countdown');
    const transparent = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="; //transparent placeholder
    
    let winningScore = 10;
    let intervalId = null;
    let isGameActive = false;
   
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
            return data.gesture;
        } 
        catch (error) // Error handling
        {
            console.error('API error:', error);
            return null;
        }
    }
    // Get Computer Choice
    async function getComputerChoice() {
        try {
            const response = await fetch('/rock_paper_scissors/get_computer_choice');
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            return data.choice;
        } 
        catch (error) //Error handling
        {
            console.error('Error getting data:', error);
            return null;
        }
    }
    
    // Countdown function
    async function startCountdown() {
       const moves = ['Rock','Paper','Scissors','Shoot']
        for (let i = 0; i < moves.length; i++) {
            countdownEl.textContent = moves[i];
            countdownEl.style.opacity = '1';
            await new Promise(r => setTimeout(r, 500));
            countdownEl.style.opacity = '0';
            await new Promise(r => setTimeout(r, 100));
        }
        countdownEl.textContent = '';
    }

    //Game Logic
    async function definingGame() {
        const [playerChoice, computerChoice] = await Promise.all([
            captureAndAnalyze(),
            getComputerChoice()
        ]);
       
        if (!computerChoice || !playerChoice) return;
        user_image.src = `/static/images/${playerChoice}.png`;
        user_image.alt = playerChoice;

        computer_image.src = `/static/images/${computerChoice}.png`;
        computer_image.alt = computerChoice;

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
            const winner = computerScore === winningScore ? "Computer" : "You";
            if (winner === "You") //Spray Confetti if User Wins
            {
                countdownEl.style.opacity = 1
                countdownEl.textContent = "You Win!" // Flash 'You Win' on the webpage
                confetti({
                particleCount: 1000,
                spread: 100,
                origin: { y: 0 }
                });
            }
            else if(winner === 'Computer'){
                countdownEl.style.opacity = 1
                countdownEl.textContent = "Computer Wins!"// Flash 'Computer Wins' on the webpage
            }
            // Reset when there is a winner or loser
            resetEndGame();
        }
    }

    

    // Run countdown and then the game logic
    async function runRound() {
        await startCountdown();
        if (!isGameActive) return;
        await definingGame();
    }

    // Reset Game
    function reset() {
        isGameActive = false;
        countdownEl.textContent = ''
        computerScoreElement.textContent = '0';
        playerScoreElement.textContent = '0';
        winningScore = 10;
        user_image.src = transparent;
        user_image.alt = '';
        computer_image.src = transparent;
        computer_image.alt = '';
        console.log(`Winning Score Reset to: ${winningScore}`);
    
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }
    // Reset Game but not clear scores(for end of game)
    function resetEndGame() {
        isGameActive = false;
        user_image.src = transparent;
        user_image.alt = '';
        computer_image.src = transparent;
        computer_image.alt = '';
        
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
      }
    
      //Pause Game
    function pauseGame(){
        isGameActive = false;
        if (intervalId !== null) {
            clearInterval(intervalId);
            intervalId = null;
        }
      }
     
    // Play Game Button Click
    play_button.addEventListener('click', () => {
        isGameActive = true;
        if (intervalId === null) {
            // Run the first round immediately, then set interval for subsequent rounds
            runRound();
            intervalId = setInterval(runRound, 3500);
        }
    });
    //Pause Game Button Click
    pause_button.addEventListener('click', pauseGame)
    
    // Reset Button Click
    reset_btn.addEventListener('click', reset);
 })
